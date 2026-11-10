import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLayersPanel } from './useLayersPanel'
import { useTemplateStore } from '../../../store/templateStore'

describe('useLayersPanel', () => {
  it('manages container and loop expansion and drag state', () => {
    const { result } = renderHook(() => useLayersPanel())

    expect(result.current.isContainerExpanded('c-1')).toBe(true)
    act(() => {
      result.current.toggleContainerExpanded('c-1')
    })
    expect(result.current.isContainerExpanded('c-1')).toBe(false)

    expect(result.current.isLoopExpanded('l-1')).toBe(true)
    act(() => {
      result.current.toggleLoopExpanded('l-1')
    })
    expect(result.current.isLoopExpanded('l-1')).toBe(false)

    // Drag handlers
    const fakeDataTransfer = {
      setData: vi.fn(),
      effectAllowed: '',
      dropEffect: '',
    }
    const fakeDragEvent = {
      stopPropagation: vi.fn(),
      preventDefault: vi.fn(),
      dataTransfer: fakeDataTransfer,
    } as any

    act(() => {
      result.current.handleDragStart(fakeDragEvent, 'elem-1')
    })
    expect(result.current.draggedElementId).toBe('elem-1')

    act(() => {
      result.current.handleDragOver(fakeDragEvent, 'elem-2')
    })
    expect(result.current.dragOverElementId).toBe('elem-2')

    act(() => {
      result.current.handleDragLeave(fakeDragEvent, 'elem-2')
    })
    expect(result.current.dragOverElementId).toBe(null)

    act(() => {
      result.current.handleDrop(fakeDragEvent, 0, 'body')
    })
    expect(result.current.draggedElementId).toBe(null)

    act(() => {
      result.current.handleDragEnd()
    })
    expect(result.current.draggedElementId).toBe(null)

    // Groups lookup
    const groups = result.current.getSectionGroups('body')
    expect(Array.isArray(groups)).toBe(true)
    const headerGroups = result.current.getSectionGroups('header')
    expect(Array.isArray(headerGroups)).toBe(true)
  })
})
