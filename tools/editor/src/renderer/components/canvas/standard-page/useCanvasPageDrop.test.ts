import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCanvasPageDrop } from './useCanvasPageDrop'
import { useTemplateStore } from '../../../store/templateStore'

describe('useCanvasPageDrop', () => {
  it('handles drag over, drag enter, and drag leave', () => {
    const { result } = renderHook(() =>
      useCanvasPageDrop({
        section: 'body',
      })
    )

    expect(result.current.isDragOver).toBe(false)

    // Drag Enter
    const enterEvent = { preventDefault: vi.fn() } as any
    act(() => {
      result.current.handleDragEnter(enterEvent)
    })
    expect(enterEvent.preventDefault).toHaveBeenCalled()
    expect(result.current.isDragOver).toBe(true)

    // Drag Over
    const dataTransfer = { dropEffect: '' }
    const overEvent = { preventDefault: vi.fn(), dataTransfer } as any
    act(() => {
      result.current.handleDragOver(overEvent)
    })
    expect(overEvent.preventDefault).toHaveBeenCalled()
    expect(dataTransfer.dropEffect).toBe('copy')
    expect(result.current.isDragOver).toBe(true)

    // Drag Leave with child element target (should not set isDragOver false)
    const childNode = document.createElement('div')
    const parentNode = document.createElement('div')
    parentNode.appendChild(childNode)
    const leaveChildEvent = {
      currentTarget: parentNode,
      relatedTarget: childNode,
    } as any
    act(() => {
      result.current.handleDragLeave(leaveChildEvent)
    })
    expect(result.current.isDragOver).toBe(true)

    // Drag Leave out of parent
    const outsideNode = document.createElement('div')
    const leaveOutsideEvent = {
      currentTarget: parentNode,
      relatedTarget: outsideNode,
    } as any
    act(() => {
      result.current.handleDragLeave(leaveOutsideEvent)
    })
    expect(result.current.isDragOver).toBe(false)
  })

  it('handles drop with onDropElement callback', () => {
    const onDropElement = vi.fn()
    const containerRef = {
      current: {
        getBoundingClientRect: () => ({ left: 50, top: 100, width: 500, height: 400 }),
      } as HTMLElement,
    }

    const { result } = renderHook(() =>
      useCanvasPageDrop({
        section: 'header',
        scale: 2,
        containerRef,
        onDropElement,
      })
    )

    const payload = JSON.stringify({ type: 'text', value: 'Hello' })
    const dropEvent = {
      preventDefault: vi.fn(),
      clientX: 150, // (150 - 50) / 2 = 50
      clientY: 200, // (200 - 100) / 2 = 50
      dataTransfer: {
        getData: (format: string) => (format === 'application/x-openpdf-element' ? payload : ''),
      },
    } as any

    act(() => {
      result.current.handleDrop(dropEvent)
    })

    expect(dropEvent.preventDefault).toHaveBeenCalled()
    expect(onDropElement).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'text',
        value: 'Hello',
        x: 50,
        y: 50,
      }),
      'header'
    )
  })

  it('handles drop without onDropElement, falling back to addElement and e.currentTarget', () => {
    const addElementMock = vi.fn()
    useTemplateStore.setState({ addElement: addElementMock } as any)

    const { result } = renderHook(() =>
      useCanvasPageDrop({
        section: 'footer',
        scale: 1,
      })
    )

    const payload = JSON.stringify({ id: 'custom-btn-1', type: 'barcode', value: '123' })
    const dropEvent = {
      preventDefault: vi.fn(),
      clientX: 20,
      clientY: 30,
      currentTarget: {
        getBoundingClientRect: () => ({ left: 10, top: 10, width: 300, height: 200 }),
      },
      dataTransfer: {
        getData: (format: string) => (format === 'application/json' ? payload : ''),
      },
    } as any

    act(() => {
      result.current.handleDrop(dropEvent)
    })

    expect(addElementMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'custom-btn-1',
        type: 'barcode',
        x: 10,
        y: 20,
      }),
      'footer'
    )
  })

  it('handles invalid drop payloads gracefully', () => {
    const { result } = renderHook(() =>
      useCanvasPageDrop({
        section: 'body',
      })
    )

    // 1. Empty data
    const emptyDropEvent = {
      preventDefault: vi.fn(),
      dataTransfer: { getData: () => '' },
    } as any
    act(() => {
      result.current.handleDrop(emptyDropEvent)
    })

    // 2. Malformed JSON
    const malformedDropEvent = {
      preventDefault: vi.fn(),
      dataTransfer: { getData: () => 'not-json' },
    } as any
    act(() => {
      result.current.handleDrop(malformedDropEvent)
    })

    // 3. JSON without type
    const noTypeDropEvent = {
      preventDefault: vi.fn(),
      dataTransfer: { getData: () => JSON.stringify({ invalid: true }) },
    } as any
    act(() => {
      result.current.handleDrop(noTypeDropEvent)
    })
  })
})
