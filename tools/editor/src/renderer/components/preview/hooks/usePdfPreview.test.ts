import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePdfPreview } from './usePdfPreview'
import { usePreviewStore } from '../../../store/previewStore'
import { useTemplateStore } from '../../../store/templateStore'

describe('usePdfPreview', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    usePreviewStore.setState({
      pdfData: null,
      isLoading: false,
      error: null,
      lastGeneratedAt: null,
      refreshTrigger: 0,
    })
    useTemplateStore.setState({
      template: {
        page: [{ id: 'el-1', type: 'text', content: 'Hello' }],
        metadata: { name: 'invoice' },
      } as any,
      testData: { name: 'Customer' },
    })

    ;(window as any).electronAPI = {
      generatePDFPreview: vi.fn().mockResolvedValue({
        success: true,
        pdfBase64: 'JVBERi0xLjQK...',
      }),
    }
  })

  afterEach(() => {
    vi.useRealTimers()
    delete (window as any).electronAPI
  })

  it('generates preview successfully when template has content', async () => {
    const { result } = renderHook(() => usePdfPreview())

    await act(async () => {
      await result.current.generatePreview(true)
    })

    expect(result.current.pdfData).toBe('JVBERi0xLjQK...')
    expect(result.current.error).toBeNull()
    expect(result.current.hasContent).toBe(true)
  })

  it('handles debounced preview generation', async () => {
    const { result } = renderHook(() => usePdfPreview({ debounceMs: 300 }))

    // Clear the call from initial mount effect
    ;(window as any).electronAPI.generatePDFPreview.mockClear()

    act(() => {
      result.current.generatePreview(false)
    })

    expect((window as any).electronAPI.generatePDFPreview).not.toHaveBeenCalled()

    await act(async () => {
      vi.advanceTimersByTime(300)
    })

    expect((window as any).electronAPI.generatePDFPreview).toHaveBeenCalled()
  })

  it('handles CLI / Java error codes properly', async () => {
    ;(window as any).electronAPI.generatePDFPreview = vi.fn().mockResolvedValue({
      success: false,
      errorCode: 'JAVA_NOT_INSTALLED',
      javaNotInstalled: true,
    })

    const { result } = renderHook(() => usePdfPreview())

    await act(async () => {
      await result.current.generatePreview(true)
    })

    expect(result.current.errorCode).toBe('JAVA_NOT_INSTALLED')
    expect(result.current.error).toBeTruthy()
  })

  it('handles cliError message and CLI_NOT_INSTALLED', async () => {
    ;(window as any).electronAPI.generatePDFPreview = vi.fn().mockResolvedValue({
      success: false,
      cliError: 'Error compiling template at line 5',
    })

    const { result } = renderHook(() => usePdfPreview())

    await act(async () => {
      await result.current.generatePreview(true)
    })

    expect(result.current.error).toBe('Error compiling template at line 5')
  })

  it('handles error codes: CLI_NOT_INSTALLED, ERROR_READING_PDF, ERROR_GENERATING_PDF', async () => {
    const { result } = renderHook(() => usePdfPreview())

    for (const code of ['CLI_NOT_INSTALLED', 'ERROR_READING_PDF', 'ERROR_GENERATING_PDF', 'ERROR_EXECUTING_JAVA', 'TIMEOUT', 'EXECUTION_ERROR', 'UNKNOWN_CODE']) {
      ;(window as any).electronAPI.generatePDFPreview = vi.fn().mockResolvedValue({
        success: false,
        errorCode: code,
      })

      await act(async () => {
        await result.current.generatePreview(true)
      })

      expect(result.current.errorCode).toBe(code)
    }
  })

  it('downloads pdf when pdfData is present', async () => {
    usePreviewStore.setState({ pdfData: 'JVBERi0xLjQK...' })
    const { result } = renderHook(() => usePdfPreview())

    const appendChildSpy = vi.spyOn(document.body, 'appendChild')
    const removeChildSpy = vi.spyOn(document.body, 'removeChild')

    act(() => {
      result.current.downloadPdf('test.pdf')
    })

    expect(appendChildSpy).toHaveBeenCalled()
    expect(removeChildSpy).toHaveBeenCalled()

    appendChildSpy.mockRestore()
    removeChildSpy.mockRestore()

    // Download when pdfData is null (early return)
    usePreviewStore.setState({ pdfData: null })
    act(() => {
      result.current.downloadPdf()
    })
  })

  it('handles debounce cancellation, refreshTrigger and unexpected exceptions', async () => {
    const { result, rerender } = renderHook(() => usePdfPreview({ debounceMs: 500 }))

    // Debounce timer scheduled then immediately cancelled by immediate call
    act(() => {
      result.current.generatePreview(false)
    })
    act(() => {
      result.current.generatePreview(true)
    })

    // Test refreshTrigger effect
    act(() => {
      usePreviewStore.setState({ refreshTrigger: 2 })
    })
    rerender()

    // Test unhandled exception in electronAPI
    ;(window as any).electronAPI.generatePDFPreview = vi.fn().mockRejectedValue(new Error('Fatal preview error'))
    await act(async () => {
      await result.current.generatePreview(true)
    })
    expect(result.current.error).toBe('An error occurred while generating the preview.')
  })
})
