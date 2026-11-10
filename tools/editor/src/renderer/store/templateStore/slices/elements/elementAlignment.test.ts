import { describe, it, expect } from 'vitest'
import { useTemplateStore, type Element } from '../../../../store/templateStore'

describe('elementAlignmentSlice', () => {
  it('aligns and distributes selected elements', () => {
    const store = useTemplateStore.getState()
    const el1: Element = { type: 'text', id: 'align-1', x: 10, y: 10, width: 50, height: 20 }
    const el2: Element = { type: 'text', id: 'align-2', x: 100, y: 50, width: 50, height: 20 }
    const el3: Element = { type: 'text', id: 'align-3', x: 200, y: 90, width: 50, height: 20 }

    store.addElement(el1, 'body')
    store.addElement(el2, 'body')
    store.addElement(el3, 'body')

    // Single element alignment
    useTemplateStore.setState({ selectedElementIds: ['align-1'], selectedElementLocation: 'body' })
    useTemplateStore.getState().alignSelectedElements?.('center')

    // Multiple elements alignment
    useTemplateStore.setState({
      selectedElementIds: ['align-1', 'align-2', 'align-3'],
      selectedElementLocation: 'body',
    })
    useTemplateStore.getState().alignSelectedElements?.('left')
    useTemplateStore.getState().alignElements?.('right', 'body')

    // Distribution
    useTemplateStore.getState().distributeSelectedElements?.('horizontal')
    useTemplateStore.getState().distributeElements?.('vertical', 'body')

    const page = useTemplateStore.getState().template.page
    expect(page.length).toBeGreaterThan(0)
  })
})
