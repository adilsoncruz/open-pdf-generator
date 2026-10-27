import type { SetTemplateStore, GetTemplateStore } from '../types'
import { saveToHistory } from '../../helpers'
import type { Element, ElementGroup, ElementLocation } from '../../types'
import {
  getSectionElements,
  getSectionGroups,
  updateSectionGroups,
  updateSectionElements,
  updateSectionElementsAndGroups,
} from './groupShared'

export interface GroupTransformsSlice {
  toggleGroupCollapse: (groupId: string, location?: ElementLocation) => void
  toggleGroupVisibility: (groupId: string, location?: ElementLocation) => void
  reorderGroup: (groupId: string, newIndex: number, location?: ElementLocation) => void
  moveGroup: (groupId: string, deltaX: number, deltaY: number, location?: ElementLocation) => void
  resizeGroup: (groupId: string, scaleX: number, scaleY: number, location?: ElementLocation) => void
  duplicateGroup: (groupId: string, location?: ElementLocation) => void
}

function flattenAllElements(elements: Element[]): Element[] {
  const result: Element[] = []
  for (const el of elements) {
    result.push(el)
    if (el.elements && el.elements.length > 0) {
      result.push(...flattenAllElements(el.elements))
    }
  }
  return result
}

export const createGroupTransforms = (
  set: SetTemplateStore,
  _get: GetTemplateStore
): GroupTransformsSlice => ({
  toggleGroupCollapse: (groupId, location) =>
    set((state) => {
      const loc = location || state.selectedElementLocation
      const toggleCollapse = (groups: ElementGroup[]) =>
        groups.map((g) => (g.id === groupId ? { ...g, collapsed: !g.collapsed } : g))

      const newTemplate = updateSectionGroups(state.template, loc, toggleCollapse)

      return {
        template: newTemplate,
        isDirty: true,
      }
    }),

  toggleGroupVisibility: (groupId, location) =>
    set((state) => {
      const loc = location || state.selectedElementLocation
      const groups = getSectionGroups(state.template, loc)
      const elements = getSectionElements(state.template, loc)
      const group = groups.find((g) => g.id === groupId)
      if (!group || !elements) return state

      const allElements = flattenAllElements(elements)
      const groupElements = allElements.filter((el) => group.elementIds.includes(el.id))
      const hasVisibleElement = groupElements.some((el) => !el.hidden)
      const newHiddenState = hasVisibleElement

      const toggleVisibility = (els: Element[]): Element[] =>
        els.map((el) => {
          let updated = el
          if (group.elementIds.includes(el.id)) {
            updated = { ...updated, hidden: newHiddenState }
          }
          if (updated.elements && updated.elements.length > 0) {
            updated = { ...updated, elements: toggleVisibility(updated.elements) }
          }
          return updated
        })

      const historyState = saveToHistory(state, state.template)
      const newTemplate = updateSectionElements(state.template, loc, toggleVisibility)

      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),

  reorderGroup: (groupId, newIndex, location) =>
    set((state) => {
      const loc = location || state.currentSection
      const historyState = saveToHistory(state, state.template)

      const reorder = (groups: ElementGroup[]) => {
        const currentIndex = groups.findIndex((g) => g.id === groupId)
        if (currentIndex === -1 || currentIndex === newIndex) return groups

        const newGroups = [...groups]
        const [removed] = newGroups.splice(currentIndex, 1)
        newGroups.splice(newIndex, 0, removed)
        return newGroups
      }

      const newTemplate = updateSectionGroups(state.template, loc, reorder)

      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),

  moveGroup: (groupId, deltaX, deltaY, location) =>
    set((state) => {
      const loc = location || state.selectedElementLocation
      const groups = getSectionGroups(state.template, loc)
      const group = groups.find((g) => g.id === groupId)
      if (!group) return state

      const moveElement = (els: Element[]): Element[] =>
        els.map((el) => {
          let updated = el
          if (group.elementIds.includes(el.id)) {
            updated = {
              ...updated,
              x: (typeof updated.x === 'number' ? updated.x : 0) + deltaX,
              y: (typeof updated.y === 'number' ? updated.y : 0) + deltaY,
            }
          }
          if (updated.elements && updated.elements.length > 0) {
            updated = { ...updated, elements: moveElement(updated.elements) }
          }
          return updated
        })

      const historyState = saveToHistory(state, state.template)
      const newTemplate = updateSectionElements(state.template, loc, moveElement)

      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),

  resizeGroup: (groupId, scaleX, scaleY, location) =>
    set((state) => {
      const loc = location || state.selectedElementLocation
      const groups = getSectionGroups(state.template, loc)
      const group = groups.find((g) => g.id === groupId)
      if (!group) return state

      const resizeElement = (els: Element[]): Element[] =>
        els.map((el) => {
          let updated = el
          if (group.elementIds.includes(el.id)) {
            const w =
              typeof updated.width === 'number'
                ? Math.round(updated.width * scaleX)
                : updated.width
            const h =
              typeof updated.height === 'number'
                ? Math.round(updated.height * scaleY)
                : updated.height
            updated = {
              ...updated,
              width: w,
              height: h,
            }
          }
          if (updated.elements && updated.elements.length > 0) {
            updated = { ...updated, elements: resizeElement(updated.elements) }
          }
          return updated
        })

      const historyState = saveToHistory(state, state.template)
      const newTemplate = updateSectionElements(state.template, loc, resizeElement)

      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),

  duplicateGroup: (groupId, location) =>
    set((state) => {
      const loc = location || state.selectedElementLocation
      const groups = getSectionGroups(state.template, loc)
      const group = groups.find((g) => g.id === groupId)
      if (!group) return state

      const newGroupId = `group-${Date.now()}`
      const idMap = new Map<string, string>()
      group.elementIds.forEach((oldId) => {
        idMap.set(oldId, `el-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`)
      })

      const duplicateElements = (els: Element[]): Element[] => {
        const result: Element[] = []
        for (const el of els) {
          result.push(
            el.elements && el.elements.length > 0
              ? { ...el, elements: duplicateElements(el.elements) }
              : el
          )
          if (group.elementIds.includes(el.id)) {
            const newId = idMap.get(el.id)!
            result.push({
              ...el,
              id: newId,
              groupId: newGroupId,
              x: (typeof el.x === 'number' ? el.x : 0) + 20,
              y: (typeof el.y === 'number' ? el.y : 0) + 20,
            })
          }
        }
        return result
      }

      const duplicatedGroup: ElementGroup = {
        ...group,
        id: newGroupId,
        name: `${group.name} (Copy)`,
        elementIds: Array.from(idMap.values()),
      }

      const historyState = saveToHistory(state, state.template)
      const newTemplate = updateSectionElementsAndGroups(
        state.template,
        loc,
        duplicateElements,
        (grps) => [...grps, duplicatedGroup]
      )

      return {
        ...historyState,
        template: newTemplate,
        selectedGroupId: newGroupId,
        isDirty: true,
      }
    }),
})
