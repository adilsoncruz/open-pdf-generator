export interface CLIStatus {
  installed: boolean
  version: string | null
  jarPath: string
  needsUpdate: boolean
  javaInstalled: boolean
  javaVersion: string | null
  javaPath: string | null
}

export interface VersionInfo {
  editor: string
  core: string | null
  cli: string | null
}

export interface OpenFileResult {
  path: string
  content: string
  convertedFromJasper?: boolean
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

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]
