import { useState, useEffect, type MouseEvent as ReactMouseEvent } from 'react'
import type { Element, ElementLocation } from '../../store/templateStore'
import type { SnappedGuides } from './types'

interface UseLoopChildDragOptions {
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
  isSelected: boolean
  selectLoopChild: (loopId: string, childId: string, location: ElementLocation) => void
  toggleElementSelection: (id: string, location: ElementLocation) => void
  updateLoopChildElement: (
    loopId: string,
    childId: string,
    updates: Partial<Element>,
    location?: ElementLocation
  ) => void
  saveSnapshot: () => void
  onSnapGuide?: (snapped: SnappedGuides) => void
  resolveWidth: (val: string | number | undefined) => number
  resolveHeight: (val: string | number | undefined) => number
}

export function useLoopChildDrag({
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
  isSelected,
  selectLoopChild,
  toggleElementSelection,
  updateLoopChildElement,
  saveSnapshot,
  onSnapGuide,
  resolveWidth,
  resolveHeight,
}: UseLoopChildDragOptions) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, initialX: 0, initialY: 0 })

  const handleMouseDown = (e: ReactMouseEvent) => {
    if (e.button !== 0) return
    e.stopPropagation()
    if (e.ctrlKey || e.metaKey || e.shiftKey) {
      toggleElementSelection(child.id, location)
      return
    }
    if (!isSelected) {
      selectLoopChild(loopId, child.id, location)
    }
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY, initialX: child.x || 0, initialY: child.y || 0 })
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const currentScale = scale || 1
      const deltaX = (e.clientX - dragStart.x) / currentScale
      const deltaY = (e.clientY - dragStart.y) / currentScale

      const childWidth = resolveWidth(child.width)
      const childHeight = resolveHeight(child.height)

      let newX = dragStart.initialX + deltaX
      let newY = dragStart.initialY + deltaY

      if (snapToGuides) {
        const snapTolerance = 8
        let minDistanceX = snapTolerance + 1
        let minDistanceY = snapTolerance + 1
        let activeSnapH: number | null = null
        let activeSnapV: number | null = null

        // 1. Loop boundaries snap
        if (Math.abs(newX) < minDistanceX) {
          minDistanceX = Math.abs(newX)
          newX = 0
        }
        if (Math.abs(newX + childWidth - loopWidth) < minDistanceX) {
          minDistanceX = Math.abs(newX + childWidth - loopWidth)
          newX = loopWidth - childWidth
        }
        if (Math.abs(newX + childWidth / 2 - loopWidth / 2) < minDistanceX) {
          minDistanceX = Math.abs(newX + childWidth / 2 - loopWidth / 2)
          newX = loopWidth / 2 - childWidth / 2
        }

        if (Math.abs(newY) < minDistanceY) {
          minDistanceY = Math.abs(newY)
          newY = 0
        }
        if (Math.abs(newY + childHeight - loopHeight) < minDistanceY) {
          minDistanceY = Math.abs(newY + childHeight - loopHeight)
          newY = loopHeight - childHeight
        }
        if (Math.abs(newY + childHeight / 2 - loopHeight / 2) < minDistanceY) {
          minDistanceY = Math.abs(newY + childHeight / 2 - loopHeight / 2)
          newY = loopHeight / 2 - childHeight / 2
        }

        // 2. Vertical Guides Snap
        if (loopPageX !== undefined) {
          verticalGuides.forEach((guidePageX) => {
            const guideLocalX = guidePageX - loopPageX

            // Left edge
            const distLeft = Math.abs(newX - guideLocalX)
            if (distLeft < minDistanceX) {
              minDistanceX = distLeft
              newX = guideLocalX
              activeSnapV = guidePageX
            }

            // Right edge
            const distRight = Math.abs(newX + childWidth - guideLocalX)
            if (distRight < minDistanceX) {
              minDistanceX = distRight
              newX = guideLocalX - childWidth
              activeSnapV = guidePageX
            }

            // Center
            const distCenter = Math.abs(newX + childWidth / 2 - guideLocalX)
            if (distCenter < minDistanceX) {
              minDistanceX = distCenter
              newX = guideLocalX - childWidth / 2
              activeSnapV = guidePageX
            }
          })
        }

        // 3. Horizontal Guides Snap
        if (loopPageY !== undefined) {
          horizontalGuides.forEach((guidePageY) => {
            const guideLocalY = guidePageY - loopPageY

            // Top edge
            const distTop = Math.abs(newY - guideLocalY)
            if (distTop < minDistanceY) {
              minDistanceY = distTop
              newY = guideLocalY
              activeSnapH = guidePageY
            }

            // Bottom edge
            const distBottom = Math.abs(newY + childHeight - guideLocalY)
            if (distBottom < minDistanceY) {
              minDistanceY = distBottom
              newY = guideLocalY - childHeight
              activeSnapH = guidePageY
            }

            // Center
            const distCenter = Math.abs(newY + childHeight / 2 - guideLocalY)
            if (distCenter < minDistanceY) {
              minDistanceY = distCenter
              newY = guideLocalY - childHeight / 2
              activeSnapH = guidePageY
            }
          })
        }

        onSnapGuide?.({ h: activeSnapH, v: activeSnapV })
      }

      const isWidth100 = child.width === '100%'
      const isHeight100 = child.height === '100%'
      const clampedX = isWidth100 ? 0 : Math.max(0, Math.min(newX, loopWidth - childWidth))
      const clampedY = isHeight100 ? 0 : Math.max(0, Math.min(newY, loopHeight - childHeight))

      updateLoopChildElement(loopId, child.id, { x: clampedX, y: clampedY }, location)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      onSnapGuide?.({ h: null, v: null })
      saveSnapshot()
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [
    isDragging,
    dragStart,
    scale,
    child.id,
    child.width,
    child.height,
    loopId,
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
    onSnapGuide,
    resolveWidth,
    resolveHeight,
  ])

  return {
    isDragging,
    handleMouseDown,
  }
}
