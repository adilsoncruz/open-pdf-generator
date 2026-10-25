import { useState, useEffect, type MouseEvent as ReactMouseEvent } from 'react'
import {
  useTemplateStore,
  type Element,
  type ElementLocation,
  flattenElements,
} from '../../store/templateStore'
import type { SnappedGuides } from './types'

interface UseContainerChildDragOptions {
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

export function useContainerChildDrag({
  child,
  containerId,
  location,
  containerWidth,
  containerHeight,
  scale = 1,
  snapToGuides,
  horizontalGuides = [],
  verticalGuides = [],
  containerPageX,
  containerPageY,
  isSelected,
  selectedElementIds,
  selectContainerChild,
  toggleElementSelection,
  updateContainerChildElement,
  updateElement,
  saveSnapshot,
  onSnapGuide,
  resolveWidth,
  resolveHeight,
  effectiveWidth,
  effectiveY,
}: UseContainerChildDragOptions) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0,
    initialX: 0,
    initialY: 0,
    initialPositions: {} as Record<string, { x: number; y: number }>,
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

    const isMulti = selectedElementIds.length > 1
    const initialPositions: Record<string, { x: number; y: number }> = {}

    if (isMulti) {
      let sectionElements: Element[] = []
      if (location === 'header' && template.pageSettings.header) {
        sectionElements = template.pageSettings.header.elements
      } else if (location === 'footer' && template.pageSettings.footer) {
        sectionElements = template.pageSettings.footer.elements
      } else if (location === 'bodyBackground' && template.pageSettings.bodyBackground) {
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

    setIsDragging(true)
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      initialX: child.x || 0,
      initialY: child.y || 0,
      initialPositions,
      initialOffsetY:
        child.height === '100%'
          ? 0
          : typeof child.relativeOffsetY === 'number'
          ? child.relativeOffsetY
          : 10,
    })
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const currentScale = scale || 1
      const deltaX = (e.clientX - dragStart.x) / currentScale
      const deltaY = (e.clientY - dragStart.y) / currentScale

      const isMulti = selectedElementIds.length > 1

