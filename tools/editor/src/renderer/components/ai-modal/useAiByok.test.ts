import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAiByok } from './useAiByok'

describe('useAiByok', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    window.electronAPI = {
      openPdfFile: vi.fn().mockResolvedValue({
        name: 'invoice.pdf',
        path: '/tmp/invoice.pdf',
        base64: 'JVBERi0xLjQK...',
      }),
    } as any
  })

  it('initializes and saves provider and model settings and handles legacy key cleanup', () => {
    localStorage.setItem('open_pdf_ai_key', 'legacy-key')
    localStorage.setItem('open_pdf_ai_provider', 'openai')
    localStorage.setItem('open_pdf_ai_model', 'gpt-4o-mini')

    const { result } = renderHook(() =>
      useAiByok({
        isOpen: true,
        onClose: vi.fn(),
      })
    )

    expect(localStorage.getItem('open_pdf_ai_key')).toBeNull()
    expect(result.current.provider).toBe('openai')
    expect(result.current.model).toBe('gpt-4o-mini')

    act(() => {
      result.current.setProvider('gemini')
      result.current.setModel('gemini-2.5-flash')
      result.current.setApiKey('sk-test123456')
      result.current.setEndpoint('http://custom-ollama:11434')
      result.current.setInferBindings(false)
    })

    expect(result.current.provider).toBe('gemini')
    expect(result.current.model).toBe('gemini-2.5-flash')
    expect(result.current.apiKey).toBe('sk-test123456')
    expect(result.current.endpoint).toBe('http://custom-ollama:11434')
    expect(result.current.inferBindings).toBe(false)
  })

  it('handles missing electronAPI.openPdfFile', async () => {
    delete (window as any).electronAPI
    const { result } = renderHook(() =>
      useAiByok({
        isOpen: true,
        onClose: vi.fn(),
      })
    )

    await act(async () => {
      await result.current.handleSelectPDF()
    })

    expect(result.current.errorMessage).toBe('API de seleção de PDF não disponível.')
  })

  it('selects PDF file via electronAPI', async () => {
    const { result } = renderHook(() =>
      useAiByok({
        isOpen: true,
        onClose: vi.fn(),
      })
    )

    await act(async () => {
      await result.current.handleSelectPDF()
    })

    expect(result.current.selectedFile?.name).toBe('invoice.pdf')
  })

  it('validates missing file or apiKey on convert direct', async () => {
    const { result } = renderHook(() =>
      useAiByok({
        isOpen: true,
        onClose: vi.fn(),
      })
    )

    // Missing file
    await act(async () => {
      await result.current.handleConvertDirect()
    })
    expect(result.current.errorMessage).toMatch(/selecione um arquivo PDF/)

    // Select file but missing apiKey
    await act(async () => {
      await result.current.handleSelectPDF()
    })
    act(() => {
      result.current.setApiKey('')
    })
    await act(async () => {
      await result.current.handleConvertDirect()
    })
    expect(result.current.errorMessage).toMatch(/informe a chave de API/)
  })

  it('converts PDF directly with gemini mock response (inferBindings=false)', async () => {
    const validTemplate = {
      version: '1.0',
      pageSettings: { size: 'A4' },
      page: [{ type: 'text', id: 't1', x: 0, y: 0 }],
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        candidates: [
          { content: { parts: [{ text: `\`\`\`json\n${JSON.stringify(validTemplate)}\n\`\`\`` }] } },
        ],
      }),
    }) as any

    const onClose = vi.fn()
    const onSuccess = vi.fn()

    const { result } = renderHook(() =>
      useAiByok({
        isOpen: true,
        onClose,
        onSuccess,
      })
    )

    act(() => {
      result.current.setProvider('gemini')
      result.current.setApiKey('test-api-key')
      result.current.setInferBindings(false)
    })

    await act(async () => {
      await result.current.handleSelectPDF()
    })

    await act(async () => {
      await result.current.handleConvertDirect()
    })

    expect(onSuccess).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it('handles Gemini HTTP error response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: vi.fn().mockResolvedValue({
        error: { message: 'Invalid API Key' },
      }),
    }) as any

    const { result } = renderHook(() =>
      useAiByok({
        isOpen: true,
        onClose: vi.fn(),
      })
    )

    act(() => {
      result.current.setProvider('gemini')
      result.current.setApiKey('invalid-key')
    })

    await act(async () => {
      await result.current.handleSelectPDF()
    })

    await act(async () => {
      await result.current.handleConvertDirect()
    })

    expect(result.current.errorMessage).toBe('Invalid API Key')
  })

  it('handles invalid template JSON structure from IA', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        candidates: [
          { content: { parts: [{ text: JSON.stringify({ notAValidTemplate: true }) }] } },
        ],
      }),
    }) as any

    const { result } = renderHook(() =>
      useAiByok({
        isOpen: true,
        onClose: vi.fn(),
      })
    )

    act(() => {
      result.current.setProvider('gemini')
      result.current.setApiKey('key')
    })

    await act(async () => {
      await result.current.handleSelectPDF()
    })

    await act(async () => {
      await result.current.handleConvertDirect()
    })

    expect(result.current.errorMessage).toMatch(/A IA não gerou uma estrutura válida/)
  })

  it('handles unsupported provider error in handleConvertDirect', async () => {
    const { result } = renderHook(() =>
      useAiByok({
        isOpen: true,
        onClose: vi.fn(),
      })
    )

    act(() => {
      result.current.setProvider('openai')
      result.current.setApiKey('test-key')
    })

    await act(async () => {
      await result.current.handleSelectPDF()
    })

    await act(async () => {
      await result.current.handleConvertDirect()
    })

    expect(result.current.errorMessage).toMatch(/Provedor openai requer endpoint/)
  })
})
