import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useContainerChildDrag } from './useContainerChildDrag'
import { useTemplateStore } from '../../../store/templateStore'
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

  it('ignores non-left-click', () => {
    const { result } = renderHook(() => useContainerChildDrag(createOptions()))
    act(() => {
      result.current.handleMouseDown({ button: 2, stopPropagation: vi.fn() } as any)
    })
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

    expect(updateContainerChildElement).toHaveBeenCalledWith(
      'container-1',
      'child-1',
      { x: 40, y: 50 },
      'body'
    )
  })

  it('handles snapping to guides during drag', () => {
    const updateContainerChildElement = vi.fn()
    const onSnapGuide = vi.fn()
    const options = createOptions({
      snapToGuides: true,
      containerPageX: 100,
      containerPageY: 100,
      horizontalGuides: [{ id: 'g-h', position: 150 }],
      verticalGuides: [{ id: 'g-v', position: 150 }],
      updateContainerChildElement,
      onSnapGuide,
    })
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
      // 100 + 40 = 140 -> close to guide at 150 (since containerPageX is 100 + childX: 50 = 150)
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: 140, clientY: 140 }))
    })

    expect(onSnapGuide).toHaveBeenCalled()
    expect(updateContainerChildElement).toHaveBeenCalled()
  })

  it('handles relative child position updates with relativeOffsetY', () => {
    const updateContainerChildElement = vi.fn()
    const relativeChild: Element = {
      ...defaultChild,
      position: 'relative',
      relativeOffsetY: 5,
    }
    const options = createOptions({
      child: relativeChild,
      effectiveY: 20,
      updateContainerChildElement,
    })
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
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 120 }))
    })

    expect(updateContainerChildElement).toHaveBeenCalledWith(
      'container-1',
      'child-1',
      expect.objectContaining({ relativeOffsetY: expect.any(Number) }),
      'body'
    )
  })

  it('handles multi-child dragging', () => {
    const updateElement = vi.fn()
    const child2: Element = {
      id: 'child-2',
      type: 'text',
      x: 100,
      y: 100,
      width: 50,
      height: 20,
    }

    useTemplateStore.setState({
      template: {
        pageSettings: { size: 'A4', orientation: 'portrait', margins: { top: 0, right: 0, bottom: 0, left: 0 } },
        page: [defaultChild, child2],
      } as any,
    })

    const options = createOptions({
      selectedElementIds: ['child-1', 'child-2'],
      updateElement,
    })
    const { result } = renderHook(() => useContainerChildDrag(options))

    act(() => {
      result.current.handleMouseDown({
        button: 0,
        clientX: 50,
        clientY: 50,
        stopPropagation: vi.fn(),
      } as any)
    })

    act(() => {
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: 60, clientY: 70 }))
    })

    expect(updateElement).toHaveBeenCalled()
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
