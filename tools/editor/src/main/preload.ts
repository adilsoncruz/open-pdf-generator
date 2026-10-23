import { contextBridge, ipcRenderer } from 'electron'

// Expor APIs seguras para o renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Dialog APIs
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  openJasperFile: () => ipcRenderer.invoke('dialog:openJasperFile'),
  openPdfFile: () => ipcRenderer.invoke('dialog:openPdfFile'),
  openDataFile: () => ipcRenderer.invoke('dialog:openDataFile'),
  saveFile: (content: string, defaultPath?: string) =>
    ipcRenderer.invoke('dialog:saveFile', content, defaultPath),

  // File System APIs
  readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),
  writeFile: (filePath: string, content: string) =>
    ipcRenderer.invoke('fs:writeFile', filePath, content),

  // CLI Management APIs
  getCLIStatus: () => ipcRenderer.invoke('cli:status'),
  getAppVersions: () => ipcRenderer.invoke('app:getVersions'),
  installCLI: () => ipcRenderer.invoke('cli:install'),
  installCLIFromFile: () => ipcRenderer.invoke('cli:installFromFile'),
  getCLIInstallPath: () => ipcRenderer.invoke('cli:getInstallPath'),

  // PDF Generation API
  generatePDF: (templateJson: string, dataJson: string, outputPath?: string) =>
    ipcRenderer.invoke('pdf:generate', templateJson, dataJson, outputPath),
  generatePDFPreview: (templateJson: string, dataJson: string) =>
    ipcRenderer.invoke('pdf:generatePreview', templateJson, dataJson),
  openPDF: (pdfPath: string) => ipcRenderer.invoke('pdf:open', pdfPath),
  openBase64PDF: (base64: string, openInViewer?: boolean) => ipcRenderer.invoke('pdf:openBase64', base64, openInViewer),
  
  // Template Validation API
  validateTemplate: (templatePath: string) =>
    ipcRenderer.invoke('template:validate', templatePath),
  
  // Menu Events - remove listeners antigos antes de adicionar novos
  onMenuNew: (callback: () => void) => {
    ipcRenderer.removeAllListeners('menu:new')
    ipcRenderer.on('menu:new', callback)
  },
  onMenuOpen: (callback: () => void) => {
    ipcRenderer.removeAllListeners('menu:open')
    ipcRenderer.on('menu:open', callback)
  },
  onMenuSave: (callback: () => void) => {
    ipcRenderer.removeAllListeners('menu:save')
    ipcRenderer.on('menu:save', callback)
  },
  onMenuSaveAs: (callback: () => void) => {
    ipcRenderer.removeAllListeners('menu:save-as')
    ipcRenderer.on('menu:save-as', callback)
  },
  onMenuExport: (callback: () => void) => {
    ipcRenderer.removeAllListeners('menu:export')
    ipcRenderer.on('menu:export', callback)
  },
  onMenuUndo: (callback: () => void) => {
    ipcRenderer.removeAllListeners('menu:undo')
    ipcRenderer.on('menu:undo', callback)
  },
  onMenuRedo: (callback: () => void) => {
    ipcRenderer.removeAllListeners('menu:redo')
    ipcRenderer.on('menu:redo', callback)
  },
  onMenuCopy: (callback: () => void) => {
    ipcRenderer.removeAllListeners('menu:copy')
    ipcRenderer.on('menu:copy', callback)
  },
  onMenuPaste: (callback: () => void) => {
    ipcRenderer.removeAllListeners('menu:paste')
    ipcRenderer.on('menu:paste', callback)
  },
  onMenuDelete: (callback: () => void) => {
    ipcRenderer.removeAllListeners('menu:delete')
    ipcRenderer.on('menu:delete', callback)
  },
  onMenuSetLanguage: (callback: (lang: string) => void) => {
    ipcRenderer.removeAllListeners('menu:set-language')
    ipcRenderer.on('menu:set-language', (_, lang) => callback(lang))
  },

  // Language APIs
  setLanguage: (lang: string) => ipcRenderer.invoke('app:setLanguage', lang),
  getSystemLocale: () => ipcRenderer.invoke('app:getSystemLocale'),
  
  // Auto-Update APIs
  checkForUpdates: () => ipcRenderer.invoke('update:check'),
  downloadUpdate: () => ipcRenderer.invoke('update:download'),
  installUpdate: () => ipcRenderer.invoke('update:install'),
  getUpdateStatus: () => ipcRenderer.invoke('update:getStatus'),
  getCurrentVersion: () => ipcRenderer.invoke('update:getCurrentVersion'),
  onUpdateStatus: (callback: (status: UpdateStatus) => void) => {
    ipcRenderer.removeAllListeners('update:status')
    ipcRenderer.on('update:status', (_, status) => callback(status))
  },
})

