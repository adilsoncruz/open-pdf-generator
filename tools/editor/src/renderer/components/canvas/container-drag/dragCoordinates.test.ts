import { describe, it, expect, vi } from 'vitest'
import {
  isRelativeChild,
  calculateDragDelta,
  resolveChildDimensions,
  getInitialOffsetY,
  calculateRelativeOffsetY,
  clampChildCoordinates,
  collectInitialPositions,
  applyMultiChildDragUpdate,
} from './dragCoordinates'
import type { Element } from '../../../store/templateStore'

describe('dragCoordinates', () => {
  describe('isRelativeChild', () => {
    it('returns true when positionMode or position is RELATIVE', () => {
      expect(isRelativeChild({ id: '1', type: 'text', x: 0, y: 0, positionMode: 'relative' } as Element)).toBe(true)
      expect(isRelativeChild({ id: '2', type: 'text', x: 0, y: 0, position: 'RELATIVE' } as unknown as Element)).toBe(true)
    })

    it('returns false when position is absolute or undefined', () => {
      expect(isRelativeChild({ id: '1', type: 'text', x: 0, y: 0, positionMode: 'absolute' } as Element)).toBe(false)
      expect(isRelativeChild({ id: '2', type: 'text', x: 0, y: 0 } as Element)).toBe(false)
    })
  })

  describe('calculateDragDelta', () => {
    it('calculates unscaled delta when scale is 1 or undefined', () => {
      expect(calculateDragDelta(150, 200, 100, 150)).toEqual({ deltaX: 50, deltaY: 50 })
      expect(calculateDragDelta(150, 200, 100, 150, 1)).toEqual({ deltaX: 50, deltaY: 50 })
    })

    it('applies zoom scale correctly', () => {
      expect(calculateDragDelta(200, 300, 100, 100, 2)).toEqual({ deltaX: 50, deltaY: 100 })
    })
  })

  describe('resolveChildDimensions', () => {
    const resolveWidth = (v: string | number | undefined) => (typeof v === 'number' ? v : 120)
    const resolveHeight = (v: string | number | undefined) => (typeof v === 'number' ? v : 40)

    it('resolves standard dimensions with fallbacks', () => {
      const child: Element = { id: 'c1', type: 'text', x: 0, y: 0, width: 200, height: 50 }
      const dims = resolveChildDimensions(child, undefined, resolveWidth, resolveHeight)
      expect(dims.childWidth).toBe(200)
      expect(dims.childHeight).toBe(50)
      expect(dims.isChildRelative).toBe(false)
    })

    it('uses effectiveWidth for relative children', () => {
      const child: Element = { id: 'c1', type: 'text', x: 0, y: 0, positionMode: 'relative', width: 100 }
      const dims = resolveChildDimensions(child, 180, resolveWidth, resolveHeight)
      expect(dims.childWidth).toBe(180)
      expect(dims.isChildRelative).toBe(true)
    })
  })

  describe('getInitialOffsetY and calculateRelativeOffsetY', () => {
    it('returns 0 for 100% height', () => {
      const child: Element = { id: 'c1', type: 'text', x: 0, y: 0, height: '100%', relativeOffsetY: 30 }
      expect(getInitialOffsetY(child)).toBe(0)
      expect(calculateRelativeOffsetY('100%', 30, 20)).toBe(0)
    })

    it('returns relativeOffsetY if set, or 10 fallback', () => {
      expect(getInitialOffsetY({ id: 'c1', type: 'text', x: 0, y: 0, relativeOffsetY: 25 } as Element)).toBe(25)
      expect(getInitialOffsetY({ id: 'c2', type: 'text', x: 0, y: 0 } as Element)).toBe(10)
    })

    it('calculates new relativeOffsetY clamped at 0', () => {
      expect(calculateRelativeOffsetY(50, 20, 15)).toBe(35)
      expect(calculateRelativeOffsetY(50, 10, -30)).toBe(0)
    })
  })

  describe('clampChildCoordinates', () => {
    it('clamps coordinates within container bounds', () => {
      const { clampedX, clampedY } = clampChildCoordinates(-10, 450, 100, 50, 400, 300, false, false)
      expect(clampedX).toBe(0)
      expect(clampedY).toBe(250) // 300 - 50
    })

    it('forces 0 when width or height is 100%', () => {
      const { clampedX, clampedY } = clampChildCoordinates(50, 60, 400, 300, 400, 300, true, true)
      expect(clampedX).toBe(0)
      expect(clampedY).toBe(0)
    })
  })

  describe('collectInitialPositions and applyMultiChildDragUpdate', () => {
    it('collects single element position when not multi-selected', () => {
      const child: Element = { id: 'c1', type: 'text', x: 20, y: 30 }
      const positions = collectInitialPositions('body', ['c1'], child, {})
      expect(positions).toEqual({ c1: { x: 20, y: 30 } })
    })

    it('collects multi-element positions from page', () => {
      const child: Element = { id: 'c1', type: 'text', x: 10, y: 15 }
      const template = {
        page: [
          { id: 'c1', type: 'text', x: 10, y: 15 },
          { id: 'c2', type: 'text', x: 40, y: 60 },
          { id: 'c3', type: 'text', x: 100, y: 100 },
        ],
      }
      const positions = collectInitialPositions('body', ['c1', 'c2'], child, template)
      expect(positions).toEqual({
        c1: { x: 10, y: 15 },
        c2: { x: 40, y: 60 },
      })
    })

    it('applies multi-child drag delta updates', () => {
      const updateFn = vi.fn()
      const initialPositions = {
        c1: { x: 10, y: 20 },
        c2: { x: 50, y: 80 },
      }
      applyMultiChildDragUpdate(initialPositions, 15, -5, 'body', updateFn)
      expect(updateFn).toHaveBeenCalledWith('c1', { x: 25, y: 15 }, 'body')
      expect(updateFn).toHaveBeenCalledWith('c2', { x: 65, y: 75 }, 'body')
    })
  })
})
