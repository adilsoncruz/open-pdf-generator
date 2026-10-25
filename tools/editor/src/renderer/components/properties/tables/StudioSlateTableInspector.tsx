import { useState, useEffect } from 'react'
import { useTranslation } from '../../../i18n'
import type { ElementInspectorProps } from '../types'

export function StudioSlateTableInspector({ element, onUpdate, onStyleUpdate, parentName }: ElementInspectorProps) {
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


