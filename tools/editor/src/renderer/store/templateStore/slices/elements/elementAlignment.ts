import type { Element, ElementLocation } from '../../types'
import type { SetTemplateStore, GetTemplateStore } from '../types'
import { flattenElements, saveToHistory, findParentContainer } from '../../helpers'
import { getSectionElements, updateSectionElements, getSectionHeight } from './shared'

export type ElementAlignmentType = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
export type ElementDistributionType = 'horizontal' | 'vertical'

export interface ElementAlignmentSlice {
  alignSelectedElements: (alignment: ElementAlignmentType) => void
  distributeSelectedElements: (direction: ElementDistributionType) => void
  alignElements: (alignment: ElementAlignmentType, location?: ElementLocation) => void
  distributeElements: (direction: ElementDistributionType, location?: ElementLocation) => void
}

/**
 * Calculates new coordinates for elements when aligning.
 */
function computeAlignedPositions(
  targets: Element[],
  alignment: ElementAlignmentType,
  parentBounds?: { width: number; height: number }
): Map<string, { x?: number; y?: number }> {
  const result = new Map<string, { x?: number; y?: number }>()
  if (targets.length === 0) return result

  const getWidth = (el: Element): number => (typeof el.width === 'number' ? el.width : 100)
  const getHeight = (el: Element): number => (typeof el.height === 'number' ? el.height : 25)

  // Single element aligned to parent container or section bounds
  if (targets.length === 1 && parentBounds) {
    const el = targets[0]
    const w = getWidth(el)
    const h = getHeight(el)

    switch (alignment) {
      case 'left':
        result.set(el.id, { x: 0 })
        break
      case 'center':
        result.set(el.id, { x: Math.max(0, Math.round((parentBounds.width - w) / 2)) })
        break
      case 'right':
        result.set(el.id, { x: Math.max(0, Math.round(parentBounds.width - w)) })
        break
      case 'top':
        result.set(el.id, { y: 0 })
        break
      case 'middle':
        result.set(el.id, { y: Math.max(0, Math.round((parentBounds.height - h) / 2)) })
        break
      case 'bottom':
        result.set(el.id, { y: Math.max(0, Math.round(parentBounds.height - h)) })
        break
    }
    return result
  }

  // Multi-element alignment relative to selection bounding box
  const minX = Math.min(...targets.map((el) => (typeof el.x === 'number' ? el.x : 0)))
  const maxX = Math.max(
    ...targets.map((el) => (typeof el.x === 'number' ? el.x : 0) + getWidth(el))
  )
  const minY = Math.min(...targets.map((el) => (typeof el.y === 'number' ? el.y : 0)))
  const maxY = Math.max(
    ...targets.map((el) => (typeof el.y === 'number' ? el.y : 0) + getHeight(el))
  )

  const boxCenterX = (minX + maxX) / 2
  const boxCenterY = (minY + maxY) / 2

  for (const el of targets) {
    const w = getWidth(el)
    const h = getHeight(el)

    switch (alignment) {
      case 'left':
        result.set(el.id, { x: minX })
        break
      case 'center':
        result.set(el.id, { x: Math.round(boxCenterX - w / 2) })
        break
      case 'right':
        result.set(el.id, { x: Math.round(maxX - w) })
        break
      case 'top':
        result.set(el.id, { y: minY })
        break
      case 'middle':
        result.set(el.id, { y: Math.round(boxCenterY - h / 2) })
        break
      case 'bottom':
        result.set(el.id, { y: Math.round(maxY - h) })
        break
    }
  }

  return result
}

/**
 * Calculates new coordinates for distributing elements evenly.
 */
function computeDistributedPositions(
  targets: Element[],
  direction: ElementDistributionType
): Map<string, { x?: number; y?: number }> {
  const result = new Map<string, { x?: number; y?: number }>()
  if (targets.length < 3) return result

  const getWidth = (el: Element): number => (typeof el.width === 'number' ? el.width : 100)
  const getHeight = (el: Element): number => (typeof el.height === 'number' ? el.height : 25)

  if (direction === 'horizontal') {
    const sorted = [...targets].sort(
      (a, b) => (typeof a.x === 'number' ? a.x : 0) - (typeof b.x === 'number' ? b.x : 0)
    )
    const first = sorted[0]
    const last = sorted[sorted.length - 1]

    const firstX = typeof first.x === 'number' ? first.x : 0
    const lastX = typeof last.x === 'number' ? last.x : 0
    const lastRight = lastX + getWidth(last)

    const totalWidths = sorted.reduce((sum, el) => sum + getWidth(el), 0)
    const totalSpan = lastRight - firstX
    const totalGap = totalSpan - totalWidths
    const gap = totalGap > 0 ? totalGap / (sorted.length - 1) : 0

    let currentX = firstX
    for (const el of sorted) {
      result.set(el.id, { x: Math.round(currentX) })
      currentX += getWidth(el) + gap
    }
  } else {
    const sorted = [...targets].sort(
      (a, b) => (typeof a.y === 'number' ? a.y : 0) - (typeof b.y === 'number' ? b.y : 0)
    )
    const first = sorted[0]
    const last = sorted[sorted.length - 1]

    const firstY = typeof first.y === 'number' ? first.y : 0
    const lastY = typeof last.y === 'number' ? last.y : 0
    const lastBottom = lastY + getHeight(last)

    const totalHeights = sorted.reduce((sum, el) => sum + getHeight(el), 0)
    const totalSpan = lastBottom - firstY
    const totalGap = totalSpan - totalHeights
    const gap = totalGap > 0 ? totalGap / (sorted.length - 1) : 0

    let currentY = firstY
    for (const el of sorted) {
      result.set(el.id, { y: Math.round(currentY) })
      currentY += getHeight(el) + gap
    }
  }

  return result
}

