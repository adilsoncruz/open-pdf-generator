import { describe, it, expect, beforeEach } from 'vitest'
import { useTemplateStore } from '../../../templateStore'

describe('loops modular slice', () => {
  beforeEach(() => {
    useTemplateStore.setState({
      template: {
        version: '1.0',
        metadata: { name: 'Loop Test Template', description: 'Test' },
        pageSettings: {
          size: 'A4',
          orientation: 'portrait',
          margins: { top: 30, right: 30, bottom: 30, left: 30 },
          header: {
            height: 50,
            elements: [
              {
                type: 'loop',
                id: 'header-loop',
                x: 0,
                y: 0,
                width: 500,
                height: 40,
                elements: [
                  {
                    type: 'text',
                    id: 'header-child-1',
                    x: 5,
                    y: 5,
                    width: 100,
                    height: 20,
                    value: 'Header Item',
                  },
                ],
              },
            ],
          },
        },
        page: [
          {
            type: 'loop',
            id: 'loop-1',
            x: 10,
            y: 20,
            width: 400,
            height: 150,
            elements: [
              {
                type: 'text',
                id: 'child-1',
                x: 15,
                y: 25,
                width: 100,
                height: 20,
                value: 'Item 1',
                style: { color: '#000000' },
              },
              {
                type: 'text',
                id: 'child-2',
                x: 15,
                y: 50,
                width: 100,
                height: 20,
                value: 'Item 2',
              },
            ],
          },
        ],
      },
      selectedElementIds: [],
      selectedElementLocation: 'body',
      currentSection: 'body',
      selectedLoopChildId: null,
      selectedLoopParentId: null,
      selectedContainerChildId: null,
      selectedContainerParentId: null,
      isDirty: false,
    })
  })

  describe('loopChildOperations', () => {
    it('adds an element into a loop', () => {
      const { addElementToLoop } = useTemplateStore.getState()
      addElementToLoop('loop-1', {
        type: 'text',
        id: 'child-3',
        x: 15,
        y: 75,
        width: 100,
        height: 20,
        value: 'Item 3',
      })

      const state = useTemplateStore.getState()
      const loop = state.template.page.find((el) => el.id === 'loop-1')
      expect(loop?.elements?.map((el) => el.id)).toEqual(['child-1', 'child-2', 'child-3'])
      expect(state.isDirty).toBe(true)
    })

    it('silently ignores adding page_break to loop', () => {
      const { addElementToLoop } = useTemplateStore.getState()
      addElementToLoop('loop-1', {
        type: 'page_break',
        id: 'pb-1',
        x: 0,
        y: 0,
      })

      const state = useTemplateStore.getState()
      const loop = state.template.page.find((el) => el.id === 'loop-1')
      expect(loop?.elements?.map((el) => el.id)).toEqual(['child-1', 'child-2'])
    })

    it('adds element to a loop located in header', () => {
      const { addElementToLoop } = useTemplateStore.getState()
      addElementToLoop(
        'header-loop',
        {
          type: 'text',
          id: 'header-child-2',
          x: 5,
          y: 25,
          width: 100,
          height: 15,
          value: 'Header 2',
        },
        'header'
      )

      const state = useTemplateStore.getState()
      const headerLoop = state.template.pageSettings.header?.elements.find(
        (el) => el.id === 'header-loop'
      )
      expect(headerLoop?.elements?.map((el) => el.id)).toEqual([
        'header-child-1',
        'header-child-2',
      ])
    })

    it('updates child element in loop and merges style', () => {
      const { updateLoopChildElement } = useTemplateStore.getState()
      useTemplateStore.setState({ selectedLoopChildId: 'child-1' })

      updateLoopChildElement('loop-1', 'child-1', {
        value: 'Updated 1',
        style: { fontSize: 14 },
      })

      const state = useTemplateStore.getState()
      const loop = state.template.page.find((el) => el.id === 'loop-1')
      const child = loop?.elements?.find((el) => el.id === 'child-1')
      expect(child?.value).toBe('Updated 1')
      expect(child?.style).toEqual({ color: '#000000', fontSize: 14 })
      expect(state.selectedLoopChildId).toBe('child-1')
    })

    it('updates selectedLoopChildId when child ID is renamed', () => {
      const { updateLoopChildElement } = useTemplateStore.getState()
      useTemplateStore.setState({ selectedLoopChildId: 'child-1' })

      updateLoopChildElement('loop-1', 'child-1', {
        id: 'child-renamed',
        value: 'Renamed',
      })

      const state = useTemplateStore.getState()
      const loop = state.template.page.find((el) => el.id === 'loop-1')
      expect(loop?.elements?.some((el) => el.id === 'child-renamed')).toBe(true)
      expect(state.selectedLoopChildId).toBe('child-renamed')
    })

    it('deletes child element from loop and resets selection pointers', () => {
      const { deleteLoopChildElement } = useTemplateStore.getState()
      useTemplateStore.setState({
        selectedLoopChildId: 'child-1',
        selectedLoopParentId: 'loop-1',
      })

      deleteLoopChildElement('loop-1', 'child-1')

      const state = useTemplateStore.getState()
      const loop = state.template.page.find((el) => el.id === 'loop-1')
      expect(loop?.elements?.map((el) => el.id)).toEqual(['child-2'])
      expect(state.selectedLoopChildId).toBeNull()
      expect(state.selectedLoopParentId).toBeNull()
    })

    it('reorders children within a loop', () => {
      const { reorderLoopChildren } = useTemplateStore.getState()
      reorderLoopChildren('loop-1', 0, 1)

      const state = useTemplateStore.getState()
      const loop = state.template.page.find((el) => el.id === 'loop-1')
      expect(loop?.elements?.map((el) => el.id)).toEqual(['child-2', 'child-1'])
      expect(state.isDirty).toBe(true)
    })
  })

  describe('loopTransforms', () => {
    it('moves loop position by deltaX and deltaY', () => {
      const { moveLoop } = useTemplateStore.getState()
      moveLoop('loop-1', 20, 30)

      const state = useTemplateStore.getState()
      const loop = state.template.page.find((el) => el.id === 'loop-1')
      expect(loop?.x).toBe(30)
      expect(loop?.y).toBe(50)
      expect(state.isDirty).toBe(true)
    })

    it('resizes loop width and height', () => {
      const { resizeLoop } = useTemplateStore.getState()
      resizeLoop('loop-1', 450, 200)

      const state = useTemplateStore.getState()
      const loop = state.template.page.find((el) => el.id === 'loop-1')
      expect(loop?.width).toBe(450)
      expect(loop?.height).toBe(200)
      expect(state.isDirty).toBe(true)
    })

    it('duplicates loop with cloned children and offset coordinates', () => {
      const { duplicateLoop } = useTemplateStore.getState()
      duplicateLoop('loop-1')

      const state = useTemplateStore.getState()
      expect(state.template.page.length).toBe(2)

      const original = state.template.page[0]
      const duplicated = state.template.page[1]

      expect(duplicated.id).not.toBe(original.id)
      expect(duplicated.x).toBe((original.x || 0) + 20)
      expect(duplicated.y).toBe((original.y || 0) + 20)
      expect(duplicated.elements?.length).toBe(original.elements?.length)
      expect(duplicated.elements?.[0].id).not.toBe(original.elements?.[0].id)
      expect(state.selectedElementIds).toEqual([duplicated.id])
      expect(state.isDirty).toBe(true)
    })
  })
})
