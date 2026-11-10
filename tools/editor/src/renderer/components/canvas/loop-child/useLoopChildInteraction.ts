import type React from 'react'
import { useState, useCallback } from 'react'
import { useTemplateStore } from '../../../store/templateStore'
import { useUIStore } from '../../../store/uiStore'
import type { LoopChildElementProps } from '../types'
import { useLoopChildDrag } from '../useLoopChildDrag'
import { useLoopChildResize } from '../useLoopChildResize'
import { resolveChildWidth, resolveChildHeight } from './childDimensions'

export function useLoopChildInteraction({
  child,
  loopId,
  location,
  loopWidth,
  loopHeight,
  effectiveY,
  effectiveX,
  effectiveWidth,
  horizontalGuides = [],
  verticalGuides = [],
  loopPageX,
  loopPageY,
  scale = 1,
  onSnapGuide,
}: LoopChildElementProps) {
  const {
    selectedLoopChildId,
    selectedLoopParentId,
    selectedElementIds,
    selectLoopChild,
    toggleElementSelection,
    updateLoopChildElement,
    saveSnapshot,
  } = useTemplateStore()
  const snapToGuides = useUIStore((state) => state.snapToGuides)

  const isSelected =
    (selectedLoopParentId === loopId && selectedLoopChildId === child.id) ||
    selectedElementIds.includes(child.id)

  const resolveWidth = useCallback(
    (value: string | number | undefined): number => resolveChildWidth(value, loopWidth),
    [loopWidth]
  )

  const resolveHeight = useCallback(
    (value: string | number | undefined): number => resolveChildHeight(value, loopHeight),
    [loopHeight]
  )

  const { isDragging, handleMouseDown } = useLoopChildDrag({
    child,
    loopId,
    location,
    loopWidth,
    loopHeight,
    scale,
    snapToGuides,
    horizontalGuides,
    verticalGuides,
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
    effectiveY,
  })

  const { isResizing, handleResizeMouseDown } = useLoopChildResize({
    child,
    loopId,
    location,
    loopWidth,
    loopHeight,
    scale,
    snapToGuides,
    horizontalGuides,
    verticalGuides,
    loopPageX,
    loopPageY,
    resolveWidth,
    resolveHeight,
    updateLoopChildElement,
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
        updateLoopChildElement(loopId, child.id, { dataBinding: editingValue })
        saveSnapshot()
      }
    } else if (child.type === 'static_text') {
      if (editingValue !== (child.value || '')) {
        updateLoopChildElement(loopId, child.id, { value: editingValue })
        saveSnapshot()
      }
    }
  }, [child.id, child.type, child.dataBinding, child.value, loopId, editingValue, saveSnapshot, updateLoopChildElement])

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
        selectLoopChild(loopId, child.id, location)
      }
      useUIStore.getState().openContextMenu({
        x: e.clientX,
        y: e.clientY,
        targetType: 'element',
        elementId: child.id,
        loopId,
        location,
      })
    },
    [child.id, loopId, location, selectedElementIds, selectLoopChild]
  )

  return {
    isSelected,
    isDragging,
    isResizing,
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
