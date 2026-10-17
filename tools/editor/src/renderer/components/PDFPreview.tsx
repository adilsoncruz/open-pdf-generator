import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { usePreviewStore } from '../store/previewStore'
import { useTemplateStore } from '../store/templateStore'
import { useTranslation } from '../i18n'
import { 
  ArrowPathIcon, 
  XMarkIcon,
  ArrowTopRightOnSquareIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ExclamationTriangleIcon,
  DocumentPlusIcon
} from '@heroicons/react/24/outline'
import { Button, Select, Divider } from './atoms'
import { IconButton } from './molecules'

// Configure PDF.js worker using local file from node_modules
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker

interface PDFPreviewProps {
  onClose?: () => void
}

export default function PDFPreview({ onClose }: PDFPreviewProps) {
  const { pdfData, isLoading, error, setLoading, setPdfData, setError, lastGeneratedAt, refreshTrigger } = usePreviewStore()
  const { template, testData } = useTemplateStore()
  const { t } = useTranslation()
  
  const [numPages, setNumPages] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [scale, setScale] = useState<number>(0.8)
  
  // Pan/drag state
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const contentRef = useRef<HTMLDivElement>(null)
  
  // Check if template has any elements to render
  const hasContent = useMemo(() => {
    const page = template.page || []
    const headerElements = template.pageSettings?.header?.elements || []
    const footerElements = template.pageSettings?.footer?.elements || []
    const summaryElements = template.summaryPage?.elements || []
    
    return page.length > 0 || 
           headerElements.length > 0 || 
           footerElements.length > 0 || 
           summaryElements.length > 0
  }, [template])
  
  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setCurrentPage(1)
  }, [])
  
  // Map error codes to translated messages
  const getErrorMessage = useCallback((errorCode?: string): string => {
    switch (errorCode) {
      case 'JAVA_NOT_INSTALLED':
        return t.errors.javaNotInstalled
      case 'CLI_NOT_INSTALLED':
        return t.errors.cliNotInstalled
      case 'ERROR_READING_PDF':
        return t.errors.errorReadingPdf
      case 'ERROR_GENERATING_PDF':
        return t.errors.errorGeneratingPdf
      case 'ERROR_EXECUTING_JAVA':
        return t.errors.errorExecutingJava
      default:
        return t.preview.genericError
    }
  }, [t])
  
  const generatePreview = useCallback(async () => {
    // Don't try to generate if template is empty
    if (!hasContent) {
      console.log('📄 [Preview] Template is empty, skipping preview generation')
      return
    }
    
    console.log('📄 [Preview] Starting preview generation...')
    console.log('📄 [Preview] Template structure:', {
      name: template.metadata?.name,
      page: template.page?.length || 0,
      hasHeader: !!template.pageSettings?.header,
      hasFooter: !!template.pageSettings?.footer,
      // Check if JSON has correct structure
      jsonKeys: Object.keys(template)
    })
    
    setLoading(true)
    setError(null)
    
    try {
      const templateJson = JSON.stringify(template)
      const dataJson = JSON.stringify(testData || {})
      
      // Log first 500 chars of JSON to verify structure
      console.log('📄 [Preview] Template JSON (first 500 chars):', templateJson.substring(0, 500))
      
      console.log('📄 [Preview] Calling generatePDFPreview API...')
      const result = await window.electronAPI.generatePDFPreview(templateJson, dataJson)
      
      console.log('📄 [Preview] Full result:', JSON.stringify(result, null, 2))
      console.log('📄 [Preview] Result summary:', {
        success: result.success,
        errorCode: result.errorCode,
        hasPdfData: !!result.pdfBase64,
        pdfSize: result.pdfBase64?.length || 0,
        cliError: result.cliError?.substring(0, 500),
        code: result.code
      })
      
      if (result.success && result.pdfBase64) {
        console.log('✅ [Preview] PDF preview generated successfully')
        setPdfData(result.pdfBase64)
      } else {
        console.error('❌ [Preview] Failed to generate preview:', result.errorCode)
        if (result.cliError) {
          console.error('❌ [Preview] CLI Error:', result.cliError)
        }
        // Translate error code to localized message
        setError(getErrorMessage(result.errorCode))
      }
    } catch (error) {
      console.error('❌ [Preview] Exception during preview generation:', error)
      setError(t.preview.genericError)
    } finally {
      setLoading(false)
    }
  }, [template, testData, setLoading, setPdfData, setError, hasContent, t, getErrorMessage])
  
  // Generate preview on mount or when no data (only if template has content)
  useEffect(() => {
    if (!pdfData && !isLoading && !error && hasContent) {
      generatePreview()
    }
  }, [pdfData, isLoading, error, generatePreview, hasContent])
  
  // Ref to track previous trigger
  const prevTriggerRef = useRef<number>(0)
  
  // Update preview when triggerRefresh is called (on save)
  useEffect(() => {
    if (refreshTrigger > 0 && refreshTrigger !== prevTriggerRef.current && !isLoading && hasContent) {
      prevTriggerRef.current = refreshTrigger
      generatePreview()
    }
  }, [refreshTrigger, isLoading, generatePreview, hasContent])
  
  const goToPrevPage = () => setCurrentPage(p => Math.max(1, p - 1))
  const goToNextPage = () => setCurrentPage(p => Math.min(numPages, p + 1))
  const zoomIn = () => setScale(s => Math.min(2, s + 0.2))
  const zoomOut = () => setScale(s => Math.max(0.4, s - 0.2))
  const fitToWidth = () => setScale(0.8)
  
  // Pan/Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && contentRef.current) { // Left click only
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY })
      e.preventDefault()
    }
  }
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && contentRef.current) {
      const deltaX = e.clientX - panStart.x
      const deltaY = e.clientY - panStart.y
      
      contentRef.current.scrollLeft -= deltaX
      contentRef.current.scrollTop -= deltaY
      
      setPanStart({ x: e.clientX, y: e.clientY })
    }
  }
  
  const handleMouseUp = () => {
    setIsPanning(false)
  }
  
  const handleMouseLeave = () => {
    setIsPanning(false)
  }
  
  return (
    <div className="flex flex-col h-full theme-bg-secondary border-l theme-border relative">
      
      <div className="flex items-center justify-between px-3 py-2 border-b theme-border theme-bg">
        {/* Title */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium theme-text">{t.preview.title}</span>
          {lastGeneratedAt && (
            <span className="text-xs theme-text-muted">
              {lastGeneratedAt.toLocaleTimeString()}
            </span>
          )}
        </div>
        
        
        {numPages > 0 && (
          <div className="flex items-center gap-1">
            <button
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
              className="p-1 rounded theme-hover disabled:opacity-30"
              title="Previous page"
            >
              <ChevronLeftIcon className="w-4 h-4 theme-text" />
            </button>
            
            <span className="text-xs theme-text min-w-[50px] text-center">
              {currentPage} / {numPages}
            </span>
            
            <button
              onClick={goToNextPage}
              disabled={currentPage >= numPages}
              className="p-1 rounded theme-hover disabled:opacity-30"
              title="Next page"
            >
              <ChevronRightIcon className="w-4 h-4 theme-text" />
            </button>
          </div>
        )}
        
        
        <div className="flex items-center gap-1">
          <button
            onClick={generatePreview}
            disabled={isLoading}
            className="p-1.5 rounded theme-hover theme-text-muted hover:theme-text"
            title="Refresh preview"
          >
            <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          

          
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded theme-hover theme-text-muted hover:theme-text"
              title="Close preview"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* PDF Content */}
      <div 
        ref={contentRef}
        className={`flex-1 overflow-auto p-4 bg-gray-600 dark:bg-gray-900 relative ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Empty template message */}
        {!hasContent && !isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4 max-w-sm text-center p-6">
              <DocumentPlusIcon className="w-16 h-16 text-white/40" />
              <div>
                <h3 className="text-white text-lg font-medium mb-2">
                  {t.preview.emptyTemplate}
                </h3>
                <p className="text-white/60 text-sm">
                  {t.preview.emptyTemplateHint}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <ArrowPathIcon className="w-8 h-8 text-white animate-spin" />
              <span className="text-white text-sm">{t.preview.generating}</span>
            </div>
          </div>
        )}
        
        {error && hasContent && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3 max-w-xs text-center">
              <ExclamationTriangleIcon className="w-12 h-12 text-amber-400" />
              <span className="text-white text-sm">{error}</span>
              <Button
                onClick={generatePreview}
                variant="primary"
                size="sm"
              >
                {t.preview.tryAgain}
              </Button>
            </div>
          </div>
        )}
        
        {!isLoading && !error && pdfData && (
          <div className="inline-block min-w-full min-h-full">
            <div className="flex justify-center items-start min-w-max">
              <Document
                file={`data:application/pdf;base64,${pdfData}`}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center p-8">
                    <ArrowPathIcon className="w-6 h-6 text-white animate-spin" />
                  </div>
                }
                error={
                  <div className="flex items-center justify-center p-8 text-red-400">
                    Error loading PDF
                  </div>
                }
                className="shadow-2xl"
              >
                <Page
                  pageNumber={currentPage}
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="bg-white"
                />
              </Document>
            </div>
          </div>
        )}
        
        {!isLoading && !error && !pdfData && hasContent && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="text-white/70 text-sm">{t.preview.loading}</span>
              <Button
                onClick={generatePreview}
                variant="primary"
                size="sm"
              >
                {t.preview.refresh}
              </Button>
            </div>
          </div>
        )}
        
        </div>
      
      {/* Zoom Controls - Fixed at bottom center */}
      {(() => {
        const currentPercent = Math.round(scale * 100)
        const baseOptions = [40, 60, 80, 100, 120, 150, 200]
        const allOptions = Array.from(new Set([...baseOptions, currentPercent])).sort((a, b) => a - b)

        return (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-slate-900/95 backdrop-blur-md rounded-lg shadow-xl border border-slate-800 px-2 py-1 flex items-center gap-1 text-slate-200">
            <IconButton
              icon="zoom-out"
              onClick={zoomOut}
              disabled={scale <= 0.4}
              tooltip="Diminuir Zoom"
              size="xs"
              className="text-slate-400 hover:text-white"
            />

            <div className="relative flex items-center">
              <select
                value={currentPercent.toString()}
                onChange={(e) => setScale(Number(e.target.value) / 100)}
                className="w-[72px] bg-slate-950 border border-slate-700/80 hover:border-slate-600 rounded-md text-[11px] font-mono font-medium text-slate-200 py-0.5 pl-2 pr-4 text-left cursor-pointer appearance-none focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
              >
                {allOptions.map((opt) => (
                  <option key={opt} value={opt.toString()} className="bg-slate-900 text-slate-200">
                    {opt}%
                  </option>
                ))}
              </select>
              <div className="absolute right-1.5 pointer-events-none text-slate-400">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <IconButton
              icon="zoom-in"
              onClick={zoomIn}
              disabled={scale >= 2}
              tooltip="Aumentar Zoom"
              size="xs"
              className="text-slate-400 hover:text-white"
            />

            <div className="w-px h-3.5 bg-slate-800 mx-0.5" />

            <button
              onClick={fitToWidth}
              className="px-1.5 py-0.5 text-[11px] font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded transition"
              title="Ajustar à largura"
            >
              Fit
            </button>

            <button
              onClick={() => setScale(1)}
              className="px-1.5 py-0.5 text-[11px] font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded transition"
              title="Resetar 100%"
            >
              100%
            </button>
          </div>
        )
      })()}
    </div>
  )
}

