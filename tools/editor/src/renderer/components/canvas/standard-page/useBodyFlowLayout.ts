import { useMemo } from 'react'
import type { Element } from '../../../store/templateStore'

export interface ComputedFlowElement {
  element: Element
  effectiveY?: number
  effectiveX?: number
  effectiveWidth?: number | string
}

export function useBodyFlowLayout(
  elements: Element[],
  bodyUsableHeight: number
): ComputedFlowElement[] {
  return useMemo(() => {
    let currentFlowY = 0
    let lastFlowX: number | undefined = undefined
    let lastFlowWidth: number | string | undefined = undefined

    return elements
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

        return {
          element,
          effectiveY,
          effectiveX,
          effectiveWidth,
        }
      })
  }, [elements, bodyUsableHeight])
}
