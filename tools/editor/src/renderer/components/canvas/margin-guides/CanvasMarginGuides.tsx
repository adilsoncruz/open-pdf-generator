import React from 'react'
import type { CanvasMarginGuidesProps } from './types'
import { PageSeparators } from './PageSeparators'
import { MarginLinesOverlay } from './MarginLinesOverlay'
import { CanvasGridOverlay } from './CanvasGridOverlay'
import { MarginLabelsOverlay } from './MarginLabelsOverlay'

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
      <PageSeparators
        numberOfPages={numberOfPages}
        marginTop={margins.top}
        headerHeight={headerHeight}
        bodyUsableHeight={bodyUsableHeight}
        pageLabel={pageLabel}
      />

      <MarginLinesOverlay
        pageSize={pageSize}
        margins={margins}
        totalCanvasHeight={totalCanvasHeight}
        headerConfig={headerConfig}
        footerConfig={footerConfig}
        marginSnap={marginSnap}
        isSummary={isSummary}
      />

      <CanvasGridOverlay />

      <MarginLabelsOverlay
        pageSize={pageSize}
        margins={margins}
        totalCanvasHeight={totalCanvasHeight}
        headerConfig={headerConfig}
        footerConfig={footerConfig}
        isSummary={isSummary}
        headerEndLabel={headerEndLabel}
        footerStartLabel={footerStartLabel}
      />
    </>
  )
}
