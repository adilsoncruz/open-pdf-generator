import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCanvasElementResize } from './useCanvasElementResize'
import type { Element } from '../../store/templateStore'

describe('useCanvasElementResize', () => {
  const element: Element = {
    type: 'rectangle',
    id: 'rect-res',
    x: 50,
    y: 50,
    width: 100,
    height: 100,
  }

  const directions = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w']

  directions.forEach((dir) => {
    it(`handles resizing in direction ${dir}`, () => {
      const onUpdate = vi.fn()
      const saveSnapshot = vi.fn()
      const applySnap = vi.fn((x, y) => ({ x, y }))

      const { result } = renderHook(() =>
        useCanvasElementResize({
          element,
          scale: 1,
          snapToGuides: true,
          onUpdate,
          saveSnapshot,
          getElementDimensions: () => ({ width: 100, height: 100 }),
          applySnap,
        })
      )

      // Start resize
      act(() => {
        result.current.handleResizeMouseDown(
          {
            stopPropagation: vi.fn(),
            clientX: 100,
            clientY: 100,
          } as any,
          dir
        )
      })

      // Mouse move
      act(() => {
        document.dispatchEvent(new MouseEvent('mousemove', { clientX: 120, clientY: 120 }))
      })
      expect(onUpdate).toHaveBeenCalled()

      // Mouse up
      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup'))
      })
      expect(saveSnapshot).toHaveBeenCalled()
    })
  })
})
