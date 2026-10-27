import React, { type MouseEvent as ReactMouseEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { Element, Template, ElementLocation } from '../../../store/templateStore'
import type { SnappedGuides } from '../types'
import { TextElementRenderer } from '../elements/TextElementRenderer'
import { ShapeElementRenderer } from '../elements/ShapeElementRenderer'
import { MediaElementRenderer } from '../elements/MediaElementRenderer'
import { TableElementRenderer } from '../elements/TableElementRenderer'
import { LoopElementRenderer } from '../elements/LoopElementRenderer'
import { ContainerElementRenderer } from '../elements/ContainerElementRenderer'
import { resolveDisplayText } from './resolveDisplayText'

export interface CanvasElementContentProps {
  element: Element
  effectiveWidth?: number
  effectiveX?: number
  effectiveY?: number
  scale?: number
  isSelected: boolean
  isEditingText: boolean
  editingValue: string
  location: ElementLocation
  horizontalGuides?: number[]
  verticalGuides?: number[]
  containerOffsetX?: number
  containerOffsetY?: number
  pageSize: { width: number; height: number }
  margins: { top: number; right: number; bottom: number; left: number }
  template: Template
  testData: Record<string, unknown> | null
  onMouseDown: (e: ReactMouseEvent<HTMLDivElement>) => void
  onDoubleClick: (e: ReactMouseEvent<HTMLDivElement>) => void
  onTextChange: (value: string) => void
  onTextBlur: () => void
  onTextKeyDown: (e: ReactKeyboardEvent<HTMLTextAreaElement>) => void
  onSnapGuide?: (guide: SnappedGuides) => void
}

export function CanvasElementContent({
  element,
  effectiveWidth,
  effectiveX,
  effectiveY,
  scale = 1,
  isSelected,
  isEditingText,
  editingValue,
  location,
  horizontalGuides = [],
  verticalGuides = [],
  containerOffsetX,
  containerOffsetY,
  pageSize,
  margins,
  template,
  testData,
  onMouseDown,
  onDoubleClick,
  onTextChange,
  onTextBlur,
  onTextKeyDown,
  onSnapGuide,
}: CanvasElementContentProps) {
  const resolveText = (el: { value?: string; dataBinding?: string }, fallback = '') =>
    resolveDisplayText(el, testData, fallback)

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
          onMouseDown={onMouseDown}
          onDoubleClick={onDoubleClick}
          onTextChange={onTextChange}
          onTextBlur={onTextBlur}
          onTextKeyDown={onTextKeyDown}
          resolveDisplayText={resolveText}
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
          onMouseDown={onMouseDown}
        />
      )

    case 'image':
    case 'barcode':
      return (
        <MediaElementRenderer
          element={element}
          isSelected={isSelected}
          onMouseDown={onMouseDown}
        />
      )

    case 'table':
      return (
        <TableElementRenderer
          element={element}
          isSelected={isSelected}
          onMouseDown={onMouseDown}
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
          effectiveX={effectiveX}
          onSnapGuide={onSnapGuide}
          onMouseDown={onMouseDown}
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
          onMouseDown={onMouseDown}
        />
      )

    default:
      return (
        <div
          className={`cursor-move select-none p-2 bg-gray-200 border ${
            isSelected ? 'ring-2 ring-primary-500' : ''
          }`}
          style={{ width: element.width || 100, height: element.height || 50 }}
          onMouseDown={onMouseDown}
        >
          {element.type}
        </div>
      )
  }
}
