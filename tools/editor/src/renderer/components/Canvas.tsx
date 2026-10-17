import { useState, useEffect, useRef, type MouseEvent as ReactMouseEvent, type CSSProperties } from 'react'
import { useTemplateStore, type Element, type ElementLocation } from '../store/templateStore'
import { useUIStore } from '../store/uiStore'
import { processExpression, hasTransformations } from '../utils/expressionProcessor'
import { Select, Button, Divider } from './atoms'
import { IconButton } from './molecules'

// Component to render Loop child elements
interface LoopChildElementProps {
  child: Element
  loopId: string
  location: ElementLocation
  loopWidth: number
  loopHeight: number
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

function ContainerChildElement({ child, containerId, location, containerWidth, containerHeight, effectiveY, effectiveX, effectiveWidth }: ContainerChildElementProps) {
  const {
    selectedContainerChildId,
    selectedContainerParentId,
    selectContainerChild,
    updateContainerChildElement,
    saveSnapshot,
    testData
  } = useTemplateStore()
  const isSelected = selectedContainerChildId === child.id && selectedContainerParentId === containerId

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
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, initialX: 0, initialY: 0, initialOffsetY: 10 })
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
    e.stopPropagation()
    selectContainerChild(containerId, child.id, location)
    setIsDragging(true)
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      initialX: child.x || 0,
      initialY: child.y || 0,
      initialOffsetY: typeof child.relativeOffsetY === 'number' ? child.relativeOffsetY : 10
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
      const childWidth = resolveWidth(child.width)
      const childHeight = resolveHeight(child.height)
      
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y
      
      let newX = dragStart.initialX + deltaX
      let newY = dragStart.initialY + deltaY
      
      newX = Math.max(0, Math.min(newX, Math.max(0, containerWidth - childWidth)))
      newY = Math.max(0, Math.min(newY, Math.max(0, containerHeight - childHeight)))
      
      const isChildRelative = (child.positionMode || child.position || '').toUpperCase() === 'RELATIVE'
      if (isChildRelative && effectiveY !== undefined) {
        const newOffsetY = Math.max(0, dragStart.initialOffsetY + deltaY)
        updateContainerChildElement(containerId, child.id, { x: newX, y: newY, relativeOffsetY: newOffsetY }, location)
      } else {
        updateContainerChildElement(containerId, child.id, { x: newX, y: newY }, location)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      saveSnapshot()
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragStart, containerId, child.id, location, updateContainerChildElement, saveSnapshot])

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const deltaX = e.clientX - resizeStart.x
      const deltaY = e.clientY - resizeStart.y
      
      const newWidth = Math.max(10, Math.min(containerWidth - (child.x || 0), resizeStart.initialW + deltaX))
      const newHeight = Math.max(10, Math.min(containerHeight - (child.y || 0), resizeStart.initialH + deltaY))
      
      updateContainerChildElement(containerId, child.id, { width: newWidth, height: newHeight }, location)
    }

    const handleMouseUp = () => {
      setIsResizing(null)
      saveSnapshot()
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, resizeStart, containerId, child.id, child.x, child.y, containerWidth, containerHeight, location, updateContainerChildElement, saveSnapshot])

  // Renderizar baseado no tipo
  const renderContent = () => {
    switch (child.type) {
      case 'text':
      case 'static_text': {
        const isChildRelative = (child.positionMode || child.position || '').toUpperCase() === 'RELATIVE'
        const rawW = isChildRelative && effectiveWidth !== undefined ? effectiveWidth : child.width
        const textWidth = rawW ? resolveWidth(rawW) : undefined
        const textHeight = child.height ? resolveHeight(child.height) : undefined
        const displayText = resolveChildDisplayText(child, child.type === 'text' ? 'campo' : 'Texto')
        return (
          <div
            style={{
              fontSize: child.style?.fontSize || 10,
              fontFamily: child.style?.fontFamily || 'Helvetica',
              color: child.style?.color || '#000000',
              fontWeight: child.style?.fontWeight || 'normal',
              width: textWidth || 'auto',
              height: textHeight || 'auto',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
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
      case 'rectangle': {
        const rectWidth = resolveWidth(child.width)
        const rectHeight = resolveHeight(child.height)
        return (
          <div
            style={{
              width: rectWidth,
              height: rectHeight,
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
                             <div className="text-primary-400 text-[10px] font-medium">Adicione elementos</div>
                             <div className="text-primary-300 text-[9px]">via sidebar</div>
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
      default:
        return <div className="w-10 h-10 bg-gray-300" />
    }
  }

  return (
    <div
      className={`absolute cursor-move ${isSelected ? 'ring-2 ring-purple-500 ring-offset-1' : ''}`}
      style={{
        left: effectiveX !== undefined ? effectiveX : (child.x || 0),
        top: effectiveY !== undefined ? effectiveY : (child.y || 0),
        ...(effectiveWidth !== undefined && !child.width ? { width: effectiveWidth } : {}),
      }}
      onMouseDown={handleMouseDown}
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

function LoopChildElement({ child, loopId, location, loopWidth, loopHeight }: LoopChildElementProps) {
  const { 
    selectedLoopChildId, 
    selectedLoopParentId, 
    selectLoopChild, 
    updateLoopChildElement,
    saveSnapshot,
    testData
  } = useTemplateStore()
  
  const isSelected = selectedLoopChildId === child.id && selectedLoopParentId === loopId
  
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
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  
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
    e.stopPropagation()
    selectLoopChild(loopId, child.id, location)
    setIsDragging(true)
    setDragStart({ x: e.clientX - child.x, y: e.clientY - child.y })
  }
  
  useEffect(() => {
    if (!isDragging) return
    
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const childWidth = resolveWidth(child.width)
      const childHeight = resolveHeight(child.height)
      
      let newX = e.clientX - dragStart.x
      let newY = e.clientY - dragStart.y
      
      newX = Math.max(0, Math.min(newX, Math.max(0, loopWidth - childWidth)))
      newY = Math.max(0, Math.min(newY, Math.max(0, loopHeight - childHeight)))
      
      updateLoopChildElement(loopId, child.id, { x: newX, y: newY }, location)
    }
    
    const handleMouseUp = () => {
      setIsDragging(false)
      saveSnapshot() 
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragStart, loopId, child.id, location, updateLoopChildElement, saveSnapshot])
  
  // Renderizar baseado no tipo
  const renderContent = () => {
    switch (child.type) {
      case 'text':
      case 'static_text': {
        const textWidth = child.width ? resolveWidth(child.width) : undefined
        const textHeight = child.height ? resolveHeight(child.height) : undefined
        const displayText = resolveChildDisplayText(child, child.type === 'text' ? 'campo' : 'Texto')
        return (
          <div
            style={{
              fontSize: child.style?.fontSize || 10,
              fontFamily: child.style?.fontFamily || 'Helvetica',
              color: child.style?.color || '#000000',
              fontWeight: child.style?.fontWeight || 'normal',
              width: textWidth || 'auto',
              height: textHeight || 'auto',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
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
      case 'rectangle': {
        const rectWidth = resolveWidth(child.width)
        const rectHeight = resolveHeight(child.height)
        return (
          <div
            style={{
              width: rectWidth,
              height: rectHeight,
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
      default:
        return <div className="w-10 h-10 bg-gray-300" />
    }
  }
  
  return (
    <div
      className={`absolute cursor-move ${isSelected ? 'ring-2 ring-purple-500 ring-offset-1' : ''}`}
      style={{
        left: child.x || 0,
        top: child.y || 0,
      }}
      onMouseDown={handleMouseDown}
    >
      {renderContent()}
      {/* Label do elemento */}
      {isSelected && (
        <div className="absolute -top-4 left-0 text-[9px] bg-purple-500 text-white px-1 rounded">
          {child.type}
        </div>
      )}
    </div>
  )
}

export default function Canvas() {
  const { template, selectedElementIds, selectedElementLocation, selectElement, toggleElementSelection, updateElement, currentSection, setCurrentSection, clearSelection } = useTemplateStore()
  const { zoom, setZoom } = useUIStore()
  const pageRef = useRef<HTMLDivElement>(null)

  let pageSize;
  switch(template.pageSettings.size) {
      case "A4" :
        pageSize = { width: 595, height: 842 };
      case "PORTRAIT" :
        pageSize = { width: 612, height: 792 };
      case "CUSTOM" :
        pageSize = { width: template.pageSettings.customSize?.width || 595, height: template.pageSettings.customSize?.height || 842 };
      default:
        pageSize ={ width: 595, height: 842 };
  }

  const scale = zoom / 100 // Converte porcentagem para escala
  const margins = template.pageSettings.margins

  // Estados para réguas e linhas guias interativas (inicia vazio)
  const [horizontalGuides, setHorizontalGuides] = useState<number[]>([])
  const [verticalGuides, setVerticalGuides] = useState<number[]>([])
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
        const clampedY = Math.max(0, Math.min(pageSize.height, Math.round(rawY)))
        setHorizontalGuides((prev) =>
          prev.map((g, i) => (i === draggingGuide.index ? clampedY : g))
        )
      } else {
        const rawX = (e.clientX - pageRect.left) / scale
        const clampedX = Math.max(0, Math.min(pageSize.width, Math.round(rawX)))
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
            // Se apenas clicou na régua sem arrastar para dentro da folha, coloca na margem superior
            setHorizontalGuides((prev) =>
              prev.map((g, i) => (i === draggingGuide.index ? Math.round(margins.top) : g))
            )
          } else if (rawY < 0 || rawY > pageSize.height) {
            // Se soltou fora da folha ou de volta na régua, remove a guia
            setHorizontalGuides((prev) => prev.filter((_, i) => i !== draggingGuide.index))
          }
        } else {
          const rawX = (e.clientX - pageRect.left) / scale
          if (draggingGuide.isNew && rawX < 0) {
            // Se apenas clicou na régua sem arrastar para dentro da folha, coloca na margem esquerda
            setVerticalGuides((prev) =>
              prev.map((g, i) => (i === draggingGuide.index ? Math.round(margins.left) : g))
            )
          } else if (rawX < 0 || rawX > pageSize.width) {
            // Se soltou fora da folha ou de volta na régua, remove a guia
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
    template.page.forEach((element) => {
      const x = element.x
      const y = element.y
      const width = element.width
      const height = element.height

      // Ignore elements without defined position/size
      if (x === undefined || y === undefined) return

      // Check left margin
      if (Math.abs(x - margins.left) <= snapTolerance) {
        snapped.left = true
      }

      // Check right margin (only if width is set and is a number)
      if (typeof width === 'number' && Math.abs((x + width) - (pageSize.width - margins.right)) <= snapTolerance) {
        snapped.right = true
      }

      // Check top margin
      if (Math.abs(y - margins.top) <= snapTolerance) {
        snapped.top = true
      }

      // Check bottom margin (only if height is set and is a number)
      if (typeof height === 'number' && Math.abs((y + height) - (pageSize.height - margins.bottom)) <= snapTolerance) {
        snapped.bottom = true
      }
    })

    return snapped
  }

  const marginSnap = checkMarginSnap()

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(200, prev + 25))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(25, prev - 25))
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
        title="Arraste para baixo para criar uma nova linha guia horizontal"
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
          title="Arraste para a direita para criar uma nova linha guia vertical"
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
        <div id="canvas-scroll-container" className="flex-1 overflow-auto p-8 bg-slate-950/80">
          <div className="inline-block min-w-full min-h-full">
        {/* Wrapper que define o tamanho real para scroll funcionar com zoom */}
        <div 
          className="flex justify-center items-start min-w-max"
          style={{ 
            minWidth: pageSize.width * scale + 100, // +100 para labels laterais
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
                  height: pageSize.height,
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
                        allElements={template.pageSettings.bodyBackground?.elements ?? []}
                        onUpdateMultiple={() => {}}
                        updateElement={updateElement}
                      />
                    ))}
                </div>

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
                    y1={pageSize.height - margins.bottom}
                    x2={pageSize.width}
                    y2={pageSize.height - margins.bottom}
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
                    y2={pageSize.height}
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
                    y2={pageSize.height}
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
                    y={pageSize.height - margins.bottom + 15}
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
                  height: pageSize.height,
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
                      allElements={template.summaryPage?.background?.elements ?? []}
                      onUpdateMultiple={() => {}}
                      updateElement={updateElement}
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
                  {template.summaryPage.elements
                    .filter((element) => !element.hidden)
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
                        allElements={template.summaryPage?.elements ?? []}
                        onUpdateMultiple={() => {}}
                        updateElement={updateElement}
                      />
                    ))}
                </div>

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
                    y1={pageSize.height - margins.bottom}
                    x2={pageSize.width}
                    y2={pageSize.height - margins.bottom}
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
                    y2={pageSize.height}
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
                    y2={pageSize.height}
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
                    y={pageSize.height - margins.bottom + 15}
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
                const bodyCenter = bodyTop + (bodyBottom - bodyTop) / 2
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
                top: pageSize.height - margins.bottom - template.pageSettings.footer.height + (template.pageSettings.footer.height / 2),
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
              height: pageSize.height,
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
              {template.pageSettings.header.elements
                .filter((element) => !element.hidden)
                .map((element) => (
                  <CanvasElement
                    key={element.id}
                    element={element}
                    scale={scale}
                    isSelected={selectedElementIds.includes(element.id) && selectedElementLocation === 'header'}
                    onSelect={(ctrlKey) => ctrlKey ? toggleElementSelection(element.id, 'header') : selectElement(element.id, 'header')}
                    onUpdate={(updates) => updateElement(element.id, updates, 'header')}
                        location="header"
                    margins={margins}
                    pageSize={pageSize}
                    selectedElementIds={selectedElementIds}
                    selectedElementLocation={selectedElementLocation}
                    allElements={template.pageSettings.header?.elements ?? []}
                    onUpdateMultiple={() => {}}
                    updateElement={updateElement}
                  />
                ))}
              
              
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
                top: pageSize.height - margins.bottom - template.pageSettings.footer.height,
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
              {template.pageSettings.footer.elements
                .filter((element) => !element.hidden)
                .map((element) => (
                  <CanvasElement
                    key={element.id}
                    element={element}
                    scale={scale}
                    isSelected={selectedElementIds.includes(element.id) && selectedElementLocation === 'footer'}
                    onSelect={(ctrlKey) => ctrlKey ? toggleElementSelection(element.id, 'footer') : selectElement(element.id, 'footer')}
                    onUpdate={(updates) => updateElement(element.id, updates, 'footer')}
                        location="footer"
                    margins={margins}
                    pageSize={pageSize}
                    selectedElementIds={selectedElementIds}
                    selectedElementLocation={selectedElementLocation}
                    allElements={template.pageSettings.footer?.elements ?? []}
                    onUpdateMultiple={() => {}}
                    updateElement={updateElement}
                  />
                ))}
              
              
              {currentSection !== 'footer' && (
                <div className="absolute inset-0 bg-gray-400/30 cursor-not-allowed" style={{ zIndex: 100 }} />
              )}
            </div>
          )}

          {/* Body Section - container com coordenadas relativas */}
          <div
            className={`absolute ${
              currentSection === 'body' ? 'border-2 border-dashed border-gray-400' : ''
            }`}
            style={{
              top: margins.top + (template.pageSettings.header?.height || 0),
              left: margins.left,
              right: margins.right,
              height: pageSize.height - margins.top - margins.bottom - (template.pageSettings.header?.height || 0) - (template.pageSettings.footer?.height || 0),
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
                    const offsetY = typeof element.relativeOffsetY === 'number' ? element.relativeOffsetY : 10
                    if (currentFlowY === 0) {
                      effectiveY = typeof element.y === 'number' && element.y > 0 ? element.y : offsetY
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

                  const elHeight =
                    typeof element.height === 'number'
                      ? element.height
                      : element.type === 'container'
                      ? 150
                      : 25

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
                      allElements={template.page}
                      onUpdateMultiple={() => {}}
                      updateElement={updateElement}
                    />
                  )
                })
            })()}
            
            
            {currentSection !== 'body' && (
              <div className="absolute inset-0 bg-gray-400/30 cursor-not-allowed" style={{ zIndex: 100 }} />
            )}
          </div>

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
                y1={pageSize.height - margins.bottom - template.pageSettings.footer.height}
                x2={pageSize.width}
                y2={pageSize.height - margins.bottom - template.pageSettings.footer.height}
                stroke="#9ca3af"
                strokeWidth="1"
                strokeDasharray="2,2"
                opacity="0.3"
              />
            )}
            
            {/* Margem Inferior */}
              <line
                x1={0}
                y1={pageSize.height - margins.bottom}
                x2={pageSize.width}
                y2={pageSize.height - margins.bottom}
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
              y2={pageSize.height}
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
              y2={pageSize.height}
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
                className="absolute text-xs text-gray-400"
                style={{
                  left: -160,
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
                  className="absolute text-xs text-gray-500"
                  style={{
                    left: -200,
                    top: margins.top + template.pageSettings.header.height,
                    transform: 'translateY(-50%)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Header end: {margins.top + template.pageSettings.header.height}pt
                </div>
              )}
              
              {/* Label Footer Start */}
              {template.pageSettings.footer && (
                <div
                  className="absolute text-xs text-gray-500"
                  style={{
                    left: -200,
                    top: pageSize.height - margins.bottom - template.pageSettings.footer.height,
                    transform: 'translateY(-50%)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Footer start: {pageSize.height - margins.bottom - template.pageSettings.footer.height}pt
                </div>
              )}
              
              {/* Label Margin Bottom */}
              <div
                className="absolute text-xs text-gray-400"
                style={{
                  left: -160,
                  top: pageSize.height - margins.bottom,
                  transform: 'translateY(-50%)',
                  whiteSpace: 'nowrap',
                }}
              >
                ↓ Margin: {margins.bottom}pt
              </div>
              
              {/* Label Margin Left */}
              <div
                className="absolute text-xs text-blue-600"
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
                className="absolute text-xs text-blue-600"
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
                className="absolute text-xs text-green-500"
                style={{
                  left: -150,
                  top: margins.top,
                  transform: 'translateY(-50%)',
                  whiteSpace: 'nowrap',
                }}
              >
                ↑ Margin: {margins.top}pt
              </div>
              
              {/* Label Margin Bottom */}
              <div
                className="absolute text-xs text-green-500"
                style={{
                  left: -150,
                  top: pageSize.height - margins.bottom,
                  transform: 'translateY(-50%)',
                  whiteSpace: 'nowrap',
                }}
              >
                ↓ Margin: {margins.bottom}pt
              </div>
              
              {/* Label Margin Left */}
              <div
                className="absolute text-xs text-green-500"
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
                className="absolute text-xs text-green-500"
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
            {horizontalGuides.map((yPos, idx) => (
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
                title="Arraste para mover ou clique duplo para remover"
              >
                <div className="h-0.5 bg-cyan-400 shadow-sm shadow-cyan-500/50 relative">
                  <div className={`absolute left-2 -top-5 px-1.5 py-0.5 rounded bg-slate-900 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 transition-opacity ${draggingGuide?.type === 'h' && draggingGuide?.index === idx ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    Y: {Math.round(yPos)}pt
                  </div>
                </div>
              </div>
            ))}

            {/* Guias Verticais */}
            {verticalGuides.map((xPos, idx) => (
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
                title="Arraste para mover ou clique duplo para remover"
              >
                <div className="w-0.5 h-full bg-cyan-400 shadow-sm shadow-cyan-500/50 relative">
                  <div className={`absolute -left-6 top-2 px-1.5 py-0.5 rounded bg-slate-900 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 transition-opacity whitespace-nowrap ${draggingGuide?.type === 'v' && draggingGuide?.index === idx ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    X: {Math.round(xPos)}pt
                  </div>
                </div>
              </div>
            ))}
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

function CanvasElement({ element, effectiveY, effectiveX, effectiveWidth, scale = 1, isSelected, onSelect, onUpdate, margins, pageSize, selectedElementIds, selectedElementLocation, allElements, onUpdateMultiple, updateElement, location }: CanvasElementProps) {
  const template = useTemplateStore(state => state.template)
  const testData = useTemplateStore(state => state.testData)
  const saveSnapshot = useTemplateStore(state => state.saveSnapshot)
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

  
  const applySnapToMargins = (x: number, y: number, width: number = 0, height: number = 0) => {
    const snapTolerance = 8 
    let snappedX = x
    let snappedY = y

    // Snap na margem esquerda
    if (Math.abs(x - margins.left) <= snapTolerance) {
      snappedX = margins.left
    }

    // Snap na margem direita (considerando a largura do elemento)
    if (Math.abs((x + width) - (pageSize.width - margins.right)) <= snapTolerance) {
      snappedX = pageSize.width - margins.right - width
    }

    // Snap na margem superior
    if (Math.abs(y - margins.top) <= snapTolerance) {
      snappedY = margins.top
    }

    // Snap na margem inferior (considerando a altura do elemento)
    if (Math.abs((y + height) - (pageSize.height - margins.bottom)) <= snapTolerance) {
      snappedY = pageSize.height - margins.bottom - height
    }

    return { x: snappedX, y: snappedY }
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
    
    
    if (e.ctrlKey || e.metaKey) {
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
      initialOffsetY: typeof element.relativeOffsetY === 'number' ? element.relativeOffsetY : 10
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
        // Mover todos os elementos selecionados juntos
        Object.keys(dragStart.initialPositions).forEach(id => {
          const initialPos = dragStart.initialPositions[id]
          const newX = initialPos.x + deltaX
          const newY = initialPos.y + deltaY
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
          const width = typeof element.width === 'number' ? element.width : 0
          const height = typeof element.height === 'number' ? element.height : 0
          const snapped = applySnapToMargins(newX, newY, width, height)
          if (element.width !== '100%') newX = snapped.x
          if (element.height !== '100%') newY = snapped.y
        }
        
        const isRelative = (element.positionMode || element.position || '').toUpperCase() === 'RELATIVE'
        if (isRelative && effectiveY !== undefined) {
          const newOffset = Math.max(0, dragStart.initialOffsetY + deltaY)
          onUpdate({ x: newX, y: newY, relativeOffsetY: newOffset })
        } else {
          onUpdate({ x: newX, y: newY })
        }
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      saveSnapshot() // Save to history after moving
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragStart, scale, onUpdate, isMultiSelection, selectedElementLocation, element.id, element.width, element.height, saveSnapshot])

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: globalThis.MouseEvent): void => {
      const currentScale = scale || 1
      const deltaX = (e.clientX - resizeStart.x) / currentScale
      const deltaY = (e.clientY - resizeStart.y) / currentScale
      
      const updates: Partial<Element> = {}

      switch (isResizing) {
        // Cantos
        case 'nw': // Northwest (top-left)
          updates.x = resizeStart.elementX + deltaX
          updates.y = resizeStart.elementY + deltaY
          updates.width = Math.max(10, resizeStart.elementWidth - deltaX)
          updates.height = Math.max(10, resizeStart.elementHeight - deltaY)
          break
        case 'ne': // Northeast (top-right)
          updates.y = resizeStart.elementY + deltaY
          updates.width = Math.max(10, resizeStart.elementWidth + deltaX)
          updates.height = Math.max(10, resizeStart.elementHeight - deltaY)
          break
        case 'sw': // Southwest (bottom-left)
          updates.x = resizeStart.elementX + deltaX
          updates.width = Math.max(10, resizeStart.elementWidth - deltaX)
          updates.height = Math.max(10, resizeStart.elementHeight + deltaY)
          break
        case 'se': // Southeast (bottom-right)
          updates.width = Math.max(10, resizeStart.elementWidth + deltaX)
          updates.height = Math.max(10, resizeStart.elementHeight + deltaY)
          break
        
        // Bordas
        case 'n': // North (top)
          updates.y = resizeStart.elementY + deltaY
          updates.height = Math.max(10, resizeStart.elementHeight - deltaY)
          break
        case 's': // South (bottom)
          updates.height = Math.max(10, resizeStart.elementHeight + deltaY)
          break
        case 'w': // West (left)
          updates.x = resizeStart.elementX + deltaX
          updates.width = Math.max(10, resizeStart.elementWidth - deltaX)
          break
        case 'e': // East (right)
          updates.width = Math.max(10, resizeStart.elementWidth + deltaX)
          break
      }

      onUpdate(updates)
    }

    const handleMouseUp = () => {
      setIsResizing(null)
      saveSnapshot() // Save to history after resizing
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, resizeStart, scale, onUpdate, saveSnapshot])

  const renderElement = () => {
    switch (element.type) {
      case 'text':
      case 'static_text':
      case 'rich_text':
      case 'link': {
        // Mapear verticalAlignment para CSS
        const getVerticalAlign = (vAlign: string | undefined) => {
          switch (vAlign) {
            case 'top': return 'flex-start'
            case 'bottom': return 'flex-end'
            case 'center':
            default: return 'center'
          }
        }

        // Mapear alignment horizontal para justifyContent
        const getHorizontalAlign = (hAlign: string | undefined) => {
          switch (hAlign) {
            case 'center': return 'center'
            case 'right': return 'flex-end'
            case 'justify': return 'space-between'
            case 'left':
            default: return 'flex-start'
          }
        }

        // Mapear alignment horizontal para textAlign (para textos multilinha)
        const getTextAlign = (hAlign: string | undefined) => {
          switch (hAlign) {
            case 'center': return 'center'
            case 'right': return 'right'
            case 'justify': return 'justify'
            case 'left':
            default: return 'left'
          }
        }

        const isMultiline = element.style?.multiline === true
        const firstLineIndent = element.style?.firstLineIndent || 0

        // Bordas e padding
        const textBorderWidth = element.style?.borderWidth ?? 0
        const textBorderColor = element.style?.borderColor || '#000000'
        const textBorderStyle = element.style?.borderStyle || 'solid'
        const textBgColor = element.style?.backgroundColor || 'transparent'

        const isElRelative = (element.positionMode || element.position || '').toUpperCase() === 'RELATIVE'
        const resolvedElWidth = (isElRelative && effectiveWidth !== undefined) ? effectiveWidth : (element.width || 'auto')
        const textStyles: CSSProperties = {
          width: resolvedElWidth,
          height: element.height || 'auto',
          fontSize: element.style?.fontSize || 12,
          fontWeight: element.style?.fontWeight || 'normal',
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

      case 'image':
        return (
          <div
            className={`cursor-move select-none border-2 border-dashed border-gray-400 flex items-center justify-center ${
              isSelected ? 'ring-2 ring-primary-500' : ''
            }`}
            style={{
              width: element.width,
              height: element.height,
            }}
            onMouseDown={handleMouseDown}
          >
            {element.source ? (
              <img src={element.source} alt="" className="max-w-full max-h-full pointer-events-none" />
            ) : (
              <span className="text-gray-400 text-sm">🖼️ Image</span>
            )}
          </div>
        )

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
        const barcodeType = element.barcodeType || 'qrcode'
        
        
        const barcodeBinding = element.dataBinding || element.value || 'Sem dados'
        
        return (
          <div
            className={`cursor-move select-none border-2 border-dashed border-gray-400 flex flex-col items-center justify-center bg-white ${
              isSelected ? 'ring-2 ring-primary-500' : ''
            }`}
            style={{
              width: element.width || 100,
              height: element.height || 100,
            }}
            onMouseDown={handleMouseDown}
          >
            <div className="text-3xl mb-1">
              {barcodeType === 'qrcode' ? '⊞' : '|||'}
            </div>
            <span className="text-gray-500 text-xs text-center px-2 break-all">
              {barcodeType === 'qrcode' ? 'QR Code' : 'Barcode'}
            </span>
            <span className="text-gray-400 text-xs text-center px-1 break-all mt-1 max-w-full overflow-hidden">
              {element.dataBinding ? `{${element.dataBinding}}` : barcodeBinding}
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
        
        return (
          <div
            className={`cursor-move select-none relative ${
              isSelected ? 'ring-2 ring-primary-500' : ''
            }`}
            style={{
              width: loopWidth,
              height: loopHeight,
              backgroundColor:
                (element.style?.fillColor || element.style?.backgroundColor) === 'transparent'
                  ? 'transparent'
                  : (element.style?.fillColor || element.style?.backgroundColor || 'transparent'),
              borderWidth: element.style?.borderStyle === 'none' ? 0 : (element.style?.borderWidth ?? element.style?.strokeWidth ?? 2),
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
                    <div className="text-primary-400 text-[10px] font-medium">Adicione elementos</div>
                    <div className="text-primary-300 text-[9px]">via sidebar</div>
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
                      loopWidth={loopWidth}
                      loopHeight={loopHeight}
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
              const containerHeight = typeof element.height === 'number' ? element.height : 150

              return (
                <div
                  className={`cursor-move select-none relative ${
                    isSelected ? 'ring-2 ring-primary-500' : ''
                  }`}
                  style={{
                    width: containerWidth,
                    height: containerHeight,
                    backgroundColor:
                      (element.style?.fillColor || element.style?.backgroundColor) === 'transparent'
                        ? 'transparent'
                        : (element.style?.fillColor || element.style?.backgroundColor || 'transparent'),
                    borderWidth: element.style?.borderStyle === 'none' ? 0 : (element.style?.borderWidth ?? element.style?.strokeWidth ?? 2),
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

                  <div className="relative w-full h-full">
                    {containerElements.length === 0 ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center p-3 border-2 border-dashed border-primary-200 rounded-lg bg-primary-50/50">
                          <div className="text-primary-400 text-[10px] font-medium">Adicione elementos <span className="text-primary-300 text-[9px]">via sidebar</span></div>
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
                              const offset = typeof child.relativeOffsetY === 'number' ? child.relativeOffsetY : 10
                              if (containerFlowY === 0) {
                                effectiveChildY = typeof child.y === 'number' && child.y > 0 ? child.y : offset
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

                            const chHeight = typeof child.height === 'number' ? child.height : 25
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
                                containerWidth={containerWidth}
                                containerHeight={containerHeight}
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
        left: effectiveX !== undefined ? effectiveX : element.x,
        top: effectiveY !== undefined ? effectiveY : element.y,
        ...(effectiveWidth !== undefined && element.width === undefined ? { width: effectiveWidth } : {}),
      }}
    >
      <div ref={elementWrapperRef} className="relative">
        {renderElement()}
        {renderResizeHandles()}
        
        
        {elementGroup && (
          <div
            className="absolute -top-1 -right-1 z-20 pointer-events-none"
            title={`Group: ${elementGroup.name}${elementGroup.printCondition ? `\nCondition: ${elementGroup.printCondition}` : ''}`}
          >
            <div className="bg-purple-500 text-white p-1 rounded-full shadow-lg">
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
