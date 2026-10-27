import type { SetTemplateStore, GetTemplateStore } from '../types'
import { saveToHistory } from '../../helpers'
import type { Element, ElementLocation } from '../../types'
import { updateSectionLoopElements, isLoopContainer } from './loopShared'

export interface LoopChildOperationsSlice {
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

export const createLoopChildOperations = (
  set: SetTemplateStore,
  _get: GetTemplateStore
): LoopChildOperationsSlice => ({
  addElementToLoop: (loopId, element, location) =>
    set((state) => {
      const loc = location || state.currentSection
      const historyState = saveToHistory(state, state.template)

      const addToLoop = (elements: Element[]): Element[] => {
        if (element.type === 'page_break') {
          return elements // silently ignore
        }
        return elements.map((el) => {
          if (el.id === loopId && isLoopContainer(el)) {
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

      const newTemplate = updateSectionLoopElements(state.template, loc, addToLoop)

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

      const newTemplate = updateSectionLoopElements(state.template, loc, updateInLoop)

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
          if (el.id === loopId && isLoopContainer(el)) {
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

      const newTemplate = updateSectionLoopElements(state.template, loc, deleteFromLoop)

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
          if (el.id === loopId && isLoopContainer(el) && el.elements) {
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

      const newTemplate = updateSectionLoopElements(state.template, loc, reorderInLoop)

      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),
})
