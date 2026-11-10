import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CanvasElement } from './CanvasElement'
import { CanvasElementBoundingBox } from './CanvasElementBoundingBox'
import { resolveElementDimensions } from './elementDimensions'
import { resolveDisplayText } from './resolveDisplayText'
import { useTemplateStore, type Element } from '../../../store/templateStore'
import { useUIStore } from '../../../store/uiStore'

describe('resolveElementDimensions', () => {
  const pageSize = { width: 595, height: 842 }
  const margins = { top: 20, right: 30, bottom: 20, left: 30 }

  it('resolves numeric width and height directly', () => {
    const el: Element = { id: '1', type: 'text', x: 0, y: 0, width: 250, height: 40 }
    const dims = resolveElementDimensions(el, pageSize, margins)
    expect(dims).toEqual({ width: 250, height: 40 })
  })

  it('resolves 100% width to printable page width', () => {
    const el: Element = { id: '2', type: 'text', x: 0, y: 0, width: '100%', height: 50 }
    const dims = resolveElementDimensions(el, pageSize, margins)
    // 595 - 30 - 30 = 535
    expect(dims.width).toBe(535)
    expect(dims.height).toBe(50)
  })

  it('resolves page_break dimensions defaults', () => {
    const el: Element = { id: '3', type: 'page_break', x: 0, y: 0 }
    const dims = resolveElementDimensions(el, pageSize, margins)
    expect(dims.width).toBe(535)
    expect(dims.height).toBe(24)
  })

  it('falls back to default dimensions if not defined', () => {
    const el: Element = { id: '4', type: 'text', x: 0, y: 0 }
    const dims = resolveElementDimensions(el, pageSize, margins)
    expect(dims).toEqual({ width: 100, height: 25 })
  })

  it('uses dom dimensions if provided and element lacks width/height', () => {
    const el: Element = { id: '5', type: 'text', x: 0, y: 0 }
    const dims = resolveElementDimensions(el, pageSize, margins, { width: 180, height: 45 })
    expect(dims).toEqual({ width: 180, height: 45 })
  })
})

describe('resolveDisplayText', () => {
  it('returns value when present', () => {
    expect(resolveDisplayText({ value: 'Invoice #101' }, null)).toBe('Invoice #101')
  })

  it('resolves dataBinding from testData', () => {
    const data = { user: { name: 'Adilson' } }
    expect(resolveDisplayText({ dataBinding: 'user.name' }, data)).toBe('Adilson')
  })

  it('returns template binding when field not found in testData', () => {
    expect(resolveDisplayText({ dataBinding: 'company.name' }, {})).toBe('{{company.name}}')
  })

  it('returns fallback when neither value nor dataBinding is provided', () => {
    expect(resolveDisplayText({}, null, 'Placeholder')).toBe('Placeholder')
  })
})

describe('CanvasElementBoundingBox', () => {
  it('renders resize handles when selected and idle', () => {
    const onResizeMouseDown = vi.fn()
    const { container } = render(
      <CanvasElementBoundingBox
        isSelected={true}
        isDragging={false}
        isResizing={false}
        width={100}
        height={50}
        isWidthFull={false}
        isHeightFull={false}
        onResizeMouseDown={onResizeMouseDown}
      />
    )
    expect(container.querySelectorAll('div').length).toBeGreaterThan(0)
  })

  it('renders active dashed outline during drag or resize', () => {
    render(
      <CanvasElementBoundingBox
        isSelected={true}
        isDragging={true}
        isResizing={false}
        width={100}
        height={50}
        isWidthFull={false}
        isHeightFull={false}
        onResizeMouseDown={vi.fn()}
      />
    )
    expect(screen.getByTestId('canvas-element-active-outline')).toBeInTheDocument()
  })

  it('renders group badge and handles click', () => {
    const openGroupModalSpy = vi.fn()
    ;(useUIStore.getState() as unknown as Record<string, unknown>).openGroupModal = openGroupModalSpy

    const group = { id: 'grp-1', name: 'Header Items' }
    render(
      <CanvasElementBoundingBox
        isSelected={false}
        isDragging={false}
        isResizing={false}
        width={100}
        height={50}
        isWidthFull={false}
        isHeightFull={false}
        elementGroup={group}
        onResizeMouseDown={vi.fn()}
      />
    )

    const badge = screen.getByTestId('canvas-element-group-badge')
    expect(badge).toBeInTheDocument()
    fireEvent.click(badge)
    expect(openGroupModalSpy).toHaveBeenCalledWith(group)
  })
})

describe('CanvasElement integration', () => {
  const baseElement: Element = {
    id: 'el-text-1',
    type: 'text',
    x: 40,
    y: 60,
    width: 150,
    height: 30,
    value: 'Modular Canvas Element',
  }

  const defaultProps = {
    element: baseElement,
    isSelected: false,
    onSelect: vi.fn(),
    onUpdate: vi.fn(),
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    pageSize: { width: 595, height: 842 },
    selectedElementIds: [],
    selectedElementLocation: null,
    allElements: [baseElement],
    updateElement: vi.fn(),
    location: 'page' as const,
  }

  beforeEach(() => {
    useTemplateStore.setState({
      template: {
        version: '1.0',
        metadata: { name: 'Test' },
        pageSettings: {
          size: 'A4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
        },
        page: [baseElement],
        groups: [],
      },
      testData: {},
      selectedElementIds: [],
    })
  })

  it('renders element with value text', () => {
    render(<CanvasElement {...defaultProps} />)
    expect(screen.getByText('Modular Canvas Element')).toBeInTheDocument()
  })

  it('opens context menu on right click', () => {
    const openContextMenuSpy = vi.spyOn(useUIStore.getState(), 'openContextMenu')
    const onSelect = vi.fn()
    const { container } = render(<CanvasElement {...defaultProps} onSelect={onSelect} />)

    const wrapper = container.firstChild as HTMLElement
    fireEvent.contextMenu(wrapper, { clientX: 100, clientY: 150 })

    expect(onSelect).toHaveBeenCalledWith(false)
    expect(openContextMenuSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        x: 100,
        y: 150,
        targetType: 'element',
        elementId: 'el-text-1',
      })
    )
  })
})
