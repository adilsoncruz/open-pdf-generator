/**
 * Expression processor for Data Binding in the frontend.
 * 
 * Supports transformations using pipe syntax:
 * - value | upperCase
 * - value | lowerCase
 * - value | capitalize
 * - value | format:'#,##0.00'
 * - value | date:'dd/MM/yyyy'
 * - value | join:', '
 * - value | default:'Default value'
 * - value | truncate:50
 * - value | currency:'BRL'
 * - value | padLeft:10:'0'
 * - value | padRight:10:' '
 * - value | replace:'old':'new'
 * - value | trim
 * - value | first
 * - value | last
 * - value | reverse
 * - value | length
 */

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

/**
 * Resolves a simple data binding (without transformations).
 */
function resolveBinding(binding: string, data: Record<string, unknown>): unknown {
  const parts = binding.split('.')
  let current: unknown = data
  
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
      }
      current = (current as Record<string, unknown>)[part]
    } else {
      return null
    }
  }
  
  return current
}

/**
 * Applies a transformation to a value.
 */
function applyTransformation(value: unknown, transformation: string): unknown {
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
      return Math.floor(toNumber(value))
    case 'ceil':
      return Math.ceil(toNumber(value))
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
 * Parses a transformation to extract function name and arguments.
 */
function parseTransformation(transformation: string): { funcName: string; args: string[] } {
  const colonIndex = transformation.indexOf(':')
  
  if (colonIndex === -1) {
    return { funcName: transformation.trim(), args: [] }
  }
  
  const funcName = transformation.substring(0, colonIndex).trim()
  const argsStr = transformation.substring(colonIndex + 1)
  
  // Parse argumentos (podem estar entre aspas simples ou duplas)
  const args: string[] = []
  const regex = /'([^']*)'|"([^"]*)"|([^:]+)/g
  let match
  
  while ((match = regex.exec(argsStr)) !== null) {
    const arg = match[1] || match[2] || match[3]
    if (arg && arg.trim()) {
      args.push(arg.trim())
    }
  }
  
  return { funcName, args }
}

function valueToString(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.join(', ')
  return String(value)
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return parseFloat(value) || 0
  return 0
}



function toUpperCase(value: unknown): string {
  return valueToString(value).toUpperCase()
}

function toLowerCase(value: unknown): string {
  return valueToString(value).toLowerCase()
}

function capitalize(value: unknown): string {
  const str = valueToString(value)
  return str.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ')
}

function trim(value: unknown): string {
  return valueToString(value).trim()
}

function truncate(value: unknown, maxLength: number, suffixStr: string): string {
  const str = valueToString(value)
  if (str.length > maxLength) {
    return str.slice(0, maxLength - suffixStr.length) + suffixStr
  }
  return str
}

function padLeft(value: unknown, length: number, padChar: string): string {
  return valueToString(value).padStart(length, padChar)
}

function padRight(value: unknown, length: number, padChar: string): string {
  return valueToString(value).padEnd(length, padChar)
}

function replace(value: unknown, oldStr: string, newStr: string): string {
  return valueToString(value).replace(new RegExp(oldStr, 'g'), newStr)
}

function prefix(value: unknown, prefixStr: string): string {
  return prefixStr + valueToString(value)
}

function suffix(value: unknown, suffixStr: string): string {
  return valueToString(value) + suffixStr
}

function reverse(value: unknown): string {
  return valueToString(value).split('').reverse().join('')
}



function join(value: unknown, separator: string): string {
  if (Array.isArray(value)) {
    return value.filter(v => v !== null && v !== undefined).join(separator)
  }
  return valueToString(value)
}

function first(value: unknown): unknown {
  if (Array.isArray(value)) return value[0]
  if (typeof value === 'string') return value.charAt(0)
  return value
}

function last(value: unknown): unknown {
  if (Array.isArray(value)) return value[value.length - 1]
  if (typeof value === 'string') return value.charAt(value.length - 1)
  return value
}

function length(value: unknown): number {
  if (Array.isArray(value)) return value.length
  if (typeof value === 'string') return value.length
  return valueToString(value).length
}



function formatNumber(value: unknown, pattern: string): string {
  const num = toNumber(value)
  if (isNaN(num)) return valueToString(value)
  
  // Formato simples: #,##0.00
  const hasThousands = pattern.includes(',')
  const decimalMatch = pattern.match(/\.(\d+|0+)$/)
  const decimals = decimalMatch ? decimalMatch[1].length : 0
  
  const formatted = num.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: hasThousands
  })
  
  return formatted
}

function formatCurrency(value: unknown, currencyCode: string): string {
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

function numberFormat(value: unknown, locale: string): string {
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

function abs(value: unknown): number {
  return Math.abs(toNumber(value))
}

function round(value: unknown, decimals: number): number {
  const num = toNumber(value)
  const factor = Math.pow(10, decimals)
  return Math.round(num * factor) / factor
}



function formatDate(value: unknown, pattern: string): string {
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



function defaultValue(value: unknown, defaultVal: string): unknown {
  const str = valueToString(value)
  return str.trim() === '' ? defaultVal : value
}



/**
 * Aplica um template ao objeto, substituindo ${propriedade} pelos valores.
 * Exemplo: phone | template:'(${code}) ${number}' -> "(11) 99999"
 */
function applyTemplate(value: unknown, templateStr: string): string {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return valueToString(value)
  }
  
  const objMap = value as Record<string, unknown>
  
  // Substituir ${propriedade} pelos valores do objeto
  return templateStr.replace(/\$\{([^}]+)\}/g, (_, propPath: string) => {
    const trimmedPath = propPath.trim()
    
    
    if (trimmedPath.includes('|')) {
      
      const parts = trimmedPath.split('|').map(p => p.trim())
      const propName = parts[0]
      let propValue: unknown = resolvePropPath(propName, objMap)
      
      
      for (let i = 1; i < parts.length; i++) {
        propValue = applyTransformation(propValue, parts[i])
      }
      return valueToString(propValue)
    } else {
      
      return valueToString(resolvePropPath(trimmedPath, objMap))
    }
  })
}

/**
 * Resolves a property path in an object (supports dot notation).
 */
function resolvePropPath(path: string, obj: Record<string, unknown>): unknown {
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
 * Concatena valores com separador.
 * Exemplo: value | concat:' - ':'texto'
 */
function concat(value: unknown, args: string[]): string {
  const separator = args[0] || ''
  const parts = [valueToString(value)]
  
  
  for (let i = 1; i < args.length; i++) {
    parts.push(args[i])
  }
  
  return parts.join(separator)
}

