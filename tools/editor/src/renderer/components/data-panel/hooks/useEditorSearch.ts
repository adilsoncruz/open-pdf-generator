import { useState, useEffect, useCallback, type RefObject } from 'react'

interface UseEditorSearchProps {
  jsonInput: string
  textareaRef: RefObject<HTMLTextAreaElement | null>
  lineNumbersRef: RefObject<HTMLDivElement | null>
  searchInputRef: RefObject<HTMLInputElement | null>
}

export function useEditorSearch({
  jsonInput,
  textareaRef,
  lineNumbersRef,
  searchInputRef,
}: UseEditorSearchProps) {
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchMatches, setSearchMatches] = useState<number[]>([])
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const [caseSensitive, setCaseSensitive] = useState(false)

  useEffect(() => {
    if (!searchTerm) {
      setSearchMatches([])
      setCurrentMatchIndex(0)
      return
    }

    const matches: number[] = []
    const searchText = caseSensitive ? jsonInput : jsonInput.toLowerCase()
    const term = caseSensitive ? searchTerm : searchTerm.toLowerCase()

    let index = searchText.indexOf(term)
    while (index !== -1) {
      matches.push(index)
      index = searchText.indexOf(term, index + 1)
    }

    setSearchMatches(matches)
    setCurrentMatchIndex((prev) => {
      if (matches.length === 0) return 0
      if (prev >= matches.length) return 0
      return prev
    })
  }, [searchTerm, jsonInput, caseSensitive])

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus()
      searchInputRef.current.select()
    }
  }, [showSearch, searchInputRef])

  const scrollToMatch = useCallback(
    (pos: number, keepFocusOnSearch: boolean) => {
      const textarea = textareaRef.current
      if (!textarea) return

      textarea.focus()
      textarea.setSelectionRange(pos, pos + searchTerm.length)

      const textBeforeMatch = jsonInput.substring(0, pos)
      const lineNumber = (textBeforeMatch.match(/\n/g) || []).length

      const style = window.getComputedStyle(textarea)
      const lineHeight = parseFloat(style.lineHeight) || 20
      const paddingTop = parseFloat(style.paddingTop) || 8

      const targetScroll = lineNumber * lineHeight + paddingTop - textarea.clientHeight / 3
      textarea.scrollTop = Math.max(0, targetScroll)

      if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = textarea.scrollTop
      }

      if (keepFocusOnSearch) {
        setTimeout(() => searchInputRef.current?.focus(), 10)
      }
    },
    [searchTerm, jsonInput, textareaRef, lineNumbersRef, searchInputRef]
  )

  const goToNextMatch = useCallback(
    (keepFocusOnSearch = false) => {
      if (searchMatches.length === 0) return

      const nextIndex = (currentMatchIndex + 1) % searchMatches.length
      setCurrentMatchIndex(nextIndex)

      const pos = searchMatches[nextIndex]
      scrollToMatch(pos, keepFocusOnSearch)
    },
    [searchMatches, currentMatchIndex, scrollToMatch]
  )

  const goToPrevMatch = useCallback(
    (keepFocusOnSearch = false) => {
      if (searchMatches.length === 0) return

      const prevIndex = currentMatchIndex <= 0 ? searchMatches.length - 1 : currentMatchIndex - 1
      setCurrentMatchIndex(prevIndex)

      const pos = searchMatches[prevIndex]
      scrollToMatch(pos, keepFocusOnSearch)
    },
    [searchMatches, currentMatchIndex, scrollToMatch]
  )

  const openSearch = useCallback(() => {
    setShowSearch(true)
  }, [])

  const closeSearch = useCallback(() => {
    setShowSearch(false)
    setSearchTerm('')
    setSearchMatches([])
    setCurrentMatchIndex(0)
    textareaRef.current?.focus()
  }, [textareaRef])

  return {
    showSearch,
    searchTerm,
    setSearchTerm,
    searchMatches,
    currentMatchIndex,
    caseSensitive,
    setCaseSensitive,
    openSearch,
    closeSearch,
    goToNextMatch,
    goToPrevMatch,
  }
}
