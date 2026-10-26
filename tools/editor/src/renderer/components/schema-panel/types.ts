import type { ErrorObject } from 'ajv'

export interface SchemaPanelProps {
  onClose: () => void
}

export interface ValidationResult {
  valid: boolean
  error: string | null
  errorLine: number | null
}

export type SchemaErrorObject = ErrorObject
