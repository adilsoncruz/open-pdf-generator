import { BrowserWindow, dialog } from 'electron'
import * as fs from 'fs/promises'
import { checkJavaInstalled } from '../javaDetector'
import {
  CLI_DIR,
  CLI_JAR_PATH,
  CLI_VERSION_FILE,
  CLI_VERSION,
  resolveBundledNativeBinary,
} from '../../config/paths'
import { CLIStatus, VersionInfo, ErrorCodes } from '../../types'
import {
  isDevEnvironment,
  findLatestLocalCliJar as findLatestJar,
  resolveFallbackJarPath,
  syncLocalDevJarIfNewer,
  downloadCLI as downloadCliArtifact,
  getAppVersions as resolveAppVersions,
  readGradleProjectVersion,
  readJarVersionFromBuildLibs,
} from './cliBinaryResolver'
import { convertJrxmlWithCli } from './cliProcessExecutor'

export type EnsureCLIReadyResult =
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

export class CliManager {
  async checkCLIStatus(): Promise<CLIStatus> {
    const nativePath = resolveBundledNativeBinary()
    if (nativePath) {
      return {
        installed: true,
        version: CLI_VERSION,
        jarPath: CLI_JAR_PATH,
        nativePath,
        isNative: true,
        needsUpdate: false,
        javaInstalled: true,
        javaVersion: 'Native (No Java required)',
        javaPath: nativePath,
      }
    }

    const javaCheck = await checkJavaInstalled()
    const base = {
      jarPath: CLI_JAR_PATH,
      nativePath: null,
      isNative: false,
      javaInstalled: javaCheck.installed,
      javaVersion: javaCheck.version,
      javaPath: javaCheck.javaPath,
    }

    try {
      await fs.access(CLI_JAR_PATH)
      if (isDevEnvironment()) await syncLocalDevJarIfNewer()

      const version = await fs.readFile(CLI_VERSION_FILE, 'utf-8').then((v) => v.trim()).catch(() => 'unknown')
      return { ...base, installed: true, version, needsUpdate: version !== CLI_VERSION }
    } catch {
      return { ...base, installed: false, version: null, needsUpdate: false }
    }
  }

  async downloadCLI(url?: string): Promise<{ success: boolean; error?: string }> {
    return downloadCliArtifact(url)
  }

  async installCLI(
    source?: string
  ): Promise<{ success: boolean; error?: string; errorCode?: string }> {
    try {
      await fs.mkdir(CLI_DIR, { recursive: true })
      let selectedJarPath: string | null = source || null

      if (source) {
        await fs.copyFile(source, CLI_JAR_PATH)
      } else {
        const fallbackJar = await resolveFallbackJarPath()
        if (!fallbackJar) return await downloadCliArtifact()
        console.log(`📦 Instalando CLI de: ${fallbackJar}`)
        await fs.copyFile(fallbackJar, CLI_JAR_PATH)
        selectedJarPath = fallbackJar
      }

      const installedVersion = selectedJarPath?.match(
        /(?:pdf-generator-cli|open-pdf-generator)-(.+)\.jar$/
      )?.[1]
      await fs.writeFile(CLI_VERSION_FILE, installedVersion || CLI_VERSION)

      console.log(`✅ CLI instalado com sucesso em: ${CLI_JAR_PATH}`)
      return { success: true }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      console.error(`❌ Erro ao instalar CLI: ${errorMsg}`)
      return { success: false, error: errorMsg }
    }
  }

  async ensureCLIReady(): Promise<EnsureCLIReadyResult> {
    let cliStatus = await this.checkCLIStatus()

    if (cliStatus.isNative && cliStatus.nativePath) {
      return { ok: true, status: cliStatus }
    }

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
      const wasInstalled = cliStatus.installed
      const installResult = await this.installCLI()
      if (!installResult.success) {
        if (wasInstalled) {
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
      cliStatus = await this.checkCLIStatus()
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

  async installCLIFromFile(
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

    return await this.installCLI(result.filePaths[0])
  }

  async convertJrxmlToJson(
    filePath: string
  ): Promise<{ success: boolean; content?: string; error?: string; errorCode?: string }> {
    const cliStatus = await this.checkCLIStatus()

    if (!cliStatus.javaInstalled) {
      return { success: false, errorCode: ErrorCodes.JAVA_NOT_INSTALLED, error: 'Java not installed' }
    }

    if (!cliStatus.installed) {
      return { success: false, errorCode: ErrorCodes.CLI_NOT_INSTALLED, error: 'CLI not installed' }
    }

    return convertJrxmlWithCli(cliStatus.javaPath || 'java', CLI_JAR_PATH, filePath)
  }

  async getAppVersions(): Promise<VersionInfo> {
    return resolveAppVersions()
  }

  async findLatestLocalCliJar(): Promise<string | null> {
    return findLatestJar()
  }
}

export const cliManager = new CliManager()
export default cliManager

export const checkCLIStatus = () => cliManager.checkCLIStatus()
export const downloadCLI = (url?: string) => cliManager.downloadCLI(url)
export const installCLI = (source?: string) => cliManager.installCLI(source)
export const ensureCLIReady = () => cliManager.ensureCLIReady()
export const installCLIFromFile = (win: BrowserWindow | null) => cliManager.installCLIFromFile(win)
export const convertJrxmlToJson = (file: string) => cliManager.convertJrxmlToJson(file)
export const getAppVersions = () => cliManager.getAppVersions()
export const findLatestLocalCliJar = () => cliManager.findLatestLocalCliJar()
export { readGradleProjectVersion, readJarVersionFromBuildLibs }
