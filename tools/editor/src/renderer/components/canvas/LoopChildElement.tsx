import React, { type MouseEvent as ReactMouseEvent } from 'react'
import { useTemplateStore } from '../../store/templateStore'
import { useUIStore } from '../../store/uiStore'
import { processExpression, hasTransformations } from '../../utils/expressionProcessor'
import type { LoopChildElementProps } from './types'
import { useLoopChildDrag } from './useLoopChildDrag'
import { useLoopChildResize } from './useLoopChildResize'

export function LoopChildElement({
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
    testData,
  } = useTemplateStore()
  const snapToGuides = useUIStore((state) => state.snapToGuides)

  const isSelected =
    (selectedLoopParentId === loopId && selectedLoopChildId === child.id) ||
    selectedElementIds.includes(child.id)

  const resolveChildDisplayText = (
    el: { value?: string; dataBinding?: string },
    fallback: string = ''
  ): string => {
    if (el.value) return el.value
    if (el.dataBinding) {
      if (testData && Object.keys(testData).length > 0) {
        return resolveBindingWithLoopData(el.dataBinding)
      }
      return `{${el.dataBinding}}`
    }
    return fallback
  }

  const resolveBindingWithLoopData = (fieldName: string): string => {
    if (!testData || typeof testData !== 'object') {
      return `{${fieldName}}`
    }

    if (fieldName in testData) {
      const directVal = (testData as Record<string, unknown>)[fieldName]
      if (directVal !== null && directVal !== undefined) return String(directVal)
    }

    const { template } = useTemplateStore.getState()
    const loopElement = template.page
      .concat(template.pageSettings.header?.elements || [])
      .concat(template.pageSettings.footer?.elements || [])
      .find((el) => el.id === loopId)

    if (loopElement && loopElement.dataBinding) {
      const loopBinding = loopElement.dataBinding
      const parts = loopBinding.split('.')
      let arrayData: unknown = testData

      for (const part of parts) {
        if (arrayData && typeof arrayData === 'object' && part in arrayData) {
          arrayData = (arrayData as Record<string, unknown>)[part]
        } else {
          arrayData = null
          break
        }
      }

      if (Array.isArray(arrayData) && arrayData.length > 0) {
        const firstItem = arrayData[0]

        if (hasTransformations(fieldName)) {
          const result = processExpression(fieldName, firstItem as Record<string, unknown>)
          if (result) return result
        }

        if (firstItem && typeof firstItem === 'object' && fieldName in firstItem) {
          const directValue = (firstItem as Record<string, unknown>)[fieldName]
          if (directValue !== null && directValue !== undefined) {
            return String(directValue)
          }
        }

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

    return `{${fieldName}}`
  }

  const resolveWidth = (value: string | number | undefined): number => {
    if (value === '100%') return loopWidth
    if (typeof value === 'number') return value
    return 100
  }

  const resolveHeight = (value: string | number | undefined): number => {
    if (value === '100%') return loopHeight
    if (typeof value === 'number') return value
    return 20
  }

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

  const renderContent = () => {
    switch (child.type) {
      case 'text':
      case 'static_text':
      case 'rich_text':
      case 'link': {
        const displayText = resolveChildDisplayText(child, child.type === 'text' ? 'campo' : 'Texto')
        return (
          <div
            style={{
              fontSize: child.style?.fontSize || 10,
              fontFamily: child.style?.fontFamily || 'Helvetica',
              color: child.style?.color || '#000000',
              fontWeight: child.style?.fontWeight || 'normal',
              textDecoration: child.type === 'link' ? 'underline' : 'none',
              width: child.width ? resolveWidth(child.width) : 'auto',
              height: child.height ? resolveHeight(child.height) : 'auto',
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
            style={{ width: imgWidth, height: imgHeight }}
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
              borderBottom: '2px dashed #9ca3af',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                background: 'white',
                padding: '0 8px',
                color: '#6b7280',
                fontSize: '10px',
                fontFamily: 'monospace',
              }}
            >
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
              backgroundColor: child.style?.fillColor || '#e5e7eb',
              borderWidth: child.style?.borderWidth || 1,
              borderColor: child.style?.borderColor || '#9ca3af',
              borderStyle: (child.style?.borderStyle as string) || 'solid',
              borderRadius: child.style?.cornerRadius || 0,
            }}
          />
        )
      }
      case 'line': {
        const lineElWidth = resolveWidth(child.width ?? 100)
        const lineElHeight = resolveHeight(child.height ?? 0)
        const lineStrokeWidth = child.style?.strokeWidth || 1
        const svgElWidth = Math.max(Math.abs(lineElWidth), lineStrokeWidth)
        const svgElHeight = Math.max(Math.abs(lineElHeight), lineStrokeWidth)
        const strokeOffset = lineStrokeWidth / 2

        const lineX1 = lineElWidth >= 0 ? strokeOffset : svgElWidth - strokeOffset
        const lineY1 = lineElHeight >= 0 ? strokeOffset : svgElHeight - strokeOffset
        const lineX2 = lineElWidth >= 0 ? svgElWidth - strokeOffset : strokeOffset
        const lineY2 = lineElHeight >= 0 ? svgElHeight - strokeOffset : strokeOffset

        return (
          <svg
            style={{
              width: svgElWidth,
              height: svgElHeight,
              marginLeft: lineElHeight === 0 ? 0 : -strokeOffset,
              marginTop: lineElWidth === 0 ? 0 : -strokeOffset,
            }}
          >
            <line
              x1={lineX1}
              y1={lineY1}
              x2={lineX2}
              y2={lineY2}
              stroke={child.style?.strokeColor || '#000000'}
              strokeWidth={lineStrokeWidth}
            />
          </svg>
        )
      }
      case 'barcode': {
        const barcodeType = ((child.barcodeType as string) || 'qrcode').toLowerCase()
        const is2D =
          barcodeType === 'qrcode' ||
          barcodeType === 'qr_code' ||
          barcodeType === 'datamatrix' ||
          barcodeType === 'data_matrix'
        const barcodeBinding =
          (child.value as string) ||
          (child.dataBinding as string) ||
          (is2D ? 'https://openpdf.dev' : '123456789012')

        return (
          <div
            className="border border-dashed border-slate-400 flex flex-col items-center justify-center bg-white p-1 overflow-hidden"
            style={{
              width: resolveWidth(child.width || (is2D ? 80 : 120)),
              height: resolveHeight(child.height || (is2D ? 80 : 40)),
            }}
          >
            {is2D ? (
              <svg className="w-3/5 h-3/5 text-slate-900 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3h7v7H3V3zm2 2v3h3V5H5zm9-2h7v7h-7V3zm2 2v3h3V5h-3zM3 14h7v7H3v-7zm2 2v3h3v-3H5zm9-2h3v3h-3v-3zm4 0h3v3h-3v-3zm-2 3h2v2h-2v-2zm-2 2h3v2h-3v-2zm4 0h3v2h-3v-2z" />
              </svg>
            ) : (
              <svg
                className="w-4/5 h-3/5 text-slate-900 shrink-0"
                viewBox="0 0 48 20"
                fill="currentColor"
                preserveAspectRatio="none"
              >
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
            <span className="text-[8px] font-mono text-slate-600 text-center truncate w-full px-0.5 mt-0.5 leading-tight">
              {barcodeBinding}
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
        left: child.width === '100%' ? 0 : effectiveX !== undefined ? effectiveX : child.x || 0,
        top: child.height === '100%' ? 0 : effectiveY !== undefined ? effectiveY : child.y || 0,
        ...(child.width === '100%'
          ? { width: '100%' }
          : typeof child.width === 'number'
            ? { width: child.width }
            : (effectiveWidth !== undefined ? { width: effectiveWidth } : {})),
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
      }}
    >
      {renderContent()}
      {isSelected && (
        <>
          <div className="absolute -top-4 left-0 text-[9px] bg-purple-500 text-white px-1 rounded z-30">
            {child.type}
          </div>
          <div
            className="absolute -right-1 -bottom-1 w-2.5 h-2.5 bg-white border-2 border-purple-500 rounded-full cursor-se-resize z-40"
            onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
          />
          <div
            className="absolute -right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border-2 border-purple-500 rounded-full cursor-e-resize z-40"
            onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
          />
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-2 border-purple-500 rounded-full cursor-s-resize z-40"
            onMouseDown={(e) => handleResizeMouseDown(e, 's')}
          />
        </>
      )}
    </div>
  )
}
