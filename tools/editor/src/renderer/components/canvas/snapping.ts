import type { Element, ElementLocation } from '../../store/templateStore'
import type { SnappedGuides } from './types'

export interface MarginSnapResult {
  top: boolean
  bottom: boolean
  left: boolean
  right: boolean
}

export function checkMarginSnap(
  elements: Element[],
  pageSize: { width: number; height: number },
  margins: { top: number; right: number; bottom: number; left: number },
  bodyUsableHeight: number,
  snapTolerance: number = 5
): MarginSnapResult {
  const snapped: MarginSnapResult = {
    top: false,
    bottom: false,
    left: false,
    right: false,
  }

  const containerWidth = pageSize.width - margins.left - margins.right

  elements.forEach((element) => {
    const x = element.x
    const y = element.y
    const width = element.width
    const height = element.height

    if (x === undefined || y === undefined) return

    // Check left margin (x=0 inside body container)
    if (Math.abs(x) <= snapTolerance) {
      snapped.left = true
    }

    // Check right margin (only if width is set and is a number)
    if (typeof width === 'number' && Math.abs((x + width) - containerWidth) <= snapTolerance) {
      snapped.right = true
    }

    // Check top margin (y=0 inside body container)
    if (Math.abs(y) <= snapTolerance) {
      snapped.top = true
    }

    // Check bottom margin (only if height is set and is a number)
    if (typeof height === 'number' && Math.abs((y + height) - bodyUsableHeight) <= snapTolerance) {
      snapped.bottom = true
    }
  })

  return snapped
}

export interface ApplyCanvasSnapParams {
  x: number
  y: number
  width: number
  height: number
  options?: { snapX?: boolean; snapY?: boolean }
  snapTolerance?: number
  pageSize: { width: number; height: number }
  margins: { top: number; right: number; bottom: number; left: number }
  headerHeight?: number
  footerHeight?: number
  location: ElementLocation
  containerOffsetX?: number
  containerOffsetY?: number
  horizontalGuides?: number[]
  verticalGuides?: number[]
  onSnapGuide?: (snapped: SnappedGuides) => void
}

export function applyCanvasSnap({
  x,
  y,
  width,
  height,
  options,
  snapTolerance = 8,
  pageSize,
  margins,
  headerHeight = 0,
  footerHeight = 0,
  location,
  containerOffsetX,
  containerOffsetY,
  horizontalGuides = [],
  verticalGuides = [],
  onSnapGuide,
}: ApplyCanvasSnapParams): { x: number; y: number } {
  let snappedX = x
  let snappedY = y
  let activeSnapH: number | null = null
  let activeSnapV: number | null = null

  const checkX = options?.snapX !== false
  const checkY = options?.snapY !== false

  const resolvedOffsetX = containerOffsetX !== undefined ? containerOffsetX : margins.left
  const resolvedOffsetY =
    containerOffsetY !== undefined
      ? containerOffsetY
      : margins.top + (location === 'body' ? headerHeight : 0)

  const containerWidth = pageSize.width - margins.left - margins.right
  const bodyUsableHeight = pageSize.height - margins.top - margins.bottom - headerHeight - footerHeight

  if (checkX) {
    let minDistanceX = snapTolerance + 1

    // 1. Margins Snap
    // Left margin (x = 0 no container)
    if (Math.abs(x) < minDistanceX) {
      minDistanceX = Math.abs(x)
      snappedX = 0
    }
    // Right margin (x + width = containerWidth)
    if (width > 0 && Math.abs(x + width - containerWidth) < minDistanceX) {
      minDistanceX = Math.abs(x + width - containerWidth)
      snappedX = containerWidth - width
    }
    // Usable container center
    if (width > 0 && Math.abs(x + width / 2 - containerWidth / 2) < minDistanceX) {
      minDistanceX = Math.abs(x + width / 2 - containerWidth / 2)
      snappedX = containerWidth / 2 - width / 2
    }

    // 2. Vertical Guides Snap
    verticalGuides.forEach((guidePageX) => {
      const guideLocalX = guidePageX - resolvedOffsetX

      // Left edge
      const distLeft = Math.abs(x - guideLocalX)
      if (distLeft < minDistanceX) {
        minDistanceX = distLeft
        snappedX = guideLocalX
        activeSnapV = guidePageX
      }

      // Right edge
      if (width > 0) {
        const distRight = Math.abs(x + width - guideLocalX)
        if (distRight < minDistanceX) {
          minDistanceX = distRight
          snappedX = guideLocalX - width
          activeSnapV = guidePageX
        }

        // Center
        const distCenter = Math.abs(x + width / 2 - guideLocalX)
        if (distCenter < minDistanceX) {
          minDistanceX = distCenter
          snappedX = guideLocalX - width / 2
          activeSnapV = guidePageX
        }
      }
    })
  }

  if (checkY) {
    let minDistanceY = snapTolerance + 1

    // 1. Margins Snap
    if (location === 'body') {
      // Top margin / header boundary (y = 0 no body)
      if (Math.abs(y) < minDistanceY) {
        minDistanceY = Math.abs(y)
        snappedY = 0
      }
      // Bottom margin / footer boundary
      if (height > 0 && Math.abs(y + height - bodyUsableHeight) < minDistanceY) {
        minDistanceY = Math.abs(y + height - bodyUsableHeight)
        snappedY = bodyUsableHeight - height
      }
      // Center of usable body height
      if (height > 0 && Math.abs(y + height / 2 - bodyUsableHeight / 2) < minDistanceY) {
        minDistanceY = Math.abs(y + height / 2 - bodyUsableHeight / 2)
        snappedY = bodyUsableHeight / 2 - height / 2
      }
    } else if (location === 'header') {
      if (Math.abs(y) < minDistanceY) {
        minDistanceY = Math.abs(y)
        snappedY = 0
      }
      if (height > 0 && Math.abs(y + height - headerHeight) < minDistanceY) {
        minDistanceY = Math.abs(y + height - headerHeight)
        snappedY = headerHeight - height
      }
    } else if (location === 'footer') {
      if (Math.abs(y) < minDistanceY) {
        minDistanceY = Math.abs(y)
        snappedY = 0
      }
      if (height > 0 && Math.abs(y + height - footerHeight) < minDistanceY) {
        minDistanceY = Math.abs(y + height - footerHeight)
        snappedY = footerHeight - height
      }
    }

    // 2. Horizontal Guides Snap
    horizontalGuides.forEach((guidePageY) => {
      const guideLocalY = guidePageY - resolvedOffsetY

      // Top edge
      const distTop = Math.abs(y - guideLocalY)
      if (distTop < minDistanceY) {
        minDistanceY = distTop
        snappedY = guideLocalY
        activeSnapH = guidePageY
      }

      if (height > 0) {
        // Bottom edge
        const distBottom = Math.abs(y + height - guideLocalY)
        if (distBottom < minDistanceY) {
          minDistanceY = distBottom
          snappedY = guideLocalY - height
          activeSnapH = guidePageY
        }

        // Center
        const distCenter = Math.abs(y + height / 2 - guideLocalY)
        if (distCenter < minDistanceY) {
          minDistanceY = distCenter
          snappedY = guideLocalY - height / 2
          activeSnapH = guidePageY
        }
      }
    })
  }

  onSnapGuide?.({ h: activeSnapH, v: activeSnapV })
  return { x: snappedX, y: snappedY }
}
