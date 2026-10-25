import { useTranslation } from '../../../i18n'
import type { Element } from '../../../../store/templateStore'

interface TableStylesTabProps {
  element: Element
  onStyleUpdate: (field: string | Record<string, unknown>, value?: unknown) => void
}

export function TableStylesTab({ element, onStyleUpdate }: TableStylesTabProps) {
  const { t } = useTranslation()
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
  )
}
