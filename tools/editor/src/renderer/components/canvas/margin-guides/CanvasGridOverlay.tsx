import React from 'react'
import type { CanvasGridOverlayProps } from './types'

export function CanvasGridOverlay({
  gridSize = 50,
  patternId = 'grid',
}: CanvasGridOverlayProps) {
  return (
    <svg
      data-testid="canvas-grid-overlay"
      className="absolute inset-0 pointer-events-none opacity-20"
      width="100%"
      height="100%"
    >
      <defs>
        <pattern
          id={patternId}
          width={gridSize}
          height={gridSize}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
            fill="none"
            stroke="gray"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  )
}
