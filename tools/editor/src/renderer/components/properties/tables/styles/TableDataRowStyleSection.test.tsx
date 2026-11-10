import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { TableDataRowStyleSection } from './TableDataRowStyleSection'
import type { Element } from '../../../../store/templateStore'

describe('TableDataRowStyleSection', () => {
  const baseElement: Element = {
    id: 'tbl-1',
    type: 'table',
    name: 'Table 1',
    page: 1,
    x: 0,
    y: 0,
    width: 200,
    height: 100,
    style: {},
  }

  it('renders default state and matches snapshot', () => {
    const onStyleUpdate = vi.fn()
    const { container } = render(
      <TableDataRowStyleSection element={baseElement} onStyleUpdate={onStyleUpdate} />
    )

    expect(container).toMatchSnapshot()
    const transparentCheckbox = screen.getByLabelText(/Transp/i)
    expect(transparentCheckbox).toBeChecked()
  })

  it('renders configured styling and matches snapshot', () => {
    const onStyleUpdate = vi.fn()
    const configuredElement: Element = {
      ...baseElement,
      style: {
        cellBackground: '#e2e8f0',
        cellColor: '#1e293b',
        alternateRowBackground: '#f1f5f9',
        fontFamily: 'Courier',
        fontSize: 12,
        cellPadding: 8,
      },
    }

    const { container } = render(
      <TableDataRowStyleSection element={configuredElement} onStyleUpdate={onStyleUpdate} />
    )

    expect(container).toMatchSnapshot()
    const transparentCheckbox = screen.getByLabelText(/Transp/i)
    expect(transparentCheckbox).not.toBeChecked()
  })

  it('handles background color and transparent checkbox toggle', () => {
    const onStyleUpdate = vi.fn()
    render(
      <TableDataRowStyleSection
        element={{
          ...baseElement,
          style: { cellBackground: '#ffffff' },
        }}
        onStyleUpdate={onStyleUpdate}
      />
    )

    const colorInputs = screen.getAllByLabelText(/Cor de fundo|Background Color/i)
    fireEvent.change(colorInputs[0], { target: { value: '#ff0000' } })
    expect(onStyleUpdate).toHaveBeenCalledWith('cellBackground', '#ff0000')

    const transparentCheckbox = screen.getByLabelText(/Transp/i)
    fireEvent.click(transparentCheckbox)
    expect(onStyleUpdate).toHaveBeenCalledWith('cellBackground', 'transparent')
  })

  it('handles transparent uncheck setting background back to #ffffff', () => {
    const onStyleUpdate = vi.fn()
    render(
      <TableDataRowStyleSection
        element={{
          ...baseElement,
          style: { cellBackground: 'transparent' },
        }}
        onStyleUpdate={onStyleUpdate}
      />
    )

    const transparentCheckbox = screen.getByLabelText(/Transp/i)
    fireEvent.click(transparentCheckbox)
    expect(onStyleUpdate).toHaveBeenCalledWith('cellBackground', '#ffffff')
  })

  it('handles text color, zebra striping, font family, font size, and cell padding', () => {
    const onStyleUpdate = vi.fn()
    render(
      <TableDataRowStyleSection
        element={{
          ...baseElement,
          style: {
            alternateRowBackground: '#f8fafc',
          },
        }}
        onStyleUpdate={onStyleUpdate}
      />
    )

    // Text color
    const textColorInput = screen.getByLabelText(/Cor do texto|Text Color/i)
    fireEvent.change(textColorInput, { target: { value: '#333333' } })
    expect(onStyleUpdate).toHaveBeenCalledWith('cellColor', '#333333')

    // Zebra color
    const altColorInput = screen.getByLabelText(/Cor alternada|Alternate Color/i)
    fireEvent.change(altColorInput, { target: { value: '#e0e7ff' } })
    expect(onStyleUpdate).toHaveBeenCalledWith('alternateRowBackground', '#e0e7ff')

    // Font family select
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'Times' } })
    expect(onStyleUpdate).toHaveBeenCalledWith('fontFamily', 'Times')

    // Spinbuttons: font size, padding
    const spinbuttons = screen.getAllByRole('spinbutton')
    fireEvent.change(spinbuttons[0], { target: { value: '14' } })
    expect(onStyleUpdate).toHaveBeenCalledWith('fontSize', 14)

    fireEvent.change(spinbuttons[1], { target: { value: '6' } })
    expect(onStyleUpdate).toHaveBeenCalledWith('cellPadding', 6)
  })

  it('handles unchecking zebra striping', () => {
    const onStyleUpdate = vi.fn()
    render(
      <TableDataRowStyleSection
        element={{
          ...baseElement,
          style: { alternateRowBackground: '#f8fafc' },
        }}
        onStyleUpdate={onStyleUpdate}
      />
    )

    const checkboxes = screen.getAllByRole('checkbox')
    const zebraCheckbox = checkboxes.find(cb => (cb as HTMLInputElement).checked && cb !== screen.getByLabelText(/Transp/i))
    if (zebraCheckbox) {
      fireEvent.click(zebraCheckbox)
      expect(onStyleUpdate).toHaveBeenCalledWith('alternateRowBackground', 'transparent')
    }
  })
})
