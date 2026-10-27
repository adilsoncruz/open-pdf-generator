import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TableStylesTab } from './TableStylesTab'
import { TableStylesTab as ReExportedTableStylesTab } from '../TableStylesTab'
import { TableHeaderStyleSection } from './TableHeaderStyleSection'
import { TableDataRowStyleSection } from './TableDataRowStyleSection'
import { TableBorderStyleSection } from './TableBorderStyleSection'
import type { Element } from '../../../../../store/templateStore'

function createMockTableElement(styleOverrides: Record<string, unknown> = {}): Element {
  return {
    id: 'tbl-1',
    type: 'table',
    name: 'Test Table',
    x: 10,
    y: 20,
    width: 300,
    height: 150,
    columns: [
      { id: 'col1', header: 'Column 1', width: 100, dataKey: 'col1' },
      { id: 'col2', header: 'Column 2', width: 200, dataKey: 'col2' },
    ],
    data: [],
    style: {
      headerBackground: '#123456',
      headerColor: '#ffffff',
      headerFontSize: 14,
      headerFontFamily: 'Helvetica-Bold',
      headerPadding: 8,
      cellColor: '#333333',
      cellBackground: '#f5f5f5',
      fontSize: 11,
      fontFamily: 'Courier',
      cellPadding: 6,
      alternateRowBackground: '#fafafa',
      borderWidth: 2,
      borderColor: '#444444',
      borderStyle: 'dashed',
      cellBorderType: 'row',
      headerBorderType: 'row',
      ...styleOverrides,
    },
  }
}

describe('TableStylesTab modular sections', () => {
  describe('TableHeaderStyleSection', () => {
    it('renders header style controls with correct values', () => {
      const element = createMockTableElement()
      const onStyleUpdate = vi.fn()

      render(<TableHeaderStyleSection element={element} onStyleUpdate={onStyleUpdate} />)

      expect(screen.getByDisplayValue('Helvetica Bold')).toBeInTheDocument()
      expect(screen.getByDisplayValue('14')).toBeInTheDocument()
      expect(screen.getByDisplayValue('8')).toBeInTheDocument()
    })

    it('triggers style updates for header background transparency and font changes', () => {
      const element = createMockTableElement()
      const onStyleUpdate = vi.fn()

      render(<TableHeaderStyleSection element={element} onStyleUpdate={onStyleUpdate} />)

      const transparentCheckbox = screen.getAllByRole('checkbox')[0]
      fireEvent.click(transparentCheckbox)
      expect(onStyleUpdate).toHaveBeenCalledWith('headerBackground', 'transparent')

      const fontSelect = screen.getByDisplayValue('Helvetica Bold')
      fireEvent.change(fontSelect, { target: { value: 'Times' } })
      expect(onStyleUpdate).toHaveBeenCalledWith('headerFontFamily', 'Times')

      const sizeInput = screen.getByDisplayValue('14')
      fireEvent.change(sizeInput, { target: { value: '16' } })
      expect(onStyleUpdate).toHaveBeenCalledWith('headerFontSize', 16)
    })
  })

  describe('TableDataRowStyleSection', () => {
    it('renders data row style controls with correct values', () => {
      const element = createMockTableElement()
      const onStyleUpdate = vi.fn()

      render(<TableDataRowStyleSection element={element} onStyleUpdate={onStyleUpdate} />)

      expect(screen.getByDisplayValue('Courier')).toBeInTheDocument()
      expect(screen.getByDisplayValue('11')).toBeInTheDocument()
      expect(screen.getByDisplayValue('6')).toBeInTheDocument()
    })

    it('toggles zebra striping and triggers alternate background updates', () => {
      const element = createMockTableElement({ alternateRowBackground: 'transparent' })
      const onStyleUpdate = vi.fn()

      render(<TableDataRowStyleSection element={element} onStyleUpdate={onStyleUpdate} />)

      const zebraCheckbox = screen.getAllByRole('checkbox')[1]
      fireEvent.click(zebraCheckbox)
      expect(onStyleUpdate).toHaveBeenCalledWith('alternateRowBackground', '#f8fafc')
    })
  })

  describe('TableBorderStyleSection', () => {
    it('renders preset buttons and updates border configuration when clicked', () => {
      const element = createMockTableElement()
      const onStyleUpdate = vi.fn()

      render(<TableBorderStyleSection element={element} onStyleUpdate={onStyleUpdate} />)

      const nonePresetBtn = screen.getByRole('button', { name: /Sem Bordas|None|noBorders/i })
      fireEvent.click(nonePresetBtn)
      expect(onStyleUpdate).toHaveBeenCalledWith({
        cellBorderType: 'none',
        headerBorderType: 'none',
        borderWidth: 0,
        headerBorderWidth: 0,
      })
    })

    it('updates border width and style', () => {
      const element = createMockTableElement()
      const onStyleUpdate = vi.fn()

      render(<TableBorderStyleSection element={element} onStyleUpdate={onStyleUpdate} />)

      const borderWidthInput = screen.getByDisplayValue('2')
      fireEvent.change(borderWidthInput, { target: { value: '3' } })
      expect(onStyleUpdate).toHaveBeenCalledWith({
        borderWidth: 3,
        headerBorderWidth: 3,
      })

      const borderStyleSelect = screen.getByDisplayValue(/Tracejada|Dashed/i)
      fireEvent.change(borderStyleSelect, { target: { value: 'solid' } })
      expect(onStyleUpdate).toHaveBeenCalledWith('borderStyle', 'solid')
    })
  })

  describe('TableStylesTab orchestrator and retrocompatibility', () => {
    it('renders all sections through modular TableStylesTab', () => {
      const element = createMockTableElement()
      const onStyleUpdate = vi.fn()

      const { container } = render(<TableStylesTab element={element} onStyleUpdate={onStyleUpdate} />)

      expect(container.querySelectorAll('.space-y-4')).toHaveLength(1)
      expect(screen.getByDisplayValue('Helvetica Bold')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Courier')).toBeInTheDocument()
    })

    it('preserves 100% retrocompatibility when imported from parent directory', () => {
      const element = createMockTableElement()
      const onStyleUpdate = vi.fn()

      render(<ReExportedTableStylesTab element={element} onStyleUpdate={onStyleUpdate} />)

      expect(screen.getByDisplayValue('Helvetica Bold')).toBeInTheDocument()
    })
  })
})
