/**
 * Built-in formatting and transformation functions for expressions.
 */

export function valueToString(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.join(', ')
  return String(value)
}

export function toNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return parseFloat(value) || 0
  return 0
}

// --- Text Transformations ---

export function toUpperCase(value: unknown): string {
  return valueToString(value).toUpperCase()
}

export function toLowerCase(value: unknown): string {
  return valueToString(value).toLowerCase()
}

export function capitalize(value: unknown): string {
  const str = valueToString(value)
  return str.split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ')
}

export function trim(value: unknown): string {
  return valueToString(value).trim()
}

export function truncate(value: unknown, maxLength: number = 50, suffixStr: string = '...'): string {
  const str = valueToString(value)
  if (str.length > maxLength) {
    return str.slice(0, maxLength - suffixStr.length) + suffixStr
  }
  return str
}

export function padLeft(value: unknown, length: number = 10, padChar: string = ' '): string {
  return valueToString(value).padStart(length, padChar)
}

export function padRight(value: unknown, length: number = 10, padChar: string = ' '): string {
  return valueToString(value).padEnd(length, padChar)
}

export function replace(value: unknown, oldStr: string, newStr: string): string {
  return valueToString(value).replace(new RegExp(oldStr, 'g'), newStr)
}

export function prefix(value: unknown, prefixStr: string = ''): string {
  return prefixStr + valueToString(value)
}

export function suffix(value: unknown, suffixStr: string = ''): string {
  return valueToString(value) + suffixStr
}

export function reverse(value: unknown): string {
  return valueToString(value).split('').reverse().join('')
}

export function concat(value: unknown, args: string[]): string {
  const separator = args[0] || ''
  const parts = [valueToString(value)]
  for (let i = 1; i < args.length; i++) {
    parts.push(args[i])
  }
  return parts.join(separator)
}

// --- Collection & Array Transformations ---

export function join(value: unknown, separator: string = ', '): string {
  if (Array.isArray(value)) {
    return value.filter(v => v !== null && v !== undefined).join(separator)
  }
  return valueToString(value)
}

export function first(value: unknown): unknown {
  if (Array.isArray(value)) return value[0]
  if (typeof value === 'string') return value.charAt(0)
  return value
}

export function last(value: unknown): unknown {
  if (Array.isArray(value)) return value[value.length - 1]
  if (typeof value === 'string') return value.charAt(value.length - 1)
  return value
}

export function length(value: unknown): number {
  if (Array.isArray(value)) return value.length
  if (typeof value === 'string') return value.length
  return valueToString(value).length
}

// --- Number Formatting & Math Transformations ---

export function formatNumber(value: unknown, pattern: string = '#,##0.00'): string {
  const num = toNumber(value)
  if (isNaN(num)) return valueToString(value)

  const hasThousands = pattern.includes(',')
  const decimalMatch = pattern.match(/\.(\d+|0+)$/)
  const decimals = decimalMatch ? decimalMatch[1].length : 0

  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: hasThousands
  })
}

export function formatCurrency(value: unknown, currencyCode: string = 'BRL'): string {
  const num = toNumber(value)
  if (isNaN(num)) return valueToString(value)

  const localeMap: Record<string, string> = {
    'BRL': 'pt-BR',
    'USD': 'en-US',
    'EUR': 'de-DE',
    'ARS': 'es-AR',
    'MXN': 'es-MX'
  }

  const locale = localeMap[currencyCode.toUpperCase()] || 'pt-BR'

  return num.toLocaleString(locale, {
    style: 'currency',
    currency: currencyCode.toUpperCase()
  })
}

export function numberFormat(value: unknown, locale: string = 'pt-BR'): string {
  const num = toNumber(value)
  if (isNaN(num)) return valueToString(value)

  const localeMap: Record<string, string> = {
    'pt-br': 'pt-BR',
    'pt_br': 'pt-BR',
    'en-us': 'en-US',
    'en_us': 'en-US',
    'es-ar': 'es-AR',
    'es_ar': 'es-AR',
    'es-mx': 'es-MX',
    'es_mx': 'es-MX'
  }

  const loc = localeMap[locale.toLowerCase()] || locale
  return num.toLocaleString(loc)
}

export function abs(value: unknown): number {
  return Math.abs(toNumber(value))
}

export function round(value: unknown, decimals: number = 0): number {
  const num = toNumber(value)
  const factor = Math.pow(10, decimals)
  return Math.round(num * factor) / factor
}

export function floor(value: unknown): number {
  return Math.floor(toNumber(value))
}

export function ceil(value: unknown): number {
  return Math.ceil(toNumber(value))
}

// --- Date Formatting ---

export function formatDate(value: unknown, pattern: string = 'dd/MM/yyyy'): string {
  let date: Date

  if (value instanceof Date) {
    date = value
  } else if (typeof value === 'number') {
    date = new Date(value)
  } else if (typeof value === 'string') {
    date = new Date(value)
    if (isNaN(date.getTime())) {
      return valueToString(value)
    }
  } else {
    return valueToString(value)
  }

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = String(date.getFullYear())
  const shortYear = year.slice(-2)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return pattern
    .replace('dd', day)
    .replace('MM', month)
    .replace('yyyy', year)
    .replace('yy', shortYear)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

// --- Fallback ---

export function defaultValue(value: unknown, defaultVal: string = ''): unknown {
  const str = valueToString(value)
  return str.trim() === '' ? defaultVal : value
}
