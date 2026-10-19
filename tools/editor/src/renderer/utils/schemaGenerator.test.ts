import { describe, it, expect } from 'vitest'
import { generateSampleFromSchema } from './schemaGenerator'

describe('generateSampleFromSchema', () => {
  it('handles basic primitive types', () => {
    expect(generateSampleFromSchema({ type: 'string' })).toBe('Exemplo')
    expect(generateSampleFromSchema({ type: 'integer' })).toBe(1)
    expect(generateSampleFromSchema({ type: 'number', minimum: 10 })).toBe(10)
    expect(generateSampleFromSchema({ type: 'boolean' })).toBe(true)
    expect(generateSampleFromSchema({ type: 'null' })).toBeNull()
  })

  it('honors default, examples, const and enum', () => {
    expect(generateSampleFromSchema({ type: 'string', default: 'Padrão' })).toBe('Padrão')
    expect(generateSampleFromSchema({ type: 'number', examples: [42] })).toBe(42)
    expect(generateSampleFromSchema({ const: 'fixo' })).toBe('fixo')
    expect(generateSampleFromSchema({ enum: ['op1', 'op2'] })).toBe('op1')
  })

  it('generates nested objects and arrays', () => {
    const schema = {
      type: 'object',
      properties: {
        customerName: { type: 'string' },
        totalAmount: { type: 'number', minimum: 50 },
        active: { type: 'boolean' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              description: { type: 'string' },
              quantity: { type: 'integer', minimum: 2 }
            }
          }
        }
      }
    }

    const sample = generateSampleFromSchema(schema)
    expect(sample).toEqual({
      customerName: 'Nome do Cliente',
      totalAmount: 50,
      active: true,
      items: [
        {
          description: 'Descrição detalhada',
          quantity: 2
        }
      ]
    })
  })

  it('resolves internal definitions and $ref', () => {
    const schema = {
      type: 'object',
      definitions: {
        Address: {
          type: 'object',
          properties: {
            city: { type: 'string' }
          }
        }
      },
      properties: {
        address: { $ref: '#/definitions/Address' }
      }
    }

    const sample = generateSampleFromSchema(schema)
    expect(sample.address).toEqual({ city: 'São Paulo' })
  })

  it('formats special string types like date and email', () => {
    expect(generateSampleFromSchema({ type: 'string', format: 'email' })).toBe('contato@empresa.com')
    expect(generateSampleFromSchema({ type: 'string', format: 'date' })).toBe('2026-10-18')
  })
})
