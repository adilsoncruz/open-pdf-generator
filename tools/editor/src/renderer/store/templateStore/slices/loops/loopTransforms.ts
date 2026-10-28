import type { SetTemplateStore, GetTemplateStore } from '../types'
import { saveToHistory } from '../../helpers'
import type { Element, ElementLocation } from '../../types'
import { updateSectionLoopElements, isLoopContainer } from './loopShared'

export interface LoopTransformsSlice {
  moveLoop: (
    loopId: string,
    deltaX: number,
    deltaY: number,
    location?: ElementLocation
  ) => void
  resizeLoop: (
    loopId: string,
    width: number | string,
    height: number | string,
    location?: ElementLocation
  ) => void
  duplicateLoop: (loopId: string, location?: ElementLocation) => void
}

/**
 * Recursively clone loop child elements and generate new unique IDs.
 */
function cloneLoopChildren(elements: Element[]): Element[] {
  return elements.map((child) => {
    const newChildId = `el-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
    const cloned: Element = {
      ...child,
      id: newChildId,
    }
    if (cloned.elements && cloned.elements.length > 0) {
      cloned.elements = cloneLoopChildren(cloned.elements)
    }
    return cloned
  })
}

export const createLoopTransforms = (
  set: SetTemplateStore,
  _get: GetTemplateStore
): LoopTransformsSlice => ({
  moveLoop: (loopId, deltaX, deltaY, location) =>
    set((state) => {
      const loc = location || state.currentSection
      const historyState = saveToHistory(state, state.template)

      const applyMove = (elements: Element[]): Element[] =>
        elements.map((el) => {
          if (el.id === loopId && isLoopContainer(el)) {
            return {
              ...el,
              x: Math.max(0, (typeof el.x === 'number' ? el.x : 0) + deltaX),
              y: Math.max(0, (typeof el.y === 'number' ? el.y : 0) + deltaY),
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

      const newTemplate = updateSectionLoopElements(state.template, loc, applyMove)

      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),

  resizeLoop: (loopId, width, height, location) =>
    set((state) => {
      const loc = location || state.currentSection
      const historyState = saveToHistory(state, state.template)

      const applyResize = (elements: Element[]): Element[] =>
        elements.map((el) => {
          if (el.id === loopId && isLoopContainer(el)) {
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

      const newTemplate = updateSectionLoopElements(state.template, loc, applyResize)

      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),

  duplicateLoop: (loopId, location) =>
    set((state) => {
      const loc = location || state.currentSection
      let duplicatedId: string | null = null

      const duplicateInList = (elements: Element[]): Element[] => {
        const result: Element[] = []
        for (const el of elements) {
          result.push(
            el.elements && el.elements.length > 0
              ? { ...el, elements: duplicateInList(el.elements) }
              : el
          )
          if (el.id === loopId && isLoopContainer(el)) {
            const newLoopId = `loop-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
            duplicatedId = newLoopId
            const duplicated: Element = {
              ...JSON.parse(JSON.stringify(el)),
              id: newLoopId,
              x: (typeof el.x === 'number' ? el.x : 0) + 20,
              y: (typeof el.y === 'number' ? el.y : 0) + 20,
              elements: el.elements ? cloneLoopChildren(el.elements) : [],
            }
            result.push(duplicated)
          }
        }
        return result
      }

      const historyState = saveToHistory(state, state.template)
      const newTemplate = updateSectionLoopElements(state.template, loc, duplicateInList)

      return {
        ...historyState,
        template: newTemplate,
        selectedElementIds: duplicatedId ? [duplicatedId] : state.selectedElementIds,
        selectedLoopChildId: null,
        selectedLoopParentId: null,
        isDirty: true,
      }
    }),
})
