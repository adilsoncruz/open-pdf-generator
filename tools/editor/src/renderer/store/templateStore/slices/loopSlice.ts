import type { SetTemplateStore, GetTemplateStore } from './types'
import { saveToHistory } from '../helpers'
import type { Element, ElementLocation, Template } from '../types'

export interface LoopSlice {
  addElementToLoop: (loopId: string, element: Element, location?: ElementLocation) => void
  updateLoopChildElement: (
    loopId: string,
    childId: string,
    updates: Partial<Element>,
    location?: ElementLocation
  ) => void
  deleteLoopChildElement: (loopId: string, childId: string, location?: ElementLocation) => void
  reorderLoopChildren: (
    loopId: string,
    fromIndex: number,
    toIndex: number,
    location?: ElementLocation
  ) => void
}

export const createLoopSlice = (
  set: SetTemplateStore,
  _get: GetTemplateStore
): LoopSlice => ({
  addElementToLoop: (loopId, element, location) =>
    set((state) => {
      const loc = location || state.currentSection
      const historyState = saveToHistory(state, state.template)

      const addToLoop = (elements: Element[]): Element[] => {
        if (element.type === 'page_break') {
          return elements // silently ignore
        }
        return elements.map((el) => {
          if (el.id === loopId && (el.type === 'loop' || el.type === 'container')) {
            return {
              ...el,
              elements: [...(el.elements || []), element],
            }
          }
          if (el.elements && el.elements.length > 0) {
            return {
              ...el,
              elements: addToLoop(el.elements),
            }
          }
          return el
        })
      }

      let newTemplate: Template

      if (loc === 'header' && state.template.pageSettings.header) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            header: {
              ...state.template.pageSettings.header,
              elements: addToLoop(state.template.pageSettings.header.elements),
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
              elements: addToLoop(state.template.pageSettings.footer.elements),
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
              elements: addToLoop(state.template.pageSettings.bodyBackground.elements),
            },
          },
        }
      } else if (loc === 'summary' && state.template.summaryPage) {
        newTemplate = {
          ...state.template,
          summaryPage: {
            ...state.template.summaryPage,
            elements: addToLoop(state.template.summaryPage.elements),
          },
        }
      } else {
        newTemplate = {
          ...state.template,
          page: addToLoop(state.template.page),
        }
      }

      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),

  updateLoopChildElement: (loopId, childId, updates, location) =>
    set((state) => {
      const loc = location || state.currentSection
      const historyState = saveToHistory(state, state.template)
      const newChildId = updates.id !== undefined ? updates.id : childId

      const updateInLoop = (elements: Element[]): Element[] => {
        return elements.map((el) => {
          if (el.id === loopId) {
            return {
              ...el,
              elements: (el.elements || []).map((child) => {
                if (child.id !== childId) return child
                const mergedStyle = updates.style
                  ? { ...(child.style || {}), ...updates.style }
                  : child.style
                return {
                  ...child,
                  ...updates,
                  ...(updates.style ? { style: mergedStyle } : {}),
                }
              }),
            }
          }
          if (el.elements && el.elements.length > 0) {
            return {
              ...el,
              elements: updateInLoop(el.elements),
            }
          }
          return el
        })
      }

      let newTemplate: Template

      if (loc === 'header' && state.template.pageSettings.header) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            header: {
              ...state.template.pageSettings.header,
              elements: updateInLoop(state.template.pageSettings.header.elements),
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
              elements: updateInLoop(state.template.pageSettings.footer.elements),
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
              elements: updateInLoop(state.template.pageSettings.bodyBackground.elements),
            },
          },
        }
      } else if (loc === 'summary' && state.template.summaryPage) {
        newTemplate = {
          ...state.template,
          summaryPage: {
            ...state.template.summaryPage,
            elements: updateInLoop(state.template.summaryPage.elements),
          },
        }
      } else {
        newTemplate = {
          ...state.template,
          page: updateInLoop(state.template.page),
        }
      }

      return {
        ...historyState,
        template: newTemplate,
        selectedLoopChildId:
          state.selectedLoopChildId === childId ? newChildId : state.selectedLoopChildId,
        isDirty: true,
      }
    }),

  deleteLoopChildElement: (loopId, childId, location) =>
    set((state) => {
      const loc = location || state.currentSection
      const historyState = saveToHistory(state, state.template)

      const deleteFromLoop = (elements: Element[]): Element[] => {
        return elements.map((el) => {
          if (el.id === loopId && (el.type === 'loop' || el.type === 'container')) {
            return {
              ...el,
              elements: (el.elements || []).filter((child) => child.id !== childId),
            }
          }
          if (el.elements && el.elements.length > 0) {
            return {
              ...el,
              elements: deleteFromLoop(el.elements),
            }
          }
          return el
        })
      }

      let newTemplate: Template

      if (loc === 'header' && state.template.pageSettings.header) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            header: {
              ...state.template.pageSettings.header,
              elements: deleteFromLoop(state.template.pageSettings.header.elements),
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
              elements: deleteFromLoop(state.template.pageSettings.footer.elements),
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
              elements: deleteFromLoop(state.template.pageSettings.bodyBackground.elements),
            },
          },
        }
      } else if (loc === 'summary' && state.template.summaryPage) {
        newTemplate = {
          ...state.template,
          summaryPage: {
            ...state.template.summaryPage,
            elements: deleteFromLoop(state.template.summaryPage.elements),
          },
        }
      } else {
        newTemplate = {
          ...state.template,
          page: deleteFromLoop(state.template.page),
        }
      }

      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
        selectedLoopChildId: null,
        selectedLoopParentId: null,
        selectedContainerChildId: null,
        selectedContainerParentId: null,
      }
    }),

  reorderLoopChildren: (loopId, fromIndex, toIndex, location) =>
    set((state) => {
      const loc = location || state.currentSection
      const historyState = saveToHistory(state, state.template)

      const reorderInLoop = (elements: Element[]): Element[] => {
        return elements.map((el) => {
          if (el.id === loopId && (el.type === 'loop' || el.type === 'container') && el.elements) {
            const children = [...el.elements]
            const [removed] = children.splice(fromIndex, 1)
            children.splice(toIndex, 0, removed)
            return { ...el, elements: children }
          }
          if (el.elements && el.elements.length > 0) {
            return {
              ...el,
              elements: reorderInLoop(el.elements),
            }
          }
          return el
        })
      }

      let newTemplate: Template

      if (loc === 'header' && state.template.pageSettings.header) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            header: {
              ...state.template.pageSettings.header,
              elements: reorderInLoop(state.template.pageSettings.header.elements),
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
              elements: reorderInLoop(state.template.pageSettings.footer.elements),
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
              elements: reorderInLoop(state.template.pageSettings.bodyBackground.elements),
            },
          },
        }
      } else if (loc === 'summary' && state.template.summaryPage) {
        newTemplate = {
          ...state.template,
          summaryPage: {
            ...state.template.summaryPage,
            elements: reorderInLoop(state.template.summaryPage.elements),
          },
        }
      } else {
        newTemplate = {
          ...state.template,
          page: reorderInLoop(state.template.page),
        }
      }

      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),
})
