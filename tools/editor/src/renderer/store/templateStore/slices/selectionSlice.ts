import type { SetTemplateStore, GetTemplateStore } from './types'
import { findParentContainer, findParentLoop, flattenElements } from '../helpers'
import type { Element, ElementLocation } from '../types'

export interface SelectionSlice {
  selectedElementIds: string[]
  selectedElementLocation: ElementLocation
  selectedGroupId: string | null
  selectedLoopChildId: string | null
  selectedLoopParentId: string | null
  expandedLoopIds: string[]
  selectedContainerChildId: string | null
  selectedContainerParentId: string | null
  expandedContainerIds: string[]

  selectElement: (id: string | null, location?: ElementLocation) => void
  toggleElementSelection: (id: string, location?: ElementLocation) => void
  selectMultipleElements: (ids: string[], location?: ElementLocation) => void
  clearSelection: () => void
  selectAllElements: () => void
  selectGroup: (groupId: string | null, location?: ElementLocation) => void
  selectLoopChild: (loopId: string, childId: string, location?: ElementLocation) => void
  selectContainerChild: (containerId: string, childId: string, location?: ElementLocation) => void
  clearLoopChildSelection: () => void
  clearContainerChildSelection: () => void
  toggleLoopExpanded: (loopId: string) => void
  toggleContainerExpanded: (containerId: string) => void
}

export const createSelectionSlice = (
  set: SetTemplateStore,
  _get: GetTemplateStore
): SelectionSlice => ({
  selectedElementIds: [],
  selectedElementLocation: 'body',
  selectedGroupId: null,
  selectedLoopChildId: null,
  selectedLoopParentId: null,
  expandedLoopIds: [],
  selectedContainerChildId: null,
  selectedContainerParentId: null,
  expandedContainerIds: [],

  selectElement: (id, location = 'body') =>
    set((state) => {
      if (!id) {
        return {
          selectedElementIds: [],
          selectedElementLocation: location,
          selectedGroupId: null,
          selectedLoopChildId: null,
          selectedLoopParentId: null,
          selectedContainerChildId: null,
          selectedContainerParentId: null,
        }
      }

      let containerChildId: string | null = null
      let containerParentId: string | null = null
      let loopChildId: string | null = null
      let loopParentId: string | null = null

      const parentContainer = findParentContainer(state.template, id)
      if (parentContainer) {
        containerChildId = id
        containerParentId = parentContainer.id
      }
      const parentLoop = findParentLoop(state.template, id)
      if (parentLoop) {
        loopChildId = id
        loopParentId = parentLoop.id
      }

      return {
        selectedElementIds: [id],
        selectedElementLocation: location,
        selectedGroupId: null,
        selectedContainerChildId: containerChildId,
        selectedContainerParentId: containerParentId,
        selectedLoopChildId: loopChildId,
        selectedLoopParentId: loopParentId,
      }
    }),

  toggleElementSelection: (id, location) =>
    set((state) => {
      const loc = location || state.selectedElementLocation
      const isSelected = state.selectedElementIds.includes(id)
      const nextSelected = isSelected
        ? state.selectedElementIds.filter((selectedId) => selectedId !== id)
        : [...state.selectedElementIds, id]

      let containerChildId: string | null = null
      let containerParentId: string | null = null
      let loopChildId: string | null = null
      let loopParentId: string | null = null

      if (nextSelected.length === 1) {
        const singleId = nextSelected[0]
        const parentContainer = findParentContainer(state.template, singleId)
        if (parentContainer) {
          containerChildId = singleId
          containerParentId = parentContainer.id
        }
        const parentLoop = findParentLoop(state.template, singleId)
        if (parentLoop) {
          loopChildId = singleId
          loopParentId = parentLoop.id
        }
      }

      return {
        selectedElementIds: nextSelected,
        selectedElementLocation: loc,
        selectedGroupId: null,
        selectedContainerChildId: containerChildId,
        selectedContainerParentId: containerParentId,
        selectedLoopChildId: loopChildId,
        selectedLoopParentId: loopParentId,
      }
    }),

  selectMultipleElements: (ids, location = 'body') =>
    set({
      selectedElementIds: ids,
      selectedElementLocation: location,
      selectedGroupId: null,
      selectedLoopChildId: null,
      selectedLoopParentId: null,
      selectedContainerChildId: null,
      selectedContainerParentId: null,
    }),

  clearSelection: () =>
    set({
      selectedElementIds: [],
      selectedGroupId: null,
      selectedLoopChildId: null,
      selectedLoopParentId: null,
      selectedContainerChildId: null,
      selectedContainerParentId: null,
    }),

  selectAllElements: () =>
    set((state) => {
      const { currentSection, template } = state
      let elements: Element[] = []

      if (currentSection === 'header' && template.pageSettings.header) {
        elements = template.pageSettings.header.elements
      } else if (currentSection === 'footer' && template.pageSettings.footer) {
        elements = template.pageSettings.footer.elements
      } else if (currentSection === 'bodyBackground' && template.pageSettings.bodyBackground) {
        elements = template.pageSettings.bodyBackground.elements
      } else if (currentSection === 'summary' && template.summaryPage) {
        elements = template.summaryPage.elements
      } else {
        elements = template.page
      }

      const flat = flattenElements(elements)

      return {
        selectedElementIds: flat.map((el) => el.id),
        selectedElementLocation: currentSection,
        selectedGroupId: null,
        selectedContainerChildId: null,
        selectedContainerParentId: null,
        selectedLoopChildId: null,
        selectedLoopParentId: null,
      }
    }),

  selectGroup: (groupId, location = 'body') =>
    set({
      selectedGroupId: groupId,
      selectedElementIds: [],
      selectedElementLocation: location,
    }),

  selectLoopChild: (loopId, childId, location) =>
    set((state) => ({
      selectedLoopParentId: loopId,
      selectedLoopChildId: childId,
      selectedElementIds: [childId],
      selectedElementLocation: location || state.currentSection,
      selectedGroupId: null,
      selectedContainerChildId: null,
      selectedContainerParentId: null,
    })),

  selectContainerChild: (containerId, childId, location) => {
    set((state) => ({
      selectedContainerParentId: containerId,
      selectedContainerChildId: childId,
      selectedElementIds: [childId],
      selectedElementLocation: location || state.currentSection,
      selectedGroupId: null,
      selectedLoopChildId: null,
      selectedLoopParentId: null,
    }))
  },

  clearLoopChildSelection: () =>
    set({
      selectedLoopChildId: null,
      selectedLoopParentId: null,
      selectedContainerChildId: null,
      selectedContainerParentId: null,
    }),

  clearContainerChildSelection: () =>
    set({
      selectedContainerChildId: null,
      selectedContainerParentId: null,
      selectedLoopChildId: null,
      selectedLoopParentId: null,
    }),

  toggleLoopExpanded: (loopId) =>
    set((state) => ({
      expandedLoopIds: state.expandedLoopIds.includes(loopId)
        ? state.expandedLoopIds.filter((id) => id !== loopId)
        : [...state.expandedLoopIds, loopId],
    })),

  toggleContainerExpanded: (containerId) =>
    set((state) => ({
      expandedContainerIds: state.expandedContainerIds.includes(containerId)
        ? state.expandedContainerIds.filter((id) => id !== containerId)
        : [...state.expandedContainerIds, containerId],
    })),
})
