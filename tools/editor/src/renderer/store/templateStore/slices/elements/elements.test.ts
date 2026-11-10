import { describe, it, expect, beforeEach } from 'vitest'
import { useTemplateStore } from '../../../templateStore'

describe('elements modular slice', () => {
  beforeEach(() => {
    useTemplateStore.setState({
      template: {
        version: '1.0',
        metadata: { name: 'Test Template', description: 'Test' },
        pageSettings: {
          size: 'A4',
          orientation: 'portrait',
          margins: { top: 30, right: 30, bottom: 30, left: 30 },
        },
        page: [
          {
            type: 'container',
            id: 'c1',
            x: 0,
            y: 0,
            width: '100%',
            height: 200,
            elements: [
              { type: 'text', id: 't1', x: 10, y: 10, width: 100, height: 20, value: 'Item 1' },
              { type: 'text', id: 't2', x: 10, y: 50, width: 100, height: 20, value: 'Item 2' },
              { type: 'text', id: 't3', x: 10, y: 90, width: 100, height: 20, value: 'Item 3' },
            ],
          },
        ],
        groups: [
          {
            id: 'g1',
            name: 'Group 1',
            elementIds: ['t1', 't2'],
            location: 'body',
          },
        ],
      },
      selectedElementIds: [],
      selectedContainerChildId: null,
      selectedContainerParentId: null,
      selectedLoopChildId: null,
      selectedLoopParentId: null,
      currentSection: 'body',
      copiedElements: null,
    })
  })

  describe('elementCrud', () => {
    it('adds a new element into container', () => {
      const { addElement } = useTemplateStore.getState()
      useTemplateStore.setState({ selectedElementIds: ['c1'] })

      addElement(
        { type: 'text', id: 't4', x: 0, y: 0, width: 100, height: 25, value: 'New text' },
        'body'
      )

      const container = useTemplateStore.getState().template.page.find((el) => el.id === 'c1')
      expect(container?.elements?.some((el) => el.id === 't4')).toBe(true)
    })

    it('updates element properties and renames element in groups', () => {
      const { updateElement } = useTemplateStore.getState()

      updateElement('t1', { id: 't1-renamed', value: 'Updated' }, 'body')

      const container = useTemplateStore.getState().template.page.find((el) => el.id === 'c1')
      expect(container?.elements?.some((el) => el.id === 't1-renamed')).toBe(true)
      expect(container?.elements?.find((el) => el.id === 't1-renamed')?.value).toBe('Updated')

      const group = useTemplateStore.getState().template.groups?.[0]
      expect(group?.elementIds).toContain('t1-renamed')
      expect(group?.elementIds).not.toContain('t1')
    })

    it('deletes element and removes it from groups', () => {
      const { deleteElement } = useTemplateStore.getState()

      deleteElement('t1', 'body')

      const container = useTemplateStore.getState().template.page.find((el) => el.id === 'c1')
      expect(container?.elements?.some((el) => el.id === 't1')).toBe(false)

      const group = useTemplateStore.getState().template.groups?.[0]
      expect(group?.elementIds).toEqual(['t2'])
    })

    it('toggles element visibility', () => {
      const { toggleElementVisibility } = useTemplateStore.getState()

      toggleElementVisibility('t2', 'body')
      let container = useTemplateStore.getState().template.page.find((el) => el.id === 'c1')
      expect(container?.elements?.find((el) => el.id === 't2')?.hidden).toBe(true)

      toggleElementVisibility('t2', 'body')
      container = useTemplateStore.getState().template.page.find((el) => el.id === 'c1')
      expect(container?.elements?.find((el) => el.id === 't2')?.hidden).toBe(false)
    })

    it('duplicates element with offset', () => {
      const { duplicateElement } = useTemplateStore.getState()

      duplicateElement!('t1', 'body')

      const container = useTemplateStore.getState().template.page.find((el) => el.id === 'c1')
      expect(container?.elements?.length).toBe(4)
      const duplicate = container?.elements?.[1]
      expect(duplicate?.x).toBe(30)
      expect(duplicate?.y).toBe(30)
      expect(duplicate?.value).toBe('Item 1')
    })

    it('copies and pastes element', () => {
      const { selectElement, copyElement, pasteElement } = useTemplateStore.getState()

      selectElement('t1', 'body')
      copyElement()
      expect(useTemplateStore.getState().copiedElements).not.toBeNull()

      pasteElement()
      const container = useTemplateStore.getState().template.page.find((el) => el.id === 'c1')
      expect(container?.elements?.length).toBe(4)
    })

    it('deletes selected elements and clears selection', () => {
      const { selectMultipleElements, deleteSelectedElements } = useTemplateStore.getState()

      selectMultipleElements(['t1', 't2'], 'body')
      deleteSelectedElements()

      const container = useTemplateStore.getState().template.page.find((el) => el.id === 'c1')
      expect(container?.elements?.length).toBe(1)
      expect(container?.elements?.[0]?.id).toBe('t3')
      expect(useTemplateStore.getState().selectedElementIds).toEqual([])
    })

    it('updates selected elements in bulk', () => {
      const { selectMultipleElements, updateSelectedElements } = useTemplateStore.getState()

      selectMultipleElements(['t1', 't2'], 'body')
      updateSelectedElements({ height: 40 })

      const container = useTemplateStore.getState().template.page.find((el) => el.id === 'c1')
      expect(container?.elements?.find((el) => el.id === 't1')?.height).toBe(40)
      expect(container?.elements?.find((el) => el.id === 't2')?.height).toBe(40)
      expect(container?.elements?.find((el) => el.id === 't3')?.height).toBe(20)
    })
  })

  describe('elementTransforms', () => {
    it('moves element up and down inside container', () => {
      const { moveElementDown, moveElementUp } = useTemplateStore.getState()

      moveElementDown('t1', 'body')
      let container = useTemplateStore.getState().template.page.find((el) => el.id === 'c1')
      expect(container?.elements?.map((el) => el.id)).toEqual(['t2', 't1', 't3'])

      moveElementUp('t1', 'body')
      container = useTemplateStore.getState().template.page.find((el) => el.id === 'c1')
      expect(container?.elements?.map((el) => el.id)).toEqual(['t1', 't2', 't3'])
    })

    it('moves element to top and bottom inside container', () => {
      const { moveElementToBottom, moveElementToTop } = useTemplateStore.getState()

      moveElementToBottom('t1', 'body')
      let container = useTemplateStore.getState().template.page.find((el) => el.id === 'c1')
      expect(container?.elements?.map((el) => el.id)).toEqual(['t2', 't3', 't1'])

      moveElementToTop('t1', 'body')
      container = useTemplateStore.getState().template.page.find((el) => el.id === 'c1')
      expect(container?.elements?.map((el) => el.id)).toEqual(['t1', 't2', 't3'])
    })

    it('reorders element to specific index', () => {
      const { reorderElement } = useTemplateStore.getState()

      reorderElement('t1', 2, 'body')
      const container = useTemplateStore.getState().template.page.find((el) => el.id === 'c1')
      expect(container?.elements?.map((el) => el.id)).toEqual(['t2', 't3', 't1'])
    })

    it('moves and resizes element via dedicated transform actions', () => {
      const { moveElementPosition, resizeElement } = useTemplateStore.getState()

      moveElementPosition!('t1', 50, 75, 'body')
      resizeElement!('t1', 180, 45, 'body')

      const container = useTemplateStore.getState().template.page.find((el) => el.id === 'c1')
      const t1 = container?.elements?.find((el) => el.id === 't1')
      expect(t1?.x).toBe(50)
      expect(t1?.y).toBe(75)
      expect(t1?.width).toBe(180)
      expect(t1?.height).toBe(45)
    })

    it('enforces container constraints on move and resize', () => {
      const { moveElementPosition, resizeElement } = useTemplateStore.getState()

      // Container x must remain 0, and y must be >= 0
      moveElementPosition!('c1', 100, -20, 'body')
      let container = useTemplateStore.getState().template.page.find((el) => el.id === 'c1')
      expect(container?.x).toBe(0)
      expect(container?.y).toBe(0)

      // Container width must remain 100% and height clamped to section limits
      resizeElement!('c1', 500, 5000, 'body')
      container = useTemplateStore.getState().template.page.find((el) => el.id === 'c1')
      expect(container?.width).toBe('100%')
      expect(container?.height).toBeLessThan(5000)
    })

    it('handles boundary conditions when moving elements at extremes', () => {
      const { moveElementUp, moveElementToTop, moveElementDown, moveElementToBottom, reorderElement } =
        useTemplateStore.getState()

      // Already at top, moveUp should be a no-op
      moveElementUp('t1', 'body')
      let container = useTemplateStore.getState().template.page.find((el) => el.id === 'c1')
      expect(container?.elements?.[0].id).toBe('t1')

      // Already at top, moveElementToTop should be a no-op
      moveElementToTop('t1', 'body')
      container = useTemplateStore.getState().template.page.find((el) => el.id === 'c1')
      expect(container?.elements?.[0].id).toBe('t1')

      // Already at bottom, moveDown and moveElementToBottom on t3 should be no-ops
      moveElementDown('t3', 'body')
      container = useTemplateStore.getState().template.page.find((el) => el.id === 'c1')
      expect(container?.elements?.[2].id).toBe('t3')

      moveElementToBottom('t3', 'body')
      container = useTemplateStore.getState().template.page.find((el) => el.id === 'c1')
      expect(container?.elements?.[2].id).toBe('t3')

      // Reorder to same index is no-op
      reorderElement('t1', 0, 'body')
      container = useTemplateStore.getState().template.page.find((el) => el.id === 'c1')
      expect(container?.elements?.map((el) => el.id)).toEqual(['t1', 't2', 't3'])
    })
  })

  describe('elementAlignment', () => {
    it('aligns multiple elements to left, center, right', () => {
      const { selectMultipleElements, alignSelectedElements } = useTemplateStore.getState()

      const resetElements = () => {
        useTemplateStore.setState((state) => ({
          template: {
            ...state.template,
            page: [
              {
                ...state.template.page[0],
                elements: [
                  { type: 'text', id: 't1', x: 10, y: 10, width: 100, height: 20 },
                  { type: 'text', id: 't2', x: 50, y: 40, width: 100, height: 20 },
                  { type: 'text', id: 't3', x: 100, y: 70, width: 100, height: 20 },
                ],
              },
            ],
          },
        }))
        selectMultipleElements(['t1', 't2', 't3'], 'body')
      }

      // Align Left -> minX = 10
      resetElements()
      alignSelectedElements!('left')
      let container = useTemplateStore.getState().template.page.find((el) => el.id === 'c1')
      expect(container?.elements?.map((el) => el.x)).toEqual([10, 10, 10])

      // Align Right -> maxX = 200, width = 100 -> newX = 100
      resetElements()
      alignSelectedElements!('right')
      container = useTemplateStore.getState().template.page.find((el) => el.id === 'c1')
      expect(container?.elements?.map((el) => el.x)).toEqual([100, 100, 100])

      // Align Center -> center = (10 + 200) / 2 = 105 -> newX = 105 - 50 = 55
      resetElements()
      alignSelectedElements!('center')
      container = useTemplateStore.getState().template.page.find((el) => el.id === 'c1')
      expect(container?.elements?.map((el) => el.x)).toEqual([55, 55, 55])
    })

    it('aligns multiple elements to top, middle, bottom', () => {
      const { selectMultipleElements, alignSelectedElements } = useTemplateStore.getState()

      const resetElements = () => {
        useTemplateStore.setState((state) => ({
          template: {
            ...state.template,
            page: [
              {
                ...state.template.page[0],
                elements: [
                  { type: 'text', id: 't1', x: 10, y: 20, width: 100, height: 20 },
                  { type: 'text', id: 't2', x: 40, y: 60, width: 100, height: 20 },
                  { type: 'text', id: 't3', x: 70, y: 100, width: 100, height: 20 },
                ],
              },
            ],
          },
        }))
        selectMultipleElements(['t1', 't2', 't3'], 'body')
      }

      // Align Top -> minY = 20
      resetElements()
      alignSelectedElements!('top')
      let container = useTemplateStore.getState().template.page.find((el) => el.id === 'c1')
      expect(container?.elements?.map((el) => el.y)).toEqual([20, 20, 20])

      // Align Bottom -> maxY = 120, height = 20 -> newY = 100
      resetElements()
      alignSelectedElements!('bottom')
      container = useTemplateStore.getState().template.page.find((el) => el.id === 'c1')
      expect(container?.elements?.map((el) => el.y)).toEqual([100, 100, 100])

      // Align Middle -> centerY = (20 + 120) / 2 = 70 -> newY = 70 - 10 = 60
      resetElements()
      alignSelectedElements!('middle')
      container = useTemplateStore.getState().template.page.find((el) => el.id === 'c1')
      expect(container?.elements?.map((el) => el.y)).toEqual([60, 60, 60])
    })

    it('distributes elements vertically with equal spacing', () => {
      const { selectMultipleElements, distributeSelectedElements } = useTemplateStore.getState()

      useTemplateStore.setState((state) => ({
        template: {
          ...state.template,
          page: [
            {
              ...state.template.page[0],
              elements: [
                { type: 'text', id: 't1', x: 10, y: 0, width: 100, height: 20 },
                { type: 'text', id: 't2', x: 10, y: 25, width: 100, height: 20 },
                { type: 'text', id: 't3', x: 10, y: 100, width: 100, height: 20 },
              ],
            },
          ],
        },
      }))

      selectMultipleElements(['t1', 't2', 't3'], 'body')
      distributeSelectedElements!('vertical')

      const container = useTemplateStore.getState().template.page.find((el) => el.id === 'c1')
      const ys = container?.elements?.map((el) => el.y)
      expect(ys?.[0]).toBe(0)
      expect(ys?.[1]).toBe(50)
      expect(ys?.[2]).toBe(100)
    })
  })

  describe('multi-page and pageBreak element additions', () => {
    it('allows adding and sizing a container after page_break on page 2', () => {
      const { addElement } = useTemplateStore.getState()

      // Add page_break (auto-creates next page container)
      addElement({ type: 'page_break', id: 'pb1', x: 0, y: 0 }, 'body')

      const page = useTemplateStore.getState().template.page
      const c2 = page.find((el) => el.id !== 'c1' && el.type === 'container')
      expect(c2).toBeDefined()
      // Section height for A4 with margins 30/30 is 842 - 60 = 782
      expect(c2!.y).toBe(782)
      // Height should be normal default container height (200), not crushed to 30
      expect(c2!.height).toBe(200)
    })

    it('allows adding child elements to container on page 2 after page_break', () => {
      const { addElement } = useTemplateStore.getState()

      addElement({ type: 'page_break', id: 'pb1', x: 0, y: 0 }, 'body')
      const pageBefore = useTemplateStore.getState().template.page
      const c2 = pageBefore.find((el) => el.id !== 'c1' && el.type === 'container')
      expect(c2).toBeDefined()

      useTemplateStore.setState({ selectedElementIds: [c2!.id] })
      addElement(
        { type: 'text', id: 't-page2', x: 20, y: 20, width: 200, height: 30, value: 'Page 2 Text' },
        'body'
      )

      const pageAfter = useTemplateStore.getState().template.page
      const c2After = pageAfter.find((el) => el.id === c2!.id)
      expect(c2After?.elements?.some((el) => el.id === 't-page2')).toBe(true)
    })

    it('auto-creates container on next page when adding element with page_break selected', () => {
      const { addElement } = useTemplateStore.getState()

      addElement({ type: 'page_break', id: 'pb1', x: 0, y: 0 }, 'body')
      useTemplateStore.setState({ selectedElementIds: ['pb1'] })

      addElement(
        { type: 'text', id: 't-after-pb', x: 10, y: 10, width: 150, height: 25, value: 'Hello Page 2' },
        'body'
      )

      const page = useTemplateStore.getState().template.page
      const containersOnPage2 = page.filter((el) => el.id !== 'c1' && el.type === 'container')
      expect(containersOnPage2.length).toBeGreaterThan(0)
      expect(containersOnPage2.some((c) => c.elements?.some((el) => el.id === 't-after-pb'))).toBe(true)
    })
  })
})
