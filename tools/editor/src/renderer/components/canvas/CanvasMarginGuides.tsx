import React from 'react'

interface CanvasMarginGuidesProps {
  pageSize: { width: number; height: number }
  margins: { top: number; right: number; bottom: number; left: number }
  totalCanvasHeight: number
  headerConfig?: { height: number }
  footerConfig?: { height: number }
  marginSnap: { top: boolean; right: boolean; bottom: boolean; left: boolean }
  numberOfPages?: number
  bodyUsableHeight?: number
  isSummary?: boolean
  pageLabel?: string
  headerEndLabel?: string
  footerStartLabel?: string
}

export function CanvasMarginGuides({
  pageSize,
  margins,
  totalCanvasHeight,
  headerConfig,
  footerConfig,
  marginSnap,
  numberOfPages = 1,
  bodyUsableHeight = 0,
  isSummary = false,
  pageLabel = 'Page',
  headerEndLabel = 'Header End',
  footerStartLabel = 'Footer Start',
}: CanvasMarginGuidesProps) {
  const headerHeight = headerConfig?.height || 0

  return (
    <>
      {/* Page Separators */}
      {numberOfPages > 1 &&
        Array.from({ length: numberOfPages - 1 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-full pointer-events-none"
            style={{
              top: margins.top + headerHeight + (i + 1) * bodyUsableHeight,
              left: 0,
              borderTop: '2px dashed #cbd5e1',
              zIndex: 5,
            }}
          >
            <span className="absolute right-2 -top-3 bg-slate-100 text-slate-400 text-[10px] px-2 rounded-full border border-slate-200">
              {pageLabel} {i + 2}
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
          stroke={marginSnap.top ? '#10b981' : '#3b82f6'}
          strokeWidth={marginSnap.top ? '2' : '1'}
          strokeDasharray="5,5"
          opacity={marginSnap.top ? '0.8' : '0.5'}
        />

        {/* Linha do fim do Header */}
        {!isSummary && headerConfig && (
          <line
            x1={0}
            y1={margins.top + headerConfig.height}
            x2={pageSize.width}
            y2={margins.top + headerConfig.height}
            stroke="#9ca3af"
            strokeWidth="1"
            strokeDasharray="2,2"
            opacity="0.3"
          />
        )}

        {/* Linha do início do Footer */}
        {!isSummary && footerConfig && (
          <line
            x1={0}
            y1={totalCanvasHeight - margins.bottom - footerConfig.height}
            x2={pageSize.width}
            y2={totalCanvasHeight - margins.bottom - footerConfig.height}
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
          stroke={marginSnap.bottom ? '#10b981' : '#3b82f6'}
          strokeWidth={marginSnap.bottom ? '2' : '1'}
          strokeDasharray="5,5"
          opacity={marginSnap.bottom ? '0.8' : '0.5'}
        />

        {/* Margem Esquerda */}
        <line
          x1={margins.left}
          y1={0}
          x2={margins.left}
          y2={totalCanvasHeight}
          stroke={marginSnap.left ? '#10b981' : '#3b82f6'}
          strokeWidth={marginSnap.left ? '2' : '1'}
          strokeDasharray="5,5"
          opacity={marginSnap.left ? '0.8' : '0.5'}
        />

        {/* Margem Direita */}
        <line
          x1={pageSize.width - margins.right}
          y1={0}
          x2={pageSize.width - margins.right}
          y2={totalCanvasHeight}
          stroke={marginSnap.right ? '#10b981' : '#3b82f6'}
          strokeWidth={marginSnap.right ? '2' : '1'}
          strokeDasharray="5,5"
          opacity={marginSnap.right ? '0.8' : '0.5'}
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

      {/* Labels de margens e limites */}
      {!isSummary ? (
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
          {headerConfig && (
            <div
              className="absolute text-xs text-gray-500 select-none pointer-events-none"
              style={{
                left: pageSize.width + 10,
                top: margins.top + headerConfig.height,
                transform: 'translateY(-50%)',
                whiteSpace: 'nowrap',
              }}
            >
              {headerEndLabel}: {margins.top + headerConfig.height}pt
            </div>
          )}

          {/* Label Footer Start */}
          {footerConfig && (
            <div
              className="absolute text-xs text-gray-500 select-none pointer-events-none"
              style={{
                left: pageSize.width + 10,
                top: totalCanvasHeight - margins.bottom - footerConfig.height,
                transform: 'translateY(-50%)',
                whiteSpace: 'nowrap',
              }}
            >
              {footerStartLabel}: {totalCanvasHeight - margins.bottom - footerConfig.height}pt
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
      ) : (
        <>
          {/* Labels para Summary Page */}
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
    </>
  )
}
