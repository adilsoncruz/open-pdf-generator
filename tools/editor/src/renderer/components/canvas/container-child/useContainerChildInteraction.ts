import type React from 'react'
import { useState, useCallback } from 'react'
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

  const [isEditingText, setIsEditingText] = useState(false)
  const [editingValue, setEditingValue] = useState('')

  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    if (child.type === 'text') {
      setEditingValue(child.dataBinding || '')
      setIsEditingText(true)
    } else if (child.type === 'static_text') {
      setEditingValue(child.value || '')
      setIsEditingText(true)
    }
  }, [child.type, child.dataBinding, child.value])

  const handleTextEditBlur = useCallback(() => {
    setIsEditingText(false)
    if (child.type === 'text') {
      if (editingValue !== (child.dataBinding || '')) {
        updateContainerChildElement(containerId, child.id, { dataBinding: editingValue }, location)
        saveSnapshot()
      }
    } else if (child.type === 'static_text') {
      if (editingValue !== (child.value || '')) {
        updateContainerChildElement(containerId, child.id, { value: editingValue }, location)
        saveSnapshot()
      }
    }
  }, [child.id, child.type, child.dataBinding, child.value, containerId, editingValue, location, saveSnapshot, updateContainerChildElement])

  const handleTextEditKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleTextEditBlur()
    } else if (e.key === 'Escape') {
      setIsEditingText(false)
      setEditingValue(child.type === 'text' ? (child.dataBinding || '') : (child.value || ''))
    }
  }, [child.type, child.dataBinding, child.value, handleTextEditBlur])

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
    isEditingText,
    editingValue,
    setEditingValue,
    handleMouseDown,
    handleResizeMouseDown,
    handleDoubleClick,
    handleTextEditBlur,
    handleTextEditKeyDown,
    handleContextMenu,
    resolveWidth,
    resolveHeight,
  }
}
