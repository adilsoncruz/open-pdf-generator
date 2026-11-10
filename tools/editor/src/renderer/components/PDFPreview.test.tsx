import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/react'
import PDFPreview from './PDFPreview'
import { usePreviewStore } from '../store/previewStore'
import { useTemplateStore } from '../store/templateStore'

vi.mock('./preview/components/PreviewViewer', () => ({
  PreviewViewer: ({ onZoomIn, onZoomOut, onFitWidth, onFitPage, onScaleChange, onDocumentLoadSuccess }: any) => (
    <div data-testid="preview-viewer">
      <button onClick={() => onDocumentLoadSuccess({ numPages: 3 })}>Load 3 Pages</button>
      <button onClick={onZoomIn}>Zoom In</button>
      <button onClick={onZoomOut}>Zoom Out</button>
      <button onClick={onFitWidth}>Fit Width</button>
      <button onClick={onFitPage}>Fit Page</button>
      <button onClick={() => onScaleChange(1.5)}>Scale 1.5</button>
    </div>
  ),
}))

describe('PDFPreview (root component)', () => {
  beforeEach(() => {
    usePreviewStore.setState({
      mode: 'split',
      pdfData: null,
      isLoading: false,
      error: null,
      lastGeneratedAt: null,
    })
    useTemplateStore.setState({
      template: {
        page: [{ id: '1', type: 'text' }],
      } as any,
    })
  })

  it('renders loading state when isLoading is true and matches snapshot', () => {
    usePreviewStore.setState({ isLoading: true })
    const { container, getByText } = render(<PDFPreview />)
    expect(getByText(/Gerando prévia|Generating preview/i)).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('renders error state and handles retry and matches snapshot', () => {
    usePreviewStore.setState({ error: 'Erro ao gerar PDF', isLoading: false })
    const { container, getByText } = render(<PDFPreview />)
    expect(getByText(/Erro ao gerar PDF/)).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('renders viewer and handles zoom, fit, page navigation, and split toggle', () => {
    const onClose = vi.fn()
    usePreviewStore.setState({ pdfData: 'JVBERi0xLjQK...', isLoading: false, error: null })
    const { getByTestId, getByText, container } = render(<PDFPreview onClose={onClose} />)
    expect(getByTestId('preview-viewer')).toBeInTheDocument()
    expect(container).toMatchSnapshot()

    // Zoom and Fit actions
    fireEvent.click(getByText('Zoom In'))
    fireEvent.click(getByText('Zoom Out'))
    fireEvent.click(getByText('Fit Width'))
    fireEvent.click(getByText('Fit Page'))
    fireEvent.click(getByText('Scale 1.5'))

    // Document load success to simulate 3 pages
    fireEvent.click(getByText('Load 3 Pages'))
    expect(screen.getByText('1 / 3')).toBeInTheDocument()

    // Page navigation: next page -> 2 / 3 -> next page -> 3 / 3
    const nextBtn = screen.getByTitle('Próxima página')
    fireEvent.click(nextBtn)
    expect(screen.getByText('2 / 3')).toBeInTheDocument()

    // Prev page -> 1 / 3
    const prevBtn = screen.getByTitle('Página anterior')
    fireEvent.click(prevBtn)
    expect(screen.getByText('1 / 3')).toBeInTheDocument()

    // Toggle split mode
    const toggleSplitBtn = screen.getByTitle('Full view')
    fireEvent.click(toggleSplitBtn)
    expect(usePreviewStore.getState().mode).toBe('tab')

    // Close button
    const closeBtn = screen.getByTitle('Fechar Preview')
    fireEvent.click(closeBtn)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders waiting state with refresh button when content exists but no pdfData', () => {
    usePreviewStore.setState({ pdfData: null, isLoading: false, error: null })
    const { getByRole, container } = render(<PDFPreview />)
    expect(container).toMatchSnapshot()

    const refreshBtn = getByRole('button', { name: /Atualizar|Refresh/i })
    expect(refreshBtn).toBeInTheDocument()
    fireEvent.click(refreshBtn)
  })

  it('handles empty template without content', () => {
    useTemplateStore.setState({
      template: {
        page: [],
        pageSettings: { header: { elements: [] }, footer: { elements: [] } },
        summaryPage: { elements: [] },
      } as any,
    })
    const { container } = render(<PDFPreview />)
    expect(container).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })
})
