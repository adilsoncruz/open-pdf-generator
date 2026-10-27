import { Icon } from '../atoms'
import type { AiProvider, PdfFileInfo } from './types'

export interface AiByokDirectTabProps {
  provider: AiProvider
  setProvider: (provider: AiProvider) => void
  apiKey: string
  setApiKey: (key: string) => void
  model: string
  setModel: (model: string) => void
  endpoint: string
  setEndpoint: (endpoint: string) => void
  inferBindings: boolean
  setInferBindings: (infer: boolean) => void
  selectedFile: PdfFileInfo | null
  onSelectPDF: () => void
  statusMessage: string | null
  errorMessage: string | null
}

export const AiByokDirectTab = ({
  provider,
  setProvider,
  apiKey,
  setApiKey,
  model,
  setModel,
  endpoint,
  setEndpoint,
  inferBindings,
  setInferBindings,
  selectedFile,
  onSelectPDF,
  statusMessage,
  errorMessage,
}: AiByokDirectTabProps) => {
  return (
    <div className="space-y-4">
      {/* File Selector */}
      <div>
        <label className="block text-slate-300 font-medium mb-1.5">Documento PDF de Origem</label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSelectPDF}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md font-medium transition flex items-center gap-2 border border-slate-700"
          >
            <Icon name="file-text" size="sm" />
            <span>Selecionar PDF...</span>
          </button>
          <span className="text-slate-400 truncate flex-1 font-mono">
            {selectedFile ? selectedFile.name : 'Nenhum arquivo selecionado'}
          </span>
        </div>
      </div>

      {/* Provider Selection */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div>
          <label className="block text-slate-300 font-medium mb-1.5">Provedor de IA</label>
          <select
            value={provider}
            onChange={(e) => {
              const val = e.target.value as AiProvider
              setProvider(val)
              if (val === 'gemini') setModel('gemini-2.5-flash')
              else if (val === 'openai') setModel('gpt-4o-mini')
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="gemini">Google Gemini</option>
            <option value="openai">OpenAI</option>
            <option value="ollama">Ollama (Local)</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1.5">Modelo</label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="ex: gemini-2.5-flash"
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* API Key */}
      {provider !== 'ollama' ? (
        <div>
          <label className="block text-slate-300 font-medium mb-1.5">Chave de API (BYOK)</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Insira sua API Key..."
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          />
          <span className="text-[11px] text-slate-500 mt-1 block">
            Armazenada exclusivamente no seu navegador/editor.
          </span>
        </div>
      ) : (
        <div>
          <label className="block text-slate-300 font-medium mb-1.5">Endpoint Local</label>
          <input
            type="text"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono"
          />
        </div>
      )}

      {/* Toggle Infer bindings */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          id="inferBindings"
          checked={inferBindings}
          onChange={(e) => setInferBindings(e.target.checked)}
          className="rounded bg-slate-950 border-slate-800 text-indigo-500 focus:ring-0"
        />
        <label htmlFor="inferBindings" className="text-slate-300 select-none cursor-pointer">
          Inferir variáveis dinâmicas (<code className="text-indigo-400">{'${cliente.nome}'}</code>) e tabelas repetidas
        </label>
      </div>

      {/* Status or Error alerts */}
      {statusMessage && (
        <div className="p-3 bg-indigo-950/40 border border-indigo-800/50 rounded text-indigo-300 flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded text-rose-300">
          {errorMessage}
        </div>
      )}
    </div>
  )
}
