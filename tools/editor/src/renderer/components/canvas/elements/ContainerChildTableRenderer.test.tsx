import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ContainerChildTableRenderer } from './ContainerChildTableRenderer'
import type { Element } from '../../../store/templateStore'

describe('ContainerChildTableRenderer', () => {
  it('renders table inside container and matches snapshot', () => {
    const tableEl: Element = {
      type: 'table',
      id: 'table-c-1',
      width: '100%',
      columns: [
        { header: 'Item', dataKey: 'item', width: 120 },
        { header: 'Preço', dataKey: 'price', width: 80 },
      ],
      style: {
        headerBackground: '#1e293b',
        headerTextColor: '#ffffff',
        headerFontSize: 11,
        fontSize: 10,
        borderColor: '#475569',
        borderStyle: 'solid',
        headerBorderType: 'columns',
        cellBorderType: 'all',
      },
    }

    const { container, getByText } = render(
      <ContainerChildTableRenderer child={tableEl} containerWidth={500} />
    )

    expect(getByText('Item')).toBeInTheDocument()
    expect(getByText('Preço')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('renders table with row border and none border types', () => {
    const rowTable: Element = {
      type: 'table',
      id: 'table-row-type',
      width: 400,
      columns: [{ header: 'Col 1' }],
      style: {
        headerBorderType: 'row',
        cellBorderType: 'none',
      },
    }

    const { container, rerender } = render(
      <ContainerChildTableRenderer child={rowTable} containerWidth={500} />
    )
    expect(container).toMatchSnapshot()

    // Test columns border type and row cell border type with 2 columns
    const twoColTable: Element = {
      type: 'table',
      id: 'table-two-col',
      width: 400,
      columns: [{ header: 'Col 1', field: 'f1' }, { header: 'Col 2', field: 'f2' }],
      style: {
        headerBorderType: 'columns',
        cellBorderType: 'columns',
      },
    }

    rerender(
      <ContainerChildTableRenderer child={twoColTable} containerWidth={500} />
    )
    expect(container).toMatchSnapshot()

    rerender(
      <ContainerChildTableRenderer
        child={{
          ...twoColTable,
          style: {
            ...twoColTable.style,
            cellBorderType: 'row',
          },
        }}
        containerWidth={500}
      />
    )
    expect(container).toMatchSnapshot()
  })

  it('renders placeholder when table has no columns', () => {
    const emptyTable: Element = {
      type: 'table',
      id: 'table-empty',
      columns: [],
    }

    const { container } = render(
      <ContainerChildTableRenderer child={emptyTable} containerWidth={500} />
    )
    expect(container).toMatchSnapshot()
  })
})
