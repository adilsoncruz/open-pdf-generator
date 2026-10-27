import { type RefObject } from 'react'
import { useTranslation } from '../../../i18n'

interface EditorSearchBarProps {
  searchInputRef: RefObject<HTMLInputElement | null>
  searchTerm: string
  onSearchTermChange: (value: string) => void
  searchMatches: number[]
  currentMatchIndex: number
  caseSensitive: boolean
  onToggleCaseSensitive: () => void
  onPrevMatch: (keepFocus?: boolean) => void
  onNextMatch: (keepFocus?: boolean) => void
  onCloseSearch: () => void
}

export function EditorSearchBar({
  searchInputRef,
  searchTerm,
  onSearchTermChange,
  searchMatches,
  currentMatchIndex,
  caseSensitive,
  onToggleCaseSensitive,
  onPrevMatch,
  onNextMatch,
  onCloseSearch,
}: EditorSearchBarProps) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200 flex-shrink-0">
      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        ref={searchInputRef}
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onCloseSearch()
          } else if (e.key === 'Enter') {
            e.preventDefault()
            if (e.shiftKey) {
              onPrevMatch(true)
            } else {
              onNextMatch(true)
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
        onClick={() => onPrevMatch(false)}
        disabled={searchMatches.length === 0}
        className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
        title={t.dataPanel.previous}
      >
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <button
        onClick={() => onNextMatch(false)}
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
        onClick={onToggleCaseSensitive}
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
        onClick={onCloseSearch}
        className="p-1 hover:bg-gray-200 rounded"
        title={`${t.common.close} (Esc)`}
      >
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
