import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { PreviewViewer } from './PreviewViewer'

// Mock react-pdf Document and Page
vi.mock('react-pdf', () => ({
  pdfjs: { GlobalWorkerOptions: {} },
  Document: ({ children }: any) => <div data-testid="pdf-document">{children}</div>,
  Page: () => <div data-testid="pdf-page" />,
}))

describe('PreviewViewer', () => {
  it('renders viewer with zoom controls, matches snapshot, and handles pan/zoom events', () => {
    const onZoomIn = vi.fn()
    const onZoomOut = vi.fn()
    const onScaleChange = vi.fn()
    const onFitWidth = vi.fn()
    const onFitPage = vi.fn()

    const { getByTestId, getByRole, getByText, getByTitle, container } = render(
      <PreviewViewer
        pdfData="JVBERi0xLjQK"
        scale={1}
        currentPage={1}
        onDocumentLoadSuccess={vi.fn()}
        onScaleChange={onScaleChange}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onFitWidth={onFitWidth}
        onFitPage={onFitPage}
      />
    )

    expect(getByTestId('pdf-document')).toBeInTheDocument()
    expect(container).toMatchSnapshot()

    // Select zoom option
    const select = getByRole('combobox')
    fireEvent.change(select, { target: { value: '150' } })
    expect(onScaleChange).toHaveBeenCalledWith(1.5)

    // Zoom buttons
    fireEvent.click(getByTitle('Diminuir Zoom'))
    expect(onZoomOut).toHaveBeenCalled()

    fireEvent.click(getByTitle('Aumentar Zoom'))
    expect(onZoomIn).toHaveBeenCalled()

    // Fit & Page buttons
    fireEvent.click(getByTitle('Ajustar à largura'))
    expect(onFitWidth).toHaveBeenCalled()

    fireEvent.click(getByTitle('Ajustar à página inteira'))
    expect(onFitPage).toHaveBeenCalled()

    // Reset 100% button
    fireEvent.click(getByTitle('Resetar 100%'))
    expect(onScaleChange).toHaveBeenCalledWith(1)

    // Pan / Drag handlers
    const outer = container.firstChild as HTMLElement
    fireEvent.mouseDown(outer, { clientX: 10, clientY: 10, button: 0 })
    fireEvent.mouseMove(outer, { clientX: 30, clientY: 40 })
    fireEvent.mouseUp(outer)
    fireEvent.mouseLeave(outer)
  })
})
