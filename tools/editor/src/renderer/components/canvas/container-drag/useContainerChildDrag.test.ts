import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useContainerChildDrag } from './useContainerChildDrag'
import type { Element } from '../../../store/templateStore'

describe('useContainerChildDrag', () => {
  const defaultChild: Element = {
    id: 'child-1',
    type: 'text',
    x: 10,
    y: 10,
    width: 80,
    height: 30,
  }

  const createOptions = (overrides = {}) => ({
    child: defaultChild,
    containerId: 'container-1',
    location: 'body' as const,
    containerWidth: 500,
    containerHeight: 400,
    scale: 1,
    snapToGuides: false,
    horizontalGuides: [],
    verticalGuides: [],
    isSelected: true,
    selectedElementIds: ['child-1'],
    selectContainerChild: vi.fn(),
    toggleElementSelection: vi.fn(),
    updateContainerChildElement: vi.fn(),
    updateElement: vi.fn(),
    saveSnapshot: vi.fn(),
    onSnapGuide: vi.fn(),
    resolveWidth: (w: any) => (typeof w === 'number' ? w : 80),
    resolveHeight: (h: any) => (typeof h === 'number' ? h : 30),
    ...overrides,
  })

  it('initializes with isDragging false', () => {
    const { result } = renderHook(() => useContainerChildDrag(createOptions()))
    expect(result.current.isDragging).toBe(false)
  })

  it('selects container child and starts dragging on mousedown', () => {
    const selectChildMock = vi.fn()
    const options = createOptions({ isSelected: false, selectContainerChild: selectChildMock })
    const { result } = renderHook(() => useContainerChildDrag(options))

    const mouseEvent = {
      button: 0,
      clientX: 50,
      clientY: 60,
      stopPropagation: vi.fn(),
    } as any

    act(() => {
      result.current.handleMouseDown(mouseEvent)
    })

    expect(mouseEvent.stopPropagation).toHaveBeenCalled()
    expect(selectChildMock).toHaveBeenCalledWith('container-1', 'child-1', 'body')
    expect(result.current.isDragging).toBe(true)
  })

  it('toggles selection when modifier key is pressed', () => {
    const toggleMock = vi.fn()
    const options = createOptions({ toggleElementSelection: toggleMock })
    const { result } = renderHook(() => useContainerChildDrag(options))

    act(() => {
      result.current.handleMouseDown({
        button: 0,
        shiftKey: true,
        stopPropagation: vi.fn(),
      } as any)
    })

    expect(toggleMock).toHaveBeenCalledWith('child-1', 'body')
    expect(result.current.isDragging).toBe(false)
  })

  it('updates child element position during mouse move', () => {
    const updateContainerChildElement = vi.fn()
    const options = createOptions({ updateContainerChildElement })
    const { result } = renderHook(() => useContainerChildDrag(options))

    act(() => {
      result.current.handleMouseDown({
        button: 0,
        clientX: 100,
        clientY: 100,
        stopPropagation: vi.fn(),
      } as any)
    })

    act(() => {
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: 130, clientY: 140 }))
    })

    // initialX: 10 + deltaX: 30 = 40, initialY: 10 + deltaY: 40 = 50
    expect(updateContainerChildElement).toHaveBeenCalledWith(
      'container-1',
      'child-1',
      { x: 40, y: 50 },
      'body'
    )
  })

  it('ends dragging on mouseup and calls saveSnapshot', () => {
    const saveSnapshot = vi.fn()
    const onSnapGuide = vi.fn()
    const options = createOptions({ saveSnapshot, onSnapGuide })
    const { result } = renderHook(() => useContainerChildDrag(options))

    act(() => {
      result.current.handleMouseDown({
        button: 0,
        clientX: 100,
        clientY: 100,
        stopPropagation: vi.fn(),
      } as any)
    })

    expect(result.current.isDragging).toBe(true)

    act(() => {
      window.dispatchEvent(new MouseEvent('mouseup'))
    })

    expect(result.current.isDragging).toBe(false)
    expect(onSnapGuide).toHaveBeenCalledWith({ h: null, v: null })
    expect(saveSnapshot).toHaveBeenCalled()
  })
})
