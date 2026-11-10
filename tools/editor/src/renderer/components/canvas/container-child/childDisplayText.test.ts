import { describe, it, expect } from 'vitest'
import { resolveChildDisplayText } from './childDisplayText'

describe('container-child resolveChildDisplayText', () => {
  it('returns value for text element without dataBinding', () => {
    expect(resolveChildDisplayText({ type: 'text', value: 'Hello' }, null)).toBe('Hello')
  })

  it('returns fallback for text element without value or dataBinding', () => {
    expect(resolveChildDisplayText({ type: 'text' }, null, 'Fallback')).toBe('Fallback')
  })

  it('resolves dataBinding for text element when testData is provided', () => {
    const testData = { customer: { name: 'Bob' } }
    expect(resolveChildDisplayText({ type: 'text', dataBinding: 'customer.name' }, testData)).toBe('Bob')
  })

  it('resolves expressions with transformations', () => {
    const testData = { item: 'sample' }
    expect(resolveChildDisplayText({ type: 'text', dataBinding: 'item | uppercase' }, testData)).toBe('SAMPLE')
  })

  it('falls back to {binding} when key is missing or testData is empty', () => {
    expect(resolveChildDisplayText({ type: 'text', dataBinding: 'customer.missing' }, { customer: {} })).toBe('{customer.missing}')
    expect(resolveChildDisplayText({ type: 'text', dataBinding: 'customer.name' }, null)).toBe('{customer.name}')
    expect(resolveChildDisplayText({ type: 'text', dataBinding: 'customer.name' }, undefined)).toBe('{customer.name}')
    expect(resolveChildDisplayText({ type: 'text', dataBinding: 'customer.name' }, {})).toBe('{customer.name}')
  })

  it('resolves non-text elements (value, dataBinding, fallback)', () => {
    expect(resolveChildDisplayText({ type: 'barcode', value: 'BAR-123' }, null)).toBe('BAR-123')
    expect(resolveChildDisplayText({ type: 'barcode', dataBinding: 'code' }, { code: 'VAL-456' })).toBe('VAL-456')
    expect(resolveChildDisplayText({ type: 'barcode' }, null, 'No Barcode')).toBe('No Barcode')
  })

  it('returns fallback when dataBinding is empty in resolveBindingChildText', () => {
    expect(resolveChildDisplayText({ type: 'text', dataBinding: '' }, null, 'Empty')).toBe('Empty')
  })
})
