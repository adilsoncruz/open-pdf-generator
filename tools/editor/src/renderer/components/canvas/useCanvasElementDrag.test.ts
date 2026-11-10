import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCanvasElementDrag } from './useCanvasElementDrag'
import type { Element } from '../../store/templateStore'

describe('useCanvasElementDrag', () => {
  const element: Element = {
    type: 'text',
    id: 'el-1',
    x: 50,
    y: 60,
    width: 100,
    height: 30,
  }

  it('handles mouse down, drag move and mouse up for single element', () => {
    const onSelect = vi.fn()
    const onUpdate = vi.fn()
    const updateElement = vi.fn()
    const saveSnapshot = vi.fn()
    const applySnap = vi.fn((x, y) => ({ x, y }))

    const { result } = renderHook(() =>
      useCanvasElementDrag({
        element,
        scale: 1,
        isMultiSelection: false,
        snapToGuides: true,
        allElements: [element],
        selectedElementLocation: 'body',
        onSelect,
        onUpdate,
        updateElement,
        saveSnapshot,
        getElementDimensions: () => ({ width: 100, height: 30 }),
        applySnap,
      })
    )

    expect(result.current.isDragging).toBe(false)

    // Mouse down
    act(() => {
      result.current.handleMouseDown({
        stopPropagation: vi.fn(),
        clientX: 100,
        clientY: 100,
        ctrlKey: false,
        metaKey: false,
      } as any)
    })
    expect(onSelect).toHaveBeenCalledWith(false)

    // Mouse move
    act(() => {
      const moveEvent = new MouseEvent('mousemove', { clientX: 120, clientY: 130 })
      document.dispatchEvent(moveEvent)
    })
    expect(onUpdate).toHaveBeenCalledWith({ x: 70, y: 90 })

    // Mouse up
    act(() => {
      const upEvent = new MouseEvent('mouseup')
      document.dispatchEvent(upEvent)
    })
    expect(saveSnapshot).toHaveBeenCalled()
  })

  it('handles multi-selection drag movement', () => {
    const el2: Element = { type: 'text', id: 'el-2', x: 200, y: 200, width: 80, height: 20 }
    const onUpdate = vi.fn()
    const updateElement = vi.fn()
    const saveSnapshot = vi.fn()
    const applySnap = vi.fn((x, y) => ({ x, y }))

    const { result } = renderHook(() =>
      useCanvasElementDrag({
        element,
        scale: 1,
        isMultiSelection: true,
        snapToGuides: false,
        allElements: [element, el2],
        selectedElementLocation: 'body',
        onSelect: vi.fn(),
        onUpdate,
        updateElement,
        saveSnapshot,
        getElementDimensions: () => ({ width: 100, height: 30 }),
        applySnap,
      })
    )

    act(() => {
      result.current.handleMouseDown({
        stopPropagation: vi.fn(),
        clientX: 100,
        clientY: 100,
        ctrlKey: true,
      } as any)
    })

    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 110, clientY: 110 }))
    })

    expect(updateElement).toHaveBeenCalledWith('el-1', { x: 60, y: 70 }, 'body')
    expect(updateElement).toHaveBeenCalledWith('el-2', { x: 210, y: 210 }, 'body')

    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup'))
    })
    expect(saveSnapshot).toHaveBeenCalled()
  })

  it('handles 100% width and relative positioning', () => {
    const relElement: Element = {
      type: 'text',
      id: 'el-rel',
      x: 0,
      y: 0,
      width: '100%',
      height: 30,
      position: 'RELATIVE',
      relativeOffsetY: 10,
    }
    const onUpdate = vi.fn()

    const { result } = renderHook(() =>
      useCanvasElementDrag({
        element: relElement,
        effectiveY: 40,
        isMultiSelection: false,
        snapToGuides: false,
        allElements: [relElement],
        selectedElementLocation: 'body',
        onSelect: vi.fn(),
        onUpdate,
        updateElement: vi.fn(),
        saveSnapshot: vi.fn(),
        getElementDimensions: () => ({ width: 500, height: 30 }),
        applySnap: (x, y) => ({ x, y }),
      })
    )

    act(() => {
      result.current.handleMouseDown({
        stopPropagation: vi.fn(),
        clientX: 50,
        clientY: 50,
      } as any)
    })

    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 70, clientY: 70 }))
    })

    expect(onUpdate).toHaveBeenCalledWith({ x: 0, y: 60, relativeOffsetY: 30 })
  })

  it('handles multi-selection with snapToGuides and relative height 100%', () => {
    const el2: Element = { type: 'text', id: 'el-2', x: 200, y: 200, width: 80, height: 20 }
    const onUpdate = vi.fn()
    const updateElement = vi.fn()
    const saveSnapshot = vi.fn()
    const onSnapGuide = vi.fn()
    const applySnap = vi.fn((x, y) => ({ x: x + 5, y: y + 5 }))

    const { result } = renderHook(() =>
      useCanvasElementDrag({
        element,
        scale: 1,
        isMultiSelection: true,
        snapToGuides: true,
        allElements: [element, el2],
        selectedElementLocation: 'body',
        onSelect: vi.fn(),
        onUpdate,
        updateElement,
        saveSnapshot,
        getElementDimensions: () => ({ width: 100, height: 30 }),
        applySnap,
        onSnapGuide,
      })
    )

    act(() => {
      result.current.handleMouseDown({
        stopPropagation: vi.fn(),
        clientX: 100,
        clientY: 100,
      } as any)
    })

    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 110, clientY: 110 }))
    })

    expect(applySnap).toHaveBeenCalled()
    expect(updateElement).toHaveBeenCalled()

    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup'))
    })
    expect(onSnapGuide).toHaveBeenCalledWith({ h: null, v: null })

    // Test height 100% relative
    const rel100: Element = {
      type: 'container',
      id: 'c-100',
      x: 0,
      y: 0,
      width: '100%',
      height: '100%',
      positionMode: 'RELATIVE',
    }
    const updateRel = vi.fn()
    const { result: res100 } = renderHook(() =>
      useCanvasElementDrag({
        element: rel100,
        effectiveY: 10,
        isMultiSelection: false,
        snapToGuides: false,
        allElements: [rel100],
        selectedElementLocation: 'body',
        onSelect: vi.fn(),
        onUpdate: updateRel,
        updateElement: vi.fn(),
        saveSnapshot: vi.fn(),
        getElementDimensions: () => ({ width: 500, height: 500 }),
        applySnap: (x, y) => ({ x, y }),
      })
    )

    act(() => {
      res100.current.handleMouseDown({
        stopPropagation: vi.fn(),
        clientX: 50,
        clientY: 50,
      } as any)
    })

    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 80, clientY: 80 }))
    })

    expect(updateRel).toHaveBeenCalledWith({ x: 0, y: 0, relativeOffsetY: 0 })
  })
})
