import type { SetTemplateStore, GetTemplateStore } from '../types'
import { saveToHistory } from '../../helpers'
import type { ElementGroup, ElementLocation } from '../../types'
import {
  applyGroupIdToElements,
  removeGroupIdFromElements,
  updateSectionGroups,
  updateSectionElementsAndGroups,
} from './groupShared'

export interface GroupOperationsSlice {
  createGroup: (name: string, elementIds: string[], location?: ElementLocation) => void
  updateGroup: (groupId: string, updates: Partial<ElementGroup>, location?: ElementLocation) => void
  deleteGroup: (groupId: string, location?: ElementLocation) => void
  ungroupElements: (groupId: string, location?: ElementLocation) => void
  addToGroup: (groupId: string, elementIds: string[], location?: ElementLocation) => void
  removeFromGroup: (groupId: string, elementIds: string[], location?: ElementLocation) => void
}

export const createGroupOperations = (
  set: SetTemplateStore,
  get: GetTemplateStore
): GroupOperationsSlice => ({
  createGroup: (name, elementIds, location = 'body') =>
    set((state) => {
      const groupId = `group-${Date.now()}`
      const newGroup: ElementGroup = {
        id: groupId,
        name,
        elementIds,
        location,
        collapsed: false,
        printCondition: undefined,
      }

      const historyState = saveToHistory(state, state.template)
      const newTemplate = updateSectionElementsAndGroups(
        state.template,
        location,
        (elements) => applyGroupIdToElements(elements, elementIds, groupId),
        (groups) => [...groups, newGroup]
      )

      return {
        ...historyState,
        template: newTemplate,
        selectedGroupId: groupId,
        isDirty: true,
      }
    }),

  updateGroup: (groupId, updates, location) =>
    set((state) => {
      const loc = location || state.selectedElementLocation
      const historyState = saveToHistory(state, state.template)
      const newTemplate = updateSectionGroups(state.template, loc, (groups) =>
        groups.map((g) => (g.id === groupId ? { ...g, ...updates } : g))
      )

      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),

  deleteGroup: (groupId, location) =>
    set((state) => {
      const loc = location || state.selectedElementLocation
      const historyState = saveToHistory(state, state.template)
      const newTemplate = updateSectionElementsAndGroups(
        state.template,
        loc,
        (elements) => removeGroupIdFromElements(elements, groupId),
        (groups) => groups.filter((g) => g.id !== groupId)
      )

      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),

  ungroupElements: (groupId, location) => {
    get().deleteGroup(groupId, location)
  },

  addToGroup: (groupId, elementIds, location) =>
    set((state) => {
      const loc = location || state.selectedElementLocation
      const historyState = saveToHistory(state, state.template)
      const newTemplate = updateSectionElementsAndGroups(
        state.template,
        loc,
        (elements) => applyGroupIdToElements(elements, elementIds, groupId),
        (groups) =>
          groups.map((g) => {
            if (g.id !== groupId) return g
            const uniqueIds = Array.from(new Set([...g.elementIds, ...elementIds]))
            return { ...g, elementIds: uniqueIds }
          })
      )

      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),

  removeFromGroup: (groupId, elementIds, location) =>
    set((state) => {
      const loc = location || state.selectedElementLocation
      const historyState = saveToHistory(state, state.template)
      const newTemplate = updateSectionElementsAndGroups(
        state.template,
        loc,
        (elements) => removeGroupIdFromElements(elements, groupId, elementIds),
        (groups) =>
          groups.map((g) => {
            if (g.id !== groupId) return g
            return {
              ...g,
              elementIds: g.elementIds.filter((id) => !elementIds.includes(id)),
            }
          })
      )

      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),
})
