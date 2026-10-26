import { useRef, type KeyboardEvent } from 'react'
import { useTranslation } from '../i18n'
import { Button } from './atoms'
import { useEditorSearch } from './data-panel/hooks/useEditorSearch'
import { useJsonEditor } from './data-panel/hooks/useJsonEditor'
import { DataPanelToolbar } from './data-panel/components/DataPanelToolbar'
import { EditorSearchBar } from './data-panel/components/EditorSearchBar'
import { EditorTextarea } from './data-panel/components/EditorTextarea'
import type { DataPanelProps } from './data-panel/types'

export type { DataPanelProps }

export default function DataPanel({ onClose }: DataPanelProps) {
  const { t } = useTranslation()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const {
    jsonInput,
    setJsonInput,
    error,
    isValid,
    errorLine,
    lineCount,
    handleScroll,
    handleEditorKeyDown,
    handleApply,
    handleFormat,
    handleMinify,
    handleLoadFromFile,
    handleGenerateFromSchema,
    hasSchema,
  } = useJsonEditor({
    textareaRef,
    lineNumbersRef,
    onClose,
  })

  const {
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
  } = useEditorSearch({
    jsonInput,
    textareaRef,
    lineNumbersRef,
    searchInputRef,
  })

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault()
      openSearch()
      return
    }

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

    handleEditorKeyDown(e)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="theme-surface border theme-border rounded-xl shadow-xl w-2/3 max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b theme-border flex items-center justify-between">
          <h2 className="text-lg font-semibold theme-text">{t.dataPanel.title}</h2>
          <button
            onClick={onClose}
            className="theme-text-muted hover:theme-text text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="overflow-auto p-6 flex flex-col">
          <p className="text-sm theme-text-secondary mb-4 flex-shrink-0">
            {t.dataPanel.description}
          </p>

          <DataPanelToolbar
            onLoadFromFile={handleLoadFromFile}
            onGenerateFromSchema={handleGenerateFromSchema}
            onFormat={handleFormat}
            onMinify={handleMinify}
            isValid={isValid}
            hasSchema={hasSchema}
          />

          <EditorTextarea
            lineNumbersRef={lineNumbersRef}
            textareaRef={textareaRef}
            jsonInput={jsonInput}
            onJsonInputChange={setJsonInput}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            lineCount={lineCount}
            errorLine={errorLine}
            isValid={isValid}
            error={error}
          >
            {showSearch && (
              <EditorSearchBar
                searchInputRef={searchInputRef}
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
                searchMatches={searchMatches}
                currentMatchIndex={currentMatchIndex}
                caseSensitive={caseSensitive}
                onToggleCaseSensitive={() => setCaseSensitive(!caseSensitive)}
                onPrevMatch={goToPrevMatch}
                onNextMatch={goToNextMatch}
                onCloseSearch={closeSearch}
              />
            )}
          </EditorTextarea>
        </div>

        {/* Footer */}
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
