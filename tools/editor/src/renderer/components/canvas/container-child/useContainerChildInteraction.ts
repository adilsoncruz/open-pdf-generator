import type React from 'react'
import { useCallback } from 'react'
import { useTemplateStore } from '../../../store/templateStore'
import { useUIStore } from '../../../store/uiStore'
import type { ContainerChildElementProps } from '../types'
import { useContainerChildDrag } from '../useContainerChildDrag'
import { useContainerChildResize } from '../useContainerChildResize'
import { resolveChildWidth, resolveChildHeight } from './childDimensions'

export function useContainerChildInteraction({
  child,
  containerId,
  location = 'body',
  containerWidth,
  containerHeight,
  effectiveY,
  effectiveX,
  effectiveWidth,
  horizontalGuides = [],
  verticalGuides = [],
  containerPageX,
  containerPageY,
  scale = 1,
  onSnapGuide,
}: ContainerChildElementProps) {
  const {
    selectedContainerChildId,
    selectedContainerParentId,
    selectedElementIds,
    selectContainerChild,
    toggleElementSelection,
    updateContainerChildElement,
    updateElement,
    saveSnapshot,
  } = useTemplateStore()
  const snapToGuides = useUIStore((state) => state.snapToGuides)

  const isSelected =
    (selectedContainerParentId === containerId && selectedContainerChildId === child.id) ||
    selectedElementIds.includes(child.id)

  const resolveWidth = useCallback(
    (value: string | number | undefined): number => resolveChildWidth(value, containerWidth),
    [containerWidth]
  )

  const resolveHeight = useCallback(
    (value: string | number | undefined): number => resolveChildHeight(value, containerHeight),
    [containerHeight]
  )

  const { isDragging, handleMouseDown } = useContainerChildDrag({
    child,
    containerId,
    location,
    containerWidth,
    containerHeight,
    scale,
    snapToGuides,
    horizontalGuides,
    verticalGuides,
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
    effectiveX,
    effectiveY,
  })

  const { handleResizeMouseDown } = useContainerChildResize({
    child,
    containerId,
    location,
    containerWidth,
    containerHeight,
    scale,
    snapToGuides,
    horizontalGuides,
    verticalGuides,
    containerPageX,
    containerPageY,
    resolveWidth,
    resolveHeight,
    updateContainerChildElement,
    saveSnapshot,
    onSnapGuide,
  })

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!selectedElementIds.includes(child.id)) {
        selectContainerChild(containerId, child.id, location)
      }
      useUIStore.getState().openContextMenu({
        x: e.clientX,
        y: e.clientY,
        targetType: 'element',
        elementId: child.id,
        containerId,
        location,
      })
    },
    [child.id, containerId, location, selectedElementIds, selectContainerChild]
  )

  return {
    isSelected,
    isDragging,
    handleMouseDown,
    handleResizeMouseDown,
    handleContextMenu,
    resolveWidth,
    resolveHeight,
  }
}
