import React from 'react'
import ReactDOM from 'react-dom/client'
import { EditorPage } from './components/pages'
import './index.css'

// Fallback para desenvolvimento no browser sem Electron
if (typeof window !== 'undefined' && !window.electronAPI) {
  (window as unknown as { electronAPI: unknown }).electronAPI = {
    openFile: async () => null,
    openDataFile: async () => null,
    saveFile: async () => null,
    readFile: async () => ({ success: false }),
    writeFile: async () => ({ success: false }),
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
    generatePDF: async () => ({ success: false }),
    generatePDFPreview: async () => ({ success: false }),
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

