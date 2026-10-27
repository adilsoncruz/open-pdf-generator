import { useState, useEffect } from 'react'
import type { TargetAgent, InstallStatus } from './types'

const SAMPLE_AGENT_COMMAND =
  'Converta o arquivo fatura.pdf em template JSON do Open PDF Generator usando a skill ai-pdf-template-importer.'

const SAMPLE_MASTER_PROMPT = `Você é um compilador de templates visuais para o Open PDF Generator.
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

export const AiSkillInstallerTab = () => {
  const [installStatus, setInstallStatus] = useState<InstallStatus | null>(null)
  const [isInstalling, setIsInstalling] = useState(false)
  const [copiedType, setCopiedType] = useState<'prompt' | 'command' | 'skill' | null>(null)
  const [skillContent, setSkillContent] = useState<string>('')

  useEffect(() => {
    if (window.electronAPI?.getSkillContent) {
      window.electronAPI.getSkillContent().then((res) => {
        if (res.success && res.content) {
          setSkillContent(res.content)
        }
      })
    }
  }, [])

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

  return (
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
            onClick={() => handleCopy(SAMPLE_MASTER_PROMPT, 'prompt')}
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
          <span className="flex-1 truncate">{SAMPLE_AGENT_COMMAND}</span>
          <button
            type="button"
            onClick={() => handleCopy(SAMPLE_AGENT_COMMAND, 'command')}
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
  )
}
