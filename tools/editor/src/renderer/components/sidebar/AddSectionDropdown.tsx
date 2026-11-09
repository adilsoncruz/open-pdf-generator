import React from 'react'
import { useTemplateStore, type ElementLocation } from '../../store/templateStore'
import { Icon } from '../atoms'
import { useTranslation } from '../../i18n'

interface AddSectionDropdownProps {
  show: boolean
  onToggle: (e: React.MouseEvent) => void
  onClose: () => void
  currentSection: ElementLocation
}

export function AddSectionDropdown({
  show,
  onToggle,
  onClose,
  currentSection,
}: AddSectionDropdownProps) {
  const { t } = useTranslation()
  const {
    template,
    addHeader,
    addFooter,
    addBodyBackground,
    addSummaryPage,
    addElement,
    setCurrentSection,
  } = useTemplateStore()

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
        title={t.common.add}
      >
        <Icon name="plus" size="xs" />
      </button>

      {show && (
        <>
          <div
            className="fixed inset-0 z-40 cursor-default"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
          />
          <div className="absolute top-full right-0 mt-1 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 py-1.5 backdrop-blur-md">
            <div className="px-3 py-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase border-b border-slate-800/80 mb-1">
              Adicionar Seção
            </div>

            {!template.pageSettings.header && (
              <button
                onClick={() => {
                  addHeader()
                  setCurrentSection('header')
                  onClose()
                }}
                className="w-full px-2.5 py-1.5 text-xs text-left flex items-center gap-2.5 hover:bg-slate-800 rounded-lg transition text-slate-300 group"
              >
                <div className="w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:border-indigo-500/40">
                  <svg
                    className="w-3.5 h-3.5 text-indigo-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="18" height="6" rx="1" fill="currentColor" fillOpacity="0.2" />
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-slate-200 group-hover:text-white">Header Band</div>
                  <div className="text-[10px] text-slate-400">Faixa fixa superior</div>
                </div>
              </button>
            )}

            {!template.summaryPage && (
              <button
                onClick={() => {
                  addSummaryPage()
                  setCurrentSection('summary')
                  onClose()
                }}
                className="w-full px-2.5 py-1.5 text-xs text-left flex items-center gap-2.5 hover:bg-slate-800 rounded-lg transition text-slate-300 group"
              >
                <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:border-emerald-500/40">
                  <svg
                    className="w-3.5 h-3.5 text-emerald-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-slate-200 group-hover:text-white">Summary Band</div>
                  <div className="text-[10px] text-slate-400">Totais e assinaturas</div>
                </div>
              </button>
            )}

            {!template.pageSettings.footer && (
              <button
                onClick={() => {
                  addFooter()
                  setCurrentSection('footer')
                  onClose()
                }}
                className="w-full px-2.5 py-1.5 text-xs text-left flex items-center gap-2.5 hover:bg-slate-800 rounded-lg transition text-slate-300 group"
              >
                <div className="w-6 h-6 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:border-blue-500/40">
                  <svg
                    className="w-3.5 h-3.5 text-blue-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="15" width="18" height="6" rx="1" fill="currentColor" fillOpacity="0.2" />
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-slate-200 group-hover:text-white">Footer Band</div>
                  <div className="text-[10px] text-slate-400">Faixa fixa no rodapé</div>
                </div>
              </button>
            )}

            {!template.pageSettings.bodyBackground && (
              <button
                onClick={() => {
                  addBodyBackground()
                  setCurrentSection('bodyBackground')
                  onClose()
                }}
                className="w-full px-2.5 py-1.5 text-xs text-left flex items-center gap-2.5 hover:bg-slate-800 rounded-lg transition text-slate-300 group"
              >
                <div className="w-6 h-6 rounded-md bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 group-hover:border-purple-500/40">
                  <svg
                    className="w-3.5 h-3.5 text-purple-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="2 2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-slate-200 group-hover:text-white">Background Layer</div>
                  <div className="text-[10px] text-slate-400">Marca d'água / Timbrado</div>
                </div>
              </button>
            )}

            <div className="border-t border-slate-800 my-1" />

            <button
              onClick={() => {
                const id = `container-${Date.now()}`
                addElement(
                  { type: 'container', id, name: 'Container', x: 0, y: 0, width: '100%', height: 120, elements: [] },
                  currentSection
                )
                onClose()
              }}
              className="w-full px-2.5 py-1.5 text-xs text-left flex items-center gap-2.5 hover:bg-slate-800 rounded-lg transition text-slate-300 group"
            >
              <div className="w-6 h-6 rounded-md bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 group-hover:border-cyan-500/40">
                <svg
                  className="w-3.5 h-3.5 text-cyan-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="3 3" />
                  <path d="M3 9h18M3 15h18M9 3v18M15 3v18" strokeWidth="1.2" strokeOpacity="0.5" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-slate-200 group-hover:text-white">
                  Container (em {currentSection.toUpperCase()})
                </div>
                <div className="text-[10px] text-slate-400">Agrupador dentro da camada</div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
