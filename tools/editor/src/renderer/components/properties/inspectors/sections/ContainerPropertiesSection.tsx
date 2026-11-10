import type { Element } from '../../../../store/templateStore'
import { useTranslation } from '../../../../i18n'

interface ContainerPropertiesSectionProps {
  element: Element
  onUpdate: (field: string | Record<string, any>, value?: any) => void
}

export function ContainerPropertiesSection({ element, onUpdate }: ContainerPropertiesSectionProps) {
  const { t } = useTranslation()
  return (
    <>
        {/* Container specific */}
        {element.type === 'container' && (() => {
          const isFixed = element.heightMode === 'fixed' || element.autoHeight === false

          return (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-200">{t.properties.containerSettings}</div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">{t.properties.containerName}</label>
                <input
                  type="text"
                  value={(element.name as string) || ''}
                  onChange={(e) => onUpdate('name', e.target.value)}
                  placeholder="Container 1"
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Comportamento de Altura</label>
                <div className="grid grid-cols-2 gap-1.5 bg-slate-950/70 p-1 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdate({
                        heightMode: 'auto',
                        autoHeight: true,
                      })
                    }}
                    className={`py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
                      !isFixed
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Auto-Height
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdate({
                        heightMode: 'fixed',
                        autoHeight: false,
                      })
                    }}
                    className={`py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
                      isFixed
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Fixed-Height
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                  {!isFixed
                    ? 'O container se expande automaticamente conforme novos elementos são adicionados.'
                    : 'Tamanho fixo. Impede a inserção de elementos que ultrapassem a altura do container.'}
                </p>
              </div>

              {/* Quebra de Página antes deste Container (estilo Jasper isStartNewPage) */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Iniciar em Nova Página</span>
                    <span className="text-[10px] text-slate-400 block">Força quebra antes deste bloco</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!element.pageBreakBefore}
                      onChange={(e) => onUpdate('pageBreakBefore', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {element.pageBreakBefore && (
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-indigo-300">Condição de Quebra</label>
                      <span className="text-[10px] text-indigo-400 font-mono">opcional</span>
                    </div>
                    <div className="flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500 transition">
                      <input
                        type="text"
                        value={element.pageBreakCondition || ''}
                        onChange={(e) => onUpdate('pageBreakCondition', e.target.value || null)}
                        placeholder="Ex: total > 1000 ou ${pageNumber == 1}"
                        className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none"
                      />
                      {element.pageBreakCondition && (
                        <button
                          type="button"
                          onClick={() => onUpdate('pageBreakCondition', null)}
                          className="text-slate-500 hover:text-slate-300 text-xs ml-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Se preenchido, a quebra de página só ocorrerá quando a condição for verdadeira.
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {(['pageNumber == 1', 'total > 1000', 'items.length > 5'] as const).map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => onUpdate('pageBreakCondition', val)}
                          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-indigo-600/30 border border-slate-700/60 text-[9px] font-mono text-slate-300 transition cursor-pointer"
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })()}
    </>
  )
}
