import { useState, useEffect } from 'react'
import { useTabStore } from '../store/tabStore'
import type { Template } from '../store/templateStore'
import { Icon } from './atoms'

interface AiImportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

type ModalTab = 'skill' | 'direct'
type TargetAgent = 'antigravity' | 'cursor' | 'claude' | 'custom'
type AiProvider = 'gemini' | 'openai' | 'ollama'

export const AiImportModal = ({ isOpen, onClose, onSuccess }: AiImportModalProps) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('skill')

  // Skill tab state
  const [installStatus, setInstallStatus] = useState<{ target: string; path?: string; error?: string } | null>(null)
  const [isInstalling, setIsInstalling] = useState(false)
  const [copiedType, setCopiedType] = useState<'prompt' | 'command' | 'skill' | null>(null)
  const [skillContent, setSkillContent] = useState<string>('')

  // Direct conversion tab state
  const [provider, setProvider] = useState<AiProvider>('gemini')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('gemini-2.5-flash')
  const [endpoint, setEndpoint] = useState('http://localhost:11434')
  const [inferBindings, setInferBindings] = useState(true)
  const [selectedFile, setSelectedFile] = useState<{ path: string; name: string; base64: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Load saved credentials & skill content
  useEffect(() => {
    if (!isOpen) return

    const savedProvider = localStorage.getItem('open_pdf_ai_provider') as AiProvider | null
    const savedKey = localStorage.getItem('open_pdf_ai_key')
    const savedModel = localStorage.getItem('open_pdf_ai_model')

    if (savedProvider) setProvider(savedProvider)
    if (savedKey) setApiKey(savedKey)
    if (savedModel) setModel(savedModel)

    if (window.electronAPI?.getSkillContent) {
      window.electronAPI.getSkillContent().then((res) => {
        if (res.success && res.content) {
          setSkillContent(res.content)
        }
      })
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleInstallSkill = async (target: TargetAgent) => {
    setIsInstalling(true)
    setInstallStatus(null)
    try {
      if (window.electronAPI?.installSkill) {
        const res = await window.electronAPI.installSkill(target)
        if (res.success) {
          setInstallStatus({ target, path: res.path })
        } else {
          setInstallStatus({ target, error: res.error || 'Falha ao instalar skill' })
        }
      } else {
        setInstallStatus({ target, error: 'API do Electron não disponível.' })
      }
    } catch (err) {
      setInstallStatus({ target, error: (err as Error).message })
    } finally {
      setIsInstalling(false)
    }
  }

  const handleCopy = (text: string, type: 'prompt' | 'command' | 'skill') => {
    navigator.clipboard.writeText(text)
    setCopiedType(type)
    setTimeout(() => setCopiedType(null), 2500)
  }

  const sampleAgentCommand = 'Converta o arquivo fatura.pdf em template JSON do Open PDF Generator usando a skill ai-pdf-template-importer.'

  const sampleMasterPrompt = `Você é um compilador de templates visuais para o Open PDF Generator.
Analise a página do PDF fornecido e gere um template JSON compatível com o engine Open PDF Generator.

REGRAS:
1. Dimensões: "size": "A4", "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 }.
2. Separe textos estáticos de variáveis dinâmicas (ex: Nome: Fulano -> staticText "Nome: " e textField com dataBinding: "cliente.nome").
3. Para listas e grades, gere elemento "table" com "dataBinding" e array "columns".
4. Saída esperada (JSON estrito):
{
  "version": "1.0",
  "metadata": { "name": "Documento", "description": "Template inferido via IA" },
  "pageSettings": {
    "size": "A4",
    "orientation": "portrait",
    "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 }
  },
  "page": [
    { "type": "text", "id": "t1", "x": 36, "y": 36, "value": "Exemplo", "style": { "fontSize": 14, "fontWeight": "bold" } }
  ]
}
Retorne APENAS o JSON válido sem blocos markdown ao redor.`

  const handleSaveSettings = () => {
    localStorage.setItem('open_pdf_ai_provider', provider)
    localStorage.setItem('open_pdf_ai_key', apiKey)
    localStorage.setItem('open_pdf_ai_model', model)
  }

  const handleSelectPDF = async () => {
    setErrorMessage(null)
    if (!window.electronAPI.openPdfFile) {
      setErrorMessage('API de seleção de PDF não disponível.')
      return
    }
    const result = await window.electronAPI.openPdfFile()
    if (result) {
      setSelectedFile(result)
    }
  }

  const handleConvertDirect = async () => {
    if (!selectedFile) {
      setErrorMessage('Por favor, selecione um arquivo PDF primeiro.')
      return
    }
    if (provider !== 'ollama' && !apiKey.trim()) {
      setErrorMessage('Por favor, informe a chave de API do provedor.')
      return
    }

    handleSaveSettings()
    setIsLoading(true)
    setErrorMessage(null)
    setStatusMessage('Enviando documento para análise visual com IA...')

    const promptInstructions = `Você é um compilador de templates visuais para o Open PDF Generator.
Analise a página do PDF fornecido e gere um template JSON compatível com o engine Open PDF Generator.

REGRAS:
1. Dimensões: "size": "A4", "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 }.
2. ${inferBindings ? 'Separe títulos fixos de valores variáveis. Inferir variáveis: ex: Nome: Fulano -> staticText "Nome: " e textField com dataBinding: "cliente.nome". Se houver grade ou itens em lista, gere elemento do tipo "table" com dataBinding e array columns.' : 'Crie elementos estáticos type: "text", "line", "rectangle" preservando as posições exatas.'}
3. Formato JSON estrito:
{
  "version": "1.0",
  "metadata": { "name": "${selectedFile.name.replace(/\.pdf$/i, '')}", "description": "Importado via IA" },
  "pageSettings": {
    "size": "A4",
    "orientation": "portrait",
    "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 }
  },
  "page": [
    { "type": "text", "id": "t1", "x": 0, "y": 0, "value": "Exemplo", "style": { "fontSize": 14, "bold": true } }
  ]
}
Retorne APENAS o JSON válido sem blocos markdown ao redor.`

    try {
      let jsonResponseText = ''

      if (provider === 'gemini') {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: promptInstructions },
                  {
                    inlineData: {
                      mimeType: 'application/pdf',
                      data: selectedFile.base64,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
            },
          }),
        })

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          throw new Error(errData.error?.message || `Erro da API Gemini HTTP ${response.status}`)
        }

        const data = await response.json()
        jsonResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      } else {
        throw new Error(`Provedor ${provider} requer endpoint customizado ou gateway. Recomendamos o Gemini 2.5 Flash.`)
      }

      setStatusMessage('Processando layout retornado...')
      const cleaned = jsonResponseText.replace(/^```json/g, '').replace(/```$/g, '').trim()
      const templateObj: Template = JSON.parse(cleaned)

      if (!templateObj.version || !templateObj.pageSettings || !Array.isArray(templateObj.page)) {
        throw new Error('A IA não gerou uma estrutura válida de Template Open PDF Generator.')
      }

      useTabStore.getState().addTab({
        name: `${selectedFile.name.replace(/\.pdf$/i, '')}-ai.json`,
        path: null,
        isDirty: true,
        stateSnapshot: {
          template: templateObj,
          currentFilePath: null,
          isDirty: true,
          history: [templateObj],
          historyIndex: 0,
          selectedElementIds: [],
          selectedElementLocation: 'body',
          selectedGroupId: null,
          currentSection: 'body',
        },
      })

      setIsLoading(false)
      onSuccess?.()
      onClose()
    } catch (err: unknown) {
      setIsLoading(false)
      setStatusMessage(null)
      setErrorMessage(err instanceof Error ? err.message : String(err))
    }
  }

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
              <p className="text-xs text-slate-400">Converta PDFs em templates usando Skills para Assistentes ou API direta</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1.5 rounded-lg hover:bg-slate-800"
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
            <div className="space-y-4">
              <div className="p-3.5 bg-indigo-950/30 border border-indigo-500/30 rounded-lg text-slate-300">
                <span className="font-semibold text-indigo-300 block mb-1">
                  💡 Zero configuração de API ou cotas de nuvem:
                </span>
                Instale a skill oficial <strong>ai-pdf-template-importer</strong> no seu assistente de código favorito. Ele usará visão computacional diretamente no seu fluxo para transformar PDFs em templates JSON.
              </div>

              {/* Install targets */}
              <div>
                <label className="block text-slate-300 font-medium mb-2">
                  Escolha seu assistente para instalar ou exportar a skill:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    disabled={isInstalling}
                    onClick={() => handleInstallSkill('antigravity')}
                    className="p-3 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-800 hover:border-indigo-500 text-left transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200 group-hover:text-indigo-300">Antigravity / Gemini CLI</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">Global</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-1">
                        Copia para ~/.gemini/antigravity-cli/skills/
                      </span>
                    </div>
                    <span className="text-xs text-indigo-400 mt-2 font-medium">⚡ Instalar no CLI →</span>
                  </button>

                  <button
                    type="button"
                    disabled={isInstalling}
                    onClick={() => handleInstallSkill('cursor')}
                    className="p-3 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-800 hover:border-indigo-500 text-left transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200 group-hover:text-indigo-300">Cursor / Windsurf</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">Rules</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-1">
                        Gera regra em ~/.cursor/rules/
                      </span>
                    </div>
                    <span className="text-xs text-purple-400 mt-2 font-medium">📄 Adicionar Regra →</span>
                  </button>

                  <button
                    type="button"
                    disabled={isInstalling}
                    onClick={() => handleInstallSkill('claude')}
                    className="p-3 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-800 hover:border-indigo-500 text-left transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200 group-hover:text-indigo-300">Claude Code</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">Skills</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-1">
                        Instala em ~/.claude/skills/
                      </span>
                    </div>
                    <span className="text-xs text-amber-400 mt-2 font-medium">🤖 Instalar no Claude →</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(sampleMasterPrompt, 'prompt')}
                    className="p-3 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-800 hover:border-indigo-500 text-left transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200 group-hover:text-indigo-300">Outros (Codex, ChatGPT, Copilot)</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Prompt</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-1">
                        Copia o prompt de Structured Output
                      </span>
                    </div>
                    <span className="text-xs text-emerald-400 mt-2 font-medium">
                      {copiedType === 'prompt' ? '✓ Copiado!' : '📋 Copiar Prompt Mestre →'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Feedback de Instalação */}
              {installStatus && (
                <div
                  className={`p-3 rounded-lg border text-xs ${
                    installStatus.error
                      ? 'bg-rose-950/40 border-rose-800/50 text-rose-300'
                      : 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
                  }`}
                >
                  {installStatus.error ? (
                    <span>Erro: {installStatus.error}</span>
                  ) : (
                    <div>
                      <span className="font-semibold">✓ Skill instalada com sucesso!</span>
                      <span className="block mt-0.5 text-slate-300 font-mono text-[11px] truncate">
                        Local: {installStatus.path}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* How to use */}
              <div className="border border-slate-800 rounded-lg p-3 bg-slate-950/50 space-y-2">
                <span className="font-semibold text-slate-200 block">Como pedir ao seu agente:</span>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded p-2 text-slate-300 font-mono text-[11px]">
                  <span className="flex-1 truncate">{sampleAgentCommand}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(sampleAgentCommand, 'command')}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] shrink-0 transition"
                  >
                    {copiedType === 'command' ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  O agente lerá o PDF multimodalmente, inferirá tabelas e bindings (<code className="text-indigo-400">{'${cliente.nome}'}</code>) e salvará o arquivo <code className="text-indigo-300">.template.json</code> que você pode abrir direto no estúdio.
                </p>
              </div>

              {/* View full skill content */}
              {skillContent && (
                <div className="pt-1 flex items-center justify-between text-xs text-slate-400">
                  <span>Arquivo: <code className="text-slate-300">skills/ai-pdf-template-importer/SKILL.md</code></span>
                  <button
                    type="button"
                    onClick={() => handleCopy(skillContent, 'skill')}
                    className="text-indigo-400 hover:text-indigo-300 transition"
                  >
                    {copiedType === 'skill' ? '✓ Conteúdo Copiado!' : 'Copiar SKILL.md completo'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Selector */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Documento PDF de Origem</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSelectPDF}
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
                disabled={isLoading || !selectedFile}
                onClick={handleConvertDirect}
                className="px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded transition flex items-center gap-1.5"
              >
                {isLoading ? 'Convertendo...' : 'Converter Template'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
