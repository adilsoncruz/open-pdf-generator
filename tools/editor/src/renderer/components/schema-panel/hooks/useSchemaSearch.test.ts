import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSchemaSearch } from './useSchemaSearch'

describe('useSchemaSearch', () => {
  it('finds search matches, respects case sensitivity, and navigates next/previous', () => {
    const jsonInput = '{\n  "title": "Report",\n  "subtitle": "report 2026"\n}'
    const textarea = {
      focus: vi.fn(),
      setSelectionRange: vi.fn(),
      scrollTop: 0,
    } as any
    const textareaRef = { current: textarea }
    const lineNumbersRef = { current: { scrollTop: 0 } } as any
    const searchInput = { focus: vi.fn() } as any
    const searchInputRef = { current: searchInput }

    const { result } = renderHook(() =>
      useSchemaSearch({
        jsonInput,
        textareaRef,
        lineNumbersRef,
        searchInputRef,
      })
    )

    // Open search
    vi.useFakeTimers()
    act(() => {
      result.current.openSearch()
    })
    expect(result.current.showSearch).toBe(true)
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(searchInput.focus).toHaveBeenCalled()
    vi.useRealTimers()

    // Case insensitive search
    act(() => {
      result.current.setSearchTerm('Report')
    })
    expect(result.current.searchMatches.length).toBe(2)

    // Toggle case sensitivity
    act(() => {
      result.current.setCaseSensitive(true)
    })
    expect(result.current.searchMatches.length).toBe(1)

    // Navigate with 1 match
    act(() => {
      result.current.goToNextMatch()
      result.current.goToPrevMatch()
    })
    expect(result.current.currentMatchIndex).toBe(0)

    // Close search
    act(() => {
      result.current.closeSearch()
    })
    expect(result.current.showSearch).toBe(false)
    expect(textarea.focus).toHaveBeenCalled()
  })

  it('handles empty matches safely', () => {
    const { result } = renderHook(() =>
      useSchemaSearch({
        jsonInput: '{}',
        textareaRef: { current: null },
        lineNumbersRef: { current: null },
        searchInputRef: { current: null },
      })
    )

    act(() => {
      result.current.setSearchTerm('nonexistent')
    })
    expect(result.current.searchMatches.length).toBe(0)

    act(() => {
      result.current.goToNextMatch()
      result.current.goToPrevMatch()
    })
    expect(result.current.currentMatchIndex).toBe(0)
  })
})
