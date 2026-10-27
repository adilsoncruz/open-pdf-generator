import type { SetTemplateStore, GetTemplateStore } from './types'
import { saveToHistory } from '../helpers'
import type { Element, ElementGroup, ElementLocation, Template } from '../types'

export interface GroupSlice {
  createGroup: (name: string, elementIds: string[], location?: ElementLocation) => void
  updateGroup: (groupId: string, updates: Partial<ElementGroup>, location?: ElementLocation) => void
  deleteGroup: (groupId: string, location?: ElementLocation) => void
  ungroupElements: (groupId: string, location?: ElementLocation) => void
  toggleGroupCollapse: (groupId: string, location?: ElementLocation) => void
  toggleGroupVisibility: (groupId: string, location?: ElementLocation) => void
  reorderGroup: (groupId: string, newIndex: number, location?: ElementLocation) => void
}

export const createGroupSlice = (
  set: SetTemplateStore,
  get: GetTemplateStore
): GroupSlice => ({
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

      const updateElementsWithGroup = (elements: Element[]): Element[] =>
        elements.map((el) => {
          let updated = el
          if (elementIds.includes(el.id)) {
            updated = { ...updated, groupId }
          }
          if (updated.elements && updated.elements.length > 0) {
            updated = { ...updated, elements: updateElementsWithGroup(updated.elements) }
          }
          return updated
        })

      let newTemplate: Template

      if (location === 'header' && state.template.pageSettings.header) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            header: {
              ...state.template.pageSettings.header,
              elements: updateElementsWithGroup(state.template.pageSettings.header.elements),
              groups: [...(state.template.pageSettings.header.groups || []), newGroup],
            },
          },
        }
      } else if (location === 'footer' && state.template.pageSettings.footer) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            footer: {
              ...state.template.pageSettings.footer,
              elements: updateElementsWithGroup(state.template.pageSettings.footer.elements),
              groups: [...(state.template.pageSettings.footer.groups || []), newGroup],
            },
          },
        }
      } else if (location === 'bodyBackground' && state.template.pageSettings.bodyBackground) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            bodyBackground: {
              ...state.template.pageSettings.bodyBackground,
              elements: updateElementsWithGroup(
                state.template.pageSettings.bodyBackground.elements
              ),
              groups: [...(state.template.pageSettings.bodyBackground.groups || []), newGroup],
            },
          },
        }
      } else if (location === 'summary' && state.template.summaryPage) {
        newTemplate = {
          ...state.template,
          summaryPage: {
            ...state.template.summaryPage,
            elements: updateElementsWithGroup(state.template.summaryPage.elements),
            groups: [...(state.template.summaryPage.groups || []), newGroup],
          },
        }
      } else {
        newTemplate = {
          ...state.template,
          page: updateElementsWithGroup(state.template.page),
          groups: [...(state.template.groups || []), newGroup],
        }
      }

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

      const updateGroups = (groups: ElementGroup[]) =>
        groups.map((g) => (g.id === groupId ? { ...g, ...updates } : g))

      const historyState = saveToHistory(state, state.template)

      let newTemplate: Template

      if (loc === 'header' && state.template.pageSettings.header) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            header: {
              ...state.template.pageSettings.header,
              groups: updateGroups(state.template.pageSettings.header.groups || []),
            },
          },
        }
      } else if (loc === 'footer' && state.template.pageSettings.footer) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            footer: {
              ...state.template.pageSettings.footer,
              groups: updateGroups(state.template.pageSettings.footer.groups || []),
            },
          },
        }
      } else if (loc === 'bodyBackground' && state.template.pageSettings.bodyBackground) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            bodyBackground: {
              ...state.template.pageSettings.bodyBackground,
              groups: updateGroups(state.template.pageSettings.bodyBackground.groups || []),
            },
          },
        }
      } else if (loc === 'summary' && state.template.summaryPage) {
        newTemplate = {
          ...state.template,
          summaryPage: {
            ...state.template.summaryPage,
            groups: updateGroups(state.template.summaryPage.groups || []),
          },
        }
      } else {
        newTemplate = {
          ...state.template,
          groups: updateGroups(state.template.groups || []),
        }
      }

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

      const removeGroupFromElements = (elements: Element[]): Element[] =>
        elements.map((el) => {
          let updated = el
          if (el.groupId === groupId) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { groupId: _removed, ...rest } = el
            updated = rest as Element
          }
          if (updated.elements && updated.elements.length > 0) {
            updated = { ...updated, elements: removeGroupFromElements(updated.elements) }
          }
          return updated
        })

      const filterGroups = (groups: ElementGroup[]) =>
        groups.filter((g) => g.id !== groupId)

      let newTemplate: Template

      if (loc === 'header' && state.template.pageSettings.header) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            header: {
              ...state.template.pageSettings.header,
              elements: removeGroupFromElements(state.template.pageSettings.header.elements),
              groups: filterGroups(state.template.pageSettings.header.groups || []),
            },
          },
        }
      } else if (loc === 'footer' && state.template.pageSettings.footer) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            footer: {
              ...state.template.pageSettings.footer,
              elements: removeGroupFromElements(state.template.pageSettings.footer.elements),
              groups: filterGroups(state.template.pageSettings.footer.groups || []),
            },
          },
        }
      } else if (loc === 'bodyBackground' && state.template.pageSettings.bodyBackground) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            bodyBackground: {
              ...state.template.pageSettings.bodyBackground,
              elements: removeGroupFromElements(
                state.template.pageSettings.bodyBackground.elements
              ),
              groups: filterGroups(state.template.pageSettings.bodyBackground.groups || []),
            },
          },
        }
      } else if (loc === 'summary' && state.template.summaryPage) {
        newTemplate = {
          ...state.template,
          summaryPage: {
            ...state.template.summaryPage,
            elements: removeGroupFromElements(state.template.summaryPage.elements),
            groups: filterGroups(state.template.summaryPage.groups || []),
          },
        }
      } else {
        newTemplate = {
          ...state.template,
          page: removeGroupFromElements(state.template.page),
          groups: filterGroups(state.template.groups || []),
        }
      }

      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),

  ungroupElements: (groupId, location) => {
    get().deleteGroup(groupId, location)
  },

  toggleGroupCollapse: (groupId, location) =>
    set((state) => {
      const loc = location || state.selectedElementLocation

      const toggleCollapse = (groups: ElementGroup[]) =>
        groups.map((g) => (g.id === groupId ? { ...g, collapsed: !g.collapsed } : g))

      let newTemplate: Template

      if (loc === 'header' && state.template.pageSettings.header) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            header: {
              ...state.template.pageSettings.header,
              groups: toggleCollapse(state.template.pageSettings.header.groups || []),
            },
          },
        }
      } else if (loc === 'footer' && state.template.pageSettings.footer) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            footer: {
              ...state.template.pageSettings.footer,
              groups: toggleCollapse(state.template.pageSettings.footer.groups || []),
            },
          },
        }
      } else if (loc === 'bodyBackground' && state.template.pageSettings.bodyBackground) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            bodyBackground: {
              ...state.template.pageSettings.bodyBackground,
              groups: toggleCollapse(state.template.pageSettings.bodyBackground.groups || []),
            },
          },
        }
      } else {
        newTemplate = {
          ...state.template,
          groups: toggleCollapse(state.template.groups || []),
        }
      }

      return {
        template: newTemplate,
        isDirty: true,
      }
    }),

  toggleGroupVisibility: (groupId, location) =>
    set((state) => {
      const loc = location || state.selectedElementLocation

      const getGroupAndElements = () => {
        if (loc === 'header' && state.template.pageSettings.header) {
          const group = state.template.pageSettings.header.groups?.find((g) => g.id === groupId)
          return { group, elements: state.template.pageSettings.header.elements }
        } else if (loc === 'footer' && state.template.pageSettings.footer) {
          const group = state.template.pageSettings.footer.groups?.find((g) => g.id === groupId)
          return { group, elements: state.template.pageSettings.footer.elements }
        } else if (loc === 'bodyBackground' && state.template.pageSettings.bodyBackground) {
          const group = state.template.pageSettings.bodyBackground.groups?.find(
            (g) => g.id === groupId
          )
          return { group, elements: state.template.pageSettings.bodyBackground.elements }
        } else if (loc === 'summary' && state.template.summaryPage) {
          const group = state.template.summaryPage.groups?.find((g) => g.id === groupId)
          return { group, elements: state.template.summaryPage.elements }
        } else {
          const group = state.template.groups?.find((g) => g.id === groupId)
          return { group, elements: state.template.page }
        }
      }

      const { group, elements } = getGroupAndElements()
      if (!group || !elements) return state

      const groupElements = elements.filter((el) => group.elementIds.includes(el.id))
      const hasVisibleElement = groupElements.some((el) => !el.hidden)
      const newHiddenState = hasVisibleElement

      const toggleVisibility = (els: Element[]) =>
        els.map((el) =>
          group.elementIds.includes(el.id) ? { ...el, hidden: newHiddenState } : el
        )

      const historyState = saveToHistory(state, state.template)

      let newTemplate: Template

      if (loc === 'header' && state.template.pageSettings.header) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            header: {
              ...state.template.pageSettings.header,
              elements: toggleVisibility(state.template.pageSettings.header.elements),
            },
          },
        }
      } else if (loc === 'footer' && state.template.pageSettings.footer) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            footer: {
              ...state.template.pageSettings.footer,
              elements: toggleVisibility(state.template.pageSettings.footer.elements),
            },
          },
        }
      } else if (loc === 'bodyBackground' && state.template.pageSettings.bodyBackground) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            bodyBackground: {
              ...state.template.pageSettings.bodyBackground,
              elements: toggleVisibility(state.template.pageSettings.bodyBackground.elements),
            },
          },
        }
      } else if (loc === 'summary' && state.template.summaryPage) {
        newTemplate = {
          ...state.template,
          summaryPage: {
            ...state.template.summaryPage,
            elements: toggleVisibility(state.template.summaryPage.elements),
          },
        }
      } else {
        newTemplate = {
          ...state.template,
          page: toggleVisibility(state.template.page),
        }
      }

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

      let newTemplate: Template

      if (loc === 'header' && state.template.pageSettings.header) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            header: {
              ...state.template.pageSettings.header,
              groups: reorder(state.template.pageSettings.header.groups || []),
            },
          },
        }
      } else if (loc === 'footer' && state.template.pageSettings.footer) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            footer: {
              ...state.template.pageSettings.footer,
              groups: reorder(state.template.pageSettings.footer.groups || []),
            },
          },
        }
      } else if (loc === 'bodyBackground' && state.template.pageSettings.bodyBackground) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            bodyBackground: {
              ...state.template.pageSettings.bodyBackground,
              groups: reorder(state.template.pageSettings.bodyBackground.groups || []),
            },
          },
        }
      } else {
        newTemplate = {
          ...state.template,
          groups: reorder(state.template.groups || []),
        }
      }

      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),
})
