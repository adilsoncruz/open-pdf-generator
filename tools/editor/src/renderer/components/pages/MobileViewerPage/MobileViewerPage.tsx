import React, { useState } from 'react'
import PDFPreview from '../../PDFPreview'
import { useTemplateStore } from '../../../store/templateStore'
import { useTranslation } from '../../../i18n'

interface MobileViewerPageProps {
  onBack: () => void
  onOpenDesktopEditor: () => void
  templateTitle?: string
}

export function MobileViewerPage({
  onBack,
  onOpenDesktopEditor,
  templateTitle,
}: MobileViewerPageProps) {
  const [activeTab, setActiveTab] = useState<'pdf' | 'template' | 'data'>('pdf')
  const [copied, setCopied] = useState<string | null>(null)
  const { template, testData } = useTemplateStore()
  const { t } = useTranslation()

  const templateJson = JSON.stringify(template, null, 2)
  const testDataJson = JSON.stringify(testData || {}, null, 2)

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const title = templateTitle || template.name || 'Template'

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Mobile App Header */}
      <header className="flex items-center justify-between px-3 py-2.5 border-b border-slate-800 bg-slate-900/90 backdrop-blur z-20 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white px-2 py-1.5 rounded-lg hover:bg-slate-800 transition"
        >
          <span className="text-base leading-none">←</span>
          <span>{t.home.browseFile ? 'Início' : 'Back'}</span>
        </button>

        <div className="flex items-center gap-2 truncate px-2">
          <span className="text-xs font-semibold text-slate-200 truncate max-w-[140px] sm:max-w-xs">
            {title}
          </span>
          <span className="rounded-md bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-medium text-indigo-300 shrink-0">
            Preview
          </span>
        </div>

        <button
          onClick={onOpenDesktopEditor}
          title="Abrir no editor desktop completo"
          className="flex items-center gap-1 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded-lg hover:bg-slate-800 transition border border-indigo-500/30"
        >
          <span>🖥️</span>
          <span className="hidden xs:inline">Desktop</span>
        </button>
      </header>

      {/* Advisory Banner */}
      <div className="bg-indigo-950/60 border-b border-indigo-500/20 px-3 py-2 flex items-center justify-between text-xs text-indigo-200 shrink-0">
        <div className="flex items-center gap-2 truncate">
          <span className="shrink-0">📱</span>
          <span className="truncate text-[11px]">
            Modo Visualizador: edição avançada no canvas requer desktop.
          </span>
        </div>
        <button
          onClick={onOpenDesktopEditor}
          className="text-[11px] underline font-medium text-indigo-300 hover:text-white ml-2 shrink-0"
        >
          Editor
        </button>
      </div>

      {/* Subnav Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/60 shrink-0">
        <button
          onClick={() => setActiveTab('pdf')}
          className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition ${
            activeTab === 'pdf'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          📄 Visualizar PDF
        </button>
        <button
          onClick={() => setActiveTab('template')}
          className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition ${
            activeTab === 'template'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          &#123; &#125; Template JSON
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition ${
            activeTab === 'data'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          📊 Dados
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'pdf' && (
          <div className="h-full w-full">
            <PDFPreview onClose={onBack} />
          </div>
        )}

        {activeTab === 'template' && (
          <div className="h-full overflow-auto p-4 bg-slate-950 font-mono text-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400 text-[11px]">template.json</span>
              <button
                onClick={() => handleCopy(templateJson, 'template')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200"
              >
                {copied === 'template' ? '✓ Copiado' : 'Copiar'}
              </button>
            </div>
            <pre className="text-slate-300 whitespace-pre-wrap break-words">{templateJson}</pre>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="h-full overflow-auto p-4 bg-slate-950 font-mono text-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400 text-[11px]">data.json</span>
              <button
                onClick={() => handleCopy(testDataJson, 'data')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200"
              >
                {copied === 'data' ? '✓ Copiado' : 'Copiar'}
              </button>
            </div>
            <pre className="text-slate-300 whitespace-pre-wrap break-words">{testDataJson}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
