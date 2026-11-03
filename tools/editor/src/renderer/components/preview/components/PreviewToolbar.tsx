import React from 'react'
import {
  ArrowPathIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ViewColumnsIcon,
} from '@heroicons/react/24/outline'
import { useTranslation } from '../../../i18n'
import type { PreviewToolbarProps } from '../types'

export const PreviewToolbar: React.FC<PreviewToolbarProps> = ({
  title,
  lastGeneratedAt,
  numPages,
  currentPage,
  isLoading,
  previewMode = 'split',
  onPrevPage,
  onNextPage,
  onToggleSplit,
  onRefresh,
  onClose,
}) => {
  const { t } = useTranslation()
  const displayTitle = title || t.preview.title

  return (
    <div className="flex items-center justify-between px-3 py-2 border-b theme-border theme-bg select-none gap-2">
      {/* Left: Title & Timestamp */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm font-medium theme-text truncate">{displayTitle}</span>
        {lastGeneratedAt && (
          <span className="text-xs theme-text-muted hidden sm:inline" title="Última geração">
            {lastGeneratedAt.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Center: Pagination */}
      {numPages > 0 && (
        <div className="flex items-center gap-1 bg-slate-800/40 px-2 py-0.5 rounded border border-slate-700/50">
          <button
            onClick={onPrevPage}
            disabled={currentPage <= 1}
            className="p-1 rounded theme-hover disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="Página anterior"
            aria-label="Página anterior"
          >
            <ChevronLeftIcon className="w-3.5 h-3.5 theme-text" />
          </button>

          <span className="text-xs font-mono theme-text min-w-[54px] text-center">
            {currentPage} / {numPages}
          </span>

          <button
            onClick={onNextPage}
            disabled={currentPage >= numPages}
            className="p-1 rounded theme-hover disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="Próxima página"
            aria-label="Próxima página"
          >
            <ChevronRightIcon className="w-3.5 h-3.5 theme-text" />
          </button>
        </div>
      )}

      {/* Right: Split, Refresh, Close */}
      <div className="flex items-center gap-1.5">
        {/* Split mode button */}
        {onToggleSplit && (
          <button
            onClick={onToggleSplit}
            className={`p-1.5 rounded transition ${
              previewMode === 'split'
                ? 'bg-indigo-600/30 text-indigo-400 hover:bg-indigo-600/40'
                : 'text-slate-400 hover:text-white theme-hover'
            }`}
            title="Modo Split"
            aria-label="Modo Split"
          >
            <ViewColumnsIcon className="w-4 h-4" />
          </button>
        )}

        {/* Refresh / Reload button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-1.5 rounded theme-hover text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
          title={t.preview.refresh || 'Atualizar Preview'}
          aria-label={t.preview.refresh || 'Atualizar Preview'}
        >
          <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>

        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded theme-hover theme-text-muted hover:theme-text transition"
            title="Fechar Preview"
            aria-label="Fechar Preview"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
