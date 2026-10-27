import type { Element, ElementLocation } from '../../../store/templateStore'
import { CanvasBandOverlay } from './CanvasBandOverlay'
import { CanvasSectionElement } from './CanvasSectionElement'
import type { ComputedFlowElement } from './useBodyFlowLayout'
import type { SnappedGuides } from '../types'

export interface CanvasBodySectionProps {
  computedElements: ComputedFlowElement[]
  isActive: boolean
  scale: number
  margins: { top: number; right: number; bottom: number; left: number }
  pageSize: { width: number; height: number }
  selectedElementIds: string[]
  selectedElementLocation: ElementLocation | null
  allElements: Element[]
  horizontalGuides: number[]
  verticalGuides: number[]
  topOffset: number
  height: number
  onSnapGuide: (snapped: SnappedGuides) => void
  onActivate: () => void
  onSelect: (id: string, ctrlKey: boolean) => void
  onUpdate: (id: string, updates: Partial<Element>) => void
  updateElement: (id: string, updates: Partial<Element>, location?: ElementLocation) => void
}

export function CanvasBodySection({
  computedElements,
  isActive,
  scale,
  margins,
  pageSize,
  selectedElementIds,
  selectedElementLocation,
  allElements,
  horizontalGuides,
  verticalGuides,
  topOffset,
  height,
  onSnapGuide,
  onActivate,
  onSelect,
  onUpdate,
  updateElement,
}: CanvasBodySectionProps) {
  return (
    <CanvasBandOverlay
      section="body"
      isActive={isActive}
      scale={scale}
      className={isActive ? 'outline outline-2 outline-dashed outline-gray-400 -outline-offset-2' : ''}
      style={{
        top: topOffset,
        left: margins.left,
        right: margins.right,
        height,
        zIndex: 10,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onActivate()
        }
      }}
    >
      {computedElements.map(({ element, effectiveY, effectiveX, effectiveWidth }) => (
        <CanvasSectionElement
          key={element.id}
          element={element}
          location="body"
          scale={scale}
          margins={margins}
          pageSize={pageSize}
          selectedElementIds={selectedElementIds}
          selectedElementLocation={selectedElementLocation}
          allElements={allElements}
          horizontalGuides={horizontalGuides}
          verticalGuides={verticalGuides}
          containerOffsetX={margins.left}
          containerOffsetY={topOffset}
          onSnapGuide={onSnapGuide}
          onSelect={onSelect}
          onUpdate={onUpdate}
          updateElement={updateElement}
          effectiveY={effectiveY}
          effectiveX={effectiveX}
          effectiveWidth={effectiveWidth}
        />
      ))}
    </CanvasBandOverlay>
  )
}
