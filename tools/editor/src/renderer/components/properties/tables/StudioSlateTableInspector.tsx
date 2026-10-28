import { useState } from 'react'
import { useTranslation } from '../../../i18n'
import type { ElementInspectorProps } from '../types'
import { TableGeneralTab } from './TableGeneralTab'
import { TableColumnsTab } from './TableColumnsTab'
import { TableStylesTab } from './TableStylesTab'

export function StudioSlateTableInspector({ element, onUpdate, onStyleUpdate, parentName }: ElementInspectorProps) {
  const { t } = useTranslation()
  const [tableTab, setTableTab] = useState<'general' | 'columns' | 'styles'>('general')

  return (
    <div className="w-[300px] bg-slate-900 border-l border-slate-800 flex flex-col h-full shrink-0 select-none text-slate-200">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/40 shrink-0 px-3.5 pt-2.5 pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="relative min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-200 tracking-wide block">
              {t.properties.title}
            </span>
            <span className="text-[10px] text-slate-400 font-mono truncate block" title={element.id}>
              #{element.id}
            </span>
            <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/50 uppercase shrink-0">
            {parentName ? `${parentName} / table` : 'table'}
          </span>
        </div>
      </div>

      {/* Sub-tabs: Geral | Colunas | Estilos */}
      <div className="flex border-b border-slate-800 bg-slate-950/60 p-1 gap-1 shrink-0">
        <button
          type="button"
          onClick={() => setTableTab('general')}
          className={`flex-1 py-1.5 text-xs font-medium rounded transition ${
            tableTab === 'general'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          {t.properties.generalTab}
        </button>
        <button
          type="button"
          onClick={() => setTableTab('columns')}
          className={`flex-1 py-1.5 text-xs font-medium rounded transition ${
            tableTab === 'columns'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          {t.properties.columnsTab}
        </button>
        <button
          type="button"
          onClick={() => setTableTab('styles')}
          className={`flex-1 py-1.5 text-xs font-medium rounded transition ${
            tableTab === 'styles'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          {t.properties.stylesTab}
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {tableTab === 'general' && (
          <TableGeneralTab element={element} onUpdate={onUpdate} />
        )}

        {tableTab === 'columns' && (
          <TableColumnsTab element={element} onUpdate={onUpdate} />
        )}

        {tableTab === 'styles' && (
          <TableStylesTab element={element} onStyleUpdate={onStyleUpdate} />
        )}
      </div>
    </div>
  )
}
