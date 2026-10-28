import type { ReactNode } from 'react'
import type { Element, ElementLocation } from '../../../store/templateStore'
import { flattenElements } from '../../../store/templateStore'
import type { SnappedGuides } from '../types'
import { CanvasSectionBadge } from './CanvasBandOverlay'
import { CanvasSectionElement } from './CanvasSectionElement'

export interface CanvasBackgroundSectionProps {
  pageSize: { width: number; height: number }
  margins: { top: number; right: number; bottom: number; left: number }
  totalCanvasHeight: number
  elements: Element[]
  scale: number
  selectedElementIds: string[]
  selectedElementLocation: ElementLocation | null
  onSelect: (id: string, ctrlKey: boolean) => void
  onUpdate: (id: string, updates: Partial<Element>) => void
  updateElement: (id: string, updates: Partial<Element>, location?: ElementLocation) => void
  horizontalGuides: number[]
  verticalGuides: number[]
  onSnapGuide: (snapped: SnappedGuides) => void
  marginGuides: ReactNode
}

export function CanvasBackgroundSection({
  pageSize,
  margins,
  totalCanvasHeight,
  elements,
  scale,
  selectedElementIds,
  selectedElementLocation,
  onSelect,
  onUpdate,
  updateElement,
  horizontalGuides,
  verticalGuides,
  onSnapGuide,
  marginGuides,
}: CanvasBackgroundSectionProps) {
  const allBgElements = flattenElements(elements)

  return (
    <>
      <CanvasSectionBadge section="bodyBackground" top="50%" />
      <div
        className="bg-white shadow-lg relative border-2 border-purple-400"
        style={{ width: pageSize.width, height: totalCanvasHeight }}
      >
        <div
          className="absolute"
          style={{
            left: margins.left,
            top: margins.top,
            right: margins.right,
            bottom: margins.bottom,
          }}
        >
          {elements
            .filter((element) => !element.hidden)
            .map((element) => (
              <CanvasSectionElement
                key={element.id}
                element={element}
                location="bodyBackground"
                scale={scale}
                margins={margins}
                pageSize={pageSize}
                selectedElementIds={selectedElementIds}
                selectedElementLocation={selectedElementLocation}
                allElements={allBgElements}
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
        </div>
        {marginGuides}
      </div>
    </>
  )
}
