import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs/promises'
import fsSync from 'fs'
import os from 'os'
import { spawn } from 'child_process'

function getJavaPath(): string {
  const javaHome = process.env.JAVA_HOME
  if (javaHome) {
    const p = path.join(javaHome, 'bin', 'java')
    if (fsSync.existsSync(p)) return p
  }
  const miseJava = '/Users/adilsoncruz/.local/share/mise/installs/java/21.0.2/bin/java'
  if (fsSync.existsSync(miseJava)) return miseJava
  return 'java'
}

function previewDevServerPlugin() {
  return {
    name: 'preview-dev-server-plugin',
    configureServer(server: any) {
      server.middlewares.use('/api/generate-preview', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }

        let body = ''
        req.on('data', (chunk: any) => { body += chunk })
        req.on('end', async () => {
          let tmpDir: string | null = null
          try {
            const { templateJson, dataJson } = JSON.parse(body)
            tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdf-preview-vite-'))
            const templateFile = path.join(tmpDir, 'template.json')
            const dataFile = path.join(tmpDir, 'data.json')
            const pdfFile = path.join(tmpDir, 'preview.pdf')

            await fs.writeFile(templateFile, templateJson || '{}')
            await fs.writeFile(dataFile, dataJson || '{}')

            const jarPath = path.join(os.homedir(), '.pdf-generator', 'pdf-generator.jar')
            const javaPath = getJavaPath()
            const java = spawn(javaPath, ['-jar', jarPath, 'generate', templateFile, '-d', dataFile, '--output', pdfFile])

            let stdout = ''
            let stderr = ''
            java.stdout.on('data', d => { stdout += d.toString() })
            java.stderr.on('data', d => { stderr += d.toString() })

            java.on('close', async (code) => {
              if (code === 0) {
                try {
                  const pdfBuffer = await fs.readFile(pdfFile)
                  const base64 = pdfBuffer.toString('base64')
                  if (tmpDir) await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {})

                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ success: true, pdfBase64: base64 }))
                  return
                } catch (readError) {
                  if (tmpDir) await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {})
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ success: false, errorCode: 'ERROR_READING_PDF' }))
                  return
                }
              }

              if (tmpDir) await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {})
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: false, errorCode: 'ERROR_GENERATING_PDF', cliError: stdout || stderr }))
            })

            java.on('error', async (err) => {
              if (tmpDir) await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {})
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: false, errorCode: 'ERROR_EXECUTING_JAVA', error: err.message }))
            })
          } catch (err: any) {
            if (tmpDir) await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {})
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: false, error: err?.message || 'Server error' }))
          }
        })
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), previewDevServerPlugin()],
  base: './',
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/renderer'),
    },
  },
  server: {
    port: 5173,
  },
})


