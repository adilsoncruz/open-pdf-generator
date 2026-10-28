import { describe, it, expect, beforeEach } from 'vitest'
import { useTemplateStore } from '../../../templateStore'

describe('groups modular slice', () => {
  beforeEach(() => {
    useTemplateStore.setState({
      template: {
        version: '1.0',
        metadata: { name: 'Group Test Template', description: 'Test' },
        pageSettings: {
          size: 'A4',
          orientation: 'portrait',
          margins: { top: 30, right: 30, bottom: 30, left: 30 },
          header: {
            height: 50,
            elements: [
              { type: 'text', id: 'h1', x: 10, y: 10, width: 100, height: 20, value: 'Header Text' },
            ],
            groups: [],
          },
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
          { type: 'text', id: 't4', x: 50, y: 220, width: 120, height: 30, value: 'Item 4' },
        ],
        groups: [
          {
            id: 'g1',
            name: 'Group 1',
            elementIds: ['t1', 't2'],
            location: 'body',
            collapsed: false,
          },
        ],
      },
      selectedGroupId: null,
      selectedElementIds: [],
      selectedElementLocation: 'body',
      currentSection: 'body',
      isDirty: false,
    })
  })

  describe('groupOperations', () => {
    it('creates a new group in body and sets selectedGroupId', () => {
      const { createGroup } = useTemplateStore.getState()
      createGroup('Items 3 and 4', ['t3', 't4'], 'body')

      const state = useTemplateStore.getState()
      expect(state.template.groups?.length).toBe(2)
      const created = state.template.groups?.find((g) => g.name === 'Items 3 and 4')
      expect(created).toBeDefined()
      expect(state.selectedGroupId).toBe(created?.id)
      expect(state.isDirty).toBe(true)

      // t3 in container c1 and t4 on page should have groupId set
      const c1 = state.template.page.find((el) => el.id === 'c1')
      expect(c1?.elements?.find((el) => el.id === 't3')?.groupId).toBe(created?.id)
      expect(state.template.page.find((el) => el.id === 't4')?.groupId).toBe(created?.id)
    })

    it('creates a group in header section', () => {
      const { createGroup } = useTemplateStore.getState()
      createGroup('Header Group', ['h1'], 'header')

      const state = useTemplateStore.getState()
      const headerGroups = state.template.pageSettings.header?.groups
      expect(headerGroups?.length).toBe(1)
      expect(headerGroups?.[0].name).toBe('Header Group')
      expect(state.template.pageSettings.header?.elements[0].groupId).toBe(headerGroups?.[0].id)
    })

    it('updates an existing group name and properties', () => {
      const { updateGroup } = useTemplateStore.getState()
      updateGroup('g1', { name: 'Renamed Group', printCondition: 'test == 1' }, 'body')

      const state = useTemplateStore.getState()
      const group = state.template.groups?.find((g) => g.id === 'g1')
      expect(group?.name).toBe('Renamed Group')
      expect(group?.printCondition).toBe('test == 1')
      expect(state.isDirty).toBe(true)
    })

    it('deletes a group and unassigns groupId from elements', () => {
      const { deleteGroup } = useTemplateStore.getState()
      // First ensure t1 has groupId g1
      const c1Before = useTemplateStore.getState().template.page.find((el) => el.id === 'c1')
      c1Before!.elements![0].groupId = 'g1'

      deleteGroup('g1', 'body')

      const state = useTemplateStore.getState()
      expect(state.template.groups?.some((g) => g.id === 'g1')).toBe(false)
      const c1After = state.template.page.find((el) => el.id === 'c1')
      expect(c1After?.elements?.find((el) => el.id === 't1')?.groupId).toBeUndefined()
      expect(state.isDirty).toBe(true)
    })

    it('ungroupElements delegates to deleteGroup', () => {
      const { ungroupElements } = useTemplateStore.getState()
      ungroupElements('g1', 'body')

      const state = useTemplateStore.getState()
      expect(state.template.groups?.some((g) => g.id === 'g1')).toBe(false)
    })

    it('adds elements to existing group with addToGroup', () => {
      const { addToGroup } = useTemplateStore.getState()
      addToGroup('g1', ['t3'], 'body')

      const state = useTemplateStore.getState()
      const group = state.template.groups?.find((g) => g.id === 'g1')
      expect(group?.elementIds).toEqual(['t1', 't2', 't3'])

      const c1 = state.template.page.find((el) => el.id === 'c1')
      expect(c1?.elements?.find((el) => el.id === 't3')?.groupId).toBe('g1')
    })

    it('removes elements from existing group with removeFromGroup', () => {
      const { removeFromGroup } = useTemplateStore.getState()
      removeFromGroup('g1', ['t1'], 'body')

      const state = useTemplateStore.getState()
      const group = state.template.groups?.find((g) => g.id === 'g1')
      expect(group?.elementIds).toEqual(['t2'])

      const c1 = state.template.page.find((el) => el.id === 'c1')
      expect(c1?.elements?.find((el) => el.id === 't1')?.groupId).toBeUndefined()
    })
  })

  describe('groupTransforms', () => {
    it('toggles group collapse state', () => {
      const { toggleGroupCollapse } = useTemplateStore.getState()
      toggleGroupCollapse('g1', 'body')

      let state = useTemplateStore.getState()
      expect(state.template.groups?.find((g) => g.id === 'g1')?.collapsed).toBe(true)

      toggleGroupCollapse('g1', 'body')
      state = useTemplateStore.getState()
      expect(state.template.groups?.find((g) => g.id === 'g1')?.collapsed).toBe(false)
    })

    it('toggles group visibility', () => {
      const { toggleGroupVisibility } = useTemplateStore.getState()
      toggleGroupVisibility('g1', 'body')

      let state = useTemplateStore.getState()
      let c1 = state.template.page.find((el) => el.id === 'c1')
      expect(c1?.elements?.find((el) => el.id === 't1')?.hidden).toBe(true)
      expect(c1?.elements?.find((el) => el.id === 't2')?.hidden).toBe(true)

      toggleGroupVisibility('g1', 'body')
      state = useTemplateStore.getState()
      c1 = state.template.page.find((el) => el.id === 'c1')
      expect(c1?.elements?.find((el) => el.id === 't1')?.hidden).toBe(false)
      expect(c1?.elements?.find((el) => el.id === 't2')?.hidden).toBe(false)
    })

    it('reorders groups in list', () => {
      const { createGroup, reorderGroup } = useTemplateStore.getState()
      createGroup('Group 2', ['t4'], 'body')

      let state = useTemplateStore.getState()
      expect(state.template.groups?.map((g) => g.name)).toEqual(['Group 1', 'Group 2'])

      reorderGroup('g1', 1, 'body')
      state = useTemplateStore.getState()
      expect(state.template.groups?.map((g) => g.name)).toEqual(['Group 2', 'Group 1'])
    })

    it('moves group elements by deltaX and deltaY', () => {
      const { moveGroup } = useTemplateStore.getState()
      moveGroup('g1', 15, 25, 'body')

      const state = useTemplateStore.getState()
      const c1 = state.template.page.find((el) => el.id === 'c1')
      const t1 = c1?.elements?.find((el) => el.id === 't1')
      const t2 = c1?.elements?.find((el) => el.id === 't2')

      expect(t1?.x).toBe(25)
      expect(t1?.y).toBe(35)
      expect(t2?.x).toBe(25)
      expect(t2?.y).toBe(75)
    })

    it('resizes group elements with scaling factor', () => {
      const { resizeGroup } = useTemplateStore.getState()
      resizeGroup('g1', 2, 1.5, 'body')

      const state = useTemplateStore.getState()
      const c1 = state.template.page.find((el) => el.id === 'c1')
      const t1 = c1?.elements?.find((el) => el.id === 't1')
      const t2 = c1?.elements?.find((el) => el.id === 't2')

      expect(t1?.width).toBe(200)
      expect(t1?.height).toBe(30)
      expect(t2?.width).toBe(200)
      expect(t2?.height).toBe(30)
    })

    it('duplicates a group and its elements', () => {
      const { duplicateGroup } = useTemplateStore.getState()
      duplicateGroup('g1', 'body')

      const state = useTemplateStore.getState()
      expect(state.template.groups?.length).toBe(2)
      const duplicated = state.template.groups?.find((g) => g.name === 'Group 1 (Copy)')
      expect(duplicated).toBeDefined()
      expect(duplicated?.id).not.toBe('g1')
      expect(duplicated?.elementIds.length).toBe(2)
      expect(state.selectedGroupId).toBe(duplicated?.id)

      // Elements should have been cloned with +20 offset
      const c1 = state.template.page.find((el) => el.id === 'c1')
      const clonedT1 = c1?.elements?.find((el) => el.groupId === duplicated?.id && el.value === 'Item 1')
      expect(clonedT1).toBeDefined()
      expect(clonedT1?.x).toBe(30)
      expect(clonedT1?.y).toBe(30)
    })
  })
})
