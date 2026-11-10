import { useTranslation } from '../../../../i18n'
import type { Element } from '../../../../store/templateStore'

export interface TableDataRowStyleSectionProps {
  element: Element
  onStyleUpdate: (field: string | Record<string, unknown>, value?: unknown) => void
}

export function TableDataRowStyleSection({ element, onStyleUpdate }: TableDataRowStyleSectionProps) {
  const { t } = useTranslation()
  const tableStyle = element.style || {}

  const cellColor = (tableStyle.cellColor as string) || '#000000'
  const cellBg = (tableStyle.cellBackground as string) || '#ffffff'
  const isCellBgTransparent = !tableStyle.cellBackground || tableStyle.cellBackground === 'transparent'
  const cellFontSize = (tableStyle.fontSize as number) || 10
  const cellFontFamily = (tableStyle.fontFamily as string) || 'Helvetica'
  const cellPadding = (tableStyle.cellPadding as number) ?? 5
  const alternateRowBg = (tableStyle.alternateRowBackground as string) || '#f8fafc'
  const hasAlternateRowBg = Boolean(tableStyle.alternateRowBackground && tableStyle.alternateRowBackground !== 'transparent')

  return (
    <div>
      <div className="text-xs font-semibold text-slate-200 mb-2">{t.properties.cellsAndRows}</div>
      <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 space-y-2.5 text-xs">
        {/* Background */}
        <div className="flex items-center justify-between">
          <span className="text-slate-400">{t.properties.backgroundColor}</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              aria-label={t.properties.backgroundColor}
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
            aria-label={t.properties.textColor}
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
                aria-label={t.properties.alternateColor}
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
  )
}
