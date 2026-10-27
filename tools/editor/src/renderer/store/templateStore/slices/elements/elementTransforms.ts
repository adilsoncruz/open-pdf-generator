import type { Element, ElementLocation } from '../../types'
import type { SetTemplateStore, GetTemplateStore } from '../types'
import { saveToHistory } from '../../helpers'
import { updateSectionElements, getSectionHeight } from './shared'

export interface ElementTransformsSlice {
  moveElementUp: (id: string, location?: ElementLocation) => void
  moveElementDown: (id: string, location?: ElementLocation) => void
  moveElementToTop: (id: string, location?: ElementLocation) => void
  moveElementToBottom: (id: string, location?: ElementLocation) => void
  reorderElement: (id: string, newIndex: number, location?: ElementLocation) => void
  moveElementPosition: (
    id: string,
    x: number,
    y: number,
    location?: ElementLocation
  ) => void
  resizeElement: (
    id: string,
    width: number | string,
    height: number | string,
    location?: ElementLocation
  ) => void
}

export const createElementTransforms = (
  set: SetTemplateStore,
  _get: GetTemplateStore
): ElementTransformsSlice => ({
  moveElementUp: (id: string, location: ElementLocation = 'body') =>
    set((state) => {
      const moveUp = (elements: Element[]): Element[] => {
        const index = elements.findIndex((el) => el.id === id)
        if (index > 0) {
          const newElements = [...elements]
          ;[newElements[index - 1], newElements[index]] = [
            newElements[index],
            newElements[index - 1],
          ]
          return newElements
        }
        if (index === 0) return elements

        // Check inside containers and loops
        return elements.map((el) => {
          if ((el.type === 'container' || el.type === 'loop') && el.elements) {
            const childIdx = el.elements.findIndex((c) => c.id === id)
            if (childIdx > 0) {
              const newChildren = [...el.elements]
              ;[newChildren[childIdx - 1], newChildren[childIdx]] = [
                newChildren[childIdx],
                newChildren[childIdx - 1],
              ]
              return { ...el, elements: newChildren }
            }
            if (childIdx === 0) return el
            return {
              ...el,
              elements: moveUp(el.elements),
            }
          }
          return el
        })
      }

      const historyState = saveToHistory(state, state.template)
      const newTemplate = updateSectionElements(state.template, location, moveUp, true)

      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),

  moveElementDown: (id: string, location: ElementLocation = 'body') =>
    set((state) => {
      const moveDown = (elements: Element[]): Element[] => {
        const index = elements.findIndex((el) => el.id === id)
        if (index >= 0 && index < elements.length - 1) {
          const newElements = [...elements]
          ;[newElements[index], newElements[index + 1]] = [
            newElements[index + 1],
            newElements[index],
          ]
          return newElements
        }
        if (index === elements.length - 1) return elements

        // Check inside containers and loops
        return elements.map((el) => {
          if ((el.type === 'container' || el.type === 'loop') && el.elements) {
            const childIdx = el.elements.findIndex((c) => c.id === id)
            if (childIdx >= 0 && childIdx < el.elements.length - 1) {
              const newChildren = [...el.elements]
              ;[newChildren[childIdx], newChildren[childIdx + 1]] = [
                newChildren[childIdx + 1],
                newChildren[childIdx],
              ]
              return { ...el, elements: newChildren }
            }
            if (childIdx === el.elements.length - 1) return el
            return {
              ...el,
              elements: moveDown(el.elements),
            }
          }
          return el
        })
      }

      const historyState = saveToHistory(state, state.template)
      const newTemplate = updateSectionElements(state.template, location, moveDown, true)

      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),

  moveElementToTop: (id: string, location: ElementLocation = 'body') =>
    set((state) => {
      const moveToTop = (elements: Element[]): Element[] => {
        const index = elements.findIndex((el) => el.id === id)
        if (index > 0) {
          const element = elements[index]
          return [element, ...elements.filter((el) => el.id !== id)]
        }
        if (index === 0) return elements

        return elements.map((el) => {
          if ((el.type === 'container' || el.type === 'loop') && el.elements) {
            const childIdx = el.elements.findIndex((c) => c.id === id)
            if (childIdx > 0) {
              const child = el.elements[childIdx]
              return {
                ...el,
                elements: [child, ...el.elements.filter((c) => c.id !== id)],
              }
            }
            if (childIdx === 0) return el
            return {
              ...el,
              elements: moveToTop(el.elements),
            }
          }
          return el
        })
      }

      const historyState = saveToHistory(state, state.template)
      const newTemplate = updateSectionElements(state.template, location, moveToTop, true)

      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),

  moveElementToBottom: (id: string, location: ElementLocation = 'body') =>
    set((state) => {
      const moveToBottom = (elements: Element[]): Element[] => {
        const index = elements.findIndex((el) => el.id === id)
        if (index >= 0 && index < elements.length - 1) {
          const element = elements[index]
          return [...elements.filter((el) => el.id !== id), element]
        }
        if (index === elements.length - 1) return elements

        return elements.map((el) => {
          if ((el.type === 'container' || el.type === 'loop') && el.elements) {
            const childIdx = el.elements.findIndex((c) => c.id === id)
            if (childIdx >= 0 && childIdx < el.elements.length - 1) {
              const child = el.elements[childIdx]
              return {
                ...el,
                elements: [...el.elements.filter((c) => c.id !== id), child],
              }
            }
            if (childIdx === el.elements.length - 1) return el
            return {
              ...el,
              elements: moveToBottom(el.elements),
            }
          }
          return el
        })
      }

      const historyState = saveToHistory(state, state.template)
      const newTemplate = updateSectionElements(state.template, location, moveToBottom, true)

      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),

  reorderElement: (id: string, newIndex: number, location: ElementLocation = 'body') =>
    set((state) => {
      const reorder = (elements: Element[]): Element[] => {
        const oldIndex = elements.findIndex((el) => el.id === id)
        if (oldIndex >= 0) {
          if (oldIndex === newIndex) return elements
          const newElements = [...elements]
          const [element] = newElements.splice(oldIndex, 1)
          newElements.splice(newIndex, 0, element)
          return newElements
        }

        return elements.map((el) => {
          if ((el.type === 'container' || el.type === 'loop') && el.elements) {
            const childIdx = el.elements.findIndex((c) => c.id === id)
            if (childIdx >= 0) {
              if (childIdx === newIndex) return el
              const newChildren = [...el.elements]
              const [movedChild] = newChildren.splice(childIdx, 1)
              newChildren.splice(newIndex, 0, movedChild)
              return { ...el, elements: newChildren }
            }
            return {
              ...el,
              elements: reorder(el.elements),
            }
          }
          return el
        })
      }

      const historyState = saveToHistory(state, state.template)
      const newTemplate = updateSectionElements(state.template, location, reorder, true)

      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),

  moveElementPosition: (id: string, x: number, y: number, location?: ElementLocation) =>
    set((state) => {
      const loc = location || state.selectedElementLocation

      const applyMove = (elements: Element[]): Element[] =>
        elements.map((el) => {
          if (el.id === id) {
            if (el.type === 'container') {
              return {
                ...el,
                x: 0,
                y: Math.max(0, y),
              }
            }
            return {
              ...el,
              x: Math.max(0, x),
              y: Math.max(0, y),
            }
          }
          if (el.elements && el.elements.length > 0) {
            return {
              ...el,
              elements: applyMove(el.elements),
            }
          }
          return el
        })

      const historyState = saveToHistory(state, state.template)
      const newTemplate = updateSectionElements(state.template, loc, applyMove, true)

      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),

  resizeElement: (
    id: string,
    width: number | string,
    height: number | string,
    location?: ElementLocation
  ) =>
    set((state) => {
      const loc = location || state.selectedElementLocation
      const sectionHeight = getSectionHeight(state.template, loc)

      const applyResize = (elements: Element[]): Element[] =>
        elements.map((el) => {
          if (el.id === id) {
            if (el.type === 'container') {
              const clampedHeight =
                typeof height === 'number'
                  ? Math.min(height, Math.max(20, sectionHeight))
                  : height
              return {
                ...el,
                width: '100%',
                height: clampedHeight,
              }
            }
            return {
              ...el,
              width,
              height,
            }
          }
          if (el.elements && el.elements.length > 0) {
            return {
              ...el,
              elements: applyResize(el.elements),
            }
          }
          return el
        })

      const historyState = saveToHistory(state, state.template)
      const newTemplate = updateSectionElements(state.template, loc, applyResize, true)

      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),
})
