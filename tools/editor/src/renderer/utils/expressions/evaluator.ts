import { valueToString } from './builtinFunctions'

/**
 * Resolves a property path in an object (supports dot notation and array indexing).
 * Example: 'user.address.street', 'items.0.name', 'items.length'
 */
export function resolvePath(path: string, obj: unknown): unknown {
  if (obj === null || obj === undefined) return null

  const parts = path.split('.')
  let current: unknown = obj

  for (const part of parts) {
    if (current === null || current === undefined) return null

    if (typeof current === 'object' && current !== null) {
      if (Array.isArray(current)) {
        if (part === 'length' || part === 'size') {
          return current.length
        }
        const index = parseInt(part, 10)
        if (!isNaN(index) && index >= 0 && index < current.length) {
          current = current[index]
          continue
        }
        return null
      }
      current = (current as Record<string, unknown>)[part]
    } else {
      return null
    }
  }

  return current
}

/**
 * Parses a transformation string to extract function name and arguments.
 * Example: "format:'#,##0.00'" -> { funcName: 'format', args: ['#,##0.00'] }
 */
export function parseTransformation(transformation: string): { funcName: string; args: string[] } {
  const colonIndex = transformation.indexOf(':')

  if (colonIndex === -1) {
    return { funcName: transformation.trim(), args: [] }
  }

  const funcName = transformation.substring(0, colonIndex).trim()
  const argsStr = transformation.substring(colonIndex + 1)

  const args: string[] = []
  const regex = /'([^']*)'|"([^"]*)"|([^:]+)/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(argsStr)) !== null) {
    if (match[1] !== undefined) {
      args.push(match[1])
    } else if (match[2] !== undefined) {
      args.push(match[2])
    } else if (match[3] !== undefined && match[3].trim()) {
      args.push(match[3].trim())
    }
  }

  return { funcName, args }
}

/**
 * Interpolates tokens like ${property} or ${property | filter} within a string template.
 */
export function interpolateTokens(
  templateStr: string,
  data: Record<string, unknown>,
  transformFn?: (value: unknown, transform: string) => unknown
): string {
  if (typeof templateStr !== 'string') return valueToString(templateStr)

  return templateStr.replace(/\$\{([^}]+)\}/g, (_, propPath: string) => {
    const trimmedPath = propPath.trim()

    if (trimmedPath.includes('|') && transformFn) {
      const parts = trimmedPath.split('|').map(p => p.trim())
      const propName = parts[0]
      let propValue: unknown = resolvePath(propName, data)

      for (let i = 1; i < parts.length; i++) {
        propValue = transformFn(propValue, parts[i])
      }
      return valueToString(propValue)
    }

    return valueToString(resolvePath(trimmedPath, data))
  })
}

/**
 * Evaluates a boolean condition against a data context.
 * Supports: ==, !=, >=, <=, >, <, in, &&, ||
 */
export function evaluateCondition(condition?: string | null, data: Record<string, unknown> = {}): boolean {
  if (!condition || condition.trim() === '') {
    return true
  }

  try {
    return evaluateCompoundExpression(condition.trim(), data)
  } catch {
    return true
  }
}

function evaluateCompoundExpression(expression: string, data: Record<string, unknown>): boolean {
  if (expression.includes('||')) {
    const parts = expression.split('||')
    return parts.some(part => evaluateCompoundExpression(part.trim(), data))
  }

  if (expression.includes('&&')) {
    const parts = expression.split('&&')
    return parts.every(part => evaluateCompoundExpression(part.trim(), data))
  }

  return evaluateSingleCondition(expression, data)
}

function evaluateSingleCondition(expression: string, data: Record<string, unknown>): boolean {
  const trimmed = expression.replace(/^\((.*)\)$/, '$1').trim()

  if (/\s+in\s+/i.test(trimmed)) {
    const parts = trimmed.split(/\s+in\s+/i)
    if (parts.length === 2) {
      const leftVal = resolveValue(parts[0].trim(), data)
      const list = parseListLiteral(parts[1].trim(), data)
      return list.some(item => String(item) === String(leftVal))
    }
  }

  const operators = ['==', '!=', '>=', '<=', '>', '<']
  for (const op of operators) {
    const idx = trimmed.indexOf(op)
    if (idx !== -1) {
      const leftStr = trimmed.substring(0, idx).trim()
      const rightStr = trimmed.substring(idx + op.length).trim()
      const leftVal = resolveValue(leftStr, data)
      const rightVal = resolveValue(rightStr, data)
      return compareValues(leftVal, rightVal, op)
    }
  }

  const val = resolveValue(trimmed, data)
  if (typeof val === 'boolean') return val
  if (typeof val === 'string') return val.toLowerCase() === 'true'
  if (typeof val === 'number') return val !== 0
  return val !== null && val !== undefined
}

function resolveValue(valStr: string, data: Record<string, unknown>): unknown {
  const trimmed = valStr.trim()

  if ((trimmed.startsWith("'") && trimmed.endsWith("'")) ||
      (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
    return trimmed.substring(1, trimmed.length - 1)
  }

  if (trimmed.toLowerCase() === 'true') return true
  if (trimmed.toLowerCase() === 'false') return false
  if (trimmed.toLowerCase() === 'null') return null

  const num = Number(trimmed)
  if (!isNaN(num) && trimmed !== '') return num

  return resolvePath(trimmed, data)
}

function parseListLiteral(listStr: string, data: Record<string, unknown>): unknown[] {
  const trimmed = listStr.trim()
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const inner = trimmed.substring(1, trimmed.length - 1).trim()
    if (!inner) return []
    return inner.split(',').map(item => resolveValue(item.trim(), data))
  }
  const resolved = resolveValue(trimmed, data)
  return Array.isArray(resolved) ? resolved : []
}

function compareValues(left: unknown, right: unknown, operator: string): boolean {
  if (operator === '==' || operator === '!=') {
    const isEqual = String(left ?? '') === String(right ?? '')
    return operator === '==' ? isEqual : !isEqual
  }

  const numLeft = Number(left)
  const numRight = Number(right)
  if (!isNaN(numLeft) && !isNaN(numRight)) {
    if (operator === '>') return numLeft > numRight
    if (operator === '<') return numLeft < numRight
    if (operator === '>=') return numLeft >= numRight
    if (operator === '<=') return numLeft <= numRight
  }

  const strLeft = String(left ?? '')
  const strRight = String(right ?? '')
  if (operator === '>') return strLeft > strRight
  if (operator === '<') return strLeft < strRight
  if (operator === '>=') return strLeft >= strRight
  if (operator === '<=') return strLeft <= strRight

  return false
}
