/// <reference types="vite/client" />
// Global type declarations for the renderer process
import type {
  CLIStatus,
  UpdateStatus,
  ElectronAPI,
  VersionInfo,
  AppVersions,
} from '../shared/types'

declare module '*.png' {
  const source: string
  export default source
}

export type { CLIStatus, UpdateStatus, ElectronAPI, VersionInfo, AppVersions }

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
