import type { Element, ElementLocation, Template, TemplateStore } from '../../types'
import type { SetTemplateStore, GetTemplateStore } from '../types'
import { flattenElements, saveToHistory, findParentContainer } from '../../helpers'
import { getSectionElements, updateSectionElements, getSectionHeight } from './shared'
import {
  computeAlignedPositions,
  computeDistributedPositions,
  applyPositions,
  type ElementAlignmentType,
  type ElementDistributionType,
} from './elementAlignmentMath'

export type { ElementAlignmentType, ElementDistributionType }
export { computeAlignedPositions, computeDistributedPositions, applyPositions }

export interface ElementAlignmentSlice {
  alignSelectedElements: (alignment: ElementAlignmentType) => void
  distributeSelectedElements: (direction: ElementDistributionType) => void
  alignElements: (alignment: ElementAlignmentType, location?: ElementLocation) => void
  distributeElements: (direction: ElementDistributionType, location?: ElementLocation) => void
}

function resolveSingleElementBounds(
  template: Template,
  elementId: string,
  location?: ElementLocation
): { width: number; height: number } {
  const defaultWidth = template.pageSettings?.size === 'Letter' ? 612 : 595
  const parentContainer = findParentContainer(template, elementId)
  if (parentContainer && typeof parentContainer.height === 'number') {
    return {
      width: typeof parentContainer.width === 'number' ? parentContainer.width : defaultWidth,
      height: parentContainer.height,
    }
  }
  const sectionHeight = getSectionHeight(template, location || 'body')
  return { width: defaultWidth, height: sectionHeight }
}

function updatePositionsInState(
  state: TemplateStore,
  location: ElementLocation,
  computeFn: (targets: Element[]) => Map<string, { x?: number; y?: number }>
): Partial<TemplateStore> | TemplateStore {
  const { template, selectedElementIds } = state
  const sectionElements = getSectionElements(template, location)
  const flat = flattenElements(sectionElements)
  const targets = flat.filter((el) => selectedElementIds.includes(el.id))
  if (targets.length === 0) return state

  const positionMap = computeFn(targets)
  if (positionMap.size === 0) return state

  const historyState = saveToHistory(state, template)
  const newTemplate = updateSectionElements(
    template,
    location,
    (elements) => applyPositions(elements, positionMap),
    false
  )

  return { ...historyState, template: newTemplate, isDirty: true }
}

export const createElementAlignment = (
  set: SetTemplateStore,
  _get: GetTemplateStore
): ElementAlignmentSlice => ({
  alignSelectedElements: (alignment: ElementAlignmentType) =>
    set((state) => {
      if (state.selectedElementIds.length === 0) return state
      return updatePositionsInState(state, state.selectedElementLocation, (targets) => {
        const parentBounds =
          targets.length === 1
            ? resolveSingleElementBounds(state.template, targets[0].id, state.selectedElementLocation)
            : undefined
        return computeAlignedPositions(targets, alignment, parentBounds)
      })
    }),

  distributeSelectedElements: (direction: ElementDistributionType) =>
    set((state) => {
      if (state.selectedElementIds.length < 3) return state
      return updatePositionsInState(state, state.selectedElementLocation, (targets) =>
        computeDistributedPositions(targets, direction)
      )
    }),

  alignElements: (alignment: ElementAlignmentType, location?: ElementLocation) =>
    set((state) => {
      const loc = location || state.selectedElementLocation
      return updatePositionsInState(state, loc, (targets) =>
        computeAlignedPositions(targets, alignment)
      )
    }),

  distributeElements: (direction: ElementDistributionType, location?: ElementLocation) =>
    set((state) => {
      const loc = location || state.selectedElementLocation
      return updatePositionsInState(state, loc, (targets) =>
        computeDistributedPositions(targets, direction)
      )
    }),
})
