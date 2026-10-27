import React from 'react'
import type { MarginLinesOverlayProps } from './types'

export function MarginLinesOverlay({
  pageSize,
  margins,
  totalCanvasHeight,
  headerConfig,
  footerConfig,
  marginSnap,
  isSummary = false,
}: MarginLinesOverlayProps) {
  return (
    <svg
      data-testid="margin-lines-overlay"
      className="absolute inset-0 pointer-events-none"
      width="100%"
      height="100%"
      style={{ zIndex: 5 }}
    >
      {/* Margem Superior */}
      <line
        data-testid="margin-line-top"
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
          data-testid="header-end-line"
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
          data-testid="footer-start-line"
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
        data-testid="margin-line-bottom"
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
        data-testid="margin-line-left"
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
        data-testid="margin-line-right"
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
  )
}
