import { app, ipcMain, shell } from 'electron'
import * as path from 'path'
import * as fs from 'fs/promises'
import * as os from 'os'
import { spawn } from 'child_process'
import { ensureCLIReady } from '../services/cliManager'
import { CLI_JAR_PATH } from '../config/paths'
import { ErrorCodes } from '../types'

export function registerPdfIpc(): void {
  ipcMain.handle('pdf:generatePreview', async (_, templateJson: string, dataJson: string) => {
    console.log('📄 [Preview] Starting PDF preview generation...')

    try {
      const cliReady = await ensureCLIReady()
      if (!cliReady.ok) return cliReady.error
      const cliStatus = cliReady.status

      console.log('📄 [Preview] CLI Status:', {
        installed: cliStatus.installed,
        javaInstalled: cliStatus.javaInstalled,
        version: cliStatus.version,
        javaVersion: cliStatus.javaVersion,
      })

      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdf-preview-'))
      const templateFile = path.join(tmpDir, 'template.json')
      const dataFile = path.join(tmpDir, 'data.json')
      const pdfFile = path.join(tmpDir, 'preview.pdf')

      await fs.writeFile(templateFile, templateJson)
      await fs.writeFile(dataFile, dataJson)

      const isNative = Boolean(cliStatus.isNative && cliStatus.nativePath)
      const command = isNative ? cliStatus.nativePath! : (cliStatus.javaPath || 'java')
      const args = isNative
        ? ['generate', templateFile, '-d', dataFile, '--output', pdfFile]
        : ['-jar', CLI_JAR_PATH, 'generate', templateFile, '-d', dataFile, '--output', pdfFile]

      console.log('📄 [Preview] Executing:', command, ...args)

      return new Promise((resolve) => {
        const proc = spawn(command, args)

        let stdout = ''
        let stderr = ''

        proc.stdout.on('data', (data) => {
          const text = data.toString()
          stdout += text
          console.log('[CLI STDOUT]', text.trim())
        })

        proc.stderr.on('data', (data) => {
          const text = data.toString()
          stderr += text
          console.error('[CLI STDERR]', text.trim())
        })

        proc.on('close', async (code) => {
          console.log('📄 [Preview] CLI exited with code:', code)

          await fs.unlink(templateFile).catch(() => {})
          await fs.unlink(dataFile).catch(() => {})

          if (code === 0) {
            try {
              const pdfBuffer = await fs.readFile(pdfFile)
              const base64 = pdfBuffer.toString('base64')
              console.log('✅ [Preview] PDF generated successfully, size:', pdfBuffer.length, 'bytes')

              await fs.unlink(pdfFile).catch(() => {})
              await fs.rmdir(tmpDir).catch(() => {})

              resolve({
                success: true,
                pdfBase64: base64,
              })
            } catch (readError) {
              console.error('❌ [Preview] Error reading PDF file:', readError)
              resolve({
                success: false,
                errorCode: ErrorCodes.ERROR_READING_PDF,
              })
            }
          } else {
            console.error('❌ [Preview] CLI failed with code:', code)
            console.error('❌ [Preview] STDOUT:', stdout)
            console.error('❌ [Preview] STDERR:', stderr)

            await fs.unlink(pdfFile).catch(() => {})
            await fs.rmdir(tmpDir).catch(() => {})

            resolve({
              success: false,
              errorCode: ErrorCodes.ERROR_GENERATING_PDF,
              code,
              cliError: stderr.trim() || stdout.trim(),
            })
          }
        })

        proc.on('error', async (error: Error) => {
          console.error('❌ [Preview] CLI spawn error:', error)
          await fs.unlink(templateFile).catch(() => {})
          await fs.unlink(dataFile).catch(() => {})
          await fs.unlink(pdfFile).catch(() => {})
          await fs.rmdir(tmpDir).catch(() => {})

          resolve({
            success: false,
            errorCode: ErrorCodes.ERROR_EXECUTING_JAVA,
          })
        })
      })
    } catch (error) {
      console.error('❌ [Preview] Unexpected error:', error)
      return {
        success: false,
        errorCode: ErrorCodes.UNKNOWN_ERROR,
      }
    }
  })

  ipcMain.handle('pdf:generate', async (_, templateJson: string, dataJson: string, outputPath?: string) => {
    try {
      const cliReady = await ensureCLIReady()
      if (!cliReady.ok) return cliReady.error
      const cliStatus = cliReady.status

      console.log('🔍 PDF Generation Debug Info:')
      console.log('  CLI Version:', cliStatus.version)
      console.log('  JAR Path:', CLI_JAR_PATH)
      console.log('  Java Version:', cliStatus.javaVersion)

      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdf-gen-'))
      const templateFile = path.join(tmpDir, 'template.json')
      const dataFile = path.join(tmpDir, 'data.json')
      const pdfFile = outputPath || path.join(tmpDir, 'output.pdf')

      await fs.writeFile(templateFile, templateJson)
      await fs.writeFile(dataFile, dataJson)

      const isNative = Boolean(cliStatus.isNative && cliStatus.nativePath)
      const command = isNative ? cliStatus.nativePath! : (cliStatus.javaPath || 'java')
      const args = isNative
        ? ['generate', templateFile, '-d', dataFile, '--output', pdfFile]
        : ['-jar', CLI_JAR_PATH, 'generate', templateFile, '-d', dataFile, '--output', pdfFile]

      console.log('  Executing:', command, ...args)

      return new Promise((resolve) => {
        const proc = spawn(command, args)

        let stdout = ''
        let stderr = ''

        proc.stdout.on('data', (data) => {
          const text = data.toString()
          stdout += text
          console.log('[CLI STDOUT]', text)
        })

        proc.stderr.on('data', (data) => {
          const text = data.toString()
          stderr += text
          console.error('[CLI STDERR]', text)
        })

        proc.on('close', async (code) => {
          await fs.unlink(templateFile).catch(() => {})
          await fs.unlink(dataFile).catch(() => {})

          if (code === 0) {
            resolve({
              success: true,
              outputPath: pdfFile,
              stdout,
            })
          } else {
            await fs.unlink(pdfFile).catch(() => {})
            resolve({
              success: false,
              errorCode: ErrorCodes.ERROR_GENERATING_PDF,
              code,
              cliError: stderr.trim() || stdout.trim(),
            })
          }
        })

        proc.on('error', async () => {
          await fs.unlink(templateFile).catch(() => {})
          await fs.unlink(dataFile).catch(() => {})
          await fs.unlink(pdfFile).catch(() => {})

          resolve({
            success: false,
            errorCode: ErrorCodes.ERROR_EXECUTING_JAVA,
          })
        })
      })
    } catch {
      return {
        success: false,
        errorCode: ErrorCodes.UNKNOWN_ERROR,
      }
    }
  })

  ipcMain.handle('pdf:open', async (_, pdfPath: string) => {
    try {
      await shell.openPath(pdfPath)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      }
    }
  })

  ipcMain.handle('pdf:openBase64', async (_, base64: string, openInViewer?: boolean) => {
    try {
      const tmpDir = path.join(app.getPath('temp'), 'opg-external-preview')
      await fs.mkdir(tmpDir, { recursive: true })
      const pdfFile = path.join(tmpDir, 'preview.pdf')
      await fs.writeFile(pdfFile, Buffer.from(base64, 'base64'))
      if (openInViewer !== false) {
        await shell.openPath(pdfFile)
      }
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  })
}
