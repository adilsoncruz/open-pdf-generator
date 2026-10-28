import React from 'react'
import type { MarginLabelsOverlayProps } from './types'

export function MarginLabelsOverlay({
  pageSize,
  margins,
  totalCanvasHeight,
  headerConfig,
  footerConfig,
  isSummary = false,
  headerEndLabel = 'Header End',
  footerStartLabel = 'Footer Start',
}: MarginLabelsOverlayProps) {
  const vColor = isSummary ? 'text-green-500' : 'text-gray-400'
  const hColor = isSummary ? 'text-green-500' : 'text-blue-600'
  const prefix = isSummary ? 'summary' : 'standard'

  return (
    <>
      <div
        data-testid={`${prefix}-label-top`}
        className={`absolute text-xs ${vColor} select-none pointer-events-none`}
        style={{
          left: pageSize.width + 10,
          top: margins.top,
          transform: 'translateY(-50%)',
          whiteSpace: 'nowrap',
        }}
      >
        ↑ Margin: {margins.top}pt
      </div>

      {!isSummary && headerConfig && (
        <div
          data-testid="standard-label-header-end"
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

      {!isSummary && footerConfig && (
        <div
          data-testid="standard-label-footer-start"
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

      <div
        data-testid={`${prefix}-label-bottom`}
        className={`absolute text-xs ${vColor} select-none pointer-events-none`}
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
        data-testid={`${prefix}-label-left`}
        className={`absolute text-xs ${hColor} select-none pointer-events-none`}
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
        data-testid={`${prefix}-label-right`}
        className={`absolute text-xs ${hColor} select-none pointer-events-none`}
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
  )
}
