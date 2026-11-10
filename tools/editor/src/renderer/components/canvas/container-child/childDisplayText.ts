import { processExpression, hasTransformations } from '../../../utils/expressionProcessor'

export function resolveChildDisplayText(
  el: { type?: string; value?: string; dataBinding?: string },
  testData: Record<string, unknown> | null | undefined,
  fallback: string = ''
): string {
  if (el.type === 'text') {
    if (el.dataBinding) {
      return resolveBindingChildText(el.dataBinding, testData, fallback)
    }
    if (el.value) return el.value
    return fallback
  }

  if (el.value) return el.value
  if (el.dataBinding) {
    return resolveBindingChildText(el.dataBinding, testData, fallback)
  }
  return fallback
}

function resolveBindingChildText(
  dataBinding: string | undefined,
  testData: Record<string, unknown> | null | undefined,
  fallback: string
): string {
  if (!dataBinding) return fallback
  if (testData && Object.keys(testData).length > 0) {
    if (hasTransformations(dataBinding)) {
      const result = processExpression(dataBinding, testData)
      if (result) return result
    } else {
      const parts = dataBinding.split('.')
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
  return `{${dataBinding}}`
}
