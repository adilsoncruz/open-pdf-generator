import { app, dialog, BrowserWindow } from 'electron'
import * as path from 'path'
import * as fs from 'fs/promises'
import * as os from 'os'
import * as https from 'https'
import * as http from 'http'
import { spawn } from 'child_process'
import { checkJavaInstalled } from './javaDetector'
import {
  PROJECT_ROOT_DIR,
  CLI_VERSION,
  CLI_DIR,
  CLI_JAR_PATH,
  CLI_VERSION_FILE,
  CLI_DOWNLOAD_URL,
} from '../config/paths'
import { CLIStatus, VersionInfo, ErrorCodes } from '../types'

export async function findLatestLocalCliJar(): Promise<string | null> {
  const cliBuildDir = path.join(PROJECT_ROOT_DIR, 'tools', 'cli', 'build', 'libs')

  try {
    const files = await fs.readdir(cliBuildDir)
    const jarCandidates = files
      .filter((file) => file.endsWith('.jar'))
      .filter((file) => !file.includes('sources') && !file.includes('javadoc'))
      .filter(
        (file) =>
          file.startsWith('pdf-generator-cli-') ||
          file.startsWith('open-pdf-generator-')
      )

    if (jarCandidates.length === 0) return null

    jarCandidates.sort((a, b) =>
      b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' })
    )

    return path.join(cliBuildDir, jarCandidates[0])
  } catch {
    return null
  }
}

export async function checkCLIStatus(): Promise<CLIStatus> {
  const javaCheck = await checkJavaInstalled()

  try {
    await fs.access(CLI_JAR_PATH)

    const isDev = !app.isPackaged || process.env.NODE_ENV === 'development'
    if (isDev) {
      const latestJar = await findLatestLocalCliJar()
      if (latestJar) {
        try {
          const installedStat = await fs.stat(CLI_JAR_PATH)
          const latestStat = await fs.stat(latestJar)
          if (latestStat.mtimeMs > installedStat.mtimeMs) {
            console.log(`🔄 Novo JAR local detectado (${latestJar}), atualizando ${CLI_JAR_PATH}...`)
            await fs.copyFile(latestJar, CLI_JAR_PATH)
          }
        } catch {
          // ignore stat/copy error in dev check
        }
      }
    }

    let installedVersion: string | null = null
    try {
      installedVersion = (await fs.readFile(CLI_VERSION_FILE, 'utf-8')).trim()
    } catch {
      installedVersion = 'unknown'
    }

    return {
      installed: true,
      version: installedVersion,
      jarPath: CLI_JAR_PATH,
      needsUpdate: installedVersion !== CLI_VERSION,
      javaInstalled: javaCheck.installed,
      javaVersion: javaCheck.version,
      javaPath: javaCheck.javaPath,
    }
  } catch {
    return {
      installed: false,
      version: null,
      jarPath: CLI_JAR_PATH,
      needsUpdate: false,
      javaInstalled: javaCheck.installed,
      javaVersion: javaCheck.version,
      javaPath: javaCheck.javaPath,
    }
  }
}

export async function downloadCLI(url: string): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    console.log(`📥 Baixando CLI de: ${url}`)

    const protocol = url.startsWith('https') ? https : http

    const request = protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location
        if (redirectUrl) {
          downloadCLI(redirectUrl).then(resolve)
          return
        }
      }

      if (response.statusCode !== 200) {
        resolve({
          success: false,
          error: `Erro ao baixar CLI: HTTP ${response.statusCode}`,
        })
        return
      }

      const chunks: Buffer[] = []
      response.on('data', (chunk) => chunks.push(chunk))
      response.on('end', async () => {
        try {
          const data = Buffer.concat(chunks)
          await fs.writeFile(CLI_JAR_PATH, data)
          await fs.writeFile(CLI_VERSION_FILE, CLI_VERSION)
          console.log(`✅ CLI baixado com sucesso: ${CLI_JAR_PATH}`)
          resolve({ success: true })
        } catch (error) {
          resolve({
            success: false,
            error: error instanceof Error ? error.message : 'Erro ao salvar arquivo',
          })
        }
      })
    })

    request.on('error', (error) => {
      resolve({
        success: false,
        error: `Erro de rede: ${error.message}`,
      })
    })

    request.setTimeout(30000, () => {
      request.destroy()
      resolve({ success: false, error: 'Timeout ao baixar CLI' })
    })
  })
}

