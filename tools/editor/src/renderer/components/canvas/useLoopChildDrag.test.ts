import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLoopChildDrag } from './useLoopChildDrag'
import type { Element } from '../../store/templateStore'

describe('useLoopChildDrag', () => {
  const child: Element = {
    type: 'text',
    id: 'lc-1',
    x: 20,
    y: 20,
    width: 100,
    height: 30,
  }

  it('handles mouse down, drag move and mouse up with snapping', () => {
    const selectLoopChild = vi.fn()
    const toggleElementSelection = vi.fn()
    const updateLoopChildElement = vi.fn()
    const saveSnapshot = vi.fn()
    const onSnapGuide = vi.fn()

    const { result } = renderHook(() =>
      useLoopChildDrag({
        child,
        loopId: 'loop-1',
        location: 'body',
        loopWidth: 400,
        loopHeight: 200,
        scale: 1,
        snapToGuides: true,
        horizontalGuides: [100],
        verticalGuides: [100],
        loopPageX: 50,
        loopPageY: 50,
        isSelected: false,
        selectLoopChild,
        toggleElementSelection,
        updateLoopChildElement,
        saveSnapshot,
        onSnapGuide,
        resolveWidth: (w) => (typeof w === 'number' ? w : 100),
        resolveHeight: (h) => (typeof h === 'number' ? h : 30),
      })
    )

    // Mouse down
    act(() => {
      result.current.handleMouseDown({
        button: 0,
        stopPropagation: vi.fn(),
        clientX: 50,
        clientY: 50,
        ctrlKey: false,
      } as any)
    })
    expect(selectLoopChild).toHaveBeenCalledWith('loop-1', 'lc-1', 'body')
    expect(result.current.isDragging).toBe(true)

    // Mouse move
    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 70, clientY: 70 }))
    })
    expect(updateLoopChildElement).toHaveBeenCalled()

    // Mouse up
    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup'))
    })
    expect(saveSnapshot).toHaveBeenCalled()
  })

  it('handles toggle selection on ctrl/meta key', () => {
    const toggleElementSelection = vi.fn()
    const { result } = renderHook(() =>
      useLoopChildDrag({
        child,
        loopId: 'loop-1',
        location: 'body',
        loopWidth: 400,
        loopHeight: 200,
        scale: 1,
        snapToGuides: false,
        isSelected: true,
        selectLoopChild: vi.fn(),
        toggleElementSelection,
        updateLoopChildElement: vi.fn(),
        saveSnapshot: vi.fn(),
        resolveWidth: (w) => (typeof w === 'number' ? w : 100),
        resolveHeight: (h) => (typeof h === 'number' ? h : 30),
      })
    )

    act(() => {
      result.current.handleMouseDown({
        button: 0,
        stopPropagation: vi.fn(),
        ctrlKey: true,
      } as any)
    })
    expect(toggleElementSelection).toHaveBeenCalledWith('lc-1', 'body')
    expect(result.current.isDragging).toBe(false)
  })

  it('ignores non-primary mouse button clicks', () => {
    const selectLoopChild = vi.fn()
    const { result } = renderHook(() =>
      useLoopChildDrag({
        child,
        loopId: 'loop-1',
        location: 'body',
        loopWidth: 400,
        loopHeight: 200,
        snapToGuides: false,
        isSelected: false,
        selectLoopChild,
        toggleElementSelection: vi.fn(),
        updateLoopChildElement: vi.fn(),
        saveSnapshot: vi.fn(),
        resolveWidth: (w) => (typeof w === 'number' ? w : 100),
        resolveHeight: (h) => (typeof h === 'number' ? h : 30),
      })
    )

    act(() => {
      result.current.handleMouseDown({
        button: 1, // Middle click
        stopPropagation: vi.fn(),
      } as any)
    })
    expect(selectLoopChild).not.toHaveBeenCalled()
    expect(result.current.isDragging).toBe(false)
  })

  it('covers all guide snapping edges: right, center, bottom, horizontal/vertical guides', () => {
    const updateLoopChildElement = vi.fn()
    const onSnapGuide = vi.fn()

    // child at x: 295, y: 165 with width: 100, height: 30 in a 400x200 loop
    // 295 + 100 = 395 (close to 400 -> right boundary snap)
    // 165 + 30 = 195 (close to 200 -> bottom boundary snap)
    const snappingChild: Element = {
      type: 'text',
      id: 'lc-snap',
      x: 295,
      y: 165,
      width: 100,
      height: 30,
      position: 'relative',
    }

    const { result } = renderHook(() =>
      useLoopChildDrag({
        child: snappingChild,
        loopId: 'loop-1',
        location: 'body',
        loopWidth: 400,
        loopHeight: 200,
        scale: 1,
        snapToGuides: true,
        horizontalGuides: [100, 150, 180],
        verticalGuides: [100, 200, 350],
        loopPageX: 50,
        loopPageY: 50,
        isSelected: true,
        selectLoopChild: vi.fn(),
        toggleElementSelection: vi.fn(),
        updateLoopChildElement,
        saveSnapshot: vi.fn(),
        onSnapGuide,
        resolveWidth: () => 100,
        resolveHeight: () => 30,
        effectiveY: 10,
      })
    )

    // Start drag
    act(() => {
      result.current.handleMouseDown({
        button: 0,
        stopPropagation: vi.fn(),
        clientX: 300,
        clientY: 170,
      } as any)
    })

    // Move to trigger right edge snap (x + width close to loopWidth 400) and bottom edge snap
    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 303, clientY: 173 }))
    })
    expect(updateLoopChildElement).toHaveBeenCalled()

    // Move to trigger center X & Y snap
    // Loop center: 200, child center: 150 + 50 = 200 -> initialX 150
    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 155, clientY: 88 }))
    })
    expect(updateLoopChildElement).toHaveBeenCalled()

    // Move near guidePageX 350 -> guideLocalX = 300 (child width 100, x = 200 is right edge snap)
    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 204, clientY: 100 }))
    })
    expect(onSnapGuide).toHaveBeenCalled()

    // Move to trigger top boundary snap (newY close to 0) and guide center snap
    // guideLocalX = 100 - 50 = 50. child center at 50 -> x = 0
    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 52, clientY: 3 }))
    })
    expect(onSnapGuide).toHaveBeenCalled()

    // Mouse up
    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup'))
    })
    expect(onSnapGuide).toHaveBeenCalledWith({ h: null, v: null })
  })

  it('handles relative element dragging with effectiveY and 100% dimension clamping', () => {
    const updateLoopChildElement = vi.fn()
    const relativeChild: Element = {
      type: 'text',
      id: 'lc-rel',
      x: 0,
      y: 0,
      width: '100%',
      height: '100%',
      positionMode: 'RELATIVE',
      relativeOffsetY: 10,
    }

    const { result } = renderHook(() =>
      useLoopChildDrag({
        child: relativeChild,
        loopId: 'loop-1',
        location: 'body',
        loopWidth: 400,
        loopHeight: 200,
        scale: 1,
        snapToGuides: false,
        isSelected: true,
        selectLoopChild: vi.fn(),
        toggleElementSelection: vi.fn(),
        updateLoopChildElement,
        saveSnapshot: vi.fn(),
        resolveWidth: () => 400,
        resolveHeight: () => 200,
        effectiveY: 20,
      })
    )

    act(() => {
      result.current.handleMouseDown({
        button: 0,
        stopPropagation: vi.fn(),
        clientX: 10,
        clientY: 10,
      } as any)
    })

    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 20, clientY: 25 }))
    })

    expect(updateLoopChildElement).toHaveBeenCalledWith(
      'loop-1',
      'lc-rel',
      { x: 0, y: 0, relativeOffsetY: 0 },
      'body'
    )
  })
})
