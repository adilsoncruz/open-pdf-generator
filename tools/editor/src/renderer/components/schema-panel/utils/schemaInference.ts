export function inferSchemaFromData(data: unknown): Record<string, any> {
  if (data === null || data === undefined) {
    return { type: 'null' }
  }
  if (Array.isArray(data)) {
    return {
      type: 'array',
      items: data.length > 0 ? inferSchemaFromData(data[0]) : { type: 'object' },
    }
  }
  if (typeof data === 'object') {
    const properties: Record<string, any> = {}
    const required: string[] = []
    for (const [key, val] of Object.entries(data)) {
      properties[key] = inferSchemaFromData(val)
      required.push(key)
    }
    return {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties,
      required,
    }
  }
  if (typeof data === 'number') {
    return Number.isInteger(data) ? { type: 'integer' } : { type: 'number' }
  }
  if (typeof data === 'boolean') {
    return { type: 'boolean' }
  }
  return { type: 'string' }
}
