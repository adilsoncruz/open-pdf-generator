import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLoopChildResize } from './useLoopChildResize'
import type { Element } from '../../store/templateStore'

describe('useLoopChildResize', () => {
  const child: Element = {
    type: 'text',
    id: 'loop-child-1',
    x: 10,
    y: 10,
    width: 80,
    height: 30,
  }

  const directions = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w']

  directions.forEach((dir) => {
    it(`handles resize in direction ${dir}`, () => {
      const updateLoopChildElement = vi.fn()
      const saveSnapshot = vi.fn()

      const { result } = renderHook(() =>
        useLoopChildResize({
          child,
          loopId: 'loop-1',
          location: 'body',
          loopWidth: 400,
          loopHeight: 100,
          scale: 1,
          snapToGuides: false,
          resolveWidth: (w) => (typeof w === 'number' ? w : 80),
          resolveHeight: (h) => (typeof h === 'number' ? h : 30),
          updateLoopChildElement,
          saveSnapshot,
        })
      )

      act(() => {
        result.current.handleResizeMouseDown(
          {
            stopPropagation: vi.fn(),
            clientX: 50,
            clientY: 50,
          } as any,
          dir
        )
      })

      act(() => {
        window.dispatchEvent(new MouseEvent('mousemove', { clientX: 60, clientY: 60 }))
      })
      expect(updateLoopChildElement).toHaveBeenCalled()

      act(() => {
        window.dispatchEvent(new MouseEvent('mouseup'))
      })
      expect(saveSnapshot).toHaveBeenCalled()
    })
  })

  it('snaps to loop edge and vertical/horizontal guides when snapToGuides is true', () => {
    const updateLoopChildElement = vi.fn()
    const saveSnapshot = vi.fn()
    const onSnapGuide = vi.fn()

    const { result } = renderHook(() =>
      useLoopChildResize({
        child,
        loopId: 'loop-1',
        location: 'body',
        loopWidth: 100,
        loopHeight: 100,
        scale: 1,
        snapToGuides: true,
        horizontalGuides: [60],
        verticalGuides: [100],
        loopPageX: 10,
        loopPageY: 10,
        resolveWidth: () => 80,
        resolveHeight: () => 30,
        updateLoopChildElement,
        saveSnapshot,
        onSnapGuide,
      })
    )

    act(() => {
      result.current.handleResizeMouseDown(
        {
          stopPropagation: vi.fn(),
          clientX: 50,
          clientY: 50,
        } as any,
        'se'
      )
    })

    act(() => {
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: 52, clientY: 52 }))
    })

    expect(onSnapGuide).toHaveBeenCalled()
    expect(updateLoopChildElement).toHaveBeenCalled()

    act(() => {
      window.dispatchEvent(new MouseEvent('mouseup'))
    })
    expect(onSnapGuide).toHaveBeenCalledWith({ h: null, v: null })
  })
})
