import { useState, useEffect, type MouseEvent as ReactMouseEvent } from 'react'
import type { Element } from '../../store/templateStore'
import type { SnappedGuides } from './types'

interface UseCanvasElementResizeOptions {
  element: Element
  effectiveY?: number
  scale?: number
  snapToGuides: boolean
  onUpdate: (updates: Partial<Element>) => void
  saveSnapshot: () => void
  getElementDimensions: () => { width: number; height: number }
  applySnap: (
    x: number,
    y: number,
    width: number,
    height: number,
    options?: { snapX?: boolean; snapY?: boolean }
  ) => { x: number; y: number }
  onSnapGuide?: (snapped: SnappedGuides) => void
}

export function useCanvasElementResize({
  element,
  effectiveY,
  scale = 1,
  snapToGuides,
  onUpdate,
  saveSnapshot,
  getElementDimensions,
  applySnap,
  onSnapGuide,
}: UseCanvasElementResizeOptions) {
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    elementX: 0,
    elementY: 0,
    elementWidth: 0,
    elementHeight: 0,
  })

  const handleResizeMouseDown = (e: ReactMouseEvent, direction: string) => {
    e.stopPropagation()
    setIsResizing(direction)
    const dims = getElementDimensions()
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      elementX: element.x || 0,
      elementY: (effectiveY !== undefined ? effectiveY : element.y) || 0,
      elementWidth: dims.width,
      elementHeight: dims.height,
    })
  }

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: globalThis.MouseEvent): void => {
      const currentScale = scale || 1
      const deltaX = (e.clientX - resizeStart.x) / currentScale
      const deltaY = (e.clientY - resizeStart.y) / currentScale

      const updates: Partial<Element> = {}

      switch (isResizing) {
        case 'nw': {
          let newX = resizeStart.elementX + deltaX
          let newY = resizeStart.elementY + deltaY
          let newWidth = Math.max(10, resizeStart.elementWidth - deltaX)
          let newHeight = Math.max(10, resizeStart.elementHeight - deltaY)

          if (snapToGuides) {
            const snapLeft = applySnap(newX, newY, 0, 0, { snapX: true, snapY: false })
            const diffX = snapLeft.x - newX
            newX = snapLeft.x
            newWidth = Math.max(10, newWidth - diffX)

            const snapTop = applySnap(newX, newY, 0, 0, { snapX: false, snapY: true })
            const diffY = snapTop.y - newY
            newY = snapTop.y
            newHeight = Math.max(10, newHeight - diffY)
          }

          updates.x = newX
          updates.y = newY
          updates.width = newWidth
          updates.height = newHeight
          break
        }
        case 'ne': {
          let newY = resizeStart.elementY + deltaY
          let newWidth = Math.max(10, resizeStart.elementWidth + deltaX)
          let newHeight = Math.max(10, resizeStart.elementHeight - deltaY)

          if (snapToGuides) {
            const snapRight = applySnap(resizeStart.elementX + newWidth, newY, 0, 0, {
              snapX: true,
              snapY: false,
            })
            newWidth = Math.max(10, snapRight.x - resizeStart.elementX)

            const snapTop = applySnap(resizeStart.elementX, newY, 0, 0, { snapX: false, snapY: true })
            const diffY = snapTop.y - newY
            newY = snapTop.y
            newHeight = Math.max(10, newHeight - diffY)
          }

          updates.y = newY
          updates.width = newWidth
          updates.height = newHeight
          break
        }
        case 'sw': {
          let newX = resizeStart.elementX + deltaX
          let newWidth = Math.max(10, resizeStart.elementWidth - deltaX)
          let newHeight = Math.max(10, resizeStart.elementHeight + deltaY)

          if (snapToGuides) {
            const snapLeft = applySnap(newX, resizeStart.elementY, 0, 0, { snapX: true, snapY: false })
            const diffX = snapLeft.x - newX
            newX = snapLeft.x
            newWidth = Math.max(10, newWidth - diffX)

            const snapBottom = applySnap(newX, resizeStart.elementY + newHeight, 0, 0, {
              snapX: false,
              snapY: true,
            })
            newHeight = Math.max(10, snapBottom.y - resizeStart.elementY)
          }

          updates.x = newX
          updates.width = newWidth
          updates.height = newHeight
          break
        }
        case 'se': {
          let newWidth = Math.max(10, resizeStart.elementWidth + deltaX)
          let newHeight = Math.max(10, resizeStart.elementHeight + deltaY)

          if (snapToGuides) {
            const snapRight = applySnap(
              resizeStart.elementX + newWidth,
              resizeStart.elementY + newHeight,
              0,
              0,
              { snapX: true, snapY: false }
            )
            newWidth = Math.max(10, snapRight.x - resizeStart.elementX)

            const snapBottom = applySnap(
              resizeStart.elementX + newWidth,
              resizeStart.elementY + newHeight,
              0,
              0,
              { snapX: false, snapY: true }
            )
            newHeight = Math.max(10, snapBottom.y - resizeStart.elementY)
          }

          updates.width = newWidth
          updates.height = newHeight
          break
        }
        case 'n': {
          let newY = resizeStart.elementY + deltaY
          let newHeight = Math.max(10, resizeStart.elementHeight - deltaY)

          if (snapToGuides) {
            const snapTop = applySnap(resizeStart.elementX, newY, 0, 0, { snapX: false, snapY: true })
            const diffY = snapTop.y - newY
            newY = snapTop.y
            newHeight = Math.max(10, newHeight - diffY)
          }

          updates.y = newY
          updates.height = newHeight
          break
        }
        case 's': {
          let newHeight = Math.max(10, resizeStart.elementHeight + deltaY)

          if (snapToGuides) {
            const snapBottom = applySnap(
              resizeStart.elementX,
              resizeStart.elementY + newHeight,
              0,
              0,
              { snapX: false, snapY: true }
            )
            newHeight = Math.max(10, snapBottom.y - resizeStart.elementY)
          }

          updates.height = newHeight
          break
        }
        case 'w': {
          let newX = resizeStart.elementX + deltaX
          let newWidth = Math.max(10, resizeStart.elementWidth - deltaX)

          if (snapToGuides) {
            const snapLeft = applySnap(newX, resizeStart.elementY, 0, 0, { snapX: true, snapY: false })
            const diffX = snapLeft.x - newX
            newX = snapLeft.x
            newWidth = Math.max(10, newWidth - diffX)
          }

          updates.x = newX
          updates.width = newWidth
          break
        }
        case 'e': {
          let newWidth = Math.max(10, resizeStart.elementWidth + deltaX)

          if (snapToGuides) {
            const snapRight = applySnap(
              resizeStart.elementX + newWidth,
              resizeStart.elementY,
              0,
              0,
              { snapX: true, snapY: false }
            )
            newWidth = Math.max(10, snapRight.x - resizeStart.elementX)
          }

          updates.width = newWidth
          break
        }
      }

      onUpdate(updates)
    }

    const handleMouseUp = () => {
      setIsResizing(null)
      onSnapGuide?.({ h: null, v: null })
      saveSnapshot()
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, resizeStart, scale, onUpdate, saveSnapshot, snapToGuides, applySnap, onSnapGuide])

  return {
    isResizing,
    handleResizeMouseDown,
  }
}
