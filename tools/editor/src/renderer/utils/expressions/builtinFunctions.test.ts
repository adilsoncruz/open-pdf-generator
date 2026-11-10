import { describe, it, expect } from 'vitest'
import {
  valueToString,
  toNumber,
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
  concat,
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
} from './builtinFunctions'

describe('builtinFunctions', () => {
  describe('valueToString & toNumber', () => {
    it('converts values to strings and numbers accurately', () => {
      expect(valueToString(null)).toBe('')
      expect(valueToString(undefined)).toBe('')
      expect(valueToString('hello')).toBe('hello')
      expect(valueToString(123)).toBe('123')
      expect(valueToString(true)).toBe('true')
      expect(valueToString(['a', 'b'])).toBe('a, b')

      expect(toNumber(42)).toBe(42)
      expect(toNumber('42.5')).toBe(42.5)
      expect(toNumber('invalid')).toBe(0)
      expect(toNumber(null)).toBe(0)
    })
  })

  describe('text transformations', () => {
    it('applies case modifications, trim, and truncate', () => {
      expect(toUpperCase('test')).toBe('TEST')
      expect(toLowerCase('TEST')).toBe('test')
      expect(capitalize('open pdf generator')).toBe('Open Pdf Generator')
      expect(trim('  spaced  ')).toBe('spaced')
      expect(truncate('Hello World this is a long text', 15)).toBe('Hello World ...')
      expect(truncate('Short', 10)).toBe('Short')
      expect(padLeft('5', 3, '0')).toBe('005')
      expect(padRight('5', 3, '0')).toBe('500')
    })

    it('replaces, prefixes, suffixes, reverses, and concatenates', () => {
      expect(replace('foo bar foo', 'foo', 'baz')).toBe('baz bar baz')
      expect(prefix('World', 'Hello ')).toBe('Hello World')
      expect(suffix('Hello', ' World')).toBe('Hello World')
      expect(reverse('abcde')).toBe('edcba')
      expect(concat('Part1', [' - ', 'Part2', 'Part3'])).toBe('Part1 - Part2 - Part3')
    })
  })

  describe('collections & arrays', () => {
    it('handles join, first, last, and length', () => {
      expect(join(['a', 'b', null, 'c'], ' | ')).toBe('a | b | c')
      expect(join('single')).toBe('single')

      expect(first(['apple', 'banana'])).toBe('apple')
      expect(first('apple')).toBe('a')
      expect(first(123)).toBe(123)

      expect(last(['apple', 'banana'])).toBe('banana')
      expect(last('apple')).toBe('e')
      expect(last(123)).toBe(123)

      expect(length(['a', 'b', 'c'])).toBe(3)
      expect(length('hello')).toBe(5)
      expect(length(1234)).toBe(4)
    })
  })

  describe('number formatting & math', () => {
    it('formats numbers, currencies, and handles math operations', () => {
      expect(formatNumber(1234.56, '#,##0.00')).toBe('1.234,56')
      expect(formatNumber(0, '#,##0.00')).toBe('0,00')

      expect(formatCurrency(1250, 'BRL')).toContain('1.250')
      expect(formatCurrency(1250, 'USD')).toContain('1,250')
      expect(formatCurrency(1250, 'EUR')).toContain('1.250')
      expect(formatCurrency(1250, 'ARS')).toContain('1.250')
      expect(formatCurrency(1250, 'MXN')).toContain('1,250')

      expect(numberFormat(1234.56, 'en-us')).toBe('1,234.56')
      expect(numberFormat(1234.56, 'pt-br')).toBe('1.234,56')

      expect(abs(-15)).toBe(15)
      expect(round(12.3456, 2)).toBe(12.35)
      expect(floor(12.9)).toBe(12)
      expect(ceil(12.1)).toBe(13)
    })
  })

  describe('dates and default values', () => {
    it('formats dates from Date, number, and string objects', () => {
      const fixedDate = new Date('2026-05-15T14:30:45')
      expect(formatDate(fixedDate, 'dd/MM/yyyy')).toBe('15/05/2026')
      expect(formatDate(fixedDate.getTime(), 'yyyy-MM-dd HH:mm:ss')).toBe('2026-05-15 14:30:45')
      expect(formatDate('2026-10-20T08:15:00', 'dd-MM-yy')).toBe('20-10-26')
      expect(formatDate('invalid-date')).toBe('invalid-date')
      expect(formatDate(null)).toBe('')
    })

    it('falls back to default value when empty or whitespace', () => {
      expect(defaultValue('', 'fallback')).toBe('fallback')
      expect(defaultValue('   ', 'fallback')).toBe('fallback')
      expect(defaultValue(null, 'fallback')).toBe('fallback')
      expect(defaultValue('valid', 'fallback')).toBe('valid')
    })
  })
})
