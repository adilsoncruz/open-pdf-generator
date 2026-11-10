import React, { type MouseEvent as ReactMouseEvent } from 'react'
import { useTemplateStore, type Element, type ElementLocation } from '../../../store/templateStore'
import { ContainerChildElement } from '../ContainerChildElement'
import type { SnappedGuides } from '../types'
import { useTranslation } from '../../../i18n'

interface ContainerElementRendererProps {
  element: Element
  pageSize: { width: number; height: number }
  margins: { top: number; right: number; bottom: number; left: number }
  isSelected: boolean
  location: ElementLocation
  scale?: number
  horizontalGuides?: number[]
  verticalGuides?: number[]
  containerOffsetX?: number
  containerOffsetY?: number
  effectiveY?: number
  effectiveX?: number
  onSnapGuide?: (snapped: SnappedGuides) => void
  onMouseDown: (e: ReactMouseEvent) => void
}

export function ContainerElementRenderer({
  element,
  pageSize,
  margins,
  isSelected,
  location,
  scale,
  horizontalGuides,
  verticalGuides,
  containerOffsetX,
  containerOffsetY,
  effectiveY,
  effectiveX,
  onSnapGuide,
  onMouseDown,
}: ContainerElementRendererProps) {
  const { t } = useTranslation()
  const { template } = useTemplateStore()
              const containerElements = element.elements || []
              const containerItemSpacing = element.itemSpacing || 20
              const bodyAvailableWidth = pageSize.width - margins.left - margins.right
              const containerWidth =
                element.width === '100%'
                  ? bodyAvailableWidth
                  : typeof element.width === 'number'
                    ? element.width
                    : 400
              const headerH = template.pageSettings.header?.height || 0
              const footerH = template.pageSettings.footer?.height || 0
              const sectionMaxH = location === 'header'
                ? headerH
                : location === 'footer'
                ? footerH
                : Math.max(0, pageSize.height - margins.top - margins.bottom - headerH - footerH)
              const containerStartY = typeof effectiveY === 'number' ? effectiveY : (typeof element.y === 'number' ? element.y : 0)
              const yOnSectionPage = location === 'body' && sectionMaxH > 0 ? containerStartY % sectionMaxH : containerStartY
              const maxAllowedContainerH = Math.max(30, sectionMaxH - yOnSectionPage)

              const isFixed = element.heightMode === 'fixed' || element.autoHeight === false
              const baseHeight = element.height === '100%'
                ? sectionMaxH
                : typeof element.height === 'number' ? element.height : 150
              const containerHeight = Math.min(
                isFixed
                  ? baseHeight
                  : Math.max(
                      baseHeight,
                      (containerElements || []).reduce((max: number, ch: Element) => {
                        const cy = typeof ch.y === 'number' ? ch.y : 0
                        const chH = typeof ch.height === 'number' ? ch.height : 25
                        return Math.max(max, cy + chH + 15)
                      }, 0)
                    ),
                maxAllowedContainerH
              )
              const containerBorderWidth = element.style?.borderStyle === 'none' ? 0 : (element.style?.borderWidth ?? element.style?.strokeWidth ?? 2)
              const innerContainerWidth = Math.max(0, containerWidth - (containerBorderWidth * 2))
              const innerContainerHeight = Math.max(0, containerHeight - (containerBorderWidth * 2))

              return (
                <div
                  className={`cursor-move select-none relative ${
                    isSelected ? 'ring-2 ring-primary-500' : ''
                  }`}
                  style={{
                    width: containerWidth,
                    height: containerHeight,
                    boxSizing: 'border-box',
                    backgroundColor:
                      (element.style?.fillColor || element.style?.backgroundColor) === 'transparent'
                        ? 'transparent'
                        : (element.style?.fillColor || element.style?.backgroundColor || 'transparent'),
                    borderWidth: containerBorderWidth,
                    borderStyle: (element.style?.borderStyle as string) || 'dashed',
                    borderColor: element.style?.borderColor || element.style?.strokeColor || '#8b5cf6',
                    borderRadius: element.style?.cornerRadius ?? 4,
                  }}
                  onMouseDown={onMouseDown}
                >
                  {element.pageBreakBefore && (
                    <div className="absolute -top-3 left-3 px-2 py-0.5 rounded bg-indigo-600 text-white font-mono text-[9px] font-semibold flex items-center gap-1 shadow-sm z-30 pointer-events-none">
                      <span>✂ Início de Nova Página</span>
                      {element.pageBreakCondition && <span className="opacity-80">({element.pageBreakCondition})</span>}
                    </div>
                  )}
{/*
                  <div
                    className={`absolute flex items-center gap-2 px-2 py-1 bg-primary-500 text-white rounded-md shadow-sm pointer-events-none transition-opacity ${
                      isSelected ? 'opacity-100' : 'opacity-20'
                    }`}
                    style={{ top: -24, right: -100 }}
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 2l4 4-4 4" />
                      <path d="M3 11v-1a4 4 0 014-4h14" />
                      <path d="M7 22l-4-4 4-4" />
                      <path d="M21 13v1a4 4 0 01-4 4H3" />
                    </svg>
                    <span className="text-[10px] font-semibold">CONTAINER</span>
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded ml-1">
                      {containerElements.length}
                    </span>
                  </div>
*/}

                  {isSelected && (
                    <div className="absolute top-1 right-1 pointer-events-none z-20">
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded shadow-sm border ${
                        isFixed
                          ? 'bg-amber-950/90 text-amber-300 border-amber-700/70'
                          : 'bg-indigo-950/90 text-indigo-300 border-indigo-700/70'
                      }`}>
                        {isFixed ? 'Fixed-Height' : 'Auto-Height'}
                      </span>
                    </div>
                  )}

                  <div className="relative w-full h-full">
                    {containerElements.length === 0 ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center p-3 border-2 border-dashed border-primary-200 rounded-lg bg-primary-50/50">
                          <div className="text-primary-400 text-[10px] font-medium">{t.canvas.addElements} <span className="text-primary-300 text-[9px]">{t.canvas.viaSidebar}</span></div>
                        </div>
                      </div>
                    ) : (
                      <>

                        {(() => {
                          let containerFlowY = 0
                          let lastChildX: number | undefined = undefined
                          let lastChildWidth: number | string | undefined = undefined
                          return containerElements.map((child: Element) => {
                            const isRelative = (child.positionMode || child.position || '').toUpperCase() === 'RELATIVE'
                            let effectiveChildY: number | undefined = undefined
                            let effectiveChildX: number | undefined = undefined
                            let effectiveChildWidth: number | string | undefined = undefined

                            if (isRelative) {
                              const isChildHeightFull = child.height === '100%'
                              const offset = isChildHeightFull ? 0 : (typeof child.relativeOffsetY === 'number' ? child.relativeOffsetY : 0)
                              if (containerFlowY === 0) {
                                effectiveChildY = isChildHeightFull ? 0 : (typeof child.y === 'number' && child.y > 0 ? child.y : offset)
                              } else {
                                effectiveChildY = containerFlowY + offset
                                if (lastChildX !== undefined) {
                                  effectiveChildX = lastChildX
                                }
                                if (lastChildWidth !== undefined) {
                                  effectiveChildWidth = lastChildWidth
                                }
                              }
                            }

                            const chHeight = typeof child.height === 'number' ? child.height : 25
                            if (isRelative && effectiveChildY !== undefined) {
                              containerFlowY = effectiveChildY + chHeight
                              lastChildX = effectiveChildX !== undefined ? effectiveChildX : child.x
                              lastChildWidth = effectiveChildWidth !== undefined ? effectiveChildWidth : child.width
                            } else {
                              containerFlowY = Math.max(containerFlowY, (child.y || 0) + chHeight)
                              lastChildX = child.x
                              lastChildWidth = child.width
                            }

                            return (
                              <ContainerChildElement
                                key={child.id}
                                child={child}
                                effectiveY={effectiveChildY}
                                effectiveX={effectiveChildX}
                                effectiveWidth={effectiveChildWidth}
                                containerId={element.id}
                                location={location}
                                containerWidth={innerContainerWidth}
                                containerHeight={innerContainerHeight}
                                horizontalGuides={horizontalGuides}
                                verticalGuides={verticalGuides}
                                containerPageX={
                                  (containerOffsetX !== undefined ? containerOffsetX : margins.left) +
                                  (element.width === '100%' ? 0 : (effectiveX !== undefined ? effectiveX : (element.x || 0)))
                                }
                                containerPageY={
                                  (containerOffsetY !== undefined
                                    ? containerOffsetY
                                    : (margins.top + (location === 'body' ? (template.pageSettings.header?.height || 0) : 0))) +
                                  (element.height === '100%' ? 0 : (effectiveY !== undefined ? effectiveY : (element.y || 0)))
                                }
                                scale={scale}
                                onSnapGuide={onSnapGuide}
                              />
                            )
                          })
                        })()}
                      </>
                    )}
                  </div>

                  {/* Spacing badge - bottom right corner
                  <div className="absolute bottom-1 right-1 pointer-events-none">
                    <span className="text-[8px] text-primary-400 bg-primary-50 px-1.5 py-0.5 rounded">
                      spacing: {containerItemSpacing}px
                    </span>
                  </div>
                  */}
                </div>
              )
}
