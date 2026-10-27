import { useState, useEffect, type MouseEvent as ReactMouseEvent } from 'react'
import type { Element, ElementLocation } from '../../store/templateStore'
import type { SnappedGuides } from './types'

interface UseCanvasElementDragOptions {
  element: Element
  effectiveY?: number
  scale?: number
  isMultiSelection: boolean
  snapToGuides: boolean
  allElements: Element[]
  selectedElementLocation: ElementLocation | null
  onSelect: (ctrlKey: boolean) => void
  onUpdate: (updates: Partial<Element>) => void
  updateElement: (id: string, updates: Partial<Element>, location?: ElementLocation) => void
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

export function useCanvasElementDrag({
  element,
  effectiveY,
  scale = 1,
  isMultiSelection,
  snapToGuides,
  allElements,
  selectedElementLocation,
  onSelect,
  onUpdate,
  updateElement,
  saveSnapshot,
  getElementDimensions,
  applySnap,
  onSnapGuide,
}: UseCanvasElementDragOptions) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0,
    initialPositions: {} as Record<string, { x: number; y: number }>,
    initialOffsetY: 10,
  })

  const handleMouseDown = (e: ReactMouseEvent) => {
    e.stopPropagation()
    const isCtrlPressed = e.ctrlKey || e.metaKey
    onSelect(isCtrlPressed)

    setIsDragging(true)
    const initialPositions: Record<string, { x: number; y: number }> = {}

    if (isMultiSelection) {
      allElements.forEach((el) => {
        initialPositions[el.id] = { x: el.x || 0, y: el.y || 0 }
      })
    } else {
      initialPositions[element.id] = {
        x: element.x || 0,
        y: (effectiveY !== undefined ? effectiveY : element.y) || 0,
      }
    }

    setDragStart({
      x: e.clientX,
      y: e.clientY,
      initialPositions,
      initialOffsetY: element.relativeOffsetY || 10,
    })
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const currentScale = scale || 1
      const deltaX = (e.clientX - dragStart.x) / currentScale
      const deltaY = (e.clientY - dragStart.y) / currentScale

      if (isMultiSelection && Object.keys(dragStart.initialPositions).length > 1) {
        const primaryInit = dragStart.initialPositions[element.id]
        let moveDeltaX = deltaX
        let moveDeltaY = deltaY
        if (primaryInit && snapToGuides) {
          const rawX = primaryInit.x + deltaX
          const rawY = primaryInit.y + deltaY
          const dims = getElementDimensions()
          const snapped = applySnap(rawX, rawY, dims.width, dims.height)
          moveDeltaX = snapped.x - primaryInit.x
          moveDeltaY = snapped.y - primaryInit.y
        }
        Object.keys(dragStart.initialPositions).forEach((id) => {
          const initialPos = dragStart.initialPositions[id]
          const newX = initialPos.x + moveDeltaX
          const newY = initialPos.y + moveDeltaY
          updateElement(id, { x: newX, y: newY }, selectedElementLocation ?? undefined)
        })
      } else {
        const initialPos = dragStart.initialPositions[element.id]
        if (!initialPos) return

        let newX = initialPos.x + deltaX
        let newY = initialPos.y + deltaY

        if (element.width === '100%') newX = 0
        if (element.height === '100%') newY = 0

        if (element.width !== '100%' || element.height !== '100%') {
          const dims = getElementDimensions()
          const width = typeof element.width === 'number' ? element.width : dims.width
          const height = typeof element.height === 'number' ? element.height : dims.height
          const snapped = applySnap(newX, newY, width, height)
          if (element.width !== '100%') newX = snapped.x
          if (element.height !== '100%') newY = snapped.y
        }

        const isRelative = (element.positionMode || element.position || '').toUpperCase() === 'RELATIVE'
        if (isRelative && effectiveY !== undefined) {
          const newOffset = element.height === '100%' ? 0 : Math.max(0, dragStart.initialOffsetY + deltaY)
          onUpdate({ x: newX, y: newY, relativeOffsetY: newOffset })
        } else {
          onUpdate({ x: newX, y: newY })
        }
      }
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
    onUpdate,
    isMultiSelection,
    selectedElementLocation,
    element.id,
    element.width,
    element.height,
    saveSnapshot,
    snapToGuides,
    applySnap,
    getElementDimensions,
    effectiveY,
    onSnapGuide,
    updateElement,
  ])

  return {
    isDragging,
    handleMouseDown,
  }
}
