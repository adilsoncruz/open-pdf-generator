import React, { type MouseEvent as ReactMouseEvent } from 'react'

interface CanvasRulersProps {
  onRulerMouseDownH: (e: ReactMouseEvent) => void
  onRulerMouseDownV: (e: ReactMouseEvent) => void
  dragHorizontalGuideTooltip?: string
  dragVerticalGuideTooltip?: string
  children: React.ReactNode
}

export function CanvasRulers({
  onRulerMouseDownH,
  onRulerMouseDownV,
  dragHorizontalGuideTooltip,
  dragVerticalGuideTooltip,
  children,
}: CanvasRulersProps) {
  return (
    <>
      {/* RÉGUA SUPERIOR (HORIZONTAL RULER) */}
      <div
        className="h-6 bg-slate-950 border-b border-slate-800 flex items-center relative overflow-hidden select-none cursor-row-resize text-slate-400 pl-6 z-20 shrink-0 hover:bg-slate-900 transition-colors"
        onMouseDown={onRulerMouseDownH}
        title={dragHorizontalGuideTooltip}
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
          onMouseDown={onRulerMouseDownV}
          title={dragVerticalGuideTooltip}
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

        {children}
      </div>
    </>
  )
}
