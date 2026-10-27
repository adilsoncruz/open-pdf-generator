export interface MarginSnap {
  top: boolean
  right: boolean
  bottom: boolean
  left: boolean
}

export interface CanvasMarginGuidesProps {
  pageSize: { width: number; height: number }
  margins: { top: number; right: number; bottom: number; left: number }
  totalCanvasHeight: number
  headerConfig?: { height: number }
  footerConfig?: { height: number }
  marginSnap: MarginSnap
  numberOfPages?: number
  bodyUsableHeight?: number
  isSummary?: boolean
  pageLabel?: string
  headerEndLabel?: string
  footerStartLabel?: string
}

export interface PageSeparatorsProps {
  numberOfPages?: number
  marginTop: number
  headerHeight?: number
  bodyUsableHeight?: number
  pageLabel?: string
}

export interface MarginLinesOverlayProps {
  pageSize: { width: number; height: number }
  margins: { top: number; right: number; bottom: number; left: number }
  totalCanvasHeight: number
  headerConfig?: { height: number }
  footerConfig?: { height: number }
  marginSnap: MarginSnap
  isSummary?: boolean
}

export interface CanvasGridOverlayProps {
  gridSize?: number
  patternId?: string
}

export interface MarginLabelsOverlayProps {
  pageSize: { width: number; height: number }
  margins: { top: number; right: number; bottom: number; left: number }
  totalCanvasHeight: number
  headerConfig?: { height: number }
  footerConfig?: { height: number }
  isSummary?: boolean
  headerEndLabel?: string
  footerStartLabel?: string
}
