import React from 'react'
import { useTemplateStore, type Element } from '../../../store/templateStore'
import { resolveChildDisplayText } from './childDisplayText'
import { ContainerChildTableRenderer } from '../elements/ContainerChildTableRenderer'
import { ListElementRenderer } from '../elements/ListElementRenderer'

export interface LoopChildRendererProps {
  child: Element
  loopId: string
  loopWidth: number
  loopHeight: number
  resolveWidth: (value: string | number | undefined) => number
  resolveHeight: (value: string | number | undefined) => number
}

export function LoopChildRenderer({
  child,
  loopId,
  loopWidth,
  loopHeight,
  resolveWidth,
  resolveHeight,
}: LoopChildRendererProps) {
  const testData = useTemplateStore((state) => state.testData)

  switch (child.type) {
    case 'text':
    case 'static_text':
    case 'rich_text':
    case 'link': {
      const displayText = resolveChildDisplayText(
        child,
        loopId,
        testData,
        child.type === 'text' ? 'campo' : 'Texto'
      )
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
    case 'table':
      return <ContainerChildTableRenderer child={child} containerWidth={loopWidth} />
    case 'list':
    case 'check_list': {
      const listW = child.width ? resolveWidth(child.width) : undefined
      const listH = child.height ? resolveHeight(child.height) : undefined
      return (
        <ListElementRenderer
          element={{
            ...child,
            width: listW ?? child.width,
            height: listH ?? child.height,
          }}
          effectiveWidth={listW}
          isSelected={false}
          testData={testData}
          onMouseDown={() => {}}
        />
      )
    }
    case 'container': {
      const contW = resolveWidth(child.width || '100%')
      const contH = resolveHeight(child.height || 60)
      return (
        <div
          className="border border-dashed border-gray-400 bg-gray-50/50"
          style={{ width: contW, height: contH }}
        />
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
