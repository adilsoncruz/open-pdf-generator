import type { Element, ElementLocation } from '../../types'
import type { SetTemplateStore, GetTemplateStore } from '../types'
import { saveToHistory } from '../../helpers'
import { updateSectionElements, getSectionHeight } from './shared'

export interface ElementResizeSlice {
  resizeElement: (
    id: string,
    width: number | string,
    height: number | string,
    location?: ElementLocation
  ) => void
}

/**
 * Clamps container height to section height limits (minimum 20, maximum sectionHeight).
 */
export function clampContainerHeight(
  height: number | string,
  sectionHeight: number
): number | string {
  if (typeof height !== 'number') return height
  return Math.min(height, Math.max(20, sectionHeight))
}

/**
 * Resizes an element in a recursive element list, respecting container rules.
 */
export function applyElementResize(
  elements: Element[],
  id: string,
  width: number | string,
  height: number | string,
  sectionHeight: number
): Element[] {
  return elements.map((el) => {
    if (el.id === id) {
      if (el.type === 'container') {
        return {
          ...el,
          width: '100%',
          height: clampContainerHeight(height, sectionHeight),
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
        elements: applyElementResize(el.elements, id, width, height, sectionHeight),
      }
    }
    return el
  })
}

export const createElementResize = (
  set: SetTemplateStore,
  _get: GetTemplateStore
): ElementResizeSlice => ({
  resizeElement: (
    id: string,
    width: number | string,
    height: number | string,
    location?: ElementLocation
  ) =>
    set((state) => {
      const loc = location || state.selectedElementLocation
      const sectionHeight = getSectionHeight(state.template, loc)

      const historyState = saveToHistory(state, state.template)
      const newTemplate = updateSectionElements(
        state.template,
        loc,
        (elements) => applyElementResize(elements, id, width, height, sectionHeight),
        true
      )

      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),
})
