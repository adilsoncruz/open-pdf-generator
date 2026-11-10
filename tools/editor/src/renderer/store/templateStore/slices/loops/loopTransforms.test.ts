import { describe, it, expect, beforeEach } from 'vitest'
import { useTemplateStore, type Element } from '../../../../store/templateStore'
import { defaultTemplate } from '../../helpers'

describe('loopTransformsSlice', () => {
  beforeEach(() => {
    useTemplateStore.setState({
      template: JSON.parse(JSON.stringify(defaultTemplate)),
      history: [defaultTemplate],
      historyIndex: 0,
      selectedElementIds: [],
      currentSection: 'body',
    })
  })

  it('moves and resizes loop at root level and nested in container', () => {
    const loopEl: Element = {
      id: 'loop-root',
      type: 'loop',
      x: 10,
      y: 10,
      width: 400,
      height: 150,
      elements: [{ id: 'child-1', type: 'text', value: 'Item' }],
    }

    const containerWithLoop: Element = {
      id: 'cont-outer',
      type: 'container',
      x: 0,
      y: 0,
      width: 500,
      height: 300,
      elements: [
        {
          id: 'loop-nested',
          type: 'loop',
          x: 5,
          y: 5,
          width: 300,
          height: 100,
          elements: [],
        },
      ],
    }

    useTemplateStore.setState({
      template: {
        ...defaultTemplate,
        page: [loopEl, containerWithLoop],
      },
    })

    // Move root loop
    useTemplateStore.getState().moveLoop('loop-root', 15, 25, 'body')
    let page = useTemplateStore.getState().template.page
    expect(page[0].x).toBe(25)
    expect(page[0].y).toBe(35)

    // Resize root loop
    useTemplateStore.getState().resizeLoop('loop-root', 450, 180, 'body')
    page = useTemplateStore.getState().template.page
    expect(page[0].width).toBe(450)
    expect(page[0].height).toBe(180)

    // Move nested loop inside container
    useTemplateStore.getState().moveLoop('loop-nested', 20, 30, 'body')
    page = useTemplateStore.getState().template.page
    const updatedNested = page[1].elements?.[0]
    expect(updatedNested?.x).toBe(25)
    expect(updatedNested?.y).toBe(35)

    // Resize nested loop inside container
    useTemplateStore.getState().resizeLoop('loop-nested', 350, 120, 'body')
    page = useTemplateStore.getState().template.page
    const resizedNested = page[1].elements?.[0]
    expect(resizedNested?.width).toBe(350)
    expect(resizedNested?.height).toBe(120)
  })

  it('duplicates loop with nested children', () => {
    const loopWithNestedChildren: Element = {
      id: 'loop-dup',
      type: 'loop',
      x: 10,
      y: 10,
      width: 400,
      height: 150,
      elements: [
        {
          id: 'child-c1',
          type: 'container',
          elements: [{ id: 'child-text', type: 'text', value: 'Nested text' }],
        },
      ],
    }

    useTemplateStore.setState({
      template: {
        ...defaultTemplate,
        page: [loopWithNestedChildren],
      },
    })

    useTemplateStore.getState().duplicateLoop('loop-dup', 'body')
    const page = useTemplateStore.getState().template.page
    expect(page.length).toBe(2)
    expect(page[1].id).not.toBe('loop-dup')
    expect(page[1].x).toBe(30)
    expect(page[1].y).toBe(30)

    const duplicatedChild = page[1].elements?.[0]
    expect(duplicatedChild?.id).not.toBe('child-c1')
    expect(duplicatedChild?.elements?.[0]?.id).not.toBe('child-text')
  })
})
