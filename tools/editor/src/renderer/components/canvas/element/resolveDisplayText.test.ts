import { describe, it, expect } from 'vitest'
import { resolveDisplayText } from './resolveDisplayText'

describe('resolveDisplayText', () => {
  it('returns value for text element without dataBinding', () => {
    expect(resolveDisplayText({ type: 'text', value: 'Hello' }, null)).toBe('Hello')
  })

  it('returns fallback for text element without value or dataBinding', () => {
    expect(resolveDisplayText({ type: 'text' }, null, 'Default')).toBe('Default')
  })

  it('resolves dataBinding for text element when testData is provided', () => {
    const testData = { user: { name: 'Alice' } }
    expect(resolveDisplayText({ type: 'text', dataBinding: 'user.name' }, testData)).toBe('Alice')
  })

  it('resolves expression transformations when hasTransformations is true', () => {
    const testData = { name: 'john' }
    // Expression with pipe/transformation
    expect(resolveDisplayText({ type: 'text', dataBinding: 'name | uppercase' }, testData)).toBe('JOHN')
  })

  it('falls back to {{binding}} when testData key is missing or null', () => {
    expect(resolveDisplayText({ type: 'text', dataBinding: 'user.missing' }, { user: {} })).toBe('{{user.missing}}')
    expect(resolveDisplayText({ type: 'text', dataBinding: 'user.name' }, null)).toBe('{{user.name}}')
    expect(resolveDisplayText({ type: 'text', dataBinding: 'user.name' }, {})).toBe('{{user.name}}')
  })

  it('resolves non-text element value, dataBinding, or fallback', () => {
    // Non-text with value
    expect(resolveDisplayText({ type: 'barcode', value: '12345' }, null)).toBe('12345')
    // Non-text without value but with dataBinding
    expect(resolveDisplayText({ type: 'barcode', dataBinding: 'code' }, { code: '9999' })).toBe('9999')
    // Non-text without value and fallback
    expect(resolveDisplayText({ type: 'barcode' }, null, 'No code')).toBe('No code')
  })

  it('returns fallback when dataBinding is empty or undefined in resolveBindingText', () => {
    expect(resolveDisplayText({ type: 'text', dataBinding: '' }, null, 'Empty')).toBe('Empty')
  })
})
