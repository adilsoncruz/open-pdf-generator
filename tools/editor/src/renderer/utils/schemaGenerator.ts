/**
 * Generates sample/mock JSON data conforming to a JSON Schema.
 */
export function generateSampleFromSchema(
  schema: unknown,
  rootSchema?: Record<string, any>,
  depth: number = 0
): any {
  if (!schema || typeof schema !== 'object') {
    return {}
  }

  const s = schema as Record<string, any>
  const root = rootSchema || s

  // Avoid infinite recursion with deeply nested or cyclical references
  if (depth > 8) {
    return null
  }

  // 1. Explicit default, examples, const, enum
  if (s.default !== undefined) return s.default
  if (Array.isArray(s.examples) && s.examples.length > 0) return s.examples[0]
  if (s.const !== undefined) return s.const
  if (Array.isArray(s.enum) && s.enum.length > 0) return s.enum[0]

  // 2. Resolve $ref (internal references like #/definitions/... or #/$defs/...)
  if (typeof s.$ref === 'string') {
    const ref = s.$ref
    if (ref.startsWith('#/')) {
      const parts = ref.substring(2).split('/')
      let target: any = root
      for (const part of parts) {
        if (target && typeof target === 'object') {
          target = target[part]
        } else {
          target = undefined
          break
        }
      }
      if (target) {
        return generateSampleFromSchema(target, root, depth + 1)
      }
    }
  }

  // 3. oneOf / anyOf / allOf
  if (Array.isArray(s.oneOf) && s.oneOf.length > 0) {
    return generateSampleFromSchema(s.oneOf[0], root, depth + 1)
  }
  if (Array.isArray(s.anyOf) && s.anyOf.length > 0) {
    return generateSampleFromSchema(s.anyOf[0], root, depth + 1)
  }
  if (Array.isArray(s.allOf) && s.allOf.length > 0) {
    let merged: Record<string, any> = {}
    for (const item of s.allOf) {
      const val = generateSampleFromSchema(item, root, depth + 1)
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        merged = { ...merged, ...val }
      }
    }
    return merged
  }

  // Determine type
  let type = s.type
  if (!type && s.properties) {
    type = 'object'
  }
  if (!type && s.items) {
    type = 'array'
  }
  if (Array.isArray(type)) {
    type = type.find((t) => t !== 'null') || type[0]
  }

  switch (type) {
    case 'string': {
      if (s.format === 'date-time') return '2026-10-18T20:00:00Z'
      if (s.format === 'date') return '2026-10-18'
      if (s.format === 'time') return '12:00:00'
      if (s.format === 'email') return 'contato@empresa.com'
      if (s.format === 'uri') return 'https://empresa.com/logo.png'
      if (s.format === 'uuid') return '123e4567-e89b-12d3-a456-426614174000'
      return 'Exemplo'
    }

    case 'integer': {
      if (typeof s.minimum === 'number') return s.minimum
      return 1
    }

    case 'number': {
      if (typeof s.minimum === 'number') return s.minimum
      return 99.9
    }

    case 'boolean': {
      return true
    }

    case 'null': {
      return null
    }

    case 'array': {
      if (s.items) {
        return [generateSampleFromSchema(s.items, root, depth + 1)]
      }
      return []
    }

    case 'object':
    default: {
      if (s.properties && typeof s.properties === 'object') {
        const result: Record<string, any> = {}
        for (const [key, propSchema] of Object.entries(s.properties)) {
          const sample = generateSampleFromSchema(propSchema, root, depth + 1)
          if (sample === 'Exemplo') {
            if (/name|nome/i.test(key)) result[key] = 'Nome do Cliente'
            else if (/title|titulo/i.test(key)) result[key] = 'Título do Documento'
            else if (/desc/i.test(key)) result[key] = 'Descrição detalhada'
            else if (/code|codigo|id/i.test(key)) result[key] = 'COD-001'
            else if (/phone|telefone/i.test(key)) result[key] = '+55 11 99999-9999'
            else if (/address|endereco/i.test(key)) result[key] = 'Av. Paulista, 1000'
            else if (/city|cidade/i.test(key)) result[key] = 'São Paulo'
            else result[key] = key
          } else {
            result[key] = sample
          }
        }
        return result
      }
      return {}
    }
  }
}
