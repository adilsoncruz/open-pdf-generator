import { describe, it, expect } from 'vitest'
import { resolveBindingWithLoopData, resolveChildDisplayText } from './childDisplayText'
import { useTemplateStore } from '../../../store/templateStore'

describe('childDisplayText', () => {
  it('resolves direct testData binding and handles null/primitive testData', () => {
    expect(resolveBindingWithLoopData('username', 'loop-1', null)).toBe('{username}')
    expect(resolveBindingWithLoopData('username', 'loop-1', 'not-an-object')).toBe('{username}')

    const text = resolveBindingWithLoopData('username', 'loop-1', { username: 'Alice' })
    expect(text).toBe('Alice')
  })

  it('resolves nested loop array binding with expressions and deep property paths', () => {
    useTemplateStore.setState({
      template: {
        version: '1.0',
        metadata: { name: 'Test' },
        pageSettings: {
          size: 'A4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
          header: {
            height: 50,
            elements: [
              {
                type: 'loop',
                id: 'header-loop',
                dataBinding: 'header.items',
              },
            ],
          },
        },
        page: [
          {
            type: 'loop',
            id: 'orders-loop',
            dataBinding: 'orders.items',
          },
        ],
      },
    })

    const testData = {
      header: {
        items: [{ title: 'Header Item 1' }],
      },
      orders: {
        items: [
          {
            sku: 'SKU-001',
            price: 99.9,
            product: { details: { color: 'Blue' } },
          },
        ],
      },
    }

    // Resolves from header loop
    expect(resolveBindingWithLoopData('title', 'header-loop', testData)).toBe('Header Item 1')

    // Resolves direct and nested paths from orders loop
    expect(resolveBindingWithLoopData('sku', 'orders-loop', testData)).toBe('SKU-001')
    expect(resolveBindingWithLoopData('product.details.color', 'orders-loop', testData)).toBe('Blue')

    // Resolves with transformations
    expect(resolveBindingWithLoopData('sku | upper', 'orders-loop', testData)).toBe('SKU-001')

    // Missing property fallback
    expect(resolveBindingWithLoopData('nonexistent', 'orders-loop', testData)).toBe('{nonexistent}')
  })

  it('resolves child display text for text and non-text elements with and without testData', () => {
    expect(resolveChildDisplayText({ type: 'text', value: 'Fixed' }, 'l1', null)).toBe('Fixed')
    expect(resolveChildDisplayText({ type: 'text', dataBinding: 'title' }, 'l1', null)).toBe('{title}')
    expect(resolveChildDisplayText({ type: 'text' }, 'l1', null, 'Default')).toBe('Default')

    // Non-text element with value
    expect(resolveChildDisplayText({ type: 'image', value: 'logo.png' }, 'l1', null)).toBe('logo.png')

    // Non-text element with dataBinding and testData
    const testData = { photoUrl: 'https://example.com/pic.jpg' }
    expect(resolveChildDisplayText({ type: 'image', dataBinding: 'photoUrl' }, 'l1', testData)).toBe('https://example.com/pic.jpg')
    expect(resolveChildDisplayText({ type: 'image', dataBinding: 'photoUrl' }, 'l1', null)).toBe('{photoUrl}')
    expect(resolveChildDisplayText({}, 'l1', null, 'Fallback')).toBe('Fallback')
  })
})
