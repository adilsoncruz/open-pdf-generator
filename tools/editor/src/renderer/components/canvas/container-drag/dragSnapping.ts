import type { SingleSnapResult, MultiSnapResult } from './types'

export interface SnapChildParams {
  rawX: number
  rawY: number
  childWidth: number
  childHeight: number
  containerWidth: number
  containerHeight: number
  containerPageX?: number
  containerPageY?: number
  horizontalGuides?: number[]
  verticalGuides?: number[]
  snapTolerance?: number
}

export type SnapSingleChildParams = SnapChildParams
export type SnapMultiChildParams = SnapChildParams

function snapSingleAxis(
  raw: number,
  size: number,
  containerSize: number,
  pageOffset: number | undefined,
  guides: number[],
  tolerance: number
): { snapped: number; activeGuide: number | null } {
  let minDistance = tolerance + 1
  let snapped = raw
  let activeGuide: number | null = null

  if (Math.abs(snapped) < minDistance) {
    minDistance = Math.abs(snapped)
    snapped = 0
  }
  if (Math.abs(snapped + size - containerSize) < minDistance) {
    minDistance = Math.abs(snapped + size - containerSize)
    snapped = containerSize - size
  }
  if (Math.abs(snapped + size / 2 - containerSize / 2) < minDistance) {
    minDistance = Math.abs(snapped + size / 2 - containerSize / 2)
    snapped = containerSize / 2 - size / 2
  }

  if (pageOffset !== undefined) {
    guides.forEach((guidePage) => {
      const guideLocal = guidePage - pageOffset
      const distStart = Math.abs(snapped - guideLocal)
      if (distStart < minDistance) {
        minDistance = distStart
        snapped = guideLocal
        activeGuide = guidePage
      }
      const distEnd = Math.abs(snapped + size - guideLocal)
      if (distEnd < minDistance) {
        minDistance = distEnd
        snapped = guideLocal - size
        activeGuide = guidePage
      }
      const distCenter = Math.abs(snapped + size / 2 - guideLocal)
      if (distCenter < minDistance) {
        minDistance = distCenter
        snapped = guideLocal - size / 2
        activeGuide = guidePage
      }
    })
  }

  return { snapped, activeGuide }
}

export function snapSingleChildCoordinates(params: SnapSingleChildParams): SingleSnapResult {
  const tolerance = params.snapTolerance ?? 8
  const x = snapSingleAxis(
    params.rawX,
    params.childWidth,
    params.containerWidth,
    params.containerPageX,
    params.verticalGuides ?? [],
    tolerance
  )
  const y = snapSingleAxis(
    params.rawY,
    params.childHeight,
    params.containerHeight,
    params.containerPageY,
    params.horizontalGuides ?? [],
    tolerance
  )
  return { snappedX: x.snapped, snappedY: y.snapped, activeSnapH: y.activeGuide, activeSnapV: x.activeGuide }
}

function snapMultiAxis(
  raw: number,
  size: number,
  containerSize: number,
  pageOffset: number | undefined,
  guides: number[],
  tolerance: number
): number {
  const minDistance = tolerance + 1
  let snapped = raw
  if (Math.abs(raw) < minDistance) snapped = 0
  if (Math.abs(raw + size - containerSize) < minDistance) snapped = containerSize - size

  if (pageOffset !== undefined) {
    guides.forEach((guidePage) => {
      const guideLocal = guidePage - pageOffset
      if (Math.abs(raw - guideLocal) < minDistance) snapped = guideLocal
      if (Math.abs(raw + size - guideLocal) < minDistance) snapped = guideLocal - size
    })
  }
  return snapped
}

export function snapMultiChildCoordinates(params: SnapMultiChildParams): { snappedX: number; snappedY: number } {
  const tolerance = params.snapTolerance ?? 8
  return {
    snappedX: snapMultiAxis(params.rawX, params.childWidth, params.containerWidth, params.containerPageX, params.verticalGuides ?? [], tolerance),
    snappedY: snapMultiAxis(params.rawY, params.childHeight, params.containerHeight, params.containerPageY, params.horizontalGuides ?? [], tolerance),
  }
}

export function calculateMultiChildDragDeltas(
  primaryInit: { x: number; y: number },
  deltaX: number,
  deltaY: number,
  childWidth: number,
  childHeight: number,
  containerWidth: number,
  containerHeight: number,
  containerPageX?: number,
  containerPageY?: number,
  horizontalGuides: number[] = [],
  verticalGuides: number[] = [],
  snapToGuides: boolean = true
): MultiSnapResult {
  if (!snapToGuides) return { moveDeltaX: deltaX, moveDeltaY: deltaY }

  const { snappedX, snappedY } = snapMultiChildCoordinates({
    rawX: primaryInit.x + deltaX,
    rawY: primaryInit.y + deltaY,
    childWidth,
    childHeight,
    containerWidth,
    containerHeight,
    containerPageX,
    containerPageY,
    horizontalGuides,
    verticalGuides,
  })

  return {
    moveDeltaX: snappedX - primaryInit.x,
    moveDeltaY: snappedY - primaryInit.y,
  }
}
