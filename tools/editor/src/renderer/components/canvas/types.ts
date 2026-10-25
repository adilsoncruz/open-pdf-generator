import type { Element, ElementLocation } from '../../store/templateStore'

export interface SnappedGuides {
  h: number | null
  v: number | null
}

export interface LoopChildElementProps {
  child: Element
  loopId: string
  location: ElementLocation
  loopWidth: number
  loopHeight: number
  horizontalGuides?: number[]
  verticalGuides?: number[]
  loopPageX?: number
  loopPageY?: number
  scale?: number
  onSnapGuide?: (snapped: SnappedGuides) => void
}

export interface ContainerChildElementProps {
  child: Element
  containerId: string
  location: ElementLocation
  containerWidth: number
  containerHeight: number
  effectiveY?: number
  effectiveX?: number
  effectiveWidth?: number | string
  horizontalGuides?: number[]
  verticalGuides?: number[]
  containerPageX?: number
  containerPageY?: number
  scale?: number
  onSnapGuide?: (snapped: SnappedGuides) => void
}

export interface CanvasElementProps {
  element: Element
  effectiveY?: number
  effectiveX?: number
  effectiveWidth?: number | string
  scale?: number
  isSelected: boolean
  onSelect: (ctrlKey: boolean) => void
  onUpdate: (updates: Partial<Element>) => void
  margins: { top: number; right: number; bottom: number; left: number }
  pageSize: { width: number; height: number }
  selectedElementIds: string[]
  selectedElementLocation: ElementLocation | null
  allElements: Element[]
  onUpdateMultiple: () => void
  updateElement: (id: string, updates: Partial<Element>, location?: ElementLocation) => void
  location: ElementLocation
  horizontalGuides?: number[]
  verticalGuides?: number[]
  containerOffsetX?: number
  containerOffsetY?: number
  onSnapGuide?: (snapped: SnappedGuides) => void
}

export function getHeaderBorderValues(style: Record<string, unknown> | undefined) {
  const borderWidth = (style?.headerBorderWidth as number) ?? (style?.borderWidth as number) ?? 1
  const borderType = style?.headerBorderType

  switch (borderType) {
    case 'none':
      return { top: 0, right: 0, bottom: 0, left: 0 }
    case 'row':
      return { top: borderWidth, right: 0, bottom: borderWidth, left: 0 }
    case 'columns':
    case 'cells':
    case 'all':
      return { top: borderWidth, right: borderWidth, bottom: borderWidth, left: borderWidth }
    case 'top-bottom':
      return { top: borderWidth, right: 0, bottom: borderWidth, left: 0 }
    case 'left-right':
      return { top: 0, right: borderWidth, bottom: 0, left: borderWidth }
    default:
      return { top: borderWidth, right: borderWidth, bottom: borderWidth, left: borderWidth }
  }
}

export function getCellBorderValues(style: Record<string, unknown> | undefined) {
  const borderWidth = (style?.borderWidth as number) ?? 1
  const borderType = style?.cellBorderType

  switch (borderType) {
    case 'none':
      return { top: 0, right: 0, bottom: 0, left: 0 }
    case 'row':
      return { top: borderWidth, right: 0, bottom: borderWidth, left: 0 }
    case 'columns':
      return { top: 0, right: borderWidth, bottom: 0, left: borderWidth }
    case 'cells':
    case 'all':
      return { top: borderWidth, right: borderWidth, bottom: borderWidth, left: borderWidth }
    case 'top-bottom':
      return { top: borderWidth, right: 0, bottom: borderWidth, left: 0 }
    case 'left-right':
      return { top: 0, right: borderWidth, bottom: 0, left: borderWidth }
    default:
      return { top: borderWidth, right: borderWidth, bottom: borderWidth, left: borderWidth }
  }
}

export function getFontFamily(pdfFont?: string): string {
  if (!pdfFont) return 'Arial, sans-serif'
  
  const fontMap: Record<string, string> = {
    'Helvetica': 'Arial, Helvetica, sans-serif',
    'Helvetica-Bold': 'Arial, Helvetica, sans-serif',
    'Times-Roman': '"Times New Roman", Times, serif',
    'Times-Bold': '"Times New Roman", Times, serif',
    'Courier': '"Courier New", Courier, monospace',
    'Courier-Bold': '"Courier New", Courier, monospace',
  }
  
  return fontMap[pdfFont] || 'Arial, sans-serif'
}
