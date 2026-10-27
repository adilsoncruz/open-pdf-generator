import { useState, useRef, type MouseEvent as ReactMouseEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useTemplateStore } from '../../../store/templateStore'
import { useUIStore } from '../../../store/uiStore'
import type { CanvasElementProps } from '../types'
import { applyCanvasSnap } from '../snapping'
import { useCanvasElementDrag } from '../useCanvasElementDrag'
import { useCanvasElementResize } from '../useCanvasElementResize'
import { resolveElementDimensions } from './elementDimensions'

export function useCanvasElementInteraction(props: CanvasElementProps) {
  const {
    element,
    effectiveY,
    scale = 1,
    onSelect,
    onUpdate,
    margins,
    pageSize,
    selectedElementIds,
    selectedElementLocation,
    allElements,
    updateElement,
    location,
    horizontalGuides = [],
    verticalGuides = [],
    containerOffsetX,
    containerOffsetY,
    onSnapGuide,
  } = props

  const template = useTemplateStore((state) => state.template)
  const saveSnapshot = useTemplateStore((state) => state.saveSnapshot)
  const snapToGuides = useUIStore((state) => state.snapToGuides)

  const [isEditingText, setIsEditingText] = useState(false)
  const [editingValue, setEditingValue] = useState('')
  const elementWrapperRef = useRef<HTMLDivElement>(null)

  const isMultiSelection = selectedElementIds.length > 1

  const findElementGroup = () => {
    if (!element.groupId) return null
    const { groups, pageSettings } = template
    const allGroups = [
      ...(groups || []),
      ...(pageSettings.header?.groups || []),
      ...(pageSettings.footer?.groups || []),
      ...(pageSettings.bodyBackground?.groups || []),
    ]
    return allGroups.find((g) => g.id === element.groupId) || null
  }

  const elementGroup = findElementGroup()

  const getElementDimensions = () => {
    const el = elementWrapperRef.current
    return resolveElementDimensions(element, pageSize, margins, {
      width: el?.offsetWidth || 0,
      height: el?.offsetHeight || 0,
    })
  }

  const applySnap = (
    x: number,
    y: number,
    width = 0,
    height = 0,
    options?: { snapX?: boolean; snapY?: boolean }
  ) =>
    applyCanvasSnap({
      x,
      y,
      width,
      height,
      options,
      pageSize,
      margins,
      headerHeight: template.pageSettings.header?.height || 0,
      footerHeight: template.pageSettings.footer?.height || 0,
      location,
      containerOffsetX,
      containerOffsetY,
      horizontalGuides,
      verticalGuides,
      onSnapGuide,
    })

  const { isDragging, handleMouseDown } = useCanvasElementDrag({
    element,
    effectiveY,
    scale,
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
  })

  const { isResizing, handleResizeMouseDown } = useCanvasElementResize({
    element,
    effectiveY,
    scale,
    snapToGuides,
    onUpdate,
    saveSnapshot,
    getElementDimensions,
    applySnap,
    onSnapGuide,
  })

  const handleDoubleClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    if (element.type === 'text' || element.type === 'static_text') {
      setEditingValue(element.value || '')
      setIsEditingText(true)
    }
  }

  const handleTextEditBlur = () => {
    setIsEditingText(false)
    if (editingValue !== (element.value || '')) {
      onUpdate({ value: editingValue })
      saveSnapshot()
    }
  }

  const handleTextEditKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleTextEditBlur()
    } else if (e.key === 'Escape') {
      setIsEditingText(false)
      setEditingValue(element.value || '')
    }
  }

  const handleContextMenu = (e: ReactMouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!selectedElementIds.includes(element.id)) {
      onSelect(false)
    }
    useUIStore.getState().openContextMenu({
      x: e.clientX,
      y: e.clientY,
      targetType: element.type === 'container' ? 'container' : 'element',
      elementId: element.id,
      location,
    })
  }

  return {
    elementWrapperRef,
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
    dims: getElementDimensions(),
    elementGroup,
    isWidthFull: element.width === '100%',
    isHeightFull: element.height === '100%',
    applySnap,
  }
}

export type UseCanvasElementInteractionResult = ReturnType<typeof useCanvasElementInteraction>