export async function installCLI(
  source?: string
): Promise<{ success: boolean; error?: string; errorCode?: string }> {
  try {
    await fs.mkdir(CLI_DIR, { recursive: true })
    let selectedJarPath: string | null = source || null

    if (source) {
      await fs.copyFile(source, CLI_JAR_PATH)
    } else {
      const isDev = !app.isPackaged || process.env.NODE_ENV === 'development'
      let fallbackJar: string | null = null

      if (isDev) {
        const resourcesJar = path.join(__dirname, '..', '..', 'resources', 'pdf-generator.jar')
        fallbackJar = await findLatestLocalCliJar()

        if (!fallbackJar) {
          try {
            await fs.access(resourcesJar)
            fallbackJar = resourcesJar
          } catch {
            // No local jar found
          }
        }
      }

      if (fallbackJar) {
        console.log(`📦 Instalando CLI de: ${fallbackJar}`)
        await fs.copyFile(fallbackJar, CLI_JAR_PATH)
        selectedJarPath = fallbackJar
      } else {
        return await downloadCLI(CLI_DOWNLOAD_URL)
      }
    }

    const installedVersionFromJarPath = selectedJarPath?.match(
      /(?:pdf-generator-cli|open-pdf-generator)-(.+)\.jar$/
    )?.[1]
    await fs.writeFile(CLI_VERSION_FILE, installedVersionFromJarPath || CLI_VERSION)

    console.log(`✅ CLI instalado com sucesso em: ${CLI_JAR_PATH}`)
    return { success: true }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error(`❌ Erro ao instalar CLI: ${errorMsg}`)
    return { success: false, error: errorMsg }
  }
}

export async function ensureCLIReady(): Promise<
  | { ok: true; status: CLIStatus }
  | {
      ok: false
      error: {
        success: false
        errorCode: string
        cliNotInstalled?: boolean
        javaNotInstalled?: boolean
      }
    }
> {
  let cliStatus = await checkCLIStatus()

  if (!cliStatus.javaInstalled) {
    return {
      ok: false,
      error: {
        success: false,
        errorCode: ErrorCodes.JAVA_NOT_INSTALLED,
        javaNotInstalled: true,
      },
    }
  }

  if (!cliStatus.installed || cliStatus.needsUpdate) {
    const wasInstalledBeforeUpdate = cliStatus.installed
    const installResult = await installCLI()
    if (!installResult.success) {
      if (wasInstalledBeforeUpdate) {
        console.warn('⚠️ CLI update failed, continuing with currently installed CLI.')
        return { ok: true, status: cliStatus }
      }

      return {
        ok: false,
        error: {
          success: false,
          errorCode: ErrorCodes.CLI_NOT_INSTALLED,
          cliNotInstalled: true,
        },
      }
    }

    cliStatus = await checkCLIStatus()
  }

  if (!cliStatus.installed) {
    return {
      ok: false,
      error: {
        success: false,
        errorCode: ErrorCodes.CLI_NOT_INSTALLED,
        cliNotInstalled: true,
      },
    }
  }

  return { ok: true, status: cliStatus }
}

export async function installCLIFromFile(
  mainWindow: BrowserWindow | null
): Promise<{ success: boolean; error?: string; errorCode?: string }> {
  if (!mainWindow) {
    return { success: false, errorCode: ErrorCodes.MAIN_WINDOW_NOT_FOUND }
  }

  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select PDF Generator CLI JAR',
    properties: ['openFile'],
    filters: [{ name: 'JAR Files', extensions: ['jar'] }],
  })

  if (result.canceled || result.filePaths.length === 0) {
    return { success: false, errorCode: ErrorCodes.OPERATION_CANCELLED }
  }

  return await installCLI(result.filePaths[0])
}

