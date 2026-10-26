import type { RefObject } from 'react'

interface SchemaSearchBarProps {
  searchInputRef: RefObject<HTMLInputElement | null>
  searchTerm: string
  onSearchTermChange: (value: string) => void
  searchMatches: number[]
  currentMatchIndex: number
  caseSensitive: boolean
  onToggleCaseSensitive: () => void
  onPrevMatch: () => void
  onNextMatch: () => void
  onClose: () => void
}

export function SchemaSearchBar({
  searchInputRef,
  searchTerm,
  onSearchTermChange,
  searchMatches,
  currentMatchIndex,
  caseSensitive,
  onToggleCaseSensitive,
  onPrevMatch,
  onNextMatch,
  onClose,
}: SchemaSearchBarProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg shrink-0">
      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        ref={searchInputRef}
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onClose()
          } else if (e.key === 'Enter') {
            e.preventDefault()
            if (e.shiftKey) onPrevMatch()
            else onNextMatch()
          }
        }}
        className="flex-1 px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-indigo-500"
        placeholder="Buscar no schema..."
      />
      <span className="text-xs text-slate-400 min-w-[50px] text-center">
        {searchTerm ? (searchMatches.length > 0 ? `${currentMatchIndex + 1}/${searchMatches.length}` : '0') : ''}
      </span>
      <button
        onClick={onPrevMatch}
        disabled={searchMatches.length === 0}
        className="p-1 hover:bg-slate-800 rounded text-slate-300 disabled:opacity-30"
        title="Anterior (Shift+Enter)"
      >
        ▲
      </button>
      <button
        onClick={onNextMatch}
        disabled={searchMatches.length === 0}
        className="p-1 hover:bg-slate-800 rounded text-slate-300 disabled:opacity-30"
        title="Próxima (Enter)"
      >
        ▼
      </button>
      <button
        onClick={onToggleCaseSensitive}
        className={`px-1.5 py-0.5 text-xs rounded border ${
          caseSensitive
            ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
            : 'border-slate-700 text-slate-400 hover:text-white'
        }`}
      >
        Aa
      </button>
      <button
        onClick={onClose}
        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
      >
        ✕
      </button>
    </div>
  )
}
