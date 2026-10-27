import { describe, it, expect } from 'vitest'
import {
  computeAlignedPositions,
  computeDistributedPositions,
  applyPositions,
} from './elementAlignmentMath'
import type { Element } from '../../types'

describe('elementAlignmentMath', () => {
  describe('computeAlignedPositions', () => {
    it('returns an empty map when targets is empty', () => {
      const res = computeAlignedPositions([], 'center')
      expect(res.size).toBe(0)
    })

    it('returns empty map for a single element without parentBounds', () => {
      const el: Element = { type: 'text', id: 't1', x: 10, y: 10, width: 100, height: 20 }
      const res = computeAlignedPositions([el], 'center')
      // For 1 element without parentBounds, boxCenterX = 10 + 50 = 60, center = 60 - 50 = 10
      // In multi-element path (or length 1 without bounds), it aligns relative to its own bounding box
      expect(res.get('t1')).toEqual({ x: 10 })
    })

    it('aligns single element against parentBounds', () => {
      const el: Element = { type: 'text', id: 't1', x: 50, y: 50, width: 100, height: 40 }
      const bounds = { width: 500, height: 200 }

      expect(computeAlignedPositions([el], 'left', bounds).get('t1')).toEqual({ x: 0 })
      expect(computeAlignedPositions([el], 'center', bounds).get('t1')).toEqual({ x: 200 })
      expect(computeAlignedPositions([el], 'right', bounds).get('t1')).toEqual({ x: 400 })
      expect(computeAlignedPositions([el], 'top', bounds).get('t1')).toEqual({ y: 0 })
      expect(computeAlignedPositions([el], 'middle', bounds).get('t1')).toEqual({ y: 80 })
      expect(computeAlignedPositions([el], 'bottom', bounds).get('t1')).toEqual({ y: 160 })
    })

    it('uses fallback dimensions when width or height are omitted', () => {
      const el: Element = { type: 'text', id: 't1', x: 0, y: 0 } // default width 100, height 25
      const bounds = { width: 300, height: 100 }

      expect(computeAlignedPositions([el], 'center', bounds).get('t1')).toEqual({ x: 100 })
      expect(computeAlignedPositions([el], 'middle', bounds).get('t1')).toEqual({ y: 38 })
    })

    it('aligns multiple elements horizontally and vertically', () => {
      const targets: Element[] = [
        { type: 'text', id: 't1', x: 10, y: 10, width: 100, height: 20 },
        { type: 'text', id: 't2', x: 40, y: 50, width: 80, height: 30 },
      ]
      // minX = 10, maxX = 120 (40+80), boxCenterX = 65
      // minY = 10, maxY = 80 (50+30), boxCenterY = 45

      const left = computeAlignedPositions(targets, 'left')
      expect(left.get('t1')).toEqual({ x: 10 })
      expect(left.get('t2')).toEqual({ x: 10 })

      const center = computeAlignedPositions(targets, 'center')
      expect(center.get('t1')).toEqual({ x: 15 }) // 65 - 50
      expect(center.get('t2')).toEqual({ x: 25 }) // 65 - 40

      const right = computeAlignedPositions(targets, 'right')
      expect(right.get('t1')).toEqual({ x: 20 }) // 120 - 100
      expect(right.get('t2')).toEqual({ x: 40 }) // 120 - 80

      const top = computeAlignedPositions(targets, 'top')
      expect(top.get('t1')).toEqual({ y: 10 })
      expect(top.get('t2')).toEqual({ y: 10 })

      const middle = computeAlignedPositions(targets, 'middle')
      expect(middle.get('t1')).toEqual({ y: 35 }) // 45 - 10
      expect(middle.get('t2')).toEqual({ y: 30 }) // 45 - 15

      const bottom = computeAlignedPositions(targets, 'bottom')
      expect(bottom.get('t1')).toEqual({ y: 60 }) // 80 - 20
      expect(bottom.get('t2')).toEqual({ y: 50 }) // 80 - 30
    })
  })

  describe('computeDistributedPositions', () => {
    it('returns empty map if fewer than 3 elements', () => {
      const targets: Element[] = [
        { type: 'text', id: 't1', x: 0, y: 0, width: 50, height: 20 },
        { type: 'text', id: 't2', x: 100, y: 0, width: 50, height: 20 },
      ]
      expect(computeDistributedPositions(targets, 'horizontal').size).toBe(0)
      expect(computeDistributedPositions(targets, 'vertical').size).toBe(0)
    })

    it('distributes elements horizontally', () => {
      const targets: Element[] = [
        { type: 'text', id: 't1', x: 0, y: 0, width: 40, height: 20 },
        { type: 'text', id: 't2', x: 20, y: 0, width: 40, height: 20 },
        { type: 'text', id: 't3', x: 140, y: 0, width: 40, height: 20 },
      ]
      // firstX = 0, lastX = 140, lastRight = 180, span = 180, totalWidths = 120, totalGap = 60, gap = 30
      const res = computeDistributedPositions(targets, 'horizontal')
      expect(res.get('t1')).toEqual({ x: 0 })
      expect(res.get('t2')).toEqual({ x: 70 })
      expect(res.get('t3')).toEqual({ x: 140 })
    })

    it('distributes elements vertically', () => {
      const targets: Element[] = [
        { type: 'text', id: 't1', x: 0, y: 0, width: 100, height: 20 },
        { type: 'text', id: 't2', x: 0, y: 15, width: 100, height: 20 },
        { type: 'text', id: 't3', x: 0, y: 100, width: 100, height: 20 },
      ]
      // firstY = 0, lastY = 100, lastBottom = 120, span = 120, totalHeights = 60, totalGap = 60, gap = 30
      const res = computeDistributedPositions(targets, 'vertical')
      expect(res.get('t1')).toEqual({ y: 0 })
      expect(res.get('t2')).toEqual({ y: 50 })
      expect(res.get('t3')).toEqual({ y: 100 })
    })

    it('handles overlapping elements when totalSpan < totalSizes', () => {
      const targets: Element[] = [
        { type: 'text', id: 't1', x: 0, y: 0, width: 100, height: 20 },
        { type: 'text', id: 't2', x: 20, y: 0, width: 100, height: 20 },
        { type: 'text', id: 't3', x: 40, y: 0, width: 100, height: 20 },
      ]
      // lastBottom = 140, span = 140, totalWidths = 300, totalGap < 0 => gap = 0
      const res = computeDistributedPositions(targets, 'horizontal')
      expect(res.get('t1')).toEqual({ x: 0 })
      expect(res.get('t2')).toEqual({ x: 100 })
      expect(res.get('t3')).toEqual({ x: 200 })
    })
  })

  describe('applyPositions', () => {
    it('applies positions to flat list and preserves other properties', () => {
      const elements: Element[] = [
        { type: 'text', id: 't1', x: 10, y: 20, value: 'Hello' },
        { type: 'text', id: 't2', x: 30, y: 40, value: 'World' },
      ]
      const posMap = new Map([['t1', { x: 50 }]])
      const updated = applyPositions(elements, posMap)

      expect(updated[0]).toEqual({ type: 'text', id: 't1', x: 50, y: 20, value: 'Hello' })
      expect(updated[1]).toEqual(elements[1])
    })

    it('recursively updates nested child elements', () => {
      const elements: Element[] = [
        {
          type: 'container',
          id: 'c1',
          x: 0,
          y: 0,
          elements: [
            { type: 'text', id: 'child1', x: 10, y: 10 },
            { type: 'text', id: 'child2', x: 20, y: 20 },
          ],
        },
      ]
      const posMap = new Map([['child2', { x: 99, y: 88 }]])
      const updated = applyPositions(elements, posMap)

      expect(updated[0].elements?.[1]).toEqual({
        type: 'text',
        id: 'child2',
        x: 99,
        y: 88,
      })
      expect(updated[0].elements?.[0]).toEqual({
        type: 'text',
        id: 'child1',
        x: 10,
        y: 10,
      })
    })
  })
})
