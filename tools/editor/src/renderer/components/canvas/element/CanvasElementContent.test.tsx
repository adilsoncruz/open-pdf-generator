import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { CanvasElementContent, type CanvasElementContentProps } from './CanvasElementContent'
import type { Template } from '../../../store/templateStore'

describe('CanvasElementContent', () => {
  const mockTemplate: Template = {
    version: '1.0',
    metadata: { name: 'Test' },
    pageSettings: {
      size: 'A4',
      orientation: 'portrait',
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
    },
    page: [],
  }

  const defaultProps: CanvasElementContentProps = {
    element: { id: 'el-1', type: 'text', value: 'Hello World' },
    isSelected: false,
    isEditingText: false,
    editingValue: '',
    location: 'body',
    pageSize: { width: 595, height: 842 },
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    template: mockTemplate,
    testData: null,
    onMouseDown: vi.fn(),
    onDoubleClick: vi.fn(),
    onTextChange: vi.fn(),
    onTextBlur: vi.fn(),
    onTextKeyDown: vi.fn(),
  }

  it('renders text element and matches snapshot', () => {
    const { container } = render(<CanvasElementContent {...defaultProps} />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('renders list element and matches snapshot', () => {
    const { container } = render(
      <CanvasElementContent
        {...defaultProps}
        element={{ id: 'l-1', type: 'list', items: ['Item 1', 'Item 2'] }}
      />
    )
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('renders shape and spacer elements and matches snapshot', () => {
    const { container } = render(
      <CanvasElementContent
        {...defaultProps}
        element={{ id: 'r-1', type: 'rectangle', width: 100, height: 50 }}
      />
    )
    expect(container).toMatchSnapshot()
  })

  it('renders media element and matches snapshot', () => {
    const { container } = render(
      <CanvasElementContent
        {...defaultProps}
        element={{ id: 'img-1', type: 'image', width: 80, height: 80 }}
      />
    )
    expect(container).toMatchSnapshot()
  })

  it('renders table element and matches snapshot', () => {
    const { container } = render(
      <CanvasElementContent
        {...defaultProps}
        element={{
          id: 'tbl-1',
          type: 'table',
          columns: [{ header: 'Col 1', key: 'col1' }],
          data: [{ col1: 'Val 1' }],
        }}
      />
    )
    expect(screen.getByText('Col 1')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('renders loop and container elements and matches snapshot', () => {
    const { container: loopContainer } = render(
      <CanvasElementContent
        {...defaultProps}
        element={{ id: 'lp-1', type: 'loop', loopDataSource: 'items', elements: [] }}
      />
    )
    expect(loopContainer).toMatchSnapshot()

    const { container: contContainer } = render(
      <CanvasElementContent
        {...defaultProps}
        element={{ id: 'c-1', type: 'container', elements: [] }}
      />
    )
    expect(contContainer).toMatchSnapshot()
  })

  it('renders default fallback element and triggers onMouseDown', () => {
    const onMouseDown = vi.fn()
    const { container } = render(
      <CanvasElementContent
        {...defaultProps}
        element={{ id: 'custom-1', type: 'custom_widget' as any }}
        onMouseDown={onMouseDown}
      />
    )

    expect(screen.getByText('custom_widget')).toBeInTheDocument()
    expect(container).toMatchSnapshot()

    fireEvent.mouseDown(screen.getByText('custom_widget'))
    expect(onMouseDown).toHaveBeenCalledTimes(1)
  })
})
