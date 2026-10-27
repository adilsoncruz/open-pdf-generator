import type { Element, ElementLocation, Template } from '../../types'
import type { SetTemplateStore, GetTemplateStore } from '../types'
import { saveToHistory, restackBodyContainers } from '../../helpers'
import { updateGroupsAfterElementDelete } from './shared'

export interface ElementDeleteSlice {
  deleteElement: (id: string, location?: ElementLocation) => void
  deleteSelectedElements: () => void
}

function removeElementsFromTemplate(
  template: Template,
  loc: ElementLocation,
  idsToRemove: string[]
): Template {
  const idSet = new Set(idsToRemove)
  const filterRec = (elements: Element[]): Element[] =>
    elements
      .filter((el) => !idSet.has(el.id))
      .map((el) => (el.elements?.length ? { ...el, elements: filterRec(el.elements) } : el))

  if (loc === 'header' && template.pageSettings.header) {
    return {
      ...template,
      pageSettings: {
        ...template.pageSettings,
        header: {
          ...template.pageSettings.header,
          elements: filterRec(template.pageSettings.header.elements),
          groups: updateGroupsAfterElementDelete(template.pageSettings.header.groups, idsToRemove),
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
          elements: filterRec(template.pageSettings.footer.elements),
          groups: updateGroupsAfterElementDelete(template.pageSettings.footer.groups, idsToRemove),
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
          elements: filterRec(template.pageSettings.bodyBackground.elements),
          groups: updateGroupsAfterElementDelete(template.pageSettings.bodyBackground.groups, idsToRemove),
        },
      },
    }
  }
  if (loc === 'summary' && template.summaryPage) {
    return {
      ...template,
      summaryPage: {
        ...template.summaryPage,
        elements: filterRec(template.summaryPage.elements),
        groups: updateGroupsAfterElementDelete(template.summaryPage.groups, idsToRemove),
      },
    }
  }

  return {
    ...template,
    page: restackBodyContainers(filterRec(template.page), template),
    groups: updateGroupsAfterElementDelete(template.groups, idsToRemove),
  }
}

export const createElementDelete = (
  set: SetTemplateStore,
  _get: GetTemplateStore
): ElementDeleteSlice => ({
  deleteElement: (id: string, location?: ElementLocation) =>
    set((state) => {
      const loc = location || state.selectedElementLocation
      const newTemplate = removeElementsFromTemplate(state.template, loc, [id])

      return {
        template: newTemplate,
        selectedElementIds: state.selectedElementIds.filter((selectedId) => selectedId !== id),
        isDirty: true,
        ...saveToHistory(state, newTemplate),
      }
    }),

  deleteSelectedElements: () =>
    set((state) => {
      const { selectedElementIds, selectedElementLocation, template } = state
      if (selectedElementIds.length === 0) return state

      const historyState = saveToHistory(state, template)
      const newTemplate = removeElementsFromTemplate(template, selectedElementLocation, selectedElementIds)

      return {
        ...historyState,
        template: newTemplate,
        selectedElementIds: [],
        selectedContainerChildId: null,
        selectedContainerParentId: null,
        selectedLoopChildId: null,
        selectedLoopParentId: null,
        isDirty: true,
      }
    }),
})
