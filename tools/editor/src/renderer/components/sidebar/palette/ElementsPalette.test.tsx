import '@testing-library/jest-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ElementsPalette } from './ElementsPalette'
import { useTemplateStore } from '../../../store/templateStore'

describe('ElementsPalette', () => {
  beforeEach(() => {
    useTemplateStore.setState({
      template: {
        version: '1.0',
        metadata: { name: 'Test', description: '' },
        pageSettings: {
          size: 'A4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
          header: { height: 50, elements: [] },
          footer: { height: 40, elements: [] },
          bodyBackground: { elements: [] },
        },
        page: [],
        groups: [],
      },
    })
  })

  it('renders all categories and default elements', () => {
    render(<ElementsPalette currentSection="body" />)

    expect(screen.getByText('Standard')).toBeInTheDocument()
    expect(screen.getByText('Layout')).toBeInTheDocument()
    expect(screen.getByText('Media & Shapes')).toBeInTheDocument()
    expect(screen.getByText('Barcodes')).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /^Text$/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Static Text$/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Container$/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^QR Code$/ })).toBeInTheDocument()
  })

  it('adds an element to the store when clicked', () => {
    const addElementSpy = vi.fn()
    useTemplateStore.setState({ addElement: addElementSpy } as any)

    render(<ElementsPalette currentSection="header" />)

    const textButton = screen.getByRole('button', { name: /^Text$/ })
    fireEvent.click(textButton)

    expect(addElementSpy).toHaveBeenCalledTimes(1)
    expect(addElementSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'text',
        value: 'Novo Texto',
      }),
      'header'
    )
  })

  it('filters elements based on search input', () => {
    render(<ElementsPalette currentSection="body" />)

    const searchInput = screen.getByPlaceholderText('Buscar elementos...')
    fireEvent.change(searchInput, { target: { value: 'QR Code' } })

    expect(screen.getByText('QR Code')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Text$/ })).not.toBeInTheDocument()
    expect(screen.queryByText('Standard')).not.toBeInTheDocument()
    expect(screen.getByText('Barcodes')).toBeInTheDocument()
  })

  it('shows empty message when no elements match search query', () => {
    render(<ElementsPalette currentSection="body" />)

    const searchInput = screen.getByPlaceholderText('Buscar elementos...')
    fireEvent.change(searchInput, { target: { value: 'nonexistent-element-xyz' } })

    expect(screen.getByText('Nenhum elemento encontrado')).toBeInTheDocument()
    expect(screen.queryByText('Standard')).not.toBeInTheDocument()
  })

  it('clears search input when clear button is clicked', () => {
    render(<ElementsPalette currentSection="body" />)

    const searchInput = screen.getByPlaceholderText('Buscar elementos...')
    fireEvent.change(searchInput, { target: { value: 'QR Code' } })

    const clearButton = screen.getByLabelText('Limpar busca')
    fireEvent.click(clearButton)

    expect(searchInput).toHaveValue('')
    expect(screen.getByText('Standard')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Text$/ })).toBeInTheDocument()
  })

  it('supports drag start on palette items', () => {
    render(<ElementsPalette currentSection="body" />)

    const qrButton = screen.getByRole('button', { name: /^QR Code$/ })
    const setDataMock = vi.fn()

    fireEvent.dragStart(qrButton, {
      dataTransfer: {
        setData: setDataMock,
        effectAllowed: 'uninitialized',
      },
    })

    expect(setDataMock).toHaveBeenCalledWith('text/plain', 'barcode')
    expect(setDataMock).toHaveBeenCalledWith(
      'application/x-openpdf-element',
      expect.stringContaining('"barcodeType":"qrcode"')
    )
  })
})
