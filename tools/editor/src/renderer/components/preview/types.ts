export interface PDFPreviewProps {
  onClose?: () => void
}

export interface PreviewToolbarProps {
  title?: string
  lastGeneratedAt: Date | null
  numPages: number
  currentPage: number
  scale: number
  isLoading: boolean
  hasPdfData: boolean
  previewMode?: 'hidden' | 'tab' | 'split'
  onPrevPage: () => void
  onNextPage: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onFitWidth: () => void
  onFitPage: () => void
  onScaleChange: (scale: number) => void
  onToggleSplit?: () => void
  onDownload: () => void
  onRefresh: () => void
  onClose?: () => void
}

export interface PreviewViewerProps {
  pdfData: string
  scale: number
  currentPage: number
  onDocumentLoadSuccess: (data: { numPages: number }) => void
  onScaleChange?: (scale: number) => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  onFitWidth?: () => void
}

export interface PreviewErrorStateProps {
  error: string
  errorCode?: string | null
  onRetry: () => void
}

export interface UsePdfPreviewOptions {
  debounceMs?: number
}

export interface UsePdfPreviewReturn {
  pdfData: string | null
  isLoading: boolean
  error: string | null
  errorCode: string | null
  lastGeneratedAt: Date | null
  hasContent: boolean
  generatePreview: (immediate?: boolean) => Promise<void>
  downloadPdf: (filename?: string) => Promise<void>
}
