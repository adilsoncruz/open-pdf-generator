/**
 * Browser fallback mock when running in a pure browser environment without Electron.
 */

function promptFileInput(accept: string, isJrxml = false) {
  return new Promise<{ path: string; content: string; isJrxml?: boolean } | null>((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return resolve(null)
      try {
        const content = await file.text()
        resolve({ path: file.name, content, ...(isJrxml ? { isJrxml: true } : {}) })
      } catch {
        resolve(null)
      }
    }
    input.oncancel = () => resolve(null)
    input.click()
  })
}

function triggerDownload(content: string, fileName: string) {
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function triggerBinaryDownload(base64Data: string, fileName: string) {
  const byteCharacters = atob(base64Data)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const DEFAULT_API = 'https://open-pdf-generator.onrender.com'
const API_BASE =
  (import.meta.env.VITE_API_URL as string)?.replace(/\/$/, '') || (import.meta.env.DEV ? '' : DEFAULT_API)

async function requestPdfPreview(templateJson: string, dataJson: string) {
  try {
    const endpoint = `${API_BASE}/api/generate-preview`
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateJson, dataJson }),
    })
    return await response.json()
  } catch (err) {
    console.error('Failed to generate PDF via server:', err)
    return { success: false, errorCode: 'ERROR_GENERATING_PDF' }
  }
}

async function generatePdfInBrowser(templateJson: string, dataJson: string) {
  const result = await requestPdfPreview(templateJson, dataJson)
  if (result.success && result.pdfBase64) {
    triggerBinaryDownload(result.pdfBase64, 'document.pdf')
  }
  return result
}

export function initBrowserFallback(): void {
  if (typeof window === 'undefined' || window.electronAPI) return

  console.warn('⚠️ [Browser Fallback] window.electronAPI is NOT present, using mock fallback!')

  ;(window as unknown as { electronAPI: unknown }).electronAPI = {
    openFile: () => promptFileInput('.json,.jrxml'),
    openJasperFile: () => promptFileInput('.jrxml,.xml', true),
    openDataFile: () => promptFileInput('.json'),
    saveFile: async (content: string, defaultPath?: string) => {
      try {
        const fileName = defaultPath || 'template.json'
        if ('showSaveFilePicker' in window) {
          try {
            const handle = await (window as unknown as { showSaveFilePicker: (options: unknown) => Promise<FileSystemFileHandle> }).showSaveFilePicker({
              suggestedName: fileName,
              types: [{ description: 'JSON Template', accept: { 'application/json': ['.json'] } }],
            })
            const writable = await handle.createWritable()
            await writable.write(content)
            await writable.close()
            return handle.name || fileName
          } catch (err: unknown) {
            if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'AbortError') {
              return null
            }
          }
        }
        triggerDownload(content, fileName)
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
        triggerDownload(content, fileName)
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
    getAppVersions: async () => ({ editor: '1.0.0', core: '1.0.0', cli: '1.0.0' }),
    installCLI: async () => ({ success: false }),
    installCLIFromFile: async () => ({ success: false }),
    getCLIInstallPath: async () => '',
    generatePDF: (templateJson: string, dataJson: string) => generatePdfInBrowser(templateJson, dataJson),
    generatePDFPreview: (templateJson: string, dataJson: string) => requestPdfPreview(templateJson, dataJson),
    openPDF: async () => ({ success: false }),
    openBase64PDF: async (base64: string) => {
      try {
        const byteCharacters = atob(base64)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const blob = new Blob([new Uint8Array(byteNumbers)], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
        return { success: true }
      } catch (err) {
        return { success: false, error: (err as Error).message }
      }
    },
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
    onMenuSetLanguage: () => {},
    setLanguage: async () => ({ success: true }),
    getSystemLocale: async () => 'en',
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
    installSkill: async (target: string) => ({ success: true, path: `~/.gemini/antigravity-cli/skills/ai-pdf-template-importer/SKILL.md (${target})` }),
    getSkillContent: async () => ({ success: true, content: '# ai-pdf-template-importer skill' }),
  }
}
