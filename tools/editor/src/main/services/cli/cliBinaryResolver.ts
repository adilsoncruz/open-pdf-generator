import { app } from 'electron'
import * as path from 'path'
import * as fs from 'fs/promises'
import * as https from 'https'
import * as http from 'http'
import {
  PROJECT_ROOT_DIR,
  CLI_VERSION,
  CLI_JAR_PATH,
  CLI_VERSION_FILE,
  CLI_DOWNLOAD_URL,
} from '../../config/paths'
import { VersionInfo } from '../../types'

export function isDevEnvironment(): boolean {
  return !app?.isPackaged || process.env.NODE_ENV === 'development'
}

export async function findLatestLocalCliJar(): Promise<string | null> {
  const cliBuildDir = path.join(PROJECT_ROOT_DIR, 'tools', 'cli', 'build', 'libs')

  try {
    const files = await fs.readdir(cliBuildDir)
    const jarCandidates = files
      .filter((file) => file.endsWith('.jar'))
      .filter((file) => !file.includes('sources') && !file.includes('javadoc') && !file.includes('plain'))
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

export async function syncLocalDevJarIfNewer(): Promise<void> {
  const latestJar = await findLatestLocalCliJar()
  if (!latestJar) return

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

export async function resolveFallbackJarPath(): Promise<string | null> {
  if (!isDevEnvironment()) {
    return null
  }

  const localJar = await findLatestLocalCliJar()
  if (localJar) {
    return localJar
  }

  const candidateResourcePaths = [
    path.join(PROJECT_ROOT_DIR, 'tools', 'editor', 'resources', 'pdf-generator.jar'),
    path.join(__dirname, '..', '..', '..', 'resources', 'pdf-generator.jar'),
    path.join(__dirname, '..', '..', 'resources', 'pdf-generator.jar'),
  ]

  for (const candidate of candidateResourcePaths) {
    try {
      await fs.access(candidate)
      return candidate
    } catch {
      // Continue checking next candidate
    }
  }

  return null
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

export async function downloadCLI(url: string = CLI_DOWNLOAD_URL): Promise<{ success: boolean; error?: string }> {
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
