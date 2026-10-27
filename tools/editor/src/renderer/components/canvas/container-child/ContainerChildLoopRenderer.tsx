import React from 'react'
import type { Element } from '../../../store/templateStore'
import { LoopChildElement } from '../LoopChildElement'
import { useTranslation } from '../../../i18n'
import type { GuideLine } from '../snapping'
import type { ElementLocation } from '../../../store/templateStore/types'

export interface ContainerChildLoopRendererProps {
  child: Element
  location?: ElementLocation
  horizontalGuides?: GuideLine[]
  verticalGuides?: GuideLine[]
  containerPageX?: number
  containerPageY?: number
  scale?: number
  onSnapGuide?: (guide: GuideLine | null) => void
  resolveWidth: (value: string | number | undefined) => number
  resolveHeight: (value: string | number | undefined) => number
}

export function ContainerChildLoopRenderer({
  child,
  location,
  horizontalGuides = [],
  verticalGuides = [],
  containerPageX,
  containerPageY,
  scale = 1,
  onSnapGuide,
  resolveWidth,
  resolveHeight,
}: ContainerChildLoopRendererProps) {
  const { t } = useTranslation()
  const loopElements = child.elements || []
  const loopWidth = resolveWidth(child.width || '100%')
  const loopHeight = resolveHeight(child.height || 100)
  const loopBorderWidth =
    child.style?.borderStyle === 'none'
      ? 0
      : (child.style?.borderWidth ?? child.style?.strokeWidth ?? 1)

  return (
    <div
      className="cursor-move select-none relative"
      style={{
        width: loopWidth,
        height: loopHeight,
        backgroundColor:
          (child.style?.fillColor || child.style?.backgroundColor) === 'transparent'
            ? 'transparent'
            : child.style?.fillColor || child.style?.backgroundColor || 'transparent',
        borderWidth: loopBorderWidth,
        borderStyle: (child.style?.borderStyle as string) || 'dashed',
        borderColor: child.style?.borderColor || child.style?.strokeColor || '#8b5cf6',
        borderRadius: child.style?.cornerRadius ?? 4,
      }}
    >
      <div className="relative w-full h-full">
        {loopElements.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-2 border border-dashed border-purple-200 rounded bg-purple-50/50">
              <div className="text-purple-400 text-[9px] font-medium">{t.canvas.addElements}</div>
            </div>
          </div>
        ) : (
          (() => {
            let loopFlowY = 0
            let lastChildX: number | undefined = undefined
            let lastChildWidth: number | string | undefined = undefined

            return loopElements.map((childLoop: Element) => {
              const isRelative =
                ((childLoop.positionMode || childLoop.position || '') as string).toUpperCase() === 'RELATIVE'
              let effectiveChildY: number | undefined = undefined
              let effectiveChildX: number | undefined = undefined
              let effectiveChildWidth: number | string | undefined = undefined

              if (isRelative) {
                const isChildHeightFull = childLoop.height === '100%'
                const offset = isChildHeightFull
                  ? 0
                  : typeof childLoop.relativeOffsetY === 'number'
                  ? childLoop.relativeOffsetY
                  : 0
                if (loopFlowY === 0) {
                  effectiveChildY =
                    isChildHeightFull
                      ? 0
                      : typeof childLoop.y === 'number' && childLoop.y > 0
                      ? childLoop.y
                      : offset
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

              const chHeight = typeof childLoop.height === 'number' ? childLoop.height : 25
              if (isRelative && effectiveChildY !== undefined) {
                loopFlowY = effectiveChildY + chHeight
                lastChildX = effectiveChildX !== undefined ? effectiveChildX : childLoop.x
                lastChildWidth = effectiveChildWidth !== undefined ? effectiveChildWidth : childLoop.width
              } else {
                loopFlowY = Math.max(loopFlowY, (childLoop.y || 0) + chHeight)
                lastChildX = childLoop.x
                lastChildWidth = childLoop.width
              }

              return (
                <LoopChildElement
                  key={childLoop.id}
                  child={childLoop}
                  loopId={child.id}
                  location={location}
                  effectiveY={effectiveChildY}
                  effectiveX={effectiveChildX}
                  effectiveWidth={effectiveChildWidth}
                  loopWidth={loopWidth}
                  loopHeight={loopHeight}
                  horizontalGuides={horizontalGuides}
                  verticalGuides={verticalGuides}
                  loopPageX={(containerPageX !== undefined ? containerPageX : 0) + (child.x || 0)}
                  loopPageY={(containerPageY !== undefined ? containerPageY : 0) + (child.y || 0)}
                  scale={scale}
                  onSnapGuide={onSnapGuide}
                />
              )
            })
          })()
        )}
      </div>
    </div>
  )
}
