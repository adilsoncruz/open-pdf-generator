import { app, ipcMain } from 'electron'
import { spawn } from 'child_process'
import {
  checkCLIStatus,
  installCLI,
  installCLIFromFile,
  getAppVersions,
} from '../services/cliManager'
import { CLI_DIR, CLI_JAR_PATH } from '../config/paths'
import { getMainWindow } from '../window/mainWindow'
import { createMenu, setAppLanguage } from '../window/menu'
import { ErrorCodes, type VersionInfo } from '../types'

export function registerCliIpc(): void {
  ipcMain.handle('cli:status', async () => {
    return await checkCLIStatus()
  })

  ipcMain.handle('cli:install', async () => {
    return await installCLI()
  })

  ipcMain.handle('cli:installFromFile', async () => {
    return await installCLIFromFile(getMainWindow())
  })

  ipcMain.handle('cli:getInstallPath', () => {
    return CLI_DIR
  })

  ipcMain.handle('app:getVersions', async (): Promise<VersionInfo> => {
    return await getAppVersions()
  })

  ipcMain.handle('app:getSystemLocale', () => {
    return app.getLocale() || 'en'
  })

  ipcMain.handle('app:setLanguage', (_, lang: string) => {
    setAppLanguage(lang)
    createMenu(getMainWindow, lang)
    return { success: true }
  })

  ipcMain.handle('template:validate', async (_, templatePath: string) => {
    console.log('🔍 [Validate] Validating template:', templatePath)

    try {
      let cliStatus = await checkCLIStatus()

      if (!cliStatus.javaInstalled) {
        return {
          valid: false,
          errorCode: ErrorCodes.JAVA_NOT_INSTALLED,
        }
      }

      if (!cliStatus.installed || cliStatus.needsUpdate) {
        const installResult = await installCLI()
        if (!installResult.success) {
          return {
            valid: false,
            errorCode: ErrorCodes.CLI_NOT_INSTALLED,
          }
        }
        cliStatus = await checkCLIStatus()
      }

      const javaPath = cliStatus.javaPath || 'java'

      return new Promise((resolve) => {
        const java = spawn(javaPath, [
          '-jar',
          CLI_JAR_PATH,
          'validate',
          templatePath,
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
          console.log('🔍 [Validate] CLI exited with code:', code)

          if (code === 0) {
            resolve({
              valid: true,
              message: stdout.trim(),
            })
          } else {
            const errorOutput = stderr || stdout
            resolve({
              valid: false,
              errorCode: 'INVALID_TEMPLATE',
              cliError: errorOutput.trim(),
            })
          }
        })

        java.on('error', (error) => {
          console.error('❌ [Validate] Java spawn error:', error)
          resolve({
            valid: false,
            errorCode: ErrorCodes.ERROR_EXECUTING_JAVA,
          })
        })
      })
    } catch (error) {
      console.error('❌ [Validate] Unexpected error:', error)
      return {
        valid: false,
        errorCode: ErrorCodes.UNKNOWN_ERROR,
      }
    }
  })
}
