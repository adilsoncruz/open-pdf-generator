import { contextBridge, ipcRenderer } from 'electron'
import type { CLIStatus, UpdateStatus, ElectronAPI, VersionInfo, AppVersions } from '../shared/types'

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

  // Skill Management APIs
  installSkill: (target: string, customPath?: string) =>
    ipcRenderer.invoke('skill:install', target, customPath),
  getSkillContent: () =>
    ipcRenderer.invoke('skill:getContent'),
  
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
  onMenuCheckUpdates: (callback: () => void) => {
    ipcRenderer.removeAllListeners('menu:check-updates')
    ipcRenderer.on('menu:check-updates', callback)
  },
})

export type { CLIStatus, UpdateStatus, ElectronAPI, VersionInfo, AppVersions }

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
