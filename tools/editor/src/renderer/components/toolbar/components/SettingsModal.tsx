import { useTranslation, type LanguageCode } from '../../../i18n'
import { Icon, Button } from '../../atoms'
import type { CLIStatus, AppVersions } from '../types'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  cliStatus: CLIStatus | null
  appVersions: AppVersions | null
  isInstallingCLI: boolean
  installError: string | null
  onInstallCLI: () => void
  onInstallCLIFromFile: () => void
  onRefreshStatus: () => void
}

export function SettingsModal({
  isOpen,
  onClose,
  cliStatus,
  appVersions,
  isInstallingCLI,
  installError,
  onInstallCLI,
  onInstallCLIFromFile,
  onRefreshStatus,
}: SettingsModalProps) {
  const { t, language, setLanguage, availableLanguages } = useTranslation()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="theme-surface rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b theme-border flex items-center justify-between">
          <h2 className="text-lg font-semibold theme-text flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {t.settings.title}
          </h2>
          <button
            onClick={onClose}
            className="theme-text-secondary hover:theme-text transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Language Selection */}
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium theme-text block">
                  🌐 {t.settings.language}
                </label>
                <p className="text-xs theme-text-secondary mt-0.5">
                  {t.settings.selectLanguage}
                </p>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {Object.entries(availableLanguages).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Java Status */}
            <div className={`p-4 rounded-lg border ${cliStatus?.javaInstalled ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              <div className="flex items-center gap-2 mb-1">
                {cliStatus?.javaInstalled ? (
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span className="font-medium theme-text">{t.settings.java}</span>
              </div>
              <p className="text-sm theme-text-secondary">
                {cliStatus?.javaInstalled 
                  ? `${t.settings.version}: ${cliStatus.javaVersion}`
                  : t.settings.notInstalled}
              </p>
            </div>
            
            {/* CLI Status */}
            <div className={`p-4 rounded-lg border ${cliStatus?.installed ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
              <div className="flex items-center gap-2 mb-1">
                {cliStatus?.installed ? (
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                <span className="font-medium theme-text">{t.settings.cli}</span>
              </div>
              <p className="text-sm theme-text-secondary">
                {cliStatus?.installed 
                  ? `${t.settings.version}: ${cliStatus.version}`
                  : t.settings.notInstalled}
              </p>
            </div>
          </div>
          
          {/* CLI Path */}
          {cliStatus && (
            <div className="p-3 rounded-lg theme-bg-secondary">
              <p className="text-xs theme-text-secondary mb-1">{t.settings.installationPath}:</p>
              <code className="text-sm theme-text font-mono break-all">{cliStatus.jarPath}</code>
            </div>
          )}
          
          {/* Error Message */}
          {installError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-500">{installError}</p>
            </div>
          )}
          
          {/* Installation Options */}
          {!cliStatus?.installed && cliStatus?.javaInstalled && (
            <div className="space-y-3">
              <p className="text-sm theme-text-secondary">
                {t.settings.cliNeeded} {t.settings.chooseOption}
              </p>
              
              <div className="flex flex-col gap-2">
                <Button
                  onClick={onInstallCLI}
                  disabled={isInstallingCLI}
                  variant="primary"
                  className="w-full py-3"
                  leftIcon={
                    isInstallingCLI ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <Icon name="download" size="sm" />
                    )
                  }
                >
                  {isInstallingCLI ? t.settings.installing : t.settings.installAutomatically}
                </Button>
                
                <Button
                  onClick={onInstallCLIFromFile}
                  disabled={isInstallingCLI}
                  variant="secondary"
                  className="w-full py-3"
                  leftIcon={<Icon name="file-text" size="sm" />}
                >
                  {t.settings.selectJarFile}
                </Button>
              </div>
              
              <p className="text-xs theme-text-muted">
                💡 {t.settings.manualInstallTip}
              </p>
            </div>
          )}
          
          {/* Java Not Installed Warning */}
          {cliStatus && !cliStatus.javaInstalled && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-500 mb-2">
                ⚠️ {t.pdf.javaNotInstalled}
              </p>
              <p className="text-sm theme-text-secondary mb-3">
                {t.settings.javaRequired}
              </p>
              <a
                href="https://adoptium.net/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary-500 hover:text-primary-400 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {t.settings.downloadJava}
              </a>
            </div>
          )}
          
          {/* Already Installed */}
          {cliStatus?.installed && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-sm text-green-600 dark:text-green-400">
                ✅ {t.settings.cliReady}
              </p>
            </div>
          )}
          
          {/* Version Info */}
          <div className="p-4 rounded-lg theme-bg-secondary border theme-border">
            <h3 className="text-sm font-medium theme-text mb-2">{t.settings.versionInfo}</h3>
            <div className="space-y-1 text-xs theme-text-secondary">
              <p><span className="font-medium">{t.settings.editor}:</span> v{appVersions?.editor || '—'}</p>
              <p><span className="font-medium">{t.settings.coreLibrary}:</span> v{appVersions?.core || '—'}</p>
              <p><span className="font-medium">{t.settings.cli}:</span> v{appVersions?.cli || cliStatus?.version || '—'}</p>
            </div>
          </div>
          
          {/* Documentation Link */}
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">📚 {t.settings.documentation}</p>
                <p className="text-xs theme-text-secondary mt-1">{t.settings.learnMore}</p>
              </div>
              <a
                href="https://adilsoncruz.github.io/open-pdf-generator/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {t.settings.open}
              </a>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t theme-border flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onRefreshStatus}
          >
            {t.settings.refreshStatus}
          </Button>
          <Button
            variant="primary"
            onClick={onClose}
          >
            {t.common.close}
          </Button>
        </div>
      </div>
    </div>
  )
}
