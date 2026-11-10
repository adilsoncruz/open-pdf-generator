import { useTemplateStore } from '../../../store/templateStore'
import { processExpression, hasTransformations } from '../../../utils/expressionProcessor'

export function resolveBindingWithLoopData(
  fieldName: string,
  loopId: string,
  testData: unknown
): string {
  if (!testData || typeof testData !== 'object') {
    return `{${fieldName}}`
  }

  if (fieldName in (testData as Record<string, unknown>)) {
    const directVal = (testData as Record<string, unknown>)[fieldName]
    if (directVal !== null && directVal !== undefined) return String(directVal)
  }

  const { template } = useTemplateStore.getState()
  const loopElement = template?.page
    ? template.page
        .concat(template.pageSettings?.header?.elements || [])
        .concat(template.pageSettings?.footer?.elements || [])
        .find((el) => el.id === loopId)
    : undefined

  if (loopElement && loopElement.dataBinding) {
    const loopBinding = loopElement.dataBinding
    const parts = loopBinding.split('.')
    let arrayData: unknown = testData

    for (const part of parts) {
      if (arrayData && typeof arrayData === 'object' && part in (arrayData as Record<string, unknown>)) {
        arrayData = (arrayData as Record<string, unknown>)[part]
      } else {
        arrayData = null
        break
      }
    }

    if (Array.isArray(arrayData) && arrayData.length > 0) {
      const firstItem = arrayData[0]

      if (hasTransformations(fieldName)) {
        const result = processExpression(fieldName, firstItem as Record<string, unknown>)
        if (result) return result
      }

      if (firstItem && typeof firstItem === 'object' && fieldName in firstItem) {
        const directValue = (firstItem as Record<string, unknown>)[fieldName]
        if (directValue !== null && directValue !== undefined) {
          return String(directValue)
        }
      }

      const fieldParts = fieldName.split('.')
      let value: unknown = firstItem
      for (const part of fieldParts) {
        const trimmedPart = part.trim()
        if (value && typeof value === 'object' && trimmedPart in (value as Record<string, unknown>)) {
          value = (value as Record<string, unknown>)[trimmedPart]
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

  return `{${fieldName}}`
}

export function resolveChildDisplayText(
  el: { type?: string; value?: string; dataBinding?: string },
  loopId: string,
  testData: unknown,
  fallback: string = ''
): string {
  if (el.type === 'text') {
    if (el.dataBinding) {
      if (testData && typeof testData === 'object' && Object.keys(testData).length > 0) {
        return resolveBindingWithLoopData(el.dataBinding, loopId, testData)
      }
      return `{${el.dataBinding}}`
    }
    if (el.value) return el.value
    return fallback
  }

  if (el.value) return el.value
  if (el.dataBinding) {
    if (testData && typeof testData === 'object' && Object.keys(testData).length > 0) {
      return resolveBindingWithLoopData(el.dataBinding, loopId, testData)
    }
    return `{${el.dataBinding}}`
  }
  return fallback
}
