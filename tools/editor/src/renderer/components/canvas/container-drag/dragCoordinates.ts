import {
  type Element,
  type ElementLocation,
  flattenElements,
} from '../../../store/templateStore'
import type { ChildDimensions } from './types'

export function isRelativeChild(child: Element): boolean {
  const posMode = child.positionMode || (child as any).position || ''
  return String(posMode).toUpperCase() === 'RELATIVE'
}

export function calculateDragDelta(
  clientX: number,
  clientY: number,
  startX: number,
  startY: number,
  scale: number = 1
): { deltaX: number; deltaY: number } {
  const currentScale = scale || 1
  return {
    deltaX: (clientX - startX) / currentScale,
    deltaY: (clientY - startY) / currentScale,
  }
}

export function resolveChildDimensions(
  child: Element,
  effectiveWidth: number | string | undefined,
  resolveWidth: (val: string | number | undefined) => number,
  resolveHeight: (val: string | number | undefined) => number
): ChildDimensions {
  const isChildRelative = isRelativeChild(child)
  const rawW = isChildRelative && effectiveWidth !== undefined ? effectiveWidth : child.width
  const childWidth = rawW ? resolveWidth(rawW) : 100
  const childHeight = child.height ? resolveHeight(child.height) : 25

  return { childWidth, childHeight, isChildRelative }
}

export function getInitialOffsetY(child: Element): number {
  if (child.height === '100%') return 0
  return typeof child.relativeOffsetY === 'number' ? child.relativeOffsetY : 10
}

export function calculateRelativeOffsetY(
  childHeight: string | number | undefined,
  initialOffsetY: number,
  deltaY: number
): number {
  return childHeight === '100%' ? 0 : Math.max(0, initialOffsetY + deltaY)
}

export function clampChildCoordinates(
  newX: number,
  newY: number,
  childWidth: number,
  childHeight: number,
  containerWidth: number,
  containerHeight: number,
  isWidth100: boolean,
  isHeight100: boolean
): { clampedX: number; clampedY: number } {
  const clampedX = isWidth100 ? 0 : Math.max(0, Math.min(newX, containerWidth - childWidth))
  const clampedY = isHeight100 ? 0 : Math.max(0, Math.min(newY, containerHeight - childHeight))
  return { clampedX, clampedY }
}

export function collectInitialPositions(
  location: ElementLocation,
  selectedElementIds: string[],
  child: Element,
  template: any
): Record<string, { x: number; y: number }> {
  const initialPositions: Record<string, { x: number; y: number }> = {}

  if (selectedElementIds.length > 1) {
    let sectionElements: Element[] = []
    if (location === 'header' && template.pageSettings?.header) {
      sectionElements = template.pageSettings.header.elements
    } else if (location === 'footer' && template.pageSettings?.footer) {
      sectionElements = template.pageSettings.footer.elements
    } else if (location === 'bodyBackground' && template.pageSettings?.bodyBackground) {
      sectionElements = template.pageSettings.bodyBackground.elements
    } else if (location === 'summary' && template.summaryPage) {
      sectionElements = template.summaryPage.elements
    } else {
      sectionElements = template.page || []
    }
    const flat = flattenElements(sectionElements)
    flat.forEach((el) => {
      if (selectedElementIds.includes(el.id)) {
        initialPositions[el.id] = { x: el.x || 0, y: el.y || 0 }
      }
    })
  } else {
    initialPositions[child.id] = { x: child.x || 0, y: child.y || 0 }
  }

  return initialPositions
}

export function applyMultiChildDragUpdate(
  initialPositions: Record<string, { x: number; y: number }>,
  moveDeltaX: number,
  moveDeltaY: number,
  location: ElementLocation,
  updateElement: (id: string, updates: Partial<Element>, location?: ElementLocation) => void
): void {
  Object.keys(initialPositions).forEach((id) => {
    const initialPos = initialPositions[id]
    updateElement(id, { x: initialPos.x + moveDeltaX, y: initialPos.y + moveDeltaY }, location)
  })
}
