import React from 'react'
import { useTemplateStore } from '../store/templateStore'
import { useUIStore } from '../store/uiStore'

export function StatusBar() {
  const { template } = useTemplateStore()
  const { zoom, snapToGuides } = useUIStore()

  const pageSize = template.pageSettings?.size || 'A4'
  const elementsCount = (template.page?.length || 0) +
    (template.pageSettings.header?.elements?.length || 0) +
    (template.pageSettings.footer?.elements?.length || 0) +
    (template.summaryPage?.elements?.length || 0)

  return (
    <footer className="h-7 bg-slate-950 border-t border-slate-800 px-4 text-xs text-slate-400 flex items-center justify-between select-none shrink-0 z-30">
      {/* Esquerda: Documento e elementos */}
      <div className="flex items-center gap-4">
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

      {/* Centro: Zoom e Guias */}
      <div className="flex items-center gap-4 text-[11px]">
        <div className="flex items-center gap-1">
          <span className="text-slate-500">Zoom:</span>
          <span className="font-mono text-slate-300 font-semibold">{zoom}%</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-slate-500">Snap:</span>
          <span className={snapToGuides ? "text-emerald-400 font-medium" : "text-slate-600"}>
            {snapToGuides ? 'Ligado' : 'Desligado'}
          </span>
        </div>
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
