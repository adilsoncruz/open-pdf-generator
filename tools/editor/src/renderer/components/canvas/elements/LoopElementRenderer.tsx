import React, { type MouseEvent as ReactMouseEvent } from 'react'
import type { Element, ElementLocation } from '../../../store/templateStore'
import { LoopChildElement } from '../LoopChildElement'
import type { SnappedGuides } from '../types'
import { useTranslation } from '../../../i18n'

interface LoopElementRendererProps {
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

export function LoopElementRenderer({
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
}: LoopElementRendererProps) {
  const { t } = useTranslation()
        const loopElements = element.elements || []
        const loopBinding = element.dataBinding || ''
        const loopItemSpacing = element.itemSpacing || 20
        const bodyAvailableWidth = pageSize.width - margins.left - margins.right
        const loopWidth =
          element.width === '100%'
            ? bodyAvailableWidth
            : typeof element.width === 'number'
              ? element.width
              : 400
        const loopHeight = typeof element.height === 'number' ? element.height : 150
        const loopBorderWidth = element.style?.borderStyle === 'none' ? 0 : (element.style?.borderWidth ?? element.style?.strokeWidth ?? 2)
        const innerLoopWidth = Math.max(0, loopWidth - (loopBorderWidth * 2))
        const innerLoopHeight = Math.max(0, loopHeight - (loopBorderWidth * 2))
        
        return (
          <div
            className={`cursor-move select-none relative ${
              isSelected ? 'ring-2 ring-primary-500' : ''
            }`}
            style={{
              width: loopWidth,
              height: loopHeight,
              boxSizing: 'border-box',
              backgroundColor:
                (element.style?.fillColor || element.style?.backgroundColor) === 'transparent'
                  ? 'transparent'
                  : (element.style?.fillColor || element.style?.backgroundColor || 'transparent'),
              borderWidth: loopBorderWidth,
              borderStyle: (element.style?.borderStyle as string) || 'dashed',
              borderColor: element.style?.borderColor || element.style?.strokeColor || '#8b5cf6',
              borderRadius: element.style?.cornerRadius ?? 4,
            }}
            onMouseDown={onMouseDown}
          >
{/*
             <div
              className={`absolute flex items-center gap-2 px-2 py-1 bg-primary-500 text-white rounded-md shadow-sm pointer-events-none transition-opacity ${
                isSelected ? 'opacity-100' : 'opacity-70'
              }`}
              style={{ top: -24, right: -100 }}
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 2l4 4-4 4" />
                <path d="M3 11v-1a4 4 0 014-4h14" />
                <path d="M7 22l-4-4 4-4" />
                <path d="M21 13v1a4 4 0 01-4 4H3" />
              </svg>
              <span className="text-[10px] font-semibold">LOOP</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded ml-1">
                {loopElements.length}
              </span>
            </div>
*/}
            
            <div className="relative w-full h-full">
              {loopElements.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-3 border-2 border-dashed border-primary-200 rounded-lg bg-primary-50/50">
                    <div className="text-primary-400 text-[10px] font-medium">{t.canvas.addElements}</div>
                    <div className="text-primary-300 text-[9px]">{t.canvas.viaSidebar}</div>
                  </div>
                </div>
              ) : (
                <>
                  {(() => {
                    let loopFlowY = 0
                    let lastChildX: number | undefined = undefined
                    let lastChildWidth: number | string | undefined = undefined

                    return loopElements.map((child: Element) => {
                      const isRelative =
                        ((child.positionMode || child.position || '') as string).toUpperCase() === 'RELATIVE'
                      let effectiveChildY: number | undefined = undefined
                      let effectiveChildX: number | undefined = undefined
                      let effectiveChildWidth: number | string | undefined = undefined

                      if (isRelative) {
                        const isChildHeightFull = child.height === '100%'
                        const offset = isChildHeightFull ? 0 : (typeof child.relativeOffsetY === 'number' ? child.relativeOffsetY : 0)
                        if (loopFlowY === 0) {
                          effectiveChildY = isChildHeightFull ? 0 : (typeof child.y === 'number' && child.y > 0 ? child.y : offset)
                        } else {
                          effectiveChildY = loopFlowY + offset
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
                        loopFlowY = effectiveChildY + chHeight
                        lastChildX = effectiveChildX !== undefined ? effectiveChildX : child.x
                        lastChildWidth = effectiveChildWidth !== undefined ? effectiveChildWidth : child.width
                      } else {
                        loopFlowY = Math.max(loopFlowY, (child.y || 0) + chHeight)
                        lastChildX = child.x
                        lastChildWidth = child.width
                      }

                      return (
                        <LoopChildElement 
                          key={child.id} 
                          child={child} 
                          loopId={element.id}
                          location={location}
                          effectiveY={effectiveChildY}
                          effectiveX={effectiveChildX}
                          effectiveWidth={effectiveChildWidth}
                          loopWidth={innerLoopWidth}
                          loopHeight={innerLoopHeight}
                          horizontalGuides={horizontalGuides}
                          verticalGuides={verticalGuides}
                          loopPageX={
                            (containerOffsetX !== undefined ? containerOffsetX : margins.left) +
                            (element.width === '100%' ? 0 : (effectiveX !== undefined ? effectiveX : (element.x || 0)))
                          }
                          loopPageY={
                            (containerOffsetY !== undefined ? containerOffsetY : margins.top) +
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
                spacing: {loopItemSpacing}px
              </span>
            </div>
            */}
          </div>
        )
}