      if (isMulti && Object.keys(dragStart.initialPositions).length > 1) {
        const primaryInit = dragStart.initialPositions[child.id]
        let moveDeltaX = deltaX
        let moveDeltaY = deltaY

        if (primaryInit && snapToGuides) {
          const rawX = primaryInit.x + deltaX
          const rawY = primaryInit.y + deltaY
          const isChildRel =
            (child.positionMode || child.position || '').toUpperCase() === 'RELATIVE'
          const rawW = isChildRel && effectiveWidth !== undefined ? effectiveWidth : child.width
          const childWidth = rawW ? resolveWidth(rawW) : 100
          const childHeight = child.height ? resolveHeight(child.height) : 25

          const snapTolerance = 8
          let minDistanceX = snapTolerance + 1
          let minDistanceY = snapTolerance + 1

          let snappedX = rawX
          let snappedY = rawY

          if (Math.abs(rawX) < minDistanceX) snappedX = 0
          if (Math.abs(rawX + childWidth - containerWidth) < minDistanceX)
            snappedX = containerWidth - childWidth
          if (Math.abs(rawY) < minDistanceY) snappedY = 0
          if (Math.abs(rawY + childHeight - containerHeight) < minDistanceY)
            snappedY = containerHeight - childHeight

          if (containerPageX !== undefined) {
            verticalGuides.forEach((guidePageX) => {
              const guideLocalX = guidePageX - containerPageX
              if (Math.abs(rawX - guideLocalX) < minDistanceX) snappedX = guideLocalX
              if (Math.abs(rawX + childWidth - guideLocalX) < minDistanceX)
                snappedX = guideLocalX - childWidth
            })
          }

          if (containerPageY !== undefined) {
            horizontalGuides.forEach((guidePageY) => {
              const guideLocalY = guidePageY - containerPageY
              if (Math.abs(rawY - guideLocalY) < minDistanceY) snappedY = guideLocalY
              if (Math.abs(rawY + childHeight - guideLocalY) < minDistanceY)
                snappedY = guideLocalY - childHeight
            })
          }

          moveDeltaX = snappedX - primaryInit.x
          moveDeltaY = snappedY - primaryInit.y
        }

        Object.keys(dragStart.initialPositions).forEach((id) => {
          const initialPos = dragStart.initialPositions[id]
          const newX = initialPos.x + moveDeltaX
          const newY = initialPos.y + moveDeltaY
          updateElement(id, { x: newX, y: newY }, location)
        })
      } else {
        const isChildRelative =
          (child.positionMode || child.position || '').toUpperCase() === 'RELATIVE'
        const rawW =
          isChildRelative && effectiveWidth !== undefined ? effectiveWidth : child.width
        const childWidth = rawW ? resolveWidth(rawW) : 100
        const childHeight = child.height ? resolveHeight(child.height) : 25

        let newX = dragStart.initialX + deltaX
        let newY = dragStart.initialY + deltaY

        if (snapToGuides) {
          const snapTolerance = 8
          let minDistanceX = snapTolerance + 1
          let minDistanceY = snapTolerance + 1
          let activeSnapH: number | null = null
          let activeSnapV: number | null = null

          if (Math.abs(newX) < minDistanceX) {
            minDistanceX = Math.abs(newX)
            newX = 0
          }
          if (Math.abs(newX + childWidth - containerWidth) < minDistanceX) {
            minDistanceX = Math.abs(newX + childWidth - containerWidth)
            newX = containerWidth - childWidth
          }
          if (Math.abs(newX + childWidth / 2 - containerWidth / 2) < minDistanceX) {
            minDistanceX = Math.abs(newX + childWidth / 2 - containerWidth / 2)
            newX = containerWidth / 2 - childWidth / 2
          }

          if (Math.abs(newY) < minDistanceY) {
            minDistanceY = Math.abs(newY)
            newY = 0
          }
          if (Math.abs(newY + childHeight - containerHeight) < minDistanceY) {
            minDistanceY = Math.abs(newY + childHeight - containerHeight)
            newY = containerHeight - childHeight
          }
          if (Math.abs(newY + childHeight / 2 - containerHeight / 2) < minDistanceY) {
            minDistanceY = Math.abs(newY + childHeight / 2 - containerHeight / 2)
            newY = containerHeight / 2 - childHeight / 2
          }

          if (containerPageX !== undefined) {
            verticalGuides.forEach((guidePageX) => {
              const guideLocalX = guidePageX - containerPageX
              const distLeft = Math.abs(newX - guideLocalX)
              if (distLeft < minDistanceX) {
                minDistanceX = distLeft
                newX = guideLocalX
                activeSnapV = guidePageX
              }
              const distRight = Math.abs(newX + childWidth - guideLocalX)
              if (distRight < minDistanceX) {
                minDistanceX = distRight
                newX = guideLocalX - childWidth
                activeSnapV = guidePageX
              }
              const distCenter = Math.abs(newX + childWidth / 2 - guideLocalX)
              if (distCenter < minDistanceX) {
                minDistanceX = distCenter
                newX = guideLocalX - childWidth / 2
                activeSnapV = guidePageX
              }
            })
          }

          if (containerPageY !== undefined) {
            horizontalGuides.forEach((guidePageY) => {
              const guideLocalY = guidePageY - containerPageY
              const distTop = Math.abs(newY - guideLocalY)
              if (distTop < minDistanceY) {
                minDistanceY = distTop
                newY = guideLocalY
                activeSnapH = guidePageY
              }
              const distBottom = Math.abs(newY + childHeight - guideLocalY)
              if (distBottom < minDistanceY) {
                minDistanceY = distBottom
                newY = guideLocalY - childHeight
                activeSnapH = guidePageY
              }
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
        const clampedX = isWidth100 ? 0 : Math.max(0, Math.min(newX, containerWidth - childWidth))
        const clampedY = isHeight100 ? 0 : Math.max(0, Math.min(newY, containerHeight - childHeight))

        if (isChildRelative && effectiveY !== undefined) {
          const newOffset = child.height === '100%' ? 0 : Math.max(0, dragStart.initialOffsetY + deltaY)
          updateContainerChildElement(
            containerId,
            child.id,
            { x: clampedX, y: clampedY, relativeOffsetY: newOffset },
            location
          )
        } else {
          updateContainerChildElement(containerId, child.id, { x: clampedX, y: clampedY }, location)
        }
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
    isDragging,
    dragStart,
    containerId,
    child.id,
    child.width,
    child.height,
    child.positionMode,
    child.position,
    location,
    updateContainerChildElement,
    updateElement,
    saveSnapshot,
    snapToGuides,
    horizontalGuides,
    verticalGuides,
    containerPageX,
    containerPageY,
    scale,
    selectedElementIds,
    containerWidth,
    containerHeight,
    effectiveWidth,
    effectiveY,
    onSnapGuide,
    resolveWidth,
    resolveHeight,
  ])

  return {
    isDragging,
    handleMouseDown,
  }
}
