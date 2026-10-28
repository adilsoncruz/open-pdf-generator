import type { Element, ElementLocation } from '../../../store/templateStore'
import { CanvasElement } from '../CanvasElement'
import type { SnappedGuides } from '../types'

export interface CanvasSectionElementProps {
  element: Element
  location: ElementLocation
  scale: number
  margins: { top: number; right: number; bottom: number; left: number }
  pageSize: { width: number; height: number }
  selectedElementIds: string[]
  selectedElementLocation: ElementLocation | null
  allElements: Element[]
  horizontalGuides: number[]
  verticalGuides: number[]
  containerOffsetX: number
  containerOffsetY: number
  onSnapGuide: (snapped: SnappedGuides) => void
  onSelect: (id: string, ctrlKey: boolean) => void
  onUpdate: (id: string, updates: Partial<Element>) => void
  updateElement: (id: string, updates: Partial<Element>, location?: ElementLocation) => void
  effectiveY?: number
  effectiveX?: number
  effectiveWidth?: number | string
}

export function CanvasSectionElement({
  element,
  location,
  scale,
  margins,
  pageSize,
  selectedElementIds,
  selectedElementLocation,
  allElements,
  horizontalGuides,
  verticalGuides,
  containerOffsetX,
  containerOffsetY,
  onSnapGuide,
  onSelect,
  onUpdate,
  updateElement,
  effectiveY,
  effectiveX,
  effectiveWidth,
}: CanvasSectionElementProps) {
  return (
    <CanvasElement
      element={element}
      effectiveY={effectiveY}
      effectiveX={effectiveX}
      effectiveWidth={effectiveWidth}
      scale={scale}
      isSelected={selectedElementIds.includes(element.id) && selectedElementLocation === location}
      onSelect={(ctrlKey) => onSelect(element.id, ctrlKey)}
      onUpdate={(updates) => onUpdate(element.id, updates)}
      location={location}
      margins={margins}
      pageSize={pageSize}
      selectedElementIds={selectedElementIds}
      selectedElementLocation={selectedElementLocation}
      allElements={allElements}
      onUpdateMultiple={() => {}}
      updateElement={updateElement}
      horizontalGuides={horizontalGuides}
      verticalGuides={verticalGuides}
      containerOffsetX={containerOffsetX}
      containerOffsetY={containerOffsetY}
      onSnapGuide={onSnapGuide}
    />
  )
}
