import type { CSSProperties } from 'react'
import { useTranslation } from '../../../../i18n'
import type { Element } from '../../../../store/templateStore'

export interface TableBorderStyleSectionProps {
  element: Element
  onStyleUpdate: (field: string | Record<string, unknown>, value?: unknown) => void
}

export function TableBorderStyleSection({ element, onStyleUpdate }: TableBorderStyleSectionProps) {
  const { t } = useTranslation()
  const tableStyle = element.style || {}

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
              borderStyle: borderStyle as CSSProperties['borderStyle'],
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
              aria-label={t.properties.borderColor}
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
  )
}
