import { type ReactNode, type RefObject, type KeyboardEvent } from 'react'
import { useTranslation } from '../../../i18n'

interface EditorTextareaProps {
  children?: ReactNode
  lineNumbersRef: RefObject<HTMLDivElement | null>
  textareaRef: RefObject<HTMLTextAreaElement | null>
  jsonInput: string
  onJsonInputChange: (value: string) => void
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void
  onScroll: () => void
  lineCount: number
  errorLine: number | null
  isValid: boolean
  error: string | null
}

export function EditorTextarea({
  children,
  lineNumbersRef,
  textareaRef,
  jsonInput,
  onJsonInputChange,
  onKeyDown,
  onScroll,
  lineCount,
  errorLine,
  isValid,
  error,
}: EditorTextareaProps) {
  const { t } = useTranslation()

  return (
    <>
      <div
        className={`relative flex flex-col rounded-lg border-2 overflow-hidden transition-colors ${
          isValid
            ? 'border-gray-200 focus-within:border-primary-500'
            : 'border-red-400 bg-red-50/30'
        }`}
        style={{ height: '400px' }}
      >
        {children}

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
            onChange={(e) => onJsonInputChange(e.target.value)}
            onKeyDown={onKeyDown}
            onScroll={onScroll}
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
    </>
  )
}
