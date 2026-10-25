import React, { useState, useEffect, useRef, type MouseEvent as ReactMouseEvent, type CSSProperties } from 'react'
import { useTemplateStore, type Element, type ElementLocation, flattenElements } from '../store/templateStore'
import { useUIStore } from '../store/uiStore'
import { processExpression, hasTransformations } from '../utils/expressionProcessor'
import { Select, Button, Divider, Icon } from './atoms'
import { IconButton } from './molecules'
import { useTranslation } from '../i18n'
// Component to render Loop child elements
interface LoopChildElementProps {
  child: Element
  loopId: string
  location: ElementLocation
  loopWidth: number
  loopHeight: number
  horizontalGuides?: number[]
  verticalGuides?: number[]
  loopPageX?: number
  loopPageY?: number
  scale?: number
  onSnapGuide?: (snapped: { h: number | null; v: number | null }) => void
}

// Component to render Loop child elements
interface ContainerChildElementProps {
  child: Element
  containerId: string
  location: ElementLocation
  containerWidth: number
  containerHeight: number
  effectiveY?: number
  effectiveX?: number
  effectiveWidth?: number | string
  horizontalGuides?: number[]
  verticalGuides?: number[]
  containerPageX?: number
  containerPageY?: number
  scale?: number
  onSnapGuide?: (snapped: { h: number | null; v: number | null }) => void
}

function getHeaderBorderValues(style: Record<string, unknown> | undefined) {
  const borderWidth = (style?.headerBorderWidth as number) ?? (style?.borderWidth as number) ?? 1
  const borderType = style?.headerBorderType

  switch (borderType) {
    case 'none':
      return { top: 0, right: 0, bottom: 0, left: 0 }
    case 'row':
      return { top: borderWidth, right: 0, bottom: borderWidth, left: 0 }
    case 'columns':
    case 'cells':
    case 'all':
      return { top: borderWidth, right: borderWidth, bottom: borderWidth, left: borderWidth }
    case 'top-bottom':
      return { top: borderWidth, right: 0, bottom: borderWidth, left: 0 }
    case 'left-right':
      return { top: 0, right: borderWidth, bottom: 0, left: borderWidth }
    default:
      return { top: borderWidth, right: borderWidth, bottom: borderWidth, left: borderWidth }
  }
}

function getCellBorderValues(style: Record<string, unknown> | undefined) {
  const borderWidth = (style?.borderWidth as number) ?? 1
  const borderType = style?.cellBorderType

  switch (borderType) {
    case 'none':
      return { top: 0, right: 0, bottom: 0, left: 0 }
    case 'row':
      return { top: borderWidth, right: 0, bottom: borderWidth, left: 0 }
    case 'columns':
      return { top: 0, right: borderWidth, bottom: 0, left: borderWidth }
    case 'cells':
    case 'all':
      return { top: borderWidth, right: borderWidth, bottom: borderWidth, left: borderWidth }
    case 'top-bottom':
      return { top: borderWidth, right: 0, bottom: borderWidth, left: 0 }
    case 'left-right':
      return { top: 0, right: borderWidth, bottom: 0, left: borderWidth }
    default:
      return { top: borderWidth, right: borderWidth, bottom: borderWidth, left: borderWidth }
  }
}

// Map PDF fonts to equivalent web fonts
function getFontFamily(pdfFont?: string): string {
  if (!pdfFont) return 'Arial, sans-serif'
  
  const fontMap: Record<string, string> = {
    'Helvetica': 'Arial, Helvetica, sans-serif',
    'Helvetica-Bold': 'Arial, Helvetica, sans-serif',
    'Times-Roman': '"Times New Roman", Times, serif',
    'Times-Bold': '"Times New Roman", Times, serif',
    'Courier': '"Courier New", Courier, monospace',
    'Courier-Bold': '"Courier New", Courier, monospace',
  }
  
  return fontMap[pdfFont] || 'Arial, sans-serif'
}

// Mapear verticalAlignment para CSS
function getVerticalAlign(vAlign: string | undefined): 'flex-start' | 'flex-end' | 'center' {
  switch (vAlign) {
    case 'top': return 'flex-start'
    case 'bottom': return 'flex-end'
    case 'center':
    default: return 'center'
  }
}

// Mapear alignment horizontal para justifyContent
function getHorizontalAlign(hAlign: string | undefined): 'flex-start' | 'flex-end' | 'center' | 'space-between' {
  switch (hAlign) {
    case 'center': return 'center'
    case 'right': return 'flex-end'
    case 'justify': return 'space-between'
    case 'left':
    default: return 'flex-start'
  }
}

// Mapear alignment horizontal para textAlign
function getTextAlign(hAlign: string | undefined): 'left' | 'center' | 'right' | 'justify' {
  switch (hAlign) {
    case 'center': return 'center'
    case 'right': return 'right'
    case 'justify': return 'justify'
    case 'left':
    default: return 'left'
  }
}

function resolveElementDisplayText(
  el: { value?: string; dataBinding?: string },
  testData?: Record<string, unknown>,
  fallback: string = ''
): string {
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
        if (value !== null && value !== undefined) {
          return String(value)
        }
      }
    }
    return `{${el.dataBinding}}`
  }
  return fallback
}

function getEstimatedElementHeight(
  element: Element,
  availableWidth?: number,
  testData?: Record<string, unknown>
): number {
  if (element.type === 'container') {
    if (element.heightMode === 'fixed' || element.autoHeight === false) {
      return typeof element.height === 'number' ? element.height : 150
    }
    const children = element.elements || []
    if (children.length === 0) {
      return typeof element.height === 'number' ? element.height : 150
    }
    const maxBottom = children.reduce((max: number, ch: Element) => {
      const cy = typeof ch.y === 'number' ? ch.y : 0
      const chH = getEstimatedElementHeight(ch, undefined, testData)
      return Math.max(max, cy + chH + 15)
    }, 0)
    return Math.max(typeof element.height === 'number' ? element.height : 150, maxBottom)
  }

  if (['text', 'static_text', 'rich_text', 'link'].includes(element.type)) {
    const fontSize = typeof element.style?.fontSize === 'number' ? element.style.fontSize : 12
    const lineHeightMultiplier = typeof element.style?.lineHeight === 'number' ? element.style.lineHeight : 1.2
    const lineHeight = fontSize * lineHeightMultiplier
    const padTop = typeof element.style?.paddingTop === 'number' ? element.style.paddingTop : (typeof element.style?.paddingY === 'number' ? element.style.paddingY : 0)
    const padBottom = typeof element.style?.paddingBottom === 'number' ? element.style.paddingBottom : (typeof element.style?.paddingY === 'number' ? element.style.paddingY : 0)
    const padLeft = typeof element.style?.paddingLeft === 'number' ? element.style.paddingLeft : (typeof element.style?.paddingX === 'number' ? element.style.paddingX : 0)
    const padRight = typeof element.style?.paddingRight === 'number' ? element.style.paddingRight : (typeof element.style?.paddingX === 'number' ? element.style.paddingX : 0)
    const borderTop = typeof element.style?.borderTopWidth === 'number' ? element.style.borderTopWidth : (typeof element.style?.borderWidth === 'number' ? element.style.borderWidth : 0)
    const borderBottom = typeof element.style?.borderBottomWidth === 'number' ? element.style.borderBottomWidth : (typeof element.style?.borderWidth === 'number' ? element.style.borderWidth : 0)

    const baseSingleLineHeight = Math.ceil(lineHeight + padTop + padBottom + borderTop + borderBottom)

    const isMultiline = element.style?.multiline === true
    const text = resolveElementDisplayText(element, testData, element.type === 'text' ? 'campo' : 'Texto') || ''

    if (!isMultiline && !text.includes('\n')) {
      if (typeof element.height === 'number' && element.height > 0) {
        return Math.max(element.height, baseSingleLineHeight)
      }
      return Math.max(20, baseSingleLineHeight)
    }

    const boxW = typeof availableWidth === 'number' && availableWidth > 0
      ? availableWidth
      : (typeof element.width === 'number' && element.width > 0 ? element.width : 200)
    const usableWidth = Math.max(20, boxW - padLeft - padRight)
    const avgCharW = Math.max(1, fontSize * 0.55)
    const charsPerLine = Math.max(1, Math.floor(usableWidth / avgCharW))

    const paragraphs = text.split('\n')
    let lineCount = 0
    for (const p of paragraphs) {
      if (p.length === 0) {
        lineCount += 1
      } else {
        lineCount += Math.max(1, Math.ceil(p.length / charsPerLine))
      }
    }

    const calculatedTotalHeight = Math.ceil(lineCount * lineHeight + padTop + padBottom + borderTop + borderBottom)
    if (typeof element.height === 'number' && element.height > calculatedTotalHeight) {
      return element.height
    }
    return Math.max(20, calculatedTotalHeight)
  }

  if (element.type === 'page_break') return 20
  if (element.type === 'spacer') return typeof element.height === 'number' ? element.height : 40
  if (element.type === 'line') return typeof element.height === 'number' ? Math.max(1, element.height) : (element.style?.strokeWidth || 1)

  if (typeof element.height === 'number') {
    return element.height
  }
  return 25
}

