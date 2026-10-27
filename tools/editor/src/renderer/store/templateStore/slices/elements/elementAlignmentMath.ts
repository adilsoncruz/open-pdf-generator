import type { Element } from '../../types'

export type ElementAlignmentType = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
export type ElementDistributionType = 'horizontal' | 'vertical'

const getWidth = (el: Element): number => (typeof el.width === 'number' ? el.width : 100)
const getHeight = (el: Element): number => (typeof el.height === 'number' ? el.height : 25)

/**
 * Calculates new coordinates for elements when aligning.
 */
export function computeAlignedPositions(
  targets: Element[],
  alignment: ElementAlignmentType,
  parentBounds?: { width: number; height: number }
): Map<string, { x?: number; y?: number }> {
  const result = new Map<string, { x?: number; y?: number }>()
  if (targets.length === 0) return result

  // Single element aligned to parent container or section bounds
  if (targets.length === 1 && parentBounds) {
    const el = targets[0]
    const w = getWidth(el)
    const h = getHeight(el)

    const coords: Record<ElementAlignmentType, { x?: number; y?: number }> = {
      left: { x: 0 },
      center: { x: Math.max(0, Math.round((parentBounds.width - w) / 2)) },
      right: { x: Math.max(0, Math.round(parentBounds.width - w)) },
      top: { y: 0 },
      middle: { y: Math.max(0, Math.round((parentBounds.height - h) / 2)) },
      bottom: { y: Math.max(0, Math.round(parentBounds.height - h)) },
    }
    result.set(el.id, coords[alignment])
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

    const coords: Record<ElementAlignmentType, { x?: number; y?: number }> = {
      left: { x: minX },
      center: { x: Math.round(boxCenterX - w / 2) },
      right: { x: Math.round(maxX - w) },
      top: { y: minY },
      middle: { y: Math.round(boxCenterY - h / 2) },
      bottom: { y: Math.round(maxY - h) },
    }
    result.set(el.id, coords[alignment])
  }

  return result
}

/**
 * Calculates new coordinates for distributing elements evenly.
 */
export function computeDistributedPositions(
  targets: Element[],
  direction: ElementDistributionType
): Map<string, { x?: number; y?: number }> {
  const result = new Map<string, { x?: number; y?: number }>()
  if (targets.length < 3) return result

  const isHoriz = direction === 'horizontal'
  const key = isHoriz ? 'x' : 'y'
  const getSize = isHoriz ? getWidth : getHeight

  const sorted = [...targets].sort(
    (a, b) => (typeof a[key] === 'number' ? (a[key] as number) : 0) - (typeof b[key] === 'number' ? (b[key] as number) : 0)
  )
  const first = sorted[0]
  const last = sorted[sorted.length - 1]

  const firstPos = typeof first[key] === 'number' ? (first[key] as number) : 0
  const lastPos = typeof last[key] === 'number' ? (last[key] as number) : 0
  const lastEnd = lastPos + getSize(last)

  const totalSizes = sorted.reduce((sum, el) => sum + getSize(el), 0)
  const totalSpan = lastEnd - firstPos
  const totalGap = totalSpan - totalSizes
  const gap = totalGap > 0 ? totalGap / (sorted.length - 1) : 0

  let currentPos = firstPos
  for (const el of sorted) {
    result.set(el.id, { [key]: Math.round(currentPos) })
    currentPos += getSize(el) + gap
  }

  return result
}

/**
 * Recursively applies position changes to a list of elements.
 */
export function applyPositions(
  elements: Element[],
  positionMap: Map<string, { x?: number; y?: number }>
): Element[] {
  return elements.map((el) => {
    const pos = positionMap.get(el.id)
    const updated = pos
      ? {
          ...el,
          ...(pos.x !== undefined ? { x: pos.x } : {}),
          ...(pos.y !== undefined ? { y: pos.y } : {}),
        }
      : el

    if (updated.elements && updated.elements.length > 0) {
      return {
        ...updated,
        elements: applyPositions(updated.elements, positionMap),
      }
    }

    return updated
  })
}
