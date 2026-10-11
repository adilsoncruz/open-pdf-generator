import React from 'react'
import { useTemplateStore } from '../store/templateStore'
import { useUIStore } from '../store/uiStore'

export function StatusBar() {
  const { 
    template,
    undo,
    redo,
    history,
    historyIndex
  } = useTemplateStore()
  const { zoom, setZoom, snapToGuides, toggleSnapToGuides } = useUIStore()

  const canUndoActive = historyIndex > 0
  const canRedoActive = historyIndex < (history?.length || 0) - 1

  const pageSize = template.pageSettings?.size || 'A4'
  const elementsCount = (template.page?.length || 0) +
    (template.pageSettings.header?.elements?.length || 0) +
    (template.pageSettings.footer?.elements?.length || 0) +
    (template.summaryPage?.elements?.length || 0)

  return (
    <footer className="h-9 bg-slate-950 border-t border-slate-800 px-4 text-xs text-slate-400 flex items-center justify-between select-none shrink-0 z-30">
      {/* Esquerda: Documento e elementos */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-medium text-slate-300">
          <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>
          <span>Página 1 de 1</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 font-normal">{pageSize}</span>
        </div>

        <div className="text-slate-500 text-[11px]">
          {elementsCount} {elementsCount === 1 ? 'elemento' : 'elementos'}
        </div>
      </div>

      {/* Centro: Pílula flutuante de Desfazer, Refazer, Zoom e Snap */}
      <div className="flex items-center space-x-1 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800 shadow-sm">
        {/* Desfazer */}
        <button
          onClick={undo}
          disabled={!canUndoActive}
          className="p-1 rounded hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed"
          title="Desfazer (Ctrl+Z / Cmd+Z)"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>

        {/* Refazer */}
        <button
          onClick={redo}
          disabled={!canRedoActive}
          className="p-1 rounded hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed"
          title="Refazer (Ctrl+Y / Cmd+Shift+Z)"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a5 5 0 00-5 5v2m15-7l-6-6m6 6l-6 6" />
          </svg>
        </button>

        <div className="w-px h-3.5 bg-slate-800 mx-1" />

        {/* Zoom - */}
        <button
          onClick={() => setZoom(Math.max(25, zoom - 10))}
          className="px-1.5 py-0.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded transition font-medium"
          title="Diminuir Zoom"
        >
          -
        </button>

        {/* Zoom Display */}
        <span className="text-[11px] font-mono font-medium text-slate-200 min-w-[36px] text-center">
          {zoom}%
        </span>

        {/* Zoom + */}
        <button
          onClick={() => setZoom(Math.min(300, zoom + 10))}
          className="px-1.5 py-0.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded transition font-medium"
          title="Aumentar Zoom"
        >
          +
        </button>

        {/* Reset 100% */}
        <button
          onClick={() => setZoom(100)}
          className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
          title="Resetar 100%"
        >
          100%
        </button>

        <div className="w-px h-3.5 bg-slate-800 mx-1" />

        {/* Magnet / Snap */}
        <button
          onClick={toggleSnapToGuides}
          className={`p-1 rounded transition ${
            snapToGuides
              ? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title={snapToGuides ? 'Magnetismo em Guias: Ativo' : 'Magnetismo em Guias: Inativo'}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </button>
      </div>

      {/* Direita: Status da Engine CLI */}
      <div className="flex items-center gap-3 text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          <span className="text-slate-300 font-medium">CLI Conectado</span>
          <span className="text-slate-600">v1.0.0</span>
        </div>
      </div>
    </footer>
  )
}
