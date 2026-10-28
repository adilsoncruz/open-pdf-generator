import React from 'react'
import type { SnappedGuides } from './types'

interface CanvasGuidelinesProps {
  pageSize: { width: number; height: number }
  horizontalGuides: number[]
  verticalGuides: number[]
  snappedGuides: SnappedGuides
  draggingGuide: { type: 'h' | 'v'; index: number } | null
  onGuideMouseDown: (type: 'h' | 'v', index: number, e: React.MouseEvent) => void
  onGuideDoubleClick: (type: 'h' | 'v', index: number, e: React.MouseEvent) => void
  tooltip?: string
}

export function CanvasGuidelines({
  pageSize,
  horizontalGuides,
  verticalGuides,
  snappedGuides,
  draggingGuide,
  onGuideMouseDown,
  onGuideDoubleClick,
  tooltip,
}: CanvasGuidelinesProps) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 50, width: pageSize.width, height: pageSize.height }}
    >
      {/* Guias Horizontais */}
      {horizontalGuides.map((yPos, idx) => {
        const isSnapped = snappedGuides.h !== null && Math.abs(snappedGuides.h - yPos) < 1
        return (
          <div
            key={`h-guide-${idx}`}
            className="absolute left-0 right-0 pointer-events-auto cursor-ns-resize group"
            style={{ top: yPos }}
            onMouseDown={(e) => onGuideMouseDown('h', idx, e)}
            onDoubleClick={(e) => onGuideDoubleClick('h', idx, e)}
            title={tooltip}
          >
            <div
              className={`h-0.5 relative transition-colors ${
                isSnapped
                  ? 'bg-emerald-400 shadow-md shadow-emerald-500/80 ring-1 ring-emerald-400'
                  : 'bg-cyan-400 shadow-sm shadow-cyan-500/50'
              }`}
            >
              <div
                className={`absolute left-2 -top-5 px-1.5 py-0.5 rounded bg-slate-900 border text-[10px] font-mono transition-all ${
                  isSnapped
                    ? 'border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30 opacity-100'
                    : 'border-cyan-500/40 text-cyan-300'
                } ${
                  isSnapped || (draggingGuide?.type === 'h' && draggingGuide?.index === idx)
                    ? 'opacity-100'
                    : 'opacity-0 group-hover:opacity-100'
                }`}
              >
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
            onMouseDown={(e) => onGuideMouseDown('v', idx, e)}
            onDoubleClick={(e) => onGuideDoubleClick('v', idx, e)}
            title={tooltip}
          >
            <div
              className={`w-0.5 h-full relative transition-colors ${
                isSnapped
                  ? 'bg-emerald-400 shadow-md shadow-emerald-500/80 ring-1 ring-emerald-400'
                  : 'bg-cyan-400 shadow-sm shadow-cyan-500/50'
              }`}
            >
              <div
                className={`absolute -left-6 top-2 px-1.5 py-0.5 rounded bg-slate-900 border text-[10px] font-mono transition-all whitespace-nowrap ${
                  isSnapped
                    ? 'border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30 opacity-100'
                    : 'border-cyan-500/40 text-cyan-300'
                } ${
                  isSnapped || (draggingGuide?.type === 'v' && draggingGuide?.index === idx)
                    ? 'opacity-100'
                    : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                X: {Math.round(xPos)}pt{isSnapped ? ' 🧲' : ''}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