// Type definitions for TypeScript
export interface CLIStatus {
  installed: boolean
  version: string | null
  jarPath: string
  needsUpdate: boolean
  javaInstalled: boolean
  javaVersion: string | null
}

export interface UpdateStatus {
  checking: boolean
  available: boolean
  downloaded: boolean
  downloading: boolean
  error: string | null
  progress: number
  version: string | null
  releaseNotes: string | null
  releaseDate: string | null
}

export interface ElectronAPI {
  openFile: () => Promise<{ path: string; content: string; convertedFromJasper?: boolean; isJrxml?: boolean } | null>
  openJasperFile: () => Promise<{ path: string; content: string; convertedFromJasper?: boolean; isJrxml?: boolean } | null>
  openPdfFile: () => Promise<{ path: string; base64: string; name: string } | null>
  openDataFile: () => Promise<{ path: string; content: string } | null>
  saveFile: (content: string, defaultPath?: string) => Promise<string | null>
  readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>
  writeFile: (
    filePath: string,
    content: string
  ) => Promise<{ success: boolean; error?: string }>
  
  // CLI Management
  getCLIStatus: () => Promise<CLIStatus>
  getAppVersions: () => Promise<{ editor: string; core: string | null; cli: string | null }>
  installCLI: () => Promise<{ success: boolean; error?: string; errorCode?: string }>
  installCLIFromFile: () => Promise<{ success: boolean; error?: string; errorCode?: string }>
  getCLIInstallPath: () => Promise<string>
  
  // PDF Generation
  generatePDF: (
    templateJson: string,
    dataJson: string,
    outputPath?: string
  ) => Promise<{ 
    success: boolean
    message?: string
    outputPath?: string
    error?: string
    errorCode?: string
    cliNotInstalled?: boolean
    javaNotInstalled?: boolean
  }>
  generatePDFPreview: (
    templateJson: string,
    dataJson: string
  ) => Promise<{
    success: boolean
    pdfBase64?: string
    error?: string
    errorCode?: string
    cliError?: string
    code?: number
    cliNotInstalled?: boolean
    javaNotInstalled?: boolean
  }>
  openPDF: (pdfPath: string) => Promise<{ success: boolean; error?: string }>
  openBase64PDF: (base64: string, openInViewer?: boolean) => Promise<{ success: boolean; error?: string }>
  
  // Template Validation
  validateTemplate: (templatePath: string) => Promise<{
    valid: boolean
    message?: string
    errorCode?: string
    cliError?: string
  }>
  
  // Menu Events
  onMenuNew: (callback: () => void) => void
  onMenuOpen: (callback: () => void) => void
  onMenuSave: (callback: () => void) => void
  onMenuSaveAs: (callback: () => void) => void
  onMenuExport: (callback: () => void) => void
  onMenuUndo: (callback: () => void) => void
  onMenuRedo: (callback: () => void) => void
  onMenuCopy: (callback: () => void) => void
  onMenuPaste: (callback: () => void) => void
  onMenuDelete: (callback: () => void) => void
  onMenuSetLanguage: (callback: (lang: string) => void) => void

  // Language APIs
  setLanguage: (lang: string) => Promise<{ success: boolean }>
  getSystemLocale: () => Promise<string>
  
  // Auto-Update
  checkForUpdates: () => Promise<{ success: boolean; updateAvailable?: boolean; version?: string; error?: string }>
  downloadUpdate: () => Promise<{ success: boolean; error?: string }>
  installUpdate: () => void
  getUpdateStatus: () => Promise<UpdateStatus>
  getCurrentVersion: () => Promise<string>
  onUpdateStatus: (callback: (status: UpdateStatus) => void) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
