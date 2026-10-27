import React from 'react'
import {
  useTemplateStore,
  type Element,
} from '../../store/templateStore'
import { useUIStore } from '../../store/uiStore'
import { processExpression, hasTransformations } from '../../utils/expressionProcessor'
import { useTranslation } from '../../i18n'
import type { ContainerChildElementProps } from './types'
import { LoopChildElement } from './LoopChildElement'
import { useContainerChildDrag } from './useContainerChildDrag'
import { useContainerChildResize } from './useContainerChildResize'
import { ContainerChildTableRenderer } from './elements/ContainerChildTableRenderer'

export function ContainerChildElement({
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
  } = useTemplateStore()
  const snapToGuides = useUIStore((state) => state.snapToGuides)

  const isSelected =
    (selectedContainerParentId === containerId && selectedContainerChildId === child.id) ||
    selectedElementIds.includes(child.id)

  const resolveChildDisplayText = (
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
          if (value !== null && value !== undefined) {
            return String(value)
          }
        }
      }
      return `{${el.dataBinding}}`
    }
    return fallback
  }

  const resolveWidth = (value: string | number | undefined): number => {
    if (value === '100%') return containerWidth
    if (typeof value === 'number') return value
    return 100
  }

  const resolveHeight = (value: string | number | undefined): number => {
    if (value === '100%') return containerHeight
    if (typeof value === 'number') return value
    return 20
  }

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

  const renderContent = () => {
    switch (child.type) {
      case 'text':
      case 'static_text':
      case 'rich_text':
      case 'link': {
        const isChildRelative =
          (child.positionMode || child.position || '').toUpperCase() === 'RELATIVE'
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
              textDecoration: child.type === 'link' ? 'underline' : 'none',
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
      case 'loop': {
        const loopElements = child.elements || []
        const loopWidth = resolveWidth(child.width || '100%')
        const loopHeight = resolveHeight(child.height || 100)
        const loopBorderWidth =
          child.style?.borderStyle === 'none'
            ? 0
            : (child.style?.borderWidth ?? child.style?.strokeWidth ?? 1)

        return (
          <div
            className="cursor-move select-none relative"
            style={{
              width: loopWidth,
              height: loopHeight,
              backgroundColor:
                (child.style?.fillColor || child.style?.backgroundColor) === 'transparent'
                  ? 'transparent'
                  : child.style?.fillColor || child.style?.backgroundColor || 'transparent',
              borderWidth: loopBorderWidth,
              borderStyle: (child.style?.borderStyle as string) || 'dashed',
              borderColor: child.style?.borderColor || child.style?.strokeColor || '#8b5cf6',
              borderRadius: child.style?.cornerRadius ?? 4,
            }}
          >
            <div className="relative w-full h-full">
              {loopElements.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-2 border border-dashed border-purple-200 rounded bg-purple-50/50">
                    <div className="text-purple-400 text-[9px] font-medium">{t.canvas.addElements}</div>
                  </div>
                </div>
              ) : (
                (() => {
                  let loopFlowY = 0
                  let lastChildX: number | undefined = undefined
                  let lastChildWidth: number | string | undefined = undefined

                  return loopElements.map((childLoop: Element) => {
                    const isRelative =
                      ((childLoop.positionMode || childLoop.position || '') as string).toUpperCase() === 'RELATIVE'
                    let effectiveChildY: number | undefined = undefined
                    let effectiveChildX: number | undefined = undefined
                    let effectiveChildWidth: number | string | undefined = undefined

                    if (isRelative) {
                      const isChildHeightFull = childLoop.height === '100%'
                      const offset = isChildHeightFull ? 0 : (typeof childLoop.relativeOffsetY === 'number' ? childLoop.relativeOffsetY : 0)
                      if (loopFlowY === 0) {
                        effectiveChildY = isChildHeightFull ? 0 : (typeof childLoop.y === 'number' && childLoop.y > 0 ? childLoop.y : offset)
                      } else {
                        effectiveChildY = loopFlowY + offset
                        if (lastChildX !== undefined) {
                          effectiveChildX = lastChildX
                        }
                        if (lastChildWidth !== undefined) {
                          effectiveChildWidth = lastChildWidth
                        }
                      }
                    }

                    const chHeight = typeof childLoop.height === 'number' ? childLoop.height : 25
                    if (isRelative && effectiveChildY !== undefined) {
                      loopFlowY = effectiveChildY + chHeight
                      lastChildX = effectiveChildX !== undefined ? effectiveChildX : childLoop.x
                      lastChildWidth = effectiveChildWidth !== undefined ? effectiveChildWidth : childLoop.width
                    } else {
                      loopFlowY = Math.max(loopFlowY, (childLoop.y || 0) + chHeight)
                      lastChildX = childLoop.x
                      lastChildWidth = childLoop.width
                    }

                    return (
                      <LoopChildElement
                        key={childLoop.id}
                        child={childLoop}
                        loopId={child.id}
                        location={location}
                        effectiveY={effectiveChildY}
                        effectiveX={effectiveChildX}
                        effectiveWidth={effectiveChildWidth}
                        loopWidth={loopWidth}
                        loopHeight={loopHeight}
                        horizontalGuides={horizontalGuides}
                        verticalGuides={verticalGuides}
                        loopPageX={(containerPageX !== undefined ? containerPageX : 0) + (child.x || 0)}
                        loopPageY={(containerPageY !== undefined ? containerPageY : 0) + (child.y || 0)}
                        scale={scale}
                        onSnapGuide={onSnapGuide}
                      />
                    )
                  })
                })()
              )}
            </div>
          </div>
        )
      }
      case 'table':
        return <ContainerChildTableRenderer child={child} containerWidth={containerWidth} />
      case 'barcode': {
        const barcodeType = ((child.barcodeType as string) || 'qrcode').toLowerCase()
        const is2D =
          barcodeType === 'qrcode' ||
          barcodeType === 'qr_code' ||
          barcodeType === 'datamatrix' ||
          barcodeType === 'data_matrix'
        const rawBinding =
          (child.value as string) ||
          (child.dataBinding as string) ||
          (is2D ? 'https://openpdf.dev' : '123456789012')
        const bw = resolveWidth(child.width || (is2D ? 100 : 140))
        const bh = resolveHeight(child.height || (is2D ? 100 : 50))

        return (
          <div
            className="border border-dashed border-slate-400 flex flex-col items-center justify-center bg-white p-1 overflow-hidden"
            style={{ width: bw, height: bh }}
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
        left: child.width === '100%' ? 0 : effectiveX !== undefined ? effectiveX : child.x || 0,
        top: child.height === '100%' ? 0 : effectiveY !== undefined ? effectiveY : child.y || 0,
        ...(child.width === '100%'
          ? { width: '100%' }
          : effectiveWidth !== undefined && !child.width
          ? { width: effectiveWidth }
          : {}),
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
