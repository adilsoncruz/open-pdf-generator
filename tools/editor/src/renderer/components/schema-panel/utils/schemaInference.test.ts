import { describe, it, expect } from 'vitest'
import { inferSchemaFromData } from './schemaInference'

describe('inferSchemaFromData', () => {
  it('infers null and primitive types', () => {
    expect(inferSchemaFromData(null)).toEqual({ type: 'null' })
    expect(inferSchemaFromData(undefined)).toEqual({ type: 'null' })
    expect(inferSchemaFromData(42)).toEqual({ type: 'integer' })
    expect(inferSchemaFromData(3.14)).toEqual({ type: 'number' })
    expect(inferSchemaFromData(true)).toEqual({ type: 'boolean' })
    expect(inferSchemaFromData('hello')).toEqual({ type: 'string' })
  })

  it('infers arrays with elements and empty arrays', () => {
    expect(inferSchemaFromData([])).toEqual({
      type: 'array',
      items: { type: 'object' },
    })

    expect(inferSchemaFromData(['a', 'b'])).toEqual({
      type: 'array',
      items: { type: 'string' },
    })
  })

  it('infers nested objects', () => {
    const data = {
      name: 'John',
      age: 30,
      tags: ['developer'],
    }
    const schema = inferSchemaFromData(data)
    expect(schema.type).toBe('object')
    expect(schema.required).toEqual(['name', 'age', 'tags'])
    expect(schema.properties.name).toEqual({ type: 'string' })
    expect(schema.properties.age).toEqual({ type: 'integer' })
    expect(schema.properties.tags.type).toBe('array')
  })
})
