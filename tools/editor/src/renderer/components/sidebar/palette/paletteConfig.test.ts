import { describe, it, expect } from 'vitest'
import { PALETTE_CATEGORIES } from './paletteConfig'

describe('paletteConfig', () => {
  it('instantiates all palette elements properly through createElement', () => {
    expect(PALETTE_CATEGORIES.length).toBeGreaterThan(0)

    PALETTE_CATEGORIES.forEach((category) => {
      expect(category.name).toBeDefined()
      expect(category.items.length).toBeGreaterThan(0)

      category.items.forEach((item) => {
        expect(item.id).toBeDefined()
        expect(item.type).toBeDefined()
        expect(item.label).toBeDefined()

        const element = item.createElement()
        expect(element.id).toBeDefined()
        expect(element.type).toBeDefined()
        expect(typeof element.x).toBe('number')
        expect(typeof element.y).toBe('number')
      })
    })
  })
})
