export type ModalTab = 'skill' | 'direct'
export type TargetAgent = 'antigravity' | 'cursor' | 'claude' | 'custom'
export type AiProvider = 'gemini' | 'openai' | 'ollama'

export interface PdfFileInfo {
  path: string
  name: string
  base64: string
}

export interface InstallStatus {
  target: string
  path?: string
  error?: string
}

export interface AiImportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}
