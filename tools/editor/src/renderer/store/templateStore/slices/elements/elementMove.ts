import type { Element, ElementLocation } from '../../types'
import type { SetTemplateStore, GetTemplateStore } from '../types'
import { saveToHistory } from '../../helpers'
import { updateSectionElements } from './shared'

export interface ElementMoveSlice {
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
}

/**
 * Clamps coordinate value to a minimum bound (default: 0).
 */
export function clampCoordinate(value: number, min = 0): number {
  return Math.max(min, value)
}

/**
 * Snaps a coordinate value to a grid step.
 */
export function snapCoordinate(value: number, gridSize = 1): number {
  if (gridSize <= 1) return value
  return Math.round(value / gridSize) * gridSize
}

/**
 * Recursively locates an element in the element tree (root or inside containers/loops)
 * and applies an array reordering callback to its sibling array.
 */
export function reorderInHierarchy(
  elements: Element[],
  id: string,
  transform: (list: Element[], index: number) => Element[]
): Element[] {
  const index = elements.findIndex((el) => el.id === id)
  if (index >= 0) {
    return transform(elements, index)
  }

  return elements.map((el) => {
    if ((el.type === 'container' || el.type === 'loop') && el.elements && el.elements.length > 0) {
      return {
        ...el,
        elements: reorderInHierarchy(el.elements, id, transform),
      }
    }
    return el
  })
}

/**
 * Recursively moves an element's position, ensuring containers stay at x=0.
 */
export function applyElementPosition(
  elements: Element[],
  id: string,
  x: number,
  y: number
): Element[] {
  return elements.map((el) => {
    if (el.id === id) {
      if (el.type === 'container') {
        return {
          ...el,
          x: 0,
          y: clampCoordinate(y),
        }
      }
      return {
        ...el,
        x: clampCoordinate(x),
        y: clampCoordinate(y),
      }
    }
    if (el.elements && el.elements.length > 0) {
      return {
        ...el,
        elements: applyElementPosition(el.elements, id, x, y),
      }
    }
    return el
  })
}

function applyHierarchyReorder(
  set: SetTemplateStore,
  id: string,
  location: ElementLocation = 'body',
  transform: (list: Element[], index: number) => Element[]
) {
  set((state) => {
    const historyState = saveToHistory(state, state.template)
    const newTemplate = updateSectionElements(
      state.template,
      location,
      (elements) => reorderInHierarchy(elements, id, transform),
      true
    )

    return {
      ...historyState,
      template: newTemplate,
      isDirty: true,
    }
  })
}

export const createElementMove = (
  set: SetTemplateStore,
  _get: GetTemplateStore
): ElementMoveSlice => ({
  moveElementUp: (id: string, location: ElementLocation = 'body') =>
    applyHierarchyReorder(set, id, location, (list, index) => {
      if (index <= 0) return list
      const next = [...list]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    }),

  moveElementDown: (id: string, location: ElementLocation = 'body') =>
    applyHierarchyReorder(set, id, location, (list, index) => {
      if (index < 0 || index >= list.length - 1) return list
      const next = [...list]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next
    }),

  moveElementToTop: (id: string, location: ElementLocation = 'body') =>
    applyHierarchyReorder(set, id, location, (list, index) => {
      if (index <= 0) return list
      return [list[index], ...list.filter((el) => el.id !== id)]
    }),

  moveElementToBottom: (id: string, location: ElementLocation = 'body') =>
    applyHierarchyReorder(set, id, location, (list, index) => {
      if (index < 0 || index >= list.length - 1) return list
      return [...list.filter((el) => el.id !== id), list[index]]
    }),

  reorderElement: (id: string, newIndex: number, location: ElementLocation = 'body') =>
    applyHierarchyReorder(set, id, location, (list, index) => {
      if (index === newIndex) return list
      const next = [...list]
      const [element] = next.splice(index, 1)
      next.splice(newIndex, 0, element)
      return next
    }),

  moveElementPosition: (id: string, x: number, y: number, location?: ElementLocation) =>
    set((state) => {
      const loc = location || state.selectedElementLocation

      const historyState = saveToHistory(state, state.template)
      const newTemplate = updateSectionElements(
        state.template,
        loc,
        (elements) => applyElementPosition(elements, id, x, y),
        true
      )

      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),
})
