import React, { type CSSProperties, type MouseEvent as ReactMouseEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { Element } from '../../../store/templateStore'
import { getFontFamily } from '../types'

interface TextElementRendererProps {
  element: Element
  effectiveWidth?: number | string
  isSelected: boolean
  isEditingText: boolean
  editingValue: string
  onMouseDown: (e: ReactMouseEvent) => void
  onDoubleClick: (e: ReactMouseEvent<HTMLDivElement>) => void
  onTextChange: (val: string) => void
  onTextBlur: () => void
  onTextKeyDown: (e: ReactKeyboardEvent<HTMLTextAreaElement>) => void
  resolveDisplayText: (el: { value?: string; dataBinding?: string }, fallback?: string) => string
}

export function TextElementRenderer({
  element,
  effectiveWidth,
  isSelected,
  isEditingText,
  editingValue,
  onMouseDown,
  onDoubleClick,
  onTextChange,
  onTextBlur,
  onTextKeyDown,
  resolveDisplayText,
}: TextElementRendererProps) {
  const getVerticalAlign = (vAlign: string | undefined) => {
    switch (vAlign) {
      case 'top':
        return 'flex-start'
      case 'bottom':
        return 'flex-end'
      case 'center':
      default:
        return 'center'
    }
  }

  const getHorizontalAlign = (hAlign: string | undefined) => {
    switch (hAlign) {
      case 'center':
        return 'center'
      case 'right':
        return 'flex-end'
      case 'justify':
        return 'space-between'
      case 'left':
      default:
        return 'flex-start'
    }
  }

  const getTextAlign = (hAlign: string | undefined) => {
    switch (hAlign) {
      case 'center':
        return 'center'
      case 'right':
        return 'right'
      case 'justify':
        return 'justify'
      case 'left':
      default:
        return 'left'
    }
  }

  const isMultiline = element.style?.multiline === true
  const firstLineIndent = element.style?.firstLineIndent || 0

  const textBorderWidth = element.style?.borderWidth ?? 0
  const textBorderColor = element.style?.borderColor || '#000000'
  const textBorderStyle = element.style?.borderStyle || 'solid'
  const textBgColor = element.style?.backgroundColor || 'transparent'

  const isElRelative = (element.positionMode || element.position || '').toUpperCase() === 'RELATIVE'
  const resolvedElWidth =
    isElRelative && effectiveWidth !== undefined ? effectiveWidth : element.width || 'auto'

  const textStyles: CSSProperties = {
    width: resolvedElWidth,
    height: element.height || 'auto',
    fontSize: element.style?.fontSize || 12,
    fontWeight: element.style?.fontWeight || 'normal',
    textDecoration: element.type === 'link' ? 'underline' : element.style?.textDecoration || 'none',
    fontStyle: element.style?.fontStyle || 'normal',
    fontFamily: getFontFamily(element.style?.fontFamily),
    color: element.style?.color || '#000000',
    textDecorationColor: element.style?.color || '#000000',
    backgroundColor: textBgColor,
    overflow: isMultiline ? 'auto' : 'hidden',
    textOverflow: isMultiline ? 'clip' : 'ellipsis',
    whiteSpace: isMultiline ? 'pre-wrap' : 'nowrap',
    boxSizing: 'border-box',
    display: isMultiline ? 'block' : 'flex',
    alignItems: isMultiline ? undefined : getVerticalAlign(element.style?.verticalAlignment),
    justifyContent: isMultiline ? undefined : getHorizontalAlign(element.style?.alignment),
    textAlign: isMultiline ? getTextAlign(element.style?.alignment) : undefined,
    textIndent: isMultiline && firstLineIndent > 0 ? `${firstLineIndent}px` : undefined,
    lineHeight: element.style?.lineHeight || 'normal',
    borderTopWidth: `${element.style?.borderTopWidth ?? textBorderWidth}px`,
    borderTopStyle: textBorderStyle,
    borderTopColor: textBorderColor,
    borderRightWidth: `${element.style?.borderRightWidth ?? textBorderWidth}px`,
    borderRightStyle: textBorderStyle,
    borderRightColor: textBorderColor,
    borderBottomWidth: `${element.style?.borderBottomWidth ?? textBorderWidth}px`,
    borderBottomStyle: textBorderStyle,
    borderBottomColor: textBorderColor,
    borderLeftWidth: `${element.style?.borderLeftWidth ?? textBorderWidth}px`,
    borderLeftStyle: textBorderStyle,
    borderLeftColor: textBorderColor,
    borderRadius: `${element.style?.cornerRadius || 0}px`,
    paddingTop: `${element.style?.paddingTop ?? element.style?.paddingY ?? 0}px`,
    paddingRight: `${element.style?.paddingRight ?? element.style?.paddingX ?? 0}px`,
    paddingBottom: `${element.style?.paddingBottom ?? element.style?.paddingY ?? 0}px`,
    paddingLeft: `${element.style?.paddingLeft ?? element.style?.paddingX ?? 0}px`,
  }

  if (isEditingText) {
    return (
      <textarea
        autoFocus
        value={editingValue}
        onChange={(e) => onTextChange(e.target.value)}
        onBlur={onTextBlur}
        onKeyDown={onTextKeyDown}
        className="resize-none outline-none ring-2 ring-blue-500"
        style={{
          ...textStyles,
          cursor: 'text',
          background: textBgColor === 'transparent' ? 'white' : textBgColor,
        }}
      />
    )
  }

  return (
    <div
      className={`cursor-move select-none ${isSelected ? 'ring-2 ring-primary-500' : ''}`}
      style={textStyles}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      title="Double-click to edit"
    >
      {resolveDisplayText(element, 'Texto')}
    </div>
  )
}
