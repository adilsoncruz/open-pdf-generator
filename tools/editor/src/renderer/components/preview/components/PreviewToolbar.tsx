import React from 'react'
import {
  ArrowPathIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
  ViewColumnsIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
} from '@heroicons/react/24/outline'
import { useTranslation } from '../../../i18n'
import type { PreviewToolbarProps } from '../types'

export const PreviewToolbar: React.FC<PreviewToolbarProps> = ({
  title,
  lastGeneratedAt,
  numPages,
  currentPage,
  scale,
  isLoading,
  hasPdfData,
  previewMode = 'split',
  onPrevPage,
  onNextPage,
  onZoomIn,
  onZoomOut,
  onFitWidth,
  onFitPage,
  onScaleChange,
  onToggleSplit,
  onDownload,
  onRefresh,
  onClose,
}) => {
  const { t } = useTranslation()
  const displayTitle = title || t.preview.title
  const currentPercent = Math.round(scale * 100)
  const baseOptions = [40, 60, 80, 100, 120, 150, 200]
  const zoomOptions = Array.from(new Set([...baseOptions, currentPercent])).sort((a, b) => a - b)

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

      {/* Right: Zoom, Fit, Split, Download, Refresh, Close */}
      <div className="flex items-center gap-1.5">
        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-slate-950/60 border border-slate-800 rounded px-1.5 py-0.5">
          <button
            onClick={onZoomOut}
            disabled={scale <= 0.4}
            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
            title={t.preview.zoomOut || 'Diminuir Zoom'}
            aria-label="Diminuir Zoom"
          >
            <MagnifyingGlassMinusIcon className="w-3.5 h-3.5" />
          </button>

          <select
            value={currentPercent.toString()}
            onChange={(e) => onScaleChange(Number(e.target.value) / 100)}
            className="bg-transparent border-none text-[11px] font-mono font-medium text-slate-200 py-0 px-1 cursor-pointer appearance-none focus:outline-none"
            title="Nível de zoom"
          >
            {zoomOptions.map((opt) => (
              <option key={opt} value={opt.toString()} className="bg-slate-900 text-slate-200">
                {opt}%
              </option>
            ))}
          </select>

          <button
            onClick={onZoomIn}
            disabled={scale >= 2.0}
            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
            title={t.preview.zoomIn || 'Aumentar Zoom'}
            aria-label="Aumentar Zoom"
          >
            <MagnifyingGlassPlusIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Fit Width & Fit Page buttons */}
        <div className="flex items-center gap-0.5 border border-slate-800 rounded bg-slate-950/40 p-0.5 text-[11px]">
          <button
            onClick={onFitWidth}
            className="px-1.5 py-0.5 font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded transition"
            title="Ajustar à largura"
          >
            Fit
          </button>
          <button
            onClick={onFitPage}
            className="px-1.5 py-0.5 font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded transition"
            title="Ajustar à página inteira"
          >
            Page
          </button>
        </div>

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

        {/* Download PDF button */}
        <button
          onClick={onDownload}
          disabled={!hasPdfData || isLoading}
          className="p-1.5 rounded theme-hover text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
          title="Baixar PDF"
          aria-label="Baixar PDF"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
        </button>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-1.5 rounded theme-hover theme-text-muted hover:theme-text disabled:opacity-30 transition"
          title={t.preview.refresh || 'Atualizar Preview'}
          aria-label="Atualizar Preview"
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
