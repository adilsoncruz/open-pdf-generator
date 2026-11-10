import { describe, it, expect, beforeEach } from 'vitest'
import { useTemplateStore, type Element } from '../../../../store/templateStore'
import { defaultTemplate } from '../../helpers'

describe('elementCloneSlice', () => {
  beforeEach(() => {
    useTemplateStore.setState({
      template: JSON.parse(JSON.stringify(defaultTemplate)),
      history: [defaultTemplate],
      historyIndex: 0,
      selectedElementIds: [],
      copiedElements: null,
      currentSection: 'body',
    })
  })

  it('duplicates single element and element with children', () => {
    const textEl: Element = {
      id: 'text-orig',
      type: 'text',
      x: 10,
      y: 20,
      width: 100,
      height: 30,
      value: 'Original',
    }

    useTemplateStore.setState({
      template: {
        ...defaultTemplate,
        page: [textEl],
      },
      selectedElementIds: ['text-orig'],
    })

    useTemplateStore.getState().duplicateElement?.('text-orig')
    const page = useTemplateStore.getState().template.page
    expect(page.length).toBe(2)
    expect(page[1].id).not.toBe('text-orig')
    expect(page[1].value).toBe('Original')
    expect(page[1].x).toBe(30)
    expect(page[1].y).toBe(40)
  })

  it('copies and pastes elements at root level', () => {
    const textEl: Element = {
      id: 'text-1',
      type: 'text',
      x: 50,
      y: 50,
      width: 80,
      height: 20,
    }

    useTemplateStore.setState({
      template: {
        ...defaultTemplate,
        page: [textEl],
      },
      selectedElementIds: ['text-1'],
    })

    // Paste with empty clipboard does nothing
    useTemplateStore.getState().pasteElement()
    expect(useTemplateStore.getState().template.page.length).toBe(1)

    // Copy element
    useTemplateStore.getState().copyElement()
    expect(useTemplateStore.getState().copiedElements).toBeDefined()
    expect(useTemplateStore.getState().copiedElements?.elements.length).toBe(1)

    // Paste element
    useTemplateStore.getState().pasteElement()
    const page = useTemplateStore.getState().template.page
    expect(page.length).toBe(2)
    expect(page[1].x).toBe(70)
    expect(page[1].y).toBe(70)
  })

  it('pastes element inside target container when container is selected or child selected', () => {
    const containerEl: Element = {
      id: 'cont-parent',
      type: 'container',
      x: 0,
      y: 0,
      width: 400,
      height: 200,
      elements: [
        {
          id: 'child-1',
          type: 'text',
          x: 10,
          y: 10,
          width: 50,
          height: 20,
        },
      ],
    }

    useTemplateStore.setState({
      template: {
        ...defaultTemplate,
        page: [containerEl],
      },
      copiedElements: {
        elements: [{ id: 'pasted-text', type: 'text', x: 20, y: 20, width: 60, height: 25 }],
        sourceLocation: 'body',
      },
      selectedElementIds: ['cont-parent'],
    })

    // 1. Paste into selected container
    useTemplateStore.getState().pasteElement()
    const cont = useTemplateStore.getState().template.page[0]
    expect(cont.elements?.length).toBe(2)

    // 2. Paste when container child is selected
    useTemplateStore.setState({
      selectedElementIds: ['child-1'],
      selectedContainerChildId: 'child-1',
      selectedContainerParentId: 'cont-parent',
    })

    useTemplateStore.getState().pasteElement()
    const contAfter = useTemplateStore.getState().template.page[0]
    expect(contAfter.elements?.length).toBe(3)
  })
})