function ContainerChildElement({
  child,
  containerId,
  location,
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
  const { t } = useTranslation()
  const snapToGuides = useUIStore((state) => state.snapToGuides)
  const {
    selectedContainerChildId,
    selectedContainerParentId,
    selectedElementIds,
    selectContainerChild,
    toggleElementSelection,
    updateContainerChildElement,
    updateElement,
    saveSnapshot,
    testData,
    template
  } = useTemplateStore()
  const isSelected = selectedElementIds.includes(child.id) || (selectedContainerChildId === child.id && selectedContainerParentId === containerId)

  // Find loop element in all sections
  const findComponentElement = (containerElementId: string): Element | undefined => {
    const template = useTemplateStore.getState().template

    // Search in all possible locations
    const allElements: Element[] = [
      ...(template.page || []),
      ...(template.pageSettings.header?.elements || []),
      ...(template.pageSettings.footer?.elements || []),
      ...(template.pageSettings.bodyBackground?.elements || []),
      ...(template.summaryPage?.elements || [])
    ]

    return allElements.find(e => e.id === containerElementId)
  }

  const resolveChildDisplayText = (el: { value?: string; dataBinding?: string }, fallback: string = ''): string => {
    // Se tem valor fixo, usar ele
    if (el.value) {
      return el.value
    }
    
    // Se tem dataBinding, tentar processar
    if (el.dataBinding) {
      // Se temos dados de teste e o binding pode ser resolvido
      if (testData && Object.keys(testData).length > 0) {
        if (hasTransformations(el.dataBinding)) {
          // Process expressions (e.g. "invoice.name | upperCase")
          const result = processExpression(el.dataBinding, testData)
          if (result) return result
        } else {
          // Tentar resolver binding simples
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
          if (value !== null && value !== undefined) {
            return String(value)
          }
        }
      }
      
      // Fallback para quando não temos dados ou não encontrou o campo
      return `{${el.dataBinding}}`
    }
    
    return fallback
  }

  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0,
    initialX: 0,
    initialY: 0,
    initialPositions: {} as Record<string, { x: number; y: number }>,
    initialOffsetY: 10,
  })
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, initialW: 100, initialH: 20 })

  // Resolve dimensions (support for "100%")
  const resolveWidth = (value: string | number | undefined): number => {
    if (value === '100%') return containerWidth
    if (typeof value === 'number') return value
    return 100 // default
  }

  const resolveHeight = (value: string | number | undefined): number => {
    if (value === '100%') return containerHeight
    if (typeof value === 'number') return value
    return 20 // default
  }

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
      initialOffsetY: child.height === '100%' ? 0 : (typeof child.relativeOffsetY === 'number' ? child.relativeOffsetY : 10),
    })
  }

  const handleResizeMouseDown = (e: ReactMouseEvent, direction: string) => {
    e.stopPropagation()
    setIsResizing(direction)
    const initialW = resolveWidth(child.width)
    const initialH = resolveHeight(child.height)
    setResizeStart({ x: e.clientX, y: e.clientY, initialW, initialH })
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const currentScale = scale || 1
      const deltaX = (e.clientX - dragStart.x) / currentScale
      const deltaY = (e.clientY - dragStart.y) / currentScale

      if (Object.keys(dragStart.initialPositions || {}).length > 1) {
        Object.keys(dragStart.initialPositions).forEach((id) => {
          const initPos = dragStart.initialPositions[id]
          const newX = initPos.x + deltaX
          const newY = initPos.y + deltaY
          updateElement(id, { x: newX, y: newY }, location)
        })
      } else {
        const childWidth = resolveWidth(child.width)
        const childHeight = resolveHeight(child.height)
        
        let newX = dragStart.initialX + deltaX
        let newY = dragStart.initialY + deltaY

        if (snapToGuides) {
          const snapTolerance = 8
          let minDistanceX = snapTolerance + 1
          let minDistanceY = snapTolerance + 1
          let activeSnapH: number | null = null
          let activeSnapV: number | null = null

          // 1. Container boundaries snap
          if (Math.abs(newX) < minDistanceX) {
            minDistanceX = Math.abs(newX)
            newX = 0
          }
          if (Math.abs((newX + childWidth) - containerWidth) < minDistanceX) {
            minDistanceX = Math.abs((newX + childWidth) - containerWidth)
            newX = containerWidth - childWidth
          }
          if (Math.abs((newX + childWidth / 2) - containerWidth / 2) < minDistanceX) {
            minDistanceX = Math.abs((newX + childWidth / 2) - containerWidth / 2)
            newX = containerWidth / 2 - childWidth / 2
          }

          if (Math.abs(newY) < minDistanceY) {
            minDistanceY = Math.abs(newY)
            newY = 0
          }
          if (Math.abs((newY + childHeight) - containerHeight) < minDistanceY) {
            minDistanceY = Math.abs((newY + childHeight) - containerHeight)
            newY = containerHeight - childHeight
          }
          if (Math.abs((newY + childHeight / 2) - containerHeight / 2) < minDistanceY) {
            minDistanceY = Math.abs((newY + childHeight / 2) - containerHeight / 2)
            newY = containerHeight / 2 - childHeight / 2
          }

          // 2. Vertical Guides Snap
          if (containerPageX !== undefined) {
            verticalGuides.forEach((guidePageX) => {
              const guideLocalX = guidePageX - containerPageX

              // Left edge
              const distLeft = Math.abs(newX - guideLocalX)
              if (distLeft < minDistanceX) {
                minDistanceX = distLeft
                newX = guideLocalX
                activeSnapV = guidePageX
              }

              // Right edge
              const distRight = Math.abs((newX + childWidth) - guideLocalX)
              if (distRight < minDistanceX) {
                minDistanceX = distRight
                newX = guideLocalX - childWidth
                activeSnapV = guidePageX
              }

              // Center
              const distCenter = Math.abs((newX + childWidth / 2) - guideLocalX)
              if (distCenter < minDistanceX) {
                minDistanceX = distCenter
                newX = guideLocalX - childWidth / 2
                activeSnapV = guidePageX
              }
            })
          }

          // 3. Horizontal Guides Snap
          if (containerPageY !== undefined) {
            horizontalGuides.forEach((guidePageY) => {
              const guideLocalY = guidePageY - containerPageY

              // Top edge
              const distTop = Math.abs(newY - guideLocalY)
              if (distTop < minDistanceY) {
                minDistanceY = distTop
                newY = guideLocalY
                activeSnapH = guidePageY
              }

              // Bottom edge
              const distBottom = Math.abs((newY + childHeight) - guideLocalY)
              if (distBottom < minDistanceY) {
                minDistanceY = distBottom
                newY = guideLocalY - childHeight
                activeSnapH = guidePageY
              }

              // Center
              const distCenter = Math.abs((newY + childHeight / 2) - guideLocalY)
              if (distCenter < minDistanceY) {
                minDistanceY = distCenter
                newY = guideLocalY - childHeight / 2
                activeSnapH = guidePageY
              }
            })
          }

          onSnapGuide?.({ h: activeSnapH, v: activeSnapV })
        }
        
        newX = Math.max(0, Math.min(newX, Math.max(0, containerWidth - childWidth)))
        newY = Math.max(0, Math.min(newY, Math.max(0, containerHeight - childHeight)))
        
        const isChildRelative = (child.positionMode || child.position || '').toUpperCase() === 'RELATIVE'
        if (isChildRelative && effectiveY !== undefined) {
          const newOffsetY = child.height === '100%' ? 0 : Math.max(0, dragStart.initialOffsetY + deltaY)
          updateContainerChildElement(containerId, child.id, { x: newX, y: newY, relativeOffsetY: newOffsetY }, location)
        } else {
          updateContainerChildElement(containerId, child.id, { x: newX, y: newY }, location)
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
  }, [isDragging, dragStart, containerId, child.id, location, updateContainerChildElement, updateElement, saveSnapshot, snapToGuides, horizontalGuides, verticalGuides, containerPageX, containerPageY, scale])

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const currentScale = scale || 1
      const deltaX = (e.clientX - resizeStart.x) / currentScale
      const deltaY = (e.clientY - resizeStart.y) / currentScale
      
      let newWidth = resizeStart.initialW + deltaX
      let newHeight = resizeStart.initialH + deltaY

      if (snapToGuides) {
        const snapTolerance = 8
        let minDistanceX = snapTolerance + 1
        let minDistanceY = snapTolerance + 1
        let activeSnapH: number | null = null
        let activeSnapV: number | null = null

        const currentX = child.x || 0
        const currentY = child.y || 0

        // Snap to container right edge
        if (Math.abs((currentX + newWidth) - containerWidth) < minDistanceX) {
          minDistanceX = Math.abs((currentX + newWidth) - containerWidth)
          newWidth = containerWidth - currentX
        }
        // Snap to container bottom edge
        if (Math.abs((currentY + newHeight) - containerHeight) < minDistanceY) {
          minDistanceY = Math.abs((currentY + newHeight) - containerHeight)
          newHeight = containerHeight - currentY
        }

        // Snap to vertical guides
        if (containerPageX !== undefined) {
          verticalGuides.forEach((guidePageX) => {
            const guideLocalX = guidePageX - containerPageX
            const dist = Math.abs((currentX + newWidth) - guideLocalX)
            if (dist < minDistanceX) {
              minDistanceX = dist
              newWidth = guideLocalX - currentX
              activeSnapV = guidePageX
            }
          })
        }

        // Snap to horizontal guides
        if (containerPageY !== undefined) {
          horizontalGuides.forEach((guidePageY) => {
            const guideLocalY = guidePageY - containerPageY
            const dist = Math.abs((currentY + newHeight) - guideLocalY)
            if (dist < minDistanceY) {
              minDistanceY = dist
              newHeight = guideLocalY - currentY
              activeSnapH = guidePageY
            }
          })
        }

        onSnapGuide?.({ h: activeSnapH, v: activeSnapV })
      }

      newWidth = Math.max(10, Math.min(containerWidth - (child.x || 0), newWidth))
      newHeight = Math.max(10, Math.min(containerHeight - (child.y || 0), newHeight))
      
      updateContainerChildElement(containerId, child.id, { width: newWidth, height: newHeight }, location)
    }

    const handleMouseUp = () => {
      setIsResizing(null)
      onSnapGuide?.({ h: null, v: null })
      saveSnapshot()
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, resizeStart, containerId, child.id, child.x, child.y, containerWidth, containerHeight, location, updateContainerChildElement, saveSnapshot, snapToGuides, horizontalGuides, verticalGuides, containerPageX, containerPageY, scale])

  // Renderizar baseado no tipo
  const renderContent = () => {
    switch (child.type) {
      case 'text':
      case 'static_text':
      case 'rich_text':
      case 'link': {
        const isChildRelative = (child.positionMode || child.position || '').toUpperCase() === 'RELATIVE'
        const rawW = isChildRelative && effectiveWidth !== undefined ? effectiveWidth : child.width
        const textWidth = rawW ? resolveWidth(rawW) : undefined
        const textHeight = child.height ? resolveHeight(child.height) : undefined
        const displayText = resolveElementDisplayText(child, testData, child.type === 'text' ? 'campo' : 'Texto')

        const isMultiline = child.style?.multiline === true
        const estimatedHeight = getEstimatedElementHeight(child, textWidth || containerWidth, testData)
        const firstLineIndent = child.style?.firstLineIndent || 0

        // Bordas e padding
        const textBorderWidth = child.style?.borderWidth ?? 0
        const textBorderColor = child.style?.borderColor || '#000000'
        const textBorderStyle = child.style?.borderStyle || 'solid'
        const textBgColor = child.style?.backgroundColor || 'transparent'

        const textStyles: CSSProperties = {
          width: textWidth || 'auto',
          height: isMultiline ? Math.max(textHeight || 0, estimatedHeight) : (textHeight || estimatedHeight),
          fontSize: child.style?.fontSize || 12,
          fontWeight: child.style?.fontWeight || 'normal',
          fontStyle: child.style?.fontStyle || 'normal',
          fontFamily: getFontFamily(child.style?.fontFamily),
          textDecoration: child.style?.textDecoration || (child.type === 'link' ? 'underline' : 'none'),
          color: child.style?.color || '#000000',
          textDecorationColor: child.style?.color || '#000000',
          backgroundColor: textBgColor,
          overflow: isMultiline ? 'auto' : 'hidden',
          textOverflow: isMultiline ? 'clip' : 'ellipsis',
          whiteSpace: isMultiline ? 'pre-wrap' : 'nowrap',
          boxSizing: 'border-box',
          display: isMultiline ? 'block' : 'flex',
          alignItems: isMultiline ? undefined : getVerticalAlign(child.style?.verticalAlignment),
          justifyContent: isMultiline ? undefined : getHorizontalAlign(child.style?.alignment),
          textAlign: getTextAlign(child.style?.alignment),
          textIndent: isMultiline && firstLineIndent > 0 ? `${firstLineIndent}px` : undefined,
          lineHeight: child.style?.lineHeight || 'normal',
          borderTopWidth: `${child.style?.borderTopWidth ?? textBorderWidth}px`,
          borderTopStyle: textBorderStyle,
          borderTopColor: textBorderColor,
          borderRightWidth: `${child.style?.borderRightWidth ?? textBorderWidth}px`,
          borderRightStyle: textBorderStyle,
          borderRightColor: textBorderColor,
          borderBottomWidth: `${child.style?.borderBottomWidth ?? textBorderWidth}px`,
          borderBottomStyle: textBorderStyle,
          borderBottomColor: textBorderColor,
          borderLeftWidth: `${child.style?.borderLeftWidth ?? textBorderWidth}px`,
          borderLeftStyle: textBorderStyle,
          borderLeftColor: textBorderColor,
          borderRadius: `${child.style?.cornerRadius || 0}px`,
          paddingTop: `${child.style?.paddingTop ?? child.style?.paddingY ?? 0}px`,
          paddingRight: `${child.style?.paddingRight ?? child.style?.paddingX ?? 0}px`,
          paddingBottom: `${child.style?.paddingBottom ?? child.style?.paddingY ?? 0}px`,
          paddingLeft: `${child.style?.paddingLeft ?? child.style?.paddingX ?? 0}px`,
        }

        return (
          <div style={textStyles}>
            {displayText}
          </div>
        )
      }
      case 'image': {
        const imgWidth = resolveWidth(child.width || 50)
        const imgHeight = resolveHeight(child.height || 50)
        return (
          <div
            className="bg-gray-200 flex items-center justify-center text-gray-400"
            style={{
              width: imgWidth,
              height: imgHeight,
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )
      }
            case 'page_break': {
        const pbWidth = resolveWidth(child.width || '100%')
        return (
          <div
            style={{
              width: pbWidth,
              height: 20,
              borderBottom: '4px dashed #999',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            <span style={{
              background: 'white',
              padding: '0 10px',
              color: '#999',
              fontSize: '12px',
              fontWeight: 'bold',
              transform: 'translateY(10px)'
            }}>
              PAGE BREAK
            </span>
          </div>
        )
      }
      case 'spacer':
      case 'rectangle': {
        const rectWidth = resolveWidth(child.width)
        const rectHeight = resolveHeight(child.height)
        return (
          <div
            style={{
              width: rectWidth,
              height: rectHeight,
              boxSizing: 'border-box',
              backgroundColor: child.style?.fillColor || '#e0e0e0',
              borderRadius: child.style?.cornerRadius || 0,
              border: child.style?.borderColor ? `1px solid ${child.style.borderColor}` : 'none',
            }}
          />
        )
      }
      case 'line': {
        // Support both new (width/height) and legacy (x2/y2) formats, including "100%"
        const lineChildWidthRaw = child.width ?? (child.x2 ? child.x2 - child.x : 100)
        const lineChildHeightRaw = child.height ?? (child.y2 ? child.y2 - child.y : 0)
        const lineChildWidth = typeof lineChildWidthRaw === 'string' ? resolveWidth(lineChildWidthRaw) : lineChildWidthRaw
        const lineChildHeight = typeof lineChildHeightRaw === 'string' ? resolveHeight(lineChildHeightRaw) : lineChildHeightRaw
        const childStrokeWidth = child.style?.strokeWidth || 1

        // SVG must be large enough to contain the stroke
        const svgChildWidth = Math.max(Math.abs(lineChildWidth), childStrokeWidth)
        const svgChildHeight = Math.max(Math.abs(lineChildHeight), childStrokeWidth)

        // Calculate line coordinates with stroke offset
        const childStrokeOffset = childStrokeWidth / 2
        const childLineX1 = lineChildWidth >= 0 ? childStrokeOffset : svgChildWidth - childStrokeOffset
        const childLineY1 = lineChildHeight >= 0 ? childStrokeOffset : svgChildHeight - childStrokeOffset
        const childLineX2 = lineChildWidth >= 0 ? svgChildWidth - childStrokeOffset : childStrokeOffset
        const childLineY2 = lineChildHeight >= 0 ? svgChildHeight - childStrokeOffset : childStrokeOffset

        return (
          <svg
            width={svgChildWidth}
            height={svgChildHeight}
            style={{ overflow: 'visible' }}
          >
            <line
              x1={childLineX1}
              y1={childLineY1}
              x2={childLineX2}
              y2={childLineY2}
              stroke={child.style?.strokeColor || '#000000'}
              strokeWidth={childStrokeWidth}
            />
          </svg>
        )
      }
      case 'loop': {
         const loopElements = child.elements || []
                 const loopBinding = child.dataBinding || ''
                 const loopItemSpacing = child.itemSpacing || 20
                 const loopWidth = typeof child.width === 'number' ? child.width : 400
                 const loopHeight = typeof child.height === 'number' ? child.height : 150

                 return (
                   <div
                     className={`cursor-move select-none relative ${
                       isSelected ? 'ring-2 ring-primary-500' : ''
                     }`}
                     style={{
                       width: loopWidth,
                       height: loopHeight,
                       backgroundColor: 'rgba(139, 92, 246, 0.03)',
                       borderWidth: child.style?.borderWidth || 2,
                       borderStyle: (child.style?.borderStyle as string) || 'dashed',
                       borderColor: child.style?.borderColor || '#8b5cf6',
                       borderRadius: 4,
                     }}
                     //onMouseDown={handleMouseDown}
                   >
         {/*
                      <div
                       className={`absolute flex items-center gap-2 px-2 py-1 bg-primary-500 text-white rounded-md shadow-sm pointer-events-none transition-opacity ${
                         isSelected ? 'opacity-100' : 'opacity-70'
                       }`}
                       style={{ top: -24, right: -100 }}
                     >
                       <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                         <path d="M17 2l4 4-4 4" />
                         <path d="M3 11v-1a4 4 0 014-4h14" />
                         <path d="M7 22l-4-4 4-4" />
                         <path d="M21 13v1a4 4 0 01-4 4H3" />
                       </svg>
                       <span className="text-[10px] font-semibold">LOOP</span>
                       <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded ml-1">
                         {loopElements.length}
                       </span>
                     </div>
         */}

                     <div className="relative w-full h-full">
                       {loopElements.length === 0 ? (
                         <div className="absolute inset-0 flex items-center justify-center">
                           <div className="text-center p-3 border-2 border-dashed border-primary-200 rounded-lg bg-primary-50/50">
                             <div className="text-primary-400 text-[10px] font-medium">{t.canvas.addElements}</div>
                             <div className="text-primary-300 text-[9px]">{t.canvas.viaSidebar}</div>
                           </div>
                         </div>
                       ) : (
                         <>

                           {loopElements.map((childLoop: Element) => (
                             <LoopChildElement
                               key={childLoop.id}
                               child={childLoop}
                               loopId={child.id}
                               location={location}
                               loopWidth={loopWidth}
                               loopHeight={loopHeight}
                               horizontalGuides={horizontalGuides}
                               verticalGuides={verticalGuides}
                               loopPageX={
                                 (containerPageX !== undefined ? containerPageX : 0) + (child.x || 0)
                               }
                               loopPageY={
                                 (containerPageY !== undefined ? containerPageY : 0) + (child.y || 0)
                               }
                               scale={scale}
                               onSnapGuide={onSnapGuide}
                             />
                           ))}
                         </>
                       )}
                     </div>

                     {/* Spacing badge - bottom right corner
                     <div className="absolute bottom-1 right-1 pointer-events-none">
                       <span className="text-[8px] text-primary-400 bg-primary-50 px-1.5 py-0.5 rounded">
                         spacing: {loopItemSpacing}px
                       </span>
                     </div>
                     */}
                   </div>
                 )
      }
      case 'table': {
        const columns = Array.isArray(child.columns) ? child.columns : []
        const hasValidColumns = columns.length > 0 && columns.every((col: unknown) => col && typeof col === 'object')
        const tableStyle = child.style || {}
        const headerBg = tableStyle.headerBackground || '#f0f0f0'
        const headerColor = tableStyle.headerColor || '#000000'
        const headerFontSize = (tableStyle.headerFontSize as number) || 12
        const fontSize = (tableStyle.fontSize as number) || 10
        const cellColor = tableStyle.cellColor || '#000000'
        const cellBg = (tableStyle.cellBackground as string) || '#ffffff'
        const borderColor = (tableStyle.borderColor as string) || '#cccccc'
        const headerBorderColor = (tableStyle.headerBorderColor as string) || borderColor
        const borderStyle = (tableStyle.borderStyle as string) || 'solid'
        const headerPadding = (tableStyle.headerPadding as number) ?? 5
        const cellPadding = (tableStyle.cellPadding as number) ?? 5
        const headerBorderValues = getHeaderBorderValues(tableStyle)
        const cellBorderValues = getCellBorderValues(tableStyle)
        const headerBorderType = (tableStyle.headerBorderType as string) || 'all'
        const cellBorderType = (tableStyle.cellBorderType as string) || 'all'
        const columnWidths = columns.map((col: Record<string, unknown>) => (col.width as number) || 100)
        const totalWidth = columnWidths.reduce((sum: number, w: number) => sum + w, 0)
        const rawW = child.width ?? 400
        const resolvedW = rawW === '100%' ? containerWidth : (typeof rawW === 'number' ? rawW : 400)
        const proportionalWidths = columnWidths.map((w: number) => totalWidth > 0 ? (w / totalWidth) * resolvedW : (columns.length > 0 ? resolvedW / columns.length : 100))

        return (
          <div
            style={{
              width: resolvedW,
              minHeight: 40,
            }}
          >
            {hasValidColumns ? (
              <table className="w-full pointer-events-none border-collapse" style={{ tableLayout: 'fixed' }}>
                <thead>
                  <tr style={{ backgroundColor: headerBg === 'transparent' ? 'transparent' : headerBg, color: headerColor, fontSize: `${headerFontSize}px` }}>
                    {columns.map((col: Record<string, unknown>, i: number) => {
                      const isFirst = i === 0
                      const isLast = i === columns.length - 1
                      let hLeft = headerBorderValues.left
                      let hRight = headerBorderValues.right

                      if (headerBorderType === 'columns') {
                        hLeft = isFirst ? headerBorderValues.left : headerBorderValues.left / 2
                        hRight = isLast ? headerBorderValues.right : headerBorderValues.right / 2
                      } else if (headerBorderType === 'row') {
                        hLeft = isFirst ? headerBorderValues.left : 0
                        hRight = isLast ? headerBorderValues.right : 0
                      } else if (headerBorderType === 'none') {
                        hLeft = 0
                        hRight = 0
                      }

                      return (
                        <th
                          key={`ch-th-${i}`}
                          className="font-semibold"
                          style={{
                            width: proportionalWidths[i],
                            padding: `${headerPadding}px`,
                            borderTopWidth: `${headerBorderValues.top}px`,
                            borderTopStyle: borderStyle as any,
                            borderTopColor: headerBorderColor,
                            borderBottomWidth: `${headerBorderValues.bottom}px`,
                            borderBottomStyle: borderStyle as any,
                            borderBottomColor: headerBorderColor,
                            borderLeftWidth: `${hLeft}px`,
                            borderLeftStyle: borderStyle as any,
                            borderLeftColor: headerBorderColor,
                            borderRightWidth: `${hRight}px`,
                            borderRightStyle: borderStyle as any,
                            borderRightColor: headerBorderColor,
                            textAlign: (col.headerAlignment as any) || (col.alignment as any) || 'left',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {String(col?.header || 'Header')}
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ fontSize: `${fontSize}px`, color: cellColor, backgroundColor: cellBg === 'transparent' ? 'transparent' : cellBg }}>
                    {columns.map((col: Record<string, unknown>, i: number) => {
                      const isFirst = i === 0
                      const isLast = i === columns.length - 1
                      let cLeft = cellBorderValues.left
                      let cRight = cellBorderValues.right
                      let cTop = cellBorderValues.top
                      let cBottom = cellBorderValues.bottom

                      if (cellBorderType === 'cells' || cellBorderType === 'all') {
                        cLeft = isFirst ? cellBorderValues.left : cellBorderValues.left / 2
                        cRight = isLast ? cellBorderValues.right : cellBorderValues.right / 2
                      } else if (cellBorderType === 'row') {
                        cLeft = isFirst ? cellBorderValues.left : 0
                        cRight = isLast ? cellBorderValues.right : 0
                      } else if (cellBorderType === 'columns') {
                        cTop = 0
                        cBottom = 0
                        cLeft = isFirst ? cellBorderValues.left : cellBorderValues.left / 2
                        cRight = isLast ? cellBorderValues.right : cellBorderValues.right / 2
                      } else if (cellBorderType === 'none') {
                        cTop = 0
                        cBottom = 0
                        cLeft = 0
                        cRight = 0
                      }

                      return (
                        <td
                          key={`ch-td-${i}`}
                          style={{
                            width: proportionalWidths[i],
                            padding: `${cellPadding}px`,
                            borderTopWidth: `${cTop}px`,
                            borderTopStyle: borderStyle as any,
                            borderTopColor: borderColor,
                            borderBottomWidth: `${cBottom}px`,
                            borderBottomStyle: borderStyle as any,
                            borderBottomColor: borderColor,
                            borderLeftWidth: `${cLeft}px`,
                            borderLeftStyle: borderStyle as any,
                            borderLeftColor: borderColor,
                            borderRightWidth: `${cRight}px`,
                            borderRightStyle: borderStyle as any,
                            borderRightColor: borderColor,
                            textAlign: (col.alignment as any) || 'left',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {String(col?.field || 'field')}
                        </td>
                      )
                    })}
                  </tr>
                </tbody>
              </table>
            ) : (
              <div className="w-full min-h-[40px] flex items-center justify-center text-slate-400 text-xs border border-dashed border-slate-600 rounded bg-slate-900/40 p-2">
                📊 Tabela sem colunas (configure no painel)
              </div>
            )}
          </div>
        )
      }
      case 'barcode': {
        const barcodeType = ((child.barcodeType as string) || 'qrcode').toLowerCase()
        const is2D = barcodeType === 'qrcode' || barcodeType === 'qr_code' || barcodeType === 'datamatrix' || barcodeType === 'data_matrix'
        const rawBinding = (child.value as string) || (child.dataBinding as string) || (is2D ? 'https://openpdf.dev' : '123456789012')
        const bw = resolveWidth(child.width || (is2D ? 100 : 140))
        const bh = resolveHeight(child.height || (is2D ? 100 : 50))

        return (
          <div
            className="select-none border border-dashed border-slate-400 flex flex-col items-center justify-center bg-white p-1.5 overflow-hidden"
            style={{ width: bw, height: bh }}
          >
            {is2D ? (
              <svg className="w-3/5 h-3/5 text-slate-900 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3h7v7H3V3zm2 2v3h3V5H5zm9-2h7v7h-7V3zm2 2v3h3V5h-3zM3 14h7v7H3v-7zm2 2v3h3v-3H5zm9-2h3v3h-3v-3zm4 0h3v3h-3v-3zm-2 3h2v2h-2v-2zm-2 2h3v2h-3v-2zm4 0h3v2h-3v-2z" />
              </svg>
            ) : (
              <svg className="w-4/5 h-3/5 text-slate-900 shrink-0" viewBox="0 0 48 20" fill="currentColor" preserveAspectRatio="none">
                <rect x="2" y="1" width="2" height="18" />
                <rect x="6" y="1" width="1" height="18" />
                <rect x="9" y="1" width="3" height="18" />
                <rect x="14" y="1" width="1" height="18" />
                <rect x="17" y="1" width="2" height="18" />
                <rect x="21" y="1" width="4" height="18" />
                <rect x="27" y="1" width="1" height="18" />
                <rect x="30" y="1" width="2" height="18" />
                <rect x="34" y="1" width="3" height="18" />
                <rect x="39" y="1" width="1" height="18" />
                <rect x="42" y="1" width="2" height="18" />
                <rect x="45" y="1" width="1" height="18" />
              </svg>
            )}
            <span className="text-[9px] font-mono text-slate-600 text-center truncate w-full px-1 mt-0.5 leading-tight">
              {rawBinding}
            </span>
          </div>
        )
      }
      default:
        return <div className="w-10 h-10 bg-gray-300" />
    }
  }

  return (
    <div
      className={`absolute cursor-move ${isSelected ? 'ring-2 ring-purple-500' : ''}`}
      style={{
        left: child.width === '100%' ? 0 : (effectiveX !== undefined ? effectiveX : (child.x || 0)),
        top: child.height === '100%' ? 0 : (effectiveY !== undefined ? effectiveY : (child.y || 0)),
        ...(child.width === '100%'
          ? { width: '100%' }
          : typeof child.width === 'number'
            ? { width: child.width }
            : (effectiveWidth !== undefined ? { width: effectiveWidth } : {})),
      }}
      onMouseDown={handleMouseDown}
      onContextMenu={(e) => {
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
      }}
    >
      {renderContent()}
      {/* Label do elemento e handles de redimensionamento */}
      {isSelected && (
        <>
          <div className="absolute -top-4 left-0 text-[9px] bg-purple-500 text-white px-1 rounded z-30">
            {child.type}
          </div>
          {/* Resize handle canto inferior direito */}
          <div
            className="absolute -right-1 -bottom-1 w-2.5 h-2.5 bg-white border-2 border-purple-500 rounded-full cursor-se-resize z-40"
            onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
          />
          {/* Resize handle lateral direita */}
          <div
            className="absolute -right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border-2 border-purple-500 rounded-full cursor-e-resize z-40"
            onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
          />
          {/* Resize handle borda inferior */}
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-2 border-purple-500 rounded-full cursor-s-resize z-40"
            onMouseDown={(e) => handleResizeMouseDown(e, 's')}
          />
        </>
      )}
    </div>
  )
}

function LoopChildElement({
  child,
  loopId,
  location,
  loopWidth,
  loopHeight,
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
    testData
  } = useTemplateStore()
  const snapToGuides = useUIStore((state) => state.snapToGuides)
  
  const isSelected = selectedElementIds.includes(child.id) || (selectedLoopChildId === child.id && selectedLoopParentId === loopId)
  
  // Find loop element in all sections
  const findLoopElement = (loopElementId: string): Element | undefined => {
    const template = useTemplateStore.getState().template
    
    // Search in all possible locations
    const allElements: Element[] = [
      ...(template.page || []),
      ...(template.pageSettings.header?.elements || []),
      ...(template.pageSettings.footer?.elements || []),
      ...(template.pageSettings.bodyBackground?.elements || []),
      ...(template.summaryPage?.elements || [])
    ]
    
    return allElements.find(e => e.id === loopElementId)
  }
  
  // Resolve display text for loop child elements
  // In loops, child elements use 'value' as the field name to get from each item
  const resolveChildDisplayText = (el: { value?: string; dataBinding?: string }, fallback: string = ''): string => {
    // The field to resolve - could be in value or dataBinding (trim whitespace)
    const rawFieldName = el.dataBinding || el.value
    const fieldName = rawFieldName?.trim()
    
    if (!fieldName) {
      return fallback
    }
    
    // Try to resolve the field from the loop's data array
    if (testData && Object.keys(testData).length > 0) {
      const loopElement = findLoopElement(loopId)
      const loopDataBinding = loopElement?.dataBinding?.trim()
      
      if (loopDataBinding) {
        // Get the array from test data
        const parts = loopDataBinding.split('.')
        let arrayData: unknown = testData
        for (const part of parts) {
          const trimmedPart = part.trim()
          if (arrayData && typeof arrayData === 'object' && trimmedPart in arrayData) {
            arrayData = (arrayData as Record<string, unknown>)[trimmedPart]
          } else {
            arrayData = null
            break
          }
        }
        
        // If we found an array, try to get the field from the first item
        if (Array.isArray(arrayData) && arrayData.length > 0) {
          const firstItem = arrayData[0]
          
          // Check for transformations
          if (hasTransformations(fieldName)) {
            const result = processExpression(fieldName, firstItem as Record<string, unknown>)
            if (result) return result
          }
          
          // Simple field resolution - direct property access first
          if (firstItem && typeof firstItem === 'object' && fieldName in firstItem) {
            const directValue = (firstItem as Record<string, unknown>)[fieldName]
            if (directValue !== null && directValue !== undefined) {
              return String(directValue)
            }
          }
          
          // Nested field resolution (for paths like "address.city")
          const fieldParts = fieldName.split('.')
          let value: unknown = firstItem
          for (const part of fieldParts) {
            const trimmedPart = part.trim()
            if (value && typeof value === 'object' && trimmedPart in value) {
              value = (value as Record<string, unknown>)[trimmedPart]
            } else {
              value = null
              break
            }
          }
          if (value !== null && value !== undefined) {
            return String(value)
          }
        }
      }
    }
    
    // Fallback: show the field name between braces
    return `{${fieldName}}`
  }
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, initialX: 0, initialY: 0 })
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, initialW: 100, initialH: 20 })
  
  // Resolve dimensions (support for "100%")
  const resolveWidth = (value: string | number | undefined): number => {
    if (value === '100%') return loopWidth
    if (typeof value === 'number') return value
    return 100 // default
  }
  
  const resolveHeight = (value: string | number | undefined): number => {
    if (value === '100%') return loopHeight
    if (typeof value === 'number') return value
    return 20 // default
  }
  
  const handleMouseDown = (e: ReactMouseEvent) => {
    if (e.button !== 0) return
    e.stopPropagation()
    if (e.ctrlKey || e.metaKey || e.shiftKey) {
      toggleElementSelection(child.id, location)
      return
    }
    if (!isSelected) {
      selectLoopChild(loopId, child.id, location)
    }
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY, initialX: child.x || 0, initialY: child.y || 0 })
  }

  const handleResizeMouseDown = (e: ReactMouseEvent, direction: string) => {
    e.stopPropagation()
    setIsResizing(direction)
    const initialW = resolveWidth(child.width)
    const initialH = resolveHeight(child.height)
    setResizeStart({ x: e.clientX, y: e.clientY, initialW, initialH })
  }
  
  useEffect(() => {
    if (!isDragging) return
    
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const currentScale = scale || 1
      const deltaX = (e.clientX - dragStart.x) / currentScale
      const deltaY = (e.clientY - dragStart.y) / currentScale

      const childWidth = resolveWidth(child.width)
      const childHeight = resolveHeight(child.height)
      
      let newX = dragStart.initialX + deltaX
      let newY = dragStart.initialY + deltaY

      if (snapToGuides) {
        const snapTolerance = 8
        let minDistanceX = snapTolerance + 1
        let minDistanceY = snapTolerance + 1
        let activeSnapH: number | null = null
        let activeSnapV: number | null = null

        // 1. Loop boundaries snap
        if (Math.abs(newX) < minDistanceX) {
          minDistanceX = Math.abs(newX)
          newX = 0
        }
        if (Math.abs((newX + childWidth) - loopWidth) < minDistanceX) {
          minDistanceX = Math.abs((newX + childWidth) - loopWidth)
          newX = loopWidth - childWidth
        }
        if (Math.abs((newX + childWidth / 2) - loopWidth / 2) < minDistanceX) {
          minDistanceX = Math.abs((newX + childWidth / 2) - loopWidth / 2)
          newX = loopWidth / 2 - childWidth / 2
        }

        if (Math.abs(newY) < minDistanceY) {
          minDistanceY = Math.abs(newY)
          newY = 0
        }
        if (Math.abs((newY + childHeight) - loopHeight) < minDistanceY) {
          minDistanceY = Math.abs((newY + childHeight) - loopHeight)
          newY = loopHeight - childHeight
        }
        if (Math.abs((newY + childHeight / 2) - loopHeight / 2) < minDistanceY) {
          minDistanceY = Math.abs((newY + childHeight / 2) - loopHeight / 2)
          newY = loopHeight / 2 - childHeight / 2
        }

        // 2. Vertical Guides Snap
        if (loopPageX !== undefined) {
          verticalGuides.forEach((guidePageX) => {
            const guideLocalX = guidePageX - loopPageX

            // Left edge
            const distLeft = Math.abs(newX - guideLocalX)
            if (distLeft < minDistanceX) {
              minDistanceX = distLeft
              newX = guideLocalX
              activeSnapV = guidePageX
            }

            // Right edge
            const distRight = Math.abs((newX + childWidth) - guideLocalX)
            if (distRight < minDistanceX) {
              minDistanceX = distRight
              newX = guideLocalX - childWidth
              activeSnapV = guidePageX
            }

            // Center
            const distCenter = Math.abs((newX + childWidth / 2) - guideLocalX)
            if (distCenter < minDistanceX) {
              minDistanceX = distCenter
              newX = guideLocalX - childWidth / 2
              activeSnapV = guidePageX
            }
          })
        }

        // 3. Horizontal Guides Snap
        if (loopPageY !== undefined) {
          horizontalGuides.forEach((guidePageY) => {
            const guideLocalY = guidePageY - loopPageY

            // Top edge
            const distTop = Math.abs(newY - guideLocalY)
            if (distTop < minDistanceY) {
              minDistanceY = distTop
              newY = guideLocalY
              activeSnapH = guidePageY
            }

            // Bottom edge
            const distBottom = Math.abs((newY + childHeight) - guideLocalY)
            if (distBottom < minDistanceY) {
              minDistanceY = distBottom
              newY = guideLocalY - childHeight
              activeSnapH = guidePageY
            }

            // Center
            const distCenter = Math.abs((newY + childHeight / 2) - guideLocalY)
            if (distCenter < minDistanceY) {
              minDistanceY = distCenter
              newY = guideLocalY - childHeight / 2
              activeSnapH = guidePageY
            }
          })
        }

        onSnapGuide?.({ h: activeSnapH, v: activeSnapV })
      }
      
      newX = Math.max(0, Math.min(newX, Math.max(0, loopWidth - childWidth)))
      newY = Math.max(0, Math.min(newY, Math.max(0, loopHeight - childHeight)))
      
      updateLoopChildElement(loopId, child.id, { x: newX, y: newY }, location)
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
  }, [isDragging, dragStart, loopId, child.id, location, updateLoopChildElement, saveSnapshot, snapToGuides, horizontalGuides, verticalGuides, loopPageX, loopPageY, scale])

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const currentScale = scale || 1
      const deltaX = (e.clientX - resizeStart.x) / currentScale
      const deltaY = (e.clientY - resizeStart.y) / currentScale

      let newWidth = resizeStart.initialW + deltaX
      let newHeight = resizeStart.initialH + deltaY

      if (snapToGuides) {
        const snapTolerance = 8
        let minDistanceX = snapTolerance + 1
        let minDistanceY = snapTolerance + 1
        let activeSnapH: number | null = null
        let activeSnapV: number | null = null

        const currentX = child.x || 0
        const currentY = child.y || 0

        // Snap to loop right edge
        if (Math.abs((currentX + newWidth) - loopWidth) < minDistanceX) {
          minDistanceX = Math.abs((currentX + newWidth) - loopWidth)
          newWidth = loopWidth - currentX
        }
        // Snap to loop bottom edge
        if (Math.abs((currentY + newHeight) - loopHeight) < minDistanceY) {
          minDistanceY = Math.abs((currentY + newHeight) - loopHeight)
          newHeight = loopHeight - currentY
        }

        // Snap to vertical guides
        if (loopPageX !== undefined) {
          verticalGuides.forEach((guidePageX) => {
            const guideLocalX = guidePageX - loopPageX
            const dist = Math.abs((currentX + newWidth) - guideLocalX)
            if (dist < minDistanceX) {
              minDistanceX = dist
              newWidth = guideLocalX - currentX
              activeSnapV = guidePageX
            }
          })
        }

        // Snap to horizontal guides
        if (loopPageY !== undefined) {
          horizontalGuides.forEach((guidePageY) => {
            const guideLocalY = guidePageY - loopPageY
            const dist = Math.abs((currentY + newHeight) - guideLocalY)
            if (dist < minDistanceY) {
              minDistanceY = dist
              newHeight = guideLocalY - currentY
              activeSnapH = guidePageY
            }
          })
        }

        onSnapGuide?.({ h: activeSnapH, v: activeSnapV })
      }

      newWidth = Math.max(10, Math.min(loopWidth - (child.x || 0), newWidth))
      newHeight = Math.max(10, Math.min(loopHeight - (child.y || 0), newHeight))

      updateLoopChildElement(loopId, child.id, { width: newWidth, height: newHeight }, location)
    }

    const handleMouseUp = () => {
      setIsResizing(null)
      onSnapGuide?.({ h: null, v: null })
      saveSnapshot()
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, resizeStart, loopId, child.id, child.x, child.y, loopWidth, loopHeight, location, updateLoopChildElement, saveSnapshot, snapToGuides, horizontalGuides, verticalGuides, loopPageX, loopPageY, scale])
  
  // Renderizar baseado no tipo
  const renderContent = () => {
    switch (child.type) {
      case 'text':
      case 'static_text':
      case 'rich_text':
      case 'link': {
        const textWidth = child.width ? resolveWidth(child.width) : undefined
        const textHeight = child.height ? resolveHeight(child.height) : undefined
        const displayText = resolveElementDisplayText(child, undefined, child.type === 'text' ? 'campo' : 'Texto')

        const isMultiline = child.style?.multiline === true
        const estimatedHeight = getEstimatedElementHeight(child, textWidth || loopWidth)
        const firstLineIndent = child.style?.firstLineIndent || 0

        // Bordas e padding
        const textBorderWidth = child.style?.borderWidth ?? 0
        const textBorderColor = child.style?.borderColor || '#000000'
        const textBorderStyle = child.style?.borderStyle || 'solid'
        const textBgColor = child.style?.backgroundColor || 'transparent'

        const textStyles: CSSProperties = {
          width: textWidth || 'auto',
          height: isMultiline ? Math.max(textHeight || 0, estimatedHeight) : (textHeight || estimatedHeight),
          fontSize: child.style?.fontSize || 12,
          fontWeight: child.style?.fontWeight || 'normal',
          fontStyle: child.style?.fontStyle || 'normal',
          fontFamily: getFontFamily(child.style?.fontFamily),
          textDecoration: child.style?.textDecoration || (child.type === 'link' ? 'underline' : 'none'),
          color: child.style?.color || '#000000',
          textDecorationColor: child.style?.color || '#000000',
          backgroundColor: textBgColor,
          overflow: isMultiline ? 'auto' : 'hidden',
          textOverflow: isMultiline ? 'clip' : 'ellipsis',
          whiteSpace: isMultiline ? 'pre-wrap' : 'nowrap',
          boxSizing: 'border-box',
          display: isMultiline ? 'block' : 'flex',
          alignItems: isMultiline ? undefined : getVerticalAlign(child.style?.verticalAlignment),
          justifyContent: isMultiline ? undefined : getHorizontalAlign(child.style?.alignment),
          textAlign: getTextAlign(child.style?.alignment),
          textIndent: isMultiline && firstLineIndent > 0 ? `${firstLineIndent}px` : undefined,
          lineHeight: child.style?.lineHeight || 'normal',
          borderTopWidth: `${child.style?.borderTopWidth ?? textBorderWidth}px`,
          borderTopStyle: textBorderStyle,
          borderTopColor: textBorderColor,
          borderRightWidth: `${child.style?.borderRightWidth ?? textBorderWidth}px`,
          borderRightStyle: textBorderStyle,
          borderRightColor: textBorderColor,
          borderBottomWidth: `${child.style?.borderBottomWidth ?? textBorderWidth}px`,
          borderBottomStyle: textBorderStyle,
          borderBottomColor: textBorderColor,
          borderLeftWidth: `${child.style?.borderLeftWidth ?? textBorderWidth}px`,
          borderLeftStyle: textBorderStyle,
          borderLeftColor: textBorderColor,
          borderRadius: `${child.style?.cornerRadius || 0}px`,
          paddingTop: `${child.style?.paddingTop ?? child.style?.paddingY ?? 0}px`,
          paddingRight: `${child.style?.paddingRight ?? child.style?.paddingX ?? 0}px`,
          paddingBottom: `${child.style?.paddingBottom ?? child.style?.paddingY ?? 0}px`,
          paddingLeft: `${child.style?.paddingLeft ?? child.style?.paddingX ?? 0}px`,
        }

        return (
          <div style={textStyles}>
            {displayText}
          </div>
        )
      }
      case 'image': {
        const imgWidth = resolveWidth(child.width || 50)
        const imgHeight = resolveHeight(child.height || 50)
        return (
          <div 
            className="bg-gray-200 flex items-center justify-center text-gray-400"
            style={{
              width: imgWidth,
              height: imgHeight,
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )
      }
            case 'page_break': {
        const pbWidth = resolveWidth(child.width || '100%')
        return (
          <div
            style={{
              width: pbWidth,
              height: 20,
              borderBottom: '4px dashed #999',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            <span style={{
              background: 'white',
              padding: '0 10px',
              color: '#999',
              fontSize: '12px',
              fontWeight: 'bold',
              transform: 'translateY(10px)'
            }}>
              PAGE BREAK
            </span>
          </div>
        )
      }
      case 'spacer':
      case 'rectangle': {
        const rectWidth = resolveWidth(child.width)
        const rectHeight = resolveHeight(child.height)
        return (
          <div
            style={{
              width: rectWidth,
              height: rectHeight,
              boxSizing: 'border-box',
              backgroundColor: child.style?.fillColor || '#e0e0e0',
              borderRadius: child.style?.cornerRadius || 0,
              border: child.style?.borderColor ? `1px solid ${child.style.borderColor}` : 'none',
            }}
          />
        )
      }
      case 'line': {
        // Support both new (width/height) and legacy (x2/y2) formats, including "100%"
        const lineChildWidthRaw = child.width ?? (child.x2 ? child.x2 - child.x : 100)
        const lineChildHeightRaw = child.height ?? (child.y2 ? child.y2 - child.y : 0)
        const lineChildWidth = typeof lineChildWidthRaw === 'string' ? resolveWidth(lineChildWidthRaw) : lineChildWidthRaw
        const lineChildHeight = typeof lineChildHeightRaw === 'string' ? resolveHeight(lineChildHeightRaw) : lineChildHeightRaw
        const childStrokeWidth = child.style?.strokeWidth || 1
        
        // SVG must be large enough to contain the stroke
        const svgChildWidth = Math.max(Math.abs(lineChildWidth), childStrokeWidth)
        const svgChildHeight = Math.max(Math.abs(lineChildHeight), childStrokeWidth)
        
        // Calculate line coordinates with stroke offset
        const childStrokeOffset = childStrokeWidth / 2
        const childLineX1 = lineChildWidth >= 0 ? childStrokeOffset : svgChildWidth - childStrokeOffset
        const childLineY1 = lineChildHeight >= 0 ? childStrokeOffset : svgChildHeight - childStrokeOffset
        const childLineX2 = lineChildWidth >= 0 ? svgChildWidth - childStrokeOffset : childStrokeOffset
        const childLineY2 = lineChildHeight >= 0 ? svgChildHeight - childStrokeOffset : childStrokeOffset
        
        return (
          <svg 
            width={svgChildWidth} 
            height={svgChildHeight} 
            style={{ overflow: 'visible' }}
          >
            <line 
              x1={childLineX1}
              y1={childLineY1}
              x2={childLineX2}
              y2={childLineY2}
              stroke={child.style?.strokeColor || '#000000'}
              strokeWidth={childStrokeWidth}
            />
          </svg>
        )
      }
      case 'barcode': {
        const barcodeType = ((child.barcodeType as string) || 'qrcode').toLowerCase()
        const is2D = barcodeType === 'qrcode' || barcodeType === 'qr_code' || barcodeType === 'datamatrix' || barcodeType === 'data_matrix'
        const rawBinding = (child.value as string) || (child.dataBinding as string) || (is2D ? 'https://openpdf.dev' : '123456789012')
        const bw = resolveWidth(child.width || (is2D ? 100 : 140))
        const bh = resolveHeight(child.height || (is2D ? 100 : 50))

        return (
          <div
            className="select-none border border-dashed border-slate-400 flex flex-col items-center justify-center bg-white p-1.5 overflow-hidden"
            style={{ width: bw, height: bh }}
          >
            {is2D ? (
              <svg className="w-3/5 h-3/5 text-slate-900 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3h7v7H3V3zm2 2v3h3V5H5zm9-2h7v7h-7V3zm2 2v3h3V5h-3zM3 14h7v7H3v-7zm2 2v3h3v-3H5zm9-2h3v3h-3v-3zm4 0h3v3h-3v-3zm-2 3h2v2h-2v-2zm-2 2h3v2h-3v-2zm4 0h3v2h-3v-2z" />
              </svg>
            ) : (
              <svg className="w-4/5 h-3/5 text-slate-900 shrink-0" viewBox="0 0 48 20" fill="currentColor" preserveAspectRatio="none">
                <rect x="2" y="1" width="2" height="18" />
                <rect x="6" y="1" width="1" height="18" />
                <rect x="9" y="1" width="3" height="18" />
                <rect x="14" y="1" width="1" height="18" />
                <rect x="17" y="1" width="2" height="18" />
                <rect x="21" y="1" width="4" height="18" />
                <rect x="27" y="1" width="1" height="18" />
                <rect x="30" y="1" width="2" height="18" />
                <rect x="34" y="1" width="3" height="18" />
                <rect x="39" y="1" width="1" height="18" />
                <rect x="42" y="1" width="2" height="18" />
                <rect x="45" y="1" width="1" height="18" />
              </svg>
            )}
            <span className="text-[9px] font-mono text-slate-600 text-center truncate w-full px-1 mt-0.5 leading-tight">
              {rawBinding}
            </span>
          </div>
        )
      }
      default:
        return <div className="w-10 h-10 bg-gray-300" />
    }
  }
  
  return (
    <div
      className={`absolute cursor-move ${isSelected ? 'ring-2 ring-purple-500' : ''}`}
      style={{
        left: child.width === '100%' ? 0 : (child.x || 0),
        top: child.height === '100%' ? 0 : (child.y || 0),
        ...(child.width === '100%'
          ? { width: '100%' }
          : typeof child.width === 'number'
            ? { width: child.width }
            : {}),
        ...(child.height === '100%'
          ? { height: '100%' }
          : typeof child.height === 'number'
            ? { height: child.height }
            : {}),
      }}
      onMouseDown={handleMouseDown}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
        selectLoopChild(loopId, child.id, location)
        useUIStore.getState().openContextMenu({
          x: e.clientX,
          y: e.clientY,
          targetType: 'element',
          elementId: child.id,
          location,
        })
      }}
    >
      {renderContent()}
      {/* Label do elemento e handles de redimensionamento */}
      {isSelected && (
        <>
          <div className="absolute -top-4 left-0 text-[9px] bg-purple-500 text-white px-1 rounded z-30">
            {child.type}
          </div>
          {/* Resize handle canto inferior direito */}
          <div
            className="absolute -right-1 -bottom-1 w-2.5 h-2.5 bg-white border-2 border-purple-500 rounded-full cursor-se-resize z-40"
            onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
          />
          {/* Resize handle lateral direita */}
          <div
            className="absolute -right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border-2 border-purple-500 rounded-full cursor-e-resize z-40"
            onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
          />
          {/* Resize handle borda inferior */}
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-2 border-purple-500 rounded-full cursor-s-resize z-40"
            onMouseDown={(e) => handleResizeMouseDown(e, 's')}
          />
        </>
      )}
    </div>
  )
}

export default function Canvas() {
  const { t } = useTranslation()
  const { 
    template, 
    testData,
    selectedElementIds, 
    selectedElementLocation, 
    selectElement, 
    toggleElementSelection, 
    updateElement, 
    currentSection, 
    setCurrentSection, 
    clearSelection,
  } = useTemplateStore()
  const { zoom, setZoom, snapToGuides } = useUIStore()
  const pageRef = useRef<HTMLDivElement>(null)

  let pageSize = { width: 595, height: 842 }
  switch(template.pageSettings.size) {
      case "A4":
        pageSize = { width: 595, height: 842 }
        break
      case "LETTER":
      case "PORTRAIT":
        pageSize = { width: 612, height: 792 }
        break
      case "LEGAL":
        pageSize = { width: 612, height: 1008 }
        break
      case "CUSTOM":
        pageSize = { width: template.pageSettings.customSize?.width || 595, height: template.pageSettings.customSize?.height || 842 }
        break
      default:
        pageSize = { width: 595, height: 842 }
        break
  }


  const scale = zoom / 100 // Converte porcentagem para escala
  const margins = template.pageSettings.margins

  // Estados para réguas e linhas guias interativas (inicia vazio)
  const [horizontalGuides, setHorizontalGuides] = useState<number[]>([])
  const [verticalGuides, setVerticalGuides] = useState<number[]>([])
  const [snappedGuides, setSnappedGuides] = useState<{ h: number | null; v: number | null }>({ h: null, v: null })
  const [draggingGuide, setDraggingGuide] = useState<{ type: 'h' | 'v'; index: number; isNew?: boolean } | null>(null)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  const addHorizontalGuide = (yPos: number) => {
    setHorizontalGuides((prev) => [...prev, Math.round(yPos)])
  }

  const addVerticalGuide = (xPos: number) => {
    setVerticalGuides((prev) => [...prev, Math.round(xPos)])
  }

  const removeGuide = (type: 'h' | 'v', index: number) => {
    if (type === 'h') {
      setHorizontalGuides((prev) => prev.filter((_, i) => i !== index))
    } else {
      setVerticalGuides((prev) => prev.filter((_, i) => i !== index))
    }
  }

  // Puxar linha guia horizontal a partir da régua superior
  const handleRulerMouseDownH = (e: ReactMouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const pageRect = pageRef.current?.getBoundingClientRect()
    const initialY = pageRect
      ? Math.max(0, Math.min(pageSize.height, Math.round((e.clientY - pageRect.top) / scale)))
      : 0
    const newIndex = horizontalGuides.length
    setHorizontalGuides((prev) => [...prev, initialY])
    setDraggingGuide({ type: 'h', index: newIndex, isNew: true })
  }

  // Puxar linha guia vertical a partir da régua esquerda
  const handleRulerMouseDownV = (e: ReactMouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const pageRect = pageRef.current?.getBoundingClientRect()
    const initialX = pageRect
      ? Math.max(0, Math.min(pageSize.width, Math.round((e.clientX - pageRect.left) / scale)))
      : 0
    const newIndex = verticalGuides.length
    setVerticalGuides((prev) => [...prev, initialX])
    setDraggingGuide({ type: 'v', index: newIndex, isNew: true })
  }

  // Monitora arrasto de guias no escopo global da janela
  useEffect(() => {
    if (!draggingGuide) return

    const handleMouseMove = (e: MouseEvent) => {
      const pageRect = pageRef.current?.getBoundingClientRect()
      if (!pageRect) return

      if (draggingGuide.type === 'h') {
        const rawY = (e.clientY - pageRect.top) / scale
        let clampedY = Math.max(0, Math.min(pageSize.height, Math.round(rawY)))
        if (snapToGuides) {
          if (Math.abs(clampedY - margins.top) <= 6) clampedY = Math.round(margins.top)
          else if (Math.abs(clampedY - (pageSize.height - margins.bottom)) <= 6) clampedY = Math.round(pageSize.height - margins.bottom)
          else if (Math.abs(clampedY - pageSize.height / 2) <= 6) clampedY = Math.round(pageSize.height / 2)
        }
        setHorizontalGuides((prev) =>
          prev.map((g, i) => (i === draggingGuide.index ? clampedY : g))
        )
      } else {
        const rawX = (e.clientX - pageRect.left) / scale
        let clampedX = Math.max(0, Math.min(pageSize.width, Math.round(rawX)))
        if (snapToGuides) {
          if (Math.abs(clampedX - margins.left) <= 6) clampedX = Math.round(margins.left)
          else if (Math.abs(clampedX - (pageSize.width - margins.right)) <= 6) clampedX = Math.round(pageSize.width - margins.right)
          else if (Math.abs(clampedX - pageSize.width / 2) <= 6) clampedX = Math.round(pageSize.width / 2)
        }
        setVerticalGuides((prev) =>
          prev.map((g, i) => (i === draggingGuide.index ? clampedX : g))
        )
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      const pageRect = pageRef.current?.getBoundingClientRect()
      if (pageRect) {
        if (draggingGuide.type === 'h') {
          const rawY = (e.clientY - pageRect.top) / scale
          if (draggingGuide.isNew && rawY < 0) {
            setHorizontalGuides((prev) =>
              prev.map((g, i) => (i === draggingGuide.index ? Math.round(margins.top) : g))
            )
          } else if (rawY < 0 || rawY > pageSize.height) {
            setHorizontalGuides((prev) => prev.filter((_, i) => i !== draggingGuide.index))
          }
        } else {
          const rawX = (e.clientX - pageRect.left) / scale
          if (draggingGuide.isNew && rawX < 0) {
            setVerticalGuides((prev) =>
              prev.map((g, i) => (i === draggingGuide.index ? Math.round(margins.left) : g))
            )
          } else if (rawX < 0 || rawX > pageSize.width) {
            setVerticalGuides((prev) => prev.filter((_, i) => i !== draggingGuide.index))
          }
        }
      }
      setDraggingGuide(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [draggingGuide, scale, pageSize.width, pageSize.height, margins.top, margins.left])

  const headerHeight = template.pageSettings.header?.height || 0;
  const footerHeight = template.pageSettings.footer?.height || 0;
  const bodyUsableHeight = pageSize.height - (margins.top || 0) - (margins.bottom || 0) - headerHeight - footerHeight;

  let maxBodyBottom = 0;
  template.page.forEach(el => {
    const h = typeof el.height === 'number' ? el.height : (el.type === 'page_break' ? 20 : (el.type === 'spacer' ? 50 : 150));
    const bottom = (el.y || 0) + h;
    if (bottom > maxBodyBottom) maxBodyBottom = bottom;
  });

  const numberOfPages = Math.max(1, Math.ceil(maxBodyBottom / bodyUsableHeight));
  const totalCanvasHeight = margins.top + headerHeight + (numberOfPages * bodyUsableHeight) + footerHeight + margins.bottom;

  // Detect if any BODY element is touching the margins
  const checkMarginSnap = () => {
    const snapTolerance = 5 
    const snapped = {
      top: false,
      bottom: false,
      left: false,
      right: false
    }

    // Only check body elements (not header/footer)
    const containerWidth = pageSize.width - margins.left - margins.right
    template.page.forEach((element) => {
      const x = element.x
      const y = element.y
      const width = element.width
      const height = element.height

      // Ignore elements without defined position/size
      if (x === undefined || y === undefined) return

      // Check left margin (x=0 inside body container)
      if (Math.abs(x) <= snapTolerance) {
        snapped.left = true
      }

      // Check right margin (only if width is set and is a number)
      if (typeof width === 'number' && Math.abs((x + width) - containerWidth) <= snapTolerance) {
        snapped.right = true
      }

      // Check top margin (y=0 inside body container)
      if (Math.abs(y) <= snapTolerance) {
        snapped.top = true
      }

      // Check bottom margin (only if height is set and is a number)
      if (typeof height === 'number' && Math.abs((y + height) - bodyUsableHeight) <= snapTolerance) {
        snapped.bottom = true
      }
    })

    return snapped
  }

  const marginSnap = checkMarginSnap()

  const handleZoomIn = () => {
    setZoom(Math.min(200, zoom + 25))
  }

  const handleZoomOut = () => {
    setZoom(Math.max(25, zoom - 25))
  }

  const handleZoomReset = () => {
    setZoom(100)
  }

  const handleZoomFit = () => {
    setZoom(75)
  }

  // Keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focus is on input, textarea or editable element
      const activeEl = document.activeElement as HTMLElement
      const target = e.target as HTMLElement
      if (
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.isContentEditable ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return // Allow default behavior in text fields
      }

      // Ctrl/Cmd + Plus: Zoom In
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault()
        handleZoomIn()
      }
      // Ctrl/Cmd + Minus: Zoom Out
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault()
        handleZoomOut()
      }
      // Ctrl/Cmd + 0: Reset to 100%
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault()
        handleZoomReset()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden select-none bg-slate-950 ${draggingGuide ? (draggingGuide.type === 'h' ? 'cursor-ns-resize' : 'cursor-ew-resize') : ''}`}>
      {/* RÉGUA SUPERIOR (HORIZONTAL RULER) */}
      <div 
        className="h-6 bg-slate-950 border-b border-slate-800 flex items-center relative overflow-hidden select-none cursor-row-resize text-slate-400 pl-6 z-20 shrink-0 hover:bg-slate-900 transition-colors"
        onMouseDown={handleRulerMouseDownH}
        title={t.canvas.dragHorizontalGuide}
      >
        <div className="absolute left-1 text-[9px] font-mono text-slate-400 pointer-events-none">pt</div>
        <div className="flex-1 flex items-end h-full pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="flex-1 border-r border-slate-800 h-2 relative">
              {i % 2 === 0 && (
                <span className="absolute -top-3 left-0.5 text-[8px] font-mono text-slate-400">
                  {i * 25}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ÁREA CENTRAL: RÉGUA VERTICAL + CANVAS SCROLLÁVEL */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* RÉGUA VERTICAL (LEFT VERTICAL RULER) */}
        <div 
          className="w-6 bg-slate-950 border-r border-slate-800 flex flex-col relative select-none cursor-col-resize text-slate-400 z-20 shrink-0 overflow-hidden hover:bg-slate-900 transition-colors"
          onMouseDown={handleRulerMouseDownV}
          title={t.canvas.dragVerticalGuide}
        >
          <div className="flex-1 flex flex-col pointer-events-none">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="flex-1 border-b border-slate-800 w-2 relative">
                {i % 2 === 0 && (
                  <span className="absolute top-0.5 left-2 text-[7px] font-mono text-slate-500 transform -rotate-90 origin-top-left">
                    {i * 25}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable content area */}
        <div
          id="canvas-scroll-container"
          className="flex-1 overflow-auto p-8 bg-slate-950/80"
          onContextMenu={(e) => {
            e.preventDefault()
            useUIStore.getState().openContextMenu({
              x: e.clientX,
              y: e.clientY,
              targetType: 'canvas',
              location: currentSection,
            })
          }}
        >
          <div className="inline-block min-w-full min-h-full">
        {/* Wrapper que define o tamanho real para scroll funcionar com zoom */}
        <div 
          className="flex justify-center items-start min-w-max"
          style={{ 
            minWidth: pageSize.width * scale + 240, // +240 para labels laterais à direita
            minHeight: pageSize.height * scale + 50, // +50 para margem inferior
          }}
        >
        
        <div ref={pageRef} className="relative" style={{ width: pageSize.width, height: pageSize.height, transform: `scale(${scale})`, transformOrigin: 'top center' }}>
          {currentSection === 'bodyBackground' && template.pageSettings.bodyBackground ? (
            
            <>
              <div
                className="absolute right-full mr-3 px-3 py-1 rounded-l text-xs font-semibold whitespace-nowrap bg-purple-500 text-white"
                style={{
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              >
                BACKGROUND
              </div>

              <div
                className="bg-white shadow-lg relative border-2 border-purple-400"
                style={{
                  width: pageSize.width,
              height: totalCanvasHeight,
                }}
              >
                {/* Container para elementos do Background - posicionado nas margens */}
                <div
                  className="absolute"
                  style={{
                    left: margins.left,
                    top: margins.top,
                    right: margins.right,
                    bottom: margins.bottom,
                  }}
                >
                  {/* Elementos do Background */}
                  {(template.pageSettings.bodyBackground?.elements ?? [])
                    .filter((element) => !element.hidden)
                    .map((element) => (
                      <CanvasElement
                        key={element.id}
                        element={element}
                        scale={scale}
                        isSelected={selectedElementIds.includes(element.id) && selectedElementLocation === 'bodyBackground'}
                        onSelect={(ctrlKey) => ctrlKey ? toggleElementSelection(element.id, 'bodyBackground') : selectElement(element.id, 'bodyBackground')}
                        onUpdate={(updates) => updateElement(element.id, updates, 'bodyBackground')}
                        location="bodyBackground"
                        margins={margins}
                        pageSize={pageSize}
                        selectedElementIds={selectedElementIds}
                        selectedElementLocation={selectedElementLocation}
                        allElements={flattenElements(template.pageSettings.bodyBackground?.elements ?? [])}
                        onUpdateMultiple={() => {}}
                        updateElement={updateElement}
                        horizontalGuides={horizontalGuides}
                        verticalGuides={verticalGuides}
                        containerOffsetX={margins.left}
                        containerOffsetY={margins.top}
                        onSnapGuide={setSnappedGuides}
                      />
                    ))}
                </div>

                
          {/* Page Separators */}
          {numberOfPages > 1 && Array.from({ length: numberOfPages - 1 }).map((_, i) => (
            <div key={i} className="absolute w-full pointer-events-none" style={{
              top: margins.top + headerHeight + ((i + 1) * bodyUsableHeight),
              left: 0,
              borderTop: '2px dashed #cbd5e1',
              zIndex: 5
            }}>
              <span className="absolute right-2 -top-3 bg-slate-100 text-slate-400 text-[10px] px-2 rounded-full border border-slate-200">
                {t.canvas.page} {i + 2}
              </span>
            </div>
          ))}

          {/* Margin guides - Linhas mostrando as margens */}
                <svg
                  className="absolute inset-0 pointer-events-none"
                  width="100%"
                  height="100%"
                  style={{ zIndex: 5 }}
                >
                  {/* Margem Superior */}
                  <line
                    x1={0}
                    y1={margins.top}
                    x2={pageSize.width}
                    y2={margins.top}
                    stroke="#a855f7"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                    opacity="0.5"
                  />
                  
                  {/* Margem Inferior */}
                  <line
                    x1={0}
                    y1={totalCanvasHeight - margins.bottom}
                    x2={pageSize.width}
                    y2={totalCanvasHeight - margins.bottom}
                    stroke="#a855f7"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                    opacity="0.5"
                  />
                  
                  {/* Margem Esquerda */}
                  <line
                    x1={margins.left}
                    y1={0}
                    x2={margins.left}
                    y2={totalCanvasHeight}
                    stroke="#a855f7"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                    opacity="0.5"
                  />
                  
                  {/* Margem Direita */}
                  <line
                    x1={pageSize.width - margins.right}
                    y1={0}
                    x2={pageSize.width - margins.right}
                    y2={totalCanvasHeight}
                    stroke="#a855f7"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                    opacity="0.5"
                  />

                  {/* Labels das margens */}
                  <text
                    x={margins.left + 5}
                    y={margins.top - 5}
                    fontSize="10"
                    fill="#a855f7"
                    opacity="0.7"
                  >
                    ← {margins.left}pt
                  </text>
                  <text
                    x={margins.left + 5}
                    y={15}
                    fontSize="10"
                    fill="#a855f7"
                    opacity="0.7"
                  >
                    ↑ {margins.top}pt
                  </text>
                  <text
                    x={pageSize.width - margins.right - 60}
                    y={margins.top - 5}
                    fontSize="10"
                    fill="#a855f7"
                    opacity="0.7"
                  >
                    {margins.right}pt →
                  </text>
                  <text
                    x={margins.left + 5}
                    y={totalCanvasHeight - margins.bottom + 15}
                    fontSize="10"
                    fill="#a855f7"
                    opacity="0.7"
                  >
                    ↓ {margins.bottom}pt
                  </text>
                </svg>
              </div>
            </>
          ) : currentSection === 'summary' && template.summaryPage ? (
            // SUMMARY PAGE (sem header/footer)
            <>
              <div
                className="absolute right-full mr-3 px-3 py-1 rounded-l text-xs font-semibold whitespace-nowrap bg-green-500 text-white"
                style={{
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              >
                SUMMARY
              </div>

              <div
                className="bg-white shadow-lg relative border-2 border-green-400"
                style={{
                  width: pageSize.width,
              height: totalCanvasHeight,
                }}
              >
                {/* Background da Summary (se existir) - renderiza na página inteira */}
                {template.summaryPage.background?.elements
                  ?.filter((element) => !element.hidden)
                  .map((element) => (
                    <CanvasElement
                      key={element.id}
                      element={element}
                      scale={scale}
                      isSelected={selectedElementIds.includes(element.id) && selectedElementLocation === 'summary'}
                      onSelect={(ctrlKey) => ctrlKey ? toggleElementSelection(element.id, 'summary') : selectElement(element.id, 'summary')}
                      onUpdate={(updates) => updateElement(element.id, updates, 'summary')}
                      location="summary"
                      margins={margins}
                      pageSize={pageSize}
                      selectedElementIds={selectedElementIds}
                      selectedElementLocation={selectedElementLocation}
                      allElements={flattenElements(template.summaryPage?.background?.elements ?? [])}
                      onUpdateMultiple={() => {}}
                      updateElement={updateElement}
                      horizontalGuides={horizontalGuides}
                      verticalGuides={verticalGuides}
                      containerOffsetX={margins.left}
                      containerOffsetY={margins.top}
                      onSnapGuide={setSnappedGuides}
                    />
                  ))}

                {/* Container com offset das margens para elementos da Summary */}
                <div
                  className="absolute"
                  style={{
                    left: margins.left,
                    top: margins.top,
                    right: margins.right,
                    bottom: margins.bottom,
                  }}
                >
                  {/* Elementos da Summary */}
                  {(() => {
                    let summaryFlowY = 0
                    let lastSFlowX: number | undefined = undefined
                    let lastSFlowWidth: number | string | undefined = undefined
                    return template.summaryPage.elements
                      .filter((element) => !element.hidden)
                      .map((element) => {
                        const isRelativeFlow = ((element.positionMode || element.position || '') as string).toUpperCase() === 'RELATIVE'
                        let effectiveY: number | undefined = undefined
                        let effectiveX: number | undefined = undefined
                        let effectiveWidth: number | string | undefined = undefined

                        if (isRelativeFlow) {
                          const isHeightFull = element.height === '100%'
                          const offsetY = isHeightFull ? 0 : (typeof element.relativeOffsetY === 'number' ? element.relativeOffsetY : 0)
                          if (summaryFlowY === 0) {
                            effectiveY = isHeightFull ? 0 : (typeof element.y === 'number' && element.y > 0 ? element.y : offsetY)
                          } else {
                            effectiveY = summaryFlowY + offsetY
                            if (lastSFlowX !== undefined) effectiveX = lastSFlowX
                            if (lastSFlowWidth !== undefined) effectiveWidth = lastSFlowWidth
                          }
                        }

                        const elHeight = getEstimatedElementHeight(element, typeof element.width === 'number' ? element.width : (pageSize.width - margins.left - margins.right), testData)
                        if (isRelativeFlow && effectiveY !== undefined) {
                          summaryFlowY = effectiveY + elHeight
                          lastSFlowX = effectiveX !== undefined ? effectiveX : element.x
                          lastSFlowWidth = effectiveWidth !== undefined ? effectiveWidth : element.width
                        } else {
                          summaryFlowY = Math.max(summaryFlowY, (element.y || 0) + elHeight)
                          lastSFlowX = element.x
                          lastSFlowWidth = element.width
                        }

                        return (
                          <CanvasElement
                            key={element.id}
                            element={element}
                            effectiveY={effectiveY}
                            effectiveX={effectiveX}
                            effectiveWidth={effectiveWidth}
                            scale={scale}
                            isSelected={selectedElementIds.includes(element.id) && selectedElementLocation === 'summary'}
                            onSelect={(ctrlKey) => ctrlKey ? toggleElementSelection(element.id, 'summary') : selectElement(element.id, 'summary')}
                            onUpdate={(updates) => updateElement(element.id, updates, 'summary')}
                            location="summary"
                            margins={margins}
                            pageSize={pageSize}
                            selectedElementIds={selectedElementIds}
                            selectedElementLocation={selectedElementLocation}
                            allElements={flattenElements(template.summaryPage?.elements ?? [])}
                            onUpdateMultiple={() => {}}
                            updateElement={updateElement}
                            horizontalGuides={horizontalGuides}
                            verticalGuides={verticalGuides}
                            containerOffsetX={margins.left}
                            containerOffsetY={margins.top}
                            onSnapGuide={setSnappedGuides}
                          />
                        )
                      })
                  })()}
                </div>

                
          {/* Page Separators */}
          {numberOfPages > 1 && Array.from({ length: numberOfPages - 1 }).map((_, i) => (
            <div key={i} className="absolute w-full pointer-events-none" style={{
              top: margins.top + headerHeight + ((i + 1) * bodyUsableHeight),
              left: 0,
              borderTop: '2px dashed #cbd5e1',
              zIndex: 5
            }}>
              <span className="absolute right-2 -top-3 bg-slate-100 text-slate-400 text-[10px] px-2 rounded-full border border-slate-200">
                {t.canvas.page} {i + 2}
              </span>
            </div>
          ))}

          {/* Margin guides - Linhas mostrando as margens */}
                <svg
                  className="absolute inset-0 pointer-events-none"
                  width="100%"
                  height="100%"
                  style={{ zIndex: 5 }}
                >
                  {/* Margem Superior */}
                  <line
                    x1={0}
                    y1={margins.top}
                    x2={pageSize.width}
                    y2={margins.top}
                    stroke="#10b981"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                    opacity="0.5"
                  />
                  
                  {/* Margem Inferior */}
                  <line
                    x1={0}
                    y1={totalCanvasHeight - margins.bottom}
                    x2={pageSize.width}
                    y2={totalCanvasHeight - margins.bottom}
                    stroke="#10b981"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                    opacity="0.5"
                  />
                  
                  {/* Margem Esquerda */}
                  <line
                    x1={margins.left}
                    y1={0}
                    x2={margins.left}
                    y2={totalCanvasHeight}
                    stroke="#10b981"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                    opacity="0.5"
                  />
                  
                  {/* Margem Direita */}
                  <line
                    x1={pageSize.width - margins.right}
                    y1={0}
                    x2={pageSize.width - margins.right}
                    y2={totalCanvasHeight}
                    stroke="#10b981"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                    opacity="0.5"
                  />

                  {/* Labels das margens */}
                  <text
                    x={margins.left + 5}
                    y={margins.top - 5}
                    fontSize="10"
                    fill="#10b981"
                    opacity="0.7"
                  >
                    ← {margins.left}pt
                  </text>
                  <text
                    x={margins.left + 5}
                    y={15}
                    fontSize="10"
                    fill="#10b981"
                    opacity="0.7"
                  >
                    ↑ {margins.top}pt
                  </text>
                  <text
                    x={pageSize.width - margins.right - 60}
                    y={margins.top - 5}
                    fontSize="10"
                    fill="#10b981"
                    opacity="0.7"
                  >
                    {margins.right}pt →
                  </text>
                  <text
                    x={margins.left + 5}
                    y={totalCanvasHeight - margins.bottom + 15}
                    fontSize="10"
                    fill="#10b981"
                    opacity="0.7"
                  >
                    ↓ {margins.bottom}pt
                  </text>
                </svg>
              </div>
            </>
          ) : (
            
            <>
          {/* Labels laterais */}
          {template.pageSettings.header && (
            <div
              className={`absolute right-full mr-3 px-3 py-1 rounded-l text-xs font-semibold whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity ${
                currentSection === 'header' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-400 text-white'
              }`}
              style={{
                top: margins.top + (template.pageSettings.header.height / 2),
                transform: 'translateY(-50%)',
              }}
              onClick={() => {
                setCurrentSection('header')
                clearSelection()
              }}
            >
              HEADER
            </div>
          )}
          
          <div
            className={`absolute right-full mr-3 px-3 py-1 rounded-l text-xs font-semibold whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity ${
              currentSection === 'body' 
                ? 'bg-gray-600 text-white' 
                : 'bg-gray-400 text-white'
            }`}
            style={{
              top: (() => {
                const headerHeight = template.pageSettings.header?.height || 0
                const footerHeight = template.pageSettings.footer?.height || 0
                const bodyTop = margins.top + headerHeight
                const bodyBottom = pageSize.height - margins.bottom - footerHeight
                const bodyCenter = bodyTop + bodyUsableHeight / 2
                return bodyCenter
              })(),
              transform: 'translateY(-50%)',
            }}
            onClick={() => {
              setCurrentSection('body')
              clearSelection()
            }}
          >
            BODY
          </div>
          
          {template.pageSettings.footer && (
            <div
              className={`absolute right-full mr-3 px-3 py-1 rounded-l text-xs font-semibold whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity ${
                currentSection === 'footer' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-400 text-white'
              }`}
              style={{
                top: totalCanvasHeight - margins.bottom - template.pageSettings.footer.height + (template.pageSettings.footer.height / 2),
                transform: 'translateY(-50%)',
              }}
              onClick={() => {
                setCurrentSection('footer')
                clearSelection()
              }}
            >
              FOOTER
            </div>
          )}

          
        <div
          className="bg-white shadow-lg relative"
          style={{
              width: pageSize.width,
              height: totalCanvasHeight,
          }}
        >

          {/* Header Section - RENDERIZADO DEPOIS (camada acima do background) */}
          {template.pageSettings.header && (
            <div
              className={`absolute border-b-2 border-dashed ${
                currentSection === 'header' ? 'border-blue-400 bg-blue-50/30' : 'border-gray-300 bg-gray-50/50'
              }`}
              style={{
                top: margins.top,
                left: margins.left,
                right: margins.right,
                height: template.pageSettings.header.height,
                zIndex: 10,
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('cursor-not-allowed')) {
                  setCurrentSection('header')
                  clearSelection()
                }
              }}
            >
              {(() => {
                let headerFlowY = 0
                let lastHFlowX: number | undefined = undefined
                let lastHFlowWidth: number | string | undefined = undefined
                return template.pageSettings.header.elements
                  .filter((element) => !element.hidden)
                  .map((element) => {
                    const isRelativeFlow = ((element.positionMode || element.position || '') as string).toUpperCase() === 'RELATIVE'
                    let effectiveY: number | undefined = undefined
                    let effectiveX: number | undefined = undefined
                    let effectiveWidth: number | string | undefined = undefined

                    if (isRelativeFlow) {
                      const isHeightFull = element.height === '100%'
                      const offsetY = isHeightFull ? 0 : (typeof element.relativeOffsetY === 'number' ? element.relativeOffsetY : 0)
                      if (headerFlowY === 0) {
                        effectiveY = isHeightFull ? 0 : (typeof element.y === 'number' && element.y > 0 ? element.y : offsetY)
                      } else {
                        effectiveY = headerFlowY + offsetY
                        if (lastHFlowX !== undefined) effectiveX = lastHFlowX
                        if (lastHFlowWidth !== undefined) effectiveWidth = lastHFlowWidth
                      }
                    }

                    const elHeight = getEstimatedElementHeight(element, typeof element.width === 'number' ? element.width : (pageSize.width - margins.left - margins.right), testData)
                    if (isRelativeFlow && effectiveY !== undefined) {
                      headerFlowY = effectiveY + elHeight
                      lastHFlowX = effectiveX !== undefined ? effectiveX : element.x
                      lastHFlowWidth = effectiveWidth !== undefined ? effectiveWidth : element.width
                    } else {
                      headerFlowY = Math.max(headerFlowY, (element.y || 0) + elHeight)
                      lastHFlowX = element.x
                      lastHFlowWidth = element.width
                    }

                    return (
                      <CanvasElement
                        key={element.id}
                        element={element}
                        effectiveY={effectiveY}
                        effectiveX={effectiveX}
                        effectiveWidth={effectiveWidth}
                        scale={scale}
                        isSelected={selectedElementIds.includes(element.id) && selectedElementLocation === 'header'}
                        onSelect={(ctrlKey) => ctrlKey ? toggleElementSelection(element.id, 'header') : selectElement(element.id, 'header')}
                        onUpdate={(updates) => updateElement(element.id, updates, 'header')}
                        location="header"
                        margins={margins}
                        pageSize={pageSize}
                        selectedElementIds={selectedElementIds}
                        selectedElementLocation={selectedElementLocation}
                        allElements={flattenElements(template.pageSettings.header?.elements ?? [])}
                        onUpdateMultiple={() => {}}
                        updateElement={updateElement}
                        horizontalGuides={horizontalGuides}
                        verticalGuides={verticalGuides}
                        containerOffsetX={margins.left}
                        containerOffsetY={margins.top}
                        onSnapGuide={setSnappedGuides}
                      />
                    )
                  })
              })()}
              
              
              {currentSection !== 'header' && (
                <div className="absolute inset-0 bg-gray-400/30 cursor-not-allowed" style={{ zIndex: 100 }} />
              )}
            </div>
          )}

          {/* Footer Section - RENDERIZADO DEPOIS (camada acima do background) */}
          {template.pageSettings.footer && (
            <div
              className={`absolute border-t-2 border-dashed ${
                currentSection === 'footer' ? 'border-green-400 bg-green-50/30' : 'border-gray-300 bg-gray-50/50'
              }`}
              style={{
                top: totalCanvasHeight - margins.bottom - template.pageSettings.footer.height,
                left: margins.left,
                right: margins.right,
                height: template.pageSettings.footer.height,
                zIndex: 10,
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('cursor-not-allowed')) {
                  setCurrentSection('footer')
                  clearSelection()
                }
              }}
            >
              {(() => {
                let footerFlowY = 0
                let lastFFlowX: number | undefined = undefined
                let lastFFlowWidth: number | string | undefined = undefined
                return template.pageSettings.footer.elements
                  .filter((element) => !element.hidden)
                  .map((element) => {
                    const isRelativeFlow = ((element.positionMode || element.position || '') as string).toUpperCase() === 'RELATIVE'
                    let effectiveY: number | undefined = undefined
                    let effectiveX: number | undefined = undefined
                    let effectiveWidth: number | string | undefined = undefined

                    if (isRelativeFlow) {
                      const isHeightFull = element.height === '100%'
                      const offsetY = isHeightFull ? 0 : (typeof element.relativeOffsetY === 'number' ? element.relativeOffsetY : 0)
                      if (footerFlowY === 0) {
                        effectiveY = isHeightFull ? 0 : (typeof element.y === 'number' && element.y > 0 ? element.y : offsetY)
                      } else {
                        effectiveY = footerFlowY + offsetY
                        if (lastFFlowX !== undefined) effectiveX = lastFFlowX
                        if (lastFFlowWidth !== undefined) effectiveWidth = lastFFlowWidth
                      }
                    }

                    const elHeight = getEstimatedElementHeight(element, typeof element.width === 'number' ? element.width : (pageSize.width - margins.left - margins.right), testData)
                    if (isRelativeFlow && effectiveY !== undefined) {
                      footerFlowY = effectiveY + elHeight
                      lastFFlowX = effectiveX !== undefined ? effectiveX : element.x
                      lastFFlowWidth = effectiveWidth !== undefined ? effectiveWidth : element.width
                    } else {
                      footerFlowY = Math.max(footerFlowY, (element.y || 0) + elHeight)
                      lastFFlowX = element.x
                      lastFFlowWidth = element.width
                    }

                    return (
                      <CanvasElement
                        key={element.id}
                        element={element}
                        effectiveY={effectiveY}
                        effectiveX={effectiveX}
                        effectiveWidth={effectiveWidth}
                        scale={scale}
                        isSelected={selectedElementIds.includes(element.id) && selectedElementLocation === 'footer'}
                        onSelect={(ctrlKey) => ctrlKey ? toggleElementSelection(element.id, 'footer') : selectElement(element.id, 'footer')}
                        onUpdate={(updates) => updateElement(element.id, updates, 'footer')}
                        location="footer"
                        margins={margins}
                        pageSize={pageSize}
                        selectedElementIds={selectedElementIds}
                        selectedElementLocation={selectedElementLocation}
                        allElements={flattenElements(template.pageSettings.footer?.elements ?? [])}
                        onUpdateMultiple={() => {}}
                        updateElement={updateElement}
                        horizontalGuides={horizontalGuides}
                        verticalGuides={verticalGuides}
                        containerOffsetX={margins.left}
                        containerOffsetY={totalCanvasHeight - margins.bottom - (template.pageSettings.footer?.height || 0)}
                        onSnapGuide={setSnappedGuides}
                      />
                    )
                  })
              })()}
              
              
              {currentSection !== 'footer' && (
                <div className="absolute inset-0 bg-gray-400/30 cursor-not-allowed" style={{ zIndex: 100 }} />
              )}
            </div>
          )}

          {/* Body Section - container com coordenadas relativas */}
          <div
            className={`absolute ${
              currentSection === 'body' ? 'outline outline-2 outline-dashed outline-gray-400 -outline-offset-2' : ''
            }`}
            style={{
              top: margins.top + (template.pageSettings.header?.height || 0),
              left: margins.left,
              right: margins.right,
              height: numberOfPages * bodyUsableHeight,
              zIndex: 10,
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setCurrentSection('body')
                clearSelection()
              }
            }}
          >
            {(() => {
              const bodyAvailableWidth = pageSize.width - margins.left - margins.right
              let currentFlowY = 0
              let lastFlowX: number | undefined = undefined
              let lastFlowWidth: number | string | undefined = undefined
              return template.page
                .filter((element) => !element.hidden)
                .map((element) => {
                  const isRelativeFlow =
                    ((element.positionMode || element.position || '') as string).toUpperCase() === 'RELATIVE' &&
                    element.type !== 'container'

                  let effectiveY: number | undefined = undefined
                  let effectiveX: number | undefined = undefined
                  let effectiveWidth: number | string | undefined = undefined

                  if (isRelativeFlow) {
                    const isHeightFull = element.height === '100%'
                    const offsetY = isHeightFull ? 0 : (typeof element.relativeOffsetY === 'number' ? element.relativeOffsetY : 0)
                    if (currentFlowY === 0) {
                      effectiveY = isHeightFull ? 0 : (typeof element.y === 'number' && element.y > 0 ? element.y : offsetY)
                    } else {
                      effectiveY = currentFlowY + offsetY
                      if (lastFlowX !== undefined) {
                        effectiveX = lastFlowX
                      }
                      if (lastFlowWidth !== undefined) {
                        effectiveWidth = lastFlowWidth
                      }
                    }
                  }

                  const isContainerFixed = element.heightMode === 'fixed' || element.autoHeight === false
                  const containerBaseHeight = typeof element.height === 'number' ? element.height : 150
                  const currentContainerY = typeof effectiveY === 'number' ? effectiveY : (typeof element.y === 'number' ? element.y : 0)
                  const maxAllowed = Math.max(30, bodyUsableHeight - currentContainerY)
                  const containerAutoHeight = Math.min(
                    isContainerFixed
                      ? containerBaseHeight
                      : Math.max(
                          containerBaseHeight,
                          (element.elements || []).reduce((max: number, ch: Element) => {
                            const cy = typeof ch.y === 'number' ? ch.y : 0
                            const chH = typeof ch.height === 'number' ? ch.height : 25
                            return Math.max(max, cy + chH + 15)
                          }, 0)
                        ),
                    maxAllowed
                  )

                  const elHeight =
                    element.type === 'container'
                      ? containerAutoHeight
                      : getEstimatedElementHeight(element, typeof element.width === 'number' ? element.width : bodyAvailableWidth, testData)

                  if (isRelativeFlow && effectiveY !== undefined) {
                    currentFlowY = effectiveY + elHeight
                    lastFlowX = effectiveX !== undefined ? effectiveX : element.x
                    lastFlowWidth = effectiveWidth !== undefined ? effectiveWidth : element.width
                  } else {
                    currentFlowY = Math.max(currentFlowY, (element.y || 0) + elHeight)
                    lastFlowX = element.x
                    lastFlowWidth = element.width
                  }

                  return (
                    <CanvasElement
                      key={element.id}
                      element={element}
                      effectiveY={effectiveY}
                      effectiveX={effectiveX}
                      effectiveWidth={effectiveWidth}
                      scale={scale}
                      isSelected={selectedElementIds.includes(element.id) && selectedElementLocation === 'body'}
                      onSelect={(ctrlKey) => ctrlKey ? toggleElementSelection(element.id, 'body') : selectElement(element.id, 'body')}
                      onUpdate={(updates) => updateElement(element.id, updates, 'body')}
                      location="body"
                      margins={margins}
                      pageSize={pageSize}
                      selectedElementIds={selectedElementIds}
                      selectedElementLocation={selectedElementLocation}
                      allElements={flattenElements(template.page)}
                      onUpdateMultiple={() => {}}
                      updateElement={updateElement}
                      horizontalGuides={horizontalGuides}
                      verticalGuides={verticalGuides}
                      containerOffsetX={margins.left}
                      containerOffsetY={margins.top + (template.pageSettings.header?.height || 0)}
                      onSnapGuide={setSnappedGuides}
                    />
                  )
                })
            })()}
            
            
            {currentSection !== 'body' && (
              <div className="absolute inset-0 bg-gray-400/30 cursor-not-allowed" style={{ zIndex: 100 }} />
            )}
          </div>

          {/* Camada de Marca d'Água (Watermark) */}
          {template.pageSettings.watermark && (() => {
            const wm = template.pageSettings.watermark
            const rotation = wm.rotation ?? 45
            const opacity = wm.opacity ?? 0.2

            const imageTileWidth = wm.width || (wm.repeat ? Math.round(pageSize.width * 0.25) : Math.round(pageSize.width * 0.6))

            const renderWatermarkContent = () => (
              wm.type === 'image' && wm.imageSource ? (
                <img
                  src={wm.imageSource}
                  alt="Watermark"
                  style={{
                    width: `${imageTileWidth}px`,
                    height: wm.height ? `${wm.height}px` : 'auto',
                    maxWidth: pageSize.width * 0.8,
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <span
                  style={{
                    fontSize: `${wm.fontSize || 60}px`,
                    fontWeight: wm.fontStyle?.includes('bold') ? 'bold' : 'normal',
                    fontStyle: wm.fontStyle?.includes('italic') ? 'italic' : 'normal',
                    fontFamily: wm.fontName || 'Outfit, sans-serif',
                    color: wm.color || '#94a3b8',
                    letterSpacing: '0.1em',
                  }}
                >
                  {wm.text || (wm.dataBinding ? `{{${wm.dataBinding}}}` : 'WATERMARK')}
                </span>
              )
            )

            if (wm.repeat) {
              const rawText = wm.text || (wm.dataBinding ? `{{${wm.dataBinding}}}` : 'WATERMARK')
              const estimatedTextWidth = (wm.fontSize || 60) * (rawText.length * 0.6)
              const defaultStepX = wm.type === 'image'
                ? Math.round(imageTileWidth * 1.8)
                : Math.min(320, Math.max(160, estimatedTextWidth * 1.5))
              const defaultStepY = wm.type === 'image'
                ? Math.round((wm.height || imageTileWidth) * 1.8)
                : Math.min(260, Math.max(120, (wm.fontSize || 60) * 3.5))

              const stepX = wm.spacingX || defaultStepX
              const stepY = wm.spacingY || defaultStepY

              const gridItems: { x: number; y: number }[] = []
              let rowIndex = 0
              for (let y = -stepY / 2; y <= totalCanvasHeight + stepY; y += stepY) {
                const offsetX = (rowIndex % 2 !== 0) ? stepX / 2 : 0
                for (let x = -stepX / 2 + offsetX; x <= pageSize.width + stepX; x += stepX) {
                  gridItems.push({ x, y })
                }
                rowIndex++
              }

              return (
                <div
                  className="absolute inset-0 pointer-events-none select-none overflow-hidden"
                  style={{ zIndex: wm.onTop ? 45 : 3 }}
                >
                  {gridItems.map((pt, idx) => (
                    <div
                      key={`wm-grid-${idx}`}
                      className="absolute flex items-center justify-center pointer-events-none select-none"
                      style={{
                        left: pt.x,
                        top: pt.y,
                        transform: `translate(-50%, -50%) rotate(-${rotation}deg)`,
                        opacity,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {renderWatermarkContent()}
                    </div>
                  ))}
                </div>
              )
            }

            return (
              <div
                className="absolute inset-0 pointer-events-none select-none overflow-hidden"
                style={{ zIndex: wm.onTop ? 45 : 3 }}
              >
                {Array.from({ length: numberOfPages }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute flex items-center justify-center pointer-events-none select-none"
                    style={{
                      left: '50%',
                      top: (pageSize.height / 2) + (i * bodyUsableHeight),
                      transform: `translate(-50%, -50%) rotate(-${rotation}deg)`,
                      opacity,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {renderWatermarkContent()}
                  </div>
                ))}
              </div>
            )
          })()}

          
          {/* Page Separators */}
          {numberOfPages > 1 && Array.from({ length: numberOfPages - 1 }).map((_, i) => (
            <div key={i} className="absolute w-full pointer-events-none" style={{
              top: margins.top + headerHeight + ((i + 1) * bodyUsableHeight),
              left: 0,
              borderTop: '2px dashed #cbd5e1',
              zIndex: 5
            }}>
              <span className="absolute right-2 -top-3 bg-slate-100 text-slate-400 text-[10px] px-2 rounded-full border border-slate-200">
                {t.canvas.page} {i + 2}
              </span>
            </div>
          ))}

          {/* Margin guides - Linhas mostrando as margens */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width="100%"
            height="100%"
            style={{ zIndex: 5 }}
          >
            {/* Margem Superior */}
            <line
              x1={0}
              y1={margins.top}
              x2={pageSize.width}
              y2={margins.top}
                stroke={marginSnap.top ? "#10b981" : "#3b82f6"}
                strokeWidth={marginSnap.top ? "2" : "1"}
                strokeDasharray="5,5"
                opacity={marginSnap.top ? "0.8" : "0.5"}
              />
            
            {/* Linha do fim do Header */}
            {template.pageSettings.header && (
              <line
                x1={0}
                y1={margins.top + template.pageSettings.header.height}
                x2={pageSize.width}
                y2={margins.top + template.pageSettings.header.height}
                stroke="#9ca3af"
                strokeWidth="1"
                strokeDasharray="2,2"
                opacity="0.3"
              />
            )}
            
            
            {template.pageSettings.footer && (
              <line
                x1={0}
                y1={totalCanvasHeight - margins.bottom - template.pageSettings.footer.height}
                x2={pageSize.width}
                y2={totalCanvasHeight - margins.bottom - template.pageSettings.footer.height}
                stroke="#9ca3af"
                strokeWidth="1"
                strokeDasharray="2,2"
                opacity="0.3"
              />
            )}
            
            {/* Margem Inferior */}
              <line
                x1={0}
                y1={totalCanvasHeight - margins.bottom}
                    x2={pageSize.width}
                    y2={totalCanvasHeight - margins.bottom}
                stroke={marginSnap.bottom ? "#10b981" : "#3b82f6"}
                strokeWidth={marginSnap.bottom ? "2" : "1"}
                strokeDasharray="5,5"
                opacity={marginSnap.bottom ? "0.8" : "0.5"}
            />
            
            {/* Margem Esquerda */}
            <line
              x1={margins.left}
              y1={0}
              x2={margins.left}
              y2={totalCanvasHeight}
              stroke={marginSnap.left ? "#10b981" : "#3b82f6"}
              strokeWidth={marginSnap.left ? "2" : "1"}
              strokeDasharray="5,5"
              opacity={marginSnap.left ? "0.8" : "0.5"}
            />
            
            {/* Margem Direita */}
            <line
              x1={pageSize.width - margins.right}
              y1={0}
              x2={pageSize.width - margins.right}
              y2={totalCanvasHeight}
              stroke={marginSnap.right ? "#10b981" : "#3b82f6"}
              strokeWidth={marginSnap.right ? "2" : "1"}
              strokeDasharray="5,5"
              opacity={marginSnap.right ? "0.8" : "0.5"}
            />

            
          </svg>

          {/* Grid helper */}
          <svg
            className="absolute inset-0 pointer-events-none opacity-20"
            width="100%"
            height="100%"
          >
            <defs>
              <pattern
                id="grid"
                width="50"
                height="50"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 50 0 L 0 0 0 50"
                  fill="none"
                  stroke="gray"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
          
            </>
          )}
          
          
          
          {currentSection !== 'summary' && (
            <>
              {/* Label Margin Top */}
              <div
                className="absolute text-xs text-gray-400 select-none pointer-events-none"
                style={{
                  left: pageSize.width + 10,
                  top: margins.top,
                  transform: 'translateY(-50%)',
                  whiteSpace: 'nowrap',
                }}
              >
                ↑ Margin: {margins.top}pt
              </div>
              
              {/* Label Header End */}
              {template.pageSettings.header && (
                <div
                  className="absolute text-xs text-gray-500 select-none pointer-events-none"
                  style={{
                    left: pageSize.width + 10,
                    top: margins.top + template.pageSettings.header.height,
                    transform: 'translateY(-50%)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t.canvas.headerEnd}: {margins.top + template.pageSettings.header.height}pt
                </div>
              )}
              
              {/* Label Footer Start */}
              {template.pageSettings.footer && (
                <div
                  className="absolute text-xs text-gray-500 select-none pointer-events-none"
                  style={{
                    left: pageSize.width + 10,
                    top: totalCanvasHeight - margins.bottom - template.pageSettings.footer.height,
                    transform: 'translateY(-50%)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t.canvas.footerStart}: {totalCanvasHeight - margins.bottom - template.pageSettings.footer.height}pt
                </div>
              )}
              
              {/* Label Margin Bottom */}
              <div
                className="absolute text-xs text-gray-400 select-none pointer-events-none"
                style={{
                  left: pageSize.width + 10,
                  top: totalCanvasHeight - margins.bottom,
                  transform: 'translateY(-50%)',
                  whiteSpace: 'nowrap',
                }}
              >
                ↓ Margin: {margins.bottom}pt
              </div>
              
              {/* Label Margin Left */}
              <div
                className="absolute text-xs text-blue-600 select-none pointer-events-none"
                style={{
                  left: margins.left,
                  top: -25,
                  transform: 'translateX(-50%)',
                  whiteSpace: 'nowrap',
                }}
              >
                ← {margins.left}pt
              </div>
              
              {/* Label Margin Right */}
              <div
                className="absolute text-xs text-blue-600 select-none pointer-events-none"
                style={{
                  left: pageSize.width - margins.right,
                  top: -25,
                  transform: 'translateX(-50%)',
                  whiteSpace: 'nowrap',
                }}
              >
                {margins.right}pt →
              </div>
            </>
          )}
          
          {/* Labels para Summary Page */}
          {currentSection === 'summary' && template.summaryPage && (
            <>
              {/* Label Margin Top */}
              <div
                className="absolute text-xs text-green-500 select-none pointer-events-none"
                style={{
                  left: pageSize.width + 10,
                  top: margins.top,
                  transform: 'translateY(-50%)',
                  whiteSpace: 'nowrap',
                }}
              >
                ↑ Margin: {margins.top}pt
              </div>
              
              {/* Label Margin Bottom */}
              <div
                className="absolute text-xs text-green-500 select-none pointer-events-none"
                style={{
                  left: pageSize.width + 10,
                  top: totalCanvasHeight - margins.bottom,
                  transform: 'translateY(-50%)',
                  whiteSpace: 'nowrap',
                }}
              >
                ↓ Margin: {margins.bottom}pt
              </div>
              
              {/* Label Margin Left */}
              <div
                className="absolute text-xs text-green-500 select-none pointer-events-none"
                style={{
                  left: margins.left,
                  top: -25,
                  transform: 'translateX(-50%)',
                  whiteSpace: 'nowrap',
                }}
              >
                ← {margins.left}pt
              </div>
              
              {/* Label Margin Right */}
              <div
                className="absolute text-xs text-green-500 select-none pointer-events-none"
                style={{
                  left: pageSize.width - margins.right,
                  top: -25,
                  transform: 'translateX(-50%)',
                  whiteSpace: 'nowrap',
                }}
              >
                {margins.right}pt →
              </div>
            </>
          )}

          {/* LINHAS GUIAS INTERATIVAS (CYAN #06b6d4) COM TOOLTIPS */}
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 50, width: pageSize.width, height: pageSize.height }}>
            {/* Guias Horizontais */}
            {horizontalGuides.map((yPos, idx) => {
              const isSnapped = snappedGuides.h !== null && Math.abs(snappedGuides.h - yPos) < 1
              return (
                <div
                  key={`h-guide-${idx}`}
                  className="absolute left-0 right-0 pointer-events-auto cursor-ns-resize group"
                  style={{ top: yPos }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    setDraggingGuide({ type: 'h', index: idx })
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    removeGuide('h', idx)
                  }}
                  title={t.canvas.guideTooltip}
                >
                  <div className={`h-0.5 relative transition-colors ${isSnapped ? 'bg-emerald-400 shadow-md shadow-emerald-500/80 ring-1 ring-emerald-400' : 'bg-cyan-400 shadow-sm shadow-cyan-500/50'}`}>
                    <div className={`absolute left-2 -top-5 px-1.5 py-0.5 rounded bg-slate-900 border text-[10px] font-mono transition-all ${isSnapped ? 'border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30 opacity-100' : 'border-cyan-500/40 text-cyan-300'} ${isSnapped || (draggingGuide?.type === 'h' && draggingGuide?.index === idx) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      Y: {Math.round(yPos)}pt{isSnapped ? ' 🧲' : ''}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Guias Verticais */}
            {verticalGuides.map((xPos, idx) => {
              const isSnapped = snappedGuides.v !== null && Math.abs(snappedGuides.v - xPos) < 1
              return (
                <div
                  key={`v-guide-${idx}`}
                  className="absolute top-0 bottom-0 pointer-events-auto cursor-ew-resize group"
                  style={{ left: xPos }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    setDraggingGuide({ type: 'v', index: idx })
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    removeGuide('v', idx)
                  }}
                  title={t.canvas.guideTooltip}
                >
                  <div className={`w-0.5 h-full relative transition-colors ${isSnapped ? 'bg-emerald-400 shadow-md shadow-emerald-500/80 ring-1 ring-emerald-400' : 'bg-cyan-400 shadow-sm shadow-cyan-500/50'}`}>
                    <div className={`absolute -left-6 top-2 px-1.5 py-0.5 rounded bg-slate-900 border text-[10px] font-mono transition-all whitespace-nowrap ${isSnapped ? 'border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30 opacity-100' : 'border-cyan-500/40 text-cyan-300'} ${isSnapped || (draggingGuide?.type === 'v' && draggingGuide?.index === idx) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      X: {Math.round(xPos)}pt{isSnapped ? ' 🧲' : ''}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        {/* Fim do container com scale */}
        </div>
        {/* Fim do wrapper para scroll */}
      </div>
      </div>
      </div>
    </div>
  )
}

interface CanvasElementProps {
  element: Element
  effectiveY?: number
  effectiveX?: number
  effectiveWidth?: number | string
  scale?: number
  isSelected: boolean
  onSelect: (ctrlKey: boolean) => void
  onUpdate: (updates: Partial<Element>) => void
  margins: { top: number; right: number; bottom: number; left: number }
  pageSize: { width: number; height: number }
  selectedElementIds: string[]
  selectedElementLocation: ElementLocation | null
  allElements: Element[]
  onUpdateMultiple: () => void
  updateElement: (id: string, updates: Partial<Element>, location?: ElementLocation) => void
  location: ElementLocation
  horizontalGuides?: number[]
  verticalGuides?: number[]
  containerOffsetX?: number
  containerOffsetY?: number
  onSnapGuide?: (snapped: { h: number | null; v: number | null }) => void
}

function CanvasElement({
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
  onUpdateMultiple,
  updateElement,
  location,
  horizontalGuides = [],
  verticalGuides = [],
  containerOffsetX,
  containerOffsetY,
  onSnapGuide,
}: CanvasElementProps) {
  const { t } = useTranslation()
  const template = useTemplateStore(state => state.template)
  const testData = useTemplateStore(state => state.testData)
  const saveSnapshot = useTemplateStore(state => state.saveSnapshot)
  const snapToGuides = useUIStore(state => state.snapToGuides)
  const selectedContainerChildId = useTemplateStore(state => state.selectedContainerChildId)
  const selectedLoopChildId = useTemplateStore(state => state.selectedLoopChildId)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, initialPositions: {} as Record<string, {x: number, y: number}>, initialOffsetY: 10 })
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const [resizeStart, setResizeStart] = useState({ 
    x: 0, y: 0, 
    elementX: 0, elementY: 0,
    elementWidth: 0, elementHeight: 0 
  })
  const [isEditingText, setIsEditingText] = useState(false)
  const [editingValue, setEditingValue] = useState('')
  
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
    
    return allGroups.find(g => g.id === element.groupId)
  }
  
  const elementGroup = findElementGroup()

  /**
   * Resolves the text to display, applying expressions if present.
   * Prioridade: value > dataBinding processado > fallback
   */
  const resolveDisplayText = (el: { value?: string; dataBinding?: string }, fallback: string = ''): string => {
    // Se tem valor fixo, usar ele
    if (el.value) {
      return el.value
    }
    
    // Se tem dataBinding, tentar processar
    if (el.dataBinding) {
      // Se temos dados de teste e o binding pode ser resolvido
      if (testData && Object.keys(testData).length > 0) {
        if (hasTransformations(el.dataBinding)) {
          // Process expressions (e.g. "invoice.name | upperCase")
          const result = processExpression(el.dataBinding, testData)
          if (result) return result
        } else {
          // Tentar resolver binding simples
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
          if (value !== null && value !== undefined) {
            return String(value)
          }
        }
      }
      // Fallback: mostrar o dataBinding entre chaves
      return `{${el.dataBinding}}`
    }
    
    return fallback
  }

  
  const applySnap = (
    x: number,
    y: number,
    width: number = 0,
    height: number = 0,
    options?: { snapX?: boolean; snapY?: boolean }
  ) => {
    if (!snapToGuides) {
      onSnapGuide?.({ h: null, v: null })
      return { x, y }
    }

    const snapTolerance = 8
    let snappedX = x
    let snappedY = y
    let activeSnapH: number | null = null
    let activeSnapV: number | null = null

    const checkX = options?.snapX !== false
    const checkY = options?.snapY !== false

    const headerHeight = template.pageSettings.header?.height || 0
    const footerHeight = template.pageSettings.footer?.height || 0
    const resolvedOffsetX = containerOffsetX !== undefined ? containerOffsetX : margins.left
    const resolvedOffsetY = containerOffsetY !== undefined
      ? containerOffsetY
      : (margins.top + (location === 'body' ? headerHeight : 0))

    const containerWidth = pageSize.width - margins.left - margins.right
    const bodyUsableHeight = pageSize.height - margins.top - margins.bottom - headerHeight - footerHeight

    if (checkX) {
      let minDistanceX = snapTolerance + 1

      // 1. Margins Snap
      // Left margin (x = 0 no container)
      if (Math.abs(x) < minDistanceX) {
        minDistanceX = Math.abs(x)
        snappedX = 0
      }
      // Right margin (x + width = containerWidth)
      if (width > 0 && Math.abs((x + width) - containerWidth) < minDistanceX) {
        minDistanceX = Math.abs((x + width) - containerWidth)
        snappedX = containerWidth - width
      }
      // Usable container center
      if (width > 0 && Math.abs((x + width / 2) - containerWidth / 2) < minDistanceX) {
        minDistanceX = Math.abs((x + width / 2) - containerWidth / 2)
        snappedX = containerWidth / 2 - width / 2
      }

      // 2. Vertical Guides Snap
      verticalGuides.forEach((guidePageX) => {
        const guideLocalX = guidePageX - resolvedOffsetX

        // Left edge
        const distLeft = Math.abs(x - guideLocalX)
        if (distLeft < minDistanceX) {
          minDistanceX = distLeft
          snappedX = guideLocalX
          activeSnapV = guidePageX
        }

        if (width > 0) {
          // Right edge
          const distRight = Math.abs((x + width) - guideLocalX)
          if (distRight < minDistanceX) {
            minDistanceX = distRight
            snappedX = guideLocalX - width
            activeSnapV = guidePageX
          }

          // Center
          const distCenter = Math.abs((x + width / 2) - guideLocalX)
          if (distCenter < minDistanceX) {
            minDistanceX = distCenter
            snappedX = guideLocalX - width / 2
            activeSnapV = guidePageX
          }
        }
      })
    }

    if (checkY) {
      let minDistanceY = snapTolerance + 1

      // 1. Margins Snap
      // Top margin (y = 0 no container)
      if (Math.abs(y) < minDistanceY) {
        minDistanceY = Math.abs(y)
        snappedY = 0
      }
      // Bottom margin
      if (location === 'body' && height > 0 && Math.abs((y + height) - bodyUsableHeight) < minDistanceY) {
        minDistanceY = Math.abs((y + height) - bodyUsableHeight)
        snappedY = bodyUsableHeight - height
      }

      // 2. Horizontal Guides Snap
      horizontalGuides.forEach((guidePageY) => {
        const guideLocalY = guidePageY - resolvedOffsetY

        // Top edge
        const distTop = Math.abs(y - guideLocalY)
        if (distTop < minDistanceY) {
          minDistanceY = distTop
          snappedY = guideLocalY
          activeSnapH = guidePageY
        }

        if (height > 0) {
          // Bottom edge
          const distBottom = Math.abs((y + height) - guideLocalY)
          if (distBottom < minDistanceY) {
            minDistanceY = distBottom
            snappedY = guideLocalY - height
            activeSnapH = guidePageY
          }

          // Center
          const distCenter = Math.abs((y + height / 2) - guideLocalY)
          if (distCenter < minDistanceY) {
            minDistanceY = distCenter
            snappedY = guideLocalY - height / 2
            activeSnapH = guidePageY
          }
        }
      })
    }

    onSnapGuide?.({ h: activeSnapH, v: activeSnapV })
    return { x: snappedX, y: snappedY }
  }

  const applySnapToMargins = (x: number, y: number, width: number = 0, height: number = 0) => {
    return applySnap(x, y, width, height)
  }

  const handleDoubleClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    if (element.type === 'text' || element.type === 'static_text') {
      const currentValue = element.value || ''
      setEditingValue(currentValue)
      setIsEditingText(true)
    }
  }

  const handleTextEditBlur = () => {
    if (isEditingText) {
      saveSnapshot()
      onUpdate({ value: editingValue })
      setIsEditingText(false)
    }
  }

  const handleTextEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      setIsEditingText(false)
      setEditingValue(element.value || '')
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleTextEditBlur()
    }
  }

  const handleMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return 
    
    e.stopPropagation()
    
    
    if (e.ctrlKey || e.metaKey || e.shiftKey) {
      onSelect(true)
      return
    }
    
    
    if (!isSelected || selectedContainerChildId || selectedLoopChildId) {
      onSelect(false)
    }
    
    
    const initialPositions: Record<string, {x: number, y: number}> = {}
    if (isMultiSelection) {
      allElements.forEach(el => {
        if (selectedElementIds.includes(el.id)) {
          initialPositions[el.id] = { x: el.x, y: el.y }
        }
      })
    } else {
      
      initialPositions[element.id] = { x: element.x, y: element.y }
    }
    
    setIsDragging(true)
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      initialPositions,
      initialOffsetY: element.height === '100%' ? 0 : (typeof element.relativeOffsetY === 'number' ? element.relativeOffsetY : 0)
    })
  }

  const elementWrapperRef = useRef<HTMLDivElement>(null)

  const getElementDimensions = () => {
    const el = elementWrapperRef.current
    const w = typeof element.width === 'number' ? element.width : (el && el.offsetWidth > 0 ? el.offsetWidth : 120)
    const h = typeof element.height === 'number' ? element.height : (el && el.offsetHeight > 0 ? el.offsetHeight : 24)
    return { width: Math.max(10, w), height: Math.max(10, h) }
  }

  const handleResizeMouseDown = (e: ReactMouseEvent<HTMLDivElement>, direction: string) => {
    if (e.button !== 0) return
    
    e.stopPropagation()
    e.preventDefault()
    
    setIsResizing(direction)
    const dims = getElementDimensions()
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      elementX: element.x || 0,
      elementY: (effectiveY !== undefined ? effectiveY : element.y) || 0,
      elementWidth: dims.width,
      elementHeight: dims.height,
    })
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const currentScale = scale || 1
      // Calcular delta do movimento com compensacao de zoom
      const deltaX = (e.clientX - dragStart.x) / currentScale
      const deltaY = (e.clientY - dragStart.y) / currentScale
      
      if (isMultiSelection && Object.keys(dragStart.initialPositions).length > 1) {
        // Mover todos os elementos selecionados juntos com snap baseado no elemento principal
        const primaryInit = dragStart.initialPositions[element.id]
        let moveDeltaX = deltaX
        let moveDeltaY = deltaY
        if (primaryInit && snapToGuides) {
          const rawX = primaryInit.x + deltaX
          const rawY = primaryInit.y + deltaY
          const dims = getElementDimensions()
          const snapped = applySnap(rawX, rawY, dims.width, dims.height)
          moveDeltaX = snapped.x - primaryInit.x
          moveDeltaY = snapped.y - primaryInit.y
        }
        Object.keys(dragStart.initialPositions).forEach(id => {
          const initialPos = dragStart.initialPositions[id]
          const newX = initialPos.x + moveDeltaX
          const newY = initialPos.y + moveDeltaY
          updateElement(id, { x: newX, y: newY }, selectedElementLocation ?? undefined)
        })
      } else {
        const initialPos = dragStart.initialPositions[element.id]
        if (!initialPos) return 
        
        let newX = initialPos.x + deltaX
        let newY = initialPos.y + deltaY
        
        if (element.width === '100%') {
          newX = 0
        }
        if (element.height === '100%') {
          newY = 0
        }
        
        if (element.width !== '100%' || element.height !== '100%') {
          const dims = getElementDimensions()
          const width = typeof element.width === 'number' ? element.width : dims.width
          const height = typeof element.height === 'number' ? element.height : dims.height
          const snapped = applySnap(newX, newY, width, height)
          if (element.width !== '100%') newX = snapped.x
          if (element.height !== '100%') newY = snapped.y
        }
        
        const isRelative = (element.positionMode || element.position || '').toUpperCase() === 'RELATIVE'
        if (isRelative && effectiveY !== undefined) {
          const newOffset = element.height === '100%' ? 0 : Math.max(0, dragStart.initialOffsetY + deltaY)
          onUpdate({ x: newX, y: newY, relativeOffsetY: newOffset })
        } else {
          onUpdate({ x: newX, y: newY })
        }
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      onSnapGuide?.({ h: null, v: null })
      saveSnapshot() // Save to history after moving
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragStart, scale, onUpdate, isMultiSelection, selectedElementLocation, element.id, element.width, element.height, saveSnapshot, snapToGuides, horizontalGuides, verticalGuides, containerOffsetX, containerOffsetY])

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: globalThis.MouseEvent): void => {
      const currentScale = scale || 1
      const deltaX = (e.clientX - resizeStart.x) / currentScale
      const deltaY = (e.clientY - resizeStart.y) / currentScale
      
      const updates: Partial<Element> = {}

      switch (isResizing) {
        // Cantos
        case 'nw': { // Northwest (top-left)
          let newX = resizeStart.elementX + deltaX
          let newY = resizeStart.elementY + deltaY
          let newWidth = Math.max(10, resizeStart.elementWidth - deltaX)
          let newHeight = Math.max(10, resizeStart.elementHeight - deltaY)

          if (snapToGuides) {
            const snapLeft = applySnap(newX, newY, 0, 0, { snapX: true, snapY: false })
            const diffX = snapLeft.x - newX
            newX = snapLeft.x
            newWidth = Math.max(10, newWidth - diffX)

            const snapTop = applySnap(newX, newY, 0, 0, { snapX: false, snapY: true })
            const diffY = snapTop.y - newY
            newY = snapTop.y
            newHeight = Math.max(10, newHeight - diffY)
          }

          updates.x = newX
          updates.y = newY
          updates.width = newWidth
          updates.height = newHeight
          break
        }
        case 'ne': { // Northeast (top-right)
          let newY = resizeStart.elementY + deltaY
          let newWidth = Math.max(10, resizeStart.elementWidth + deltaX)
          let newHeight = Math.max(10, resizeStart.elementHeight - deltaY)

          if (snapToGuides) {
            const snapRight = applySnap(resizeStart.elementX + newWidth, newY, 0, 0, { snapX: true, snapY: false })
            newWidth = Math.max(10, snapRight.x - resizeStart.elementX)

            const snapTop = applySnap(resizeStart.elementX, newY, 0, 0, { snapX: false, snapY: true })
            const diffY = snapTop.y - newY
            newY = snapTop.y
            newHeight = Math.max(10, newHeight - diffY)
          }

          updates.y = newY
          updates.width = newWidth
          updates.height = newHeight
          break
        }
        case 'sw': { // Southwest (bottom-left)
          let newX = resizeStart.elementX + deltaX
          let newWidth = Math.max(10, resizeStart.elementWidth - deltaX)
          let newHeight = Math.max(10, resizeStart.elementHeight + deltaY)

          if (snapToGuides) {
            const snapLeft = applySnap(newX, resizeStart.elementY, 0, 0, { snapX: true, snapY: false })
            const diffX = snapLeft.x - newX
            newX = snapLeft.x
            newWidth = Math.max(10, newWidth - diffX)

            const snapBottom = applySnap(newX, resizeStart.elementY + newHeight, 0, 0, { snapX: false, snapY: true })
            newHeight = Math.max(10, snapBottom.y - resizeStart.elementY)
          }

          updates.x = newX
          updates.width = newWidth
          updates.height = newHeight
          break
        }
        case 'se': { // Southeast (bottom-right)
          let newWidth = Math.max(10, resizeStart.elementWidth + deltaX)
          let newHeight = Math.max(10, resizeStart.elementHeight + deltaY)

          if (snapToGuides) {
            const snapRight = applySnap(resizeStart.elementX + newWidth, resizeStart.elementY, 0, 0, { snapX: true, snapY: false })
            newWidth = Math.max(10, snapRight.x - resizeStart.elementX)

            const snapBottom = applySnap(resizeStart.elementX, resizeStart.elementY + newHeight, 0, 0, { snapX: false, snapY: true })
            newHeight = Math.max(10, snapBottom.y - resizeStart.elementY)
          }

          updates.width = newWidth
          updates.height = newHeight
          break
        }
        
        // Bordas
        case 'n': { // North (top)
          let newY = resizeStart.elementY + deltaY
          let newHeight = Math.max(10, resizeStart.elementHeight - deltaY)
          if (snapToGuides) {
            const snapTop = applySnap(resizeStart.elementX, newY, 0, 0, { snapX: false, snapY: true })
            const diffY = snapTop.y - newY
            newY = snapTop.y
            newHeight = Math.max(10, newHeight - diffY)
          }
          updates.y = newY
          updates.height = newHeight
          break
        }
        case 's': { // South (bottom)
          let newHeight = Math.max(10, resizeStart.elementHeight + deltaY)
          if (snapToGuides) {
            const snapBottom = applySnap(resizeStart.elementX, resizeStart.elementY + newHeight, 0, 0, { snapX: false, snapY: true })
            newHeight = Math.max(10, snapBottom.y - resizeStart.elementY)
          }
          updates.height = newHeight
          break
        }
        case 'w': { // West (left)
          let newX = resizeStart.elementX + deltaX
          let newWidth = Math.max(10, resizeStart.elementWidth - deltaX)
          if (snapToGuides) {
            const snapLeft = applySnap(newX, resizeStart.elementY, 0, 0, { snapX: true, snapY: false })
            const diffX = snapLeft.x - newX
            newX = snapLeft.x
            newWidth = Math.max(10, newWidth - diffX)
          }
          updates.x = newX
          updates.width = newWidth
          break
        }
        case 'e': { // East (right)
          let newWidth = Math.max(10, resizeStart.elementWidth + deltaX)
          if (snapToGuides) {
            const snapRight = applySnap(resizeStart.elementX + newWidth, resizeStart.elementY, 0, 0, { snapX: true, snapY: false })
            newWidth = Math.max(10, snapRight.x - resizeStart.elementX)
          }
          updates.width = newWidth
          break
        }
      }

      onUpdate(updates)
    }

    const handleMouseUp = () => {
      setIsResizing(null)
      onSnapGuide?.({ h: null, v: null })
      saveSnapshot() // Save to history after resizing
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, resizeStart, scale, onUpdate, saveSnapshot, snapToGuides, horizontalGuides, verticalGuides, containerOffsetX, containerOffsetY])

  const renderElement = () => {
    switch (element.type) {
      case 'text':
      case 'static_text':
      case 'rich_text':
      case 'link': {
        const isMultiline = element.style?.multiline === true
        const firstLineIndent = element.style?.firstLineIndent || 0

        // Bordas e padding
        const textBorderWidth = element.style?.borderWidth ?? 0
        const textBorderColor = element.style?.borderColor || '#000000'
        const textBorderStyle = element.style?.borderStyle || 'solid'
        const textBgColor = element.style?.backgroundColor || 'transparent'

        const isElRelative = (element.positionMode || element.position || '').toUpperCase() === 'RELATIVE'
        const resolvedElWidth = (isElRelative && effectiveWidth !== undefined) ? effectiveWidth : (element.width || 'auto')
        const estimatedHeight = getEstimatedElementHeight(element, typeof resolvedElWidth === 'number' ? resolvedElWidth : undefined, testData)
        const textStyles: CSSProperties = {
          width: resolvedElWidth,
          height: isMultiline ? Math.max(typeof element.height === 'number' ? element.height : 0, estimatedHeight) : (element.height || estimatedHeight),
          fontSize: element.style?.fontSize || 12,
          fontWeight: element.style?.fontWeight || 'normal',
                textDecoration: element.type === 'link' ? 'underline' : 'none',
          fontStyle: element.style?.fontStyle || 'normal',
          fontFamily: getFontFamily(element.style?.fontFamily),
          textDecoration: element.style?.textDecoration || 'none',
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
          textAlign: getTextAlign(element.style?.alignment),
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
              onChange={(e) => setEditingValue(e.target.value)}
              onBlur={handleTextEditBlur}
              onKeyDown={handleTextEditKeyDown}
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
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
            title="Double-click to edit"
          >
            {resolveDisplayText(element, 'Texto')}
          </div>
        )
      }

      case 'page_break': {
        const pbWidth = element.width === '100%' ? (pageSize.width - margins.left - margins.right) : (element.width || (pageSize.width - margins.left - margins.right))
        return (
          <div
            className={`cursor-pointer select-none ${isSelected ? 'ring-2 ring-indigo-500 rounded' : ''}`}
            style={{
              width: pbWidth,
              height: 24,
              borderBottom: isSelected ? '3px dashed #6366f1' : '3px dashed #94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
            onMouseDown={handleMouseDown}
          >
            <span
              style={{
                background: isSelected ? '#eef2ff' : 'white',
                padding: '1px 10px',
                color: isSelected ? '#4f46e5' : '#64748b',
                fontSize: '11px',
                fontWeight: 'bold',
                borderRadius: '4px',
                border: isSelected ? '1px solid #818cf8' : '1px solid #cbd5e1',
                transform: 'translateY(10px)',
                pointerEvents: 'none',
              }}
            >
              ✂ PAGE BREAK
            </span>
          </div>
        )
      }
      case 'spacer':
      case 'rectangle': {
        const borderWidth = element.style?.borderWidth ?? 1
        const borderColor = element.style?.borderColor || '#000000'
        const borderStyle = element.style?.borderStyle || 'solid'
        
        
        const getElementLocation = () => {
          
          if (template.pageSettings.header?.elements.some(e => e.id === element.id)) {
            return 'header'
          }
          if (template.pageSettings.footer?.elements.some(e => e.id === element.id)) {
            return 'footer'
          }
          if (template.pageSettings.bodyBackground?.elements.some(e => e.id === element.id)) {
            return 'bodyBackground'
          }
          if (template.summaryPage?.elements.some(e => e.id === element.id)) {
            return 'summary'
          }
          // Default: body
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
          } else if (elementLocation === 'bodyBackground') {
            
            return { width: contentWidth, height: contentHeight }
          } else if (elementLocation === 'summary') {
            return { width: contentWidth, height: contentHeight }
          } else {
            // body
            const bodyHeight = contentHeight - 
              (template.pageSettings.header?.height || 0) - 
              (template.pageSettings.footer?.height || 0)
            return { width: contentWidth, height: bodyHeight }
          }
        }
        
        // Resolver width e height (suporte para "100%")
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
            onMouseDown={handleMouseDown}
          />
        )
      }

      case 'line': {
        // Get container dimensions for resolving "100%"
        const getLineElementLocation = () => {
          if (template.pageSettings.header?.elements.some(e => e.id === element.id)) return 'header'
          if (template.pageSettings.footer?.elements.some(e => e.id === element.id)) return 'footer'
          if (template.pageSettings.bodyBackground?.elements.some(e => e.id === element.id)) return 'bodyBackground'
          if (template.summaryPage?.elements.some(e => e.id === element.id)) return 'summary'
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
            const bodyHeight = contentHeight - 
              (template.pageSettings.header?.height || 0) - 
              (template.pageSettings.footer?.height || 0)
            return { width: contentWidth, height: bodyHeight }
          }
        }
        
        const resolveLineDimension = (value: string | number | undefined, containerSize: number, defaultValue: number = 100) => {
          if (typeof value === 'string' && value.endsWith('%')) {
            const percentage = parseFloat(value)
            return (containerSize * percentage) / 100
          }
          return typeof value === 'number' ? value : defaultValue
        }
        
        const lineContainerDims = getLineContainerDimensions()
        
        // Support both new (width/height) and legacy (x2/y2) formats, including "100%"
        const lineElWidthRaw = element.width ?? (element.x2 ? element.x2 - element.x : 100)
        const lineElHeightRaw = element.height ?? (element.y2 ? element.y2 - element.y : 0)
        const lineElWidth = resolveLineDimension(lineElWidthRaw, lineContainerDims.width, 100)
        const lineElHeight = resolveLineDimension(lineElHeightRaw, lineContainerDims.height, 0)
        const lineStrokeWidth = element.style?.strokeWidth || 1
        
        // SVG must be large enough to contain the stroke
        const svgElWidth = Math.max(Math.abs(lineElWidth), lineStrokeWidth)
        const svgElHeight = Math.max(Math.abs(lineElHeight), lineStrokeWidth)
        
        // Calculate line coordinates with stroke offset
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
              // Offset position to account for stroke centering
              marginLeft: lineElHeight === 0 ? 0 : -strokeOffset,
              marginTop: lineElWidth === 0 ? 0 : -strokeOffset,
            }}
            onMouseDown={handleMouseDown}
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

      case 'image': {
        const imageSource = element.source || element.url || element.value
        return (
          <div
            className={`cursor-move select-none border-2 border-dashed border-gray-400 flex items-center overflow-hidden ${
              element.alignment === 'left' ? 'justify-start' : element.alignment === 'right' ? 'justify-end' : 'justify-center'
            } ${
              isSelected ? 'ring-2 ring-primary-500' : ''
            }`}
            style={{
              width: element.width,
              height: element.height,
            }}
            onMouseDown={handleMouseDown}
          >
            {imageSource ? (
              <img
                src={imageSource}
                alt=""
                className="w-full h-full pointer-events-none"
                style={{ objectFit: (element.fit as any) || 'contain' }}
              />
            ) : (
              <span className="text-gray-400 text-sm">🖼️ Image</span>
            )}
          </div>
        )
      }

      case 'table': {
        try {
          console.log('🔍 Renderizando tabela:', element.id, {
            hasColumns: !!element.columns,
            isArray: Array.isArray(element.columns),
            columnsLength: element.columns?.length,
            columns: element.columns,
            style: element.style
          })
          
          const columns = Array.isArray(element.columns) ? element.columns : []
          const hasValidColumns = columns.length > 0 && columns.every((col: unknown) => col && typeof col === 'object')
          
          console.log('  ✅ Colunas validadas:', hasValidColumns, columns)
          
          // Estilos da tabela
          const tableStyle = element.style || {}
          const headerBg = tableStyle.headerBackground || '#f0f0f0'
          const headerColor = tableStyle.headerColor || '#000000'
          const headerFontSize = tableStyle.headerFontSize || 12
          const fontSize = tableStyle.fontSize || 10
          const cellColor = tableStyle.cellColor || '#000000'
          const borderColor = tableStyle.borderColor || '#cccccc'
          const headerBorderColor = tableStyle.headerBorderColor || borderColor
          const borderStyle = tableStyle.borderStyle || 'solid'
          
          // Calcular valores de border dinamicamente
          const headerBorderValues = getHeaderBorderValues(tableStyle)
          const cellBorderValues = getCellBorderValues(tableStyle)
          
          // Paddings - Prioridade: specific > general > default
          const headerPaddingTop = tableStyle.headerPaddingTop ?? tableStyle.headerPadding ?? tableStyle.cellPadding ?? 5
          const headerPaddingRight = tableStyle.headerPaddingRight ?? tableStyle.headerPadding ?? tableStyle.cellPadding ?? 5
          const headerPaddingBottom = tableStyle.headerPaddingBottom ?? tableStyle.headerPadding ?? tableStyle.cellPadding ?? 5
          const headerPaddingLeft = tableStyle.headerPaddingLeft ?? tableStyle.headerPadding ?? tableStyle.cellPadding ?? 5
          
          const cellPaddingTop = tableStyle.cellPaddingTop ?? tableStyle.cellPadding ?? 5
          const cellPaddingRight = tableStyle.cellPaddingRight ?? tableStyle.cellPadding ?? 5
          const cellPaddingBottom = tableStyle.cellPaddingBottom ?? tableStyle.cellPadding ?? 5
          const cellPaddingLeft = tableStyle.cellPaddingLeft ?? tableStyle.cellPadding ?? 5
          
          // Calcular larguras proporcionais das colunas
          const columnWidths = columns.map((col: Record<string, unknown>) => (col.width as number) || 100)
          const totalWidth = columnWidths.reduce((sum: number, w: number) => sum + w, 0)
          const tableWidth = element.width || 400
          const proportionalWidths = columnWidths.map((w: number) => (w / totalWidth) * tableWidth)
          
          // Helper para converter alignment
          const getTextAlign = (alignment?: string): string => {
            switch (alignment?.toLowerCase()) {
              case 'center': return 'center'
              case 'right': return 'right'
              case 'justify': return 'justify'
              default: return 'left'
            }
          }
          
          return (
            <div
              className={`cursor-move select-none ${
                isSelected ? 'ring-2 ring-primary-500' : ''
              }`}
              style={{
                width: element.width || 400,
                minHeight: 50,
              }}
              onMouseDown={handleMouseDown}
            >
              {hasValidColumns ? (
                <table className="w-full pointer-events-none border-collapse" style={{ tableLayout: 'fixed' }}>
                  <thead>
                    <tr
                      style={{
                        backgroundColor: headerBg,
                        color: headerColor,
                        fontSize: `${headerFontSize}px`,
                      }}
                    >
                      {columns.map((col: Record<string, unknown>, i: number) => {
                        const isFirstColumn = i === 0
                        const isLastColumn = i === columns.length - 1
                        const headerBorderType = tableStyle.headerBorderType
                        
                        // Calcular bordas baseado no tipo
                        let leftBorder = headerBorderValues.left
                        let rightBorder = headerBorderValues.right
                        
                        if (headerBorderType === 'columns') {
                          // Cada coluna tem borders, dividir bordas laterais adjacentes
                          leftBorder = isFirstColumn ? headerBorderValues.left : headerBorderValues.left / 2
                          rightBorder = isLastColumn ? headerBorderValues.right : headerBorderValues.right / 2
                        } else if (headerBorderType === 'row') {
                          
                          leftBorder = isFirstColumn ? headerBorderValues.left : 0
                          rightBorder = isLastColumn ? headerBorderValues.right : 0
                        }
                        
                        return (
                        <th
                          key={`header-${i}`}
                          className="font-semibold"
                          style={{
                              borderLeftWidth: `${leftBorder}px`,
                              borderLeftStyle: borderStyle,
                              borderLeftColor: headerBorderColor,
                              borderRightWidth: `${rightBorder}px`,
                              borderRightStyle: borderStyle,
                              borderRightColor: headerBorderColor,
                              borderTopWidth: `${headerBorderValues.top}px`,
                              borderTopStyle: borderStyle,
                              borderTopColor: headerBorderColor,
                              borderBottomWidth: `${headerBorderValues.bottom}px`,
                              borderBottomStyle: borderStyle,
                              borderBottomColor: headerBorderColor,
                            width: `${proportionalWidths[i]}px`,
                            minWidth: `${proportionalWidths[i]}px`,
                            maxWidth: `${proportionalWidths[i]}px`,
                              paddingTop: `${headerPaddingTop}px`,
                              paddingRight: `${headerPaddingRight}px`,
                              paddingBottom: `${headerPaddingBottom}px`,
                              paddingLeft: `${headerPaddingLeft}px`,
                            boxSizing: 'border-box',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                              textAlign: getTextAlign(col.headerAlignment || col.alignment || 'left'),
                              verticalAlign: col.headerVerticalAlignment || 'center',
                          }}
                        >
                          {String(col?.header || 'Header')}
                        </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      style={{
                        fontSize: `${fontSize}px`,
                        color: cellColor,
                      }}
                    >
                      {columns.map((col: Record<string, unknown>, i: number) => {
                        const isFirstColumn = i === 0
                        const isLastColumn = i === columns.length - 1
                        const cellBorderType = tableStyle.cellBorderType
                        
                        // Calcular bordas baseado no tipo
                        let leftBorder = cellBorderValues.left
                        let rightBorder = cellBorderValues.right
                        
                        if (cellBorderType === 'cells') {
                          
                          leftBorder = isFirstColumn ? cellBorderValues.left : cellBorderValues.left / 2
                          rightBorder = isLastColumn ? cellBorderValues.right : cellBorderValues.right / 2
                        } else if (cellBorderType === 'row') {
                          
                          leftBorder = isFirstColumn ? cellBorderValues.left : 0
                          rightBorder = isLastColumn ? cellBorderValues.right : 0
                        }
                        
                        return (
                        <td
                          key={`field-${i}`}
                          style={{
                              borderTopWidth: `${cellBorderValues.top}px`,
                              borderTopStyle: borderStyle,
                              borderTopColor: borderColor,
                              borderRightWidth: `${rightBorder}px`,
                              borderRightStyle: borderStyle,
                              borderRightColor: borderColor,
                              borderBottomWidth: `${cellBorderValues.bottom}px`,
                              borderBottomStyle: borderStyle,
                              borderBottomColor: borderColor,
                              borderLeftWidth: `${leftBorder}px`,
                              borderLeftStyle: borderStyle,
                              borderLeftColor: borderColor,
                            width: `${proportionalWidths[i]}px`,
                            minWidth: `${proportionalWidths[i]}px`,
                            maxWidth: `${proportionalWidths[i]}px`,
                              paddingTop: `${cellPaddingTop}px`,
                              paddingRight: `${cellPaddingRight}px`,
                              paddingBottom: `${cellPaddingBottom}px`,
                              paddingLeft: `${cellPaddingLeft}px`,
                            boxSizing: 'border-box',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                              textAlign: getTextAlign(col.alignment || 'left'),
                              verticalAlign: col.verticalAlignment || 'center',
                          }}
                        >
                          {String(col?.field || 'field')}
                        </td>
                        )
                      })}
                    </tr>
                  </tbody>
                </table>
              ) : (
                <div className="w-full h-full min-h-[50px] flex items-center justify-center text-gray-400 text-xs p-4">
                  📊 Table without columns<br />
                  <span className="text-xs">Select and add columns</span>
                </div>
              )}
            </div>
          )
        } catch (tableError) {
          console.error('Erro ao renderizar tabela:', element.id, tableError)
          return (
            <div
              className="cursor-move select-none border-2 border-red-300 bg-red-50 text-red-700 text-xs p-2"
              style={{
                width: element.width || 400,
                minHeight: 50,
              }}
              onMouseDown={handleMouseDown}
            >
              ⚠️ Erro na tabela {element.id}<br/>
              {tableError instanceof Error ? tableError.message : 'Erro desconhecido'}
            </div>
          )
        }
      }

      case 'barcode': {
        const barcodeType = ((element.barcodeType as string) || 'qrcode').toLowerCase()
        const is2D = barcodeType === 'qrcode' || barcodeType === 'qr_code' || barcodeType === 'datamatrix' || barcodeType === 'data_matrix'
        const barcodeBinding = (element.value as string) || (element.dataBinding as string) || (is2D ? 'https://openpdf.dev' : '123456789012')

        return (
          <div
            className={`cursor-move select-none border border-dashed border-slate-400 flex flex-col items-center justify-center bg-white p-1.5 overflow-hidden ${
              isSelected ? 'ring-2 ring-primary-500' : ''
            }`}
            style={{
              width: element.width || (is2D ? 100 : 140),
              height: element.height || (is2D ? 100 : 50),
            }}
            onMouseDown={handleMouseDown}
          >
            {is2D ? (
              <svg className="w-3/5 h-3/5 text-slate-900 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3h7v7H3V3zm2 2v3h3V5H5zm9-2h7v7h-7V3zm2 2v3h3V5h-3zM3 14h7v7H3v-7zm2 2v3h3v-3H5zm9-2h3v3h-3v-3zm4 0h3v3h-3v-3zm-2 3h2v2h-2v-2zm-2 2h3v2h-3v-2zm4 0h3v2h-3v-2z" />
              </svg>
            ) : (
              <svg className="w-4/5 h-3/5 text-slate-900 shrink-0" viewBox="0 0 48 20" fill="currentColor" preserveAspectRatio="none">
                <rect x="2" y="1" width="2" height="18" />
                <rect x="6" y="1" width="1" height="18" />
                <rect x="9" y="1" width="3" height="18" />
                <rect x="14" y="1" width="1" height="18" />
                <rect x="17" y="1" width="2" height="18" />
                <rect x="21" y="1" width="4" height="18" />
                <rect x="27" y="1" width="1" height="18" />
                <rect x="30" y="1" width="2" height="18" />
                <rect x="34" y="1" width="3" height="18" />
                <rect x="39" y="1" width="1" height="18" />
                <rect x="42" y="1" width="2" height="18" />
                <rect x="45" y="1" width="1" height="18" />
              </svg>
            )}
            <span className="text-[9px] font-mono text-slate-600 text-center truncate w-full px-1 mt-0.5 leading-tight">
              {barcodeBinding}
            </span>
          </div>
        )
      }

      case 'loop': {
        const loopElements = element.elements || []
        const loopBinding = element.dataBinding || ''
        const loopItemSpacing = element.itemSpacing || 20
        const bodyAvailableWidth = pageSize.width - margins.left - margins.right
        const loopWidth =
          element.width === '100%'
            ? bodyAvailableWidth
            : typeof element.width === 'number'
              ? element.width
              : 400
        const loopHeight = typeof element.height === 'number' ? element.height : 150
        const loopBorderWidth = element.style?.borderStyle === 'none' ? 0 : (element.style?.borderWidth ?? element.style?.strokeWidth ?? 2)
        const innerLoopWidth = Math.max(0, loopWidth - (loopBorderWidth * 2))
        const innerLoopHeight = Math.max(0, loopHeight - (loopBorderWidth * 2))
        
        return (
          <div
            className={`cursor-move select-none relative ${
              isSelected ? 'ring-2 ring-primary-500' : ''
            }`}
            style={{
              width: loopWidth,
              height: loopHeight,
              boxSizing: 'border-box',
              backgroundColor:
                (element.style?.fillColor || element.style?.backgroundColor) === 'transparent'
                  ? 'transparent'
                  : (element.style?.fillColor || element.style?.backgroundColor || 'transparent'),
              borderWidth: loopBorderWidth,
              borderStyle: (element.style?.borderStyle as string) || 'dashed',
              borderColor: element.style?.borderColor || element.style?.strokeColor || '#8b5cf6',
              borderRadius: element.style?.cornerRadius ?? 4,
            }}
            onMouseDown={handleMouseDown}
          >
{/*
             <div
              className={`absolute flex items-center gap-2 px-2 py-1 bg-primary-500 text-white rounded-md shadow-sm pointer-events-none transition-opacity ${
                isSelected ? 'opacity-100' : 'opacity-70'
              }`}
              style={{ top: -24, right: -100 }}
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 2l4 4-4 4" />
                <path d="M3 11v-1a4 4 0 014-4h14" />
                <path d="M7 22l-4-4 4-4" />
                <path d="M21 13v1a4 4 0 01-4 4H3" />
              </svg>
              <span className="text-[10px] font-semibold">LOOP</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded ml-1">
                {loopElements.length}
              </span>
            </div>
*/}
            
            <div className="relative w-full h-full">
              {loopElements.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-3 border-2 border-dashed border-primary-200 rounded-lg bg-primary-50/50">
                    <div className="text-primary-400 text-[10px] font-medium">{t.canvas.addElements}</div>
                    <div className="text-primary-300 text-[9px]">{t.canvas.viaSidebar}</div>
                  </div>
                </div>
              ) : (
                <>
                  
                  {loopElements.map((child: Element) => (
                    <LoopChildElement 
                      key={child.id} 
                      child={child} 
                      loopId={element.id}
                      location={location}
                      loopWidth={innerLoopWidth}
                      loopHeight={innerLoopHeight}
                      horizontalGuides={horizontalGuides}
                      verticalGuides={verticalGuides}
                      loopPageX={(containerOffsetX !== undefined ? containerOffsetX : margins.left) + (element.x || 0)}
                      loopPageY={(containerOffsetY !== undefined ? containerOffsetY : margins.top) + (effectiveY !== undefined ? effectiveY : (element.y || 0))}
                      scale={scale}
                      onSnapGuide={onSnapGuide}
                    />
                  ))}
                </>
              )}
            </div>
            
            {/* Spacing badge - bottom right corner
            <div className="absolute bottom-1 right-1 pointer-events-none">
              <span className="text-[8px] text-primary-400 bg-primary-50 px-1.5 py-0.5 rounded">
                spacing: {loopItemSpacing}px
              </span>
            </div>
            */}
          </div>
        )
      }
      case 'container': {
              const containerElements = element.elements || []
              const containerItemSpacing = element.itemSpacing || 20
              const bodyAvailableWidth = pageSize.width - margins.left - margins.right
              const containerWidth =
                element.width === '100%'
                  ? bodyAvailableWidth
                  : typeof element.width === 'number'
                    ? element.width
                    : 400
              const headerH = template.pageSettings.header?.height || 0
              const footerH = template.pageSettings.footer?.height || 0
              const sectionMaxH = location === 'header'
                ? headerH
                : location === 'footer'
                ? footerH
                : Math.max(0, pageSize.height - margins.top - margins.bottom - headerH - footerH)
              const containerStartY = typeof effectiveY === 'number' ? effectiveY : (typeof element.y === 'number' ? element.y : 0)
              const maxAllowedContainerH = Math.max(30, sectionMaxH - containerStartY)

              const isFixed = element.heightMode === 'fixed' || element.autoHeight === false
              const baseHeight = element.height === '100%'
                ? sectionMaxH
                : typeof element.height === 'number' ? element.height : 150
              const containerHeight = Math.min(
                isFixed
                  ? baseHeight
                  : Math.max(
                      baseHeight,
                      (containerElements || []).reduce((max: number, ch: Element) => {
                        const cy = typeof ch.y === 'number' ? ch.y : 0
                        const chH = typeof ch.height === 'number' ? ch.height : 25
                        return Math.max(max, cy + chH + 15)
                      }, 0)
                    ),
                maxAllowedContainerH
              )
              const containerBorderWidth = element.style?.borderStyle === 'none' ? 0 : (element.style?.borderWidth ?? element.style?.strokeWidth ?? 2)
              const innerContainerWidth = Math.max(0, containerWidth - (containerBorderWidth * 2))
              const innerContainerHeight = Math.max(0, containerHeight - (containerBorderWidth * 2))

              return (
                <div
                  className={`cursor-move select-none relative ${
                    isSelected ? 'ring-2 ring-primary-500' : ''
                  }`}
                  style={{
                    width: containerWidth,
                    height: containerHeight,
                    boxSizing: 'border-box',
                    backgroundColor:
                      (element.style?.fillColor || element.style?.backgroundColor) === 'transparent'
                        ? 'transparent'
                        : (element.style?.fillColor || element.style?.backgroundColor || 'transparent'),
                    borderWidth: containerBorderWidth,
                    borderStyle: (element.style?.borderStyle as string) || 'dashed',
                    borderColor: element.style?.borderColor || element.style?.strokeColor || '#8b5cf6',
                    borderRadius: element.style?.cornerRadius ?? 4,
                  }}
                  onMouseDown={handleMouseDown}
                >
{/*
                  <div
                    className={`absolute flex items-center gap-2 px-2 py-1 bg-primary-500 text-white rounded-md shadow-sm pointer-events-none transition-opacity ${
                      isSelected ? 'opacity-100' : 'opacity-20'
                    }`}
                    style={{ top: -24, right: -100 }}
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 2l4 4-4 4" />
                      <path d="M3 11v-1a4 4 0 014-4h14" />
                      <path d="M7 22l-4-4 4-4" />
                      <path d="M21 13v1a4 4 0 01-4 4H3" />
                    </svg>
                    <span className="text-[10px] font-semibold">CONTAINER</span>
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded ml-1">
                      {containerElements.length}
                    </span>
                  </div>
*/}

                  {isSelected && (
                    <div className="absolute top-1 right-1 pointer-events-none z-20">
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded shadow-sm border ${
                        isFixed
                          ? 'bg-amber-950/90 text-amber-300 border-amber-700/70'
                          : 'bg-indigo-950/90 text-indigo-300 border-indigo-700/70'
                      }`}>
                        {isFixed ? 'Fixed-Height' : 'Auto-Height'}
                      </span>
                    </div>
                  )}

                  <div className="relative w-full h-full">
                    {containerElements.length === 0 ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center p-3 border-2 border-dashed border-primary-200 rounded-lg bg-primary-50/50">
                          <div className="text-primary-400 text-[10px] font-medium">{t.canvas.addElements} <span className="text-primary-300 text-[9px]">{t.canvas.viaSidebar}</span></div>
                        </div>
                      </div>
                    ) : (
                      <>

                        {(() => {
                          let containerFlowY = 0
                          let lastChildX: number | undefined = undefined
                          let lastChildWidth: number | string | undefined = undefined
                          return containerElements.map((child: Element) => {
                            const isRelative = (child.positionMode || child.position || '').toUpperCase() === 'RELATIVE'
                            let effectiveChildY: number | undefined = undefined
                            let effectiveChildX: number | undefined = undefined
                            let effectiveChildWidth: number | string | undefined = undefined

                            if (isRelative) {
                              const isChildHeightFull = child.height === '100%'
                              const offset = isChildHeightFull ? 0 : (typeof child.relativeOffsetY === 'number' ? child.relativeOffsetY : 0)
                              if (containerFlowY === 0) {
                                effectiveChildY = isChildHeightFull ? 0 : (typeof child.y === 'number' && child.y > 0 ? child.y : offset)
                              } else {
                                effectiveChildY = containerFlowY + offset
                                if (lastChildX !== undefined) {
                                  effectiveChildX = lastChildX
                                }
                                if (lastChildWidth !== undefined) {
                                  effectiveChildWidth = lastChildWidth
                                }
                              }
                            }

                            const childAvailableWidth = typeof child.width === 'number'
                              ? child.width
                              : (typeof child.width === 'string' && child.width.endsWith('%')
                                  ? (innerContainerWidth * (parseFloat(child.width) / 100))
                                  : (effectiveChildWidth !== undefined && typeof effectiveChildWidth === 'number' ? effectiveChildWidth : innerContainerWidth))
                            const chHeight = getEstimatedElementHeight(child, childAvailableWidth, testData)
                            if (isRelative && effectiveChildY !== undefined) {
                              containerFlowY = effectiveChildY + chHeight
                              lastChildX = effectiveChildX !== undefined ? effectiveChildX : child.x
                              lastChildWidth = effectiveChildWidth !== undefined ? effectiveChildWidth : child.width
                            } else {
                              containerFlowY = Math.max(containerFlowY, (child.y || 0) + chHeight)
                              lastChildX = child.x
                              lastChildWidth = child.width
                            }

                            return (
                              <ContainerChildElement
                                key={child.id}
                                child={child}
                                effectiveY={effectiveChildY}
                                effectiveX={effectiveChildX}
                                effectiveWidth={effectiveChildWidth}
                                containerId={element.id}
                                location={location}
                                containerWidth={innerContainerWidth}
                                containerHeight={innerContainerHeight}
                                horizontalGuides={horizontalGuides}
                                verticalGuides={verticalGuides}
                                containerPageX={
                                  (containerOffsetX !== undefined ? containerOffsetX : margins.left) +
                                  (element.width === '100%' ? 0 : (effectiveX !== undefined ? effectiveX : (element.x || 0)))
                                }
                                containerPageY={
                                  (containerOffsetY !== undefined
                                    ? containerOffsetY
                                    : (margins.top + (location === 'body' ? (template.pageSettings.header?.height || 0) : 0))) +
                                  (element.height === '100%' ? 0 : (effectiveY !== undefined ? effectiveY : (element.y || 0)))
                                }
                                scale={scale}
                                onSnapGuide={onSnapGuide}
                              />
                            )
                          })
                        })()}
                      </>
                    )}
                  </div>

                  {/* Spacing badge - bottom right corner
                  <div className="absolute bottom-1 right-1 pointer-events-none">
                    <span className="text-[8px] text-primary-400 bg-primary-50 px-1.5 py-0.5 rounded">
                      spacing: {containerItemSpacing}px
                    </span>
                  </div>
                  */}
                </div>
              )
            }


      default:
        return null
    }
  }

  const renderResizeHandles = () => {
    if (!isSelected) return null
    
    // Check if width or height is "100%"
    const isWidthFull = element.width === '100%'
    const isHeightFull = element.height === '100%'

    const handleSize = 8
    const handleStyle: CSSProperties = {
      position: 'absolute',
      width: handleSize,
      height: handleSize,
      backgroundColor: 'white',
      border: '2px solid #3b82f6',
      borderRadius: '50%',
      cursor: 'pointer',
      zIndex: 10,
    }

    const dims = getElementDimensions()
    const width = dims.width
    const height = dims.height

    return (
      <>
        {/* Cantos - desabilitar conforme width/height 100% */}
        {!isWidthFull && !isHeightFull && (
          <>
        <div
          style={{ ...handleStyle, top: -handleSize/2, left: -handleSize/2, cursor: 'nw-resize' }}
          onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
        />
        <div
          style={{ ...handleStyle, top: -handleSize/2, right: -handleSize/2, cursor: 'ne-resize' }}
          onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
        />
        <div
          style={{ ...handleStyle, bottom: -handleSize/2, left: -handleSize/2, cursor: 'sw-resize' }}
          onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
        />
        <div
          style={{ ...handleStyle, bottom: -handleSize/2, right: -handleSize/2, cursor: 'se-resize' }}
          onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
        />
          </>
        )}

        
        {!isHeightFull && (
          <>
        <div
          style={{ ...handleStyle, top: -handleSize/2, left: width/2 - handleSize/2, cursor: 'n-resize' }}
          onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
        />
        <div
          style={{ ...handleStyle, bottom: -handleSize/2, left: width/2 - handleSize/2, cursor: 's-resize' }}
          onMouseDown={(e) => handleResizeMouseDown(e, 's')}
        />
          </>
        )}
        
        
        {!isWidthFull && (
          <>
        <div
          style={{ ...handleStyle, top: height/2 - handleSize/2, left: -handleSize/2, cursor: 'w-resize' }}
          onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
        />
        <div
          style={{ ...handleStyle, top: height/2 - handleSize/2, right: -handleSize/2, cursor: 'e-resize' }}
          onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
        />
          </>
        )}
      </>
    )
  }

  return (
    <div
      className="absolute"
      style={{
        left: element.width === '100%' ? 0 : (effectiveX !== undefined ? effectiveX : element.x),
        top: element.height === '100%' ? 0 : (effectiveY !== undefined ? effectiveY : element.y),
        ...(element.width === '100%' ? { width: '100%' } : (effectiveWidth !== undefined && element.width === undefined ? { width: effectiveWidth } : {})),
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
        {renderResizeHandles()}
        
        
        {elementGroup && (
          <div
            className="absolute -top-1 -right-1 z-20 pointer-events-auto cursor-pointer group/badge"
            title={`Grupo: ${elementGroup.name}${elementGroup.printCondition ? `\nCondição: ${elementGroup.printCondition}` : ''}\nClique para editar grupo`}
            onClick={(e) => {
              e.stopPropagation()
              useTemplateStore.getState().selectGroup(elementGroup.id, location)
            }}
          >
            <div className="bg-purple-500 hover:bg-purple-600 text-white p-1 rounded-full shadow-lg transition transform hover:scale-110">
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
