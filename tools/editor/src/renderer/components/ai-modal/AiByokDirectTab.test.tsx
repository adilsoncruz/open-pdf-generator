import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AiByokDirectTab, type AiByokDirectTabProps } from './AiByokDirectTab'

describe('AiByokDirectTab', () => {
  const defaultProps: AiByokDirectTabProps = {
    provider: 'gemini',
    setProvider: vi.fn(),
    apiKey: '',
    setApiKey: vi.fn(),
    model: 'gemini-2.5-flash',
    setModel: vi.fn(),
    endpoint: 'http://localhost:11434',
    setEndpoint: vi.fn(),
    inferBindings: true,
    setInferBindings: vi.fn(),
    selectedFile: null,
    onSelectPDF: vi.fn(),
    statusMessage: null,
    errorMessage: null,
  }

  it('renders default state and matches snapshot', () => {
    const { container } = render(<AiByokDirectTab {...defaultProps} />)
    expect(screen.getByText('Nenhum arquivo selecionado')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Insira sua API Key...')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('renders selected file name and triggers file selection', () => {
    const onSelectPDF = vi.fn()
    render(
      <AiByokDirectTab
        {...defaultProps}
        selectedFile={{ path: '/docs/sample.pdf', name: 'sample.pdf', base64: 'abc' }}
        onSelectPDF={onSelectPDF}
      />
    )

    expect(screen.getByText('sample.pdf')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Selecionar PDF...'))
    expect(onSelectPDF).toHaveBeenCalledTimes(1)
  })

  it('changes provider and updates model defaults', () => {
    const setProvider = vi.fn()
    const setModel = vi.fn()
    const { rerender } = render(
      <AiByokDirectTab {...defaultProps} setProvider={setProvider} setModel={setModel} />
    )

    const select = screen.getByRole('combobox')

    // Change to openai
    fireEvent.change(select, { target: { value: 'openai' } })
    expect(setProvider).toHaveBeenCalledWith('openai')
    expect(setModel).toHaveBeenCalledWith('gpt-4o-mini')

    // Change to gemini
    fireEvent.change(select, { target: { value: 'gemini' } })
    expect(setProvider).toHaveBeenCalledWith('gemini')
    expect(setModel).toHaveBeenCalledWith('gemini-2.5-flash')

    // Change to ollama
    fireEvent.change(select, { target: { value: 'ollama' } })
    expect(setProvider).toHaveBeenCalledWith('ollama')

    // Rerender as ollama
    rerender(
      <AiByokDirectTab
        {...defaultProps}
        provider="ollama"
        setProvider={setProvider}
        setModel={setModel}
      />
    )
    expect(screen.getByText('Endpoint Local')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Insira sua API Key...')).not.toBeInTheDocument()
  })

  it('updates model, api key, endpoint, and infer bindings', () => {
    const setModel = vi.fn()
    const setApiKey = vi.fn()
    const setEndpoint = vi.fn()
    const setInferBindings = vi.fn()

    const { rerender } = render(
      <AiByokDirectTab
        {...defaultProps}
        setModel={setModel}
        setApiKey={setApiKey}
        setEndpoint={setEndpoint}
        setInferBindings={setInferBindings}
      />
    )

    // Model input
    const modelInput = screen.getByPlaceholderText('ex: gemini-2.5-flash')
    fireEvent.change(modelInput, { target: { value: 'gemini-1.5-pro' } })
    expect(setModel).toHaveBeenCalledWith('gemini-1.5-pro')

    // API Key input
    const apiKeyInput = screen.getByPlaceholderText('Insira sua API Key...')
    fireEvent.change(apiKeyInput, { target: { value: 'secret-key-123' } })
    expect(setApiKey).toHaveBeenCalledWith('secret-key-123')

    // Infer bindings checkbox
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)
    expect(setInferBindings).toHaveBeenCalledWith(false)

    // Ollama endpoint
    rerender(
      <AiByokDirectTab
        {...defaultProps}
        provider="ollama"
        setEndpoint={setEndpoint}
      />
    )
    const endpointInput = screen.getByDisplayValue('http://localhost:11434')
    fireEvent.change(endpointInput, { target: { value: 'http://custom-host:11434' } })
    expect(setEndpoint).toHaveBeenCalledWith('http://custom-host:11434')
  })

  it('renders status and error messages', () => {
    const { container } = render(
      <AiByokDirectTab
        {...defaultProps}
        statusMessage="Processando documento com IA..."
        errorMessage="Falha ao autenticar com a API"
      />
    )

    expect(screen.getByText('Processando documento com IA...')).toBeInTheDocument()
    expect(screen.getByText('Falha ao autenticar com a API')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })
})
