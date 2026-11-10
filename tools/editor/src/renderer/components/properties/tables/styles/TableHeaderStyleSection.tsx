import { useTranslation } from '../../../../i18n'
import type { Element } from '../../../../store/templateStore'

export interface TableHeaderStyleSectionProps {
  element: Element
  onStyleUpdate: (field: string | Record<string, unknown>, value?: unknown) => void
}

export function TableHeaderStyleSection({ element, onStyleUpdate }: TableHeaderStyleSectionProps) {
  const { t } = useTranslation()
  const tableStyle = element.style || {}

  const headerBg = (tableStyle.headerBackground as string) || '#f0f0f0'
  const isHeaderBgTransparent = !tableStyle.headerBackground || tableStyle.headerBackground === 'transparent'
  const headerColor = (tableStyle.headerColor as string) || '#000000'
  const headerFontSize = (tableStyle.headerFontSize as number) || 12
  const headerFontFamily = (tableStyle.headerFontFamily as string) || 'Helvetica'
  const headerPadding = (tableStyle.headerPadding as number) ?? 5

  return (
    <div>
      <div className="text-xs font-semibold text-slate-200 mb-2">{t.properties.tableHeader}</div>
      <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 space-y-2.5 text-xs">
        {/* Background */}
        <div className="flex items-center justify-between">
          <span className="text-slate-400">{t.properties.backgroundColor}</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              aria-label={t.properties.backgroundColor}
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
            aria-label={t.properties.textColor}
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
  )
}
