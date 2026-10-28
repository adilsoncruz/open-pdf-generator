import { useState, useEffect, type MouseEvent as ReactMouseEvent } from 'react'
import { useTemplateStore } from '../../../store/templateStore'
import type { UseContainerChildDragOptions, DragStartState } from './types'
import {
  calculateDragDelta,
  resolveChildDimensions,
  getInitialOffsetY,
  calculateRelativeOffsetY,
  clampChildCoordinates,
  collectInitialPositions,
  applyMultiChildDragUpdate,
} from './dragCoordinates'
import { snapSingleChildCoordinates, calculateMultiChildDragDeltas } from './dragSnapping'

export function useContainerChildDrag(options: UseContainerChildDragOptions) {
  const {
    child, containerId, location, containerWidth, containerHeight,
    scale = 1, snapToGuides, horizontalGuides = [], verticalGuides = [],
    containerPageX, containerPageY, isSelected, selectedElementIds,
    selectContainerChild, toggleElementSelection, updateContainerChildElement,
    updateElement, saveSnapshot, onSnapGuide, resolveWidth, resolveHeight,
    effectiveWidth, effectiveY,
  } = options

  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<DragStartState>({
    x: 0,
    y: 0,
    initialX: 0,
    initialY: 0,
    initialPositions: {},
    initialOffsetY: 10,
  })

  const template = useTemplateStore((state) => state.template)

  const handleMouseDown = (e: ReactMouseEvent) => {
    if (e.button !== 0) return
    e.stopPropagation()

    if (e.ctrlKey || e.metaKey || e.shiftKey) {
      toggleElementSelection(child.id, location)
      return
    }

    if (!isSelected) {
      selectContainerChild(containerId, child.id, location)
    }

    const initialPositions = collectInitialPositions(location, selectedElementIds, child, template)
    setIsDragging(true)
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      initialX: child.x || 0,
      initialY: child.y || 0,
      initialPositions,
      initialOffsetY: getInitialOffsetY(child),
    })
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const { deltaX, deltaY } = calculateDragDelta(e.clientX, e.clientY, dragStart.x, dragStart.y, scale)
      const isMulti = selectedElementIds.length > 1
      const { childWidth, childHeight, isChildRelative } = resolveChildDimensions(
        child,
        effectiveWidth,
        resolveWidth,
        resolveHeight
      )

      if (isMulti && Object.keys(dragStart.initialPositions).length > 1) {
        const primaryInit = dragStart.initialPositions[child.id]
        const { moveDeltaX, moveDeltaY } = primaryInit
          ? calculateMultiChildDragDeltas(
              primaryInit,
              deltaX,
              deltaY,
              childWidth,
              childHeight,
              containerWidth,
              containerHeight,
              containerPageX,
              containerPageY,
              horizontalGuides,
              verticalGuides,
              snapToGuides
            )
          : { moveDeltaX: deltaX, moveDeltaY: deltaY }

        applyMultiChildDragUpdate(dragStart.initialPositions, moveDeltaX, moveDeltaY, location, updateElement)
      } else {
        let newX = dragStart.initialX + deltaX
        let newY = dragStart.initialY + deltaY

        if (snapToGuides) {
          const snap = snapSingleChildCoordinates({
            rawX: newX,
            rawY: newY,
            childWidth,
            childHeight,
            containerWidth,
            containerHeight,
            containerPageX,
            containerPageY,
            horizontalGuides,
            verticalGuides,
          })
          newX = snap.snappedX
          newY = snap.snappedY
          onSnapGuide?.({ h: snap.activeSnapH, v: snap.activeSnapV })
        }

        const { clampedX, clampedY } = clampChildCoordinates(
          newX,
          newY,
          childWidth,
          childHeight,
          containerWidth,
          containerHeight,
          child.width === '100%',
          child.height === '100%'
        )

        const updates: Partial<typeof child> = { x: clampedX, y: clampedY }
        if (isChildRelative && effectiveY !== undefined) {
          updates.relativeOffsetY = calculateRelativeOffsetY(child.height, dragStart.initialOffsetY, deltaY)
        }
        updateContainerChildElement(containerId, child.id, updates, location)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
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
    isDragging, dragStart, child, containerId, location,
    containerWidth, containerHeight, scale, snapToGuides,
    horizontalGuides, verticalGuides, containerPageX, containerPageY,
    selectedElementIds, effectiveWidth, effectiveY,
    updateContainerChildElement, updateElement, saveSnapshot,
    onSnapGuide, resolveWidth, resolveHeight,
  ])

  return { isDragging, handleMouseDown }
}
