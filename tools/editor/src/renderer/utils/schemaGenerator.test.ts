import { describe, it, expect } from 'vitest'
import { generateSampleFromSchema } from './schemaGenerator'

describe('generateSampleFromSchema', () => {
  it('handles invalid inputs and depth limits', () => {
    expect(generateSampleFromSchema(null)).toEqual({})
    expect(generateSampleFromSchema('not-an-object')).toEqual({})
    expect(generateSampleFromSchema({ type: 'string' }, undefined, 9)).toBeNull()
  })

  it('handles basic primitive types', () => {
    expect(generateSampleFromSchema({ type: 'string' })).toBe('Exemplo')
    expect(generateSampleFromSchema({ type: 'integer' })).toBe(1)
    expect(generateSampleFromSchema({ type: 'number', minimum: 10 })).toBe(10)
    expect(generateSampleFromSchema({ type: 'number' })).toBe(99.9)
    expect(generateSampleFromSchema({ type: 'boolean' })).toBe(true)
    expect(generateSampleFromSchema({ type: 'null' })).toBeNull()
  })

  it('honors default, examples, const and enum', () => {
    expect(generateSampleFromSchema({ type: 'string', default: 'Padrão' })).toBe('Padrão')
    expect(generateSampleFromSchema({ type: 'number', examples: [42] })).toBe(42)
    expect(generateSampleFromSchema({ const: 'fixo' })).toBe('fixo')
    expect(generateSampleFromSchema({ enum: ['op1', 'op2'] })).toBe('op1')
  })

  it('infers type when omitted based on properties, items, or union types', () => {
    expect(generateSampleFromSchema({ properties: { a: { type: 'string' } } })).toEqual({ a: 'a' })
    expect(generateSampleFromSchema({ items: { type: 'integer' } })).toEqual([1])
    expect(generateSampleFromSchema({ type: ['null', 'string'] })).toBe('Exemplo')
    expect(generateSampleFromSchema({ type: ['null'] })).toBeNull()
    expect(generateSampleFromSchema({ type: 'array' })).toEqual([])
    expect(generateSampleFromSchema({ type: 'object' })).toEqual({})
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
              quantity: { type: 'integer', minimum: 2 },
            },
          },
        },
      },
    }

    const sample = generateSampleFromSchema(schema)
    expect(sample).toEqual({
      customerName: 'Nome do Cliente',
      totalAmount: 50,
      active: true,
      items: [
        {
          description: 'Descrição detalhada',
          quantity: 2,
        },
      ],
    })
  })

  it('resolves internal definitions and $ref, including broken refs', () => {
    const schema = {
      type: 'object',
      definitions: {
        Address: {
          type: 'object',
          properties: {
            city: { type: 'string' },
          },
        },
      },
      properties: {
        address: { $ref: '#/definitions/Address' },
        broken: { $ref: '#/definitions/NonExistent/Field' },
      },
    }

    const sample = generateSampleFromSchema(schema)
    expect(sample.address).toEqual({ city: 'São Paulo' })
    expect(sample.broken).toEqual({})
  })

  it('formats special string types like date and email', () => {
    expect(generateSampleFromSchema({ type: 'string', format: 'email' })).toBe('contato@empresa.com')
    expect(generateSampleFromSchema({ type: 'string', format: 'date' })).toBe('2026-10-18')
    expect(generateSampleFromSchema({ type: 'string', format: 'date-time' })).toBe('2026-10-18T20:00:00Z')
    expect(generateSampleFromSchema({ type: 'string', format: 'time' })).toBe('12:00:00')
    expect(generateSampleFromSchema({ type: 'string', format: 'uri' })).toBe('https://empresa.com/logo.png')
    expect(generateSampleFromSchema({ type: 'string', format: 'uuid' })).toBe('123e4567-e89b-12d3-a456-426614174000')
  })

  it('handles oneOf, anyOf, allOf combinators and key heuristics', () => {
    expect(generateSampleFromSchema({ oneOf: [{ type: 'integer' }] })).toBe(1)
    expect(generateSampleFromSchema({ anyOf: [{ type: 'boolean' }] })).toBe(true)
    expect(
      generateSampleFromSchema({
        allOf: [
          { properties: { a: { type: 'string' } } },
          { properties: { b: { type: 'integer' } } },
          'not-an-object',
        ],
      })
    ).toEqual({
      a: 'a',
      b: 1,
    })

    const obj = generateSampleFromSchema({
      type: 'object',
      properties: {
        titulo: { type: 'string' },
        codigo: { type: 'string' },
        telefone: { type: 'string' },
        endereco: { type: 'string' },
        custom: { type: 'string' },
      },
    })
    expect(obj.titulo).toBe('Título do Documento')
    expect(obj.codigo).toBe('COD-001')
    expect(obj.telefone).toBe('+55 11 99999-9999')
    expect(obj.endereco).toBe('Av. Paulista, 1000')
    expect(obj.custom).toBe('custom')
  })
})
