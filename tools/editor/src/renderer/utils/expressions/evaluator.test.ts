import { describe, it, expect } from 'vitest'
import {
  resolvePath,
  parseTransformation,
  interpolateTokens,
  evaluateCondition,
} from './evaluator'

describe('expressions evaluator', () => {
  it('resolves array length, size and out of bounds indices', () => {
    const data = { items: ['apple', 'banana'], scalar: 10 }
    expect(resolvePath('items.length', data)).toBe(2)
    expect(resolvePath('items.size', data)).toBe(2)
    expect(resolvePath('items.0', data)).toBe('apple')
    expect(resolvePath('items.99', data)).toBeNull()
    expect(resolvePath('scalar.prop', data)).toBeNull()
    expect(resolvePath('missing.deep', null)).toBeNull()
  })

  it('parses transformations with double quotes, single quotes and bare words', () => {
    expect(parseTransformation('format:"#,##0.00"')).toEqual({
      funcName: 'format',
      args: ['#,##0.00'],
    })
    expect(parseTransformation("prefix:'ID: '")).toEqual({
      funcName: 'prefix',
      args: ['ID: '],
    })
    expect(parseTransformation('round:2')).toEqual({
      funcName: 'round',
      args: ['2'],
    })
    expect(parseTransformation('trim')).toEqual({
      funcName: 'trim',
      args: [],
    })
  })

  it('interpolates tokens with chained transforms and plain strings', () => {
    const data = { user: { name: 'alice' } }
    const transformFn = (val: any, t: string) => (t === 'upper' ? String(val).toUpperCase() : val)
    const result = interpolateTokens('Hello ${user.name | upper}!', data, transformFn)
    expect(result).toBe('Hello ALICE!')
  })

  it('evaluates conditions with in operator, empty lists, and string comparisons', () => {
    expect(evaluateCondition("category in ['a', 'b']", { category: 'a' })).toBe(true)
    expect(evaluateCondition("category in []", { category: 'a' })).toBe(false)
    expect(evaluateCondition('category in allowedList', { category: 'b', allowedList: ['a', 'b'] })).toBe(true)
    expect(evaluateCondition('category in missingList', { category: 'b' })).toBe(false)
    expect(evaluateCondition("'beta' > 'alpha'", {})).toBe(true)
    expect(evaluateCondition("'alpha' < 'beta'", {})).toBe(true)
    expect(evaluateCondition("'beta' >= 'alpha'", {})).toBe(true)
    expect(evaluateCondition("'alpha' <= 'beta'", {})).toBe(true)
    expect(evaluateCondition('(x == 1)', { x: 1 })).toBe(true)
    expect(evaluateCondition('x != 2', { x: 1 })).toBe(true)
    expect(evaluateCondition('', {})).toBe(true)
    expect(evaluateCondition(null, {})).toBe(true)
  })

  it('evaluates numeric comparisons and compound logic', () => {
    expect(evaluateCondition('10 > 5', {})).toBe(true)
    expect(evaluateCondition('5 < 10', {})).toBe(true)
    expect(evaluateCondition('10 >= 10', {})).toBe(true)
    expect(evaluateCondition('5 <= 5', {})).toBe(true)

    expect(evaluateCondition('x > 5 && y < 20', { x: 10, y: 15 })).toBe(true)
    expect(evaluateCondition('x > 20 || y == 15', { x: 10, y: 15 })).toBe(true)
    expect(evaluateCondition('x == 10 && y == 99', { x: 10, y: 15 })).toBe(false)

    // Truthy and boolean resolution
    expect(evaluateCondition('isActive', { isActive: true })).toBe(true)
    expect(evaluateCondition('isBlocked', { isBlocked: false })).toBe(false)
    expect(evaluateCondition('status', { status: 'true' })).toBe(true)
    expect(evaluateCondition('count', { count: 5 })).toBe(true)
    expect(evaluateCondition('zeroCount', { zeroCount: 0 })).toBe(false)
    expect(evaluateCondition('obj', { obj: { id: 1 } })).toBe(true)
    expect(evaluateCondition('missing', {})).toBe(false)
  })
})
