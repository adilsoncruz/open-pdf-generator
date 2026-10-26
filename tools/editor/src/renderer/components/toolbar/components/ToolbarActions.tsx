import { useTranslation, type LanguageCode } from '../../../i18n'
import { Icon } from '../../atoms'
import type { CLIStatus } from '../types'

interface ToolbarActionsProps {
  cliStatus: CLIStatus | null
  onOpenSettings: () => void
  onToggleDataPanel: () => void
  onTogglePreview?: () => void
  effectivePreviewMode: 'hidden' | 'tab' | 'split'
  onGeneratePDF: () => void
}

export function ToolbarActions({
  cliStatus,
  onOpenSettings,
  onToggleDataPanel,
  onTogglePreview,
  effectivePreviewMode,
  onGeneratePDF,
}: ToolbarActionsProps) {
  const { t, language, setLanguage, availableLanguages } = useTranslation()

  return (
    <div className="flex items-center space-x-2">
      {/* Indicador de Status CLI */}
      {cliStatus && !cliStatus.installed && (
        <button
          onClick={onOpenSettings}
          className="px-2.5 py-1 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded flex items-center gap-1.5 hover:bg-amber-500/20"
        >
          <Icon name="warning" size="sm" />
          <span>{t.toolbar.cliNotInstalled}</span>
        </button>
      )}

      {/* Dados de Teste */}
      <button
        onClick={onToggleDataPanel}
        className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 border border-slate-800 rounded-lg transition flex items-center gap-1.5"
      >
        <Icon name="data" size="sm" />
        <span>{t.toolbar.testData}</span>
      </button>

      {/* Alternar Preview / Split View */}
      {onTogglePreview && (
        <button
          onClick={onTogglePreview}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition flex items-center gap-1.5 ${
            effectivePreviewMode !== 'hidden'
              ? 'bg-slate-800 text-indigo-400 border-indigo-500/40'
              : 'text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
          title="Ctrl+Shift+P"
        >
          <Icon name={effectivePreviewMode === 'split' ? 'split' : 'preview'} size="sm" />
          <span>{t.toolbar.preview}</span>
        </button>
      )}

      {/* Seletor Rápido de Idioma */}
      <div className="flex items-center">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as LanguageCode)}
          className="px-2 py-1 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          title={t.toolbar.language}
          aria-label={t.toolbar.language}
        >
          {Object.entries(availableLanguages).map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Botão de Configurações */}
      <button
        onClick={onOpenSettings}
        className="p-1.5 text-slate-300 hover:bg-slate-800 border border-slate-800 rounded-lg transition"
        title={t.toolbar.settings}
        aria-label={t.toolbar.settings}
      >
        <Icon name="settings" size="sm" />
      </button>

      {/* Ação Primária: Gerar PDF */}
      <button
        onClick={onGeneratePDF}
        className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-600/30 transition flex items-center gap-1.5"
        title={t.pdf.generating}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>{t.menu.exportPdf || 'PDF'}</span>
      </button>
    </div>
  )
}
