import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { TableElementRenderer } from './TableElementRenderer'
import type { Element } from '../../../store/templateStore'

describe('TableElementRenderer', () => {
  it('renders table with columns, borders and sample rows', () => {
    const onMouseDown = vi.fn()
    const tableEl: Element = {
      type: 'table',
      id: 'table-1',
      x: 0,
      y: 0,
      width: 400,
      columns: [
        { header: 'Col 1', field: 'c1', width: 200, alignment: 'left' },
        { header: 'Col 2', field: 'c2', width: 200, alignment: 'right' },
      ],
      style: {
        headerBackground: '#E2E8F0',
        headerTextColor: '#000000',
        headerBorderType: 'columns',
        cellBorderType: 'rows',
        borderColor: '#CCCCCC',
        fontSize: 11,
      },
    }

    const { getByText, container } = render(
      <TableElementRenderer element={tableEl} isSelected={true} onMouseDown={onMouseDown} />
    )

    expect(getByText('Col 1')).toBeInTheDocument()
    expect(getByText('Col 2')).toBeInTheDocument()
    expect(container).toMatchSnapshot()

    const wrapper = container.firstElementChild as HTMLElement
    fireEvent.mouseDown(wrapper)
    expect(onMouseDown).toHaveBeenCalled()
  })

  it('renders table with row header borders and cells/row cell borders', () => {
    const tableEl: Element = {
      type: 'table',
      id: 'table-row-borders',
      x: 0,
      y: 0,
      width: 400,
      columns: [
        { header: 'H1', field: 'f1', width: 200, alignment: 'center', verticalAlignment: 'top' },
        { header: 'H2', field: 'f2', width: 200, alignment: 'justify', verticalAlignment: 'bottom' },
      ],
      style: {
        headerBorderType: 'row',
        cellBorderType: 'row',
        borderColor: '#999999',
      },
    }

    const { container, rerender } = render(
      <TableElementRenderer element={tableEl} isSelected={false} onMouseDown={vi.fn()} />
    )
    expect(container).toMatchSnapshot()

    // Now test cellBorderType: 'cells'
    rerender(
      <TableElementRenderer
        element={{
          ...tableEl,
          style: {
            ...tableEl.style,
            cellBorderType: 'cells',
          },
        }}
        isSelected={false}
        onMouseDown={vi.fn()}
      />
    )
    expect(container).toMatchSnapshot()
  })

  it('renders error boundary fallback when render throws', () => {
    const errorEl = {
      type: 'table',
      id: 'table-err',
      get columns() {
        throw new Error('Exploding columns')
      },
    } as any

    const { container, getByText } = render(
      <TableElementRenderer element={errorEl} isSelected={false} onMouseDown={vi.fn()} />
    )
    expect(container).toMatchSnapshot()
    expect(getByText(/Exploding columns/)).toBeInTheDocument()
  })

  it('renders empty placeholder when columns are empty', () => {
    const onMouseDown = vi.fn()
    const tableEl: Element = {
      type: 'table',
      id: 'table-empty',
      x: 0,
      y: 0,
      width: 400,
      columns: [],
    }

    const { getByText, container } = render(
      <TableElementRenderer element={tableEl} isSelected={false} onMouseDown={onMouseDown} />
    )
    expect(container).toMatchSnapshot()
    expect(getByText(/Table without columns/)).toBeInTheDocument()
  })
})
