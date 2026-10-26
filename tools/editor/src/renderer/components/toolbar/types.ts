export interface CLIStatus {
  installed: boolean
  version: string | null
  jarPath: string
  needsUpdate: boolean
  javaInstalled: boolean
  javaVersion: string | null
}

export interface AppVersions {
  editor: string
  core: string | null
  cli: string | null
}

export interface ToolbarProps {
  onToggleDataPanel: () => void
  onTogglePreview?: () => void
  previewMode?: 'hidden' | 'tab' | 'split'
}

export interface ToolbarRef {
  handleNew: () => void
  handleOpen: () => void
  handleSave: () => void
  handleSaveAs: () => void
  handleExport: () => void
  handleGeneratePDF: () => void
  openSettings: () => void
}
