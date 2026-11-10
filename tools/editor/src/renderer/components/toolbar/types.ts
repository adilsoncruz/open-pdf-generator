import type { CLIStatus, AppVersions, VersionInfo } from '../../../shared/types'

export type { CLIStatus, AppVersions, VersionInfo }

export interface ToolbarProps {
  onToggleDataPanel: () => void
  onTogglePreview?: () => void
  previewMode?: 'hidden' | 'tab' | 'split'
}

export interface ToolbarRef {
  handleNew: () => void
  handleOpen: () => void
  handleImportJasper?: () => void
  handleSave: () => void
  handleSaveAs: () => void
  handleExport: () => void
  handleGeneratePDF: () => void
  openSettings: () => void
}
