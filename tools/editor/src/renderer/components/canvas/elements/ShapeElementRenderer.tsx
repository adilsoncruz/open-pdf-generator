import React, { type MouseEvent as ReactMouseEvent } from 'react'
import type { Element, Template } from '../../../store/templateStore'

interface ShapeElementRendererProps {
  element: Element
  template: Template
  pageSize: { width: number; height: number }
  margins: { top: number; right: number; bottom: number; left: number }
  isSelected: boolean
  onMouseDown: (e: ReactMouseEvent) => void
}

export function ShapeElementRenderer({
  element,
  template,
  pageSize,
  margins,
  isSelected,
  onMouseDown,
}: ShapeElementRendererProps) {
  if (element.type === 'spacer' || element.type === 'rectangle') {
    const borderWidth = element.style?.borderWidth ?? 1
    const borderColor = element.style?.borderColor || '#000000'
    const borderStyle = element.style?.borderStyle || 'solid'

    const getElementLocation = () => {
      if (template.pageSettings.header?.elements.some((e) => e.id === element.id)) return 'header'
      if (template.pageSettings.footer?.elements.some((e) => e.id === element.id)) return 'footer'
      if (template.pageSettings.bodyBackground?.elements.some((e) => e.id === element.id))
        return 'bodyBackground'
      if (template.summaryPage?.elements.some((e) => e.id === element.id)) return 'summary'
      return 'body'
    }

    const getContainerDimensions = () => {
      const contentWidth = pageSize.width - margins.left - margins.right
      const contentHeight = pageSize.height - margins.top - margins.bottom
      const elementLocation = getElementLocation()

      if (elementLocation === 'header') {
        const header = template.pageSettings.header
        return { width: contentWidth, height: header?.height || 100 }
      } else if (elementLocation === 'footer') {
        const footer = template.pageSettings.footer
        return { width: contentWidth, height: footer?.height || 100 }
      } else if (elementLocation === 'bodyBackground' || elementLocation === 'summary') {
        return { width: contentWidth, height: contentHeight }
      } else {
        const bodyHeight =
          contentHeight -
          (template.pageSettings.header?.height || 0) -
          (template.pageSettings.footer?.height || 0)
        return { width: contentWidth, height: bodyHeight }
      }
    }

    const resolveDimension = (value: string | number | undefined, containerSize: number) => {
      if (typeof value === 'string' && value.endsWith('%')) {
        const percentage = parseFloat(value)
        return (containerSize * percentage) / 100
      }
      return value || 100
    }

    const containerDimensions = getContainerDimensions()
    const resolvedWidth = resolveDimension(element.width, containerDimensions.width)
    const resolvedHeight = resolveDimension(element.height, containerDimensions.height)

    return (
      <div
        className={`cursor-move select-none ${isSelected ? 'ring-2 ring-primary-500' : ''}`}
        style={{
          width: resolvedWidth,
          height: resolvedHeight,
          boxSizing: 'border-box',
          backgroundColor: element.style?.fillColor || 'transparent',
          borderTopWidth: `${element.style?.borderTopWidth ?? borderWidth}px`,
          borderTopStyle: borderStyle,
          borderTopColor: borderColor,
          borderRightWidth: `${element.style?.borderRightWidth ?? borderWidth}px`,
          borderRightStyle: borderStyle,
          borderRightColor: borderColor,
          borderBottomWidth: `${element.style?.borderBottomWidth ?? borderWidth}px`,
          borderBottomStyle: borderStyle,
          borderBottomColor: borderColor,
          borderLeftWidth: `${element.style?.borderLeftWidth ?? borderWidth}px`,
          borderLeftStyle: borderStyle,
          borderLeftColor: borderColor,
          borderRadius: `${element.style?.cornerRadius || 0}px`,
        }}
        onMouseDown={onMouseDown}
      />
    )
  }

  if (element.type === 'line') {
    const getLineElementLocation = () => {
      if (template.pageSettings.header?.elements.some((e) => e.id === element.id)) return 'header'
      if (template.pageSettings.footer?.elements.some((e) => e.id === element.id)) return 'footer'
      if (template.pageSettings.bodyBackground?.elements.some((e) => e.id === element.id))
        return 'bodyBackground'
      if (template.summaryPage?.elements.some((e) => e.id === element.id)) return 'summary'
      return 'body'
    }

    const getLineContainerDimensions = () => {
      const contentWidth = pageSize.width - margins.left - margins.right
      const contentHeight = pageSize.height - margins.top - margins.bottom
      const lineLocation = getLineElementLocation()

      if (lineLocation === 'header') {
        return { width: contentWidth, height: template.pageSettings.header?.height || 100 }
      } else if (lineLocation === 'footer') {
        return { width: contentWidth, height: template.pageSettings.footer?.height || 100 }
      } else if (lineLocation === 'bodyBackground' || lineLocation === 'summary') {
        return { width: contentWidth, height: contentHeight }
      } else {
        const bodyHeight =
          contentHeight -
          (template.pageSettings.header?.height || 0) -
          (template.pageSettings.footer?.height || 0)
        return { width: contentWidth, height: bodyHeight }
      }
    }

    const resolveLineDimension = (
      value: string | number | undefined,
      containerSize: number,
      defaultValue: number = 100
    ) => {
      if (typeof value === 'string' && value.endsWith('%')) {
        const percentage = parseFloat(value)
        return (containerSize * percentage) / 100
      }
      return typeof value === 'number' ? value : defaultValue
    }

    const lineContainerDims = getLineContainerDimensions()
    const lineElWidthRaw = element.width ?? (element.x2 ? element.x2 - element.x : 100)
    const lineElHeightRaw = element.height ?? (element.y2 ? element.y2 - element.y : 0)
    const lineElWidth = resolveLineDimension(lineElWidthRaw, lineContainerDims.width, 100)
    const lineElHeight = resolveLineDimension(lineElHeightRaw, lineContainerDims.height, 0)
    const lineStrokeWidth = element.style?.strokeWidth || 1

    const svgElWidth = Math.max(Math.abs(lineElWidth), lineStrokeWidth)
    const svgElHeight = Math.max(Math.abs(lineElHeight), lineStrokeWidth)

    const strokeOffset = lineStrokeWidth / 2
    const lineX1 = lineElWidth >= 0 ? strokeOffset : svgElWidth - strokeOffset
    const lineY1 = lineElHeight >= 0 ? strokeOffset : svgElHeight - strokeOffset
    const lineX2 = lineElWidth >= 0 ? svgElWidth - strokeOffset : strokeOffset
    const lineY2 = lineElHeight >= 0 ? svgElHeight - strokeOffset : strokeOffset

    return (
      <svg
        className={`cursor-move select-none ${isSelected ? 'ring-2 ring-primary-500' : ''}`}
        style={{
          width: svgElWidth,
          height: svgElHeight,
          marginLeft: lineElHeight === 0 ? 0 : -strokeOffset,
          marginTop: lineElWidth === 0 ? 0 : -strokeOffset,
        }}
        onMouseDown={onMouseDown}
      >
        <line
          x1={lineX1}
          y1={lineY1}
          x2={lineX2}
          y2={lineY2}
          stroke={element.style?.strokeColor || '#000000'}
          strokeWidth={lineStrokeWidth}
        />
      </svg>
    )
  }

  return null
}
