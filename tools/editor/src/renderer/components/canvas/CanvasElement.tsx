import React, { useState, useRef, type MouseEvent as ReactMouseEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useTemplateStore, type Element } from '../../store/templateStore'
import { useUIStore } from '../../store/uiStore'
import { processExpression, hasTransformations } from '../../utils/expressionProcessor'
import type { CanvasElementProps } from './types'
import { applyCanvasSnap } from './snapping'
import { CanvasResizeHandles } from './CanvasResizeHandles'
import { useCanvasElementDrag } from './useCanvasElementDrag'
import { useCanvasElementResize } from './useCanvasElementResize'
import { TextElementRenderer } from './elements/TextElementRenderer'
import { ShapeElementRenderer } from './elements/ShapeElementRenderer'
import { MediaElementRenderer } from './elements/MediaElementRenderer'
import { TableElementRenderer } from './elements/TableElementRenderer'
import { LoopElementRenderer } from './elements/LoopElementRenderer'
import { ContainerElementRenderer } from './elements/ContainerElementRenderer'

export function CanvasElement({
  element,
  effectiveY,
  effectiveX,
  effectiveWidth,
  scale = 1,
  isSelected,
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
}: CanvasElementProps) {
  const template = useTemplateStore((state) => state.template)
  const testData = useTemplateStore((state) => state.testData)
  const saveSnapshot = useTemplateStore((state) => state.saveSnapshot)
  const snapToGuides = useUIStore((state) => state.snapToGuides)

  const [isEditingText, setIsEditingText] = useState(false)
  const [editingValue, setEditingValue] = useState('')
  const elementWrapperRef = useRef<HTMLDivElement>(null)

  const isMultiSelection = selectedElementIds.length > 1

  // Verificar se o elemento pertence a um grupo
  const findElementGroup = () => {
    if (!element.groupId) return null
    const allGroups = [
      ...(template.groups || []),
      ...(template.pageSettings.header?.groups || []),
      ...(template.pageSettings.footer?.groups || []),
      ...(template.pageSettings.bodyBackground?.groups || []),
    ]
    return allGroups.find((g) => g.id === element.groupId)
  }

  const elementGroup = findElementGroup()

  const resolveDisplayText = (
    el: { value?: string; dataBinding?: string },
    fallback: string = ''
  ): string => {
    if (el.value) return el.value
    if (el.dataBinding) {
      if (testData && Object.keys(testData).length > 0) {
        if (hasTransformations(el.dataBinding)) {
          const result = processExpression(el.dataBinding, testData)
          if (result) return result
        } else {
          const parts = el.dataBinding.split('.')
          let value: unknown = testData
          for (const part of parts) {
            if (value && typeof value === 'object' && part in value) {
              value = (value as Record<string, unknown>)[part]
            } else {
              value = null
              break
            }
          }
          if (value !== null && value !== undefined) return String(value)
        }
      }
      return `{{${el.dataBinding}}}`
    }
    return fallback
  }

  const getElementDimensions = () => {
    const el = elementWrapperRef.current
    const domWidth = el?.offsetWidth || 0
    const domHeight = el?.offsetHeight || 0

    let width = 0
    if (typeof element.width === 'number') width = element.width
    else if (element.width === '100%') width = pageSize.width - margins.left - margins.right
    else if (domWidth > 0) width = domWidth
    else if (element.type === 'page_break') width = pageSize.width - margins.left - margins.right
    else width = 100

    let height = 0
    if (typeof element.height === 'number') height = element.height
    else if (domHeight > 0) height = domHeight
    else if (element.type === 'page_break') height = 24
    else height = 25

    return { width, height }
  }

  const applySnap = (
    x: number,
    y: number,
    width: number = 0,
    height: number = 0,
    options?: { snapX?: boolean; snapY?: boolean }
  ) => {
    const headerHeight = template.pageSettings.header?.height || 0
    const footerHeight = template.pageSettings.footer?.height || 0
    return applyCanvasSnap({
      x,
      y,
      width,
      height,
      options,
      pageSize,
      margins,
      headerHeight,
      footerHeight,
      location,
      containerOffsetX,
      containerOffsetY,
      horizontalGuides,
      verticalGuides,
      onSnapGuide,
    })
  }

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

  const renderElement = () => {
    switch (element.type) {
      case 'text':
      case 'static_text':
      case 'rich_text':
      case 'link':
        return (
          <TextElementRenderer
            element={element}
            effectiveWidth={effectiveWidth}
            isSelected={isSelected}
            isEditingText={isEditingText}
            editingValue={editingValue}
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
            onTextChange={setEditingValue}
            onTextBlur={handleTextEditBlur}
            onTextKeyDown={handleTextEditKeyDown}
            resolveDisplayText={resolveDisplayText}
          />
        )

      case 'page_break':
      case 'spacer':
      case 'rectangle':
      case 'line':
        return (
          <ShapeElementRenderer
            element={element}
            template={template}
            pageSize={pageSize}
            margins={margins}
            isSelected={isSelected}
            onMouseDown={handleMouseDown}
          />
        )

      case 'image':
      case 'barcode':
        return (
          <MediaElementRenderer
            element={element}
            isSelected={isSelected}
            onMouseDown={handleMouseDown}
          />
        )

      case 'table':
        return (
          <TableElementRenderer
            element={element}
            isSelected={isSelected}
            onMouseDown={handleMouseDown}
          />
        )

      case 'loop':
        return (
          <LoopElementRenderer
            element={element}
            pageSize={pageSize}
            margins={margins}
            isSelected={isSelected}
            location={location}
            scale={scale}
            horizontalGuides={horizontalGuides}
            verticalGuides={verticalGuides}
            containerOffsetX={containerOffsetX}
            containerOffsetY={containerOffsetY}
            effectiveY={effectiveY}
            onSnapGuide={onSnapGuide}
            onMouseDown={handleMouseDown}
          />
        )

      case 'container':
        return (
          <ContainerElementRenderer
            element={element}
            pageSize={pageSize}
            margins={margins}
            isSelected={isSelected}
            location={location}
            scale={scale}
            horizontalGuides={horizontalGuides}
            verticalGuides={verticalGuides}
            containerOffsetX={containerOffsetX}
            containerOffsetY={containerOffsetY}
            effectiveY={effectiveY}
            onSnapGuide={onSnapGuide}
            onMouseDown={handleMouseDown}
          />
        )

      default:
        return (
          <div
            className={`cursor-move select-none p-2 bg-gray-200 border ${
              isSelected ? 'ring-2 ring-primary-500' : ''
            }`}
            style={{ width: element.width || 100, height: element.height || 50 }}
            onMouseDown={handleMouseDown}
          >
            {element.type}
          </div>
        )
    }
  }

  const dims = getElementDimensions()
  const isWidthFull = element.width === '100%'
  const isHeightFull = element.height === '100%'

  return (
    <div
      className="absolute"
      style={{
        left: element.width === '100%' ? 0 : (effectiveX !== undefined ? effectiveX : element.x),
        top: element.height === '100%' ? 0 : (effectiveY !== undefined ? effectiveY : element.y),
        ...(element.width === '100%'
          ? { width: '100%' }
          : effectiveWidth !== undefined && element.width === undefined
          ? { width: effectiveWidth }
          : {}),
      }}
      onContextMenu={(e) => {
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
      }}
    >
      <div ref={elementWrapperRef} className="relative">
        {renderElement()}

        {isSelected && !isDragging && !isResizing && (
          <CanvasResizeHandles
            width={dims.width}
            height={dims.height}
            isWidthFull={isWidthFull}
            isHeightFull={isHeightFull}
            onResizeMouseDown={handleResizeMouseDown}
          />
        )}

        {elementGroup && (
          <div
            className="absolute -top-1 -right-1 z-20 pointer-events-auto cursor-pointer group/badge"
            title={`Grupo: ${elementGroup.name}${
              elementGroup.printCondition ? `\nCondição: ${elementGroup.printCondition}` : ''
            }\nClique para editar grupo`}
            onClick={(e) => {
              e.stopPropagation()
              useUIStore.getState().openGroupModal(elementGroup)
            }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-violet-600 border border-white shadow-sm flex items-center justify-center hover:scale-125 transition-transform" />
          </div>
        )}
      </div>
    </div>
  )
}
