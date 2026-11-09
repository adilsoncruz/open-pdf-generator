import { useTranslation } from '../../../i18n'
import type { Element } from '../../../store/templateStore'

interface TableColumnsTabProps {
  element: Element
  onUpdate: (field: string | Record<string, unknown>, value?: unknown) => void
}

export function TableColumnsTab({ element, onUpdate }: TableColumnsTabProps) {
  const { t } = useTranslation()
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

  return (
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
  )
}
