import type { Element, ElementLocation } from '../../../store/templateStore'
import { CanvasBandOverlay } from './CanvasBandOverlay'
import { CanvasSectionElement } from './CanvasSectionElement'
import type { SnappedGuides } from '../types'

export interface CanvasFooterSectionProps {
  footerConfig: { height: number; elements: Element[] }
  isActive: boolean
  scale: number
  margins: { top: number; right: number; bottom: number; left: number }
  pageSize: { width: number; height: number }
  selectedElementIds: string[]
  selectedElementLocation: ElementLocation | null
  allElements: Element[]
  horizontalGuides: number[]
  verticalGuides: number[]
  offsetY: number
  onSnapGuide: (snapped: SnappedGuides) => void
  onActivate: () => void
  onSelect: (id: string, ctrlKey: boolean) => void
  onUpdate: (id: string, updates: Partial<Element>) => void
  updateElement: (id: string, updates: Partial<Element>, location?: ElementLocation) => void
}

export function CanvasFooterSection({
  footerConfig,
  isActive,
  scale,
  margins,
  pageSize,
  selectedElementIds,
  selectedElementLocation,
  allElements,
  horizontalGuides,
  verticalGuides,
  offsetY,
  onSnapGuide,
  onActivate,
  onSelect,
  onUpdate,
  updateElement,
}: CanvasFooterSectionProps) {
  return (
    <CanvasBandOverlay
      section="footer"
      isActive={isActive}
      scale={scale}
      className={`border-t-2 border-dashed ${
        isActive ? 'border-green-400 bg-green-50/30' : 'border-gray-300 bg-gray-50/50'
      }`}
      style={{
        top: offsetY,
        left: margins.left,
        right: margins.right,
        height: footerConfig.height,
        zIndex: 10,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('cursor-not-allowed')) {
          onActivate()
        }
      }}
    >
      {footerConfig.elements
        .filter((element) => !element.hidden)
        .map((element) => (
          <CanvasSectionElement
            key={element.id}
            element={element}
            location="footer"
            scale={scale}
            margins={margins}
            pageSize={pageSize}
            selectedElementIds={selectedElementIds}
            selectedElementLocation={selectedElementLocation}
            allElements={allElements}
            horizontalGuides={horizontalGuides}
            verticalGuides={verticalGuides}
            containerOffsetX={margins.left}
            containerOffsetY={offsetY}
            onSnapGuide={onSnapGuide}
            onSelect={onSelect}
            onUpdate={onUpdate}
            updateElement={updateElement}
          />
        ))}
    </CanvasBandOverlay>
  )
}
