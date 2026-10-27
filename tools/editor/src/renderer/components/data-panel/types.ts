export interface DataPanelProps {
  onClose: () => void
}

export interface ValidationResult {
  valid: boolean
  error: string | null
  errorLine: number | null
}
