// Global type declarations for the renderer process

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
  // Dialog APIs
  openFile: () => Promise<{ path: string; content: string; convertedFromJasper?: boolean } | null>
  openDataFile: () => Promise<{ path: string; content: string } | null>
  saveFile: (content: string, defaultPath?: string) => Promise<string | null>
  
  // File System APIs
  readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>
  writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>
  
  // CLI Management
  getCLIStatus: () => Promise<CLIStatus>
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


