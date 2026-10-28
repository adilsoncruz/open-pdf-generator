import { useState, useEffect, useCallback, type RefObject } from 'react'

interface UseSchemaSearchProps {
  jsonInput: string
  textareaRef: RefObject<HTMLTextAreaElement | null>
  lineNumbersRef: RefObject<HTMLDivElement | null>
  searchInputRef: RefObject<HTMLInputElement | null>
}

export function useSchemaSearch({
  jsonInput,
  textareaRef,
  lineNumbersRef,
  searchInputRef,
}: UseSchemaSearchProps) {
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

  const scrollToMatch = useCallback((pos: number) => {
    if (!textareaRef.current) return
    const textarea = textareaRef.current
    textarea.focus()
    textarea.setSelectionRange(pos, pos + searchTerm.length)

    const textBefore = jsonInput.substring(0, pos)
    const lineIndex = (textBefore.match(/\n/g) || []).length
    const lineHeight = 20
    const targetScroll = Math.max(0, lineIndex * lineHeight - 100)
    textarea.scrollTop = targetScroll
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = targetScroll
    }
  }, [jsonInput, searchTerm, textareaRef, lineNumbersRef])

  const goToNextMatch = useCallback(() => {
    if (searchMatches.length === 0) return
    const nextIndex = (currentMatchIndex + 1) % searchMatches.length
    setCurrentMatchIndex(nextIndex)
    scrollToMatch(searchMatches[nextIndex])
  }, [currentMatchIndex, searchMatches, scrollToMatch])

  const goToPrevMatch = useCallback(() => {
    if (searchMatches.length === 0) return
    const prevIndex = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length
    setCurrentMatchIndex(prevIndex)
    scrollToMatch(searchMatches[prevIndex])
  }, [currentMatchIndex, searchMatches, scrollToMatch])

  const openSearch = useCallback(() => {
    setShowSearch(true)
    setTimeout(() => searchInputRef.current?.focus(), 50)
  }, [searchInputRef])

  const closeSearch = useCallback(() => {
    setShowSearch(false)
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
