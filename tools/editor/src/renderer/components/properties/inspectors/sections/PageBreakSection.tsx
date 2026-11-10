import type { Element } from '../../../../store/templateStore'
import { useTranslation } from '../../../../i18n'

interface PageBreakSectionProps {
  element: Element
  onUpdate: (field: string | Record<string, any>, value?: any) => void
}

export function PageBreakSection({ element, onUpdate }: PageBreakSectionProps) {
  const { t } = useTranslation()

  const quickPresets = [
    { label: '${pageNumber == 1}', value: '${pageNumber == 1}' },
    { label: 'total > 1000', value: 'total > 1000' },
    { label: 'items.length > 5', value: 'items.length > 5' },
  ]

  return (
    <div className="space-y-3">
      <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 space-y-1.5">
        <div className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
          <span>✂ Quebra de Página (Page Break)</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Força o início de uma nova página no PDF a partir deste ponto. Conteúdos subsequentes iniciarão no topo da próxima página.
        </p>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-200">
            {t.properties.printCondition || 'Condição de Quebra'}
          </label>
          <span className="text-[10px] text-indigo-400 font-mono">opcional</span>
        </div>

        <div className="flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2 focus-within:border-indigo-500 transition">
          <input
            type="text"
            value={element.printCondition || ''}
            onChange={(e) => onUpdate('printCondition', e.target.value || null)}
            placeholder="Ex: total > 1000 ou ${items.length > 5}"
            className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none"
          />
          {element.printCondition && (
            <button
              type="button"
              onClick={() => onUpdate('printCondition', null)}
              className="text-slate-500 hover:text-slate-300 text-xs ml-1"
              title="Limpar condição"
            >
              ✕
            </button>
          )}
        </div>

        <p className="text-[10px] text-slate-400 leading-tight">
          Se definida, a quebra de página só ocorrerá se a expressão for avaliada como verdadeira. Se falsa, o fluxo segue na mesma folha.
        </p>

        <div className="pt-1 flex flex-wrap gap-1.5">
          {quickPresets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => onUpdate('printCondition', preset.value)}
              className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-indigo-600/30 hover:border-indigo-500/40 border border-slate-700/60 text-[10px] font-mono text-slate-300 transition cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
