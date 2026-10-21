import { useState, useEffect, useRef } from 'react'
import { useTemplateStore, type Element, type ElementGroup, type ElementLocation, flattenElements } from '../store/templateStore'
import { Icon, Input, Select, Checkbox, Divider, ColorInput, Button, TextArea } from './atoms'
import type { IconName } from './atoms/Icon/Icon.types'
import { NumberField, ColorField, PropertyGroup, PropertyRow, TabBar, IconButton } from './molecules'
import { useTranslation } from '../i18n'

/**
 * Reusable panel header component with pin button
 */
function PanelHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="p-3 border-b theme-border flex items-center justify-between shrink-0">
      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-semibold theme-text truncate">{title}</h2>
        {subtitle && (
          <p className="text-xs theme-text-muted mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

interface ElementInspectorProps {
  element: Element
  onUpdate: (field: string | Record<string, any>, value?: any) => void
  onStyleUpdate: (field: string | Record<string, any>, value?: any) => void
  parentName?: string
  isMultiSelection?: boolean
  selectedCount?: number
}

function StudioSlateTableInspector({ element, onUpdate, onStyleUpdate, parentName }: ElementInspectorProps) {
  const { t } = useTranslation()
  const [tableTab, setTableTab] = useState<'general' | 'columns' | 'styles'>('general')
  const [localId, setLocalId] = useState(element.id || '')

  useEffect(() => {
    setLocalId(element.id || '')
  }, [element.id])

  const handleIdCommit = () => {
    const trimmed = localId.trim()
    if (trimmed && trimmed !== element.id) {
      onUpdate('id', trimmed)
    } else {
      setLocalId(element.id || '')
    }
  }

  const columns = Array.isArray(element.columns) ? element.columns : []

  const updateColumn = (index: number, field: string, value: unknown) => {
    const newColumns = JSON.parse(JSON.stringify(columns))
    if (!newColumns[index]) return
    newColumns[index][field] = value
    onUpdate('columns', newColumns)
  }

  const addColumn = () => {
    const newColumns = JSON.parse(JSON.stringify(columns))
    const nextIdx = newColumns.length + 1
    newColumns.push({
      header: `Coluna ${nextIdx}`,
      field: `campo_${nextIdx}`,
      width: 100,
      alignment: 'left',
      headerAlignment: 'left',
    })
    onUpdate('columns', newColumns)
  }

  const removeColumn = (index: number) => {
    const newColumns = JSON.parse(JSON.stringify(columns))
    newColumns.splice(index, 1)
    onUpdate('columns', newColumns)
  }

  const moveColumn = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= columns.length) return
    const newColumns = JSON.parse(JSON.stringify(columns))
    const item = newColumns.splice(fromIndex, 1)[0]
    newColumns.splice(toIndex, 0, item)
    onUpdate('columns', newColumns)
  }

  const tableStyle = element.style || {}
  const headerBg = (tableStyle.headerBackground as string) || '#f0f0f0'
  const isHeaderBgTransparent = !tableStyle.headerBackground || tableStyle.headerBackground === 'transparent'
  const headerColor = (tableStyle.headerColor as string) || '#000000'
  const headerFontSize = (tableStyle.headerFontSize as number) || 12
  const headerFontFamily = (tableStyle.headerFontFamily as string) || 'Helvetica'
  const headerPadding = (tableStyle.headerPadding as number) ?? 5

  const cellColor = (tableStyle.cellColor as string) || '#000000'
  const cellBg = (tableStyle.cellBackground as string) || '#ffffff'
  const isCellBgTransparent = !tableStyle.cellBackground || tableStyle.cellBackground === 'transparent'
  const cellFontSize = (tableStyle.fontSize as number) || 10
  const cellFontFamily = (tableStyle.fontFamily as string) || 'Helvetica'
  const cellPadding = (tableStyle.cellPadding as number) ?? 5
  const alternateRowBg = (tableStyle.alternateRowBackground as string) || '#f8fafc'
  const hasAlternateRowBg = Boolean(tableStyle.alternateRowBackground && tableStyle.alternateRowBackground !== 'transparent')
  const borderWidth = (tableStyle.borderWidth as number) ?? 1
  const borderColor = (tableStyle.borderColor as string) || '#cccccc'
  const borderStyle = (tableStyle.borderStyle as string) || 'solid'

  const activePreset: 'all' | 'row' | 'columns' | 'none' = (() => {
    if (borderWidth === 0 || tableStyle.cellBorderType === 'none') {
      return 'none'
    }
    if (tableStyle.cellBorderType === 'row') {
      return 'row'
    }
    if (tableStyle.cellBorderType === 'columns') {
      return 'columns'
    }
    return 'all'
  })()
  const borderType = activePreset

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
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          {t.properties.generalTab}
        </button>
        <button
          type="button"
          onClick={() => setTableTab('columns')}
          className={`flex-1 py-1.5 text-xs font-medium rounded transition flex items-center justify-center gap-1.5 ${
            tableTab === 'columns'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <span>{t.properties.columnsTab}</span>
          <span className="text-[10px] px-1 py-0.5 rounded bg-slate-800 font-mono text-slate-300">
            {columns.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setTableTab('styles')}
          className={`flex-1 py-1.5 text-xs font-medium rounded transition ${
            tableTab === 'styles'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          {t.properties.stylesTab}
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {/* TAB 1: GERAL */}
        {tableTab === 'general' && (
          <>
            {/* Identification / ID */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-300">ID da Tabela</span>
                <span className="text-[10px] text-slate-500 font-mono">identificador</span>
              </div>
              <div className="flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500 transition">
                <span className="text-slate-500 font-mono text-xs mr-2 select-none">#</span>
                <input
                  type="text"
                  value={localId}
                  onChange={(e) => setLocalId(e.target.value)}
                  onBlur={handleIdCommit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleIdCommit()
                      ;(e.target as HTMLInputElement).blur()
                    }
                  }}
                  className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none"
                  placeholder="id_da_tabela"
                />
              </div>
            </div>

            {/* Transform */}
            <div>
              <div className="text-xs font-semibold text-slate-200 mb-2">{t.properties.transform}</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* X */}
                <div className="flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500 transition">
                  <span className="text-slate-500 font-mono text-xs w-4">X</span>
                  <input
                    type="number"
                    value={element.x ?? 0}
                    onChange={(e) => onUpdate('x', parseFloat(e.target.value) || 0)}
                    disabled={element.width === '100%'}
                    className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right pr-1 disabled:opacity-50"
                  />
                  <span className="text-slate-500 text-[10px]">pt</span>
                </div>

                {/* Y */}
                <div className="flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500 transition">
                  <span className="text-slate-500 font-mono text-xs w-4">Y</span>
                  <input
                    type="number"
                    value={element.y ?? 0}
                    onChange={(e) => onUpdate('y', parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right pr-1"
                  />
                  <span className="text-slate-500 text-[10px]">pt</span>
                </div>

                {/* W */}
                <div className="flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500 transition">
                  <span className="text-slate-500 font-mono text-xs w-4">W</span>
                  {element.width === '100%' ? (
                    <span className="w-full text-indigo-400 font-mono text-xs text-right pr-1 font-semibold">100%</span>
                  ) : (
                    <input
                      type="number"
                      value={typeof element.width === 'number' ? element.width : 400}
                      onChange={(e) => onUpdate('width', parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right pr-1"
                    />
                  )}
                  <span className="text-slate-500 text-[10px]">pt</span>
                </div>

                {/* H */}
                <div className="flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500 transition">
                  <span className="text-slate-500 font-mono text-xs w-4">H</span>
                  <input
                    type="number"
                    value={typeof element.height === 'number' ? element.height : 100}
                    onChange={(e) => onUpdate('height', parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right pr-1"
                  />
                  <span className="text-slate-500 text-[10px]">pt</span>
                </div>
              </div>

              {/* Botão Largura 100% */}
              <div className="mt-2 flex items-center justify-between bg-slate-950/50 border border-slate-800 rounded-lg px-2.5 py-1.5">
                <span className="text-xs text-slate-300">{t.properties.width100}</span>
                <input
                  type="checkbox"
                  checked={element.width === '100%'}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onUpdate({ width: '100%', x: 0 })
                    } else {
                      onUpdate({ width: 400 })
                    }
                  }}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900 cursor-pointer"
                />
              </div>

              {/* Position Mode (Absolute / Relative) */}
              <div className="mt-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">{t.properties.position}</span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {(((element.positionMode || element.position || 'ABSOLUTE') as string).toUpperCase()) === 'RELATIVE' ? t.properties.relativeFlow : t.properties.absoluteFixed}
                  </span>
                </div>
                <div className="grid grid-cols-2 bg-slate-950 border border-slate-800 rounded-lg p-0.5 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdate({ positionMode: 'ABSOLUTE', position: 'absolute' })
                    }}
                    className={`py-1 text-xs font-medium rounded transition text-center ${
                      (((element.positionMode || element.position || 'ABSOLUTE') as string).toUpperCase()) !== 'RELATIVE'
                        ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    {t.properties.absolute}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdate({
                        positionMode: 'RELATIVE',
                        position: 'relative',
                        relativeOffsetY: element.height === '100%' ? 0 : (typeof element.relativeOffsetY === 'number' ? element.relativeOffsetY : 0),
                      })
                    }}
                    className={`py-1 text-xs font-medium rounded transition text-center ${
                      (((element.positionMode || element.position || 'ABSOLUTE') as string).toUpperCase()) === 'RELATIVE'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    {t.properties.relative}
                  </button>
                </div>

                {(((element.positionMode || element.position || 'ABSOLUTE') as string).toUpperCase()) === 'RELATIVE' && (
                  <div className={`flex items-center justify-between bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500 mt-1.5 ${element.height === '100%' ? 'opacity-50' : ''}`}>
                    <span className="text-slate-400 text-xs">{t.properties.offsetY}</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={element.height === '100%' ? 0 : ((element.relativeOffsetY as number) ?? 0)}
                        disabled={element.height === '100%'}
                        onChange={(e) => onUpdate('relativeOffsetY', parseFloat(e.target.value) || 0)}
                        className="w-16 bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right pr-1 disabled:cursor-not-allowed"
                      />
                      <span className="text-slate-500 text-[10px]">pt</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Data Binding */}
            <div>
              <div className="text-xs font-semibold text-slate-200 mb-2">{t.properties.dataBindingList}</div>
              <div className="space-y-2">
                <div>
                  <div className="relative flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2 focus-within:border-indigo-500 transition">
                    <input
                      type="text"
                      value={element.dataBinding || ''}
                      onChange={(e) => onUpdate('dataBinding', e.target.value)}
                      placeholder="Ex: items ou invoice.products"
                      className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none pr-6"
                    />
                    <div className="absolute right-3 flex items-center">
                      <span className={`w-2 h-2 rounded-full ${
                        element.dataBinding ? 'bg-emerald-400 shadow-sm shadow-emerald-500/50' : 'bg-slate-600'
                      }`} />
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {t.properties.dataBindingListHelp}
                  </span>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">{t.properties.emptyMessage}</label>
                  <input
                    type="text"
                    value={(element.emptyMessage as string) || ''}
                    onChange={(e) => onUpdate('emptyMessage', e.target.value)}
                    placeholder={t.properties.emptyMessagePlaceholder}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Comportamento de Cabeçalho */}
            <div>
              <div className="text-xs font-semibold text-slate-200 mb-2">{t.properties.headerBehavior}</div>
              <div className="space-y-2">
                <label className="flex items-center justify-between bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 cursor-pointer hover:border-slate-700">
                  <span className="text-xs text-slate-300">{t.properties.showHeader}</span>
                  <input
                    type="checkbox"
                    checked={element.showHeader !== false}
                    onChange={(e) => onUpdate('showHeader', e.target.checked)}
                    className="rounded border-slate-700 text-indigo-600 bg-slate-900 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 cursor-pointer hover:border-slate-700">
                  <span className="text-xs text-slate-300">{t.properties.repeatHeader}</span>
                  <input
                    type="checkbox"
                    checked={element.headerRepeat !== false}
                    onChange={(e) => onUpdate('headerRepeat', e.target.checked)}
                    className="rounded border-slate-700 text-indigo-600 bg-slate-900 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Print Condition */}
            <div>
              <div className="text-xs font-semibold text-slate-200 mb-2">{t.properties.printCondition}</div>
              <div className="flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2 focus-within:border-indigo-500 transition">
                <input
                  type="text"
                  value={element.printCondition || ''}
                  onChange={(e) => onUpdate('printCondition', e.target.value || null)}
                  placeholder="Ex: items.length > 0"
                  className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                {t.properties.printConditionHelp}
              </span>
            </div>
          </>
        )}

        {/* TAB 2: COLUNAS */}
        {tableTab === 'columns' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-200">
                {t.properties.columnsTab} ({columns.length})
              </span>
              <button
                type="button"
                onClick={addColumn}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-2.5 py-1 rounded-md flex items-center gap-1 font-medium transition shadow-sm"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>{t.properties.newColumn}</span>
              </button>
            </div>

            {columns.length === 0 ? (
              <div className="text-center py-6 px-4 bg-slate-950/50 border border-slate-800/80 rounded-xl space-y-2">
                <p className="text-xs text-slate-400">{t.properties.noColumns}</p>
                <button
                  type="button"
                  onClick={addColumn}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 font-medium transition shadow"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  {t.properties.addFirstColumn}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {columns.map((col: Record<string, unknown>, index: number) => {
                  const headerTitle = String(col.header || '')
                  const fieldName = String(col.field || '')
                  const colWidth = (col.width as number) || 100
                  const headerAlign = (col.headerAlignment as string) || (col.alignment as string) || 'left'
                  const cellAlign = (col.alignment as string) || 'left'

                  return (
                    <div
                      key={`col-${index}`}
                      className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 space-y-2.5 transition hover:border-slate-700"
                    >
                      {/* Top Bar da Coluna */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                            #{index + 1}
                          </span>
                          <span className="text-xs font-semibold text-slate-200 truncate">
                            {headerTitle || fieldName || `Coluna ${index + 1}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            title={t.properties.moveUp}
                            disabled={index === 0}
                            onClick={() => moveColumn(index, index - 1)}
                            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 15l-6-6-6 6" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            title={t.properties.moveDown}
                            disabled={index === columns.length - 1}
                            onClick={() => moveColumn(index, index + 1)}
                            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M6 9l6 6 6-6" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            title={t.properties.deleteColumn}
                            onClick={() => removeColumn(index)}
                            className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-950/50 ml-0.5"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Header e Field */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">{t.properties.columnTitle}</label>
                          <input
                            type="text"
                            value={headerTitle}
                            onChange={(e) => updateColumn(index, 'header', e.target.value)}
                            placeholder="Ex: Produto"
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">{t.properties.columnFieldJson}</label>
                          <input
                            type="text"
                            value={fieldName}
                            onChange={(e) => updateColumn(index, 'field', e.target.value)}
                            placeholder="Ex: name"
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      {/* Largura */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px]">{t.properties.width}</span>
                        <div className="flex items-center bg-slate-900 border border-slate-800 rounded px-2 py-1 w-28 focus-within:border-indigo-500">
                          <input
                            type="number"
                            min={10}
                            value={colWidth}
                            onChange={(e) => updateColumn(index, 'width', parseFloat(e.target.value) || 50)}
                            className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right pr-1"
                          />
                          <span className="text-slate-500 text-[10px]">pt</span>
                        </div>
                      </div>

                      {/* Alinhamento Header */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 block">{t.properties.headerAlignment}</span>
                        <div className="grid grid-cols-3 gap-1 bg-slate-900 p-0.5 rounded border border-slate-800 text-[11px]">
                          {(['left', 'center', 'right'] as const).map((align) => (
                            <button
                              key={`ha-${align}`}
                              type="button"
                              onClick={() => updateColumn(index, 'headerAlignment', align)}
                              className={`py-1 rounded text-center transition capitalize ${
                                headerAlign === align
                                  ? 'bg-indigo-600 text-white font-medium shadow-sm'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {align === 'left' ? t.properties.alignLeftShort : align === 'center' ? t.properties.alignCenterShort : t.properties.alignRightShort}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Alinhamento Conteúdo */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 block">{t.properties.cellAlignment}</span>
                        <div className="grid grid-cols-3 gap-1 bg-slate-900 p-0.5 rounded border border-slate-800 text-[11px]">
                          {(['left', 'center', 'right'] as const).map((align) => (
                            <button
                              key={`ca-${align}`}
                              type="button"
                              onClick={() => updateColumn(index, 'alignment', align)}
                              className={`py-1 rounded text-center transition capitalize ${
                                cellAlign === align
                                  ? 'bg-indigo-600 text-white font-medium shadow-sm'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {align === 'left' ? t.properties.alignLeftShort : align === 'center' ? t.properties.alignCenterShort : t.properties.alignRightShort}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ESTILOS */}
        {tableTab === 'styles' && (
          <div className="space-y-4">
            {/* 1. Header Styling */}
            <div>
              <div className="text-xs font-semibold text-slate-200 mb-2">{t.properties.tableHeader}</div>
              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 space-y-2.5 text-xs">
                {/* Background */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t.properties.backgroundColor}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      disabled={isHeaderBgTransparent}
                      value={headerBg.startsWith('#') && headerBg.length === 7 ? headerBg : '#f0f0f0'}
                      onChange={(e) => onStyleUpdate('headerBackground', e.target.value)}
                      className="w-7 h-7 rounded border border-slate-700 bg-slate-950 cursor-pointer p-0.5 shrink-0 disabled:opacity-40"
                    />
                    <label className="flex items-center gap-1 text-[11px] text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isHeaderBgTransparent}
                        onChange={(e) => onStyleUpdate('headerBackground', e.target.checked ? 'transparent' : '#f0f0f0')}
                        className="rounded border-slate-700 text-indigo-600 bg-slate-900"
                      />
                      <span>{t.properties.transparent}</span>
                    </label>
                  </div>
                </div>

                {/* Text Color */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t.properties.textColor}</span>
                  <input
                    type="color"
                    value={headerColor.startsWith('#') && headerColor.length === 7 ? headerColor : '#000000'}
                    onChange={(e) => onStyleUpdate('headerColor', e.target.value)}
                    className="w-7 h-7 rounded border border-slate-700 bg-slate-950 cursor-pointer p-0.5 shrink-0"
                  />
                </div>

                {/* Font & Size */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400">{t.properties.fontAndSize}</span>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={headerFontFamily}
                      onChange={(e) => onStyleUpdate('headerFontFamily', e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer w-24"
                    >
                      <option value="Helvetica">Helvetica</option>
                      <option value="Helvetica-Bold">Helvetica Bold</option>
                      <option value="Times">Times New Roman</option>
                      <option value="Courier">Courier</option>
                    </select>
                    <input
                      type="number"
                      min={6}
                      max={36}
                      value={headerFontSize}
                      onChange={(e) => onStyleUpdate('headerFontSize', parseFloat(e.target.value) || 12)}
                      className="w-12 bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500 text-center"
                    />
                    <span className="text-slate-500 text-[10px]">pt</span>
                  </div>
                </div>

                {/* Padding */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t.properties.padding}</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={30}
                      value={headerPadding}
                      onChange={(e) => onStyleUpdate('headerPadding', parseFloat(e.target.value) || 0)}
                      className="w-16 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500 text-center"
                    />
                    <span className="text-slate-500 text-[10px]">pt</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Células e Linhas (Rows & Cells) */}
            <div>
              <div className="text-xs font-semibold text-slate-200 mb-2">{t.properties.cellsAndRows}</div>
              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 space-y-2.5 text-xs">
                {/* Background */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t.properties.backgroundColor}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      disabled={isCellBgTransparent}
                      value={cellBg.startsWith('#') && cellBg.length === 7 ? cellBg : '#ffffff'}
                      onChange={(e) => onStyleUpdate('cellBackground', e.target.value)}
                      className="w-7 h-7 rounded border border-slate-700 bg-slate-950 cursor-pointer p-0.5 shrink-0 disabled:opacity-40"
                    />
                    <label className="flex items-center gap-1 text-[11px] text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isCellBgTransparent}
                        onChange={(e) => onStyleUpdate('cellBackground', e.target.checked ? 'transparent' : '#ffffff')}
                        className="rounded border-slate-700 text-indigo-600 bg-slate-900"
                      />
                      <span>{t.properties.transparent}</span>
                    </label>
                  </div>
                </div>

                {/* Text Color */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t.properties.textColor}</span>
                  <input
                    type="color"
                    value={cellColor.startsWith('#') && cellColor.length === 7 ? cellColor : '#000000'}
                    onChange={(e) => onStyleUpdate('cellColor', e.target.value)}
                    className="w-7 h-7 rounded border border-slate-700 bg-slate-950 cursor-pointer p-0.5 shrink-0"
                  />
                </div>

                {/* Zebra Striping (Linhas Alternadas) */}
                <div className="pt-1 border-t border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">{t.properties.zebraStriping}</span>
                    <input
                      type="checkbox"
                      checked={hasAlternateRowBg}
                      onChange={(e) => onStyleUpdate('alternateRowBackground', e.target.checked ? '#f8fafc' : 'transparent')}
                      className="rounded border-slate-700 text-indigo-600 bg-slate-900 cursor-pointer"
                    />
                  </div>
                  {hasAlternateRowBg && (
                    <div className="flex items-center justify-between pl-2">
                      <span className="text-[11px] text-slate-400">{t.properties.alternateColor}</span>
                      <input
                        type="color"
                        value={alternateRowBg.startsWith('#') && alternateRowBg.length === 7 ? alternateRowBg : '#f8fafc'}
                        onChange={(e) => onStyleUpdate('alternateRowBackground', e.target.value)}
                        className="w-6 h-6 rounded border border-slate-700 bg-slate-950 cursor-pointer p-0.5 shrink-0"
                      />
                    </div>
                  )}
                </div>

                {/* Font & Size */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400">{t.properties.fontAndSize}</span>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={cellFontFamily}
                      onChange={(e) => onStyleUpdate('fontFamily', e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer w-24"
                    >
                      <option value="Helvetica">Helvetica</option>
                      <option value="Helvetica-Bold">Helvetica Bold</option>
                      <option value="Times">Times New Roman</option>
                      <option value="Courier">Courier</option>
                    </select>
                    <input
                      type="number"
                      min={6}
                      max={36}
                      value={cellFontSize}
                      onChange={(e) => onStyleUpdate('fontSize', parseFloat(e.target.value) || 10)}
                      className="w-12 bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500 text-center"
                    />
                    <span className="text-slate-500 text-[10px]">pt</span>
                  </div>
                </div>

                {/* Padding */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t.properties.padding}</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={30}
                      value={cellPadding}
                      onChange={(e) => onStyleUpdate('cellPadding', parseFloat(e.target.value) || 0)}
                      className="w-16 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500 text-center"
                    />
                    <span className="text-slate-500 text-[10px]">pt</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Bordas da Tabela */}
            <div>
              <div className="text-xs font-semibold text-slate-200 mb-2">{t.properties.tableBorders}</div>
              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 space-y-2.5 text-xs">
                {/* Presets de Borda */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block">{t.properties.borderPreset}</span>
                  <div className="grid grid-cols-4 gap-1 bg-slate-900 p-0.5 rounded border border-slate-800 text-[11px]">
                    {[
                      { id: 'all', label: t.properties.grid },
                      { id: 'row', label: t.properties.rows },
                      { id: 'columns', label: t.properties.columnsPreset },
                      { id: 'none', label: t.properties.noBorders },
                    ].map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          if (preset.id === 'none') {
                            onStyleUpdate({
                              cellBorderType: 'none',
                              headerBorderType: 'none',
                              borderWidth: 0,
                              headerBorderWidth: 0,
                            })
                          } else {
                            const nextWidth = borderWidth > 0 ? borderWidth : 1
                            onStyleUpdate({
                              cellBorderType: preset.id === 'all' ? 'cells' : preset.id,
                              headerBorderType: preset.id === 'all' ? 'columns' : preset.id,
                              borderWidth: nextWidth,
                              headerBorderWidth: nextWidth,
                            })
                          }
                        }}
                        className={`py-1 rounded text-center transition ${
                          borderType === preset.id
                            ? 'bg-indigo-600 text-white font-medium shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview Visual das Bordas */}
                <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800 flex flex-col items-center justify-center gap-1">
                  <div
                    className="w-full h-9 flex items-center justify-center text-[10px] font-mono text-slate-400 bg-slate-950/40 rounded-sm"
                    style={{
                      borderTopWidth: `${borderType === 'none' || borderType === 'columns' ? 0 : borderWidth}px`,
                      borderBottomWidth: `${borderType === 'none' || borderType === 'columns' ? 0 : borderWidth}px`,
                      borderLeftWidth: `${borderType === 'none' || borderType === 'row' ? 0 : borderWidth}px`,
                      borderRightWidth: `${borderType === 'none' || borderType === 'row' ? 0 : borderWidth}px`,
                      borderColor: borderColor,
                      borderStyle: borderStyle as any,
                    }}
                  >
                    {borderType === 'none' ? t.properties.noBorders : `${borderWidth}pt • ${borderStyle}`}
                  </div>
                </div>

                {/* Largura da Borda */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t.properties.borderThickness}</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={10}
                      step={0.5}
                      value={borderWidth}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0
                        onStyleUpdate({
                          borderWidth: val,
                          headerBorderWidth: val,
                          ...(val === 0
                            ? { cellBorderType: 'none', headerBorderType: 'none' }
                            : (borderType === 'none' ? { cellBorderType: 'cells', headerBorderType: 'columns' } : {})),
                        })
                      }}
                      className="w-16 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500 text-center"
                    />
                    <span className="text-slate-500 text-[10px]">pt</span>
                  </div>
                </div>

                {/* Cor da Borda */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t.properties.borderColor}</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={borderColor.startsWith('#') && borderColor.length === 7 ? borderColor : '#cccccc'}
                      onChange={(e) => {
                        onStyleUpdate({
                          borderColor: e.target.value,
                          headerBorderColor: e.target.value,
                        })
                      }}
                      className="w-7 h-7 rounded border border-slate-700 bg-slate-950 cursor-pointer p-0.5 shrink-0"
                    />
                    <input
                      type="text"
                      value={borderColor}
                      onChange={(e) => {
                        onStyleUpdate({
                          borderColor: e.target.value,
                          headerBorderColor: e.target.value,
                        })
                      }}
                      placeholder="#cccccc"
                      className="w-20 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500 uppercase"
                    />
                  </div>
                </div>

                {/* Estilo da Borda */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t.properties.borderStyleLabel}</span>
                  <select
                    value={borderStyle}
                    onChange={(e) => onStyleUpdate('borderStyle', e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer w-28"
                  >
                    <option value="solid">{t.properties.solid}</option>
                    <option value="dashed">{t.properties.dashed}</option>
                    <option value="dotted">{t.properties.dotted}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StudioSlateElementInspector(props: ElementInspectorProps) {
  const { t } = useTranslation()
  if (props.element.type === 'table') {
    return <StudioSlateTableInspector {...props} />
  }

  const { element, onUpdate, onStyleUpdate, parentName, isMultiSelection, selectedCount } = props
  const [localId, setLocalId] = useState(element.id || '')

  useEffect(() => {
    setLocalId(element.id || '')
  }, [element.id])

  const handleIdCommit = () => {
    const trimmed = localId.trim()
    if (trimmed && trimmed !== element.id) {
      onUpdate('id', trimmed)
    } else {
      setLocalId(element.id || '')
    }
  }

  useEffect(() => {
    if (element.type === 'static_text' && element.dataBinding) {
      onUpdate('dataBinding', undefined)
    }
  }, [element.type, element.dataBinding])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      if (result) {
        onUpdate({
          url: result,
          value: result,
          source: result,
        })
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleRemoveImage = () => {
    onUpdate({
      url: '',
      value: '',
      source: '',
    })
  }

  const store = useTemplateStore()
  const { selectedElementIds, selectedElementLocation, currentSection, template, createGroup, ungroupElements, deleteSelectedElements, selectGroup } = store

  const allTemplateGroups = [
    ...(template.groups || []),
    ...(template.pageSettings.header?.groups || []),
    ...(template.pageSettings.footer?.groups || []),
    ...(template.pageSettings.bodyBackground?.groups || []),
    ...(template.summaryPage?.groups || []),
  ]

  const elementGroup = allTemplateGroups.find(
    g => g.elementIds.includes(element.id) || g.id === (element as any).groupId
  )

  const currentGroups = (() => {
    if (selectedElementLocation === 'header') return template.pageSettings.header?.groups || []
    if (selectedElementLocation === 'footer') return template.pageSettings.footer?.groups || []
    if (selectedElementLocation === 'bodyBackground') return template.pageSettings.bodyBackground?.groups || []
    if (selectedElementLocation === 'summary') return template.summaryPage?.groups || []
    return template.groups || []
  })()

  const activeGroup = currentGroups.find(g => 
    selectedElementIds.some(id => g.elementIds.includes(id))
  )
  const canGroup = isMultiSelection && !activeGroup
  const canUngroup = !!activeGroup

  const isTextElement = ['text', 'rich_text', 'link', 'static_text'].includes(element.type)
  const isMediaElement = ['image', 'barcode'].includes(element.type)
  const isShapeOrContainer = ['rectangle', 'container', 'line', 'spacer'].includes(element.type)

  const rawFillColor = isTextElement
    ? (element.style?.color || '#000000')
    : (element.style?.fillColor || element.style?.backgroundColor || (element.type === 'container' || element.type === 'loop' ? 'transparent' : '#ffffff'))
  const isFillTransparent = !isTextElement && (!rawFillColor || rawFillColor.toLowerCase() === 'transparent')
  const fillColor = isFillTransparent ? '#ffffff' : rawFillColor
  const strokeColor = element.style?.strokeColor || element.style?.borderColor || (element.type === 'container' || element.type === 'loop' ? '#8b5cf6' : '#374151')
  const strokeWidth = element.style?.strokeWidth ?? element.style?.borderWidth ?? (element.type === 'container' || element.type === 'loop' ? 2 : 0)
  const borderStyle = (element.style?.borderStyle as string) || (element.type === 'container' || element.type === 'loop' ? 'dashed' : 'solid')

  return (
    <div className="w-[300px] bg-slate-900 border-l border-slate-800 flex flex-col h-full shrink-0 select-none text-slate-200">
      {/* 1. Header */}
      <div className="border-b border-slate-800 bg-slate-950/40 shrink-0 px-3.5 pt-2.5 pb-2">
        <div className="flex items-center justify-between gap-2">
          {isMultiSelection ? (
            <div className="relative min-w-0 flex-1">
              <span className="text-xs font-semibold text-indigo-400 tracking-wide block">
                Multi-seleção
              </span>
              <span className="text-[10px] text-slate-400 font-medium truncate block">
                {selectedCount} elementos selecionados
              </span>
              <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
            </div>
          ) : (
            <div className="relative min-w-0 flex-1">
              <span className="text-xs font-semibold text-slate-200 tracking-wide block">
                {t.properties.title}
              </span>
              <span className="text-[10px] text-slate-400 font-mono truncate block" title={element.id}>
                #{element.id}
              </span>
              <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
            </div>
          )}
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/50 uppercase shrink-0">
            {isMultiSelection ? `${selectedCount} selecionados` : (parentName ? `${parentName} / ${element.type}` : element.type)}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {/* Identificação / ID */}
        {!isMultiSelection ? (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-300">ID do Elemento</span>
              <span className="text-[10px] text-slate-500 font-mono">identificador</span>
            </div>
            <div className="flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500 transition">
              <span className="text-slate-500 font-mono text-xs mr-2 select-none">#</span>
              <input
                type="text"
                value={localId}
                onChange={(e) => setLocalId(e.target.value)}
                onBlur={handleIdCommit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleIdCommit()
                    ;(e.target as HTMLInputElement).blur()
                  }
                }}
                className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none"
                placeholder="id_do_elemento"
              />
            </div>
            {elementGroup && (
              <div className="mt-2 flex items-center justify-between p-2 rounded-lg bg-purple-950/40 border border-purple-800/40">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span className="text-[11px] text-purple-300 font-medium truncate">
                    Grupo: {elementGroup.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => selectGroup(elementGroup.id, (elementGroup.location || selectedElementLocation || 'body') as any)}
                  className="px-2 py-0.5 rounded bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-[10px] font-medium border border-purple-500/40 transition cursor-pointer"
                >
                  Propriedades do Grupo
                </button>
              </div>
            )}
          </div>
        ) : null}

        {/* 2. Transform Section */}
        <div>
          <div className="text-xs font-semibold text-slate-200 mb-2">
            {t.properties.transform}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* X */}
            <div className={`flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500 transition ${element.width === '100%' ? 'opacity-50' : ''}`}>
              <span className="text-slate-500 font-mono text-xs w-4">X</span>
              <input
                type="number"
                value={element.x ?? 0}
                disabled={element.width === '100%'}
                onChange={(e) => onUpdate('x', parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right pr-1 disabled:cursor-not-allowed"
              />
              <span className="text-slate-500 text-[10px]">pt</span>
            </div>

            {/* Y */}
            <div className={`flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500 transition ${element.height === '100%' ? 'opacity-50' : ''}`}>
              <span className="text-slate-500 font-mono text-xs w-4">Y</span>
              <input
                type="number"
                value={element.y ?? 0}
                disabled={element.height === '100%'}
                onChange={(e) => onUpdate('y', parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right pr-1 disabled:cursor-not-allowed"
              />
              <span className="text-slate-500 text-[10px]">pt</span>
            </div>

            {/* W */}
            <div className={`flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500 transition ${element.width === '100%' ? 'border-indigo-500/40' : ''}`}>
              <span className="text-slate-500 font-mono text-xs w-4">W</span>
              {element.width === '100%' ? (
                <span className="w-full text-indigo-400 font-mono text-xs text-right pr-1 font-semibold">100%</span>
              ) : (
                <input
                  type="number"
                  value={typeof element.width === 'number' ? element.width : 100}
                  onChange={(e) => onUpdate('width', parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right pr-1"
                />
              )}
              <span className="text-slate-500 text-[10px]">pt</span>
            </div>

            {/* H */}
            <div className={`flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500 transition ${element.height === '100%' ? 'border-indigo-500/40' : ''}`}>
              <span className="text-slate-500 font-mono text-xs w-4">H</span>
              {element.height === '100%' ? (
                <span className="w-full text-indigo-400 font-mono text-xs text-right pr-1 font-semibold">100%</span>
              ) : (
                <input
                  type="number"
                  value={typeof element.height === 'number' ? element.height : 30}
                  onChange={(e) => onUpdate('height', parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right pr-1"
                />
              )}
              <span className="text-slate-500 text-[10px]">pt</span>
            </div>
          </div>

          {/* Checkboxes de 100% Width e 100% Height */}
          {['rectangle', 'container', 'loop', 'line', 'image', 'spacer'].includes(element.type) && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <label className="flex items-center justify-between bg-slate-950/50 border border-slate-800 rounded-lg px-2.5 py-1.5 cursor-pointer hover:border-slate-700 transition select-none">
                <span className="text-[11px] text-slate-300 font-medium">Width 100%</span>
                <input
                  type="checkbox"
                  checked={element.width === '100%'}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onUpdate({ width: '100%', x: 0 })
                    } else {
                      onUpdate({ width: 100 })
                    }
                  }}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900 cursor-pointer w-3.5 h-3.5"
                />
              </label>

              {element.type !== 'line' && (
                <label className="flex items-center justify-between bg-slate-950/50 border border-slate-800 rounded-lg px-2.5 py-1.5 cursor-pointer hover:border-slate-700 transition select-none">
                  <span className="text-[11px] text-slate-300 font-medium">Height 100%</span>
                  <input
                    type="checkbox"
                    checked={element.height === '100%'}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onUpdate({ height: '100%', y: 0, relativeOffsetY: 0 })
                      } else {
                        onUpdate({ height: element.type === 'container' || element.type === 'loop' ? 100 : 60 })
                      }
                    }}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900 cursor-pointer w-3.5 h-3.5"
                  />
                </label>
              )}
            </div>
          )}

          {/* Position Mode (Absolute / Relative) - Oculto para Container porque container é sempre relativo */}
          {element.type !== 'container' && (
            <div className="mt-2.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">{t.properties.position}</span>
                <span className="text-[10px] font-mono text-slate-500">
                  {(((element.positionMode || element.position || 'ABSOLUTE') as string).toUpperCase()) === 'RELATIVE' ? t.properties.relativeFlow : t.properties.absoluteFixed}
                </span>
              </div>
              <div className="grid grid-cols-2 bg-slate-950 border border-slate-800 rounded-lg p-0.5 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    onUpdate({
                      positionMode: 'ABSOLUTE',
                      position: 'absolute',
                    })
                  }}
                  className={`py-1 text-xs font-medium rounded transition text-center ${
                    (((element.positionMode || element.position || 'ABSOLUTE') as string).toUpperCase()) !== 'RELATIVE'
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {t.properties.absolute}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdate({
                      positionMode: 'RELATIVE',
                      position: 'relative',
                      relativeOffsetY: element.height === '100%' ? 0 : (typeof element.relativeOffsetY === 'number' ? element.relativeOffsetY : 0),
                    })
                  }}
                  className={`py-1 text-xs font-medium rounded transition text-center ${
                    (((element.positionMode || element.position || 'ABSOLUTE') as string).toUpperCase()) === 'RELATIVE'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {t.properties.relative}
                </button>
              </div>

              {(((element.positionMode || element.position || 'ABSOLUTE') as string).toUpperCase()) === 'RELATIVE' && (
                <div className={`flex items-center justify-between bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500 mt-1.5 ${element.height === '100%' ? 'opacity-50' : ''}`}>
                  <span className="text-slate-400 text-xs">{t.properties.offsetY}</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={element.height === '100%' ? 0 : ((element.relativeOffsetY as number) ?? 0)}
                      disabled={element.height === '100%'}
                      onChange={(e) => onUpdate('relativeOffsetY', parseFloat(e.target.value) || 0)}
                      className="w-16 bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right pr-1 disabled:cursor-not-allowed"
                    />
                    <span className="text-slate-500 text-[10px]">pt</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Typography Section (for text elements) */}
        {isTextElement && (
          <div>
            <div className="text-xs font-semibold text-slate-200 mb-2">
              {t.properties.typography}
            </div>
            <div className="space-y-2">
              {/* Font Family */}
              <div className="relative">
                <select
                  value={element.style?.fontFamily || 'Helvetica'}
                  onChange={(e) => onStyleUpdate('fontFamily', e.target.value)}
                  className="w-full appearance-none bg-slate-950/70 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none pr-8 cursor-pointer"
                >
                  <option value="Inter">Inter</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times-Roman">Times New Roman</option>
                  <option value="Courier">Courier</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              {/* Font Size & Weight */}
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <select
                    value={element.style?.fontSize || 12}
                    onChange={(e) => onStyleUpdate('fontSize', parseFloat(e.target.value))}
                    className="w-full appearance-none bg-slate-950/70 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none pr-8 cursor-pointer font-mono"
                  >
                    {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map((size) => (
                      <option key={size} value={size}>{size}pt</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                <div className="relative">
                  <select
                    value={element.style?.fontWeight === 'bold' ? 'Bold' : (element.style?.fontStyle === 'italic' ? 'Italic' : 'Regular')}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === 'Bold') {
                        onStyleUpdate('fontWeight', 'bold')
                        onStyleUpdate('fontStyle', 'normal')
                      } else if (val === 'Italic') {
                        onStyleUpdate('fontWeight', 'normal')
                        onStyleUpdate('fontStyle', 'italic')
                      } else {
                        onStyleUpdate('fontWeight', 'normal')
                        onStyleUpdate('fontStyle', 'normal')
                      }
                    }}
                    className="w-full appearance-none bg-slate-950/70 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none pr-8 cursor-pointer"
                  >
                    <option value="Regular">{t.properties.regular}</option>
                    <option value="Bold">{t.properties.bold}</option>
                    <option value="Italic">{t.properties.italic}</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Segmented Control Alignment */}
              <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-1 gap-1">
                {[
                  { align: 'left', title: t.properties.alignLeft, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h10M4 18h14" /> },
                  { align: 'center', title: t.properties.alignCenter, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M7 12h10M5 18h14" /> },
                  { align: 'right', title: t.properties.alignRight, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M10 12h10M6 18h14" /> },
                  { align: 'justify', title: t.properties.alignJustify, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /> },
                ].map(({ align, title, icon }) => (
                  <button
                    key={align}
                    onClick={() => onStyleUpdate('alignment', align)}
                    className={`flex-1 py-1.5 flex items-center justify-center rounded transition ${
                      (element.style?.alignment || 'left') === align
                        ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                    title={title}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {icon}
                    </svg>
                  </button>
                ))}
              </div>

              {/* Vertical Alignment & Text Decoration */}
              <div className="flex items-center gap-2">
                {/* Vertical Align */}
                <div className="flex flex-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5 gap-0.5">
                  {[
                    { val: 'top', title: t.properties.alignTop, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h16M7 8h10M9 12h6" /> },
                    { val: 'center', title: t.properties.alignMiddle, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12h16M7 7h10M7 17h10" /> },
                    { val: 'bottom', title: t.properties.alignBottom, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 20h16M7 16h10M9 12h6" /> },
                  ].map(({ val, title, icon }) => (
                    <button
                      key={val}
                      onClick={() => onStyleUpdate('verticalAlignment', val)}
                      className={`flex-1 py-1 flex items-center justify-center rounded text-xs transition ${
                        (element.style?.verticalAlignment || 'center') === val
                          ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                      title={title}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {icon}
                      </svg>
                    </button>
                  ))}
                </div>

                {/* Text Decoration (Underline, Line-through) */}
                <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5 gap-0.5">
                  <button
                    onClick={() => {
                      const cur = element.style?.textDecoration || 'none'
                      onStyleUpdate('textDecoration', cur === 'underline' ? 'none' : 'underline')
                    }}
                    className={`w-7 h-7 flex items-center justify-center rounded text-xs font-serif underline transition ${
                      element.style?.textDecoration === 'underline'
                        ? 'bg-slate-800 text-indigo-400 border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                    title={t.properties.underline}
                  >
                    U
                  </button>
                  <button
                    onClick={() => {
                      const cur = element.style?.textDecoration || 'none'
                      onStyleUpdate('textDecoration', cur === 'line-through' ? 'none' : 'line-through')
                    }}
                    className={`w-7 h-7 flex items-center justify-center rounded text-xs font-serif line-through transition ${
                      element.style?.textDecoration === 'line-through'
                        ? 'bg-slate-800 text-indigo-400 border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                    title={t.properties.strikethrough}
                  >
                    S
                  </button>
                </div>
              </div>

              {/* Line Wrap (Multiline) & Flow Settings */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-300 font-medium">{t.properties.lineWrap}</span>
                  <input
                    type="checkbox"
                    checked={element.style?.multiline === true}
                    onChange={(e) => onStyleUpdate('multiline', e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-500 focus:ring-0 cursor-pointer"
                  />
                </div>

                {element.style?.multiline && (
                  <div className="pt-2 border-t border-slate-800/60 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col bg-slate-950/80 border border-slate-800 rounded px-2 py-1 focus-within:border-indigo-500">
                        <span className="text-[9px] text-slate-500 font-mono">{t.properties.lineHeight}</span>
                        <input
                          type="number"
                          step="0.1"
                          min="0.5"
                          max="3"
                          value={(element.style?.lineHeight as number) ?? 1.2}
                          onChange={(e) => onStyleUpdate('lineHeight', parseFloat(e.target.value) || 1.2)}
                          className="bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right"
                        />
                      </div>
                      <div className="flex flex-col bg-slate-950/80 border border-slate-800 rounded px-2 py-1 focus-within:border-indigo-500">
                        <span className="text-[9px] text-slate-500 font-mono">{t.properties.firstLineIndent}</span>
                        <input
                          type="number"
                          min="0"
                          value={(element.style?.firstLineIndent as number) ?? 0}
                          onChange={(e) => onStyleUpdate('firstLineIndent', parseFloat(e.target.value) || 0)}
                          className="bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[10px]">{t.properties.overflow}</span>
                      <select
                        value={(element.style?.overflow as string) || 'visible'}
                        onChange={(e) => onStyleUpdate('overflow', e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="visible">{t.properties.overflowVisible}</option>
                        <option value="hidden">{t.properties.overflowHidden}</option>
                        <option value="auto">{t.properties.overflowAuto}</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Text Margins / Paddings (Top, Right, Bottom, Left) */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">{t.properties.internalMargins}</label>
                <div className="grid grid-cols-4 gap-1.5">
                  <div className="flex flex-col bg-slate-950/70 border border-slate-800 rounded-lg px-2 py-1 focus-within:border-indigo-500">
                    <span className="text-[9px] text-slate-500 font-mono">{t.properties.top}</span>
                    <input
                      type="number"
                      min={0}
                      value={(element.style?.paddingTop ?? element.style?.marginTop ?? 0) as number}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0
                        onStyleUpdate('paddingTop', val)
                        onStyleUpdate('marginTop', val)
                      }}
                      className="bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right"
                    />
                  </div>
                  <div className="flex flex-col bg-slate-950/70 border border-slate-800 rounded-lg px-2 py-1 focus-within:border-indigo-500">
                    <span className="text-[9px] text-slate-500 font-mono">{t.properties.right}</span>
                    <input
                      type="number"
                      min={0}
                      value={(element.style?.paddingRight ?? element.style?.marginRight ?? 0) as number}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0
                        onStyleUpdate('paddingRight', val)
                        onStyleUpdate('marginRight', val)
                      }}
                      className="bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right"
                    />
                  </div>
                  <div className="flex flex-col bg-slate-950/70 border border-slate-800 rounded-lg px-2 py-1 focus-within:border-indigo-500">
                    <span className="text-[9px] text-slate-500 font-mono">{t.properties.bottom}</span>
                    <input
                      type="number"
                      min={0}
                      value={(element.style?.paddingBottom ?? element.style?.marginBottom ?? 0) as number}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0
                        onStyleUpdate('paddingBottom', val)
                        onStyleUpdate('marginBottom', val)
                      }}
                      className="bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right"
                    />
                  </div>
                  <div className="flex flex-col bg-slate-950/70 border border-slate-800 rounded-lg px-2 py-1 focus-within:border-indigo-500">
                    <span className="text-[9px] text-slate-500 font-mono">{t.properties.left}</span>
                    <input
                      type="number"
                      min={0}
                      value={(element.style?.paddingLeft ?? element.style?.marginLeft ?? 0) as number}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0
                        onStyleUpdate('paddingLeft', val)
                        onStyleUpdate('marginLeft', val)
                      }}
                      className="bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right"
                    />
                  </div>
                </div>
              </div>

              {/* Text Value */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">{t.properties.textContent}</label>
                <textarea
                  value={(element.value as string) || ''}
                  onChange={(e) => onUpdate('value', e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans resize-none"
                  placeholder={t.properties.textPlaceholder}
                />
              </div>

              {/* URL for Link */}
              {element.type === 'link' && (
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">{t.properties.targetUrl}</label>
                  <input
                    type="text"
                    value={(element.url as string) || ''}
                    onChange={(e) => onUpdate('url', e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Media Properties (Image / Barcode) */}
        {element.type === 'image' && (() => {
          const imageSrc = (element.url as string) || (element.source as string) || (element.value as string) || ''
          const isBase64 = imageSrc.startsWith('data:image')
          const base64SizeKB = isBase64 ? Math.round((imageSrc.length * 0.75) / 1024) : 0

          return (
            <div>
              <div className="text-xs font-semibold text-slate-200 mb-2">Imagem</div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif"
                className="hidden"
                onChange={handleImageFileSelect}
              />

              {imageSrc ? (
                <div className="space-y-2 mb-3">
                  <div className="relative group bg-slate-950/80 border border-slate-800 rounded-lg p-2 flex flex-col items-center justify-center">
                    <img
                      src={imageSrc}
                      alt="Preview"
                      className="max-h-24 max-w-full rounded object-contain border border-slate-800/60 bg-slate-900/60"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none'
                      }}
                    />
                    <div className="mt-2 flex items-center justify-between w-full px-1">
                      {isBase64 ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Base64 (~{base64SizeKB} KB)
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                          Remoto / URL
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 transition cursor-pointer"
                      >
                        <Icon name="trash" size="xs" />
                        Remover
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
                  >
                    <Icon name="upload" size="xs" />
                    Substituir por Imagem Local
                  </button>
                </div>
              ) : (
                <div className="space-y-2 mb-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition cursor-pointer shadow-sm"
                  >
                    <Icon name="upload" size="xs" />
                    Procurar Imagem Local
                  </button>
                  <p className="text-[10px] text-slate-500 text-center">
                    PNG, JPG, SVG, WebP ou GIF (converte em Base64)
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block">
                  {isBase64 ? 'Origem dos Dados' : 'URL ou Caminho da Imagem'}
                </label>
                {isBase64 ? (
                  <div className="flex items-center justify-between bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-400 font-mono">
                    <span className="truncate pr-2">data:image/...;base64 (~{base64SizeKB} KB)</span>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard?.writeText(imageSrc)}
                      title="Copiar Base64"
                      className="text-slate-400 hover:text-indigo-400 shrink-0 cursor-pointer"
                    >
                      <Icon name="copy" size="xs" />
                    </button>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={imageSrc}
                    onChange={(e) => {
                      onUpdate({
                        url: e.target.value,
                        value: e.target.value,
                        source: e.target.value,
                      })
                    }}
                    placeholder="https://exemplo.com/imagem.png"
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Ajuste (Fit)</label>
                  <select
                    value={element.fit || 'contain'}
                    onChange={(e) => onUpdate('fit', e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="contain">Contain</option>
                    <option value="cover">Cover</option>
                    <option value="fill">Fill</option>
                    <option value="scale-down">Scale Down</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Alinhamento</label>
                  <select
                    value={element.alignment || 'center'}
                    onChange={(e) => onUpdate('alignment', e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="left">Esquerda</option>
                    <option value="center">Centro</option>
                    <option value="right">Direita</option>
                  </select>
                </div>
              </div>
            </div>
          )
        })()}

        {element.type === 'barcode' && (
          <div>
            <div className="text-xs font-semibold text-slate-200 mb-2">{t.properties.barcodeSettings}</div>
            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Formato</label>
                <select
                  value={(element.barcodeType as string) || 'qrcode'}
                  onChange={(e) => onUpdate('barcodeType', e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="qrcode">QR Code (2D)</option>
                  <option value="code128">Code 128 (1D)</option>
                  <option value="code39">Code 39 (1D)</option>
                  <option value="ean13">EAN-13 (13 dígitos)</option>
                  <option value="ean8">EAN-8 (8 dígitos)</option>
                  <option value="upc_a">UPC-A (12 dígitos)</option>
                  <option value="upc_e">UPC-E (8 dígitos)</option>
                  <option value="pdf417">PDF417 (2D)</option>
                  <option value="datamatrix">Data Matrix (2D)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Conteúdo ou Campo (Data Binding)</label>
                <input
                  type="text"
                  value={(element.value as string) ?? (element.dataBinding as string) ?? ''}
                  onChange={(e) => {
                    onUpdate({ value: e.target.value, dataBinding: e.target.value })
                  }}
                  placeholder={element.barcodeType === 'qrcode' ? 'https://... ou campo.json' : '123456789012 ou campo.json'}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              {((element.barcodeType as string) || 'qrcode') === 'qrcode' && (
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Correção de Erro (QR)</label>
                  <select
                    value={(element.style?.errorCorrection as string) || 'M'}
                    onChange={(e) => onStyleUpdate('errorCorrection', e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="L">Baixa (L - 7%)</option>
                    <option value="M">Média (M - 15%)</option>
                    <option value="Q">Quartil (Q - 25%)</option>
                    <option value="H">Alta (H - 30%)</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Container specific */}
        {element.type === 'container' && (() => {
          const isFixed = element.heightMode === 'fixed' || element.autoHeight === false

          return (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-200">{t.properties.containerSettings}</div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">{t.properties.containerName}</label>
                <input
                  type="text"
                  value={(element.name as string) || ''}
                  onChange={(e) => onUpdate('name', e.target.value)}
                  placeholder="Container 1"
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Comportamento de Altura</label>
                <div className="grid grid-cols-2 gap-1.5 bg-slate-950/70 p-1 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdate({
                        heightMode: 'auto',
                        autoHeight: true,
                      })
                    }}
                    className={`py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
                      !isFixed
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Auto-Height
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdate({
                        heightMode: 'fixed',
                        autoHeight: false,
                      })
                    }}
                    className={`py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
                      isFixed
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Fixed-Height
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                  {!isFixed
                    ? 'O container se expande automaticamente conforme novos elementos são adicionados.'
                    : 'Tamanho fixo. Impede a inserção de elementos que ultrapassem a altura do container.'}
                </p>
              </div>
            </div>
          )
        })()}

        {/* Page Break specific */}
        {element.type === 'page_break' && (
          <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 space-y-1.5">
            <div className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
              <span>✂ Quebra de Página (Page Break)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Força o início de uma nova página no PDF a partir desta posição vertical. Use <strong className="text-slate-300">Print Condition</strong> abaixo para quebras de página condicionais.
            </p>
          </div>
        )}

        {/* 4. Appearance Section (Não exibido para Page Break) */}
        {element.type !== 'page_break' && (
        <div>
          <div className="text-xs font-semibold text-slate-200 mb-2">
            {t.properties.appearance}
          </div>
          <div className="space-y-2.5">
            {/* Fill Color Swatch + Hex Input + Transparent toggle */}
            <div className="flex items-center gap-2">
              <div className="relative shrink-0">
                <input
                  type="color"
                  value={fillColor.startsWith('#') && fillColor.length === 7 ? fillColor : '#ffffff'}
                  onChange={(e) => {
                    if (isTextElement) {
                      onStyleUpdate('color', e.target.value)
                    } else {
                      onStyleUpdate({ fillColor: e.target.value, backgroundColor: e.target.value })
                    }
                  }}
                  className={`w-8 h-8 rounded-lg border border-slate-700 bg-slate-950 cursor-pointer p-0.5 shrink-0 ${
                    isFillTransparent ? 'opacity-30' : ''
                  }`}
                />
                {isFillTransparent && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-0.5 bg-rose-500 rotate-45 rounded" />
                  </div>
                )}
              </div>
              <div className="flex-1 flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500 min-w-0">
                {isFillTransparent ? (
                  <span className="text-slate-500 font-mono text-xs uppercase select-none truncate">
                    {t.properties.transparent}
                  </span>
                ) : (
                  <>
                    <span className="text-slate-500 text-xs font-mono">#</span>
                    <input
                      type="text"
                      value={fillColor.replace('#', '')}
                      onChange={(e) => {
                        const hex = `#${e.target.value.replace('#', '')}`
                        if (isTextElement) {
                          onStyleUpdate('color', hex)
                        } else {
                          onStyleUpdate({ fillColor: hex, backgroundColor: hex })
                        }
                      }}
                      className="w-full bg-transparent text-slate-200 font-mono text-xs uppercase focus:outline-none ml-1"
                    />
                  </>
                )}
              </div>
              {!isTextElement && (
                <label className="flex items-center gap-1 text-[11px] text-slate-400 cursor-pointer shrink-0 select-none">
                  <input
                    type="checkbox"
                    checked={isFillTransparent}
                    onChange={(e) => {
                      const nextColor = e.target.checked ? 'transparent' : '#ffffff'
                      onStyleUpdate({ fillColor: nextColor, backgroundColor: nextColor })
                    }}
                    className="rounded border-slate-700 text-indigo-600 bg-slate-900 cursor-pointer"
                  />
                  <span>{t.properties.transparent}</span>
                </label>
              )}
            </div>

            {/* Stroke row */}
            <div className="flex items-center justify-between text-xs gap-2">
              <span className="text-slate-400 w-14 shrink-0">{t.properties.stroke}</span>
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <input
                  type="color"
                  value={strokeColor.startsWith('#') && strokeColor.length === 7 ? strokeColor : '#ffffff'}
                  onChange={(e) => onStyleUpdate({ strokeColor: e.target.value, borderColor: e.target.value })}
                  className="w-7 h-7 rounded border border-slate-700 bg-slate-950 cursor-pointer p-0.5 shrink-0"
                />
                <span className="text-slate-500 font-mono">/</span>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={strokeWidth}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0
                    onStyleUpdate({ strokeWidth: val, borderWidth: val })
                  }}
                  className="w-16 bg-slate-950/70 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500 text-center"
                />
              </div>
            </div>

            {/* Border row */}
            <div className="flex items-center justify-between text-xs gap-2">
              <span className="text-slate-400 w-14 shrink-0">{t.properties.border}</span>
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <input
                  type="color"
                  value={strokeColor.startsWith('#') && strokeColor.length === 7 ? strokeColor : '#374151'}
                  onChange={(e) => onStyleUpdate({ borderColor: e.target.value, strokeColor: e.target.value })}
                  className="w-7 h-7 rounded border border-slate-700 bg-slate-950 cursor-pointer p-0.5 shrink-0"
                />
                <select
                  value={borderStyle}
                  onChange={(e) => onStyleUpdate('borderStyle', e.target.value)}
                  className="flex-1 bg-slate-950/70 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="solid">{t.properties.solid}</option>
                  <option value="dashed">{t.properties.dashed}</option>
                  <option value="dotted">{t.properties.dotted}</option>
                  <option value="none">{t.properties.none}</option>
                </select>
              </div>
            </div>

            {/* Corner Radius for Containers / Shapes */}
            {isShapeOrContainer && (
              <div className="flex items-center justify-between text-xs gap-2">
                <span className="text-slate-400 w-14 shrink-0">{t.properties.radius}</span>
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={element.style?.cornerRadius || 0}
                    onChange={(e) => onStyleUpdate('cornerRadius', parseFloat(e.target.value) || 0)}
                    className="w-20 bg-slate-950/70 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500 text-center"
                  />
                  <span className="text-slate-500 text-[10px]">px</span>
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        {/* 5. Data Binding Section (Não exibido para static_text, container, line, spacer, page_break) */}
        {element.type !== 'container' && element.type !== 'static_text' && element.type !== 'line' && element.type !== 'spacer' && element.type !== 'page_break' && (
          <div>
            <div className="text-xs font-semibold text-slate-200 mb-2">
              {t.properties.dataBinding}
            </div>
            <div className="relative flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2 focus-within:border-indigo-500 transition">
              <input
                type="text"
                value={element.dataBinding || ''}
                onChange={(e) => {
                  if (element.type === 'barcode') {
                    onUpdate({ dataBinding: e.target.value, value: e.target.value })
                  } else {
                    onUpdate('dataBinding', e.target.value)
                  }
                }}
                placeholder="{{ invoice.items }}"
                className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none pr-6"
              />
              {/* Emerald indicator dot when bound or active */}
              <div className="absolute right-3 flex items-center">
                <span className={`w-2 h-2 rounded-full ${
                  element.dataBinding ? 'bg-emerald-400 shadow-sm shadow-emerald-500/50' : 'bg-slate-600'
                }`} />
              </div>
            </div>
            {element.dataBinding && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-emerald-400/90 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{t.properties.boundDynamicData}</span>
              </div>
            )}
          </div>
        )}

        {/* 6. Print Condition Section (Todos os elementos) */}
        <div>
          <div className="text-xs font-semibold text-slate-200 mb-2">
            {t.properties.printCondition}
          </div>
          <div className="flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2 focus-within:border-indigo-500 transition">
            <input
              type="text"
              value={element.printCondition || ''}
              onChange={(e) => onUpdate('printCondition', e.target.value || null)}
              placeholder="Ex: invoice.total > 1000"
              className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none"
            />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {t.properties.printConditionHelp}
          </span>
        </div>

        {/* 7. Delete Action Button */}
        <div className="pt-2 border-t border-slate-800 space-y-1.5">
          <button
            type="button"
            onClick={() => {
              if (isMultiSelection) {
                deleteSelectedElements()
              } else {
                useTemplateStore.getState().deleteElement(element.id, useTemplateStore.getState().selectedElementLocation)
              }
            }}
            className="w-full py-1.5 px-3 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 text-red-300 text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Icon name="trash" size="xs" />
            <span>{isMultiSelection ? `Excluir ${selectedCount} elementos` : 'Excluir elemento'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PropertiesPanel() {
  // HOOKS DEVEM VIR PRIMEIRO (antes de qualquer return)
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<string>('appearance')
  const watermarkFileInputRef = useRef<HTMLInputElement>(null)
  
  const store = useTemplateStore()
  
  const template = store.template
  const selectedElementIds = store.selectedElementIds
  const selectedElementLocation = store.selectedElementLocation
  const selectedGroupId = store.selectedGroupId
  const selectedLoopChildId = store.selectedLoopChildId
  const selectedLoopParentId = store.selectedLoopParentId
  const selectedContainerChildId = store.selectedContainerChildId
  const selectedContainerParentId = store.selectedContainerParentId
  const updateElement = store.updateElement
  const updateSelectedElements = store.updateSelectedElements
  const updateContainerChildElement = store.updateContainerChildElement
  const addElementToLoop = store.addElementToLoop
  const saveSnapshot = store.saveSnapshot
  const addElementToContainer = store.addElementToContainer
  
  const handleInputBlur = () => {
    saveSnapshot()
  }

  const handleWatermarkImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      if (result) {
        store.updateWatermark({ imageSource: result })
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleRemoveWatermarkImage = () => {
    store.updateWatermark({ imageSource: '' })
  }

  // Se um grupo estiver selecionado, exibe diretamente as propriedades do grupo
  if (selectedGroupId) {
    const allGroups: ElementGroup[] = [
      ...(template.groups || []),
      ...(template.pageSettings.header?.groups || []),
      ...(template.pageSettings.footer?.groups || []),
      ...(template.pageSettings.bodyBackground?.groups || []),
      ...(template.summaryPage?.groups || []),
    ]
    const selectedGroup = allGroups.find(g => g.id === selectedGroupId)
    if (selectedGroup) {
      const loc = (selectedGroup.location || selectedElementLocation || 'body') as any
      return <GroupPropertiesPanel group={selectedGroup} location={loc} />
    }
  }
  
  // Buscar elementos selecionados na location correta (PRIORIDADE sobre grupos)
  const selectedElements = (() => {
    if (selectedElementIds.length === 0) return []
    
    let elements: Element[] = []
    
    if (selectedElementLocation === 'header' && template.pageSettings.header) {
      elements = template.pageSettings.header.elements
    } else if (selectedElementLocation === 'footer' && template.pageSettings.footer) {
      elements = template.pageSettings.footer.elements
    } else if (selectedElementLocation === 'bodyBackground' && template.pageSettings.bodyBackground) {
      elements = template.pageSettings.bodyBackground.elements
    } else if (selectedElementLocation === 'summary' && template.summaryPage) {
      elements = template.summaryPage.elements
    } else {
      elements = template.page || []
    }
    
    const flat = flattenElements(elements)
    return flat.filter((el) => selectedElementIds.includes(el.id))
  })()

  if (selectedElements.length <= 1 && selectedLoopChildId && selectedLoopParentId) {
    // Encontrar o loop pai e o elemento filho
    let loopElement: Element | null = null
    
    if (selectedElementLocation === 'header' && template.pageSettings.header) {
      loopElement = template.pageSettings.header.elements.find(el => el.id === selectedLoopParentId) || null
    } else if (selectedElementLocation === 'footer' && template.pageSettings.footer) {
      loopElement = template.pageSettings.footer.elements.find(el => el.id === selectedLoopParentId) || null
    } else if (selectedElementLocation === 'bodyBackground' && template.pageSettings.bodyBackground) {
      loopElement = template.pageSettings.bodyBackground.elements.find(el => el.id === selectedLoopParentId) || null
    } else if (selectedElementLocation === 'summary' && template.summaryPage) {
      loopElement = template.summaryPage.elements.find(el => el.id === selectedLoopParentId) || null
    } else {
      loopElement = template.page.find(el => el.id === selectedLoopParentId) || null
    }
    
    if (loopElement && loopElement.elements) {
      const childElement = loopElement.elements.find((c: Element) => c.id === selectedLoopChildId)
      if (childElement) {
        return (
          <StudioSlateElementInspector
            element={childElement}
            parentName="Loop"
            onUpdate={(field, value) => {
              const updates = typeof field === 'string' ? { [field]: value } : field
              updateLoopChildElement(selectedLoopParentId, selectedLoopChildId, updates, selectedElementLocation)
            }}
            onStyleUpdate={(field, value) => {
              const styleUpdates = typeof field === 'string' ? { [field]: value } : field
              updateLoopChildElement(selectedLoopParentId, selectedLoopChildId, { style: { ...childElement.style, ...styleUpdates } }, selectedElementLocation)
            }}
          />
        )
      }
    }
  }

  if (selectedElements.length <= 1 && selectedContainerChildId && selectedContainerParentId) {
      // Encontrar o loop pai e o elemento filho
      let containerElement: Element | null = null

      if (selectedElementLocation === 'header' && template.pageSettings.header) {
        containerElement = template.pageSettings.header.elements.find(el => el.id === selectedContainerParentId) || null
      } else if (selectedElementLocation === 'footer' && template.pageSettings.footer) {
        containerElement = template.pageSettings.footer.elements.find(el => el.id === selectedContainerParentId) || null
      } else if (selectedElementLocation === 'bodyBackground' && template.pageSettings.bodyBackground) {
        containerElement = template.pageSettings.bodyBackground.elements.find(el => el.id === selectedContainerParentId) || null
      } else if (selectedElementLocation === 'summary' && template.summaryPage) {
        containerElement = template.summaryPage.elements.find(el => el.id === selectedContainerParentId) || null
      } else {
        containerElement = template.page?.find(el => el.id === selectedContainerParentId) || null
      }

      if (containerElement && containerElement.elements) {
        const childElement = containerElement.elements.find((c: Element) => c.id === selectedContainerChildId)
        if (childElement) {
          return (
            <StudioSlateElementInspector
              element={childElement}
              parentName={containerElement.name || 'Container'}
              onUpdate={(field, value) => {
                const updates = typeof field === 'string' ? { [field]: value } : field
                updateContainerChildElement(selectedContainerParentId, selectedContainerChildId, updates, selectedElementLocation)
              }}
              onStyleUpdate={(field, value) => {
                const styleUpdates = typeof field === 'string' ? { [field]: value } : field
                updateContainerChildElement(selectedContainerParentId, selectedContainerChildId, { style: { ...childElement.style, ...styleUpdates } }, selectedElementLocation)
              }}
            />
          )
        }
      }
    }

  
  if (selectedElements.length === 0) {
    if (store.currentSection === 'summary' && template.summaryPage) {
      return <SummaryPropertiesPanel />
    }
    
    if (store.currentSection === 'header' && template.pageSettings.header) {
      return <HeaderPropertiesPanel />
    }
    
    if (store.currentSection === 'footer' && template.pageSettings.footer) {
      return <FooterPropertiesPanel />
    }
    
    if (store.currentSection === 'bodyBackground' && template.pageSettings.bodyBackground) {
      return <BackgroundPropertiesPanel />
    }
    
    
    return (
      <div className="w-[300px] bg-slate-900 border-l border-slate-800 flex flex-col h-full shrink-0 select-none">
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <h2 className="text-sm font-semibold text-slate-200">{t.sidebar.pageSettings}</h2>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
            {template.pageSettings.size || 'A4'}
          </span>
        </div>
        <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs text-slate-400">
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">{t.sidebar.paperSize}</label>
            <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 font-medium">
              {template.pageSettings.size} ({template.pageSettings.orientation || 'portrait'})
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">{t.sidebar.margins}</label>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950 border border-slate-800 p-2 rounded">
                <span className="text-slate-500 block text-[10px]">{t.sidebar.top}:</span>
                <span className="font-mono text-slate-200">{template.pageSettings.margins.top} pt</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-2 rounded">
                <span className="text-slate-500 block text-[10px]">{t.sidebar.bottom}:</span>
                <span className="font-mono text-slate-200">{template.pageSettings.margins.bottom} pt</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-2 rounded">
                <span className="text-slate-500 block text-[10px]">{t.sidebar.left}:</span>
                <span className="font-mono text-slate-200">{template.pageSettings.margins.left} pt</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-2 rounded">
                <span className="text-slate-500 block text-[10px]">{t.sidebar.right}:</span>
                <span className="font-mono text-slate-200">{template.pageSettings.margins.right} pt</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">{t.sidebar.activeSections}</label>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center px-2 py-1.5 rounded bg-slate-950/60 border border-slate-800/60">
                <span className="text-slate-300">{t.sidebar.header}</span>
                <span className={template.pageSettings.header ? "text-indigo-400 font-medium" : "text-slate-600"}>
                  {template.pageSettings.header ? `${template.pageSettings.header.height} pt` : t.sidebar.inactive}
                </span>
              </div>
              <div className="flex justify-between items-center px-2 py-1.5 rounded bg-slate-950/60 border border-slate-800/60">
                <span className="text-slate-300">{t.sidebar.footer}</span>
                <span className={template.pageSettings.footer ? "text-indigo-400 font-medium" : "text-slate-600"}>
                  {template.pageSettings.footer ? `${template.pageSettings.footer.height} pt` : t.sidebar.inactive}
                </span>
              </div>
              <div className="flex justify-between items-center px-2 py-1.5 rounded bg-slate-950/60 border border-slate-800/60">
                <span className="text-slate-300">{t.sidebar.summary}</span>
                <span className={template.summaryPage ? "text-emerald-400 font-medium" : "text-slate-600"}>
                  {template.summaryPage ? t.sidebar.active : t.sidebar.inactive}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block">Marca d'Água (Watermark)</label>
                <span className="text-[10px] text-slate-500">Exibida em todas as páginas</span>
              </div>
              <input
                type="checkbox"
                checked={!!template.pageSettings.watermark}
                onChange={(e) => {
                  if (e.target.checked) {
                    store.updateWatermark({
                      type: 'text',
                      text: 'CONFIDENTIAL',
                      fontSize: 60,
                      fontStyle: 'bold',
                      color: '#94a3b8',
                      opacity: 0.2,
                      rotation: 45,
                      onTop: false,
                    })
                  } else {
                    store.removeWatermark()
                  }
                }}
                className="w-4 h-4 accent-indigo-600 rounded bg-slate-950 border-slate-700 cursor-pointer"
              />
            </div>

            {template.pageSettings.watermark && (
              <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg space-y-3">
                {/* Tipo de marca d'água */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Tipo:</span>
                  <div className="flex bg-slate-900 rounded p-0.5 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => store.updateWatermark({ type: 'text' })}
                      className={`px-2 py-1 text-[10px] font-medium rounded ${
                        (template.pageSettings.watermark.type || 'text') === 'text'
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Texto
                    </button>
                    <button
                      type="button"
                      onClick={() => store.updateWatermark({ type: 'image' })}
                      className={`px-2 py-1 text-[10px] font-medium rounded ${
                        template.pageSettings.watermark.type === 'image'
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Imagem
                    </button>
                  </div>
                </div>

                {/* Campos para Texto */}
                {(template.pageSettings.watermark.type || 'text') === 'text' && (
                  <>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-1">Texto Estático:</span>
                      <input
                        type="text"
                        value={template.pageSettings.watermark.text || ''}
                        onChange={(e) => store.updateWatermark({ text: e.target.value })}
                        placeholder="Ex: CONFIDENTIAL, DRAFT"
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-medium"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-1">Data Binding (opcional):</span>
                      <input
                        type="text"
                        value={template.pageSettings.watermark.dataBinding || ''}
                        onChange={(e) => store.updateWatermark({ dataBinding: e.target.value })}
                        placeholder="Ex: status, watermarkText"
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500 block mb-1">Tamanho da Fonte:</span>
                        <input
                          type="number"
                          min={10}
                          max={200}
                          value={template.pageSettings.watermark.fontSize || 60}
                          onChange={(e) => store.updateWatermark({ fontSize: Number(e.target.value) || 60 })}
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block mb-1">Estilo:</span>
                        <select
                          value={template.pageSettings.watermark.fontStyle || 'bold'}
                          onChange={(e) => store.updateWatermark({ fontStyle: e.target.value })}
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 text-xs font-medium"
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Negrito</option>
                          <option value="italic">Itálico</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-1">Cor:</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={template.pageSettings.watermark.color || '#94a3b8'}
                          onChange={(e) => store.updateWatermark({ color: e.target.value })}
                          className="w-7 h-7 rounded border border-slate-800 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={template.pageSettings.watermark.color || '#94a3b8'}
                          onChange={(e) => store.updateWatermark({ color: e.target.value })}
                          className="flex-1 px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Campos para Imagem */}
                {template.pageSettings.watermark.type === 'image' && (() => {
                  const imageSrc = template.pageSettings.watermark.imageSource || ''
                  const isBase64 = imageSrc.startsWith('data:image')
                  const base64SizeKB = isBase64 ? Math.round((imageSrc.length * 0.75) / 1024) : 0

                  return (
                    <div className="space-y-3">
                      <input
                        ref={watermarkFileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif"
                        className="hidden"
                        onChange={handleWatermarkImageFileSelect}
                      />

                      {imageSrc ? (
                        <div className="space-y-2">
                          <div className="relative group bg-slate-950/80 border border-slate-800 rounded-lg p-2 flex flex-col items-center justify-center">
                            <img
                              src={imageSrc}
                              alt="Preview"
                              className="max-h-24 max-w-full rounded object-contain border border-slate-800/60 bg-slate-900/60"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none'
                              }}
                            />
                            <div className="mt-2 flex items-center justify-between w-full px-1">
                              {isBase64 ? (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Base64 (~{base64SizeKB} KB)
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                                  Remoto / URL
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={handleRemoveWatermarkImage}
                                className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 transition cursor-pointer"
                              >
                                <Icon name="trash" size="xs" />
                                Remover
                              </button>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => watermarkFileInputRef.current?.click()}
                            className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
                          >
                            <Icon name="upload" size="xs" />
                            Substituir por Imagem Local
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => watermarkFileInputRef.current?.click()}
                            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition cursor-pointer shadow-sm"
                          >
                            <Icon name="upload" size="xs" />
                            Procurar Imagem Local
                          </button>
                          <p className="text-[10px] text-slate-500 text-center">
                            PNG, JPG, SVG, WebP ou GIF (converte em Base64)
                          </p>
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block">
                          {isBase64 ? 'Origem dos Dados' : 'URL ou Caminho da Imagem'}
                        </label>
                        {isBase64 ? (
                          <div className="flex items-center justify-between bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-400 font-mono">
                            <span className="truncate pr-2">data:image/...;base64 (~{base64SizeKB} KB)</span>
                            <button
                              type="button"
                              onClick={() => navigator.clipboard?.writeText(imageSrc)}
                              title="Copiar Base64"
                              className="text-slate-400 hover:text-indigo-400 shrink-0 cursor-pointer"
                            >
                              <Icon name="copy" size="xs" />
                            </button>
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={imageSrc}
                            onChange={(e) => store.updateWatermark({ imageSource: e.target.value })}
                            placeholder="https://exemplo.com/logo.png"
                            className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                          />
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-slate-500 block mb-1">Largura (px):</span>
                          <input
                            type="number"
                            placeholder="Auto"
                            value={template.pageSettings.watermark.width || ''}
                            onChange={(e) => store.updateWatermark({ width: e.target.value ? Number(e.target.value) : undefined })}
                            className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block mb-1">Altura (px):</span>
                          <input
                            type="number"
                            placeholder="Auto"
                            value={template.pageSettings.watermark.height || ''}
                            onChange={(e) => store.updateWatermark({ height: e.target.value ? Number(e.target.value) : undefined })}
                            className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )
                })()}

                {/* Controles Comuns: Rotação, Opacidade, OnTop, Condição */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-slate-500">Rotação:</span>
                    <span className="font-mono text-[10px] text-slate-300">{template.pageSettings.watermark.rotation ?? 45}°</span>
                  </div>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    value={template.pageSettings.watermark.rotation ?? 45}
                    onChange={(e) => store.updateWatermark({ rotation: Number(e.target.value) })}
                    className="w-full accent-indigo-500 h-1 bg-slate-800 rounded"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-slate-500">Opacidade:</span>
                    <span className="font-mono text-[10px] text-slate-300">{Math.round((template.pageSettings.watermark.opacity ?? 0.2) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={template.pageSettings.watermark.opacity ?? 0.2}
                    onChange={(e) => store.updateWatermark({ opacity: Number(e.target.value) })}
                    className="w-full accent-indigo-500 h-1 bg-slate-800 rounded"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-300">Renderizar sobre o conteúdo</span>
                  <input
                    type="checkbox"
                    checked={template.pageSettings.watermark.onTop || false}
                    onChange={(e) => store.updateWatermark({ onTop: e.target.checked })}
                    className="w-4 h-4 accent-indigo-600 rounded bg-slate-900 border-slate-700 cursor-pointer"
                  />
                </div>

                {/* Repetição em mosaico / grade preenchendo a folha */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-medium text-slate-300 block">Repetir na página (Mosaico)</span>
                      <span className="text-[10px] text-slate-500">Preenche toda a folha em grade alternada</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={template.pageSettings.watermark.repeat || false}
                      onChange={(e) => store.updateWatermark({ repeat: e.target.checked })}
                      className="w-4 h-4 accent-indigo-600 rounded bg-slate-900 border-slate-700 cursor-pointer"
                    />
                  </div>

                  {template.pageSettings.watermark.repeat && (
                    <div className="space-y-2 pt-1 pl-1">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] text-slate-400">Espaçamento Horizontal:</span>
                          <span className="font-mono text-[10px] text-slate-300">
                            {template.pageSettings.watermark.spacingX ? `${template.pageSettings.watermark.spacingX} pt` : 'Automático'}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={80}
                          max={400}
                          value={template.pageSettings.watermark.spacingX ?? 200}
                          onChange={(e) => store.updateWatermark({ spacingX: Number(e.target.value) })}
                          className="w-full accent-indigo-500 h-1 bg-slate-800 rounded"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] text-slate-400">Espaçamento Vertical:</span>
                          <span className="font-mono text-[10px] text-slate-300">
                            {template.pageSettings.watermark.spacingY ? `${template.pageSettings.watermark.spacingY} pt` : 'Automático'}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={60}
                          max={350}
                          value={template.pageSettings.watermark.spacingY ?? 150}
                          onChange={(e) => store.updateWatermark({ spacingY: Number(e.target.value) })}
                          className="w-full accent-indigo-500 h-1 bg-slate-800 rounded"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Condição de Impressão:</span>
                  <input
                    type="text"
                    value={template.pageSettings.watermark.printCondition || ''}
                    onChange={(e) => store.updateWatermark({ printCondition: e.target.value })}
                    placeholder="Ex: status == 'draft'"
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 text-xs font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] leading-relaxed">
            {t.sidebar.useSidebar}
          </div>
        </div>
      </div>
    )
  }

  const isMultiSelection = selectedElements.length > 1
  const selectedElement = selectedElements[0] 
   console.log("selected element")
  const handleUpdate = (field: string, value: string | number | boolean | object | null) => {
    if (isMultiSelection) {
      updateSelectedElements({ [field]: value })
    } else {
      updateElement(selectedElement.id, { [field]: value }, selectedElementLocation)
    }
  }

  const handleStyleUpdate = (field: string | Record<string, any>, value?: any) => {
    const styleUpdates = typeof field === 'string' ? { [field]: value } : field
    if (isMultiSelection) {
      updateSelectedElements({
        style: { ...selectedElement.style, ...styleUpdates },
      })
    } else {
      updateElement(selectedElement.id, {
        style: { ...selectedElement.style, ...styleUpdates },
      }, selectedElementLocation)
    }
  }

  // Icon mapping for tabs
  const getTabIcon = (id: string) => {
    const iconMap: Record<string, string> = {
      appearance: 'appearance',
      borders: 'borders',
      textfield: 'textfield',
      line: 'line',
      image: 'image',
      barcode: 'qrcode',
      general: 'general',
      columns: 'columns',
      styles: 'styles',
      loop: 'loop',
    }
    return iconMap[id] || 'settings'
  }

  // Define tabs based on element type
  const getTabs = () => {
    if (selectedElement.type === 'text' || selectedElement.type === 'static_text' || selectedElement.type === 'rich_text' || selectedElement.type === 'link') {
      return [
        { id: 'appearance', label: 'Appearance' },
        { id: 'borders', label: 'Borders' },
        { id: 'textfield', label: 'Text' },
      ]
    } else if (selectedElement.type === 'rectangle') {
      return [
        { id: 'appearance', label: 'Appearance' },
        { id: 'borders', label: 'Borders' },
      ]
    } else if (selectedElement.type === 'line') {
      return [
        { id: 'appearance', label: 'Appearance' },
        { id: 'line', label: 'Line' },
      ]
    } else if (selectedElement.type === 'image') {
      return [
        { id: 'appearance', label: 'Appearance' },
        { id: 'image', label: 'Image' },
      ]
    } else if (selectedElement.type === 'barcode') {
      return [
        { id: 'appearance', label: 'Appearance' },
        { id: 'barcode', label: 'Code' },
      ]
    } else if (selectedElement.type === 'loop') {
      return [
        { id: 'appearance', label: 'Appearance' },
        { id: 'elements', label: 'elements' },
      ]
    } else if (selectedElement.type === 'container') {
      return [{ id: 'appearance', label: 'Appearance' }]
    } else if (selectedElement.type === 'table') {
      return [
        { id: 'general', label: 'General' },
        { id: 'columns', label: 'Columns' },
        { id: 'styles', label: 'Styles' },
      ]
    }
    return [{ id: 'appearance', label: 'Appearance' }]
  }

  if (selectedElement) {
    return (
      <StudioSlateElementInspector
        element={selectedElement}
        isMultiSelection={isMultiSelection}
        selectedCount={selectedElements.length}
        parentName={selectedElementLocation}
        onUpdate={(field, value) => {
          const updates = typeof field === 'string' ? { [field]: value } : field
          if (isMultiSelection) {
            updateSelectedElements(updates)
          } else {
            updateElement(selectedElement.id, updates, selectedElementLocation)
          }
        }}
        onStyleUpdate={(field, value) => {
          const styleUpdates = typeof field === 'string' ? { [field]: value } : field
          if (isMultiSelection) {
            updateSelectedElements({ style: { ...selectedElement.style, ...styleUpdates } })
          } else {
            handleStyleUpdate(styleUpdates)
          }
        }}
      />
    )
  }

  const tabs = getTabs()

  return (
    <div className="w-[360px] theme-bg-secondary border-l theme-border flex flex-col h-full">
      {/* Header with Pin Button */}
      <div className="p-3 border-b theme-border flex items-center justify-between">
        <div className="flex-1">
        <h2 className="text-sm font-semibold theme-text">Properties</h2>
        {isMultiSelection ? (
            <div className="mt-1.5 p-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded">
              <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
              {selectedElements.length} elements selected
            </p>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">
              Changes will be applied to all
            </p>
          </div>
        ) : (
            <p className="text-xs theme-text-muted mt-0.5">{selectedElement.type}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <TabBar
        tabs={tabs.map((tab) => ({
          id: tab.id,
          label: tab.label,
          icon: <Icon name={getTabIcon(tab.id) as IconName} size="sm" />,
        }))}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="border-b theme-border"
      />

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TEXT ELEMENT TABS (inclui static_text, rich_text, link) */}
        {(selectedElement.type === 'text' || selectedElement.type === 'static_text' || selectedElement.type === 'rich_text' || selectedElement.type === 'link') && (
          <>
            {/* APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <>
        
        {!isMultiSelection && (
                  <>
            <div className="space-y-1 mb-3">
              <label className="text-xs font-medium theme-text-muted">ID</label>
              <Input
              value={selectedElement.id}
              onChange={(e) => handleUpdate('id', e.target.value)}
                size="sm"
            />
          </div>
            <Divider className="my-3" />
                  </>
        )}

                {/* Location */}
                <PropertyGroup title="Location" collapsible={false}>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField
                      label="X"
                value={selectedElement.x}
                      onValueChange={(value) => handleUpdate('x', value)}
                onBlur={handleInputBlur}
                    />
                    <NumberField
                      label="Y"
                value={selectedElement.y}
                      onValueChange={(value) => handleUpdate('y', value)}
                onBlur={handleInputBlur}
              />
          </div>
          
          {/* Modo de Posicionamento */}
          <div className="mt-3">
                    <Select
              value={selectedElement.positionMode || 'ABSOLUTE'}
              onChange={(e) => handleUpdate('positionMode', e.target.value === 'ABSOLUTE' ? null : e.target.value)}
                      options={[
                        { value: 'ABSOLUTE', label: 'Absolute (fixed on canvas)' },
                        { value: 'RELATIVE', label: 'Relative (follows content above)' },
                      ]}
                    />
            {selectedElement.positionMode === 'RELATIVE' && (
              <>
                <p className="text-[10px] text-purple-500 mt-1 mb-2">
                  ↳ Positioned after the previous element in PDF
                </p>
                        <PropertyRow label="Offset Y (PDF):" labelWidth="lg">
                <div className="flex items-center gap-2">
                            <Input
                    type="number"
                    value={selectedElement.relativeOffsetY ?? 0}
                    onChange={(e) => handleUpdate('relativeOffsetY', parseFloat(e.target.value))}
                              className="w-20"
                              size="sm"
                  />
                  <span className="text-[10px] theme-text-muted">px</span>
                </div>
                        </PropertyRow>
                <p className="text-[10px] theme-text-muted mt-1">
                  Space between the previous element and this one
                </p>
              </>
            )}
          </div>
                </PropertyGroup>

                {/* Size */}
                <PropertyGroup title="Size" collapsible={false}>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField
                      label="W (Width)"
                  value={selectedElement.width}
                      onValueChange={(value) => handleUpdate('width', value)}
                    />
                    <NumberField
                      label="H (Height)"
                  value={selectedElement.height}
                      onValueChange={(value) => handleUpdate('height', value)}
                />
              </div>
                </PropertyGroup>

                {/* Color */}
                <PropertyGroup title="Color" collapsible={false}>
                    <div className="grid grid-cols-2 gap-3">
                    <ColorField
                      label="Text"
                          value={selectedElement.style?.color || '#000000'}
                      onValueChange={(color) => handleStyleUpdate('color', color)}
                    />
                    <ColorField
                      label="Background"
                          value={selectedElement.style?.backgroundColor && selectedElement.style?.backgroundColor !== 'transparent' ? selectedElement.style?.backgroundColor : '#FFFFFF'}
                      onValueChange={(color) => handleStyleUpdate('backgroundColor', color)}
                          disabled={!selectedElement.style?.backgroundColor || selectedElement.style?.backgroundColor === 'transparent'}
                        />
                      </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs theme-text-secondary">Transparent Background</span>
                    <Checkbox
                        checked={!selectedElement.style?.backgroundColor || selectedElement.style?.backgroundColor === 'transparent'}
                        onChange={(e) => handleStyleUpdate('backgroundColor', e.target.checked ? 'transparent' : '#FFFFFF')}
                      />
                    </div>
                </PropertyGroup>

                
                {(selectedElement.type === 'text' || selectedElement.type === 'rich_text' || selectedElement.type === 'link') && (
                  <PropertyGroup title="Print Condition" collapsible={false}>
                    <Input
                        value={selectedElement.printCondition || ''}
                        onChange={(e) => handleUpdate('printCondition', e.target.value || null)}
                        placeholder="Ex: invoice.total > 1000"
                      size="sm"
                      />
                      <p className="text-xs theme-text-muted mt-1">
                        Leave empty to always print
                      </p>
                      
                      {/* Exemplos de Condicionais */}
                      <div className="mt-2 p-2 theme-bg-tertiary rounded border theme-border">
                        <p className="text-xs font-medium theme-text mb-1">Examples:</p>
                        <div className="space-y-0.5 text-xs theme-text-secondary font-mono">
                          <div>• invoice.total &gt; 1000</div>
                          <div>• customer.type == 'VIP'</div>
                          <div>• items.length &gt; 0</div>
                          <div>• discount &gt; 0</div>
                          <div>• status in ['pending', 'approved']</div>
                          <div>• total &gt;= 100 && total &lt; 500</div>
                        </div>
                      </div>
                  </PropertyGroup>
                )}
              </>
            )}

            {/* BORDERS TAB */}
            {activeTab === 'borders' && (
          <>
                {/* Paddings */}
                <PropertyGroup title="Paddings" collapsible={false}>
                    <div className="flex items-center mb-2">
                    <Checkbox
                        id="same-padding"
                        checked={selectedElement.style?.samePadding || false}
                        onChange={(e) => {
                          const checked = e.target.checked
                          if (checked) {
                            // Quando marca, usa o valor do Left em todos
                            const value = selectedElement.style?.paddingLeft || 0
                            const newStyle = {
                              ...selectedElement.style,
                              samePadding: true,
                              paddingLeft: value,
                              paddingRight: value,
                              paddingTop: value,
                              paddingBottom: value,
                            }
                            if (isMultiSelection) {
                              updateSelectedElements({ style: newStyle })
                            } else {
                              updateElement(selectedElement.id, { style: newStyle }, selectedElementLocation)
                            }
                          } else {
                            // Desmarca apenas o checkbox
                            const newStyle = {
                              ...selectedElement.style,
                              samePadding: false,
                            }
                            if (isMultiSelection) {
                              updateSelectedElements({ style: newStyle })
                            } else {
                              updateElement(selectedElement.id, { style: newStyle }, selectedElementLocation)
                            }
                          }
                        }}
                      />
                      <label htmlFor="same-padding" className="ml-2 text-xs theme-text">
                        Use the same value for every padding
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                    <NumberField
                      label="Left"
                          value={selectedElement.style?.paddingLeft || selectedElement.style?.paddingX || 0}
                      onValueChange={(value) => {
                            if (selectedElement.style?.samePadding) {
                              // Se checkbox marcado, atualiza todos de uma vez
                              const newStyle = {
                                ...selectedElement.style,
                                paddingLeft: value,
                                paddingRight: value,
                                paddingTop: value,
                                paddingBottom: value,
                              }
                              if (isMultiSelection) {
                                updateSelectedElements({ style: newStyle })
                              } else {
                                updateElement(selectedElement.id, { style: newStyle }, selectedElementLocation)
                              }
                            } else {
                              handleStyleUpdate('paddingLeft', value)
                            }
                          }}
                      min={0}
                      step={1}
                    />
                    <NumberField
                      label="Right"
                          value={selectedElement.style?.paddingRight || selectedElement.style?.paddingX || 0}
                      onValueChange={(value) => handleStyleUpdate('paddingRight', value)}
                      min={0}
                      step={1}
                          disabled={selectedElement.style?.samePadding || false}
                        />
                      </div>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <NumberField
                      label="Top"
                          value={selectedElement.style?.paddingTop || selectedElement.style?.paddingY || 0}
                      onValueChange={(value) => handleStyleUpdate('paddingTop', value)}
                      min={0}
                      step={1}
                          disabled={selectedElement.style?.samePadding || false}
                        />
                    <NumberField
                      label="Bottom"
                          value={selectedElement.style?.paddingBottom || selectedElement.style?.paddingY || 0}
                      onValueChange={(value) => handleStyleUpdate('paddingBottom', value)}
                      min={0}
                      step={1}
                          disabled={selectedElement.style?.samePadding || false}
                        />
                      </div>
                </PropertyGroup>

                {/* Borders */}
                <PropertyGroup title="Borders" collapsible={false}>
                  {/* Border Preview Box */}
                  <div className="mb-3 p-3 theme-bg-tertiary border theme-border rounded flex items-center justify-center">
                    <div 
                      className="w-32 h-32 bg-white"
                      style={{
                        borderTopWidth: `${selectedElement.style?.borderTopWidth ?? selectedElement.style?.borderWidth ?? 0}px`,
                        borderTopStyle: selectedElement.style?.borderStyle || 'solid',
                        borderTopColor: selectedElement.style?.borderColor || '#000000',
                        borderRightWidth: `${selectedElement.style?.borderRightWidth ?? selectedElement.style?.borderWidth ?? 0}px`,
                        borderRightStyle: selectedElement.style?.borderStyle || 'solid',
                        borderRightColor: selectedElement.style?.borderColor || '#000000',
                        borderBottomWidth: `${selectedElement.style?.borderBottomWidth ?? selectedElement.style?.borderWidth ?? 0}px`,
                        borderBottomStyle: selectedElement.style?.borderStyle || 'solid',
                        borderBottomColor: selectedElement.style?.borderColor || '#000000',
                        borderLeftWidth: `${selectedElement.style?.borderLeftWidth ?? selectedElement.style?.borderWidth ?? 0}px`,
                        borderLeftStyle: selectedElement.style?.borderStyle || 'solid',
                        borderLeftColor: selectedElement.style?.borderColor || '#000000',
                      }}
                    />
                  </div>

                  <div className="space-y-3">
                    <PropertyRow label="Pen Color:" labelWidth="lg">
                      <ColorInput
                        value={selectedElement.style?.borderColor || '#000000'}
                        onChange={(e) => handleStyleUpdate('borderColor', e.target.value)}
                      />
                    </PropertyRow>

                    <PropertyRow label="Pen Style:" labelWidth="lg">
                      <div className="flex gap-1 flex-1">
                        {[
                          { value: 'solid', label: 'Solid' },
                          { value: 'dashed', label: 'Dashed' },
                          { value: 'dotted', label: 'Dotted' }
                        ].map((style) => (
                          <Button
                            key={style.value}
                            variant={((selectedElement.style?.borderStyle || 'solid') === style.value) ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => handleStyleUpdate('borderStyle', style.value)}
                            className="flex-1 flex-col py-2"
                          >
                            <div 
                              className="h-0 mx-auto w-full"
                              style={{ 
                                borderTopWidth: '2px',
                                borderTopStyle: style.value as 'solid' | 'dashed' | 'dotted',
                                borderTopColor: (selectedElement.style?.borderStyle || 'solid') === style.value ? '#fff' : '#666'
                              }}
                            />
                            <span className="mt-1 block text-[10px]">
                              {style.label}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </PropertyRow>

                    <PropertyRow label="Pen Width:" labelWidth="lg">
                      <Input
                        type="number"
                        value={selectedElement.style?.borderWidth ?? 0}
                        onChange={(e) => handleStyleUpdate('borderWidth', parseFloat(e.target.value) || 0)}
                        size="sm"
                        className="w-24"
                        min={0}
                        max={10}
                        step={0.5}
                      />
                    </PropertyRow>
                    
                    {/* Default border styles */}
                    <div className="pt-2">
                      <label className="block text-xs theme-text-secondary mb-2">Default borders styles:</label>
                      {(() => {
                        const bw = selectedElement.style?.borderWidth ?? 0
                        const top = selectedElement.style?.borderTopWidth ?? bw
                        const right = selectedElement.style?.borderRightWidth ?? bw
                        const bottom = selectedElement.style?.borderBottomWidth ?? bw
                        const left = selectedElement.style?.borderLeftWidth ?? bw
                        const isAll = top > 0 && right > 0 && bottom > 0 && left > 0
                        const isNone = top === 0 && right === 0 && bottom === 0 && left === 0
                        const isTopBottom = top > 0 && bottom > 0 && right === 0 && left === 0
                        const isLeftRight = left > 0 && right > 0 && top === 0 && bottom === 0
                        return (
                      <div className="flex gap-2">
                        {/* All borders */}
                        <button
                          onClick={() => {
                            const width = selectedElement.style?.borderWidth || 0
                            if (isMultiSelection) {
                              updateSelectedElements({
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: width,
                                  borderRightWidth: width,
                                  borderBottomWidth: width,
                                  borderLeftWidth: width,
                                }
                              })
                            } else {
                              updateElement(selectedElement.id, {
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: width,
                                  borderRightWidth: width,
                                  borderBottomWidth: width,
                                  borderLeftWidth: width,
                                }
                              }, selectedElementLocation)
                            }
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isAll ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="All borders"
                        >
                          <div className={`w-6 h-6 border-2 ${isAll ? 'border-primary-500' : 'border-gray-500'}`}></div>
                        </button>
                        
                        {/* No borders */}
                        <button
                          onClick={() => {
                            if (isMultiSelection) {
                              updateSelectedElements({
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: 0,
                                  borderRightWidth: 0,
                                  borderBottomWidth: 0,
                                  borderLeftWidth: 0,
                                }
                              })
                            } else {
                              updateElement(selectedElement.id, {
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: 0,
                                  borderRightWidth: 0,
                                  borderBottomWidth: 0,
                                  borderLeftWidth: 0,
                                }
                              }, selectedElementLocation)
                            }
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isNone ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="No borders"
                        >
                          <div className={`w-6 h-6 border-2 border-dashed ${isNone ? 'border-primary-400' : 'border-gray-300'}`}></div>
                        </button>
                        
                        {/* Top and bottom */}
                        <button
                          onClick={() => {
                            const width = selectedElement.style?.borderWidth || 0
                            if (isMultiSelection) {
                              updateSelectedElements({
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: width,
                                  borderRightWidth: 0,
                                  borderBottomWidth: width,
                                  borderLeftWidth: 0,
                                }
                              })
                            } else {
                              updateElement(selectedElement.id, {
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: width,
                                  borderRightWidth: 0,
                                  borderBottomWidth: width,
                                  borderLeftWidth: 0,
                                }
                              }, selectedElementLocation)
                            }
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isTopBottom ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="Top and bottom borders"
                        >
                          <div className={`w-6 h-6 border-t-2 border-b-2 ${isTopBottom ? 'border-primary-500' : 'border-gray-500'}`}></div>
                        </button>
                        
                        {/* Left and right */}
                        <button
                          onClick={() => {
                            const width = selectedElement.style?.borderWidth || 0
                            if (isMultiSelection) {
                              updateSelectedElements({
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: 0,
                                  borderRightWidth: width,
                                  borderBottomWidth: 0,
                                  borderLeftWidth: width,
                                }
                              })
                            } else {
                              updateElement(selectedElement.id, {
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: 0,
                                  borderRightWidth: width,
                                  borderBottomWidth: 0,
                                  borderLeftWidth: width,
                                }
                              }, selectedElementLocation)
                            }
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isLeftRight ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="Left and right borders"
                        >
                          <div className={`w-6 h-6 border-l-2 border-r-2 ${isLeftRight ? 'border-primary-500' : 'border-gray-500'}`}></div>
                        </button>
                      </div>
                        )
                      })()}
                    </div>
                  </div>
                </PropertyGroup>

                <PropertyGroup title="Corner Radius" collapsible={false}>
                  <PropertyRow label="Radius:" labelWidth="lg">
                    <div className="flex items-center gap-2">
                      <Input
                      type="number"
                      value={selectedElement.style?.cornerRadius || 0}
                      onChange={(e) => handleStyleUpdate('cornerRadius', parseFloat(e.target.value))}
                        size="sm"
                        className="w-24"
                        min={0}
                        step={1}
                    />
                    <span className="text-xs theme-text-muted">px</span>
                  </div>
                  </PropertyRow>
                </PropertyGroup>
              </>
            )}

            {/* TEXT FIELD TAB */}
            {activeTab === 'textfield' && (
              <>
                <PropertyGroup title="Content" collapsible={false}>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium theme-text-muted">Text</label>
                      <TextArea
                value={selectedElement.value || ''}
                onChange={(e) => handleUpdate('value', e.target.value)}
                rows={3}
              />
            </div>
                    
                    
                    {selectedElement.type === 'link' && (
                      <div className="space-y-1">
                        <label className="text-xs font-medium theme-text-muted">Link URL</label>
                        <Input
                          value={selectedElement.url || ''}
                          onChange={(e) => handleUpdate('url', e.target.value)}
                          placeholder="e.g., https://example.com"
                          size="sm"
                          className="font-mono text-blue-500"
                        />
                      </div>
                    )}

                    {selectedElement.type === 'text' && (
                      <div className="space-y-1">
                        <label className="text-xs font-medium theme-text-muted">Data Binding</label>
                        <Input
                value={selectedElement.dataBinding || ''}
                onChange={(e) => handleUpdate('dataBinding', e.target.value)}
                placeholder="e.g., user.name"
                          size="sm"
                          className="font-mono"
              />
            </div>
                    )}
                  </div>
                </PropertyGroup>

                {/* Font Section - Jasper Style */}
                <PropertyGroup title="Font" collapsible={false}>
                    {/* Font Family + Size in one line */}
                    <div className="flex items-center gap-1">
                    <Select
                value={selectedElement.style?.fontFamily || 'Helvetica'}
                onChange={(e) => handleStyleUpdate('fontFamily', e.target.value)}
                      className="flex-1 min-w-0"
                      options={[
                        { value: 'Helvetica', label: 'Helvetica' },
                        { value: 'Helvetica-Bold', label: 'Helvetica Bold' },
                        { value: 'Times', label: 'Times New Roman' },
                        { value: 'Courier', label: 'Courier New' },
                      ]}
                    />
                      
                    <Input
                type="number"
                value={selectedElement.style?.fontSize || 12}
                onChange={(e) => handleStyleUpdate('fontSize', parseFloat(e.target.value))}
                      className="w-11 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      size="sm"
                      min={6}
                      max={72}
                      />
                      
                      <button
                        onClick={() => {
                          const currentSize = selectedElement.style?.fontSize || 12
                          handleStyleUpdate('fontSize', Math.max(6, currentSize - 1))
                        }}
                        className="w-7 h-7 text-xs border theme-border rounded bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition flex items-center justify-center flex-shrink-0"
                        title="Decrease size"
                      >
                        A-
                      </button>
                      <button
                        onClick={() => {
                          const currentSize = selectedElement.style?.fontSize || 12
                          handleStyleUpdate('fontSize', Math.min(72, currentSize + 1))
                        }}
                        className="w-7 h-7 text-xs border theme-border rounded bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition flex items-center justify-center flex-shrink-0"
                        title="Increase size"
                      >
                        A+
                      </button>
            </div>

                    {/* Style Buttons - B I U S */}
                    {selectedElement.type !== 'rich_text' && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            const currentWeight = selectedElement.style?.fontWeight || 'normal'
                            handleStyleUpdate('fontWeight', currentWeight === 'bold' ? 'normal' : 'bold')
                          }}
                          className={`w-10 h-10 text-sm font-bold border rounded transition ${
                            selectedElement.style?.fontWeight === 'bold'
                              ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                              : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                          }`}
                          title="Bold"
                        >
                          B
                        </button>
                        <button
                          onClick={() => {
                            const currentStyle = selectedElement.style?.fontStyle || 'normal'
                            handleStyleUpdate('fontStyle', currentStyle === 'italic' ? 'normal' : 'italic')
                          }}
                          className={`w-10 h-10 text-sm italic border rounded transition ${
                            selectedElement.style?.fontStyle === 'italic'
                              ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                              : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                          }`}
                          title="Italic"
                        >
                          I
                        </button>
                        <button
                          onClick={() => {
                            const currentDecoration = selectedElement.style?.textDecoration || 'none'
                            handleStyleUpdate('textDecoration', currentDecoration === 'underline' ? 'none' : 'underline')
                          }}
                          className={`w-10 h-10 text-sm underline border rounded transition ${
                            selectedElement.style?.textDecoration === 'underline'
                              ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                              : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                          }`}
                          title="Underline"
                        >
                          U
                        </button>
                        <button
                          onClick={() => {
                            const currentDecoration = selectedElement.style?.textDecoration || 'none'
                            handleStyleUpdate('textDecoration', currentDecoration === 'line-through' ? 'none' : 'line-through')
                        }}
                        className={`w-10 h-10 text-sm line-through border rounded transition ${
                          selectedElement.style?.textDecoration === 'line-through'
                            ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                            : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                        }`}
                        title="Strikethrough"
                      >
                        S
                </button>
                      </div>
                    )}

                    {/* Alignment Section */}
            <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Alignment</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">Horizontal</label>
              <div className="flex gap-1">
                <button
                  onClick={() => handleStyleUpdate('alignment', 'left')}
                  className={`w-10 h-10 flex items-center justify-center border rounded transition ${
                    (selectedElement.style?.alignment || 'left') === 'left'
                              ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                      : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                  title="Align left"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="2" y="3" width="12" height="2" />
                    <rect x="2" y="7" width="8" height="2" />
                    <rect x="2" y="11" width="10" height="2" />
                  </svg>
                </button>
                <button
                  onClick={() => handleStyleUpdate('alignment', 'center')}
                  className={`w-10 h-10 flex items-center justify-center border rounded transition ${
                    selectedElement.style?.alignment === 'center'
                              ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                      : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                  title="Center"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="2" y="3" width="12" height="2" />
                    <rect x="4" y="7" width="8" height="2" />
                    <rect x="3" y="11" width="10" height="2" />
                  </svg>
                </button>
                <button
                  onClick={() => handleStyleUpdate('alignment', 'right')}
                  className={`w-10 h-10 flex items-center justify-center border rounded transition ${
                    selectedElement.style?.alignment === 'right'
                              ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                      : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                  title="Align right"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="2" y="3" width="12" height="2" />
                    <rect x="6" y="7" width="8" height="2" />
                    <rect x="4" y="11" width="10" height="2" />
                  </svg>
                </button>
                <button
                  onClick={() => handleStyleUpdate('alignment', 'justify')}
                  className={`w-10 h-10 flex items-center justify-center border rounded transition ${
                    selectedElement.style?.alignment === 'justify'
                              ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                      : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                  title="Justify"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="2" y="3" width="12" height="2" />
                    <rect x="2" y="7" width="12" height="2" />
                    <rect x="2" y="11" width="12" height="2" />
                  </svg>
                </button>
              </div>
            </div>

            <div>
                      <label className="block text-xs theme-text-secondary mb-1">Vertical</label>
              <div className="flex gap-1">
                <button
                  onClick={() => handleStyleUpdate('verticalAlignment', 'top')}
                  className={`w-10 h-10 flex items-center justify-center border rounded transition ${
                    selectedElement.style?.verticalAlignment === 'top'
                              ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                      : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                  title="Top"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="2" y="2" width="12" height="2" />
                    <rect x="5" y="6" width="6" height="1.5" />
                    <rect x="5" y="9" width="6" height="1.5" />
                  </svg>
                </button>
                <button
                  onClick={() => handleStyleUpdate('verticalAlignment', 'center')}
                  className={`w-10 h-10 flex items-center justify-center border rounded transition ${
                    (selectedElement.style?.verticalAlignment || 'center') === 'center'
                              ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                      : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                  title="Center vertical"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="5" y="3" width="6" height="1.5" />
                    <rect x="2" y="7" width="12" height="2" />
                    <rect x="5" y="11.5" width="6" height="1.5" />
                  </svg>
                </button>
                <button
                  onClick={() => handleStyleUpdate('verticalAlignment', 'bottom')}
                  className={`w-10 h-10 flex items-center justify-center border rounded transition ${
                    selectedElement.style?.verticalAlignment === 'bottom'
                              ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                      : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                  title="Bottom"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="5" y="4.5" width="6" height="1.5" />
                    <rect x="5" y="7.5" width="6" height="1.5" />
                    <rect x="2" y="12" width="12" height="2" />
                  </svg>
                </button>
              </div>
            </div>
                  </div>
                </div>
            </PropertyGroup>

            <PropertyGroup title="Multiline" collapsible={false}>
                  <div className="space-y-3">
                    <Checkbox
                  id="multiline"
                  checked={selectedElement.style?.multiline || false}
                  onChange={(e) => handleStyleUpdate('multiline', e.target.checked)}
                      label="Line wrap"
                />
              {selectedElement.style?.multiline && (
                <>
                  <NumberField
                    label="1st Line Indent (pt)"
                    value={selectedElement.style?.firstLineIndent || 0}
                    onValueChange={(value) => handleStyleUpdate('firstLineIndent', value)}
                    min={0}
                    step={5}
                  />
                  
                  <div className="space-y-1">
                    <NumberField
                      label="Line Height"
                      value={selectedElement.style?.lineHeight ?? ''}
                      onValueChange={(value) => handleStyleUpdate('lineHeight', value || null)}
                      min={0.5}
                      max={3}
                      step={0.1}
                    />
                    <p className="text-[10px] theme-text-muted">Ex: 1.0 (no space), 1.2, 1.5</p>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-medium theme-text-muted">Overflow (text height)</label>
                    <Select
                      value={selectedElement.style?.overflow || 'visible'}
                      onChange={(e) => handleStyleUpdate('overflow', e.target.value)}
                      options={[
                        { value: 'visible', label: 'visible - Content can exceed height' },
                        { value: 'hidden', label: 'hidden - Clips content at height' },
                        { value: 'auto', label: 'auto - Height adjusts to content' },
                      ]}
                    />
                    <p className="text-[10px] theme-text-muted">
                      {selectedElement.style?.overflow === 'auto' 
                        ? '✓ Relative elements will be positioned after the actual content'
                        : selectedElement.style?.overflow === 'hidden'
                        ? '✓ Text will be clipped if it exceeds the defined height'
                        : 'Default: content can exceed the defined height'}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium theme-text-muted">Internal Padding (pt)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <NumberField
                        label="Top"
                          value={selectedElement.style?.paddingTop || 0}
                        onValueChange={(value) => handleStyleUpdate('paddingTop', value)}
                        min={0}
                        step={1}
                      />
                      <NumberField
                        label="Bottom"
                          value={selectedElement.style?.paddingBottom || 0}
                        onValueChange={(value) => handleStyleUpdate('paddingBottom', value)}
                        min={0}
                        step={1}
                      />
                      <NumberField
                        label="Left"
                          value={selectedElement.style?.paddingLeft || 0}
                        onValueChange={(value) => handleStyleUpdate('paddingLeft', value)}
                        min={0}
                        step={1}
                      />
                      <NumberField
                        label="Right"
                          value={selectedElement.style?.paddingRight || 0}
                        onValueChange={(value) => handleStyleUpdate('paddingRight', value)}
                        min={0}
                        step={1}
                      />
                    </div>
                  </div>
                </>
              )}
                  </div>
              </PropertyGroup>
              </>
            )}
          </>
        )}
        {/* PAGE_BREAK ELEMENT TABS */}
        {selectedElement.type === 'page_break' && (
          <>
            {activeTab === 'appearance' && (
              <>
                {!isMultiSelection && (
                  <>
                    <div className="space-y-1 mb-3">
                      <label className="text-xs font-medium theme-text-muted">ID</label>
                      <Input
                        value={selectedElement.id}
                        onChange={(e) => handleUpdate('id', e.target.value)}
                        size="sm"
                      />
                    </div>
                    <Divider className="my-3" />
                  </>
                )}

                {/* Location */}
                <PropertyGroup title="Location" collapsible={false}>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField
                      label="X"
                      value={selectedElement.x}
                      onValueChange={(value) => handleUpdate('x', value)}
                      onBlur={handleInputBlur}
                    />
                    <NumberField
                      label="Y"
                      value={selectedElement.y}
                      onValueChange={(value) => handleUpdate('y', value)}
                      onBlur={handleInputBlur}
                    />
                  </div>
                </PropertyGroup>

                <PropertyGroup title="Print Condition" collapsible={false}>
                  <Input
                    value={selectedElement.printCondition || ''}
                    onChange={(e) => handleUpdate('printCondition', e.target.value || null)}
                    placeholder="Ex: invoice.total > 1000"
                    size="sm"
                  />
                  <p className="text-xs theme-text-muted mt-1">
                    Leave empty to always print
                  </p>
                  
                  {/* Exemplos de Condicionais */}
                  <div className="mt-2 p-2 theme-bg-tertiary rounded border theme-border">
                    <p className="text-xs font-medium theme-text mb-1">Examples:</p>
                    <div className="space-y-0.5 text-xs theme-text-secondary font-mono">
                      <div>• invoice.total &gt; 1000</div>
                      <div>• customer.type == 'VIP'</div>
                    </div>
                  </div>
                </PropertyGroup>
              </>
            )}
          </>
        )}
        {/* SPACER ELEMENT TABS */}
        {selectedElement.type === 'spacer' && (
          <>
            {activeTab === 'appearance' && (
              <>
                {!isMultiSelection && (
                  <>
                    <div className="space-y-1 mb-3">
                      <label className="text-xs font-medium theme-text-muted">ID</label>
                      <Input
                        value={selectedElement.id}
                        onChange={(e) => handleUpdate('id', e.target.value)}
                        size="sm"
                      />
                    </div>
                    <Divider className="my-3" />
                  </>
                )}

                {/* Size */}
                <PropertyGroup title="Size" collapsible={false}>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField
                      label="W (Width)"
                      value={selectedElement.width}
                      onValueChange={(value) => handleUpdate('width', value)}
                    />
                    <NumberField
                      label="H (Height)"
                      value={selectedElement.height}
                      onValueChange={(value) => handleUpdate('height', value)}
                    />
                  </div>
                </PropertyGroup>
              </>
            )}
          </>
        )}

        {/* LINE ELEMENT TABS */}
        {selectedElement.type === 'line' && (
          <>
            {/* APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <>
                {!isMultiSelection && (
                  <>
                    <div className="space-y-1 mb-3">
                      <label className="text-xs font-medium theme-text-muted">ID</label>
                      <Input
                        value={selectedElement.id}
              onChange={(e) => handleUpdate('id', e.target.value)}
                        size="sm"
                      />
                    </div>
                    <Divider className="my-3" />
                  </>
                )}

                <PropertyGroup title="Print Condition" collapsible={false}>
                  <Input
                    value={selectedElement.printCondition || ''}
                    onChange={(e) => handleUpdate('printCondition', e.target.value || null)}
                    placeholder="Ex: invoice.total > 1000"
                    size="sm"
                  />
                  <p className="text-xs theme-text-muted mt-1">
                    Leave empty to always print
                  </p>
                  
                  {/* Exemplos de Condicionais */}
                  <div className="mt-2 p-2 theme-bg-tertiary rounded border theme-border">
                    <p className="text-xs font-medium theme-text mb-1">Examples:</p>
                    <div className="space-y-0.5 text-xs theme-text-secondary font-mono">
                      <div>• invoice.total &gt; 1000</div>
                      <div>• customer.type == 'VIP'</div>
                      <div>• status != 'cancelled'</div>
                      <div>• items.length &gt; 0</div>
                      <div>• status in ['pending', 'approved']</div>
                      <div>• total &gt;= 100 && total &lt; 500</div>
                    </div>
                  </div>
                </PropertyGroup>
              </>
            )}

            {/* LINE TAB */}
            {activeTab === 'line' && (
              <>
                <PropertyGroup title="Position" collapsible={false}>
                    <div className="grid grid-cols-2 gap-3">
                    <NumberField
                      label="X"
                      value={selectedElement.x}
                      onValueChange={(value) => handleUpdate('x', value)}
                    />
                    <NumberField
                      label="Y"
                      value={selectedElement.y}
                      onValueChange={(value) => handleUpdate('y', value)}
                    />
                  </div>
                </PropertyGroup>

                <PropertyGroup title="Size" collapsible={false}>
                    <div className="grid grid-cols-2 gap-3">
                  <div>
                      <NumberField
                        label="Width"
                        value={typeof selectedElement.width === 'string' ? undefined : (selectedElement.width ?? (selectedElement.x2 ? selectedElement.x2 - selectedElement.x : 100))}
                        onValueChange={(value) => handleUpdate('width', value)}
                        disabled={selectedElement.width === '100%'}
                      />
                      <label className="flex items-center mt-2 cursor-pointer">
                        <Checkbox
                          checked={selectedElement.width === '100%'}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateSelectedElements({ width: '100%', x: 0 })
                            } else {
                              updateSelectedElements({ width: 100 })
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-xs theme-text-secondary">100% Width</span>
                      </label>
                  </div>
                  <div>
                      <NumberField
                        label="Height"
                        value={typeof selectedElement.height === 'string' ? undefined : (selectedElement.height ?? (selectedElement.y2 ? selectedElement.y2 - selectedElement.y : 0))}
                        onValueChange={(value) => handleUpdate('height', value)}
                        disabled={selectedElement.height === '100%'}
                      />
                      <label className="flex items-center mt-2 cursor-pointer">
                        <Checkbox
                          checked={selectedElement.height === '100%'}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateSelectedElements({ height: '100%', y: 0 })
                            } else {
                              updateSelectedElements({ height: 0 })
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-xs theme-text-secondary">100% Height</span>
                      </label>
                      </div>
                    </div>
                  <p className="text-xs theme-text-muted mt-2">
                    Line is drawn from (X, Y) to (X + Width, Y + Height)
                  </p>
                </PropertyGroup>

                <PropertyGroup title="Style" collapsible={false}>
                  <PropertyRow label="Line Color" labelWidth="lg">
                    <ColorInput
                    value={selectedElement.style?.strokeColor || '#000000'}
                    onChange={(e) => handleStyleUpdate('strokeColor', e.target.value)}
                    />
                  </PropertyRow>

                  <div className="mt-2">
                    <NumberField
                      label="Thickness (pt)"
                    value={selectedElement.style?.strokeWidth ?? 1}
                      onValueChange={(value) => handleStyleUpdate('strokeWidth', value || 0.5)}
                      min={0.5}
                      max={20}
                      step={0.5}
                  />
                  <p className="text-xs theme-text-muted mt-1">
                    Min: 0.5pt, Max: 20pt
                  </p>
                </div>
                </PropertyGroup>
              </>
            )}
          </>
        )}

        {/* RECTANGLE ELEMENT TABS */}
        {selectedElement.type === 'rectangle' && (
          <>
            {/* APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <>
                {!isMultiSelection && (
          <>
                    <div className="space-y-1 mb-3">
                      <label className="text-xs font-medium theme-text-muted">ID</label>
                      <Input
                        value={selectedElement.id}
              onChange={(e) => handleUpdate('id', e.target.value)}
                        size="sm"
                      />
                    </div>
                    <Divider className="my-3" />
                  </>
                )}

                <PropertyGroup title="Location" collapsible={false}>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <NumberField
                        label="X"
                        value={selectedElement.x}
                        onValueChange={(value) => handleUpdate('x', value)}
                        disabled={selectedElement.width === '100%'}
                      />
                      {selectedElement.width === '100%' && (
                        <p className="text-xs theme-text-muted mt-1">Fixed at 0 (width 100%)</p>
                      )}
                    </div>
                    <div>
                      <NumberField
                        label="Y"
                        value={selectedElement.y}
                        onValueChange={(value) => handleUpdate('y', value)}
                        disabled={selectedElement.height === '100%'}
                      />
                      {selectedElement.height === '100%' && (
                        <p className="text-xs theme-text-muted mt-1">Fixed at 0 (100% height)</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Modo de Posicionamento */}
                  <div className="mt-3">
                    <Select
                      value={selectedElement.positionMode || 'ABSOLUTE'}
                      onChange={(e) => handleUpdate('positionMode', e.target.value === 'ABSOLUTE' ? null : e.target.value)}
                      options={[
                        { value: 'ABSOLUTE', label: 'Absoluto (fixo no canvas)' },
                        { value: 'RELATIVE', label: 'Relative (follows content above)' },
                      ]}
                    />
                    {selectedElement.positionMode === 'RELATIVE' && (
                      <>
                        <p className="text-[10px] text-purple-500 mt-1 mb-2">
                          ↳ Positioned after the previous element in PDF
                        </p>
                        <PropertyRow label="Offset Y (PDF):" labelWidth="lg">
                        <div className="flex items-center gap-2">
                            <Input
                            type="number"
                            value={selectedElement.relativeOffsetY ?? 0}
                            onChange={(e) => handleUpdate('relativeOffsetY', parseFloat(e.target.value))}
                              size="sm"
                              className="w-20"
                          />
                          <span className="text-[10px] theme-text-muted">px</span>
                        </div>
                        </PropertyRow>
                        <p className="text-[10px] theme-text-muted mt-1">
                          Space between the previous element and this one
                        </p>
                      </>
                    )}
                  </div>
                </PropertyGroup>

                <PropertyGroup title="Size" collapsible={false}>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <NumberField
                        label="W (Width)"
                        value={typeof selectedElement.width === 'string' ? undefined : selectedElement.width}
                        onValueChange={(value) => handleUpdate('width', value)}
                        disabled={selectedElement.width === '100%'}
                      />
                      <label className="flex items-center mt-2 cursor-pointer">
                        <Checkbox
                          checked={selectedElement.width === '100%'}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateSelectedElements({ width: '100%', x: 0 })
                            } else {
                              updateSelectedElements({ width: 100 })
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-xs theme-text-secondary">100% Width</span>
              </label>
                    </div>
                    <div>
                      <NumberField
                        label="H (Height)"
                        value={typeof selectedElement.height === 'string' ? undefined : selectedElement.height}
                        onValueChange={(value) => handleUpdate('height', value)}
                        disabled={selectedElement.height === '100%'}
                      />
                      <label className="flex items-center mt-2 cursor-pointer">
                        <Checkbox
                          checked={selectedElement.height === '100%'}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateSelectedElements({ height: '100%', y: 0 })
                            } else {
                              updateSelectedElements({ height: 100 })
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-xs theme-text-secondary">100% Height</span>
                      </label>
                    </div>
                  </div>
                </PropertyGroup>

                <PropertyGroup title="Color" collapsible={false}>
                  <div className="space-y-3">
                    <PropertyRow label="Fill" labelWidth="sm">
                      <ColorInput
                value={selectedElement.style?.fillColor || '#4a90e2'}
                onChange={(e) => handleStyleUpdate('fillColor', e.target.value)}
                        disabled={!selectedElement.style?.fillColor}
                      />
                    </PropertyRow>
                    <Checkbox
                      id="rect-transparent"
                        checked={!selectedElement.style?.fillColor}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleStyleUpdate('fillColor', null)
                          } else {
                            handleStyleUpdate('fillColor', '#4a90e2')
                          }
                        }}
                      label="Transparent"
                      />
                  </div>
                </PropertyGroup>

                <PropertyGroup title="Print Condition" collapsible={false}>
                  <Input
                    value={selectedElement.printCondition || ''}
                    onChange={(e) => handleUpdate('printCondition', e.target.value || null)}
                    placeholder="Ex: invoice.total > 1000"
                    size="sm"
                  />
                  <p className="text-xs theme-text-muted mt-1">
                    Leave empty to always print
                  </p>
                  
                  {/* Exemplos de Condicionais */}
                  <div className="mt-2 p-2 theme-bg-tertiary rounded border theme-border">
                    <p className="text-xs font-medium theme-text mb-1">Examples:</p>
                    <div className="space-y-0.5 text-xs theme-text-secondary font-mono">
                      <div>• invoice.total &gt; 1000</div>
                      <div>• customer.type == 'VIP'</div>
                      <div>• status != 'cancelled'</div>
                      <div>• items.length &gt; 0</div>
                      <div>• status in ['pending', 'approved']</div>
                      <div>• total &gt;= 100 && total &lt; 500</div>
                    </div>
                  </div>
                </PropertyGroup>
              </>
            )}

            {/* BORDERS TAB */}
            {activeTab === 'borders' && (
              <>
                {/* Borders */}
                <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Borders</h3>
                  
                  {/* Border Preview Box */}
                  <div className="mb-3 p-3 theme-bg-tertiary border theme-border rounded flex items-center justify-center">
                    <div 
                      className="w-32 h-32"
                      style={{
                        backgroundColor: selectedElement.style?.fillColor || '#4a90e2',
                        borderTopWidth: `${selectedElement.style?.borderTopWidth ?? selectedElement.style?.borderWidth ?? 1}px`,
                        borderTopStyle: selectedElement.style?.borderStyle || 'solid',
                        borderTopColor: selectedElement.style?.borderColor || '#000000',
                        borderRightWidth: `${selectedElement.style?.borderRightWidth ?? selectedElement.style?.borderWidth ?? 1}px`,
                        borderRightStyle: selectedElement.style?.borderStyle || 'solid',
                        borderRightColor: selectedElement.style?.borderColor || '#000000',
                        borderBottomWidth: `${selectedElement.style?.borderBottomWidth ?? selectedElement.style?.borderWidth ?? 1}px`,
                        borderBottomStyle: selectedElement.style?.borderStyle || 'solid',
                        borderBottomColor: selectedElement.style?.borderColor || '#000000',
                        borderLeftWidth: `${selectedElement.style?.borderLeftWidth ?? selectedElement.style?.borderWidth ?? 1}px`,
                        borderLeftStyle: selectedElement.style?.borderStyle || 'solid',
                        borderLeftColor: selectedElement.style?.borderColor || '#000000',
                        borderRadius: `${selectedElement.style?.cornerRadius || 0}px`,
                      }}
                    />
                  </div>

                  <div className="space-y-3">
                    <PropertyRow label="Pen Color:" labelWidth="lg">
                      <ColorInput
                    value={selectedElement.style?.borderColor || '#000000'}
                    onChange={(e) => handleStyleUpdate('borderColor', e.target.value)}
                  />
                    </PropertyRow>

                    <PropertyRow label="Pen Style:" labelWidth="lg">
                      <div className="flex gap-1 flex-1">
                        {[
                          { value: 'solid', label: 'Solid' },
                          { value: 'dashed', label: 'Dashed' },
                          { value: 'dotted', label: 'Dotted' }
                        ].map((style) => (
                          <Button
                            key={style.value}
                            variant={((selectedElement.style?.borderStyle || 'solid') === style.value) ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => handleStyleUpdate('borderStyle', style.value)}
                            className="flex-1 flex-col py-2"
                          >
                            <div 
                              className="h-0 mx-auto w-full"
                              style={{ 
                                borderTopWidth: '2px',
                                borderTopStyle: style.value as 'solid' | 'dashed' | 'dotted',
                                borderTopColor: (selectedElement.style?.borderStyle || 'solid') === style.value ? '#fff' : '#666'
                              }}
                            />
                            <span className="mt-1 block text-[10px]">
                              {style.label}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </PropertyRow>

                    <PropertyRow label="Pen Width:" labelWidth="lg">
                      <Input
                    type="number"
                    value={selectedElement.style?.borderWidth ?? 1}
                    onChange={(e) => handleStyleUpdate('borderWidth', parseFloat(e.target.value) || 0)}
                        size="sm"
                        className="w-24"
                        min={0}
                        max={10}
                        step={0.5}
                      />
                    </PropertyRow>
                    
                    {/* Default border styles */}
                    <div className="pt-2">
                      <label className="block text-xs theme-text-secondary mb-2">Default borders styles:</label>
                      {(() => {
                        const bw = selectedElement.style?.borderWidth ?? 1
                        const top = selectedElement.style?.borderTopWidth ?? bw
                        const right = selectedElement.style?.borderRightWidth ?? bw
                        const bottom = selectedElement.style?.borderBottomWidth ?? bw
                        const left = selectedElement.style?.borderLeftWidth ?? bw
                        const isAll = top > 0 && right > 0 && bottom > 0 && left > 0
                        const isNone = top === 0 && right === 0 && bottom === 0 && left === 0
                        const isTopBottom = top > 0 && bottom > 0 && right === 0 && left === 0
                        const isLeftRight = left > 0 && right > 0 && top === 0 && bottom === 0
                        return (
                      <div className="flex gap-2">
                        {/* All borders */}
                        <button
                          onClick={() => {
                            const width = selectedElement.style?.borderWidth || 1
                            if (isMultiSelection) {
                              updateSelectedElements({
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: width,
                                  borderRightWidth: width,
                                  borderBottomWidth: width,
                                  borderLeftWidth: width,
                                }
                              })
                            } else {
                              updateElement(selectedElement.id, {
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: width,
                                  borderRightWidth: width,
                                  borderBottomWidth: width,
                                  borderLeftWidth: width,
                                }
                              }, selectedElementLocation)
                            }
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isAll ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="All borders"
                        >
                          <div className={`w-6 h-6 border-2 ${isAll ? 'border-primary-500' : 'border-gray-500'}`}></div>
                        </button>
                        
                        {/* No borders */}
                        <button
                          onClick={() => {
                            if (isMultiSelection) {
                              updateSelectedElements({
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: 0,
                                  borderRightWidth: 0,
                                  borderBottomWidth: 0,
                                  borderLeftWidth: 0,
                                }
                              })
                            } else {
                              updateElement(selectedElement.id, {
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: 0,
                                  borderRightWidth: 0,
                                  borderBottomWidth: 0,
                                  borderLeftWidth: 0,
                                }
                              }, selectedElementLocation)
                            }
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isNone ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="No borders"
                        >
                          <div className={`w-6 h-6 border-2 border-dashed ${isNone ? 'border-primary-400' : 'border-gray-300'}`}></div>
                        </button>
                        
                        {/* Top and bottom */}
                        <button
                          onClick={() => {
                            const width = selectedElement.style?.borderWidth || 1
                            if (isMultiSelection) {
                              updateSelectedElements({
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: width,
                                  borderRightWidth: 0,
                                  borderBottomWidth: width,
                                  borderLeftWidth: 0,
                                }
                              })
                            } else {
                              updateElement(selectedElement.id, {
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: width,
                                  borderRightWidth: 0,
                                  borderBottomWidth: width,
                                  borderLeftWidth: 0,
                                }
                              }, selectedElementLocation)
                            }
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isTopBottom ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="Top and bottom borders"
                        >
                          <div className={`w-6 h-6 border-t-2 border-b-2 ${isTopBottom ? 'border-primary-500' : 'border-gray-500'}`}></div>
                        </button>
                        
                        {/* Left and right */}
                        <button
                          onClick={() => {
                            const width = selectedElement.style?.borderWidth || 1
                            if (isMultiSelection) {
                              updateSelectedElements({
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: 0,
                                  borderRightWidth: width,
                                  borderBottomWidth: 0,
                                  borderLeftWidth: width,
                                }
                              })
                            } else {
                              updateElement(selectedElement.id, {
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: 0,
                                  borderRightWidth: width,
                                  borderBottomWidth: 0,
                                  borderLeftWidth: width,
                                }
                              }, selectedElementLocation)
                            }
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isLeftRight ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="Left and right borders"
                        >
                          <div className={`w-6 h-6 border-l-2 border-r-2 ${isLeftRight ? 'border-primary-500' : 'border-gray-500'}`}></div>
                        </button>
              </div>
                        )
                      })()}
            </div>
                  </div>
                </div>

                <PropertyGroup title="Corner Radius" collapsible={false}>
                  <PropertyRow label="Radius:" labelWidth="lg">
                    <div className="flex items-center gap-2">
                      <Input
                type="number"
                value={selectedElement.style?.cornerRadius || 0}
                onChange={(e) => handleStyleUpdate('cornerRadius', parseFloat(e.target.value))}
                        size="sm"
                        className="w-24"
                        min={0}
                        step={1}
              />
                    <span className="text-xs theme-text-muted">px</span>
                  </div>
                  </PropertyRow>
                </PropertyGroup>
              </>
            )}
          </>
        )}

        {/* IMAGE ELEMENT TABS */}
        {selectedElement.type === 'image' && (
          <>
            {/* APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <>
                {!isMultiSelection && (
          <>
                    <div className="space-y-1 mb-3">
                      <label className="text-xs font-medium theme-text-muted">ID</label>
                      <Input
                        value={selectedElement.id}
              onChange={(e) => handleUpdate('id', e.target.value)}
                        size="sm"
                      />
                    </div>
                    <Divider className="my-3" />
                  </>
                )}

                <PropertyGroup title="Location" collapsible={false}>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField
                      label="X"
                        value={selectedElement.x}
                      onValueChange={(value) => handleUpdate('x', value)}
                    />
                    <NumberField
                      label="Y"
                        value={selectedElement.y}
                      onValueChange={(value) => handleUpdate('y', value)}
                      />
                    </div>
                </PropertyGroup>

                <PropertyGroup title="Size" collapsible={false}>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField
                      label="W (Width)"
                        value={selectedElement.width}
                      onValueChange={(value) => handleUpdate('width', value)}
                    />
                    <NumberField
                      label="H (Height)"
                        value={selectedElement.height}
                      onValueChange={(value) => handleUpdate('height', value)}
                      />
                    </div>
                </PropertyGroup>

                <PropertyGroup title="Image Fit" collapsible={false}>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium theme-text-muted">Redimensionamento (fit)</label>
                      <Select
                        value={selectedElement.fit || 'contain'}
                        onChange={(e) => handleUpdate('fit', e.target.value)}
                        options={[
                          { value: 'contain', label: 'Contain (fits inside, keeps aspect ratio)' },
                          { value: 'cover', label: 'Cover (cobre tudo, pode cortar)' },
                          { value: 'fill', label: 'Fill (estica, pode distorcer)' },
                          { value: 'scale-down', label: 'Scale Down (only shrinks if larger)' },
                        ]}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium theme-text-muted">Alignment</label>
                      <Select
                        value={selectedElement.alignment || 'center'}
                        onChange={(e) => handleUpdate('alignment', e.target.value)}
                        options={[
                          { value: 'left', label: 'Esquerda' },
                          { value: 'center', label: 'Centro' },
                          { value: 'right', label: 'Direita' },
                        ]}
                      />
                    </div>
                  </div>
                </PropertyGroup>

                <PropertyGroup title="Print Condition" collapsible={false}>
                  <Input
                    value={selectedElement.printCondition || ''}
                    onChange={(e) => handleUpdate('printCondition', e.target.value || null)}
                    placeholder="Ex: invoice.total > 1000"
                    size="sm"
                  />
                  <p className="text-xs theme-text-muted mt-1">
                    Leave empty to always print
                  </p>
                  
                  {/* Exemplos de Condicionais */}
                  <div className="mt-2 p-2 theme-bg-tertiary rounded border theme-border">
                    <p className="text-xs font-medium theme-text mb-1">Examples:</p>
                    <div className="space-y-0.5 text-xs theme-text-secondary font-mono">
                      <div>• invoice.total &gt; 1000</div>
                      <div>• customer.type == 'VIP'</div>
                      <div>• status != 'cancelled'</div>
                      <div>• items.length &gt; 0</div>
                      <div>• status in ['pending', 'approved']</div>
                      <div>• total &gt;= 100 && total &lt; 500</div>
                    </div>
                  </div>
                </PropertyGroup>
              </>
            )}

            {/* IMAGE TAB */}
            {activeTab === 'image' && (
              <PropertyGroup title="Image Source" collapsible={false}>
                  <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium theme-text-muted">URL ou Caminho</label>
                    <Input
                value={selectedElement.source || ''}
                onChange={(e) => handleUpdate('source', e.target.value)}
                        placeholder="https://... ou /path/to/image.png"
                      size="sm"
                      className="font-mono"
              />
            </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium theme-text-muted">Data Binding</label>
                    <Input
                value={selectedElement.dataBinding || ''}
                onChange={(e) => handleUpdate('dataBinding', e.target.value)}
                placeholder="e.g., company.logo"
                      size="sm"
                      className="font-mono"
              />
                      <p className="text-xs theme-text-muted mt-1">For dynamic images</p>
                    </div>
                  </div>
              </PropertyGroup>
            )}
          </>
        )}

        {selectedElement.type === 'table' && (
          <TableEditor 
            element={selectedElement}
            onUpdate={handleUpdate}
            onStyleUpdate={handleStyleUpdate}
            activeTab={activeTab as 'general' | 'columns' | 'styles'}
          />
        )}

        {/* BARCODE ELEMENT TABS */}
        {selectedElement.type === 'barcode' && (
          <>
            {/* APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <>
                {!isMultiSelection && (
                  <>
                    <div className="space-y-1 mb-3">
                      <label className="text-xs font-medium theme-text-muted">ID</label>
                      <Input
                        value={selectedElement.id}
              onChange={(e) => handleUpdate('id', e.target.value)}
                        size="sm"
                      />
                    </div>
                    <Divider className="my-3" />
                  </>
                )}

                <PropertyGroup title="Location" collapsible={false}>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField
                      label="X"
                        value={selectedElement.x}
                      onValueChange={(value) => handleUpdate('x', value)}
                    />
                    <NumberField
                      label="Y"
                        value={selectedElement.y}
                      onValueChange={(value) => handleUpdate('y', value)}
                      />
                  </div>
                  
                  {/* Modo de Posicionamento - Barcode */}
                  <div className="mt-3">
                    {selectedElement.type === 'container' ? (
                      <>
                        <p className="text-[10px] text-purple-500 mt-1 mb-2">
                          Container is always RELATIVE (core rule)
                        </p>
                        <PropertyRow label="Offset Y (PDF):" labelWidth="lg">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={selectedElement.relativeOffsetY ?? 0}
                              onChange={(e) => handleUpdate('relativeOffsetY', parseFloat(e.target.value))}
                              size="sm"
                              className="w-20"
                            />
                            <span className="text-[10px] theme-text-muted">px</span>
                          </div>
                        </PropertyRow>
                      </>
                    ) : (
                      <>
                        <Select
                          value={selectedElement.positionMode || 'ABSOLUTE'}
                          onChange={(e) => handleUpdate('positionMode', e.target.value === 'ABSOLUTE' ? null : e.target.value)}
                          options={[
                            { value: 'ABSOLUTE', label: 'Absoluto (fixo no canvas)' },
                            { value: 'RELATIVE', label: 'Relative (follows content above)' },
                          ]}
                        />
                        {selectedElement.positionMode === 'RELATIVE' && (
                          <>
                            <p className="text-[10px] text-purple-500 mt-1 mb-2">
                              ↳ Positioned after the previous element in PDF
                            </p>
                            <PropertyRow label="Offset Y (PDF):" labelWidth="lg">
                            <div className="flex items-center gap-2">
                                <Input
                                type="number"
                                value={selectedElement.relativeOffsetY ?? 0}
                                onChange={(e) => handleUpdate('relativeOffsetY', parseFloat(e.target.value))}
                                  size="sm"
                                  className="w-20"
                              />
                              <span className="text-[10px] theme-text-muted">px</span>
                            </div>
                            </PropertyRow>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </PropertyGroup>

                <PropertyGroup title="Size" collapsible={false}>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField
                      label="W (Width)"
                        value={selectedElement.width}
                      onValueChange={(value) => handleUpdate('width', value)}
                    />
                    <NumberField
                      label="H (Height)"
                        value={selectedElement.height}
                      onValueChange={(value) => handleUpdate('height', value)}
                      />
                    </div>
                </PropertyGroup>

                <PropertyGroup title="Print Condition" collapsible={false}>
                  <Input
                    value={selectedElement.printCondition || ''}
                    onChange={(e) => handleUpdate('printCondition', e.target.value || null)}
                    placeholder="Ex: invoice.total > 1000"
                    size="sm"
                  />
                  <p className="text-xs theme-text-muted mt-1">
                    Leave empty to always print
                  </p>
                  
                  {/* Exemplos de Condicionais */}
                  <div className="mt-2 p-2 theme-bg-tertiary rounded border theme-border">
                    <p className="text-xs font-medium theme-text mb-1">Examples:</p>
                    <div className="space-y-0.5 text-xs theme-text-secondary font-mono">
                      <div>• invoice.total &gt; 1000</div>
                      <div>• customer.type == 'VIP'</div>
                      <div>• status != 'cancelled'</div>
                      <div>• items.length &gt; 0</div>
                      <div>• status in ['pending', 'approved']</div>
                      <div>• total &gt;= 100 && total &lt; 500</div>
                    </div>
                  </div>
                </PropertyGroup>
              </>
            )}

            {/* BARCODE TAB */}
            {activeTab === 'barcode' && (
              <>
                <PropertyGroup title="Code Type" collapsible={false}>
                  <Select
                    value={selectedElement.barcodeType || 'qrcode'}
                    onChange={(e) => handleUpdate('barcodeType', e.target.value)}
                    options={[
                      { value: 'qrcode', label: 'QR Code' },
                      { value: 'barcode', label: 'Barcode' },
                    ]}
                  />
                </PropertyGroup>

                <PropertyGroup title="Data" collapsible={false}>
                  <div className="space-y-1">
                    <label className="text-xs font-medium theme-text-muted">Data Binding</label>
                    <Input
                    value={selectedElement.dataBinding || ''}
                    onChange={(e) => handleUpdate('dataBinding', e.target.value)}
                    placeholder="Ex: invoice.qrCode, customer.cpf"
                      size="sm"
                      className="font-mono"
                  />
                  <p className="text-xs theme-text-muted mt-1">
                      Field to be encoded
                    </p>
                  </div>
                </PropertyGroup>
                
                {/* Error Correction (apenas QR Code) */}
                {selectedElement.barcodeType === 'qrcode' && (
                  <PropertyGroup title="QR Code Quality" collapsible={false}>
                    <div className="space-y-1">
                      <label className="text-xs font-medium theme-text-muted">Error Correction</label>
                      <Select
                      value={selectedElement.style?.errorCorrection || 'M'}
                      onChange={(e) => handleStyleUpdate('errorCorrection', e.target.value)}
                        options={[
                          { value: 'L', label: 'Low (~7%)' },
                          { value: 'M', label: 'Medium (~15%)' },
                          { value: 'Q', label: 'Quartile (~25%)' },
                          { value: 'H', label: 'High (~30%)' },
                        ]}
                      />
                    <p className="text-xs theme-text-muted mt-1">
                          Higher = more damage resistant
                    </p>
                  </div>
                  </PropertyGroup>
                )}
              </>
            )}
          </>
        )}

        {/* LOOP ELEMENT TABS */}
        {(selectedElement.type === 'loop' || selectedElement.type === 'container') && (
          <>
            {/* APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <>
                {!isMultiSelection && (
                  <>
                    <div className="space-y-1 mb-3">
                      <label className="text-xs font-medium theme-text-muted">ID</label>
                      <Input
                        value={selectedElement.id}
                        onChange={(e) => handleUpdate('id', e.target.value)}
                        disabled={selectedElement.type !== 'container'}
                        size="sm"
                      />
                    </div>
                    <Divider className="my-3" />
                  </>
                )}

                {selectedElement.type === 'loop' && (
                  <PropertyGroup title="Location" collapsible={false}>
                    <div className="grid grid-cols-2 gap-3">
                      <NumberField
                        label="X"
                          value={selectedElement.x}
                        onValueChange={(value) => handleUpdate('x', value)}
                      />
                  </div>
                  
                  {/* Modo de Posicionamento - Loop */}
                  <div className="mt-3">
                    {selectedElement.type === 'container' ? (
                      <>
                        <p className="text-[10px] text-purple-500 mt-1 mb-2">
                          Container is always RELATIVE (core rule)
                        </p>
                        <PropertyRow label="Offset Y (PDF):" labelWidth="lg">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={selectedElement.relativeOffsetY ?? 0}
                              onChange={(e) => handleUpdate('relativeOffsetY', parseFloat(e.target.value))}
                              size="sm"
                              className="w-20"
                            />
                            <span className="text-[10px] theme-text-muted">px</span>
                          </div>
                        </PropertyRow>
                      </>
                    ) : (
                      <>
                        <Select
                          value={selectedElement.positionMode || 'ABSOLUTE'}
                          onChange={(e) => handleUpdate('positionMode', e.target.value === 'ABSOLUTE' ? null : e.target.value)}
                          options={[
                            { value: 'ABSOLUTE', label: 'Absoluto (fixo no canvas)' },
                            { value: 'RELATIVE', label: 'Relative (follows content above)' },
                          ]}
                        />
                        {selectedElement.positionMode === 'RELATIVE' && (
                          <>
                            <p className="text-[10px] text-purple-500 mt-1 mb-2">
                              ↳ Positioned after the previous element in PDF
                            </p>
                            <PropertyRow label="Offset Y (PDF):" labelWidth="lg">
                            <div className="flex items-center gap-2">
                                <Input
                                type="number"
                                value={selectedElement.relativeOffsetY ?? 0}
                                onChange={(e) => handleUpdate('relativeOffsetY', parseFloat(e.target.value))}
                                  size="sm"
                                  className="w-20"
                              />
                              <span className="text-[10px] theme-text-muted">px</span>
                            </div>
                            </PropertyRow>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </PropertyGroup>
                )}
                <PropertyGroup title="Size" collapsible={false}>
                  <div className={`grid gap-3 ${selectedElement.type === 'container' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {selectedElement.type === 'loop' && (
                      <NumberField
                        label="W (Width)"
                          value={selectedElement.width}
                        onValueChange={(value) => handleUpdate('width', value)}
                      />
                    )}
                    <NumberField
                      label="H (Height)"
                        value={selectedElement.height}
                      onValueChange={(value) => handleUpdate('height', value)}
                      />
                    </div>
                </PropertyGroup>

                <PropertyGroup title="Print Condition" collapsible={false}>
                  <Input
                    value={selectedElement.printCondition || ''}
                    onChange={(e) => handleUpdate('printCondition', e.target.value || null)}
                    placeholder="Ex: items.length > 0"
                    size="sm"
                  />
                  <p className="text-xs theme-text-muted mt-1">
                    Leave empty to always print
                  </p>
                </PropertyGroup>
              </>
            )}

            {/* LOOP TAB */}
            {activeTab === 'elements' && (
              <>
                <PropertyGroup title="Loop Configuration" collapsible={false}>
                  <div className="space-y-3">
                    {selectedElement.type === 'loop' && (
                      <>
                        <div className="space-y-1">
                          <label className="text-xs font-medium theme-text-muted">Data Binding (Lista)</label>
                          <Input
                            value={selectedElement.dataBinding || ''}
                            onChange={(e) => handleUpdate('dataBinding', e.target.value)}
                            placeholder="Ex: invoice.items"
                            size="sm"
                            className="font-mono"
                          />
                          <p className="text-xs theme-text-muted mt-1">
                            Path to the list in the data JSON
                          </p>
                        </div>

                        <NumberField
                          label="Item Spacing (px)"
                          value={selectedElement.itemSpacing || 20}
                          onValueChange={(value) => handleUpdate('itemSpacing', value)}
                        />
                        <p className="text-xs theme-text-muted -mt-1">
                          Vertical space between each repetition
                        </p>
                      </>
                    )}
                  </div>
                </PropertyGroup>

                <PropertyGroup title="Add Elements" collapsible={false}>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { type: 'text', label: 'Text', icon: 'text' as const },
                      { type: 'static_text', label: 'Static', icon: 'static-text' as const },
                      { type: 'image', label: 'Image', icon: 'image' as const },
                      { type: 'rectangle', label: 'Rectangle', icon: 'rectangle' as const },
                      { type: 'line', label: 'Line', icon: 'minus' as const },
                      { type: 'loop', label: 'Loop', icon: 'loop' as const },
                    ].map((item) => (
                      <Button
                        key={item.type}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const id = `${item.type}-${Date.now()}`
                          let newElement: Partial<Element> = { type: item.type, id, x: 0, y: 0 }
                          
                          if (item.type === 'text' || item.type === 'static_text') {
                            newElement = {
                              ...newElement,
                              value: item.type === 'text' ? 'field' : 'Text',
                              width: 150,
                              height: 20,
                              style: { fontSize: 10, fontFamily: 'Helvetica', color: '#000000' },
                            }
                          } else if (item.type === 'image') {
                            newElement = { ...newElement, width: 50, height: 50, source: '' }
                          } else if (item.type === 'rectangle') {
                            newElement = { ...newElement, width: 100, height: 20, style: { fillColor: '#e0e0e0' } }
                          } else if (item.type === 'line') {
                            newElement = { ...newElement, width: 100, height: 0, style: { strokeColor: '#000000', strokeWidth: 1 } }
                          } else if (item.type === 'loop') {
                            newElement = { ...newElement, width: 100, height: 20, databinding: '' }
                          }
                          
                          addElementToLoop(selectedElement.id, newElement, selectedElementLocation)
                        }}
                        className="flex items-center gap-2 justify-start"
                      >
                        <Icon name={item.icon} size="sm" />
                        {item.label}
                      </Button>
                    ))}
                  </div>
                  
                  {/* Lista de elementos filhos */}
                  {(selectedElement.elements || []).length > 0 && (
                    <>
                      <label className="text-xs font-medium theme-text mb-2 block">
                        Elements ({(selectedElement.elements || []).length})
                      </label>
                      <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                        {(selectedElement.elements || []).map((child: Element, idx: number) => (
                          <LoopChildEditor
                            key={child.id}
                            child={child}
                            index={idx}
                            loopId={selectedElement.id}
                            location={selectedElementLocation}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  
                  {/* Dica */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700 font-medium mb-1">💡 Usage tip:</p>
                    <p className="text-xs text-blue-600">
                      Use only the property name to access item data.
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Ex: <code className="px-1 py-0.5 bg-blue-100 rounded font-mono">name</code>, <code className="px-1 py-0.5 bg-blue-100 rounded font-mono">value</code>, <code className="px-1 py-0.5 bg-blue-100 rounded font-mono">price</code>
                    </p>
                  </div>
                </PropertyGroup>

                <PropertyGroup title="Usage Example" collapsible={false}>
                  <div className="p-2 theme-bg-tertiary rounded border theme-border text-xs font-mono theme-text-secondary">
                    <div className="mb-1">Data Binding: <span className="text-primary-600">invoice.items</span></div>
                    <div className="mb-1">Elements use only the property name:</div>
                    <div className="pl-2 text-[10px]">
                      <div>• name → item name</div>
                      <div>• price → price</div>
                      <div>• qty → quantity</div>
                    </div>
                  </div>
                </PropertyGroup>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}


interface TableEditorProps {
  element: Element
  onUpdate: (field: string, value: string | number | boolean | object | null) => void
  onStyleUpdate: (field: string, value: string | number | boolean | null) => void
  activeTab: 'general' | 'columns' | 'styles'
}

function TableEditor({ element, onUpdate, onStyleUpdate, activeTab }: TableEditorProps) {
  // Helper para calcular valores de border dinamicamente baseado em borderType
  const getHeaderBorderValues = () => {
    const borderWidth = element.style?.headerBorderWidth ?? element.style?.borderWidth ?? 1
    const borderType = element.style?.headerBorderType
    
    if (!borderType || borderType === 'none') {
      return { top: 0, right: 0, bottom: 0, left: 0 }
    }
    
    if (borderType === 'row' || borderType === 'all') {
      return { top: borderWidth, right: borderWidth, bottom: borderWidth, left: borderWidth }
    }
    
    if (borderType === 'columns') {
      return { top: borderWidth, right: borderWidth, bottom: borderWidth, left: borderWidth }
    }
    
    if (borderType === 'top-bottom') {
      return { top: borderWidth, right: 0, bottom: borderWidth, left: 0 }
    }
    
    if (borderType === 'left-right') {
      return { top: 0, right: borderWidth, bottom: 0, left: borderWidth }
    }
    
    return { top: borderWidth, right: borderWidth, bottom: borderWidth, left: borderWidth }
  }
  
  const getCellBorderValues = () => {
    const borderWidth = element.style?.borderWidth ?? 1
    const borderType = element.style?.cellBorderType
    
    if (!borderType || borderType === 'none') {
      return { top: 0, right: 0, bottom: 0, left: 0 }
    }
    
    if (borderType === 'row' || borderType === 'all') {
      return { top: borderWidth, right: borderWidth, bottom: borderWidth, left: borderWidth }
    }
    
    if (borderType === 'cells') {
      return { top: borderWidth, right: borderWidth, bottom: borderWidth, left: borderWidth }
    }
    
    if (borderType === 'top-bottom') {
      return { top: borderWidth, right: 0, bottom: borderWidth, left: 0 }
    }
    
    if (borderType === 'left-right') {
      return { top: 0, right: borderWidth, bottom: 0, left: borderWidth }
    }
    
    return { top: borderWidth, right: borderWidth, bottom: borderWidth, left: borderWidth }
  }

  
  const updateColumn = (index: number, field: string, value: string | number | boolean | null) => {
    if (!element.columns || !element.columns[index]) return
    
    
    const newColumns = JSON.parse(JSON.stringify(element.columns))
    
    
    newColumns[index][field] = value
    
    // Chamar onUpdate com o novo array
    onUpdate('columns', newColumns)
  }

  return (
    <>
      {/* Tab Content */}
      <div>
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            <PropertyGroup title="Position" collapsible={false}>
            <div className="grid grid-cols-2 gap-2">
                <NumberField
                  label="X (pt)"
                  value={element.x || 0}
                  onValueChange={(value) => onUpdate('x', value)}
                  disabled={element.width === '100%'}
                />
                <NumberField
                  label="Y (pt)"
                  value={element.y || 0}
                  onValueChange={(value) => onUpdate('y', value)}
                />
            </div>

            {/* Modo de Posicionamento */}
              <div className="mt-3">
                <Select
                value={element.positionMode || 'ABSOLUTE'}
                onChange={(e) => onUpdate('positionMode', e.target.value === 'ABSOLUTE' ? null : e.target.value)}
                  options={[
                    { value: 'ABSOLUTE', label: 'Absolute (fixed on canvas)' },
                    { value: 'RELATIVE', label: 'Relative (follows content above)' },
                  ]}
                />
              {element.positionMode === 'RELATIVE' && (
                <>
                  <p className="text-[10px] text-purple-500 mt-1 mb-2">
                    ↳ Positioned after the previous element in PDF
                  </p>
                    <PropertyRow label="Offset Y (PDF):" labelWidth="lg">
                  <div className="flex items-center gap-2">
                        <Input
                      type="number"
                      value={element.relativeOffsetY ?? 0}
                      onChange={(e) => onUpdate('relativeOffsetY', parseFloat(e.target.value))}
                          size="sm"
                          className="w-20"
                    />
                    <span className="text-[10px] theme-text-muted">px</span>
                  </div>
                    </PropertyRow>
                </>
              )}
            </div>
            </PropertyGroup>

            <PropertyGroup title="Data" collapsible={false}>
              <div className="space-y-1">
                <label className="text-xs font-medium theme-text-muted">Data Binding</label>
                <Input
                value={element.dataBinding || ''}
                onChange={(e) => onUpdate('dataBinding', e.target.value)}
                placeholder="e.g., invoice.items"
                  size="sm"
              />
              <p className="text-xs theme-text-muted mt-1">
                Data field containing the rows array
              </p>
            </div>
            </PropertyGroup>

            <PropertyGroup title="Size" collapsible={false}>
              <NumberField
                label="Table Width (pt)"
                value={typeof element.width === 'number' ? element.width : 400}
                onValueChange={(value) => onUpdate('width', value)}
                disabled={element.width === '100%'}
              />
              <div className="mt-2">
                <Checkbox
                  id="table-width-100"
                  checked={element.width === '100%'}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onUpdate('width', '100%')
                      onUpdate('x', 0)
                    } else {
                      onUpdate('width', 400)
                    }
                  }}
                  label="100% Width (fit to container)"
                />
              </div>
              {element.width === '100%' && (
                <p className="text-xs theme-text-muted mt-1">
                  X will be fixed at 0 when width is 100%
                </p>
              )}
            </PropertyGroup>

            <PropertyGroup title="Print Condition" collapsible={false}>
              <Input
                value={element.printCondition || ''}
                onChange={(e) => onUpdate('printCondition', e.target.value || null)}
                placeholder="Ex: items.length > 0"
                size="sm"
              />
              <p className="text-xs theme-text-muted mt-1">
                Leave empty to always print
              </p>
            </PropertyGroup>
          </div>
        )}

        {/* Columns Tab */}
        {activeTab === 'columns' && (
          <div className="flex flex-col h-full -mt-4 -mx-4">
            <div className="sticky top-[-16px] bg-white z-10 border-b theme-border px-4 pt-4 pb-4 shadow-sm">
              <div className="flex items-center justify-between">
              <label className="block text-xs font-medium theme-text">
                Columns ({(element.columns || []).length})
              </label>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const columns = element.columns || []
                  const newColumn = {
                    header: `Column ${columns.length + 1}`,
                    field: `field${columns.length + 1}`,
                    width: 100,
                      alignment: 'left',
                      verticalAlignment: 'center',
                      headerAlignment: 'left',
                      headerVerticalAlignment: 'center'
                  }
                  onUpdate('columns', [...columns, newColumn])
                }}
              >
                <Icon name="plus" size="xs" />
                Add
              </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-3">
              {(element.columns || []).map((column: Record<string, unknown>, index: number) => {
                
                const normalizedColumn = {
                  alignment: 'left',
                  verticalAlignment: 'center',
                  headerAlignment: 'left',
                  headerVerticalAlignment: 'center',
                  ...column
                }
                return (
                <div key={index} className="p-3 theme-bg-tertiary rounded-lg border theme-border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold theme-text">
                      Column {index + 1}
                    </span>
                    <IconButton
                      icon="trash"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const columns = [...(element.columns || [])]
                        columns.splice(index, 1)
                        onUpdate('columns', columns)
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      tooltip="Remove column"
                    />
                  </div>

                  <div className="space-y-2">
                    {/* Header */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium theme-text-muted">Header</label>
                      <Input
                        value={normalizedColumn.header || ''}
                        onChange={(e) => updateColumn(index, 'header', e.target.value)}
                        placeholder="Column name"
                        size="sm"
                      />
                    </div>

                    {/* Field */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium theme-text-muted">Field</label>
                      <Input
                        value={normalizedColumn.field || ''}
                        onChange={(e) => updateColumn(index, 'field', e.target.value)}
                        placeholder="nome.campo"
                        size="sm"
                      />
                    </div>

                    {/* Width */}
                    <NumberField
                      label="Width (pt)"
                        value={normalizedColumn.width || 100}
                      onValueChange={(value) => updateColumn(index, 'width', value)}
                      />

                    {/* Alignments */}
                    <div>
                      <label className="block text-xs font-medium theme-text mb-2">
                        Alignment
                      </label>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {/* Header Alignment */}
                        <div>
                          <label className="block text-xs theme-text-secondary mb-1.5">Header</label>
                          <div className="flex gap-1">
                        <button
                              onClick={() => updateColumn(index, 'headerAlignment', 'left')}
                              className={`w-8 h-8 flex items-center justify-center border rounded transition ${
                                (normalizedColumn.headerAlignment || 'left') === 'left'
                                  ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                                  : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                          }`}
                              title="Align left"
                        >
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <rect x="2" y="3" width="12" height="2" />
                                <rect x="2" y="7" width="8" height="2" />
                                <rect x="2" y="11" width="10" height="2" />
                              </svg>
                        </button>
                        <button
                              onClick={() => updateColumn(index, 'headerAlignment', 'center')}
                              className={`w-8 h-8 flex items-center justify-center border rounded transition ${
                                normalizedColumn.headerAlignment === 'center'
                                  ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                                  : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                          }`}
                              title="Center"
                            >
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <rect x="2" y="3" width="12" height="2" />
                                <rect x="4" y="7" width="8" height="2" />
                                <rect x="3" y="11" width="10" height="2" />
                              </svg>
                        </button>
                        <button
                              onClick={() => updateColumn(index, 'headerAlignment', 'right')}
                              className={`w-8 h-8 flex items-center justify-center border rounded transition ${
                                normalizedColumn.headerAlignment === 'right'
                                  ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                                  : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                          }`}
                              title="Align right"
                        >
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <rect x="2" y="3" width="12" height="2" />
                                <rect x="6" y="7" width="8" height="2" />
                                <rect x="4" y="11" width="10" height="2" />
                              </svg>
                        </button>
                      </div>
                    </div>

                        {/* Content Alignment */}
                        <div>
                          <label className="block text-xs theme-text-secondary mb-1.5">Content</label>
                          <div className="flex gap-1">
                            <button
                              onClick={() => updateColumn(index, 'alignment', 'left')}
                              className={`w-8 h-8 flex items-center justify-center border rounded transition ${
                                (normalizedColumn.alignment || 'left') === 'left'
                                  ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                                  : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                              }`}
                              title="Align left"
                            >
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <rect x="2" y="3" width="12" height="2" />
                                <rect x="2" y="7" width="8" height="2" />
                                <rect x="2" y="11" width="10" height="2" />
                              </svg>
                            </button>
                            <button
                              onClick={() => updateColumn(index, 'alignment', 'center')}
                              className={`w-8 h-8 flex items-center justify-center border rounded transition ${
                                normalizedColumn.alignment === 'center'
                                  ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                                  : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                              }`}
                              title="Center"
                            >
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <rect x="2" y="3" width="12" height="2" />
                                <rect x="4" y="7" width="8" height="2" />
                                <rect x="3" y="11" width="10" height="2" />
                              </svg>
                            </button>
                            <button
                              onClick={() => updateColumn(index, 'alignment', 'right')}
                              className={`w-8 h-8 flex items-center justify-center border rounded transition ${
                                normalizedColumn.alignment === 'right'
                                  ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                                  : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                              }`}
                              title="Align right"
                            >
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <rect x="2" y="3" width="12" height="2" />
                                <rect x="6" y="7" width="8" height="2" />
                                <rect x="4" y="11" width="10" height="2" />
                              </svg>
                            </button>
                  </div>
                </div>
                      </div>
                    </div>
                  </div>
                </div>
                )
              })}

              {(!element.columns || element.columns.length === 0) && (
                <div className="text-center py-8 px-4 theme-bg-tertiary rounded-lg border-2 border-dashed theme-border">
                  <p className="text-xs theme-text-muted mb-2">No columns defined</p>
                  <p className="text-xs text-gray-400">Clique em "Add" para criar</p>
                </div>
              )}
              </div>
            </div>
          </div>
        )}

        {/* Styles Tab */}
        {activeTab === 'styles' && (
          <div className="space-y-4">
            
            <div className="p-4 theme-bg-tertiary border theme-border rounded-lg">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Icon name="grid" size="sm" />
                Header
              </h3>
              
              {/* Cor */}
              <div className="mb-3">
                <label className="text-xs font-medium theme-text-muted mb-2 block">Color</label>
                <div className="flex gap-3">
                  <ColorField
                    label="Background"
                    value={element.style?.headerBackground && element.style?.headerBackground !== 'transparent' ? element.style?.headerBackground : '#f0f0f0'}
                    onValueChange={(value) => onStyleUpdate('headerBackground', value)}
                        disabled={!element.style?.headerBackground || element.style?.headerBackground === 'transparent'}
                  />
                  <ColorField
                    label="Text"
                    value={element.style?.headerColor || '#000000'}
                    onValueChange={(value) => onStyleUpdate('headerColor', value)}
                  />
                    </div>
                <div className="mt-2">
                  <Checkbox
                    id="header-transparent-bg"
                    checked={!element.style?.headerBackground || element.style?.headerBackground === 'transparent'}
                    onChange={(e) => onStyleUpdate('headerBackground', e.target.checked ? 'transparent' : '#f0f0f0')}
                    label="Transparent Background"
                  />
                </div>
                </div>

              <Divider className="my-3" />

              {/* Font */}
              <div className="mb-3">
                <label className="text-xs font-medium theme-text-muted mb-2 block">Font</label>
                <div className="flex items-center gap-1">
                  <Select
                    value={element.style?.headerFontFamily || 'Helvetica'}
                    onChange={(e) => onStyleUpdate('headerFontFamily', e.target.value)}
                    options={[
                      { value: 'Helvetica', label: 'Helvetica' },
                      { value: 'Helvetica-Bold', label: 'Helvetica Bold' },
                      { value: 'Times', label: 'Times New Roman' },
                      { value: 'Courier', label: 'Courier New' },
                    ]}
                    className="flex-1 min-w-0"
                  />
                  
                  <Input
                    type="number"
                    min={6}
                    max={72}
                    value={element.style?.headerFontSize || 12}
                    onChange={(e) => onStyleUpdate('headerFontSize', parseFloat(e.target.value))}
                    size="sm"
                    className="w-11 text-center"
                  />
                  
                  <IconButton
                    icon="minus"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const currentSize = element.style?.headerFontSize || 12
                      onStyleUpdate('headerFontSize', Math.max(6, currentSize - 1))
                    }}
                    tooltip="Decrease size"
                  />
                  <IconButton
                    icon="plus"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const currentSize = element.style?.headerFontSize || 12
                      onStyleUpdate('headerFontSize', Math.min(72, currentSize + 1))
                    }}
                    tooltip="Increase size"
                  />
                </div>
                </div>

              <Divider className="my-3" />

              {/* Paddings do Header */}
              <div className="mb-3">
                <label className="text-xs font-medium theme-text-muted mb-2 block">Paddings</label>
                <div className="space-y-2">
                  <Checkbox
                      id="header-same-padding"
                      checked={element.style?.headerSamePadding || false}
                      onChange={(e) => {
                        const checked = e.target.checked
                        if (checked) {
                          const value = element.style?.headerPaddingLeft || element.style?.headerPadding || 5
                          onStyleUpdate('headerPaddingLeft', value)
                          onStyleUpdate('headerPaddingRight', value)
                          onStyleUpdate('headerPaddingTop', value)
                          onStyleUpdate('headerPaddingBottom', value)
                          onStyleUpdate('headerPadding', value)
                          onStyleUpdate('headerSamePadding', true)
                        } else {
                          onStyleUpdate('headerSamePadding', false)
                        }
                      }}
                    label="Use the same value for every padding"
                  />
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <NumberField
                      label="Left"
                        value={element.style?.headerPaddingLeft || element.style?.headerPadding || 5}
                      onValueChange={(value) => {
                          if (element.style?.headerSamePadding) {
                            onStyleUpdate('headerPaddingLeft', value)
                            onStyleUpdate('headerPaddingRight', value)
                            onStyleUpdate('headerPaddingTop', value)
                            onStyleUpdate('headerPaddingBottom', value)
                            onStyleUpdate('headerPadding', value)
                          } else {
                            onStyleUpdate('headerPaddingLeft', value)
                          }
                        }}
                      min={0}
                      step={1}
                    />
                    <NumberField
                      label="Right"
                        value={element.style?.headerPaddingRight || element.style?.headerPadding || 5}
                      onValueChange={(value) => onStyleUpdate('headerPaddingRight', value)}
                      min={0}
                      step={1}
                        disabled={element.style?.headerSamePadding || false}
                      />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField
                      label="Top"
                        value={element.style?.headerPaddingTop || element.style?.headerPadding || 5}
                      onValueChange={(value) => onStyleUpdate('headerPaddingTop', value)}
                      min={0}
                      step={1}
                        disabled={element.style?.headerSamePadding || false}
                      />
                    <NumberField
                      label="Bottom"
                        value={element.style?.headerPaddingBottom || element.style?.headerPadding || 5}
                      onValueChange={(value) => onStyleUpdate('headerPaddingBottom', value)}
                      min={0}
                      step={1}
                        disabled={element.style?.headerSamePadding || false}
                      />
                  </div>
                </div>
              </div>

              <Divider className="my-3" />

              {/* Borders do Header */}
              <div className="mb-3">
                <label className="text-xs font-medium theme-text-muted mb-2 block">Borders</label>
                
                {/* Border Preview Box */}
                <div className="mb-3 p-3 theme-bg-tertiary border theme-border rounded">
                  <div className="flex items-center justify-center mb-2">
                    <div 
                      className="w-32 h-32 bg-white"
                      style={{
                        borderTopWidth: `${getHeaderBorderValues().top}px`,
                        borderTopStyle: element.style?.borderStyle ?? 'solid',
                        borderTopColor: element.style?.headerBorderColor ?? element.style?.borderColor ?? '#cccccc',
                        borderRightWidth: `${getHeaderBorderValues().right}px`,
                        borderRightStyle: element.style?.borderStyle ?? 'solid',
                        borderRightColor: element.style?.headerBorderColor ?? element.style?.borderColor ?? '#cccccc',
                        borderBottomWidth: `${getHeaderBorderValues().bottom}px`,
                        borderBottomStyle: element.style?.borderStyle ?? 'solid',
                        borderBottomColor: element.style?.headerBorderColor ?? element.style?.borderColor ?? '#cccccc',
                        borderLeftWidth: `${getHeaderBorderValues().left}px`,
                        borderLeftStyle: element.style?.borderStyle ?? 'solid',
                        borderLeftColor: element.style?.headerBorderColor ?? element.style?.borderColor ?? '#cccccc',
                      }}
                    />
                  </div>
                  <div className="text-xs theme-text-muted text-center space-y-0.5">
                    <div>Top: {getHeaderBorderValues().top}px</div>
                    <div>Right: {getHeaderBorderValues().right}px</div>
                    <div>Bottom: {getHeaderBorderValues().bottom}px</div>
                    <div>Left: {getHeaderBorderValues().left}px</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <PropertyRow label="Pen Color:" labelWidth="lg">
                    <ColorInput
                    value={element.style?.headerBorderColor || element.style?.borderColor || '#cccccc'}
                    onChange={(e) => onStyleUpdate('headerBorderColor', e.target.value)}
                  />
                  </PropertyRow>

                  <PropertyRow label="Pen Width:" labelWidth="lg">
                    <Input
                    type="number"
                      value={element.style?.headerBorderWidth ?? element.style?.borderWidth ?? 1}
                      onChange={(e) => onStyleUpdate('headerBorderWidth', parseFloat(e.target.value) || 0)}
                      size="sm"
                      className="w-24"
                      min={0}
                      max={10}
                      step={0.5}
                    />
                  </PropertyRow>
                  
                  {/* Default border styles */}
                  <div className="pt-2">
                    <label className="text-xs font-medium theme-text-muted mb-2 block">Quick border setup:</label>
                    <div className="flex gap-2">
                      {/* All borders */}
                      <button
                        onClick={() => onStyleUpdate('headerBorderType', 'row')}
                        className={`w-10 h-10 border-2 rounded hover:bg-blue-50 transition flex items-center justify-center ${
                          element.style?.headerBorderType === 'row'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-400'
                        }`}
                        title="All borders"
                      >
                        <div className="w-6 h-6 border-2 border-gray-600"></div>
                      </button>
                      
                      {/* All columns bordered */}
                      <button
                        onClick={() => onStyleUpdate('headerBorderType', 'columns')}
                        className={`w-10 h-10 border-2 rounded hover:bg-blue-50 transition flex items-center justify-center ${
                          element.style?.headerBorderType === 'columns'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-400'
                        }`}
                        title="All columns bordered"
                      >
                        <div className="w-6 h-6 grid grid-cols-2 gap-0">
                          <div className="border-2 border-gray-600"></div>
                          <div className="border-2 border-gray-600"></div>
                          <div className="border-2 border-gray-600"></div>
                          <div className="border-2 border-gray-600"></div>
                        </div>
                      </button>
                      
                      {/* No borders */}
                      <button
                        onClick={() => onStyleUpdate('headerBorderType', 'none')}
                        className={`w-10 h-10 border-2 rounded hover:bg-blue-50 transition flex items-center justify-center ${
                          !element.style?.headerBorderType || element.style?.headerBorderType === 'none'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-400'
                        }`}
                        title="No borders"
                      >
                        <div className="w-6 h-6 border-2 border-dashed theme-border"></div>
                      </button>
                      
                      {/* Top and bottom */}
                      <button
                        onClick={() => onStyleUpdate('headerBorderType', 'top-bottom')}
                        className={`w-10 h-10 border-2 rounded hover:bg-blue-50 transition flex items-center justify-center ${
                          element.style?.headerBorderType === 'top-bottom'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-400'
                        }`}
                        title="Top and bottom borders"
                      >
                        <div className="w-6 h-6 border-t-2 border-b-2 border-gray-600"></div>
                      </button>
                      
                      {/* Left and right */}
                      <button
                        onClick={() => onStyleUpdate('headerBorderType', 'left-right')}
                        className={`w-10 h-10 border-2 rounded hover:bg-blue-50 transition flex items-center justify-center ${
                          element.style?.headerBorderType === 'left-right'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-400'
                        }`}
                        title="Left and right borders"
                      >
                        <div className="w-6 h-6 border-l-2 border-r-2 border-gray-600"></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            
            <div className="p-4 theme-bg-tertiary border theme-border rounded-lg">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Icon name="grid" size="sm" />
                Cells
              </h3>
              
              {/* Cor */}
              <div className="mb-3">
                <label className="text-xs font-medium theme-text-muted mb-2 block">Color</label>
                <div className="flex gap-3">
                  <ColorField
                    label="Background"
                      value={element.style?.cellBackground && element.style?.cellBackground !== 'transparent' ? element.style?.cellBackground : '#ffffff'}
                    onValueChange={(value) => onStyleUpdate('cellBackground', value)}
                      disabled={!element.style?.cellBackground || element.style?.cellBackground === 'transparent'}
                    />
                  <ColorField
                    label="Text"
                      value={element.style?.cellColor || '#000000'}
                    onValueChange={(value) => onStyleUpdate('cellColor', value)}
                    />
                  </div>
                <div className="mt-2">
                  <Checkbox
                    id="cell-transparent-bg"
                    checked={!element.style?.cellBackground || element.style?.cellBackground === 'transparent'}
                    onChange={(e) => onStyleUpdate('cellBackground', e.target.checked ? 'transparent' : '#ffffff')}
                    label="Transparent Background"
                  />
                </div>
              </div>

              <Divider className="my-3" />

              {/* Font */}
              <div className="mb-3">
                <label className="text-xs font-medium theme-text-muted mb-2 block">Font</label>
                <div className="flex items-center gap-1">
                  <Select
                    value={element.style?.fontFamily || 'Helvetica'}
                    onChange={(e) => onStyleUpdate('fontFamily', e.target.value)}
                    options={[
                      { value: 'Helvetica', label: 'Helvetica' },
                      { value: 'Helvetica-Bold', label: 'Helvetica Bold' },
                      { value: 'Times', label: 'Times New Roman' },
                      { value: 'Courier', label: 'Courier New' },
                    ]}
                    className="flex-1 min-w-0"
                  />
                  
                  <Input
                    type="number"
                    min={6}
                    max={72}
                    value={element.style?.fontSize || 10}
                    onChange={(e) => onStyleUpdate('fontSize', parseFloat(e.target.value))}
                    size="sm"
                    className="w-11 text-center"
                  />
                  
                  <IconButton
                    icon="minus"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const currentSize = element.style?.fontSize || 10
                      onStyleUpdate('fontSize', Math.max(6, currentSize - 1))
                    }}
                    tooltip="Decrease size"
                  />
                  <IconButton
                    icon="plus"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const currentSize = element.style?.fontSize || 10
                      onStyleUpdate('fontSize', Math.min(72, currentSize + 1))
                    }}
                    tooltip="Increase size"
                  />
                </div>
                </div>

              <Divider className="my-3" />

              {/* Paddings das Cells */}
              <div className="mb-3">
                <label className="text-xs font-medium theme-text-muted mb-2 block">Paddings</label>
                <div className="space-y-2">
                  <Checkbox
                      id="cell-same-padding"
                      checked={element.style?.cellSamePadding || false}
                      onChange={(e) => {
                        const checked = e.target.checked
                        if (checked) {
                          const value = element.style?.cellPaddingLeft || element.style?.cellPadding || 5
                          onStyleUpdate('cellPaddingLeft', value)
                          onStyleUpdate('cellPaddingRight', value)
                          onStyleUpdate('cellPaddingTop', value)
                          onStyleUpdate('cellPaddingBottom', value)
                          onStyleUpdate('cellPadding', value)
                          onStyleUpdate('cellSamePadding', true)
                        } else {
                          onStyleUpdate('cellSamePadding', false)
                        }
                      }}
                    label="Use the same value for every padding"
                  />
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <NumberField
                      label="Left"
                        value={element.style?.cellPaddingLeft || element.style?.cellPadding || 5}
                      onValueChange={(value) => {
                          if (element.style?.cellSamePadding) {
                            onStyleUpdate('cellPaddingLeft', value)
                            onStyleUpdate('cellPaddingRight', value)
                            onStyleUpdate('cellPaddingTop', value)
                            onStyleUpdate('cellPaddingBottom', value)
                            onStyleUpdate('cellPadding', value)
                          } else {
                            onStyleUpdate('cellPaddingLeft', value)
                          }
                        }}
                      min={0}
                      step={1}
                    />
                    <NumberField
                      label="Right"
                        value={element.style?.cellPaddingRight || element.style?.cellPadding || 5}
                      onValueChange={(value) => onStyleUpdate('cellPaddingRight', value)}
                      min={0}
                      step={1}
                        disabled={element.style?.cellSamePadding || false}
                      />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField
                      label="Top"
                        value={element.style?.cellPaddingTop || element.style?.cellPadding || 5}
                      onValueChange={(value) => onStyleUpdate('cellPaddingTop', value)}
                      min={0}
                      step={1}
                        disabled={element.style?.cellSamePadding || false}
                      />
                    <NumberField
                      label="Bottom"
                        value={element.style?.cellPaddingBottom || element.style?.cellPadding || 5}
                      onValueChange={(value) => onStyleUpdate('cellPaddingBottom', value)}
                      min={0}
                      step={1}
                        disabled={element.style?.cellSamePadding || false}
                      />
                </div>
              </div>
            </div>

              <Divider className="my-3" />

              {/* Borders das Cells */}
              <div className="mb-3">
                <h4 className="text-xs font-medium theme-text-secondary mb-2">Borders</h4>
                
                {/* Border Preview Box */}
                <div className="mb-3 p-3 theme-bg-tertiary border theme-border rounded">
                  <div className="flex items-center justify-center mb-2">
                    <div 
                      className="w-32 h-32 bg-white"
                      style={{
                        borderTopWidth: `${getCellBorderValues().top}px`,
                        borderTopStyle: element.style?.borderStyle ?? 'solid',
                        borderTopColor: element.style?.borderColor ?? '#cccccc',
                        borderRightWidth: `${getCellBorderValues().right}px`,
                        borderRightStyle: element.style?.borderStyle ?? 'solid',
                        borderRightColor: element.style?.borderColor ?? '#cccccc',
                        borderBottomWidth: `${getCellBorderValues().bottom}px`,
                        borderBottomStyle: element.style?.borderStyle ?? 'solid',
                        borderBottomColor: element.style?.borderColor ?? '#cccccc',
                        borderLeftWidth: `${getCellBorderValues().left}px`,
                        borderLeftStyle: element.style?.borderStyle ?? 'solid',
                        borderLeftColor: element.style?.borderColor ?? '#cccccc',
                      }}
                    />
                  </div>
                  <div className="text-xs theme-text-muted text-center space-y-0.5">
                    <div>Top: {getCellBorderValues().top}px</div>
                    <div>Right: {getCellBorderValues().right}px</div>
                    <div>Bottom: {getCellBorderValues().bottom}px</div>
                    <div>Left: {getCellBorderValues().left}px</div>
                  </div>
                </div>
              
                <div className="space-y-3">
                  <PropertyRow label="Pen Color:" labelWidth="lg">
                    <ColorInput
                      value={element.style?.borderColor ?? '#cccccc'}
                    onChange={(e) => onStyleUpdate('borderColor', e.target.value)}
                  />
                  </PropertyRow>

                  <PropertyRow label="Pen Style:" labelWidth="lg">
                    <div className="flex gap-1 flex-1">
                      {[
                        { value: 'solid', label: 'Solid' },
                        { value: 'dashed', label: 'Dashed' },
                        { value: 'dotted', label: 'Dotted' }
                      ].map((style) => (
                        <Button
                          key={style.value}
                          variant={((element.style?.borderStyle || 'solid') === style.value) ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => onStyleUpdate('borderStyle', style.value)}
                          className="flex-1 flex-col py-2"
                        >
                          <div 
                            className="h-0 mx-auto w-full"
                            style={{ 
                              borderTopWidth: '2px',
                              borderTopStyle: style.value as 'solid' | 'dashed' | 'dotted',
                              borderTopColor: (element.style?.borderStyle || 'solid') === style.value ? '#fff' : '#666'
                            }}
                          />
                          <span className="mt-1 block text-[10px]">
                            {style.label}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </PropertyRow>

                  <PropertyRow label="Pen Width:" labelWidth="lg">
                    <Input
                    type="number"
                      value={element.style?.borderWidth ?? 1}
                      onChange={(e) => {
                        const newWidth = parseFloat(e.target.value) || 0
                        onStyleUpdate('borderWidth', newWidth)
                      }}
                      size="sm"
                      className="w-24"
                      min={0}
                      max={10}
                      step={0.5}
                    />
                  </PropertyRow>
                  
                  {/* Default border styles */}
                  <div className="pt-2">
                    <label className="block text-xs theme-text-secondary mb-2">Quick border setup:</label>
                    <div className="flex gap-2">
                      {/* All borders */}
                      <button
                        onClick={() => onStyleUpdate('cellBorderType', 'row')}
                        className={`w-10 h-10 border-2 rounded hover:bg-blue-50 transition flex items-center justify-center ${
                          element.style?.cellBorderType === 'row'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-400'
                        }`}
                        title="All borders"
                      >
                        <div className="w-6 h-6 border-2 border-gray-600"></div>
                      </button>
                      
                      {/* All cells bordered */}
                      <button
                        onClick={() => onStyleUpdate('cellBorderType', 'cells')}
                        className={`w-10 h-10 border-2 rounded hover:bg-blue-50 transition flex items-center justify-center ${
                          element.style?.cellBorderType === 'cells'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-400'
                        }`}
                        title="All cells bordered"
                      >
                        <div className="w-6 h-6 grid grid-cols-2 gap-0">
                          <div className="border-2 border-gray-600"></div>
                          <div className="border-2 border-gray-600"></div>
                          <div className="border-2 border-gray-600"></div>
                          <div className="border-2 border-gray-600"></div>
              </div>
                      </button>
                      
                      {/* No borders */}
                      <button
                        onClick={() => onStyleUpdate('cellBorderType', 'none')}
                        className={`w-10 h-10 border-2 rounded hover:bg-blue-50 transition flex items-center justify-center ${
                          !element.style?.cellBorderType || element.style?.cellBorderType === 'none'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-400'
                        }`}
                        title="No borders"
                      >
                        <div className="w-6 h-6 border-2 border-dashed theme-border"></div>
                      </button>
                      
                      {/* Top and bottom */}
                      <button
                        onClick={() => onStyleUpdate('cellBorderType', 'top-bottom')}
                        className={`w-10 h-10 border-2 rounded hover:bg-blue-50 transition flex items-center justify-center ${
                          element.style?.cellBorderType === 'top-bottom'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-400'
                        }`}
                        title="Top and bottom borders"
                      >
                        <div className="w-6 h-6 border-t-2 border-b-2 border-gray-600"></div>
                      </button>
                      
                      {/* Left and right */}
                      <button
                        onClick={() => onStyleUpdate('cellBorderType', 'left-right')}
                        className={`w-10 h-10 border-2 rounded hover:bg-blue-50 transition flex items-center justify-center ${
                          element.style?.cellBorderType === 'left-right'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-400'
                        }`}
                        title="Left and right borders"
                      >
                        <div className="w-6 h-6 border-l-2 border-r-2 border-gray-600"></div>
                      </button>
            </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </>
  )
}

/**
 * Component to display and edit group properties
 */
function GroupPropertiesPanel({ 
  group, 
  location 
}: { 
  group: ElementGroup; 
  location: 'body' | 'header' | 'footer' | 'bodyBackground' | 'summary' 
}): JSX.Element {
  const { t } = useTranslation()
  const { updateGroup, deleteGroup, selectGroup, template } = useTemplateStore()
  
  // Buscar elementos do grupo (incluindo filhos de container)
  const groupElements = (() => {
    let allElements: Element[] = []
    
    if (location === 'header' && template.pageSettings.header) {
      allElements = template.pageSettings.header.elements
    } else if (location === 'footer' && template.pageSettings.footer) {
      allElements = template.pageSettings.footer.elements
    } else if (location === 'bodyBackground' && template.pageSettings.bodyBackground) {
      allElements = template.pageSettings.bodyBackground.elements
    } else if (location === 'summary' && template.summaryPage) {
      allElements = template.summaryPage.elements
    } else {
      allElements = template.page || []
    }
    
    const flat = flattenElements(allElements)
    return flat.filter(el => group.elementIds.includes(el.id))
  })()
  
  return (
    <div className="w-[300px] bg-slate-900 border-l border-slate-800 flex flex-col h-full shrink-0 select-none">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
          <h2 className="text-sm font-semibold text-slate-200">Propriedades do Grupo</h2>
        </div>
        <button
          onClick={() => selectGroup(null)}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
          title="Fechar"
        >
          <Icon name="close" size="xs" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {/* Identificação / Nome */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-300">Nome do Grupo</span>
            <span className="text-[10px] text-slate-500 font-mono">#{group.id}</span>
          </div>
          <div className="flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-purple-500 transition">
            <input
              type="text"
              value={group.name}
              onChange={(e) => updateGroup(group.id, { name: e.target.value }, location)}
              className="w-full bg-transparent text-slate-200 text-xs focus:outline-none"
              placeholder="Nome do grupo..."
            />
          </div>
        </div>

        {/* Print Condition */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-300">Condição de Impressão</span>
            <span className="text-[10px] text-purple-400 font-mono">printCondition</span>
          </div>
          <textarea
            value={group.printCondition || ''}
            onChange={(e) => updateGroup(group.id, { printCondition: e.target.value || null }, location)}
            placeholder="Ex: invoice.total > 1000"
            rows={3}
            className="w-full bg-slate-950/70 border border-slate-800 rounded-lg p-2.5 text-xs text-purple-200 font-mono focus:outline-none focus:border-purple-500 transition resize-none"
          />
          <div className="mt-1.5 p-2 rounded bg-slate-950/50 border border-slate-800/80 text-[10px] text-slate-400 space-y-1">
            <div className="text-slate-300 font-medium">Expressões suportadas na lib:</div>
            <div className="font-mono text-purple-300">• invoice.total &gt; 1000</div>
            <div className="font-mono text-purple-300">• status == 'APROVADO'</div>
            <div className="font-mono text-purple-300">• _pageNumber == 1</div>
            <div className="font-mono text-purple-300">• tipo in ['A', 'B']</div>
            <div className="text-slate-500 italic">Deixe vazio para imprimir sempre.</div>
          </div>
        </div>

        {/* Elementos do Grupo */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-300">Elementos no Grupo</span>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded font-mono">
              {groupElements.length} itens
            </span>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {groupElements.map((element) => (
              <div
                key={element.id}
                className="px-2.5 py-1.5 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs flex items-center justify-between"
              >
                <div className="truncate flex-1 min-w-0 pr-2">
                  <div className="font-mono text-slate-200 text-[11px] truncate">#{element.id}</div>
                  <div className="text-[9px] text-slate-500 uppercase">{element.type}</div>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {Math.round(element.x)},{Math.round(element.y)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ação Desagrupar */}
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              deleteGroup(group.id, location)
              selectGroup(null)
            }}
            className="w-full py-1.5 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Icon name="ungroup" size="xs" />
            <span>{t.properties.ungroupElements}</span>
          </button>
          <p className="text-[10px] text-slate-500 mt-1.5 text-center">
            {t.properties.ungroupNotice}
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Component to display and edit summary page properties
 */
function SummaryPropertiesPanel(): JSX.Element {
  const { t } = useTranslation()
  const { template, updateSummaryPage } = useTemplateStore()
  
  if (!template.summaryPage) {
    return (
      <div className="w-[360px] theme-bg-secondary border-l theme-border p-4">
        <p className="text-sm theme-text-muted">{t.properties.summaryNotExist}</p>
      </div>
    )
  }
  
  return (
    <div className="w-[360px] theme-bg-secondary border-l theme-border p-4 overflow-y-auto">
      <h2 className="text-sm font-semibold theme-text border-b pb-3 mb-3">
        {t.properties.summaryProperties}
      </h2>
      
      {/* Info */}
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center">
          <svg 
            className="w-4 h-4 mr-2 text-green-600" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-xs font-semibold text-green-800">
            {t.properties.summaryProperties}
          </span>
        </div>
        <p className="text-xs text-green-700 mt-1">
          {t.properties.summaryDescription}
        </p>
      </div>
      
      {/* Print Condition */}
      <div className="mb-4">
        <label className="block text-xs font-semibold theme-text mb-2">
          {t.properties.printCondition}
        </label>
        <textarea
          value={template.summaryPage.printCondition || ''}
          onChange={(e) => updateSummaryPage({ printCondition: e.target.value || undefined })}
          className="w-full px-3 py-2 text-xs border theme-border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono"
          placeholder="Ex: invoice.showSummary === true"
          rows={3}
        />
        <p className="text-xs theme-text-muted mt-1">
          {t.properties.printConditionHelp}
        </p>
        <ul className="text-xs theme-text-muted mt-1 ml-4 list-disc">
          <li><code>invoice.showSummary === true</code></li>
          <li><code>items.length &gt; 10</code></li>
          <li><code>invoice.total &gt; 1000</code></li>
        </ul>
      </div>
    </div>
  )
}

/**
 * Component to display and edit header properties
 */
function HeaderPropertiesPanel(): JSX.Element {
  const { t } = useTranslation()
  const { template, updateHeader } = useTemplateStore()
  
  if (!template.pageSettings.header) {
    return (
      <div className="w-[360px] theme-bg-secondary border-l theme-border flex flex-col h-full">
        <PanelHeader title={t.properties.headerProperties} />
        <div className="p-4">
        <p className="text-sm theme-text-muted">{t.properties.headerNotExist}</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="w-[360px] theme-bg-secondary border-l theme-border flex flex-col h-full">
      <PanelHeader title={t.properties.headerProperties} subtitle={t.properties.headerTopPage} />
      
      <div className="flex-1 overflow-y-auto p-4">
      {/* Info */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-center">
          <svg 
            className="w-4 h-4 mr-2 text-blue-600" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
          </svg>
          <span className="text-xs font-semibold text-blue-800">
            Header
          </span>
        </div>
        <p className="text-xs text-blue-700 mt-1">
          {t.properties.headerTopPage}
        </p>
      </div>
      
      {/* Altura */}
      <div className="mb-4">
        <NumberField
          label={t.properties.heightPt}
          value={template.pageSettings.header.height}
          onValueChange={(value) => updateHeader({ height: value || 0 })}
          min={0}
          step={1}
        />
      </div>
      
      {/* Print Condition */}
      <div className="mb-4">
        <label className="block text-xs font-semibold theme-text mb-2">
          {t.properties.printCondition}
        </label>
        <TextArea
          value={template.pageSettings.header.printCondition || ''}
          onChange={(e) => updateHeader({ printCondition: e.target.value || undefined })}
          placeholder="Ex: pageNumber > 1"
          rows={3}
          className="font-mono"
        />
        <p className="text-xs theme-text-muted mt-1">
          {t.properties.printConditionHelp}
        </p>
        <ul className="text-xs theme-text-muted mt-1 ml-4 list-disc">
          <li><code>pageNumber &gt; 1</code></li>
          <li><code>invoice.showHeader === true</code></li>
        </ul>
      </div>
      </div>
    </div>
  )
}

/**
 * Component to display and edit footer properties
 */
function FooterPropertiesPanel(): JSX.Element {
  const { t } = useTranslation()
  const { template, updateFooter } = useTemplateStore()
  
  if (!template.pageSettings.footer) {
    return (
      <div className="w-[360px] theme-bg-secondary border-l theme-border flex flex-col h-full">
        <PanelHeader title={t.properties.footerProperties} />
        <div className="p-4">
        <p className="text-sm theme-text-muted">{t.properties.footerNotExist}</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="w-[360px] theme-bg-secondary border-l theme-border flex flex-col h-full">
      <PanelHeader title={t.properties.footerProperties} subtitle={t.properties.footerBottomPage} />
      
      <div className="flex-1 overflow-y-auto p-4">
      {/* Info */}
      <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg">
        <div className="flex items-center">
          <Icon name="section" size="sm" className="mr-2 text-orange-600 dark:text-orange-400" />
          <span className="text-xs font-semibold text-orange-800 dark:text-orange-300">
            Footer
          </span>
        </div>
        <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
          {t.properties.footerBottomPage}
        </p>
      </div>
      
      {/* Altura */}
      <div className="mb-4">
        <NumberField
          label={t.properties.heightPt}
          value={template.pageSettings.footer.height}
          onValueChange={(value) => updateFooter({ height: value || 0 })}
          min={0}
          step={1}
        />
      </div>
      
      {/* Print Condition */}
      <div className="mb-4">
        <label className="block text-xs font-semibold theme-text mb-2">
          {t.properties.printCondition}
        </label>
        <TextArea
          value={template.pageSettings.footer.printCondition || ''}
          onChange={(e) => updateFooter({ printCondition: e.target.value || undefined })}
          placeholder="Ex: pageNumber > 1"
          rows={3}
          className="font-mono"
        />
        <p className="text-xs theme-text-muted mt-1">
          {t.properties.printConditionHelp}
        </p>
        <ul className="text-xs theme-text-muted mt-1 ml-4 list-disc">
          <li><code>pageNumber &gt; 1</code></li>
          <li><code>invoice.showFooter === true</code></li>
        </ul>
      </div>
      </div>
    </div>
  )
}

/**
 * Component to display and edit body background properties
 */
function BackgroundPropertiesPanel(): JSX.Element {
  const { t } = useTranslation()
  const { template, updateBodyBackground } = useTemplateStore()
  
  if (!template.pageSettings.bodyBackground) {
    return (
      <div className="w-[360px] theme-bg-secondary border-l theme-border p-4">
        <p className="text-sm theme-text-muted">{t.properties.backgroundNotExist}</p>
      </div>
    )
  }
  
  return (
    <div className="w-[360px] theme-bg-secondary border-l theme-border p-4 overflow-y-auto">
      <h2 className="text-sm font-semibold theme-text border-b pb-3 mb-3">
        {t.properties.backgroundProperties}
      </h2>
      
      {/* Info */}
      <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex items-center">
          <svg 
            className="w-4 h-4 mr-2 text-purple-600" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 3l18 18" />
          </svg>
          <span className="text-xs font-semibold text-purple-800">
            {t.properties.backgroundProperties}
          </span>
        </div>
        <p className="text-xs text-purple-700 mt-1">
          {t.properties.backgroundDescription}
        </p>
      </div>
      
      {/* Print Condition */}
      <div className="mb-4">
        <label className="block text-xs font-semibold theme-text mb-2">
          {t.properties.printCondition}
        </label>
        <textarea
          value={template.pageSettings.bodyBackground.printCondition || ''}
          onChange={(e) => updateBodyBackground({ printCondition: e.target.value || undefined })}
          className="w-full px-3 py-2 text-xs border theme-border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono"
          placeholder="Ex: invoice.showBackground === true"
          rows={3}
        />
        <p className="text-xs theme-text-muted mt-1">
          {t.properties.printConditionHelp}
        </p>
        <ul className="text-xs theme-text-muted mt-1 ml-4 list-disc">
          <li><code>invoice.showBackground === true</code></li>
          <li><code>pageNumber === 1</code></li>
        </ul>
      </div>
    </div>
  )
}

// Componente para editar elementos filhos do Loop
interface LoopChildEditorProps {
  child: Element
  index: number
  loopId: string
  location: ElementLocation | null
}

function LoopChildEditor({ child, index, loopId, location }: LoopChildEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { updateLoopChildElement, deleteLoopChildElement } = useTemplateStore()
  
  const getElementIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      text: 'text',
      static_text: 'static-text',
      image: 'image',
      rectangle: 'rectangle',
      line: 'line',
      table: 'table',
      barcode: 'barcode',
      loop: 'loop',
    }
    return iconMap[type] || 'rectangle'
  }
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-mono">{index + 1}</span>
          <span className="text-primary-500"><Icon name={getElementIcon(child.type) as IconName} size="sm" /></span>
          <span className="text-xs font-medium text-gray-700 capitalize">{child.type.replace('_', ' ')}</span>
          {child.value && (
            <span className="text-xs text-gray-400 truncate max-w-[80px]">
              {child.value.substring(0, 15)}{child.value.length > 15 ? '...' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              deleteLoopChildElement(loopId, child.id, location)
            }}
            className="p-1 text-red-500 hover:bg-red-100 rounded"
            title="Remove"
          >
            <Icon name="trash" size="xs" />
          </button>
          <svg 
            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {/* Content expandido */}
      {isExpanded && (
        <div className="p-3 border-t border-gray-100 space-y-3">
          
          <div className="grid grid-cols-2 gap-2">
            <NumberField
              label="X"
                value={child.x || 0}
              onValueChange={(value) => updateLoopChildElement(loopId, child.id, { x: value }, location)}
            />
            <NumberField
              label="Y"
                value={child.y || 0}
              onValueChange={(value) => updateLoopChildElement(loopId, child.id, { y: value }, location)}
              />
          </div>
          
          {/* Tamanho (para elementos com width/height) */}
          {(child.type !== 'line') && (
            <div className="grid grid-cols-2 gap-2">
              <NumberField
                label="Width"
                  value={child.width || 100}
                onValueChange={(value) => updateLoopChildElement(loopId, child.id, { width: value }, location)}
              />
              <NumberField
                label="Height"
                  value={child.height || 20}
                onValueChange={(value) => updateLoopChildElement(loopId, child.id, { height: value }, location)}
                />
            </div>
          )}
          
          {/* Valor (para texto) */}
          {(child.type === 'text' || child.type === 'static_text') && (
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500">Valor/Binding</label>
              <Input
                value={child.value || ''}
                onChange={(e) => updateLoopChildElement(loopId, child.id, { value: e.target.value }, location)}
                placeholder={child.type === 'text' ? 'field' : 'Text'}
                size="sm"
                className="font-mono"
              />
            </div>
          )}
          
          {/* Linha (width, height) */}
          {child.type === 'line' && (
            <div className="grid grid-cols-2 gap-2">
              <NumberField
                label="Width"
                value={child.width ?? (child.x2 ? child.x2 - child.x : 100)}
                onValueChange={(value) => updateLoopChildElement(loopId, child.id, { width: value }, location)}
              />
              <NumberField
                label="Height"
                value={child.height ?? (child.y2 ? child.y2 - child.y : 0)}
                onValueChange={(value) => updateLoopChildElement(loopId, child.id, { height: value }, location)}
              />
            </div>
          )}
          
          {/* Font Size (para texto) */}
          {(child.type === 'text' || child.type === 'static_text') && (
            <div className="grid grid-cols-2 gap-2">
              <NumberField
                label="Font Size"
                  value={child.style?.fontSize || 10}
                onValueChange={(value) => updateLoopChildElement(loopId, child.id, { 
                  style: { ...child.style, fontSize: value } 
                  }, location)}
              />
              <ColorField
                label="Cor"
                  value={child.style?.color || '#000000'}
                onValueChange={(value) => updateLoopChildElement(loopId, child.id, { 
                  style: { ...child.style, color: value } 
                  }, location)}
                />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Painel de propriedades completo para elementos filhos do loop
interface LoopChildPropertiesPanelProps {
  loopId: string
  child: Element
  location: ElementLocation | null
  loopElement: Element
}

function LoopChildPropertiesPanel({ loopId, child, location, loopElement }: LoopChildPropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState<string>('appearance')
  const { updateLoopChildElement, deleteLoopChildElement, clearLoopChildSelection } = useTemplateStore()
  
  
  const loopWidth = loopElement?.width || 400
  const loopHeight = loopElement?.height || 50
  const isContainerParent = loopElement?.type === 'container'
  
  const handleUpdate = (field: string, value: string | number | boolean | object | null) => {
    updateLoopChildElement(loopId, child.id, { [field]: value }, location)
  }
  
  const handleStyleUpdate = (field: string, value: string | number | boolean | null) => {
    updateLoopChildElement(loopId, child.id, { 
      style: { ...child.style, [field]: value } 
    }, location)
  }

  const handleFullUpdate = (updates: Partial<Element>) => {
    updateLoopChildElement(loopId, child.id, updates, location)
  }
  
  // Tabs baseadas no tipo do elemento
  const getTabs = () => {
    if (child.type === 'text' || child.type === 'static_text') {
      return [
        { id: 'appearance', label: 'Appearance' },
        { id: 'font', label: 'Font' },
      ]
    } else if (child.type === 'rectangle') {
      return [
        { id: 'appearance', label: 'Appearance' },
        { id: 'borders', label: 'Borders' },
      ]
    } else if (child.type === 'line') {
      return [
        { id: 'appearance', label: 'Appearance' },
        { id: 'style', label: 'Style' },
      ]
    } else if (child.type === 'image') {
      return [
        { id: 'appearance', label: 'Appearance' },
        { id: 'image', label: 'Image' },
      ]
    }
    return [{ id: 'appearance', label: 'Appearance' }]
  }

  const tabs = getTabs()
  
  const getIcon = () => {
    switch (child.type) {
      case 'text':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7h16M9 20v-13M15 20v-13" />
          </svg>
        )
      case 'static_text':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7h16M9 20v-13M15 20v-13" />
            <circle cx="18" cy="18" r="3" fill="currentColor" stroke="none" />
          </svg>
        )
      case 'image':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        )
      case 'rectangle':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
          </svg>
        )
      case 'line':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 19l14-14" />
          </svg>
        )
      default:
        console.log("clicked")
        return null
    }
  }
  
  return (
    <div className="w-[360px] theme-bg-secondary border-l theme-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b theme-border flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => clearLoopChildSelection()}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500"
              title="Back to Loop"
            >
              <Icon name="arrow-left" size="sm" />
            </button>
            <span className="text-purple-500">{getIcon()}</span>
            <span className="text-sm font-semibold theme-text capitalize">{child.type.replace('_', ' ')}</span>
          </div>
          <button
            onClick={() => {
              deleteLoopChildElement(loopId, child.id, location)
              clearLoopChildSelection()
            }}
            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
            title="Delete element"
          >
            <Icon name="trash" size="sm" />
          </button>
        </div>
        
        <div className="text-xs text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded">
          Loop child element: <span className="font-mono">{loopId}</span>
        </div>
      </div>
      
      {/* Tabs */}
      <TabBar
        tabs={tabs.map((tab) => ({
          id: tab.id,
          label: tab.label,
        }))}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="border-b theme-border flex-shrink-0"
      />
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* APPEARANCE TAB - Comum a todos */}
        {activeTab === 'appearance' && (
          <>
            {/* ID */}
            <div className="space-y-1 mb-3">
              <label className="text-xs font-medium theme-text-muted">ID</label>
              <Input
                value={child.id}
                onChange={(e) => handleUpdate('id', e.target.value)}
                size="sm"
              />
            </div>
            
            <Divider className="my-3" />
            
            <PropertyGroup title="Position (relative to loop)" collapsible={false}>
              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  label="X"
                    value={child.x || 0}
                  onValueChange={(value) => handleUpdate('x', value)}
                />
                <NumberField
                  label="Y"
                    value={child.y || 0}
                  onValueChange={(value) => handleUpdate('y', value)}
                  />
                </div>
            </PropertyGroup>
            
            {child.type !== 'line' && (
              <>
                <PropertyGroup title="Size" collapsible={false}>
                  {/* Info do tamanho do loop */}
                  <div className="mb-3 p-2 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded text-xs">
                    <span className="text-purple-700 dark:text-purple-300">
                      📐 Loop Dimensions: <span className="font-mono font-medium">{loopWidth}×{loopHeight}</span>px
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <NumberField
                        label="Width"
                        value={typeof child.width === 'string' ? 0 : (child.width || 100)}
                        onValueChange={(value) => handleUpdate('width', value)}
                        disabled={child.width === '100%'}
                      />
                      {child.type === 'rectangle' && (
                        <>
                          <Checkbox
                            id="loop-child-width-100"
                              checked={child.width === '100%'}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  handleFullUpdate({ width: '100%', x: 0 })
                                } else {
                                  handleUpdate('width', 100)
                                }
                              }}
                            label="100%"
                            className="mt-2"
                            />
                          {child.width === '100%' && (
                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                              = {loopWidth}px (loop width)
                            </p>
                          )}
                        </>
                      )}
                    </div>
                    <div>
                      <NumberField
                        label="Height"
                        value={typeof child.height === 'string' ? 0 : (child.height || 20)}
                        onValueChange={(value) => handleUpdate('height', value)}
                        disabled={child.height === '100%'}
                      />
                      {child.type === 'rectangle' && (
                        <>
                          <Checkbox
                            id="loop-child-height-100"
                              checked={child.height === '100%'}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  handleFullUpdate({ height: '100%', y: 0 })
                                } else {
                                  handleUpdate('height', 100)
                                }
                              }}
                            label="100%"
                            className="mt-2"
                            />
                          {child.height === '100%' && (
                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                              = {loopHeight}px (loop height)
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </PropertyGroup>
              </>
            )}
            
            {/* Linha: Size */}
            {child.type === 'line' && (
              <PropertyGroup title="Size" collapsible={false}>
                  <div className="grid grid-cols-2 gap-3">
                  <NumberField
                    label="Width"
                    value={child.width ?? (child.x2 ? child.x2 - child.x : 100)}
                    onValueChange={(value) => handleUpdate('width', value)}
                  />
                  <NumberField
                    label="Height"
                    value={child.height ?? (child.y2 ? child.y2 - child.y : 0)}
                    onValueChange={(value) => handleUpdate('height', value)}
                      />
                    </div>
                <p className="text-xs theme-text-muted mt-2">
                  Line is drawn from (X, Y) to (X + Width, Y + Height)
                </p>
              </PropertyGroup>
            )}
            
            {/* Valor/Texto para texto e static_text */}
            {(child.type === 'text' || child.type === 'static_text') && (
              <PropertyGroup title={child.type === 'text' ? 'Data Binding' : 'Texto'} collapsible={false}>
                <TextArea
                  value={child.type === 'text'
                    ? (isContainerParent ? (child.dataBinding || '') : (child.value || ''))
                    : (child.value || '')}
                  onChange={(e) => {
                    if (child.type === 'text') {
                      handleUpdate(isContainerParent ? 'dataBinding' : 'value', e.target.value)
                      return
                    }
                    handleUpdate('value', e.target.value)
                  }}
                  placeholder={child.type === 'text'
                    ? (isContainerParent ? 'customer.name' : 'field_name')
                    : 'Enter text...'}
                  rows={3}
                  className="font-mono"
                />
                {child.type === 'text' && (
                  <p className="text-xs theme-text-muted mt-1">
                    {isContainerParent
                      ? 'Use full data path from template context (e.g., customer.name)'
                      : 'Use only the property name (e.g., name, value, price)'}
                  </p>
                )}
              </PropertyGroup>
            )}
            
            {child.type === 'rectangle' && (
              <PropertyGroup title="Color" collapsible={false}>
                <div className="space-y-3">
                  <PropertyRow label="Fill" labelWidth="lg">
                    <ColorInput
                      value={child.style?.fillColor || '#4a90e2'}
                      onChange={(e) => handleStyleUpdate('fillColor', e.target.value)}
                      disabled={!child.style?.fillColor}
                    />
                  </PropertyRow>
                  <Checkbox
                    id="loop-child-rect-transparent"
                      checked={!child.style?.fillColor}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleStyleUpdate('fillColor', null)
                        } else {
                          handleStyleUpdate('fillColor', '#4a90e2')
                        }
                      }}
                    label="Transparent"
                    />
                </div>
              </PropertyGroup>
            )}
          </>
        )}
        
        {/* FONT TAB - Para texto */}
        {activeTab === 'font' && (child.type === 'text' || child.type === 'static_text') && (
          <>
            <PropertyGroup title="Font" collapsible={false}>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium theme-text-muted">Family</label>
                  <Select
                    value={child.style?.fontFamily || 'Helvetica'}
                    onChange={(e) => handleStyleUpdate('fontFamily', e.target.value)}
                    options={[
                      { value: 'Helvetica', label: 'Helvetica' },
                      { value: 'Times-Roman', label: 'Times Roman' },
                      { value: 'Courier', label: 'Courier' },
                    ]}
                  />
                </div>
                <NumberField
                  label="Size"
                    value={child.style?.fontSize || 12}
                  onValueChange={(value) => handleStyleUpdate('fontSize', value)}
                  />
            </div>
            
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium theme-text-muted">Weight</label>
                  <Select
                  value={child.style?.fontWeight || 'normal'}
                  onChange={(e) => handleStyleUpdate('fontWeight', e.target.value)}
                    options={[
                      { value: 'normal', label: 'Normal' },
                      { value: 'bold', label: 'Bold' },
                    ]}
                  />
              </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium theme-text-muted">Style</label>
                  <Select
                  value={child.style?.fontStyle || 'normal'}
                  onChange={(e) => handleStyleUpdate('fontStyle', e.target.value)}
                    options={[
                      { value: 'normal', label: 'Normal' },
                      { value: 'italic', label: 'Italic' },
                    ]}
                  />
              </div>
            </div>
            </PropertyGroup>
            
            <PropertyGroup title="Colors" collapsible={false}>
              <div className="space-y-3">
                <PropertyRow label="Text" labelWidth="lg">
                  <ColorInput
                    value={child.style?.color || '#000000'}
                    onChange={(e) => handleStyleUpdate('color', e.target.value)}
                  />
                </PropertyRow>
                <PropertyRow label="Background" labelWidth="lg">
                  <ColorInput
                      value={child.style?.backgroundColor || '#ffffff'}
                      onChange={(e) => handleStyleUpdate('backgroundColor', e.target.value)}
                      disabled={!child.style?.backgroundColor}
                  />
                </PropertyRow>
                <Checkbox
                  id="loop-child-bg-none"
                        checked={!child.style?.backgroundColor}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleStyleUpdate('backgroundColor', null)
                          } else {
                            handleStyleUpdate('backgroundColor', '#ffffff')
                          }
                        }}
                  label="None"
                      />
                  </div>
            </PropertyGroup>
            
            <div>
              <h3 className="text-xs font-semibold theme-text mb-2">Alignment</h3>
              <div className="flex gap-1">
                {['left', 'center', 'right'].map(align => (
                  <button
                    key={align}
                    onClick={() => handleStyleUpdate('alignment', align)}
                    className={`flex-1 px-2 py-2 text-xs border rounded transition ${
                      (child.style?.alignment || 'left') === align
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'theme-border bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {align === 'left' ? '◀ Left' : align === 'center' ? '◆ Center' : '▶ Right'}
                  </button>
                ))}
              </div>
            </div>
            
            <PropertyGroup title="Multiline" collapsible={false}>
              <Checkbox
                id="loop-child-multiline"
                  checked={child.style?.multiline || false}
                  onChange={(e) => handleStyleUpdate('multiline', e.target.checked)}
                label="Multiline text"
                />
            
            {child.style?.multiline && (
                <NumberField
                  label="Line Height"
                  value={child.style?.lineHeight || 1.2}
                  onValueChange={(value) => handleStyleUpdate('lineHeight', value)}
                  step={0.1}
                  min={0.5}
                  max={3}
                />
              )}
            </PropertyGroup>
          </>
        )}
        
        
        {activeTab === 'borders' && child.type === 'rectangle' && (
          <>
            <div>
              <h3 className="text-xs font-semibold theme-text mb-2">Borders</h3>
              
              {/* Preview */}
              <div className="mb-3 p-3 theme-bg-tertiary border theme-border rounded flex items-center justify-center">
                <div 
                  className="w-24 h-24"
                  style={{
                    backgroundColor: child.style?.fillColor || '#4a90e2',
                    borderWidth: `${child.style?.borderWidth || 1}px`,
                    borderStyle: child.style?.borderStyle || 'solid',
                    borderColor: child.style?.borderColor || '#000000',
                    borderRadius: `${child.style?.cornerRadius || 0}px`,
                  }}
                />
              </div>
              
              <div className="space-y-3">
                <PropertyRow label="Color:" labelWidth="lg">
                  <ColorInput
                    value={child.style?.borderColor || '#000000'}
                    onChange={(e) => handleStyleUpdate('borderColor', e.target.value)}
                  />
                </PropertyRow>
                
                <PropertyRow label="Style:" labelWidth="lg">
                  <div className="flex gap-1 flex-1">
                    {[
                      { value: 'solid', label: 'Solid' },
                      { value: 'dashed', label: 'Dashed' },
                      { value: 'dotted', label: 'Dotted' }
                    ].map((style) => (
                      <Button
                        key={style.value}
                        variant={((child.style?.borderStyle || 'solid') === style.value) ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handleStyleUpdate('borderStyle', style.value)}
                        className="flex-1 flex-col py-2"
                      >
                        <div 
                          className="h-0 mx-auto w-full"
                          style={{ 
                            borderTopWidth: '2px',
                            borderTopStyle: style.value as 'solid' | 'dashed' | 'dotted',
                            borderTopColor: (child.style?.borderStyle || 'solid') === style.value ? '#fff' : '#666'
                          }}
                        />
                        <span className="mt-1 block text-[10px]">{style.label}</span>
                      </Button>
                    ))}
                  </div>
                </PropertyRow>
                
                <PropertyRow label="Width:" labelWidth="lg">
                  <Input
                    type="number"
                    value={child.style?.borderWidth ?? 1}
                    onChange={(e) => handleStyleUpdate('borderWidth', parseFloat(e.target.value) || 0)}
                    size="sm"
                    className="w-24"
                    min={0}
                    max={10}
                    step={0.5}
                  />
                </PropertyRow>
                
                <PropertyRow label="Radius:" labelWidth="lg">
                  <Input
                    type="number"
                    value={child.style?.cornerRadius || 0}
                    onChange={(e) => handleStyleUpdate('cornerRadius', parseFloat(e.target.value))}
                    size="sm"
                    className="w-24"
                    min={0}
                  />
                </PropertyRow>
                
                {/* Default border styles */}
                <div className="pt-2">
                  <label className="block text-xs theme-text-secondary mb-2">Default borders:</label>
                  {(() => {
                    const bw = child.style?.borderWidth ?? 1
                    const top = child.style?.borderTopWidth ?? bw
                    const right = child.style?.borderRightWidth ?? bw
                    const bottom = child.style?.borderBottomWidth ?? bw
                    const left = child.style?.borderLeftWidth ?? bw
                    const isAll = top > 0 && right > 0 && bottom > 0 && left > 0
                    const isNone = top === 0 && right === 0 && bottom === 0 && left === 0
                    const isTopBottom = top > 0 && bottom > 0 && right === 0 && left === 0
                    const isLeftRight = left > 0 && right > 0 && top === 0 && bottom === 0
                    return (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const width = child.style?.borderWidth || 1
                            handleFullUpdate({
                              style: {
                                ...child.style,
                                borderTopWidth: width,
                                borderRightWidth: width,
                                borderBottomWidth: width,
                                borderLeftWidth: width,
                              }
                            })
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isAll ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="Todas as bordas"
                        >
                          <div className={`w-6 h-6 border-2 ${isAll ? 'border-primary-500' : 'border-gray-500'}`}></div>
                        </button>
                        
                        <button
                          onClick={() => {
                            handleFullUpdate({
                              style: {
                                ...child.style,
                                borderTopWidth: 0,
                                borderRightWidth: 0,
                                borderBottomWidth: 0,
                                borderLeftWidth: 0,
                              }
                            })
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isNone ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="Sem bordas"
                        >
                          <div className={`w-6 h-6 border-2 border-dashed ${isNone ? 'border-primary-300' : 'border-gray-300'}`}></div>
                        </button>
                        
                        <button
                          onClick={() => {
                            const width = child.style?.borderWidth || 1
                            handleFullUpdate({
                              style: {
                                ...child.style,
                                borderTopWidth: width,
                                borderRightWidth: 0,
                                borderBottomWidth: width,
                                borderLeftWidth: 0,
                              }
                            })
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isTopBottom ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="Topo e fundo"
                        >
                          <div className={`w-6 h-6 border-t-2 border-b-2 ${isTopBottom ? 'border-primary-500' : 'border-gray-500'}`}></div>
                        </button>
                        
                        <button
                          onClick={() => {
                            const width = child.style?.borderWidth || 1
                            handleFullUpdate({
                              style: {
                                ...child.style,
                                borderTopWidth: 0,
                                borderRightWidth: width,
                                borderBottomWidth: 0,
                                borderLeftWidth: width,
                              }
                            })
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isLeftRight ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="Esquerda e direita"
                        >
                          <div className={`w-6 h-6 border-l-2 border-r-2 ${isLeftRight ? 'border-primary-500' : 'border-gray-500'}`}></div>
                        </button>
                      </div>
                    )
                  })()}
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* STYLE TAB - Para linha */}
        {activeTab === 'style' && child.type === 'line' && (
          <>
            <PropertyGroup title="Estilo da Linha" collapsible={false}>
              <div className="space-y-3">
                <PropertyRow label="Color:" labelWidth="lg">
                  <ColorInput
                    value={child.style?.strokeColor || '#000000'}
                    onChange={(e) => handleStyleUpdate('strokeColor', e.target.value)}
                  />
                </PropertyRow>
                
                <PropertyRow label="Espessura:" labelWidth="lg">
                  <Input
                    type="number"
                    value={child.style?.strokeWidth || 1}
                    onChange={(e) => handleStyleUpdate('strokeWidth', parseFloat(e.target.value))}
                    size="sm"
                    className="w-24"
                    min={0.5}
                    max={20}
                    step={0.5}
                  />
                </PropertyRow>
                
                <PropertyRow label="Style:" labelWidth="lg">
                  <div className="flex gap-1 flex-1">
                    {[
                      { value: 'solid', label: 'Solid' },
                      { value: 'dashed', label: 'Dashed' },
                      { value: 'dotted', label: 'Dotted' }
                    ].map((style) => (
                      <Button
                        key={style.value}
                        variant={((child.style?.borderStyle || 'solid') === style.value) ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handleStyleUpdate('borderStyle', style.value)}
                        className="flex-1 flex-col py-2"
                      >
                        <div 
                          className="h-0 mx-auto w-full"
                          style={{ 
                            borderTopWidth: '2px',
                            borderTopStyle: style.value as 'solid' | 'dashed' | 'dotted',
                            borderTopColor: (child.style?.borderStyle || 'solid') === style.value ? '#fff' : '#666'
                          }}
                        />
                        <span className="mt-1 block text-[10px]">{style.label}</span>
                      </Button>
                    ))}
                  </div>
                </PropertyRow>
                </div>
            </PropertyGroup>
          </>
        )}
        
        {/* IMAGE TAB - Para imagem */}
        {activeTab === 'image' && child.type === 'image' && (
          <PropertyGroup title="Image Settings" collapsible={false}>
              <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium theme-text-muted">Source / Data Binding</label>
                <Input
                    value={child.source || ''}
                    onChange={(e) => handleUpdate('source', e.target.value)}
                    placeholder="campo_imagem ou URL"
                  size="sm"
                  className="font-mono"
                  />
                  <p className="text-xs theme-text-muted mt-1">
                    Use o nome do campo ou uma URL direta
                  </p>
                </div>
                
              <div className="space-y-1">
                <label className="text-xs font-medium theme-text-muted">Fit (Ajuste)</label>
                <Select
                    value={child.fit || 'contain'}
                    onChange={(e) => handleUpdate('fit', e.target.value)}
                  options={[
                    { value: 'contain', label: 'Contain (maintain aspect ratio, fit)' },
                    { value: 'cover', label: 'Cover (cobrir, cortar)' },
                    { value: 'fill', label: 'Fill (esticar)' },
                  ]}
                />
                </div>
                
              <div className="space-y-1">
                <label className="text-xs font-medium theme-text-muted">Alignment</label>
                <Select
                    value={child.alignment || 'center'}
                    onChange={(e) => handleUpdate('alignment', e.target.value)}
                  options={[
                    { value: 'center', label: 'Centro' },
                    { value: 'top', label: 'Topo' },
                    { value: 'bottom', label: 'Baixo' },
                    { value: 'left', label: 'Esquerda' },
                    { value: 'right', label: 'Direita' },
                  ]}
                />
                </div>
              </div>
          </PropertyGroup>
        )}
      </div>
    </div>
  )
}
