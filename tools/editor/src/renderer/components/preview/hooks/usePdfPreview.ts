import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { usePreviewStore } from '../../../store/previewStore'
import { useTemplateStore } from '../../../store/templateStore'
import { useTranslation } from '../../../i18n'
import type { UsePdfPreviewOptions, UsePdfPreviewReturn } from '../types'

export function usePdfPreview(options: UsePdfPreviewOptions = {}): UsePdfPreviewReturn {
  const { debounceMs = 0 } = options
  const {
    pdfData,
    isLoading,
    error,
    setLoading,
    setPdfData,
    setError,
    lastGeneratedAt,
    refreshTrigger,
  } = usePreviewStore()

  const { template, testData } = useTemplateStore()
  const { t } = useTranslation()

  const [errorCode, setErrorCode] = useState<string | null>(null)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevTriggerRef = useRef<number>(0)

  // Check if template has any elements to render
  const hasContent = useMemo(() => {
    const page = template.page || []
    const headerElements = template.pageSettings?.header?.elements || []
    const footerElements = template.pageSettings?.footer?.elements || []
    const summaryElements = template.summaryPage?.elements || []

    return (
      page.length > 0 ||
      headerElements.length > 0 ||
      footerElements.length > 0 ||
      summaryElements.length > 0
    )
  }, [template])

  // Map error codes to translated messages
  const getErrorMessage = useCallback(
    (code?: string): string => {
      switch (code) {
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
    },
    [t]
  )

  const executeGeneration = useCallback(async () => {
    if (!hasContent) {
      console.log('📄 [Preview] Template is empty, skipping preview generation')
      return
    }

    console.log('📄 [Preview] Starting preview generation...')
    setLoading(true)
    setError(null)
    setErrorCode(null)

    try {
      const templateJson = JSON.stringify(template)
      const dataJson = JSON.stringify(testData || {})

      if (!window.electronAPI?.generatePDFPreview) {
        console.warn('⚠️ [Preview] electronAPI.generatePDFPreview is not available in current environment')
        setError(t.preview.genericError)
        return
      }

      console.log('📄 [Preview] Calling generatePDFPreview API...')
      const result = await window.electronAPI.generatePDFPreview(templateJson, dataJson)

      console.log('📄 [Preview] Result summary:', {
        success: result.success,
        errorCode: result.errorCode,
        hasPdfData: !!result.pdfBase64,
        pdfSize: result.pdfBase64?.length || 0,
        cliError: result.cliError?.substring(0, 500),
        code: result.code,
      })

      if (result.success && result.pdfBase64) {
        console.log('✅ [Preview] PDF preview generated successfully')
        setPdfData(result.pdfBase64)
        setErrorCode(null)
      } else {
        const detectedErrorCode =
          result.errorCode ||
          (result.javaNotInstalled ? 'JAVA_NOT_INSTALLED' : undefined) ||
          (result.cliNotInstalled ? 'CLI_NOT_INSTALLED' : undefined)

        setErrorCode(detectedErrorCode || null)

        if (result.cliError) {
          console.error('❌ [Preview] CLI Error:', result.cliError)
          setError(result.cliError)
        } else {
          console.error('❌ [Preview] Failed to generate preview:', detectedErrorCode)
          setError(getErrorMessage(detectedErrorCode))
        }
      }
    } catch (err) {
      console.error('❌ [Preview] Exception during preview generation:', err)
      setError(t.preview.genericError)
      setErrorCode(null)
    } finally {
      setLoading(false)
    }
  }, [hasContent, template, testData, setLoading, setError, getErrorMessage, setPdfData, t])

  const generatePreview = useCallback(
    async (immediate = true) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }

      if (immediate || debounceMs <= 0) {
        await executeGeneration()
      } else {
        debounceTimerRef.current = setTimeout(() => {
          executeGeneration()
        }, debounceMs)
      }
    },
    [debounceMs, executeGeneration]
  )

  const downloadPdf = useCallback(
    async (filename?: string) => {
      if (!pdfData) return
      const name = filename || `${template.metadata?.name || 'document'}.pdf`

      try {
        const link = document.createElement('a')
        link.href = `data:application/pdf;base64,${pdfData}`
        link.download = name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (err) {
        console.error('❌ [Preview] Failed to download PDF:', err)
      }
    },
    [pdfData, template.metadata?.name]
  )

  // Generate preview on mount or when no data (only if template has content)
  useEffect(() => {
    if (!pdfData && !isLoading && !error && hasContent) {
      generatePreview(true)
    }
  }, [pdfData, isLoading, error, generatePreview, hasContent])

  // Update preview when triggerRefresh is called (on save)
  useEffect(() => {
    if (refreshTrigger > 0 && refreshTrigger !== prevTriggerRef.current && !isLoading && hasContent) {
      prevTriggerRef.current = refreshTrigger
      generatePreview(true)
    }
  }, [refreshTrigger, isLoading, generatePreview, hasContent])

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return {
    pdfData,
    isLoading,
    error,
    errorCode,
    lastGeneratedAt,
    hasContent,
    generatePreview,
    downloadPdf,
  }
}
