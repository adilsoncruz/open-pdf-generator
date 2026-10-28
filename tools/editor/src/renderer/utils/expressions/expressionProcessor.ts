import {
  valueToString,
  toUpperCase,
  toLowerCase,
  capitalize,
  trim,
  truncate,
  padLeft,
  padRight,
  replace,
  prefix,
  suffix,
  reverse,
  join,
  first,
  last,
  length,
  formatNumber,
  formatCurrency,
  numberFormat,
  abs,
  round,
  floor,
  ceil,
  formatDate,
  defaultValue,
  concat
} from './builtinFunctions'
import {
  resolvePath,
  parseTransformation,
  interpolateTokens
} from './evaluator'

/**
 * Checks if an expression contains transformations (pipes).
 */
export function hasTransformations(expression: string): boolean {
  return expression.includes('|')
}

/**
 * Extracts only the data binding path (without transformations).
 */
export function extractBinding(expression: string): string {
  return expression.split('|')[0]?.trim() || expression
}

/**
 * Resolves a simple data binding (without transformations).
 * Alias for resolvePath for backwards compatibility.
 */
export function resolveBinding(binding: string, data: Record<string, unknown>): unknown {
  return resolvePath(binding, data)
}

/**
 * Applies a template to an object, replacing ${property} with values.
 * Example: phone | template:'(${code}) ${number}' -> "(11) 99999"
 */
function applyTemplate(value: unknown, templateStr: string): string {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return valueToString(value)
  }
  return interpolateTokens(templateStr, value as Record<string, unknown>, applyTransformation)
}

/**
 * Applies a single transformation pipe to a value.
 */
export function applyTransformation(value: unknown, transformation: string): unknown {
  const { funcName, args } = parseTransformation(transformation)

  switch (funcName.toLowerCase()) {
    case 'uppercase':
    case 'upper':
      return toUpperCase(value)
    case 'lowercase':
    case 'lower':
      return toLowerCase(value)
    case 'capitalize':
    case 'cap':
      return capitalize(value)
    case 'format':
      return formatNumber(value, args[0] || '#,##0.00')
    case 'date':
      return formatDate(value, args[0] || 'dd/MM/yyyy')
    case 'join':
      return join(value, args[0] || ', ')
    case 'default':
      return defaultValue(value, args[0] || '')
    case 'truncate':
      return truncate(value, parseInt(args[0] || '50', 10), args[1] || '...')
    case 'currency':
      return formatCurrency(value, args[0] || 'BRL')
    case 'padleft':
    case 'lpad':
      return padLeft(value, parseInt(args[0] || '10', 10), args[1] || ' ')
    case 'padright':
    case 'rpad':
      return padRight(value, parseInt(args[0] || '10', 10), args[1] || ' ')
    case 'replace':
      return replace(value, args[0] || '', args[1] || '')
    case 'trim':
      return trim(value)
    case 'first':
      return first(value)
    case 'last':
      return last(value)
    case 'reverse':
      return reverse(value)
    case 'length':
    case 'len':
      return length(value)
    case 'abs':
      return abs(value)
    case 'round':
      return round(value, parseInt(args[0] || '0', 10))
    case 'floor':
      return floor(value)
    case 'ceil':
      return ceil(value)
    case 'prefix':
      return prefix(value, args[0] || '')
    case 'suffix':
      return suffix(value, args[0] || '')
    case 'numberformat':
    case 'numfmt':
      return numberFormat(value, args[0] || 'pt-BR')
    case 'template':
    case 'tpl':
      return applyTemplate(value, args[0] || '')
    case 'concat':
      return concat(value, args)
    default:
      return value
  }
}

/**
 * Processes a data binding expression with possible transformations.
 */
export function processExpression(expression: string, data: Record<string, unknown>): string {
  const parts = expression.split('|').map(p => p.trim())

  if (parts.length === 0) return ''

  const binding = parts[0]
  const rawValue = resolveBinding(binding, data)

  if (parts.length === 1) {
    return valueToString(rawValue)
  }

  let currentValue: unknown = rawValue
  for (let i = 1; i < parts.length; i++) {
    currentValue = applyTransformation(currentValue, parts[i])
  }

  return valueToString(currentValue)
}
