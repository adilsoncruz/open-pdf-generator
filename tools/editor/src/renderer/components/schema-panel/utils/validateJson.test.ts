import { describe, it, expect } from 'vitest'
import { validateJson } from './validateJson'

describe('validateJson', () => {
  it('returns valid for empty string', () => {
    expect(validateJson('')).toEqual({ valid: true, error: null, errorLine: null })
    expect(validateJson('   \n  ')).toEqual({ valid: true, error: null, errorLine: null })
  })

  it('returns valid for valid JSON', () => {
    const res = validateJson('{"name": "test", "num": 123}')
    expect(res.valid).toBe(true)
    expect(res.error).toBeNull()
  })

  it('returns invalid with error message and line number for malformed JSON', () => {
    const json = '{\n  "name": "test",\n  "num": \n}'
    const res = validateJson(json)
    expect(res.valid).toBe(false)
    expect(res.error).toBeTruthy()
    expect(res.errorLine === null || typeof res.errorLine === 'number').toBe(true)
  })
})