export async function readGradleProjectVersion(gradleFilePath: string): Promise<string | null> {
  try {
    const content = await fs.readFile(gradleFilePath, 'utf-8')
    const match = content.match(/version\s*=\s*\"([^\"]+)\"/)
    return match?.[1] || null
  } catch {
    return null
  }
}

export async function readJarVersionFromBuildLibs(
  libsDir: string,
  prefixes: string[]
): Promise<string | null> {
  try {
    const files = await fs.readdir(libsDir)
    const candidates = files
      .map((file) => {
        const matchedPrefix = prefixes.find(
          (prefix) => file.startsWith(`${prefix}-`) && file.endsWith('.jar')
        )
        if (!matchedPrefix) return null

        const match = file.match(new RegExp(`^${matchedPrefix}-(.+)\\.jar$`))
        return match ? { file, version: match[1] } : null
      })
      .filter((item): item is { file: string; version: string } => item !== null)
      .filter((item) => !item.file.includes('sources') && !item.file.includes('javadoc'))

    if (candidates.length === 0) {
      return null
    }

    candidates.sort((a, b) =>
      b.version.localeCompare(a.version, undefined, { numeric: true, sensitivity: 'base' })
    )

    return candidates[0].version
  } catch {
    return null
  }
}

export async function getAppVersions(): Promise<VersionInfo> {
  const editorVersion = app.getVersion()
  const coreVersionFromJar = await readJarVersionFromBuildLibs(
    path.join(PROJECT_ROOT_DIR, 'core', 'build', 'libs'),
    ['open-pdf-generator']
  )
  const cliVersionFromJar = await readJarVersionFromBuildLibs(
    path.join(PROJECT_ROOT_DIR, 'tools', 'cli', 'build', 'libs'),
    ['pdf-generator-cli', 'open-pdf-generator']
  )

  const coreVersion =
    coreVersionFromJar ||
    (await readGradleProjectVersion(path.join(PROJECT_ROOT_DIR, 'core', 'build.gradle.kts')))
  const cliVersion =
    cliVersionFromJar ||
    (await readGradleProjectVersion(path.join(PROJECT_ROOT_DIR, 'tools', 'cli', 'build.gradle.kts')))

  return {
    editor: editorVersion,
    core: coreVersion,
    cli: cliVersion,
  }
}

export async function convertJrxmlToJson(
  filePath: string
): Promise<{ success: boolean; content?: string; error?: string; errorCode?: string }> {
  const cliStatus = await checkCLIStatus()

  if (!cliStatus.javaInstalled) {
    return { success: false, errorCode: ErrorCodes.JAVA_NOT_INSTALLED, error: 'Java not installed' }
  }

  if (!cliStatus.installed) {
    return { success: false, errorCode: ErrorCodes.CLI_NOT_INSTALLED, error: 'CLI not installed' }
  }

  const javaPath = cliStatus.javaPath || 'java'

  const runConvertCommand = (targetPath: string) =>
    new Promise<{ success: boolean; stdout: string; stderr: string; spawnError?: string }>(
      (resolve) => {
        const java = spawn(javaPath, [
          '-jar',
          CLI_JAR_PATH,
          'convert',
          targetPath,
          '--stdout',
        ])
        let stdout = ''
        let stderr = ''

        java.stdout.on('data', (data) => {
          stdout += data.toString()
        })

        java.stderr.on('data', (data) => {
          stderr += data.toString()
        })

        java.on('close', (code) => {
          resolve({ success: code === 0, stdout, stderr })
        })

        java.on('error', (error) => {
          console.log(`error: ${error.message}`)
          resolve({ success: false, stdout, stderr, spawnError: error.message })
        })
      }
    )

  console.log(`convert ${filePath}`)
  const stdoutResult = await runConvertCommand(filePath)
  if (stdoutResult.success) {
    return { success: true, content: stdoutResult.stdout }
  }

  let tmpDir: string | null = null
  try {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'jrxml-convert-'))
    const outputPath = path.join(tmpDir, `${path.basename(filePath, path.extname(filePath))}.json`)

    const fileResult = await runConvertCommand(filePath)
    if (!fileResult.success) {
      const fallbackError = (fileResult.spawnError || `${fileResult.stderr}\n${fileResult.stdout}`).trim()
      const stdoutError = (stdoutResult.spawnError || `${stdoutResult.stderr}\n${stdoutResult.stdout}`).trim()
      return {
        success: false,
        error: fallbackError || stdoutError,
        errorCode:
          fileResult.spawnError || stdoutResult.spawnError
            ? ErrorCodes.ERROR_EXECUTING_JAVA
            : ErrorCodes.UNKNOWN_ERROR,
      }
    }

    const content = await fs.readFile(outputPath, 'utf-8')
    return { success: true, content }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to convert JRXML template',
      errorCode: ErrorCodes.UNKNOWN_ERROR,
    }
  } finally {
    if (tmpDir) {
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => undefined)
    }
  }
}
