import { useState, useRef, type KeyboardEvent } from 'react'
import { useTemplateStore } from '../store/templateStore'
import { Button } from './atoms'
import { useSchemaValidator } from './schema-panel/hooks/useSchemaValidator'
import { useSchemaSearch } from './schema-panel/hooks/useSchemaSearch'
import { useSchemaActions } from './schema-panel/hooks/useSchemaActions'
import { SchemaPanelHeader } from './schema-panel/components/SchemaPanelHeader'
import { SchemaPanelToolbar } from './schema-panel/components/SchemaPanelToolbar'
import { SchemaStatusBadges } from './schema-panel/components/SchemaStatusBadges'
import { SchemaSearchBar } from './schema-panel/components/SchemaSearchBar'
import { SchemaEditorTextarea } from './schema-panel/components/SchemaEditorTextarea'
import type { SchemaPanelProps } from './schema-panel/types'

export type { SchemaPanelProps }

export default function SchemaPanel({ onClose }: SchemaPanelProps) {
  const { template, testData } = useTemplateStore()

  const [jsonInput, setJsonInput] = useState(() =>
    template.schema ? JSON.stringify(template.schema, null, 2) : ''
  )

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const {
    jsonError,
    isJsonValid,
    errorLine,
    schemaError,
    setSchemaError,
    dataErrors,
  } = useSchemaValidator(jsonInput, testData)

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
  } = useSchemaSearch({
    jsonInput,
    textareaRef,
    lineNumbersRef,
    searchInputRef,
  })

  const {
    isSaved,
    dataGeneratedNotice,
    handleScroll,
    handleSave,
    handleClear,
    handleFormat,
    handleInferFromData,
    handleGenerateTestData,
    handleLoadSample,
    handleTabIndent,
  } = useSchemaActions({
    textareaRef,
    lineNumbersRef,
    jsonInput,
    setJsonInput,
    setSchemaError,
  })

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault()
      openSearch()
      return
    }
    handleTabIndent(e)
  }

  const lineCount = Math.max(jsonInput.split('\n').length, 18)
  const isSchemaEmpty = !jsonInput.trim()

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col text-slate-200 overflow-hidden"
        onKeyDown={(e) => {
          if (e.key === 'Escape' && !showSearch) {
            onClose()
          }
        }}
      >
        <SchemaPanelHeader
          hasActiveSchema={!!template.schema}
          onClose={onClose}
        />

        <SchemaPanelToolbar
          onFormat={handleFormat}
          onInferFromData={handleInferFromData}
          onGenerateTestData={handleGenerateTestData}
          onLoadSample={handleLoadSample}
          onOpenSearch={openSearch}
          onClear={handleClear}
          onSave={handleSave}
          isJsonValid={isJsonValid}
          isSchemaEmpty={isSchemaEmpty}
          hasSchemaError={!!schemaError}
          hasActiveSchema={!!template.schema}
          isSaved={isSaved}
          dataGeneratedNotice={dataGeneratedNotice}
        />

        <div className="p-6 flex-1 flex flex-col min-h-0 overflow-hidden gap-4">
          <SchemaStatusBadges
            isSchemaEmpty={isSchemaEmpty}
            isJsonValid={isJsonValid}
            schemaError={schemaError}
            dataErrors={dataErrors}
          />

          {showSearch && (
            <SchemaSearchBar
              searchInputRef={searchInputRef}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              searchMatches={searchMatches}
              currentMatchIndex={currentMatchIndex}
              caseSensitive={caseSensitive}
              onToggleCaseSensitive={() => setCaseSensitive(!caseSensitive)}
              onPrevMatch={goToPrevMatch}
              onNextMatch={goToNextMatch}
              onClose={closeSearch}
            />
          )}

          <SchemaEditorTextarea
            lineNumbersRef={lineNumbersRef}
            textareaRef={textareaRef}
            jsonInput={jsonInput}
            onJsonInputChange={setJsonInput}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            lineCount={lineCount}
            errorLine={errorLine}
            isJsonValid={isJsonValid}
            jsonError={jsonError}
            schemaError={schemaError}
            dataErrors={dataErrors}
          />
        </div>

        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between text-xs text-slate-400">
          <div>
            Dica: Ao gerar PDF ou Preview, os dados serão validados contra este schema.
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  )
}
