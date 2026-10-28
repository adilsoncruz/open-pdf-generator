import React, { useState, useCallback } from 'react'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { Button } from './atoms'
import { useTranslation } from '../i18n'
import { usePreviewStore } from '../store/previewStore'
import {
  usePdfPreview,
  PreviewToolbar,
  PreviewViewer,
  PreviewErrorState,
  PreviewEmptyState,
} from './preview'
import type { PDFPreviewProps } from './preview/types'

export type { PDFPreviewProps }

export default function PDFPreview({ onClose }: PDFPreviewProps) {
  const { mode: previewMode, setMode: setPreviewMode } = usePreviewStore()
  const { t } = useTranslation()

  const {
    pdfData,
    isLoading,
    error,
    errorCode,
    lastGeneratedAt,
    hasContent,
    generatePreview,
    downloadPdf,
  } = usePdfPreview()

  const [numPages, setNumPages] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [scale, setScale] = useState<number>(0.8)

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setCurrentPage(1)
  }, [])

  const goToPrevPage = useCallback(() => {
    setCurrentPage((p) => Math.max(1, p - 1))
  }, [])

  const goToNextPage = useCallback(() => {
    setCurrentPage((p) => Math.min(numPages, p + 1))
  }, [numPages])

  const zoomIn = useCallback(() => {
    setScale((s) => Math.min(2, Number((s + 0.2).toFixed(1))))
  }, [])

  const zoomOut = useCallback(() => {
    setScale((s) => Math.max(0.4, Number((s - 0.2).toFixed(1))))
  }, [])

  const fitToWidth = useCallback(() => {
    setScale(0.8)
  }, [])

  const fitToPage = useCallback(() => {
    setScale(0.6)
  }, [])

  const handleToggleSplit = useCallback(() => {
    setPreviewMode(previewMode === 'split' ? 'tab' : 'split')
  }, [previewMode, setPreviewMode])

  return (
    <div className="flex flex-col h-full theme-bg-secondary border-l theme-border relative select-none">
      {/* Top Toolbar */}
      <PreviewToolbar
        lastGeneratedAt={lastGeneratedAt}
        numPages={numPages}
        currentPage={currentPage}
        scale={scale}
        isLoading={isLoading}
        hasPdfData={!!pdfData}
        previewMode={previewMode}
        onPrevPage={goToPrevPage}
        onNextPage={goToNextPage}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onFitWidth={fitToWidth}
        onFitPage={fitToPage}
        onScaleChange={setScale}
        onToggleSplit={handleToggleSplit}
        onDownload={downloadPdf}
        onRefresh={() => generatePreview(true)}
        onClose={onClose}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 relative flex flex-col">
        {/* Empty Template Message */}
        {!hasContent && !isLoading && <PreviewEmptyState />}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex items-center justify-center h-full bg-gray-600/30 dark:bg-gray-900/30">
            <div className="flex flex-col items-center gap-3">
              <ArrowPathIcon className="w-8 h-8 text-white animate-spin" />
              <span className="text-white text-sm">{t.preview.generating}</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && hasContent && (
          <PreviewErrorState
            error={error}
            errorCode={errorCode}
            onRetry={() => generatePreview(true)}
          />
        )}

        {/* PDF Viewer */}
        {!isLoading && !error && pdfData && (
          <PreviewViewer
            pdfData={pdfData}
            scale={scale}
            currentPage={currentPage}
            onDocumentLoadSuccess={onDocumentLoadSuccess}
            onScaleChange={setScale}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onFitWidth={fitToWidth}
          />
        )}

        {/* Initial Empty / Waiting for Generation State */}
        {!isLoading && !error && !pdfData && hasContent && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="text-white/70 text-sm">{t.preview.loading}</span>
              <Button onClick={() => generatePreview(true)} variant="primary" size="sm">
                {t.preview.refresh}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
