import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SchemaPanel from './SchemaPanel'
import { useTemplateStore } from '../store/templateStore'

describe('SchemaPanel', () => {
  it('renders correctly with empty schema, hints and matches snapshot', () => {
    useTemplateStore.setState({
      template: {
        version: '1.0',
        metadata: { name: 'Test', description: '' },
        pageSettings: {
          size: 'A4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
        },
        page: [],
      },
      testData: { name: 'Alice' },
    })

    const onClose = vi.fn()
    const { container } = render(<SchemaPanel onClose={onClose} />)

    expect(screen.getByText('Schema Validation')).toBeInTheDocument()
    expect(screen.getByText('Nenhum schema definido (opcional)')).toBeInTheDocument()
    expect(container).toMatchSnapshot()

    // Test clicking Fechar button
    const closeButtons = screen.getAllByRole('button', { name: /Fechar|Close/i })
    fireEvent.click(closeButtons[closeButtons.length - 1])
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('validates testData against schema and reports specific errors and matches snapshot', () => {
    useTemplateStore.setState({
      template: {
        version: '1.0',
        metadata: { name: 'Test', description: '' },
        pageSettings: {
          size: 'A4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
        },
        page: [],
        schema: {
          type: 'object',
          properties: {
            requiredField: { type: 'string' },
          },
          required: ['requiredField'],
        },
      },
      testData: {},
    })

    const onClose = vi.fn()
    const { container } = render(<SchemaPanel onClose={onClose} />)

    expect(screen.getByText(/Os dados de teste violam este Schema/i)).toBeInTheDocument()
    expect(screen.getAllByText(/required/i).length).toBeGreaterThan(0)
    expect(container).toMatchSnapshot()
  })

  it('allows formatting and saving schema to template', () => {
    useTemplateStore.setState({
      template: {
        version: '1.0',
        metadata: { name: 'Test', description: '' },
        pageSettings: {
          size: 'A4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
        },
        page: [],
      },
      testData: { name: 'Alice' },
    })

    const onClose = vi.fn()
    render(<SchemaPanel onClose={onClose} />)

    const textarea = screen.getByPlaceholderText(/Cole ou edite seu JSON Schema aqui/i)
    fireEvent.change(textarea, {
      target: { value: '{"type":"object"}' },
    })

    const saveButton = screen.getByText('Salvar no Template')
    fireEvent.click(saveButton)

    const currentTemplate = useTemplateStore.getState().template
    expect(currentTemplate.schema).toEqual({ type: 'object' })
  })

  it('generates test data from schema', () => {
    useTemplateStore.setState({
      template: {
        version: '1.0',
        metadata: { name: 'Test', description: '' },
        pageSettings: {
          size: 'A4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
        },
        page: [],
        schema: {
          type: 'object',
          properties: {
            customerName: { type: 'string' },
          },
        },
      },
      testData: {},
    })

    const onClose = vi.fn()
    render(<SchemaPanel onClose={onClose} />)

    const generateBtn = screen.getByText('Gerar Dados de Teste')
    fireEvent.click(generateBtn)

    const updatedTestData = useTemplateStore.getState().testData as Record<string, any>
    expect(updatedTestData.customerName).toBe('Nome do Cliente')
  })

  it('handles search bar interactions and keyboard shortcuts (Ctrl+F, Escape)', () => {
    useTemplateStore.setState({
      template: {
        version: '1.0',
        metadata: { name: 'Test' },
        pageSettings: {
          size: 'A4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
        },
        page: [],
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
          },
        },
      },
      testData: {},
    })

    const onClose = vi.fn()
    render(<SchemaPanel onClose={onClose} />)

    const textarea = screen.getByPlaceholderText(/Cole ou edite seu JSON Schema aqui/i)

    // Ctrl+F opens search
    fireEvent.keyDown(textarea, { key: 'f', ctrlKey: true })
    const searchInput = screen.getByPlaceholderText(/Buscar no schema/i)
    expect(searchInput).toBeInTheDocument()

    // Type search term
    fireEvent.change(searchInput, { target: { value: 'string' } })

    // Prev / Next match buttons
    const prevBtn = screen.getByTitle('Anterior (Shift+Enter)')
    const nextBtn = screen.getByTitle('Próxima (Enter)')
    fireEvent.click(nextBtn)
    fireEvent.click(prevBtn)

    // Case sensitive button
    const caseBtn = screen.getByText('Aa')
    fireEvent.click(caseBtn)

    // Close search with close button
    const closeSearchBtn = screen.getByText('✕')
    fireEvent.click(closeSearchBtn)
    expect(screen.queryByPlaceholderText(/Buscar no schema/i)).not.toBeInTheDocument()

    // Escape closes modal when search is not open
    const modal = screen.getByText('Schema Validation').closest('.bg-slate-900')!
    fireEvent.keyDown(modal, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })
})
