import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { TableBorderStyleSection } from './TableBorderStyleSection'
import type { Element } from '../../../../store/templateStore'

describe('TableBorderStyleSection', () => {
  it('renders border controls and updates presets', () => {
    const onStyleUpdate = vi.fn()
    const element: Element = {
      id: 'table-1',
      type: 'table',
      style: {
        borderWidth: 1,
        borderColor: '#112233',
        borderStyle: 'solid',
        cellBorderType: 'cells',
      },
    }

    const { getByText, container } = render(
      <TableBorderStyleSection element={element} onStyleUpdate={onStyleUpdate} />
    )

    expect(container).toMatchSnapshot()

    // Preset 'none'
    fireEvent.click(getByText(/Nenhuma|None|noBorders/i))
    expect(onStyleUpdate).toHaveBeenCalledWith({
      cellBorderType: 'none',
      headerBorderType: 'none',
      borderWidth: 0,
      headerBorderWidth: 0,
    })

    // Preset 'row'
    fireEvent.click(getByText(/Linhas|Rows/i))
    expect(onStyleUpdate).toHaveBeenCalledWith({
      cellBorderType: 'row',
      headerBorderType: 'row',
      borderWidth: 1,
      headerBorderWidth: 1,
    })
  })

  it('updates border width, color, and border style', () => {
    const onStyleUpdate = vi.fn()
    const element: Element = {
      id: 'table-2',
      type: 'table',
      style: {
        borderWidth: 2,
        borderColor: '#ffffff',
        borderStyle: 'dashed',
      },
    }

    const { getByDisplayValue, getByLabelText } = render(
      <TableBorderStyleSection element={element} onStyleUpdate={onStyleUpdate} />
    )

    const widthInput = getByDisplayValue('2')
    fireEvent.change(widthInput, { target: { value: '3' } })
    expect(onStyleUpdate).toHaveBeenCalledWith(expect.objectContaining({
      borderWidth: 3,
      headerBorderWidth: 3,
    }))

    const colorInput = getByLabelText(/Border Color|Cor da borda/i)
    fireEvent.change(colorInput, { target: { value: '#ff0000' } })
    expect(onStyleUpdate).toHaveBeenCalledWith({
      borderColor: '#ff0000',
      headerBorderColor: '#ff0000',
    })

    const select = getByDisplayValue(/Tracejada|Dashed/i)
    fireEvent.change(select, { target: { value: 'dotted' } })
    expect(onStyleUpdate).toHaveBeenCalledWith('borderStyle', 'dotted')
  })
})
