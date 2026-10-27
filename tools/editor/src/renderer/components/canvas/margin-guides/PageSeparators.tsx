import React from 'react'
import type { PageSeparatorsProps } from './types'

export function PageSeparators({
  numberOfPages = 1,
  marginTop,
  headerHeight = 0,
  bodyUsableHeight = 0,
  pageLabel = 'Page',
}: PageSeparatorsProps) {
  if (numberOfPages <= 1) {
    return null
  }

  return (
    <>
      {Array.from({ length: numberOfPages - 1 }).map((_, i) => (
        <div
          key={i}
          data-testid="page-separator"
          className="absolute w-full pointer-events-none"
          style={{
            top: marginTop + headerHeight + (i + 1) * bodyUsableHeight,
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
    </>
  )
}
