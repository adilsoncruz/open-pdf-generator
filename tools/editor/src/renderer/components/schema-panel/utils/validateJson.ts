import type { ValidationResult } from '../types'

export function validateJson(value: string): ValidationResult {
  if (!value.trim()) {
    return { valid: true, error: null, errorLine: null }
  }
  try {
    JSON.parse(value)
    return { valid: true, error: null, errorLine: null }
  } catch (e) {
    const errorMessage = (e as Error).message
    const lineMatch = errorMessage.match(/position (\d+)/)
    let errorLine: number | null = null
    if (lineMatch) {
      const position = parseInt(lineMatch[1], 10)
      const beforeError = value.substring(0, position)
      errorLine = (beforeError.match(/\n/g) || []).length + 1
    }
    return { valid: false, error: errorMessage, errorLine }
  }
}
