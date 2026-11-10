import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react'
import { PreviewToolbar } from './components/PreviewToolbar'
import { PreviewErrorState } from './components/PreviewErrorState'
import { PreviewEmptyState } from './components/PreviewEmptyState'
import { usePdfPreview } from './hooks/usePdfPreview'
import PDFPreview from '../PDFPreview'
import { usePreviewStore } from '../../store/previewStore'
import { useTemplateStore } from '../../store/templateStore'

describe('PreviewToolbar', () => {
  it('renders title, pagination and triggers actions', () => {
    const onPrevPage = vi.fn()
    const onNextPage = vi.fn()
    const onZoomIn = vi.fn()
    const onZoomOut = vi.fn()
    const onFitWidth = vi.fn()
    const onFitPage = vi.fn()
    const onScaleChange = vi.fn()
    const onToggleSplit = vi.fn()
    const onRefresh = vi.fn()
    const onClose = vi.fn()

    render(
      <PreviewToolbar
        title="Custom Preview"
        lastGeneratedAt={new Date('2026-01-01T12:00:00')}
        numPages={5}
        currentPage={2}
        isLoading={false}
        hasPdfData={true}
        previewMode="split"
        onPrevPage={onPrevPage}
        onNextPage={onNextPage}
        onToggleSplit={onToggleSplit}
        onRefresh={onRefresh}
        onClose={onClose}
      />
    )

    expect(screen.getByText('Custom Preview')).toBeInTheDocument()
    expect(screen.getByText('2 / 5')).toBeInTheDocument()

    // Test buttons
    fireEvent.click(screen.getByTitle('Página anterior'))
    expect(onPrevPage).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByTitle('Próxima página'))
    expect(onNextPage).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: /Tela cheia|Full view/i }))
    expect(onToggleSplit).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByTitle(/Atualizar Preview|Refresh/i))
    expect(onRefresh).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByTitle('Fechar Preview'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

describe('PreviewErrorState', () => {
  it('renders Java missing error state correctly', () => {
    const onRetry = vi.fn()
    render(
      <PreviewErrorState
        error="Java is not installed."
        errorCode="JAVA_NOT_INSTALLED"
        onRetry={onRetry}
      />
    )

    expect(screen.getByText(/Java não instalado|Java is not installed/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Try again|Tentar novamente/i }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('renders CLI missing error state correctly', () => {
    const onRetry = vi.fn()
    render(
      <PreviewErrorState
        error="PDF Generator CLI is not installed."
        errorCode="CLI_NOT_INSTALLED"
        onRetry={onRetry}
      />
    )

    expect(screen.getByText(/CLI não instalada|CLI is not installed/i)).toBeInTheDocument()
  })

  it('renders compilation error with detailed log', () => {
    const detailedError = 'Exception in thread main: org.openpdf.InvalidSyntaxException at line 42 with lots of details'
    render(
      <PreviewErrorState
        error={detailedError}
        errorCode="CLI_ERROR"
        onRetry={vi.fn()}
      />
    )

    expect(screen.getByText(/Falha na compilação do PDF/i)).toBeInTheDocument()
    expect(screen.getByText(detailedError)).toBeInTheDocument()
  })
})

describe('PreviewEmptyState', () => {
  it('renders empty template message', () => {
    render(<PreviewEmptyState />)
    expect(screen.getByText(/Empty Template|Template Vazio/i)).toBeInTheDocument()
  })
})

describe('usePdfPreview', () => {
  beforeEach(() => {
    usePreviewStore.setState({
      pdfData: null,
      isLoading: false,
      error: null,
      lastGeneratedAt: null,
      refreshTrigger: 0,
    })

    useTemplateStore.setState({
      template: {
        version: '1.0',
        metadata: { name: 'My Template' },
        pageSettings: {
          size: 'A4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
        },
        page: [],
      },
      testData: {},
    })

    // Mock electronAPI
    window.electronAPI = {
      ...window.electronAPI,
      generatePDFPreview: vi.fn().mockResolvedValue({
        success: true,
        pdfBase64: 'JVBERi0xLjQK...',
      }),
    } as any
  })

  it('detects when template has content', () => {
    const { result, rerender } = renderHook(() => usePdfPreview())
    expect(result.current.hasContent).toBe(false)

    act(() => {
      useTemplateStore.setState({
        template: {
          ...useTemplateStore.getState().template,
          page: [
            { id: '1', type: 'text', x: 10, y: 10, width: 100, height: 20 } as any,
          ],
        },
      })
    })

    rerender()
    expect(result.current.hasContent).toBe(true)
  })

  it('calls generatePDFPreview when template has content', async () => {
    useTemplateStore.setState({
      template: {
        ...useTemplateStore.getState().template,
        page: [
          { id: '1', type: 'text', x: 10, y: 10, width: 100, height: 20 } as any,
        ],
      },
    })

    const { result } = renderHook(() => usePdfPreview())

    await act(async () => {
      await result.current.generatePreview(true)
    })

    expect(window.electronAPI.generatePDFPreview).toHaveBeenCalled()
    expect(usePreviewStore.getState().pdfData).toBe('JVBERi0xLjQK...')
  })

  it('handles CLI and Java error responses and triggers downloadPdf', async () => {
    window.electronAPI = {
      generatePDFPreview: vi.fn().mockResolvedValue({
        success: false,
        errorCode: 'JAVA_NOT_INSTALLED',
        cliError: 'Java runtime is missing',
      }),
    } as any

    useTemplateStore.setState({
      template: {
        ...useTemplateStore.getState().template,
        page: [{ type: 'text', id: 't1', x: 0, y: 0, value: 'Hello' }],
      },
    })

    const { result } = renderHook(() => usePdfPreview({ debounceMs: 10 }))

    await act(async () => {
      await result.current.generatePreview(true)
    })

    expect(usePreviewStore.getState().error).toBe('Java runtime is missing')

    // Download PDF when data is present
    usePreviewStore.setState({ pdfData: 'JVBERi0xLjQK' })
    await act(async () => {
      await result.current.downloadPdf('test.pdf')
    })
  })
})

describe('PDFPreview component integration', () => {
  beforeEach(() => {
    usePreviewStore.setState({
      pdfData: null,
      isLoading: false,
      error: null,
      mode: 'split',
    })
    useTemplateStore.setState({
      template: {
        version: '1.0',
        metadata: { name: 'Sample' },
        pageSettings: {
          size: 'A4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
        },
        page: [],
      },
      testData: {},
    })
  })

  it('renders toolbar and empty state when template is empty', () => {
    const onClose = vi.fn()
    render(<PDFPreview onClose={onClose} />)

    expect(screen.getByText(/Empty Template|Template Vazio/i)).toBeInTheDocument()
    fireEvent.click(screen.getByTitle('Fechar Preview'))
    expect(onClose).toHaveBeenCalled()
  })

  it('renders error state when store has error and content exists', () => {
    usePreviewStore.setState({
      error: 'Compilation failed',
      isLoading: false,
    })
    useTemplateStore.setState({
      template: {
        ...useTemplateStore.getState().template,
        page: [{ id: '1', type: 'text', x: 0, y: 0, width: 100, height: 20 } as any],
      },
    })

    render(<PDFPreview />)
    expect(screen.getByText(/Compilation failed/i)).toBeInTheDocument()
  })

  it('toggles mode between split and tab when split button is clicked', () => {
    usePreviewStore.setState({ mode: 'split' })
    const { unmount } = render(<PDFPreview />)

    const splitBtn = screen.getByRole('button', { name: /Tela cheia|Full view/i })
    fireEvent.click(splitBtn)
    expect(usePreviewStore.getState().mode).toBe('tab')

    unmount()
    render(<PDFPreview />)
    const tabBtn = screen.getByRole('button', { name: /Modo dividido|Split view/i })
    fireEvent.click(tabBtn)
    expect(usePreviewStore.getState().mode).toBe('split')
  })
})
