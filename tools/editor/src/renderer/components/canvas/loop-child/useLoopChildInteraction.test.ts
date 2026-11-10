import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLoopChildInteraction } from './useLoopChildInteraction'
import { useTemplateStore } from '../../../store/templateStore'
import { useUIStore } from '../../../store/uiStore'
import type { Element } from '../../../store/templateStore'

describe('useLoopChildInteraction', () => {
  const loopChild: Element = {
    id: 'loop-child-text-1',
    type: 'text',
    dataBinding: 'item.name',
    x: 10,
    y: 10,
    width: 100,
    height: 30,
  }

  const staticChild: Element = {
    id: 'loop-child-static-1',
    type: 'static_text',
    value: 'Item Static Title',
    x: 0,
    y: 0,
    width: 80,
    height: 20,
  }

  beforeEach(() => {
    useTemplateStore.setState({
      selectedLoopChildId: null,
      selectedLoopParentId: null,
      selectedElementIds: [],
    })
    useUIStore.setState({
      contextMenu: null,
      snapToGuides: true,
    })
  })

  it('handles double click and text editing blur for text and static_text', () => {
    const updateLoopChildElement = vi.fn()
    const saveSnapshot = vi.fn()
    useTemplateStore.setState({
      updateLoopChildElement,
      saveSnapshot,
    } as any)

    // 1. Text element double click
    const { result } = renderHook(() =>
      useLoopChildInteraction({
        child: loopChild,
        loopId: 'loop-1',
        location: 'body',
        loopWidth: 500,
        loopHeight: 400,
      })
    )

    act(() => {
      result.current.handleDoubleClick({ stopPropagation: vi.fn() } as any)
    })
    expect(result.current.isEditingText).toBe(true)
    expect(result.current.editingValue).toBe('item.name')

    // Edit text and blur
    act(() => {
      result.current.setEditingValue('item.sku')
    })
    act(() => {
      result.current.handleTextEditBlur()
    })
    expect(result.current.isEditingText).toBe(false)
    expect(updateLoopChildElement).toHaveBeenCalledWith(
      'loop-1',
      'loop-child-text-1',
      { dataBinding: 'item.sku' }
    )
    expect(saveSnapshot).toHaveBeenCalled()

    // 2. Static text element
    const { result: resStatic } = renderHook(() =>
      useLoopChildInteraction({
        child: staticChild,
        loopId: 'loop-1',
        location: 'body',
        loopWidth: 500,
        loopHeight: 400,
      })
    )

    act(() => {
      resStatic.current.handleDoubleClick({ stopPropagation: vi.fn() } as any)
    })
    expect(resStatic.current.isEditingText).toBe(true)
    expect(resStatic.current.editingValue).toBe('Item Static Title')

    act(() => {
      resStatic.current.setEditingValue('Updated Item Title')
    })
    act(() => {
      resStatic.current.handleTextEditBlur()
    })
    expect(updateLoopChildElement).toHaveBeenCalledWith(
      'loop-1',
      'loop-child-static-1',
      { value: 'Updated Item Title' }
    )
  })

  it('handles keyboard shortcuts in text editing (Ctrl+Enter, Escape)', () => {
    const { result } = renderHook(() =>
      useLoopChildInteraction({
        child: loopChild,
        loopId: 'loop-1',
        location: 'body',
        loopWidth: 500,
        loopHeight: 400,
      })
    )

    act(() => {
      result.current.handleDoubleClick({ stopPropagation: vi.fn() } as any)
    })
    expect(result.current.isEditingText).toBe(true)

    // Escape reverts
    act(() => {
      result.current.setEditingValue('temporary')
      result.current.handleTextEditKeyDown({ key: 'Escape' } as any)
    })
    expect(result.current.isEditingText).toBe(false)
    expect(result.current.editingValue).toBe('item.name')

    // Ctrl+Enter commits
    act(() => {
      result.current.handleDoubleClick({ stopPropagation: vi.fn() } as any)
      result.current.handleTextEditKeyDown({
        key: 'Enter',
        ctrlKey: true,
        preventDefault: vi.fn(),
      } as any)
    })
    expect(result.current.isEditingText).toBe(false)
  })

  it('handles context menu opening and dimension resolution', () => {
    const selectLoopChild = vi.fn()
    useTemplateStore.setState({ selectLoopChild } as any)

    const { result } = renderHook(() =>
      useLoopChildInteraction({
        child: loopChild,
        loopId: 'loop-1',
        location: 'body',
        loopWidth: 500,
        loopHeight: 400,
      })
    )

    act(() => {
      result.current.handleContextMenu({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        clientX: 250,
        clientY: 350,
      } as any)
    })

    expect(selectLoopChild).toHaveBeenCalledWith('loop-1', 'loop-child-text-1', 'body')
    expect(useUIStore.getState().contextMenu).toEqual({
      x: 250,
      y: 350,
      targetType: 'element',
      elementId: 'loop-child-text-1',
      loopId: 'loop-1',
      location: 'body',
    })

    // Dimension resolution
    expect(result.current.resolveWidth(120)).toBe(120)
    expect(result.current.resolveHeight(60)).toBe(60)
  })
})
