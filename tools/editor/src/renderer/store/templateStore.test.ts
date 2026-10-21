import { describe, it, expect, beforeEach } from 'vitest'
import { useTemplateStore, flattenElements, findParentContainer } from './templateStore'

describe('templateStore multi-selection', () => {
  beforeEach(() => {
    useTemplateStore.setState({
      template: {
        version: '1.0',
        metadata: { name: 'Test Template', description: 'Test' },
        pageSettings: {
          size: 'A4',
          orientation: 'portrait',
          margins: { top: 36, right: 36, bottom: 36, left: 36 },
        },
        page: [
          {
            type: 'container',
            id: 'c1',
            x: 0,
            y: 0,
            width: '100%',
            height: 100,
            elements: [
              { type: 'text', id: 't1', x: 10, y: 10, width: 100, height: 20, value: 'Child 1' },
              { type: 'text', id: 't2', x: 10, y: 40, width: 100, height: 20, value: 'Child 2' },
            ],
          },
          { type: 'text', id: 'root1', x: 0, y: 120, width: 200, height: 30, value: 'Root 1' },
        ],
      },
      selectedElementIds: [],
      selectedContainerChildId: null,
      selectedContainerParentId: null,
      selectedLoopChildId: null,
      selectedLoopParentId: null,
      currentSection: 'body',
    })
  })

  it('flattens elements correctly including container children', () => {
    const page = useTemplateStore.getState().template.page
    const flat = flattenElements(page)
    expect(flat.map((el) => el.id)).toEqual(['c1', 't1', 't2', 'root1'])
  })

  it('finds parent container for child element', () => {
    const template = useTemplateStore.getState().template
    const parent = findParentContainer(template, 't1')
    expect(parent?.id).toBe('c1')

    const rootParent = findParentContainer(template, 'root1')
    expect(rootParent).toBeNull()
  })

  it('selects single container child', () => {
    const { selectContainerChild } = useTemplateStore.getState()
    selectContainerChild('c1', 't1', 'body')

    const state = useTemplateStore.getState()
    expect(state.selectedElementIds).toEqual(['t1'])
    expect(state.selectedContainerChildId).toBe('t1')
    expect(state.selectedContainerParentId).toBe('c1')
  })

  it('toggles multi-selection across container children and root elements', () => {
    const { selectContainerChild, toggleElementSelection } = useTemplateStore.getState()

    selectContainerChild('c1', 't1', 'body')
    toggleElementSelection('t2', 'body')

    let state = useTemplateStore.getState()
    expect(state.selectedElementIds).toEqual(['t1', 't2'])
    // When > 1 element selected, child pointers are cleared
    expect(state.selectedContainerChildId).toBeNull()
    expect(state.selectedContainerParentId).toBeNull()

    // Add root1 to selection
    toggleElementSelection('root1', 'body')
    state = useTemplateStore.getState()
    expect(state.selectedElementIds).toEqual(['t1', 't2', 'root1'])

    // Deselect t1 and root1, leaving only t2
    toggleElementSelection('t1', 'body')
    toggleElementSelection('root1', 'body')
    state = useTemplateStore.getState()
    expect(state.selectedElementIds).toEqual(['t2'])
    // Since only 1 container child remains, pointers are restored
    expect(state.selectedContainerChildId).toBe('t2')
    expect(state.selectedContainerParentId).toBe('c1')
  })

  it('updates all selected elements across containers and root', () => {
    const { selectMultipleElements, updateSelectedElements } = useTemplateStore.getState()
    selectMultipleElements(['t1', 't2', 'root1'], 'body')

    updateSelectedElements({ style: { color: '#ff0000' } })

    const template = useTemplateStore.getState().template
    const container = template.page.find((el) => el.id === 'c1')
    const t1 = container?.elements?.find((el) => el.id === 't1')
    const t2 = container?.elements?.find((el) => el.id === 't2')
    const root1 = template.page.find((el) => el.id === 'root1')

    expect(t1?.style?.color).toBe('#ff0000')
    expect(t2?.style?.color).toBe('#ff0000')
    expect(root1?.style?.color).toBe('#ff0000')
  })

  it('deletes all selected elements including container children', () => {
    const { selectMultipleElements, deleteSelectedElements } = useTemplateStore.getState()
    selectMultipleElements(['t1', 'root1'], 'body')

    deleteSelectedElements()

    const state = useTemplateStore.getState()
    expect(state.selectedElementIds).toEqual([])

    const flat = flattenElements(state.template.page)
    expect(flat.map((el) => el.id)).toEqual(['c1', 't2'])
  })

  it('creates and ungroups groups recursively on container children', () => {
    const { createGroup, ungroupElements } = useTemplateStore.getState()
    
    // Group t1 and t2 inside container c1
    createGroup('Header Texts', ['t1', 't2'], 'body')

    let state = useTemplateStore.getState()
    expect(state.template.groups?.length).toBe(1)
    const grp = state.template.groups![0]
    expect(grp.name).toBe('Header Texts')
    expect(grp.elementIds).toEqual(['t1', 't2'])

    // Elements inside container c1 should now have groupId set
    const container = state.template.page.find((el) => el.id === 'c1')
    expect(container?.elements?.find((el) => el.id === 't1')?.groupId).toBe(grp.id)
    expect(container?.elements?.find((el) => el.id === 't2')?.groupId).toBe(grp.id)

    // Ungroup elements
    ungroupElements(grp.id, 'body')

    state = useTemplateStore.getState()
    expect(state.template.groups?.length).toBe(0)
    const updatedContainer = state.template.page.find((el) => el.id === 'c1')
    expect(updatedContainer?.elements?.find((el) => el.id === 't1')?.groupId).toBeUndefined()
    expect(updatedContainer?.elements?.find((el) => el.id === 't2')?.groupId).toBeUndefined()
  })

  it('updates and removes watermark configuration in pageSettings', () => {
    const { updateWatermark, removeWatermark } = useTemplateStore.getState()

    expect(useTemplateStore.getState().template.pageSettings.watermark).toBeUndefined()

    // Update watermark
    updateWatermark({ text: 'DRAFT', color: '#ff0000', rotation: 30, opacity: 0.15, repeat: true, spacingX: 180, spacingY: 140 })

    let watermark = useTemplateStore.getState().template.pageSettings.watermark
    expect(watermark).toBeDefined()
    expect(watermark?.type).toBe('text')
    expect(watermark?.text).toBe('DRAFT')
    expect(watermark?.color).toBe('#ff0000')
    expect(watermark?.rotation).toBe(30)
    expect(watermark?.opacity).toBe(0.15)
    expect(watermark?.repeat).toBe(true)
    expect(watermark?.spacingX).toBe(180)
    expect(watermark?.spacingY).toBe(140)

    // Remove watermark
    removeWatermark()

    watermark = useTemplateStore.getState().template.pageSettings.watermark
    expect(watermark).toBeUndefined()
  })
})
