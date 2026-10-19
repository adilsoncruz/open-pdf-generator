import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SchemaPanel from './SchemaPanel'
import { useTemplateStore } from '../store/templateStore'

describe('SchemaPanel', () => {
  it('renders correctly with empty schema and hints', () => {
    useTemplateStore.setState({
      template: {
        version: '1.0',
        metadata: { name: 'Test', description: '' },
        pageSettings: {
          size: 'A4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 }
        },
        page: [],
      },
      testData: { name: 'Alice' }
    })

    const onClose = vi.fn()
    render(<SchemaPanel onClose={onClose} />)

    expect(screen.getByText('Schema Validation')).toBeInTheDocument()
    expect(screen.getByText('Nenhum schema definido (opcional)')).toBeInTheDocument()
  })

  it('validates testData against schema and reports specific errors', () => {
    useTemplateStore.setState({
      template: {
        version: '1.0',
        metadata: { name: 'Test', description: '' },
        pageSettings: {
          size: 'A4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 }
        },
        page: [],
        schema: {
          type: 'object',
          properties: {
            requiredField: { type: 'string' }
          },
          required: ['requiredField']
        }
      },
      testData: {}
    })

    const onClose = vi.fn()
    render(<SchemaPanel onClose={onClose} />)

    expect(screen.getByText(/Os dados de teste violam este Schema/i)).toBeInTheDocument()
    expect(screen.getAllByText(/required/i).length).toBeGreaterThan(0)
  })

  it('allows formatting and saving schema to template', () => {
    useTemplateStore.setState({
      template: {
        version: '1.0',
        metadata: { name: 'Test', description: '' },
        pageSettings: {
          size: 'A4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 }
        },
        page: [],
      },
      testData: { name: 'Alice' }
    })

    const onClose = vi.fn()
    render(<SchemaPanel onClose={onClose} />)

    const textarea = screen.getByPlaceholderText(/Cole ou edite seu JSON Schema aqui/i)
    fireEvent.change(textarea, {
      target: { value: '{"type":"object"}' }
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
          margins: { top: 20, right: 20, bottom: 20, left: 20 }
        },
        page: [],
        schema: {
          type: 'object',
          properties: {
            customerName: { type: 'string' }
          }
        }
      },
      testData: {}
    })

    const onClose = vi.fn()
    render(<SchemaPanel onClose={onClose} />)

    const generateBtn = screen.getByText('Gerar Dados de Teste')
    fireEvent.click(generateBtn)

    const updatedTestData = useTemplateStore.getState().testData as Record<string, any>
    expect(updatedTestData.customerName).toBe('Nome do Cliente')
  })
})
