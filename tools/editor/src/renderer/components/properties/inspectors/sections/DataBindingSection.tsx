import type { Element } from '../../../../store/templateStore'
import { useTranslation } from '../../../../i18n'

interface DataBindingSectionProps {
  element: Element
  onUpdate: (field: string | Record<string, any>, value?: any) => void
}

export function DataBindingSection({ element, onUpdate }: DataBindingSectionProps) {
  const { t } = useTranslation()
  const supportsDataBinding = ['text', 'rich_text', 'image', 'barcode', 'link', 'loop'].includes(element.type)

  return (
    <>
        {/* 5. Data Binding Section (Apenas para elementos com suporte a dados dinâmicos) */}
        {supportsDataBinding && (
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
        {element.type !== 'page_break' && (
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
        )}
    </>
  )
}
