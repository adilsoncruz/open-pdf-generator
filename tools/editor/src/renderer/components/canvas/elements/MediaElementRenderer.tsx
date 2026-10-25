import React, { type MouseEvent as ReactMouseEvent } from 'react'
import type { Element } from '../../../store/templateStore'

interface MediaElementRendererProps {
  element: Element
  isSelected: boolean
  onMouseDown: (e: ReactMouseEvent) => void
}

export function MediaElementRenderer({
  element,
  isSelected,
  onMouseDown,
}: MediaElementRendererProps) {
  if (element.type === 'image') {
    const imageSource = element.source || element.url || element.value
    return (
      <div
        className={`cursor-move select-none border-2 border-dashed border-gray-400 flex items-center overflow-hidden ${
          element.alignment === 'left'
            ? 'justify-start'
            : element.alignment === 'right'
            ? 'justify-end'
            : 'justify-center'
        } ${isSelected ? 'ring-2 ring-primary-500' : ''}`}
        style={{
          width: element.width,
          height: element.height,
        }}
        onMouseDown={onMouseDown}
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

  if (element.type === 'barcode') {
    const barcodeType = ((element.barcodeType as string) || 'qrcode').toLowerCase()
    const is2D =
      barcodeType === 'qrcode' ||
      barcodeType === 'qr_code' ||
      barcodeType === 'datamatrix' ||
      barcodeType === 'data_matrix'
    const barcodeBinding =
      (element.value as string) ||
      (element.dataBinding as string) ||
      (is2D ? 'https://openpdf.dev' : '123456789012')

    return (
      <div
        className={`cursor-move select-none border border-dashed border-slate-400 flex flex-col items-center justify-center bg-white p-1.5 overflow-hidden ${
          isSelected ? 'ring-2 ring-primary-500' : ''
        }`}
        style={{
          width: element.width || (is2D ? 100 : 140),
          height: element.height || (is2D ? 100 : 50),
        }}
        onMouseDown={onMouseDown}
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
        <span className="text-[9px] font-mono text-slate-600 text-center truncate w-full px-1 mt-0.5 leading-tight">
          {barcodeBinding}
        </span>
      </div>
    )
  }

  return null
}
