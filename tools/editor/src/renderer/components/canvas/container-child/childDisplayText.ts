import { processExpression, hasTransformations } from '../../../utils/expressionProcessor'

export function resolveChildDisplayText(
  el: { value?: string; dataBinding?: string },
  testData: Record<string, unknown> | null | undefined,
  fallback: string = ''
): string {
  if (el.value) return el.value
  if (el.dataBinding) {
    if (testData && Object.keys(testData).length > 0) {
      if (hasTransformations(el.dataBinding)) {
        const result = processExpression(el.dataBinding, testData)
        if (result) return result
      } else {
        const parts = el.dataBinding.split('.')
        let value: unknown = testData
        for (const part of parts) {
          if (value && typeof value === 'object' && part in value) {
            value = (value as Record<string, unknown>)[part]
          } else {
            value = null
            break
          }
        }
        if (value !== null && value !== undefined) {
          return String(value)
        }
      }
    }
    return `{${el.dataBinding}}`
  }
  return fallback
}