/**
 * Recursively applies position changes to a list of elements.
 */
function applyPositions(
  elements: Element[],
  positionMap: Map<string, { x?: number; y?: number }>
): Element[] {
  return elements.map((el) => {
    let updated = el
    if (positionMap.has(el.id)) {
      const pos = positionMap.get(el.id)!
      updated = {
        ...el,
        ...(pos.x !== undefined ? { x: pos.x } : {}),
        ...(pos.y !== undefined ? { y: pos.y } : {}),
      }
    }

    if (updated.elements && updated.elements.length > 0) {
      return {
        ...updated,
        elements: applyPositions(updated.elements, positionMap),
      }
    }

    return updated
  })
}

export const createElementAlignment = (
  set: SetTemplateStore,
  _get: GetTemplateStore
): ElementAlignmentSlice => ({
  alignSelectedElements: (alignment: ElementAlignmentType) =>
    set((state) => {
      const { selectedElementIds, selectedElementLocation, template } = state
      if (selectedElementIds.length === 0) return state

      const sectionElements = getSectionElements(template, selectedElementLocation)
      const flat = flattenElements(sectionElements)
      const targets = flat.filter((el) => selectedElementIds.includes(el.id))
      if (targets.length === 0) return state

      let parentBounds: { width: number; height: number } | undefined
      if (targets.length === 1) {
        const parentContainer = findParentContainer(template, targets[0].id)
        if (parentContainer && typeof parentContainer.height === 'number') {
          const size = template.pageSettings?.size
          const defaultWidth = size === 'Letter' ? 612 : 595
          parentBounds = {
            width: typeof parentContainer.width === 'number' ? parentContainer.width : defaultWidth,
            height: parentContainer.height,
          }
        } else {
          const sectionHeight = getSectionHeight(template, selectedElementLocation)
          const size = template.pageSettings?.size
          const defaultWidth = size === 'Letter' ? 612 : 595
          parentBounds = { width: defaultWidth, height: sectionHeight }
        }
      }

      const positionMap = computeAlignedPositions(targets, alignment, parentBounds)
      const historyState = saveToHistory(state, template)
      const newTemplate = updateSectionElements(
        template,
        selectedElementLocation,
        (elements) => applyPositions(elements, positionMap),
        false
      )

      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),

  distributeSelectedElements: (direction: ElementDistributionType) =>
    set((state) => {
      const { selectedElementIds, selectedElementLocation, template } = state
      if (selectedElementIds.length < 3) return state

      const sectionElements = getSectionElements(template, selectedElementLocation)
      const flat = flattenElements(sectionElements)
      const targets = flat.filter((el) => selectedElementIds.includes(el.id))
      if (targets.length < 3) return state

      const positionMap = computeDistributedPositions(targets, direction)
      const historyState = saveToHistory(state, template)
      const newTemplate = updateSectionElements(
        template,
        selectedElementLocation,
        (elements) => applyPositions(elements, positionMap),
        false
      )

      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),

  alignElements: (alignment: ElementAlignmentType, location?: ElementLocation) =>
    set((state) => {
      const loc = location || state.selectedElementLocation
      const sectionElements = getSectionElements(state.template, loc)
      const flat = flattenElements(sectionElements)
      const targets = flat.filter((el) => state.selectedElementIds.includes(el.id))
      if (targets.length === 0) return state

      const positionMap = computeAlignedPositions(targets, alignment)
      const historyState = saveToHistory(state, state.template)
      const newTemplate = updateSectionElements(
        state.template,
        loc,
        (elements) => applyPositions(elements, positionMap),
        false
      )

      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),

  distributeElements: (direction: ElementDistributionType, location?: ElementLocation) =>
    set((state) => {
      const loc = location || state.selectedElementLocation
      const sectionElements = getSectionElements(state.template, loc)
      const flat = flattenElements(sectionElements)
      const targets = flat.filter((el) => state.selectedElementIds.includes(el.id))
      if (targets.length < 3) return state

      const positionMap = computeDistributedPositions(targets, direction)
      const historyState = saveToHistory(state, state.template)
      const newTemplate = updateSectionElements(
        state.template,
        loc,
        (elements) => applyPositions(elements, positionMap),
        false
      )

      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),
})
