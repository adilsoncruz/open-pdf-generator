import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useContainerChildResize } from './useContainerChildResize'
import type { Element } from '../../store/templateStore'

describe('useContainerChildResize', () => {
  const child: Element = {
    type: 'rectangle',
    id: 'c-child-1',
    x: 10,
    y: 10,
    width: 80,
    height: 40,
  }

  const directions = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w']

  directions.forEach((dir) => {
    it(`handles resize in direction ${dir}`, () => {
      const updateContainerChildElement = vi.fn()
      const saveSnapshot = vi.fn()

      const { result } = renderHook(() =>
        useContainerChildResize({
          child,
          containerId: 'c-1',
          location: 'body',
          containerWidth: 400,
          containerHeight: 300,
          scale: 1,
          snapToGuides: false,
          resolveWidth: (w) => (typeof w === 'number' ? w : 80),
          resolveHeight: (h) => (typeof h === 'number' ? h : 40),
          updateContainerChildElement,
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
      expect(updateContainerChildElement).toHaveBeenCalled()

      act(() => {
        window.dispatchEvent(new MouseEvent('mouseup'))
      })
      expect(saveSnapshot).toHaveBeenCalled()
    })
  })

  it('snaps to container edge and vertical/horizontal guides when snapToGuides is true', () => {
    const updateContainerChildElement = vi.fn()
    const saveSnapshot = vi.fn()
    const onSnapGuide = vi.fn()

    const { result } = renderHook(() =>
      useContainerChildResize({
        child,
        containerId: 'c-1',
        location: 'body',
        containerWidth: 100,
        containerHeight: 100,
        scale: 1,
        snapToGuides: true,
        horizontalGuides: [60],
        verticalGuides: [100],
        containerPageX: 10,
        containerPageY: 10,
        resolveWidth: () => 80,
        resolveHeight: () => 40,
        updateContainerChildElement,
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

    // Move close to vertical guide (guideLocalX = 90, currentX = 10 -> newWidth = 80 -> deltaX = 0)
    // and horizontal guide (guideLocalY = 50, currentY = 10 -> newHeight = 40)
    act(() => {
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: 52, clientY: 52 }))
    })

    expect(onSnapGuide).toHaveBeenCalled()
    expect(updateContainerChildElement).toHaveBeenCalled()

    act(() => {
      window.dispatchEvent(new MouseEvent('mouseup'))
    })
    expect(onSnapGuide).toHaveBeenCalledWith({ h: null, v: null })
  })
})
