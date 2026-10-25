import React from 'react'
import { useTemplateStore, flattenElements } from '../../store/templateStore'
import { CanvasElement } from './CanvasElement'
import { CanvasMarginGuides } from './CanvasMarginGuides'
import type { SnappedGuides } from './types'
import type { MarginSnapResult } from './snapping'

interface CanvasSummaryPageProps {
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
}

export function CanvasSummaryPage({
  pageSize,
  margins,
  totalCanvasHeight,
  scale,
  horizontalGuides,
  verticalGuides,
  onSnapGuide,
  marginSnap,
  numberOfPages,
  bodyUsableHeight,
}: CanvasSummaryPageProps) {
  const {
    template,
    selectedElementIds,
    selectedElementLocation,
    selectElement,
    toggleElementSelection,
    updateElement,
  } = useTemplateStore()

  if (!template.summaryPage) return null

  return (
    <>
      <div
        className="absolute right-full mr-3 px-3 py-1 rounded-l text-xs font-semibold whitespace-nowrap bg-green-500 text-white"
        style={{
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      >
        SUMMARY
      </div>

      <div
        className="bg-white shadow-lg relative border-2 border-green-400"
        style={{
          width: pageSize.width,
          height: totalCanvasHeight,
        }}
      >
        {/* Background da Summary (se existir) */}
        {template.summaryPage.background?.elements
          ?.filter((element) => !element.hidden)
          .map((element) => (
            <CanvasElement
              key={element.id}
              element={element}
              scale={scale}
              isSelected={selectedElementIds.includes(element.id) && selectedElementLocation === 'summary'}
              onSelect={(ctrlKey) =>
                ctrlKey
                  ? toggleElementSelection(element.id, 'summary')
                  : selectElement(element.id, 'summary')
              }
              onUpdate={(updates) => updateElement(element.id, updates, 'summary')}
              location="summary"
              margins={margins}
              pageSize={pageSize}
              selectedElementIds={selectedElementIds}
              selectedElementLocation={selectedElementLocation}
              allElements={flattenElements(template.summaryPage?.background?.elements ?? [])}
              onUpdateMultiple={() => {}}
              updateElement={updateElement}
              horizontalGuides={horizontalGuides}
              verticalGuides={verticalGuides}
              containerOffsetX={margins.left}
              containerOffsetY={margins.top}
              onSnapGuide={onSnapGuide}
            />
          ))}

        {/* Container com offset das margens para elementos da Summary */}
        <div
          className="absolute"
          style={{
            left: margins.left,
            top: margins.top,
            right: margins.right,
            bottom: margins.bottom,
          }}
        >
          {template.summaryPage.elements
            .filter((element) => !element.hidden)
            .map((element) => (
              <CanvasElement
                key={element.id}
                element={element}
                scale={scale}
                isSelected={selectedElementIds.includes(element.id) && selectedElementLocation === 'summary'}
                onSelect={(ctrlKey) =>
                  ctrlKey
                    ? toggleElementSelection(element.id, 'summary')
                    : selectElement(element.id, 'summary')
                }
                onUpdate={(updates) => updateElement(element.id, updates, 'summary')}
                location="summary"
                margins={margins}
                pageSize={pageSize}
                selectedElementIds={selectedElementIds}
                selectedElementLocation={selectedElementLocation}
                allElements={flattenElements(template.summaryPage?.elements ?? [])}
                onUpdateMultiple={() => {}}
                updateElement={updateElement}
                horizontalGuides={horizontalGuides}
                verticalGuides={verticalGuides}
                containerOffsetX={margins.left}
                containerOffsetY={margins.top}
                onSnapGuide={onSnapGuide}
              />
            ))}
        </div>

        <CanvasMarginGuides
          pageSize={pageSize}
          margins={margins}
          totalCanvasHeight={totalCanvasHeight}
          marginSnap={marginSnap}
          numberOfPages={numberOfPages}
          bodyUsableHeight={bodyUsableHeight}
          isSummary={true}
        />
      </div>
    </>
  )
}
