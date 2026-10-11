import React from 'react'
import ReactDOM from 'react-dom/client'
import { EditorPage } from './components/pages'
import './index.css'

// Fallback para desenvolvimento no browser sem Electron
if (typeof window !== 'undefined' && !window.electronAPI) {
  console.warn('⚠️ [Browser Fallback] window.electronAPI is NOT present, using mock fallback!');
  (window as unknown as { electronAPI: unknown }).electronAPI = {
    openFile: async () => {
      return new Promise((resolve) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json,.jrxml'
        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0]
          if (!file) {
            resolve(null)
            return
          }
          try {
            const content = await file.text()
            resolve({
              path: file.name,
              content,
            })
          } catch {
            resolve(null)
          }
        }
        input.oncancel = () => resolve(null)
        input.click()
      })
    },
    openDataFile: async () => {
      return new Promise((resolve) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json'
        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0]
          if (!file) {
            resolve(null)
            return
          }
          try {
            const content = await file.text()
            resolve({
              path: file.name,
              content,
            })
          } catch {
            resolve(null)
          }
        }
        input.oncancel = () => resolve(null)
        input.click()
      })
    },
    saveFile: async (content: string, defaultPath?: string) => {
      try {
        const fileName = defaultPath || 'template.json'
        if ('showSaveFilePicker' in window) {
          try {
            const handle = await (window as unknown as { showSaveFilePicker: (options: unknown) => Promise<FileSystemFileHandle> }).showSaveFilePicker({
              suggestedName: fileName,
              types: [{
                description: 'JSON Template',
                accept: { 'application/json': ['.json'] },
              }],
            })
            const writable = await handle.createWritable()
            await writable.write(content)
            await writable.close()
            return handle.name || fileName
          } catch (pickerErr: unknown) {
            if (pickerErr && typeof pickerErr === 'object' && 'name' in pickerErr && (pickerErr as { name: string }).name === 'AbortError') {
              return null
            }
          }
        }
        const blob = new Blob([content], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        return fileName
      } catch (err) {
        console.error('Error in browser saveFile:', err)
        return null
      }
    },
    readFile: async () => ({ success: false }),
    writeFile: async (filePath: string, content: string) => {
      try {
        const fileName = filePath.split('/').pop() || filePath || 'template.json'
        const blob = new Blob([content], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        return { success: true }
      } catch (err) {
        return { success: false, error: (err as Error).message }
      }
    },
    getCLIStatus: async () => ({
      installed: true,
      version: '1.0.0',
      jarPath: '',
      needsUpdate: false,
      javaInstalled: true,
      javaVersion: '17',
    }),
    getAppVersions: async () => ({
      editor: '1.0.0',
      core: '1.0.0',
      cli: '1.0.0',
    }),
    installCLI: async () => ({ success: false }),
    installCLIFromFile: async () => ({ success: false }),
    getCLIInstallPath: async () => '',
    generatePDF: async (templateJson: string, dataJson: string) => {
      try {
        const response = await fetch('/api/generate-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ templateJson, dataJson }),
        })
        return await response.json()
      } catch (err) {
        console.error('Failed to generate PDF via dev server:', err)
        return { success: false, errorCode: 'ERROR_GENERATING_PDF' }
      }
    },
    generatePDFPreview: async (templateJson: string, dataJson: string) => {
      try {
        const response = await fetch('/api/generate-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ templateJson, dataJson }),
        })
        return await response.json()
      } catch (err) {
        console.error('Failed to generate preview via dev server:', err)
        return { success: false, errorCode: 'ERROR_GENERATING_PDF' }
      }
    },
    openPDF: async () => ({ success: false }),
    openBase64PDF: async () => ({ success: false }),
    validateTemplate: async () => ({ valid: true }),
    onMenuNew: () => {},
    onMenuOpen: () => {},
    onMenuSave: () => {},
    onMenuSaveAs: () => {},
    onMenuExport: () => {},
    onMenuUndo: () => {},
    onMenuRedo: () => {},
    onMenuCopy: () => {},
    onMenuPaste: () => {},
    onMenuDelete: () => {},
    checkForUpdates: async () => ({ success: false }),
    downloadUpdate: async () => ({ success: false }),
    installUpdate: () => {},
    getUpdateStatus: async () => ({
      checking: false,
      available: false,
      downloaded: false,
      downloading: false,
      error: null,
      progress: 0,
      version: null,
      releaseNotes: null,
      releaseDate: null,
    }),
    getCurrentVersion: async () => '1.0.0',
    onUpdateStatus: () => {},
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <EditorPage />
  </React.StrictMode>,
)

