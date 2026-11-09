export interface CLIStatus {
  installed: boolean
  version: string | null
  jarPath: string
  nativePath?: string | null
  isNative?: boolean
  needsUpdate: boolean
  javaInstalled: boolean
  javaVersion: string | null
  javaPath?: string | null
}

export interface VersionInfo {
  editor: string
  core: string | null
  cli: string | null
}

export type AppVersions = VersionInfo

export interface OpenFileResult {
  path: string
  content: string
  convertedFromJasper?: boolean
  isJrxml?: boolean
}

export interface OpenPdfFileResult {
  path: string
  base64: string
  name: string
}

export interface OpenDataFileResult {
  path: string
  content: string
}

export interface ReadFileResult {
  success: boolean
  content?: string
  error?: string
}

export interface WriteFileResult {
  success: boolean
  error?: string
}

export interface InstallCLIResult {
  success: boolean
  error?: string
  errorCode?: string
}

export interface GeneratePDFResult {
  success: boolean
  message?: string
  outputPath?: string
  stdout?: string
  error?: string
  errorCode?: string
  cliError?: string
  code?: number | null
  cliNotInstalled?: boolean
  javaNotInstalled?: boolean
}

export interface GeneratePDFPreviewResult {
  success: boolean
  pdfBase64?: string
  error?: string
  errorCode?: string
  cliError?: string
  code?: number | null
  cliNotInstalled?: boolean
  javaNotInstalled?: boolean
}

export interface ValidateTemplateResult {
  valid: boolean
  message?: string
  errorCode?: string
  cliError?: string
}

export interface InstallSkillResult {
  success: boolean
  path?: string
  error?: string
}

export interface GetSkillContentResult {
  success: boolean
  content?: string
  error?: string
}

export interface CheckForUpdatesResult {
  success: boolean
  updateAvailable?: boolean
  version?: string
  error?: string
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

export const ErrorCodes = {
  JAVA_NOT_INSTALLED: 'JAVA_NOT_INSTALLED',
  CLI_NOT_INSTALLED: 'CLI_NOT_INSTALLED',
  ERROR_READING_PDF: 'ERROR_READING_PDF',
  ERROR_GENERATING_PDF: 'ERROR_GENERATING_PDF',
  ERROR_EXECUTING_JAVA: 'ERROR_EXECUTING_JAVA',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  MAIN_WINDOW_NOT_FOUND: 'MAIN_WINDOW_NOT_FOUND',
  OPERATION_CANCELLED: 'OPERATION_CANCELLED',
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

export interface ElectronAPI {
  // Dialog APIs
  openFile: () => Promise<OpenFileResult | null>
  openJasperFile?: () => Promise<OpenFileResult | null>
  openPdfFile?: () => Promise<OpenPdfFileResult | null>
  openDataFile: () => Promise<OpenDataFileResult | null>
  saveFile: (content: string, defaultPath?: string) => Promise<string | null>

  // File System APIs
  readFile: (filePath: string) => Promise<ReadFileResult>
  writeFile: (filePath: string, content: string) => Promise<WriteFileResult>

  // CLI Management
  getCLIStatus: () => Promise<CLIStatus>
  getAppVersions: () => Promise<VersionInfo>
  installCLI: () => Promise<InstallCLIResult>
  installCLIFromFile: () => Promise<InstallCLIResult>
  getCLIInstallPath: () => Promise<string>

  // PDF Generation
  generatePDF: (
    templateJson: string,
    dataJson: string,
    outputPath?: string
  ) => Promise<GeneratePDFResult>
  generatePDFPreview: (
    templateJson: string,
    dataJson: string
  ) => Promise<GeneratePDFPreviewResult>
  openPDF: (pdfPath: string) => Promise<WriteFileResult>
  openBase64PDF: (base64: string, openInViewer?: boolean) => Promise<WriteFileResult>

  // Template Validation
  validateTemplate: (templatePath: string) => Promise<ValidateTemplateResult>

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
  onMenuCheckUpdates?: (callback: () => void) => void

  // Language APIs
  setLanguage: (lang: string) => Promise<{ success: boolean }>
  getSystemLocale: () => Promise<string>

  // Skill Management
  installSkill?: (target: string, customPath?: string) => Promise<InstallSkillResult>
  getSkillContent?: () => Promise<GetSkillContentResult>

  // Auto-Update
  checkForUpdates: () => Promise<CheckForUpdatesResult>
  downloadUpdate: () => Promise<WriteFileResult>
  installUpdate: () => void
  getUpdateStatus: () => Promise<UpdateStatus>
  getCurrentVersion: () => Promise<string>
  onUpdateStatus: (callback: (status: UpdateStatus) => void) => void
}
