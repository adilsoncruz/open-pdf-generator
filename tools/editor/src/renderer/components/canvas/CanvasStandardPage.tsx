import React from 'react'
import { useTemplateStore, type Element, flattenElements } from '../../store/templateStore'
import { CanvasElement } from './CanvasElement'
import { CanvasWatermark } from './CanvasWatermark'
import { CanvasMarginGuides } from './CanvasMarginGuides'
import type { SnappedGuides } from './types'
import type { MarginSnapResult } from './snapping'

interface CanvasStandardPageProps {
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

export function CanvasStandardPage({
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
  headerHeight,
  footerHeight,
  pageLabel,
  headerEndLabel,
  footerStartLabel,
}: CanvasStandardPageProps) {
  const {
    template,
    currentSection,
    setCurrentSection,
    selectedElementIds,
    selectedElementLocation,
    selectElement,
    toggleElementSelection,
    updateElement,
    clearSelection,
  } = useTemplateStore()

  return (
    <>
      {/* Background / Base Sheet */}
      {currentSection === 'bodyBackground' ? (
        <>
          <div
            className="absolute right-full mr-3 px-3 py-1 rounded-l text-xs font-semibold whitespace-nowrap bg-purple-500 text-white"
            style={{
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            BACKGROUND
          </div>

          <div
            className="bg-white shadow-lg relative border-2 border-purple-400"
            style={{
              width: pageSize.width,
              height: totalCanvasHeight,
            }}
          >
            {/* Container para elementos do Background - posicionado nas margens */}
            <div
              className="absolute"
              style={{
                left: margins.left,
                top: margins.top,
                right: margins.right,
                bottom: margins.bottom,
              }}
            >
              {(template.pageSettings.bodyBackground?.elements ?? [])
                .filter((element) => !element.hidden)
                .map((element) => (
                  <CanvasElement
                    key={element.id}
                    element={element}
                    scale={scale}
                    isSelected={selectedElementIds.includes(element.id) && selectedElementLocation === 'bodyBackground'}
                    onSelect={(ctrlKey) =>
                      ctrlKey
                        ? toggleElementSelection(element.id, 'bodyBackground')
                        : selectElement(element.id, 'bodyBackground')
                    }
                    onUpdate={(updates) => updateElement(element.id, updates, 'bodyBackground')}
                    location="bodyBackground"
                    margins={margins}
                    pageSize={pageSize}
                    selectedElementIds={selectedElementIds}
                    selectedElementLocation={selectedElementLocation}
                    allElements={flattenElements(template.pageSettings.bodyBackground?.elements ?? [])}
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
              headerConfig={template.pageSettings.header}
              footerConfig={template.pageSettings.footer}
              pageLabel={pageLabel}
              headerEndLabel={headerEndLabel}
              footerStartLabel={footerStartLabel}
            />
          </div>
        </>
      ) : (
        <>
          {/* Labels laterais de indicação da seção ativa */}
          {currentSection === 'header' && (
            <div
              className="absolute right-full mr-3 px-3 py-1 rounded-l text-xs font-semibold whitespace-nowrap bg-blue-500 text-white"
              style={{
                top: margins.top + (template.pageSettings.header?.height || 0) / 2,
                transform: 'translateY(-50%)',
              }}
            >
              HEADER
            </div>
          )}

          {currentSection === 'footer' && (
            <div
              className="absolute right-full mr-3 px-3 py-1 rounded-l text-xs font-semibold whitespace-nowrap bg-green-500 text-white"
              style={{
                top: totalCanvasHeight - margins.bottom - (template.pageSettings.footer?.height || 0) / 2,
                transform: 'translateY(-50%)',
              }}
            >
              FOOTER
            </div>
          )}

          {currentSection === 'body' && (
            <div
              className="absolute right-full mr-3 px-3 py-1 rounded-l text-xs font-semibold whitespace-nowrap bg-purple-500 text-white"
              style={{
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              BODY
            </div>
          )}

          <div
            className="bg-white shadow-lg relative"
            style={{
              width: pageSize.width,
              height: totalCanvasHeight,
            }}
          >
            {/* Header Section */}
            {template.pageSettings.header && (
              <div
                className={`absolute border-b-2 border-dashed ${
                  currentSection === 'header'
                    ? 'border-blue-400 bg-blue-50/30'
                    : 'border-gray-300 bg-gray-50/50'
                }`}
                style={{
                  top: margins.top,
                  left: margins.left,
                  right: margins.right,
                  height: template.pageSettings.header.height,
                  zIndex: 10,
                }}
                onClick={(e) => {
                  if (
                    e.target === e.currentTarget ||
                    (e.target as HTMLElement).classList.contains('cursor-not-allowed')
                  ) {
                    setCurrentSection('header')
                    clearSelection()
                  }
                }}
              >
                {template.pageSettings.header.elements
                  .filter((element) => !element.hidden)
                  .map((element) => (
                    <CanvasElement
                      key={element.id}
                      element={element}
                      scale={scale}
                      isSelected={selectedElementIds.includes(element.id) && selectedElementLocation === 'header'}
                      onSelect={(ctrlKey) =>
                        ctrlKey
                          ? toggleElementSelection(element.id, 'header')
                          : selectElement(element.id, 'header')
                      }
                      onUpdate={(updates) => updateElement(element.id, updates, 'header')}
                      location="header"
                      margins={margins}
                      pageSize={pageSize}
                      selectedElementIds={selectedElementIds}
                      selectedElementLocation={selectedElementLocation}
                      allElements={flattenElements(template.pageSettings.header?.elements ?? [])}
                      onUpdateMultiple={() => {}}
                      updateElement={updateElement}
                      horizontalGuides={horizontalGuides}
                      verticalGuides={verticalGuides}
                      containerOffsetX={margins.left}
                      containerOffsetY={margins.top}
                      onSnapGuide={onSnapGuide}
                    />
                  ))}

                {currentSection !== 'header' && (
                  <div
                    className="absolute inset-0 bg-gray-400/30 cursor-not-allowed"
                    style={{ zIndex: 100 }}
                  />
                )}
              </div>
            )}

            {/* Footer Section */}
            {template.pageSettings.footer && (
              <div
                className={`absolute border-t-2 border-dashed ${
                  currentSection === 'footer'
                    ? 'border-green-400 bg-green-50/30'
                    : 'border-gray-300 bg-gray-50/50'
                }`}
                style={{
                  top: totalCanvasHeight - margins.bottom - template.pageSettings.footer.height,
                  left: margins.left,
                  right: margins.right,
                  height: template.pageSettings.footer.height,
                  zIndex: 10,
                }}
                onClick={(e) => {
                  if (
                    e.target === e.currentTarget ||
                    (e.target as HTMLElement).classList.contains('cursor-not-allowed')
                  ) {
                    setCurrentSection('footer')
                    clearSelection()
                  }
                }}
              >
                {template.pageSettings.footer.elements
                  .filter((element) => !element.hidden)
                  .map((element) => (
                    <CanvasElement
                      key={element.id}
                      element={element}
                      scale={scale}
                      isSelected={selectedElementIds.includes(element.id) && selectedElementLocation === 'footer'}
                      onSelect={(ctrlKey) =>
                        ctrlKey
                          ? toggleElementSelection(element.id, 'footer')
                          : selectElement(element.id, 'footer')
                      }
                      onUpdate={(updates) => updateElement(element.id, updates, 'footer')}
                      location="footer"
                      margins={margins}
                      pageSize={pageSize}
                      selectedElementIds={selectedElementIds}
                      selectedElementLocation={selectedElementLocation}
                      allElements={flattenElements(template.pageSettings.footer?.elements ?? [])}
                      onUpdateMultiple={() => {}}
                      updateElement={updateElement}
                      horizontalGuides={horizontalGuides}
                      verticalGuides={verticalGuides}
                      containerOffsetX={margins.left}
                      containerOffsetY={
                        totalCanvasHeight - margins.bottom - (template.pageSettings.footer?.height || 0)
                      }
                      onSnapGuide={onSnapGuide}
                    />
                  ))}

                {currentSection !== 'footer' && (
                  <div
                    className="absolute inset-0 bg-gray-400/30 cursor-not-allowed"
                    style={{ zIndex: 100 }}
                  />
                )}
              </div>
            )}

            {/* Body Section */}
            <div
              className={`absolute ${
                currentSection === 'body'
                  ? 'outline outline-2 outline-dashed outline-gray-400 -outline-offset-2'
                  : ''
              }`}
              style={{
                top: margins.top + (template.pageSettings.header?.height || 0),
                left: margins.left,
                right: margins.right,
                height: numberOfPages * bodyUsableHeight,
                zIndex: 10,
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setCurrentSection('body')
                  clearSelection()
                }
              }}
            >
              {(() => {
                let currentFlowY = 0
                let lastFlowX: number | undefined = undefined
                let lastFlowWidth: number | string | undefined = undefined

                return template.page
                  .filter((element) => !element.hidden)
                  .map((element) => {
                    const isRelativeFlow =
                      ((element.positionMode || element.position || '') as string).toUpperCase() === 'RELATIVE' &&
                      element.type !== 'container'

                    let effectiveY: number | undefined = undefined
                    let effectiveX: number | undefined = undefined
                    let effectiveWidth: number | string | undefined = undefined

                    if (isRelativeFlow) {
                      const isHeightFull = element.height === '100%'
                      const offsetY = isHeightFull
                        ? 0
                        : typeof element.relativeOffsetY === 'number'
                        ? element.relativeOffsetY
                        : 0
                      if (currentFlowY === 0) {
                        effectiveY = isHeightFull
                          ? 0
                          : typeof element.y === 'number' && element.y > 0
                          ? element.y
                          : offsetY
                      } else {
                        effectiveY = currentFlowY + offsetY
                        if (lastFlowX !== undefined) effectiveX = lastFlowX
                        if (lastFlowWidth !== undefined) effectiveWidth = lastFlowWidth
                      }
                    }

                    const isContainerFixed = element.heightMode === 'fixed' || element.autoHeight === false
                    const containerBaseHeight = typeof element.height === 'number' ? element.height : 150
                    const currentContainerY =
                      typeof effectiveY === 'number'
                        ? effectiveY
                        : typeof element.y === 'number'
                        ? element.y
                        : 0
                    const maxAllowed = Math.max(30, bodyUsableHeight - currentContainerY)
                    const containerAutoHeight = Math.min(
                      isContainerFixed
                        ? containerBaseHeight
                        : Math.max(
                            containerBaseHeight,
                            (element.elements || []).reduce((max: number, ch: Element) => {
                              const cy = typeof ch.y === 'number' ? ch.y : 0
                              const chH = typeof ch.height === 'number' ? ch.height : 25
                              return Math.max(max, cy + chH + 15)
                            }, 0)
                          ),
                      maxAllowed
                    )

                    const elHeight =
                      element.type === 'container'
                        ? containerAutoHeight
                        : typeof element.height === 'number'
                        ? element.height
                        : 25

                    if (isRelativeFlow && effectiveY !== undefined) {
                      currentFlowY = effectiveY + elHeight
                      lastFlowX = effectiveX !== undefined ? effectiveX : element.x
                      lastFlowWidth = effectiveWidth !== undefined ? effectiveWidth : element.width
                    } else {
                      currentFlowY = Math.max(currentFlowY, (element.y || 0) + elHeight)
                      lastFlowX = element.x
                      lastFlowWidth = element.width
                    }

                    return (
                      <CanvasElement
                        key={element.id}
                        element={element}
                        effectiveY={effectiveY}
                        effectiveX={effectiveX}
                        effectiveWidth={effectiveWidth}
                        scale={scale}
                        isSelected={selectedElementIds.includes(element.id) && selectedElementLocation === 'body'}
                        onSelect={(ctrlKey) =>
                          ctrlKey
                            ? toggleElementSelection(element.id, 'body')
                            : selectElement(element.id, 'body')
                        }
                        onUpdate={(updates) => updateElement(element.id, updates, 'body')}
                        location="body"
                        margins={margins}
                        pageSize={pageSize}
                        selectedElementIds={selectedElementIds}
                        selectedElementLocation={selectedElementLocation}
                        allElements={flattenElements(template.page)}
                        onUpdateMultiple={() => {}}
                        updateElement={updateElement}
                        horizontalGuides={horizontalGuides}
                        verticalGuides={verticalGuides}
                        containerOffsetX={margins.left}
                        containerOffsetY={margins.top + (template.pageSettings.header?.height || 0)}
                        onSnapGuide={onSnapGuide}
                      />
                    )
                  })
              })()}

              {currentSection !== 'body' && (
                <div
                  className="absolute inset-0 bg-gray-400/30 cursor-not-allowed"
                  style={{ zIndex: 100 }}
                />
              )}
            </div>

            {/* Watermark Layer */}
            {template.pageSettings.watermark && (
              <CanvasWatermark
                watermark={template.pageSettings.watermark}
                pageSize={pageSize}
                totalCanvasHeight={totalCanvasHeight}
                numberOfPages={numberOfPages}
                bodyUsableHeight={bodyUsableHeight}
              />
            )}

            {/* Margin Guides */}
            <CanvasMarginGuides
              pageSize={pageSize}
              margins={margins}
              totalCanvasHeight={totalCanvasHeight}
              marginSnap={marginSnap}
              numberOfPages={numberOfPages}
              bodyUsableHeight={bodyUsableHeight}
              headerConfig={template.pageSettings.header}
              footerConfig={template.pageSettings.footer}
              pageLabel={pageLabel}
              headerEndLabel={headerEndLabel}
              footerStartLabel={footerStartLabel}
            />
          </div>
        </>
      )}
    </>
  )
}
