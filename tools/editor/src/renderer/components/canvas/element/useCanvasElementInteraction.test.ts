import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCanvasElementInteraction } from './useCanvasElementInteraction'
import { useTemplateStore, type Element } from '../../../store/templateStore'
import { useUIStore } from '../../../store/uiStore'

describe('useCanvasElementInteraction', () => {
  const baseProps = {
    element: { id: 'el-1', type: 'text', x: 10, y: 10, width: 100, height: 30, dataBinding: 'user.name' } as Element,
    isSelected: false,
    scale: 1,
    onSelect: vi.fn(),
    onUpdate: vi.fn(),
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    pageSize: { width: 595, height: 842 },
    selectedElementIds: [],
    selectedElementLocation: 'body' as const,
    allElements: [],
    updateElement: vi.fn(),
    location: 'body' as const,
    horizontalGuides: [],
    verticalGuides: [],
    onSnapGuide: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    useTemplateStore.setState({
      template: {
        version: '1.0',
        metadata: { name: 'Test' },
        pageSettings: {
          size: 'A4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
          header: { height: 40, elements: [], groups: [{ id: 'grp-header', name: 'Header Group', elementIds: ['el-h'], location: 'header' as const }] },
          footer: { height: 30, elements: [], groups: [{ id: 'grp-footer', name: 'Footer Group', elementIds: ['el-f'], location: 'footer' as const }] },
          bodyBackground: { elements: [], groups: [{ id: 'grp-bg', name: 'BG Group', elementIds: ['el-bg'], location: 'bodyBackground' as const }] },
        },
        groups: [{ id: 'grp-body', name: 'Body Group', elementIds: ['el-1'], location: 'body' as const }],
        page: [],
      },
    })
  })

  it('finds element group across body, header, footer, and background', () => {
    // Body group
    const { result: resBody } = renderHook(() =>
      useCanvasElementInteraction({
        ...baseProps,
        element: { ...baseProps.element, groupId: 'grp-body' },
      })
    )
    expect(resBody.current.elementGroup?.name).toBe('Body Group')

    // Header group
    const { result: resHeader } = renderHook(() =>
      useCanvasElementInteraction({
        ...baseProps,
        element: { ...baseProps.element, groupId: 'grp-header' },
      })
    )
    expect(resHeader.current.elementGroup?.name).toBe('Header Group')

    // Footer group
    const { result: resFooter } = renderHook(() =>
      useCanvasElementInteraction({
        ...baseProps,
        element: { ...baseProps.element, groupId: 'grp-footer' },
      })
    )
    expect(resFooter.current.elementGroup?.name).toBe('Footer Group')

    // Background group
    const { result: resBg } = renderHook(() =>
      useCanvasElementInteraction({
        ...baseProps,
        element: { ...baseProps.element, groupId: 'grp-bg' },
      })
    )
    expect(resBg.current.elementGroup?.name).toBe('BG Group')

    // No groupId
    const { result: resNone } = renderHook(() =>
      useCanvasElementInteraction({
        ...baseProps,
        element: { ...baseProps.element, groupId: undefined },
      })
    )
    expect(resNone.current.elementGroup).toBeNull()
  })

  it('handles double click and text editing lifecycle for text and static_text', () => {
    const onUpdate = vi.fn()
    const { result } = renderHook(() =>
      useCanvasElementInteraction({
        ...baseProps,
        onUpdate,
      })
    )

    // Double click to start editing text
    act(() => {
      result.current.handleDoubleClick({ stopPropagation: vi.fn() } as any)
    })
    expect(result.current.isEditingText).toBe(true)
    expect(result.current.editingValue).toBe('user.name')

    // Change editing value
    act(() => {
      result.current.setEditingValue('user.email')
    })
    expect(result.current.editingValue).toBe('user.email')

    // KeyDown with Escape restores original value
    act(() => {
      result.current.handleTextEditKeyDown({ key: 'Escape' } as any)
    })
    expect(result.current.isEditingText).toBe(false)
    expect(result.current.editingValue).toBe('user.name')

    // Start editing again and save with Ctrl+Enter
    act(() => {
      result.current.handleDoubleClick({ stopPropagation: vi.fn() } as any)
      result.current.setEditingValue('user.address')
    })
    act(() => {
      result.current.handleTextEditKeyDown({
        key: 'Enter',
        ctrlKey: true,
        preventDefault: vi.fn(),
      } as any)
    })
    expect(onUpdate).toHaveBeenCalledWith({ dataBinding: 'user.address' })

    // Test static_text element editing
    const onUpdateStatic = vi.fn()
    const { result: resStatic } = renderHook(() =>
      useCanvasElementInteraction({
        ...baseProps,
        element: { id: 'st-1', type: 'static_text', x: 0, y: 0, value: 'Initial Title' },
        onUpdate: onUpdateStatic,
      })
    )
    act(() => {
      resStatic.current.handleDoubleClick({ stopPropagation: vi.fn() } as any)
    })
    expect(resStatic.current.editingValue).toBe('Initial Title')

    act(() => {
      resStatic.current.setEditingValue('Updated Title')
    })
    act(() => {
      resStatic.current.handleTextEditBlur()
    })
    expect(onUpdateStatic).toHaveBeenCalledWith({ value: 'Updated Title' })
  })

  it('handles context menu and opens context menu in uiStore', () => {
    const onSelect = vi.fn()
    const { result } = renderHook(() =>
      useCanvasElementInteraction({
        ...baseProps,
        selectedElementIds: [],
        onSelect,
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

    expect(onSelect).toHaveBeenCalledWith(false)
    const ctx = useUIStore.getState().contextMenu
    expect(ctx).not.toBeNull()
    expect(ctx?.x).toBe(250)
    expect(ctx?.y).toBe(350)
    expect(ctx?.targetType).toBe('element')
  })

  it('handles context menu on container element', () => {
    const { result } = renderHook(() =>
      useCanvasElementInteraction({
        ...baseProps,
        element: { id: 'c-1', type: 'container', x: 0, y: 0, width: 200, height: 100 },
        selectedElementIds: ['c-1'],
      })
    )

    act(() => {
      result.current.handleContextMenu({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        clientX: 100,
        clientY: 100,
      } as any)
    })

    const ctx = useUIStore.getState().contextMenu
    expect(ctx?.targetType).toBe('container')
  })

  it('checks applySnap and full width/height helpers', () => {
    const onSnapGuide = vi.fn()
    const { result } = renderHook(() =>
      useCanvasElementInteraction({
        ...baseProps,
        element: { ...baseProps.element, width: '100%', height: '100%' },
        onSnapGuide,
      })
    )

    expect(result.current.isWidthFull).toBe(true)
    expect(result.current.isHeightFull).toBe(true)

    const snapped = result.current.applySnap(3, 4, 100, 50)
    expect(snapped.x).toBe(0)
    expect(snapped.y).toBe(0)
  })
})
