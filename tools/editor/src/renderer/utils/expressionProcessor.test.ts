import { describe, it, expect } from 'vitest'
import {
  hasTransformations,
  extractBinding,
  resolveBinding,
  applyTransformation,
  processExpression,
  evaluateCondition,
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
} from './expressionProcessor'

describe('expressionProcessor', () => {
  describe('hasTransformations and extractBinding', () => {
    it('detects pipe transformations', () => {
      expect(hasTransformations('user.name | upperCase')).toBe(true)
      expect(hasTransformations('user.name')).toBe(false)
    })

    it('extracts base binding correctly', () => {
      expect(extractBinding('user.name | upperCase | trim')).toBe('user.name')
      expect(extractBinding('user.name')).toBe('user.name')
      expect(extractBinding('')).toBe('')
    })
  })

  describe('resolvePath and resolveBinding', () => {
    const data = {
      user: {
        name: 'John Doe',
        address: {
          city: 'São Paulo'
        }
      },
      items: [
        { name: 'Item 1', price: 10 },
        { name: 'Item 2', price: 20 }
      ],
      emptyList: []
    }

    it('resolves simple and nested properties', () => {
      expect(resolveBinding('user.name', data)).toBe('John Doe')
      expect(resolveBinding('user.address.city', data)).toBe('São Paulo')
      expect(resolveBinding('user.nonexistent', data)).toBeUndefined()
      expect(resolveBinding('invalid.path.here', data)).toBeNull()
    })

    it('resolves array indexing', () => {
      expect(resolveBinding('items.0.name', data)).toBe('Item 1')
      expect(resolveBinding('items.1.price', data)).toBe(20)
      expect(resolveBinding('items.99.name', data)).toBeNull()
    })

    it('resolves array length and size', () => {
      expect(resolveBinding('items.length', data)).toBe(2)
      expect(resolveBinding('items.size', data)).toBe(2)
      expect(resolveBinding('emptyList.length', data)).toBe(0)
    })
  })

  describe('string transformations', () => {
    it('converts to upper and lower case', () => {
      expect(toUpperCase('hello world')).toBe('HELLO WORLD')
      expect(toLowerCase('HELLO WORLD')).toBe('hello world')
      expect(applyTransformation('hello', 'upper')).toBe('HELLO')
      expect(applyTransformation('HELLO', 'lower')).toBe('hello')
    })

    it('capitalizes words', () => {
      expect(capitalize('john doe')).toBe('John Doe')
      expect(applyTransformation('john doe', 'cap')).toBe('John Doe')
    })

    it('trims whitespace', () => {
      expect(trim('  hello  ')).toBe('hello')
      expect(applyTransformation('  hello  ', 'trim')).toBe('hello')
    })

    it('truncates strings', () => {
      expect(truncate('Hello World', 8, '...')).toBe('Hello...')
      expect(truncate('Short', 10)).toBe('Short')
      expect(applyTransformation('Long text description', 'truncate:10:...')).toBe('Long te...')
    })

    it('pads left and right', () => {
      expect(padLeft('5', 3, '0')).toBe('005')
      expect(padRight('5', 3, '0')).toBe('500')
      expect(applyTransformation('42', 'padLeft:5:0')).toBe('00042')
      expect(applyTransformation('42', 'rpad:5: ')).toBe('42   ')
    })

    it('replaces substrings', () => {
      expect(replace('foo bar foo', 'foo', 'baz')).toBe('baz bar baz')
      expect(applyTransformation('abc', "replace:'b':'z'")).toBe('azc')
    })

    it('handles prefix and suffix', () => {
      expect(prefix('World', 'Hello ')).toBe('Hello World')
      expect(suffix('Hello', ' World')).toBe('Hello World')
      expect(applyTransformation('123', 'prefix:ID-')).toBe('ID-123')
      expect(applyTransformation('123', 'suffix:-END')).toBe('123-END')
    })

    it('reverses strings', () => {
      expect(reverse('abc')).toBe('cba')
      expect(applyTransformation('abc', 'reverse')).toBe('cba')
    })

    it('concatenates values', () => {
      expect(concat('foo', [' - ', 'bar', 'baz'])).toBe('foo - bar - baz')
      expect(applyTransformation('A', "concat:' - ':B:C")).toBe('A - B - C')
    })
  })

  describe('number and math transformations', () => {
    it('formats numbers', () => {
      const formatted = formatNumber(1234.56, '#,##0.00')
      expect(formatted).toContain('1.234,56')
      expect(applyTransformation(1234.56, "format:'#,##0.00'")).toContain('1.234,56')
    })

    it('formats currencies', () => {
      const brl = formatCurrency(100, 'BRL')
      expect(brl).toContain('100')
      const usd = formatCurrency(100, 'USD')
      expect(usd).toContain('100')
    })

    it('handles numberFormat locales', () => {
      expect(numberFormat(1234.5, 'pt-BR')).toContain('1.234,5')
      expect(applyTransformation(1234.5, 'numberformat:pt-br')).toContain('1.234,5')
    })

    it('handles abs, round, floor, ceil', () => {
      expect(abs(-42)).toBe(42)
      expect(round(3.14159, 2)).toBe(3.14)
      expect(floor(3.9)).toBe(3)
      expect(ceil(3.1)).toBe(4)
      expect(applyTransformation(-10, 'abs')).toBe(10)
      expect(applyTransformation(3.567, 'round:1')).toBe(3.6)
      expect(applyTransformation(3.8, 'floor')).toBe(3)
      expect(applyTransformation(3.2, 'ceil')).toBe(4)
    })
  })

  describe('array and collection transformations', () => {
    it('joins array elements', () => {
      expect(join(['a', 'b', 'c'], ', ')).toBe('a, b, c')
      expect(applyTransformation(['x', 'y'], 'join:-')).toBe('x-y')
    })

    it('extracts first and last elements', () => {
      expect(first(['a', 'b', 'c'])).toBe('a')
      expect(first('hello')).toBe('h')
      expect(last(['a', 'b', 'c'])).toBe('c')
      expect(last('hello')).toBe('o')
    })

    it('computes length', () => {
      expect(length(['a', 'b'])).toBe(2)
      expect(length('hello')).toBe(5)
      expect(applyTransformation(['a', 'b', 'c'], 'length')).toBe(3)
    })
  })

  describe('date formatting', () => {
    it('formats dates according to pattern', () => {
      const date = new Date(2026, 9, 27, 14, 30, 45) // 27/10/2026
      expect(formatDate(date, 'dd/MM/yyyy')).toBe('27/10/2026')
      expect(formatDate(date, 'yyyy-MM-dd HH:mm:ss')).toBe('2026-10-27 14:30:45')
      expect(formatDate(date, 'dd/MM/yy')).toBe('27/10/26')
      expect(applyTransformation(date, 'date:dd/MM/yyyy')).toBe('27/10/2026')
    })

    it('returns raw string if invalid date', () => {
      expect(formatDate('not-a-date', 'dd/MM/yyyy')).toBe('not-a-date')
    })
  })

  describe('default value fallback', () => {
    it('provides fallback for empty values', () => {
      expect(defaultValue('', 'N/A')).toBe('N/A')
      expect(defaultValue(null, 'N/A')).toBe('N/A')
      expect(defaultValue(undefined, 'N/A')).toBe('N/A')
      expect(defaultValue('actual', 'N/A')).toBe('actual')
      expect(applyTransformation('', 'default:Fallback')).toBe('Fallback')
    })
  })

  describe('template substitution', () => {
    it('substitutes properties into template', () => {
      const phone = { code: '11', number: '99999-9999' }
      const res = applyTransformation(phone, "template:'(${code}) ${number}'")
      expect(res).toBe('(11) 99999-9999')
    })

    it('supports piped expressions inside template', () => {
      const user = { firstName: 'john', lastName: 'doe' }
      const res = applyTransformation(user, "template:'${firstName | upper} ${lastName | capitalize}'")
      expect(res).toBe('JOHN Doe')
    })
  })

  describe('processExpression (end-to-end chaining)', () => {
    const data = {
      order: {
        id: 1234,
        client: '  acme corp  ',
        items: ['Pen', 'Notebook', 'Eraser'],
        total: 1500.5
      }
    }

    it('processes simple bindings without transforms', () => {
      expect(processExpression('order.id', data)).toBe('1234')
      expect(processExpression('order.client', data)).toBe('  acme corp  ')
    })

    it('chains multiple pipe transformations', () => {
      expect(processExpression('order.client | trim | upperCase', data)).toBe('ACME CORP')
      expect(processExpression('order.client | trim | capitalize', data)).toBe('Acme Corp')
    })

    it('processes list transformations', () => {
      expect(processExpression("order.items | join:'; '", data)).toBe('Pen; Notebook; Eraser')
      expect(processExpression('order.items | first | upper', data)).toBe('PEN')
    })

    it('handles empty expression', () => {
      expect(processExpression('', data)).toBe('')
    })
  })

  describe('evaluateCondition', () => {
    const data = {
      status: 'active',
      invoice: {
        type: 'A',
        total: 100,
        items: [1, 2, 3]
      },
      flag: true
    }

    it('evaluates empty conditions as true', () => {
      expect(evaluateCondition('', data)).toBe(true)
      expect(evaluateCondition(null, data)).toBe(true)
      expect(evaluateCondition(undefined, data)).toBe(true)
    })

    it('evaluates equality and inequality', () => {
      expect(evaluateCondition("status == 'active'", data)).toBe(true)
      expect(evaluateCondition("status == 'inactive'", data)).toBe(false)
      expect(evaluateCondition("status != 'inactive'", data)).toBe(true)
    })

    it('evaluates numeric comparisons', () => {
      expect(evaluateCondition('invoice.total > 50', data)).toBe(true)
      expect(evaluateCondition('invoice.total >= 100', data)).toBe(true)
      expect(evaluateCondition('invoice.total < 100', data)).toBe(false)
      expect(evaluateCondition('invoice.total <= 100', data)).toBe(true)
    })

    it('evaluates in operator', () => {
      expect(evaluateCondition("status in ['active', 'pending']", data)).toBe(true)
      expect(evaluateCondition("status in ['draft', 'cancelled']", data)).toBe(false)
    })

    it('evaluates logical AND / OR', () => {
      expect(evaluateCondition("invoice.type == 'A' && invoice.total > 50", data)).toBe(true)
      expect(evaluateCondition("invoice.type == 'B' || invoice.total > 50", data)).toBe(true)
      expect(evaluateCondition("invoice.type == 'B' && invoice.total > 50", data)).toBe(false)
    })

    it('evaluates boolean paths directly', () => {
      expect(evaluateCondition('flag', data)).toBe(true)
      expect(evaluateCondition('nonexistent', data)).toBe(false)
    })
  })
})
