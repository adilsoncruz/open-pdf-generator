import React from 'react'
import ReactDOM from 'react-dom/client'
import { useEffect, useState } from 'react'
import { EditorPage, HomePage, LoadingPage } from './components/pages'
import { AiImportModal } from './components/AiImportModal'
import { convertJrxmlToTemplate } from './utils/jrxmlImporter'
import { useTabStore } from './store/tabStore'
import { useUIStore } from './store/uiStore'
import { useRecentFilesStore } from './store/recentFilesStore'
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

// Escuta eventos de troca de idioma disparados pelo menu nativo do Electron
if (typeof window !== 'undefined' && window.electronAPI?.onMenuSetLanguage) {
  import('./i18n').then(({ useI18nStore, AVAILABLE_LANGUAGES }) => {
    window.electronAPI.onMenuSetLanguage((lang) => {
      if (lang in AVAILABLE_LANGUAGES) {
        useI18nStore.getState().setLanguage(lang as any)
      }
    })
  })
}

function App() {
  const [screen, setScreen] = useState<'loading' | 'home' | 'editor'>('loading')
  const [showAiModal, setShowAiModal] = useState(false)
  const theme = useUIStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    const timer = window.setTimeout(() => setScreen('home'), 2200)
    return () => window.clearTimeout(timer)
  }, [])

  const openTemplateFromContent = (filePath: string, content: string) => {
    try {
      let loadedTemplate: any
      const isJrxml =
        filePath.toLowerCase().endsWith('.jrxml') ||
        content.trim().startsWith('<?xml') ||
        content.includes('<jasperReport')

      if (isJrxml && !content.trim().startsWith('{')) {
        loadedTemplate = convertJrxmlToTemplate(content)
      } else {
        loadedTemplate = JSON.parse(content)
      }

      const fileName = filePath.split(/[/\\]/).pop() || 'Opened Template'
      if (!isJrxml) {
        useRecentFilesStore.getState().addRecentFile(filePath, fileName)
      }

      useTabStore.getState().addTab({
        name: isJrxml ? fileName.replace(/\.jrxml$/i, '.json') : fileName,
        path: isJrxml ? null : filePath,
        isDirty: isJrxml,
        stateSnapshot: {
          template: loadedTemplate,
          currentFilePath: isJrxml ? null : filePath,
          isDirty: isJrxml,
          history: [loadedTemplate],
          historyIndex: 0,
          selectedElementIds: [],
          selectedElementLocation: 'body',
          selectedGroupId: null,
          currentSection: 'body',
        },
      })
      setScreen('editor')
    } catch {
      window.alert('Não foi possível abrir este template. Verifique se o arquivo é um JSON ou JRXML válido.')
    }
  }

  const handleImportJasper = async () => {
    try {
      const result = window.electronAPI.openJasperFile
        ? await window.electronAPI.openJasperFile()
        : await window.electronAPI.openFile()
      if (!result) return

      let loadedTemplate: any
      if (result.content.trim().startsWith('{')) {
        loadedTemplate = JSON.parse(result.content)
      } else {
        loadedTemplate = convertJrxmlToTemplate(result.content)
      }

      const tabTitle = (result.path.split(/[/\\]/).pop() || 'jasper-template.jrxml').replace(/\.jrxml$/i, '.json')
      useTabStore.getState().addTab({
        name: tabTitle,
        path: null,
        isDirty: true,
        stateSnapshot: {
          template: loadedTemplate,
          currentFilePath: null,
          isDirty: true,
          history: [loadedTemplate],
          historyIndex: 0,
          selectedElementIds: [],
          selectedElementLocation: 'body',
          selectedGroupId: null,
          currentSection: 'body',
        },
      })
      setScreen('editor')
    } catch (err: unknown) {
      window.alert(`Falha ao converter JRXML: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  if (screen === 'loading') return <LoadingPage />
  if (screen === 'home') {
    return (
      <>
        <HomePage
          onNewTemplate={() => {
            useTabStore.getState().createNewTemplateTab()
            setScreen('editor')
          }}
          onOpenFile={async () => {
            const result = await window.electronAPI.openFile()
            if (!result) return
            openTemplateFromContent(result.path, result.content)
          }}
          onImportJasper={handleImportJasper}
          onImportAI={() => setShowAiModal(true)}
          onOpenRecentFile={async (filePath: string) => {
            const result = await window.electronAPI.readFile(filePath)
            if (result.success && result.content) {
              openTemplateFromContent(filePath, result.content)
            } else {
              window.alert('Não foi possível abrir o arquivo recente. Ele pode ter sido movido ou excluído.')
              useRecentFilesStore.getState().removeRecentFile(filePath)
            }
          }}
        />
        <AiImportModal
          isOpen={showAiModal}
          onClose={() => setShowAiModal(false)}
          onSuccess={() => setScreen('editor')}
        />
      </>
    )
  }
  return <EditorPage />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

