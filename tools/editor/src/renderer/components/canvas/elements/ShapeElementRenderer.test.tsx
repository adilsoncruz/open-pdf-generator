import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { ShapeElementRenderer } from './ShapeElementRenderer'
import type { Element, Template } from '../../../store/templateStore'

describe('ShapeElementRenderer', () => {
  const baseTemplate: Template = {
    version: '1.0',
    metadata: { name: 'test' },
    pageSettings: {
      size: 'A4',
      orientation: 'portrait',
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
      header: { height: 50, elements: [{ type: 'rectangle', id: 'rect-h', x: 0, y: 0 }] },
      footer: { height: 40, elements: [{ type: 'line', id: 'line-f', x: 0, y: 0 }] },
      bodyBackground: { elements: [{ type: 'rectangle', id: 'rect-bg', x: 0, y: 0 }] },
    },
    summaryPage: { elements: [{ type: 'rectangle', id: 'rect-s', x: 0, y: 0 }] },
    page: [],
  }

  const pageSize = { width: 595, height: 842 }
  const margins = { top: 20, right: 20, bottom: 20, left: 20 }

  it('renders rectangle in body with custom borders and percentage dimensions', () => {
    const onMouseDown = vi.fn()
    const rect: Element = {
      type: 'rectangle',
      id: 'rect-1',
      x: 0,
      y: 0,
      width: '50%',
      height: 100,
      style: {
        fillColor: '#FF0000',
        borderColor: '#00FF00',
        borderWidth: 2,
        cornerRadius: 8,
      },
    }

    const { container } = render(
      <ShapeElementRenderer
        element={rect}
        template={baseTemplate}
        pageSize={pageSize}
        margins={margins}
        isSelected={true}
        onMouseDown={onMouseDown}
      />
    )

    const el = container.firstElementChild as HTMLElement
    expect(el).toBeInTheDocument()
    expect(el.className).toContain('ring-2')
    fireEvent.mouseDown(el)
    expect(onMouseDown).toHaveBeenCalled()
  })

  it('renders rectangle in header, footer, background and summary', () => {
    const onMouseDown = vi.fn()
    const rectHeader: Element = { type: 'rectangle', id: 'rect-h', x: 0, y: 0, width: 100, height: 30 }
    const rectFooter: Element = { type: 'rectangle', id: 'line-f', x: 0, y: 0, width: 100, height: 20 }
    const rectBg: Element = { type: 'rectangle', id: 'rect-bg', x: 0, y: 0, width: 100, height: 20 }
    const rectS: Element = { type: 'rectangle', id: 'rect-s', x: 0, y: 0, width: 100, height: 20 }

    render(
      <ShapeElementRenderer
        element={rectHeader}
        template={baseTemplate}
        pageSize={pageSize}
        margins={margins}
        isSelected={false}
        onMouseDown={onMouseDown}
      />
    )

    render(
      <ShapeElementRenderer
        element={rectFooter}
        template={baseTemplate}
        pageSize={pageSize}
        margins={margins}
        isSelected={false}
        onMouseDown={onMouseDown}
      />
    )

    render(
      <ShapeElementRenderer
        element={rectBg}
        template={baseTemplate}
        pageSize={pageSize}
        margins={margins}
        isSelected={false}
        onMouseDown={onMouseDown}
      />
    )

    render(
      <ShapeElementRenderer
        element={rectS}
        template={baseTemplate}
        pageSize={pageSize}
        margins={margins}
        isSelected={false}
        onMouseDown={onMouseDown}
      />
    )
  })

  it('renders line with diagonal and straight styles and across sections', () => {
    const onMouseDown = vi.fn()
    const line: Element = {
      type: 'line',
      id: 'line-1',
      x: 0,
      y: 0,
      width: '100%',
      height: 10,
      style: {
        color: '#333333',
        width: 3,
        style: 'dashed',
      },
    }

    const tplWithLine: Template = {
      ...baseTemplate,
      summaryPage: { elements: [{ ...line, id: 'line-s' }] },
      pageSettings: {
        ...baseTemplate.pageSettings,
        header: { height: 60, elements: [{ ...line, id: 'line-h' }] },
        footer: { height: 50, elements: [{ ...line, id: 'line-f' }] },
      },
    }

    const { container, rerender } = render(
      <ShapeElementRenderer
        element={line}
        template={baseTemplate}
        pageSize={pageSize}
        margins={margins}
        isSelected={false}
        onMouseDown={onMouseDown}
      />
    )
    expect(container).toMatchSnapshot()

    // Line in header
    rerender(
      <ShapeElementRenderer
        element={{ ...line, id: 'line-h' }}
        template={tplWithLine}
        pageSize={pageSize}
        margins={margins}
        isSelected={true}
        onMouseDown={onMouseDown}
      />
    )
    expect(container).toMatchSnapshot()

    // Line in footer
    rerender(
      <ShapeElementRenderer
        element={{ ...line, id: 'line-f' }}
        template={tplWithLine}
        pageSize={pageSize}
        margins={margins}
        isSelected={false}
        onMouseDown={onMouseDown}
      />
    )

    // Line in summary
    rerender(
      <ShapeElementRenderer
        element={{ ...line, id: 'line-s' }}
        template={tplWithLine}
        pageSize={pageSize}
        margins={margins}
        isSelected={false}
        onMouseDown={onMouseDown}
      />
    )

    // Unknown element returns null
    const { container: emptyContainer } = render(
      <ShapeElementRenderer
        element={{ type: 'unknown' as any, id: 'u1' }}
        template={baseTemplate}
        pageSize={pageSize}
        margins={margins}
        isSelected={false}
        onMouseDown={onMouseDown}
      />
    )
    expect(emptyContainer.firstChild).toBeNull()
  })
})
