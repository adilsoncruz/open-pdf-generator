import type { Element, ElementLocation } from '../../../store/templateStore'
import { CanvasBandOverlay } from './CanvasBandOverlay'
import { CanvasSectionElement } from './CanvasSectionElement'
import type { SnappedGuides } from '../types'

export interface CanvasHeaderSectionProps {
  headerConfig: { height: number; elements: Element[] }
  isActive: boolean
  scale: number
  margins: { top: number; right: number; bottom: number; left: number }
  pageSize: { width: number; height: number }
  selectedElementIds: string[]
  selectedElementLocation: ElementLocation | null
  allElements: Element[]
  horizontalGuides: number[]
  verticalGuides: number[]
  onSnapGuide: (snapped: SnappedGuides) => void
  onActivate: () => void
  onSelect: (id: string, ctrlKey: boolean) => void
  onUpdate: (id: string, updates: Partial<Element>) => void
  updateElement: (id: string, updates: Partial<Element>, location?: ElementLocation) => void
}

export function CanvasHeaderSection({
  headerConfig,
  isActive,
  scale,
  margins,
  pageSize,
  selectedElementIds,
  selectedElementLocation,
  allElements,
  horizontalGuides,
  verticalGuides,
  onSnapGuide,
  onActivate,
  onSelect,
  onUpdate,
  updateElement,
}: CanvasHeaderSectionProps) {
  return (
    <CanvasBandOverlay
      section="header"
      isActive={isActive}
      scale={scale}
      className={`border-b-2 border-dashed ${
        isActive ? 'border-blue-400 bg-blue-50/30' : 'border-gray-300 bg-gray-50/50'
      }`}
      style={{
        top: margins.top,
        left: margins.left,
        right: margins.right,
        height: headerConfig.height,
        zIndex: 10,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('cursor-not-allowed')) {
          onActivate()
        }
      }}
    >
      {headerConfig.elements
        .filter((element) => !element.hidden)
        .map((element) => (
          <CanvasSectionElement
            key={element.id}
            element={element}
            location="header"
            scale={scale}
            margins={margins}
            pageSize={pageSize}
            selectedElementIds={selectedElementIds}
            selectedElementLocation={selectedElementLocation}
            allElements={allElements}
            horizontalGuides={horizontalGuides}
            verticalGuides={verticalGuides}
            containerOffsetX={margins.left}
            containerOffsetY={margins.top}
            onSnapGuide={onSnapGuide}
            onSelect={onSelect}
            onUpdate={onUpdate}
            updateElement={updateElement}
          />
        ))}
    </CanvasBandOverlay>
  )
}
