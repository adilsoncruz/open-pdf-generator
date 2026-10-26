import React from 'react'
import { useTemplateStore } from '../../store/templateStore'
import { useTranslation } from '../../i18n'
import { Icon } from '../atoms'

export function DocumentPropertiesContent() {
  const { t } = useTranslation()
  const { template, updatePageSettings, updateMetadata } = useTemplateStore()
  const { margins, size, orientation } = template.pageSettings
  const { name, description, author } = template.metadata || { name: '', description: '', author: '' }

  const handleSizeChange = (newSize: string) => {
    updatePageSettings({ size: newSize })
  }

  const handleOrientationChange = (newOrientation: string) => {
    updatePageSettings({ orientation: newOrientation })
  }

  const handleMarginChange = (side: 'top' | 'right' | 'bottom' | 'left', val: number) => {
    updatePageSettings({
      margins: {
        ...margins,
        [side]: Math.max(0, val),
      },
    })
  }

  return (
    <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs">
      {/* 1. Metadados do Template */}
      <div>
        <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Icon name="file-text" size="xs" className="text-indigo-400" />
          <span>{t.sidebar.templateInfo}</span>
        </div>
        <div className="space-y-2">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">{t.sidebar.documentName}</label>
            <input
              type="text"
              value={name || ''}
              onChange={(e) => updateMetadata({ name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none transition"
              placeholder={t.sidebar.documentName}
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">{t.sidebar.description}</label>
            <textarea
              value={description || ''}
              onChange={(e) => updateMetadata({ description: e.target.value })}
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none transition resize-none"
              placeholder={t.sidebar.description}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">{t.sidebar.author}</label>
              <input
                type="text"
                value={author || ''}
                onChange={(e) => updateMetadata({ author: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none transition"
                placeholder={t.sidebar.author}
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">{t.sidebar.version}</label>
              <input
                type="text"
                value={template.version || '1.0'}
                readOnly
                className="w-full bg-slate-950/50 border border-slate-800/60 rounded px-2 py-1 text-xs text-slate-500 cursor-not-allowed font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800/80 my-2" />

      {/* 2. Formato e Orientação da Página */}
      <div>
        <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Icon name="settings" size="xs" className="text-indigo-400" />
          <span>{t.sidebar.pageSettings}</span>
        </div>

        <div className="space-y-2">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">{t.sidebar.paperSize}</label>
            <select
              value={size || 'A4'}
              onChange={(e) => handleSizeChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="A4">A4 (595 × 842 pt)</option>
              <option value="PORTRAIT">Letter (612 × 792 pt)</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">{t.sidebar.orientation}</label>
            <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => handleOrientationChange('portrait')}
                className={`py-1.5 rounded text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                  (orientation || 'portrait') === 'portrait'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{t.sidebar.portrait}</span>
              </button>
              <button
                type="button"
                onClick={() => handleOrientationChange('landscape')}
                className={`py-1.5 rounded text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                  orientation === 'landscape'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{t.sidebar.landscape}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800/80 my-2" />

      {/* 3. Margens da Folha */}
      <div>
        <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Icon name="layers" size="xs" className="text-indigo-400" />
          <span>{t.sidebar.margins}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Top */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 focus-within:border-indigo-500 transition">
            <span className="text-[10px] text-slate-500 block mb-0.5">{t.sidebar.top}</span>
            <div className="flex items-center">
              <input
                type="number"
                value={margins.top ?? 30}
                onChange={(e) => handleMarginChange('top', parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 font-mono">pt</span>
            </div>
          </div>

          {/* Bottom */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 focus-within:border-indigo-500 transition">
            <span className="text-[10px] text-slate-500 block mb-0.5">{t.sidebar.bottom}</span>
            <div className="flex items-center">
              <input
                type="number"
                value={margins.bottom ?? 30}
                onChange={(e) => handleMarginChange('bottom', parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 font-mono">pt</span>
            </div>
          </div>

          {/* Left */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 focus-within:border-indigo-500 transition">
            <span className="text-[10px] text-slate-500 block mb-0.5">{t.sidebar.left}</span>
            <div className="flex items-center">
              <input
                type="number"
                value={margins.left ?? 30}
                onChange={(e) => handleMarginChange('left', parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 font-mono">pt</span>
            </div>
          </div>

          {/* Right */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 focus-within:border-indigo-500 transition">
            <span className="text-[10px] text-slate-500 block mb-0.5">{t.sidebar.right}</span>
            <div className="flex items-center">
              <input
                type="number"
                value={margins.right ?? 30}
                onChange={(e) => handleMarginChange('right', parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 font-mono">pt</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800/80 my-2" />

      {/* 4. Resumo das Seções */}
      <div>
        <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2">
          {t.sidebar.activeSections}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-950/60 border border-slate-800/80 rounded-lg">
            <span className="text-slate-300 text-xs">{t.sidebar.header}</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                template.pageSettings.header
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {template.pageSettings.header ? `${template.pageSettings.header.height}pt` : t.sidebar.inactive}
            </span>
          </div>

          <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-950/60 border border-slate-800/80 rounded-lg">
            <span className="text-slate-300 text-xs">{t.sidebar.page}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {template.page?.length || 0} {t.sidebar.elementsTitle.toLowerCase()}
            </span>
          </div>

          <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-950/60 border border-slate-800/80 rounded-lg">
            <span className="text-slate-300 text-xs">{t.sidebar.footer}</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                template.pageSettings.footer
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {template.pageSettings.footer ? `${template.pageSettings.footer.height}pt` : t.sidebar.inactive}
            </span>
          </div>

          <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-950/60 border border-slate-800/80 rounded-lg">
            <span className="text-slate-300 text-xs">{t.sidebar.background}</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                template.pageSettings.bodyBackground
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {template.pageSettings.bodyBackground ? t.sidebar.active : t.sidebar.inactive}
            </span>
          </div>

          <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-950/60 border border-slate-800/80 rounded-lg">
            <span className="text-slate-300 text-xs">{t.sidebar.summary}</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                template.summaryPage
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {template.summaryPage ? t.sidebar.active : t.sidebar.inactive}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
