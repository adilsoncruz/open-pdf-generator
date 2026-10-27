import type { Element, ElementLocation } from '../../../store/templateStore'
import type { SnappedGuides } from '../types'

export interface UseContainerChildDragOptions {
  child: Element
  containerId: string
  location: ElementLocation
  containerWidth: number
  containerHeight: number
  scale?: number
  snapToGuides: boolean
  horizontalGuides?: number[]
  verticalGuides?: number[]
  containerPageX?: number
  containerPageY?: number
  isSelected: boolean
  selectedElementIds: string[]
  selectContainerChild: (containerId: string, childId: string, location: ElementLocation) => void
  toggleElementSelection: (id: string, location: ElementLocation) => void
  updateContainerChildElement: (
    containerId: string,
    childId: string,
    updates: Partial<Element>,
    location?: ElementLocation
  ) => void
  updateElement: (id: string, updates: Partial<Element>, location?: ElementLocation) => void
  saveSnapshot: () => void
  onSnapGuide?: (snapped: SnappedGuides) => void
  resolveWidth: (val: string | number | undefined) => number
  resolveHeight: (val: string | number | undefined) => number
  effectiveWidth?: number | string
  effectiveX?: number
  effectiveY?: number
}

export interface DragStartState {
  x: number
  y: number
  initialX: number
  initialY: number
  initialPositions: Record<string, { x: number; y: number }>
  initialOffsetY: number
}

export interface ChildDimensions {
  childWidth: number
  childHeight: number
  isChildRelative: boolean
}

export interface SingleSnapResult {
  snappedX: number
  snappedY: number
  activeSnapH: number | null
  activeSnapV: number | null
}

export interface MultiSnapResult {
  moveDeltaX: number
  moveDeltaY: number
}
