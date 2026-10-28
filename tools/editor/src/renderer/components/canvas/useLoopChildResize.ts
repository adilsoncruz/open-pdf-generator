import { useState, useEffect, type MouseEvent as ReactMouseEvent } from 'react'
import type { Element, ElementLocation } from '../../store/templateStore'
import type { SnappedGuides } from './types'

interface UseLoopChildResizeOptions {
  child: Element
  loopId: string
  location: ElementLocation
  loopWidth: number
  loopHeight: number
  scale?: number
  snapToGuides: boolean
  horizontalGuides?: number[]
  verticalGuides?: number[]
  loopPageX?: number
  loopPageY?: number
  resolveWidth: (val: string | number | undefined) => number
  resolveHeight: (val: string | number | undefined) => number
  updateLoopChildElement: (
    loopId: string,
    childId: string,
    updates: Partial<Element>,
    location?: ElementLocation
  ) => void
  saveSnapshot: () => void
  onSnapGuide?: (snapped: SnappedGuides) => void
}

export function useLoopChildResize({
  child,
  loopId,
  location,
  loopWidth,
  loopHeight,
  scale = 1,
  snapToGuides,
  horizontalGuides = [],
  verticalGuides = [],
  loopPageX,
  loopPageY,
  resolveWidth,
  resolveHeight,
  updateLoopChildElement,
  saveSnapshot,
  onSnapGuide,
}: UseLoopChildResizeOptions) {
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    initialW: 0,
    initialH: 0,
    direction: '',
  })

  const handleResizeMouseDown = (e: ReactMouseEvent, direction: string) => {
    e.stopPropagation()
    setIsResizing(direction)
    const initialW = resolveWidth(child.width)
    const initialH = resolveHeight(child.height)
    setResizeStart({ x: e.clientX, y: e.clientY, initialW, initialH, direction })
  }

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const currentScale = scale || 1
      const deltaX = (e.clientX - resizeStart.x) / currentScale
      const deltaY = (e.clientY - resizeStart.y) / currentScale

      let newWidth = resizeStart.initialW + deltaX
      let newHeight = resizeStart.initialH + deltaY

      if (snapToGuides) {
        const snapTolerance = 8
        let minDistanceX = snapTolerance + 1
        let minDistanceY = snapTolerance + 1
        let activeSnapH: number | null = null
        let activeSnapV: number | null = null

        const currentX = child.x || 0
        const currentY = child.y || 0

        // Snap to loop right edge
        if (Math.abs(currentX + newWidth - loopWidth) < minDistanceX) {
          minDistanceX = Math.abs(currentX + newWidth - loopWidth)
          newWidth = loopWidth - currentX
        }
        // Snap to loop bottom edge
        if (Math.abs(currentY + newHeight - loopHeight) < minDistanceY) {
          minDistanceY = Math.abs(currentY + newHeight - loopHeight)
          newHeight = loopHeight - currentY
        }

        // Snap to vertical guides
        if (loopPageX !== undefined) {
          verticalGuides.forEach((guidePageX) => {
            const guideLocalX = guidePageX - loopPageX
            const dist = Math.abs(currentX + newWidth - guideLocalX)
            if (dist < minDistanceX) {
              minDistanceX = dist
              newWidth = guideLocalX - currentX
              activeSnapV = guidePageX
            }
          })
        }

        // Snap to horizontal guides
        if (loopPageY !== undefined) {
          horizontalGuides.forEach((guidePageY) => {
            const guideLocalY = guidePageY - loopPageY
            const dist = Math.abs(currentY + newHeight - guideLocalY)
            if (dist < minDistanceY) {
              minDistanceY = dist
              newHeight = guideLocalY - currentY
              activeSnapH = guidePageY
            }
          })
        }

        onSnapGuide?.({ h: activeSnapH, v: activeSnapV })
      }

      newWidth = Math.max(10, Math.min(loopWidth - (child.x || 0), newWidth))
      newHeight = Math.max(10, Math.min(loopHeight - (child.y || 0), newHeight))

      updateLoopChildElement(
        loopId,
        child.id,
        { width: newWidth, height: newHeight },
        location
      )
    }

    const handleMouseUp = () => {
      setIsResizing(null)
      onSnapGuide?.({ h: null, v: null })
      saveSnapshot()
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [
    isResizing,
    resizeStart,
    loopId,
    child.id,
    child.x,
    child.y,
    loopWidth,
    loopHeight,
    location,
    updateLoopChildElement,
    saveSnapshot,
    snapToGuides,
    horizontalGuides,
    verticalGuides,
    loopPageX,
    loopPageY,
    scale,
    onSnapGuide,
  ])

  return {
    isResizing,
    handleResizeMouseDown,
  }
}
