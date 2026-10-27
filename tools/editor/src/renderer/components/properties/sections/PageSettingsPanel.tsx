import { useTemplateStore } from '../../../store/templateStore'
import { useTranslation } from '../../../i18n'
import { WatermarkSettingsSection } from './WatermarkSettingsSection'

export function PageSettingsPanel() {
  const { t } = useTranslation()
  const store = useTemplateStore()
  const template = store.template

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

        {/* Marca d'Água (Watermark) */}
        <WatermarkSettingsSection />

        <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] leading-relaxed">
          {t.sidebar.useSidebar}
        </div>
      </div>
    </div>
  )
}
