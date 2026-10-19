import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react'
import { useTemplateStore } from '../store/templateStore'
import { usePreviewStore } from '../store/previewStore'
import { useTranslation } from '../i18n'
import { Button, Icon } from './atoms'
import { generateSampleFromSchema } from '../utils/schemaGenerator'

interface DataPanelProps {
  onClose: () => void
}

function validateJson(value: string): { valid: boolean; error: string | null; errorLine: number | null } {
  if (!value.trim()) {
    return { valid: true, error: null, errorLine: null }
  }
  try {
    JSON.parse(value)
    return { valid: true, error: null, errorLine: null }
  } catch (e) {
    const errorMessage = (e as Error).message
    
    const lineMatch = errorMessage.match(/position (\d+)/)
    let errorLine: number | null = null
    if (lineMatch) {
      const position = parseInt(lineMatch[1], 10)
      
      const beforeError = value.substring(0, position)
      errorLine = (beforeError.match(/\n/g) || []).length + 1
    }
    return { valid: false, error: errorMessage, errorLine }
  }
}

export default function DataPanel({ onClose }: DataPanelProps) {
  const { t } = useTranslation()
  const { testData, setTestData, template } = useTemplateStore()
  const { mode: previewMode, triggerRefresh } = usePreviewStore()
  const [jsonInput, setJsonInput] = useState(JSON.stringify(testData, null, 2))
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(true)
  const [errorLine, setErrorLine] = useState<number | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Estados para busca
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchMatches, setSearchMatches] = useState<number[]>([])
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const [caseSensitive, setCaseSensitive] = useState(false)

  // Validar JSON em tempo real
  useEffect(() => {
    const result = validateJson(jsonInput)
    setIsValid(result.valid)
    setErrorLine(result.errorLine)
    if (!result.valid) {
      setError(result.error)
    } else {
      setError(null)
    }
  }, [jsonInput])

  
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
    setCurrentMatchIndex(prev => {
      if (matches.length === 0) return 0
      if (prev >= matches.length) return 0
      return prev
    })
  }, [searchTerm, jsonInput, caseSensitive])

  // Focar no campo de busca quando abrir
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus()
      searchInputRef.current.select()
    }
  }, [showSearch])

  
  const scrollToMatch = useCallback((pos: number, keepFocusOnSearch: boolean) => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.focus()
    textarea.setSelectionRange(pos, pos + searchTerm.length)
    
    const textBeforeMatch = jsonInput.substring(0, pos)
    const lineNumber = (textBeforeMatch.match(/\n/g) || []).length
    
    const style = window.getComputedStyle(textarea)
    const lineHeight = parseFloat(style.lineHeight) || 20
    const paddingTop = parseFloat(style.paddingTop) || 8
    
    const targetScroll = (lineNumber * lineHeight) + paddingTop - (textarea.clientHeight / 3)
    textarea.scrollTop = Math.max(0, targetScroll)
    
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textarea.scrollTop
    }
    
    if (keepFocusOnSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 10)
    }
  }, [searchTerm, jsonInput])

  
  const goToNextMatch = useCallback((keepFocusOnSearch = false) => {
    if (searchMatches.length === 0) return
    
    const nextIndex = (currentMatchIndex + 1) % searchMatches.length
    setCurrentMatchIndex(nextIndex)
    
    const pos = searchMatches[nextIndex]
    scrollToMatch(pos, keepFocusOnSearch)
  }, [searchMatches, currentMatchIndex, scrollToMatch])

  
  const goToPrevMatch = useCallback((keepFocusOnSearch = false) => {
    if (searchMatches.length === 0) return
    
    const prevIndex = currentMatchIndex <= 0 ? searchMatches.length - 1 : currentMatchIndex - 1
    setCurrentMatchIndex(prevIndex)
    
    const pos = searchMatches[prevIndex]
    scrollToMatch(pos, keepFocusOnSearch)
  }, [searchMatches, currentMatchIndex, scrollToMatch])

  // Fechar busca
  const closeSearch = useCallback(() => {
    setShowSearch(false)
    setSearchTerm('')
    setSearchMatches([])
    setCurrentMatchIndex(0)
    textareaRef.current?.focus()
  }, [])

  
  const handleScroll = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }, [])

  
  const lineCount = jsonInput.split('\n').length

  const handleApply = () => {
    try {
      const parsed = JSON.parse(jsonInput)
      setTestData(parsed)
      setError(null)
      // Atualizar preview se estiver aberto
      if (previewMode !== 'hidden') {
        triggerRefresh()
      }
      onClose()
    } catch (e) {
      setError(`${t.dataPanel.invalidJson}: ${(e as Error).message}`)
    }
  }

  // Handle Tab key for indentation
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Ctrl+F ou Cmd+F: abrir busca
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault()
      setShowSearch(true)
      return
    }

    // Escape: fechar busca
    if (e.key === 'Escape' && showSearch) {
      e.preventDefault()
      closeSearch()
      return
    }

    
    if (e.key === 'F3' || ((e.ctrlKey || e.metaKey) && e.key === 'g')) {
      e.preventDefault()
      if (e.shiftKey) {
        goToPrevMatch(false)
      } else {
        goToNextMatch(false)
      }
      return
    }

    if (e.key === 'Tab') {
      e.preventDefault()
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const value = textarea.value

      if (e.shiftKey) {
        
        const beforeCursor = value.substring(0, start)
        const lastNewLine = beforeCursor.lastIndexOf('\n')
        const lineStart = lastNewLine + 1
        const lineContent = value.substring(lineStart, start)
        
        
        const spacesMatch = lineContent.match(/^( {1,2}|\t)/)
        if (spacesMatch) {
          const spacesToRemove = spacesMatch[0].length
          const newValue = value.substring(0, lineStart) + value.substring(lineStart + spacesToRemove)
          setJsonInput(newValue)
          
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = Math.max(start - spacesToRemove, lineStart)
          }, 0)
        }
      } else {
        
        const newValue = value.substring(0, start) + '  ' + value.substring(end)
        setJsonInput(newValue)
        
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2
        }, 0)
      }
    }

    
    if (e.key === 'Enter') {
      e.preventDefault()
      const start = textarea.selectionStart
      const value = textarea.value

      
      const beforeCursor = value.substring(0, start)
      const lastNewLine = beforeCursor.lastIndexOf('\n')
      const currentLine = beforeCursor.substring(lastNewLine + 1)
      const indentMatch = currentLine.match(/^(\s*)/)
      let indent = indentMatch ? indentMatch[1] : ''

      
      const charBefore = value[start - 1]
      const charAfter = value[start]
      const addIndent = charBefore === '{' || charBefore === '['
      const closingBracket = (charBefore === '{' && charAfter === '}') || (charBefore === '[' && charAfter === ']')

      if (addIndent) {
        indent += '  '
      }

      let newValue: string
      let newCursorPos: number

      if (closingBracket) {
        // Se estamos entre {} ou [], criar nova linha e posicionar cursor
        const baseIndent = indentMatch ? indentMatch[1] : ''
        newValue = value.substring(0, start) + '\n' + indent + '\n' + baseIndent + value.substring(start)
        newCursorPos = start + 1 + indent.length
      } else {
        newValue = value.substring(0, start) + '\n' + indent + value.substring(start)
        newCursorPos = start + 1 + indent.length
      }

      setJsonInput(newValue)
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = newCursorPos
      }, 0)
    }

    
    if ((e.ctrlKey || e.metaKey) && e.key === ']') {
      e.preventDefault()
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const value = textarea.value

      
      const beforeCursor = value.substring(0, start)
      const lastNewLine = beforeCursor.lastIndexOf('\n')
      const lineStart = lastNewLine + 1

      
      const newValue = value.substring(0, lineStart) + '  ' + value.substring(lineStart)
      setJsonInput(newValue)
      setTimeout(() => {
        textarea.selectionStart = start + 2
        textarea.selectionEnd = end + 2
      }, 0)
    }

    
    if ((e.ctrlKey || e.metaKey) && e.key === '[') {
      e.preventDefault()
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const value = textarea.value

      
      const beforeCursor = value.substring(0, start)
      const lastNewLine = beforeCursor.lastIndexOf('\n')
      const lineStart = lastNewLine + 1
      const lineContent = value.substring(lineStart)

      
      const spacesMatch = lineContent.match(/^( {1,2}|\t)/)
      if (spacesMatch) {
        const spacesToRemove = spacesMatch[0].length
        const newValue = value.substring(0, lineStart) + value.substring(lineStart + spacesToRemove)
        setJsonInput(newValue)
        setTimeout(() => {
          textarea.selectionStart = Math.max(start - spacesToRemove, lineStart)
          textarea.selectionEnd = Math.max(end - spacesToRemove, lineStart)
        }, 0)
      }
    }
  }

  // Format JSON
  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonInput)
      setJsonInput(JSON.stringify(parsed, null, 2))
      setError(null)
    } catch {
      setError(t.dataPanel.cannotFormat)
    }
  }

  // Minify JSON
  const handleMinify = () => {
    try {
      const parsed = JSON.parse(jsonInput)
      setJsonInput(JSON.stringify(parsed))
      setError(null)
    } catch {
      setError(t.dataPanel.cannotMinify)
    }
  }

  const handleLoadFromFile = async () => {
    try {
      const result = await window.electronAPI.openDataFile()
      if (result) {
        setJsonInput(result.content)
        setError(null)
      }
    } catch (e) {
      setError(`${t.dataPanel.errorLoading}: ${(e as Error).message}`)
    }
  }

  const handleGenerateFromSchema = () => {
    if (!template.schema) return
    if (jsonInput.trim() && jsonInput.trim() !== '{}') {
      if (!confirm('Deseja substituir os dados de teste atuais pelos dados gerados a partir do Schema?')) {
        return
      }
    }
    const sample = generateSampleFromSchema(template.schema)
    setJsonInput(JSON.stringify(sample, null, 2))
    setError(null)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="theme-surface border theme-border rounded-xl shadow-xl w-2/3 max-w-4xl max-h-[80vh] flex flex-col">
        <div className="px-6 py-4 border-b theme-border flex items-center justify-between">
          <h2 className="text-lg font-semibold theme-text">{t.dataPanel.title}</h2>
          <button
            onClick={onClose}
            className="theme-text-muted hover:theme-text text-2xl"
          >
            ×
          </button>
        </div>

        <div className="overflow-auto p-6 flex flex-col">
          <p className="text-sm theme-text-secondary mb-4 flex-shrink-0">
            {t.dataPanel.description}
          </p>

          <div className="flex gap-2 mb-4 flex-wrap flex-shrink-0">
            <Button
              onClick={handleLoadFromFile}
              variant="primary"
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Icon name="folder" size="sm" />
              {t.dataPanel.loadFile}
            </Button>
            {template.schema && (
              <Button
                onClick={handleGenerateFromSchema}
                variant="secondary"
                size="sm"
                title="Gera dados de teste compatíveis com o Schema do template"
              >
                <span className="font-mono text-xs">⚡</span>
                Gerar do Schema
              </Button>
            )}
            <Button
              onClick={handleFormat}
              disabled={!isValid}
              variant="secondary"
              size="sm"
            >
              <Icon name="settings" size="sm" />
              {t.dataPanel.format}
            </Button>
            <Button
              onClick={handleMinify}
              disabled={!isValid}
              variant="secondary"
              size="sm"
            >
              <Icon name="code" size="sm" />
              {t.dataPanel.minify}
            </Button>
          </div>

          {/* Editor container with line numbers - altura fixa */}
          <div className={`relative flex flex-col rounded-lg border-2 overflow-hidden transition-colors ${
            isValid 
              ? 'border-gray-200 focus-within:border-primary-500' 
              : 'border-red-400 bg-red-50/30'
          }`} style={{ height: '400px' }}>
            {/* Search bar */}
            {showSearch && (
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200 flex-shrink-0">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      closeSearch()
                    } else if (e.key === 'Enter') {
                      e.preventDefault()
                      if (e.shiftKey) {
                        goToPrevMatch(true)
                      } else {
                        goToNextMatch(true)
                      }
                    }
                  }}
                  className="flex-1 px-2 py-1 text-sm bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                  placeholder={`${t.common.search}...`}
                />
                
                {/* Match counter */}
                <span className="text-xs text-gray-500 min-w-[60px] text-center">
                  {searchTerm ? (
                    searchMatches.length > 0 
                      ? `${currentMatchIndex + 1} / ${searchMatches.length}`
                      : t.common.none
                  ) : ''}
                </span>
                
                {/* Navigation buttons */}
                <button
                  onClick={() => goToPrevMatch(false)}
                  disabled={searchMatches.length === 0}
                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                  title={t.dataPanel.previous}
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => goToNextMatch(false)}
                  disabled={searchMatches.length === 0}
                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                  title={t.dataPanel.next}
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Case sensitive toggle */}
                <button
                  onClick={() => setCaseSensitive(!caseSensitive)}
                  className={`px-2 py-1 text-xs rounded font-medium transition ${
                    caseSensitive 
                      ? 'bg-primary-100 text-primary-700 border border-primary-300' 
                      : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                  }`}
                  title={t.dataPanel.caseSensitive}
                >
                  Aa
                </button>
                
                {/* Close button */}
                <button
                  onClick={closeSearch}
                  className="p-1 hover:bg-gray-200 rounded"
                  title={`${t.common.close} (Esc)`}
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Editor row with line numbers and textarea */}
            <div className="relative flex flex-1 overflow-hidden">
              {/* Line numbers */}
              <div
                ref={lineNumbersRef}
                className="flex-shrink-0 bg-gray-100 text-gray-400 text-right select-none font-mono text-sm py-2 px-2 overflow-hidden"
                style={{ minWidth: '3rem' }}
              >
                {Array.from({ length: lineCount }, (_, i) => (
                  <div
                    key={i + 1}
                    className={`leading-5 ${errorLine === i + 1 ? 'text-red-500 font-bold' : ''}`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
              
              {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onScroll={handleScroll}
                className="flex-1 px-3 py-2 font-mono text-sm bg-white text-gray-900 resize-none focus:outline-none leading-5 overflow-auto"
                placeholder='{"key": "value"}'
            spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
              />

              {/* Status indicator */}
              <div className="absolute top-2 right-2 flex items-center gap-2">
                {isValid ? (
                  <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t.dataPanel.validJson}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {t.dataPanel.invalidJson}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Keyboard shortcuts help */}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs theme-text-muted flex-shrink-0">
            <span><kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">Tab</kbd> {t.dataPanel.indent}</span>
            <span><kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">Shift+Tab</kbd> {t.dataPanel.removeIndent}</span>
            <span><kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">Enter</kbd> {t.dataPanel.autoIndent}</span>
            <span><kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">Ctrl+F</kbd> {t.common.search}</span>
          </div>

          {error && (
            <div className="mt-2 text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20 flex-shrink-0">
              {error}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t theme-border flex justify-end space-x-2">
          <Button
            onClick={onClose}
            variant="secondary"
          >
            {t.common.cancel}
          </Button>
          <Button
            onClick={handleApply}
            variant="primary"
          >
            {t.common.apply}
          </Button>
        </div>
      </div>
    </div>
  )
}
