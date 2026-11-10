import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSchemaActions } from './useSchemaActions'
import { useTemplateStore } from '../../../store/templateStore'

describe('useSchemaActions', () => {
  it('handles save, format, load sample, and infer from data', () => {
    let jsonInput = '{"type":"object","properties":{"name":{"type":"string"}}}'
    const setJsonInput = vi.fn((val) => {
      jsonInput = val
    })
    const setSchemaError = vi.fn()

    const textareaRef = { current: { scrollTop: 10 } } as any
    const lineNumbersRef = { current: { scrollTop: 0 } } as any

    const { result } = renderHook(() =>
      useSchemaActions({
        textareaRef,
        lineNumbersRef,
        jsonInput,
        setJsonInput,
        setSchemaError,
      })
    )

    // Save valid schema
    act(() => {
      result.current.handleSave()
    })
    expect(result.current.isSaved).toBe(true)
    expect(useTemplateStore.getState().template.schema).toBeDefined()

    // Format JSON
    act(() => {
      result.current.handleFormat()
    })
    expect(setJsonInput).toHaveBeenCalled()

    // Infer from data
    act(() => {
      result.current.handleInferFromData()
    })
    expect(setJsonInput).toHaveBeenCalled()

    // Load sample
    act(() => {
      result.current.handleLoadSample()
    })
    expect(setJsonInput).toHaveBeenCalled()

    // Scroll sync
    act(() => {
      result.current.handleScroll()
    })
    expect(lineNumbersRef.current.scrollTop).toBe(10)
  })

  it('handles clear, tab indent, empty save, and generate test data', () => {
    let jsonInput = '{"type":"object","properties":{"name":{"type":"string"}}}'
    const setJsonInput = vi.fn((val) => {
      jsonInput = val
    })
    const setSchemaError = vi.fn()

    const textarea = {
      scrollTop: 0,
      selectionStart: 2,
      selectionEnd: 2,
    } as any
    const textareaRef = { current: textarea }
    const lineNumbersRef = { current: null }

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    const { result } = renderHook(() =>
      useSchemaActions({
        textareaRef,
        lineNumbersRef,
        jsonInput,
        setJsonInput,
        setSchemaError,
      })
    )

    // Clear with confirm true
    act(() => {
      result.current.handleClear()
    })
    expect(setJsonInput).toHaveBeenCalledWith('')
    expect(useTemplateStore.getState().template.schema).toBeFalsy()

    // Tab indent
    act(() => {
      result.current.handleTabIndent({
        key: 'Tab',
        preventDefault: vi.fn(),
      } as any)
    })
    expect(setJsonInput).toHaveBeenCalled()

    // Save empty string removes schema
    jsonInput = '   '
    const { result: emptyRes } = renderHook(() =>
      useSchemaActions({
        textareaRef,
        lineNumbersRef,
        jsonInput: '   ',
        setJsonInput,
        setSchemaError,
      })
    )
    act(() => {
      emptyRes.current.handleSave()
    })
    expect(emptyRes.current.isSaved).toBe(true)

    // Generate test data
    const validJson = JSON.stringify({
      type: 'object',
      properties: {
        customer: { type: 'string' },
      },
    })
    const { result: genRes } = renderHook(() =>
      useSchemaActions({
        textareaRef,
        lineNumbersRef,
        jsonInput: validJson,
        setJsonInput,
        setSchemaError,
      })
    )
    act(() => {
      genRes.current.handleGenerateTestData()
    })
    expect(genRes.current.dataGeneratedNotice).toBe(true)

    confirmSpy.mockRestore()
  })

  it('handles validation error branches and cancellation edge cases', () => {
    const setJsonInput = vi.fn()
    const setSchemaError = vi.fn()
    const textareaRef = { current: null }
    const lineNumbersRef = { current: null }

    // 1. Invalid JSON syntax on save
    const { result: invalidJsonRes } = renderHook(() =>
      useSchemaActions({
        textareaRef,
        lineNumbersRef,
        jsonInput: '{ invalid json }',
        setJsonInput,
        setSchemaError,
      })
    )
    act(() => {
      invalidJsonRes.current.handleSave()
    })
    expect(invalidJsonRes.current.isSaved).toBe(false)

    // 2. Invalid schema (ajv compilation error)
    const { result: invalidSchemaRes } = renderHook(() =>
      useSchemaActions({
        textareaRef,
        lineNumbersRef,
        jsonInput: JSON.stringify({ type: 'unknown_type_that_fails' }),
        setJsonInput,
        setSchemaError,
      })
    )
    act(() => {
      invalidSchemaRes.current.handleSave()
    })
    expect(setSchemaError).toHaveBeenCalled()

    // 3. Clear canceled with confirm false
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const { result: cancelClearRes } = renderHook(() =>
      useSchemaActions({
        textareaRef,
        lineNumbersRef,
        jsonInput: '{"type":"object"}',
        setJsonInput,
        setSchemaError,
      })
    )
    act(() => {
      cancelClearRes.current.handleClear()
    })
    expect(setJsonInput).not.toHaveBeenCalledWith('')

    // 4. Format with invalid JSON or empty
    const { result: formatRes } = renderHook(() =>
      useSchemaActions({
        textareaRef,
        lineNumbersRef,
        jsonInput: '',
        setJsonInput,
        setSchemaError,
      })
    )
    act(() => {
      formatRes.current.handleFormat()
    })
    // format with malformed json
    const { result: formatInvalidRes } = renderHook(() =>
      useSchemaActions({
        textareaRef,
        lineNumbersRef,
        jsonInput: '{ malformed',
        setJsonInput,
        setSchemaError,
      })
    )
    act(() => {
      formatInvalidRes.current.handleFormat()
    })

    // 5. Generate test data with empty or cancel confirm
    useTemplateStore.setState({ testData: { existing: true } })
    const { result: genCancelRes } = renderHook(() =>
      useSchemaActions({
        textareaRef,
        lineNumbersRef,
        jsonInput: '{"type":"object"}',
        setJsonInput,
        setSchemaError,
      })
    )
    act(() => {
      genCancelRes.current.handleGenerateTestData()
    })
    expect(genCancelRes.current.dataGeneratedNotice).toBe(false)

    // Generate test data with empty input
    const { result: genEmptyRes } = renderHook(() =>
      useSchemaActions({
        textareaRef,
        lineNumbersRef,
        jsonInput: '',
        setJsonInput,
        setSchemaError,
      })
    )
    act(() => {
      genEmptyRes.current.handleGenerateTestData()
    })

    // 6. Non-tab key on tab indent or missing textarea
    act(() => {
      cancelClearRes.current.handleTabIndent({
        key: 'Enter',
        preventDefault: vi.fn(),
      } as any)
    })

    confirmSpy.mockRestore()
  })
})
