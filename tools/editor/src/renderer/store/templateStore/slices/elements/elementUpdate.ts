import type { Element, ElementLocation, Template } from '../../types'
import type { SetTemplateStore, GetTemplateStore } from '../types'
import { saveToHistory, restackBodyContainers } from '../../helpers'
import { getSectionHeight, updateGroupsForRenamedElement, updateSectionElements } from './shared'

export interface ElementUpdateSlice {
  updateElement: (id: string, updates: Partial<Element>, location?: ElementLocation) => void
  updateSelectedElements: (updates: Partial<Element>) => void
  toggleElementVisibility: (id: string, location?: ElementLocation) => void
}

function applyUpdatesToElements(
  elements: Element[],
  id: string,
  updates: Partial<Element>,
  sectionHeight: number
): Element[] {
  return elements.map((el) => {
    if (el.id === id) {
      const result = { ...el, ...updates }
      if (el.type === 'container') {
        if (typeof result.height === 'number') {
          result.height = Math.min(result.height, Math.max(0, sectionHeight))
        }
        result.x = 0
        result.width = '100%'
      }
      return result
    }
    if (el.elements && el.elements.length > 0) {
      return {
        ...el,
        elements: applyUpdatesToElements(el.elements, id, updates, sectionHeight),
      }
    }
    return el
  })
}

function updateTemplateElement(
  template: Template,
  loc: ElementLocation,
  id: string,
  newId: string,
  updatedElements: Element[]
): Template {
  if (loc === 'header' && template.pageSettings.header) {
    return {
      ...template,
      pageSettings: {
        ...template.pageSettings,
        header: {
          ...template.pageSettings.header,
          elements: updatedElements,
          groups: updateGroupsForRenamedElement(template.pageSettings.header.groups, id, newId),
        },
      },
    }
  }
  if (loc === 'footer' && template.pageSettings.footer) {
    return {
      ...template,
      pageSettings: {
        ...template.pageSettings,
        footer: {
          ...template.pageSettings.footer,
          elements: updatedElements,
          groups: updateGroupsForRenamedElement(template.pageSettings.footer.groups, id, newId),
        },
      },
    }
  }
  if (loc === 'bodyBackground' && template.pageSettings.bodyBackground) {
    return {
      ...template,
      pageSettings: {
        ...template.pageSettings,
        bodyBackground: {
          ...template.pageSettings.bodyBackground,
          elements: updatedElements,
          groups: updateGroupsForRenamedElement(template.pageSettings.bodyBackground.groups, id, newId),
        },
      },
    }
  }
  if (loc === 'summary' && template.summaryPage) {
    return {
      ...template,
      summaryPage: {
        ...template.summaryPage,
        elements: updatedElements,
        groups: updateGroupsForRenamedElement(template.summaryPage.groups, id, newId),
      },
    }
  }

  return {
    ...template,
    page: restackBodyContainers(updatedElements, template),
    groups: updateGroupsForRenamedElement(template.groups, id, newId),
  }
}

export const createElementUpdate = (
  set: SetTemplateStore,
  _get: GetTemplateStore
): ElementUpdateSlice => ({
  updateElement: (id: string, updates: Partial<Element>, location?: ElementLocation) =>
    set((state) => {
      const loc = location || state.selectedElementLocation
      const newId = updates.id !== undefined ? updates.id : id
      const sectionHeight = getSectionHeight(state.template, loc)

      const getSectionList = (): Element[] => {
        if (loc === 'header') return state.template.pageSettings.header?.elements || []
        if (loc === 'footer') return state.template.pageSettings.footer?.elements || []
        if (loc === 'bodyBackground') return state.template.pageSettings.bodyBackground?.elements || []
        if (loc === 'summary') return state.template.summaryPage?.elements || []
        return state.template.page || []
      }

      const updatedElements = applyUpdatesToElements(getSectionList(), id, updates, sectionHeight)
      const newTemplate = updateTemplateElement(state.template, loc, id, newId, updatedElements)

      const newSelectedElementIds =
        newId !== id
          ? state.selectedElementIds.map((sid) => (sid === id ? newId : sid))
          : state.selectedElementIds

      return {
        template: newTemplate,
        selectedElementIds: newSelectedElementIds,
        isDirty: true,
      }
    }),

  updateSelectedElements: (updates: Partial<Element>) =>
    set((state) => {
      const { selectedElementIds, selectedElementLocation, template } = state
      if (selectedElementIds.length === 0) return state

      const updateElements = (elements: Element[]): Element[] =>
        elements.map((el) => {
          let updated = selectedElementIds.includes(el.id) ? { ...el, ...updates } : el
          if (updated.elements && updated.elements.length > 0) {
            updated = {
              ...updated,
              elements: updateElements(updated.elements),
            }
          }
          return updated
        })

      const newTemplate = updateSectionElements(template, selectedElementLocation, updateElements)

      return {
        template: newTemplate,
        isDirty: true,
      }
    }),

  toggleElementVisibility: (id: string, location?: ElementLocation) =>
    set((state) => {
      const loc = location || state.selectedElementLocation

      const toggleInElements = (elements: Element[]): Element[] =>
        elements.map((el) => {
          if (el.id === id) {
            return { ...el, hidden: !el.hidden }
          }
          if (el.elements && el.elements.length > 0) {
            return {
              ...el,
              elements: toggleInElements(el.elements),
            }
          }
          return el
        })

      const historyState = saveToHistory(state, state.template)
      const newTemplate = updateSectionElements(state.template, loc, toggleInElements)

      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),
})
