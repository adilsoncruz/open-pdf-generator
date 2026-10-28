import { useState } from 'react'
import { Icon } from './atoms'
import {
  AiSkillInstallerTab,
  AiByokDirectTab,
  useAiByok,
  type ModalTab,
  type AiImportModalProps,
} from './ai-modal'

export const AiImportModal = ({ isOpen, onClose, onSuccess }: AiImportModalProps) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('skill')
  const byok = useAiByok({ isOpen, onClose, onSuccess })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Icon name="preview" size="md" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Importar PDF com IA</h2>
              <p className="text-xs text-slate-400">
                Converta PDFs em templates usando Skills para Assistentes ou API direta
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1.5 rounded-lg hover:bg-slate-800"
            aria-label="Fechar modal"
          >
            <Icon name="close" size="sm" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6">
          <button
            type="button"
            onClick={() => setActiveTab('skill')}
            className={`py-2.5 px-4 text-xs font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === 'skill'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon name="file-text" size="sm" />
            <span>Instalar Skill no seu Assistente (Recomendado)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('direct')}
            className={`py-2.5 px-4 text-xs font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === 'direct'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon name="folder-open" size="sm" />
            <span>Conversão Direta via API (BYOK)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {activeTab === 'skill' ? (
            <AiSkillInstallerTab />
          ) : (
            <AiByokDirectTab
              provider={byok.provider}
              setProvider={byok.setProvider}
              apiKey={byok.apiKey}
              setApiKey={byok.setApiKey}
              model={byok.model}
              setModel={byok.setModel}
              endpoint={byok.endpoint}
              setEndpoint={byok.setEndpoint}
              inferBindings={byok.inferBindings}
              setInferBindings={byok.setInferBindings}
              selectedFile={byok.selectedFile}
              onSelectPDF={byok.handleSelectPDF}
              statusMessage={byok.statusMessage}
              errorMessage={byok.errorMessage}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Open PDF Generator Studio • Skill v1.0
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded transition"
            >
              {activeTab === 'skill' ? 'Fechar' : 'Cancelar'}
            </button>
            {activeTab === 'direct' && (
              <button
                type="button"
                disabled={byok.isLoading || !byok.selectedFile}
                onClick={byok.handleConvertDirect}
                className="px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded transition flex items-center gap-1.5"
              >
                {byok.isLoading ? 'Convertendo...' : 'Converter Template'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
