import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useContainerChildInteraction } from './useContainerChildInteraction'
import { useTemplateStore } from '../../../store/templateStore'
import { useUIStore } from '../../../store/uiStore'
import type { Element } from '../../../store/templateStore'

describe('useContainerChildInteraction', () => {
  const childElement: Element = {
    id: 'child-text-1',
    type: 'text',
    dataBinding: 'user.name',
    x: 10,
    y: 10,
    width: 100,
    height: 30,
  }

  const staticChild: Element = {
    id: 'child-static-1',
    type: 'static_text',
    value: 'Static title',
    x: 0,
    y: 0,
    width: 80,
    height: 20,
  }

  beforeEach(() => {
    useTemplateStore.setState({
      selectedContainerChildId: null,
      selectedContainerParentId: null,
      selectedElementIds: [],
    })
    useUIStore.setState({
      contextMenu: null,
      snapToGuides: true,
    })
  })

  it('handles double click and text editing blur for text and static_text', () => {
    const updateContainerChildElement = vi.fn()
    const saveSnapshot = vi.fn()
    useTemplateStore.setState({
      updateContainerChildElement,
      saveSnapshot,
    } as any)

    // 1. Text element double click
    const { result, rerender } = renderHook((props) => useContainerChildInteraction(props), {
      initialProps: {
        child: childElement,
        containerId: 'cont-1',
        location: 'body' as const,
        containerWidth: 500,
        containerHeight: 400,
      },
    })

    act(() => {
      result.current.handleDoubleClick({ stopPropagation: vi.fn() } as any)
    })
    expect(result.current.isEditingText).toBe(true)
    expect(result.current.editingValue).toBe('user.name')

    // Edit text and blur
    act(() => {
      result.current.setEditingValue('user.email')
    })
    act(() => {
      result.current.handleTextEditBlur()
    })
    expect(result.current.isEditingText).toBe(false)
    expect(updateContainerChildElement).toHaveBeenCalledWith(
      'cont-1',
      'child-text-1',
      { dataBinding: 'user.email' },
      'body'
    )
    expect(saveSnapshot).toHaveBeenCalled()

    // 2. Static text element
    const { result: resStatic } = renderHook(() =>
      useContainerChildInteraction({
        child: staticChild,
        containerId: 'cont-1',
        location: 'body',
        containerWidth: 500,
        containerHeight: 400,
      })
    )

    act(() => {
      resStatic.current.handleDoubleClick({ stopPropagation: vi.fn() } as any)
    })
    expect(resStatic.current.isEditingText).toBe(true)
    expect(resStatic.current.editingValue).toBe('Static title')

    act(() => {
      resStatic.current.setEditingValue('Updated title')
    })
    act(() => {
      resStatic.current.handleTextEditBlur()
    })
    expect(updateContainerChildElement).toHaveBeenCalledWith(
      'cont-1',
      'child-static-1',
      { value: 'Updated title' },
      'body'
    )
  })

  it('handles keyboard shortcuts in text editing (Ctrl+Enter, Escape)', () => {
    const { result } = renderHook(() =>
      useContainerChildInteraction({
        child: childElement,
        containerId: 'cont-1',
        location: 'body',
        containerWidth: 500,
        containerHeight: 400,
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
    expect(result.current.editingValue).toBe('user.name')

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
    const selectContainerChild = vi.fn()
    useTemplateStore.setState({ selectContainerChild } as any)

    const { result } = renderHook(() =>
      useContainerChildInteraction({
        child: childElement,
        containerId: 'cont-1',
        location: 'body',
        containerWidth: 500,
        containerHeight: 400,
      })
    )

    act(() => {
      result.current.handleContextMenu({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        clientX: 200,
        clientY: 300,
      } as any)
    })

    expect(selectContainerChild).toHaveBeenCalledWith('cont-1', 'child-text-1', 'body')
    expect(useUIStore.getState().contextMenu).toEqual({
      x: 200,
      y: 300,
      targetType: 'element',
      elementId: 'child-text-1',
      containerId: 'cont-1',
      location: 'body',
    })

    // Dimension resolution
    expect(result.current.resolveWidth(100)).toBe(100)
    expect(result.current.resolveHeight(50)).toBe(50)
  })
})
