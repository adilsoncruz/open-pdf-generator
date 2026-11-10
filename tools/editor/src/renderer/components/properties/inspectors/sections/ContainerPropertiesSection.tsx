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
            </div>
          )
        })()}
    </>
  )
}
