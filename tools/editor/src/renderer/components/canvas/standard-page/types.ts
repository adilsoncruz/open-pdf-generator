import type { SnappedGuides } from '../types'
import type { MarginSnapResult } from '../snapping'

export interface CanvasStandardPageProps {
  pageSize: { width: number; height: number }
  margins: { top: number; right: number; bottom: number; left: number }
  totalCanvasHeight: number
  scale: number
  horizontalGuides: number[]
  verticalGuides: number[]
  onSnapGuide: (snapped: SnappedGuides) => void
  marginSnap: MarginSnapResult
  numberOfPages: number
  bodyUsableHeight: number
  headerHeight: number
  footerHeight: number
  pageLabel?: string
  headerEndLabel?: string
  footerStartLabel?: string
}
