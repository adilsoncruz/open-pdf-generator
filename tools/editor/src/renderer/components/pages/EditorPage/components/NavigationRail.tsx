import { useTemplateStore } from '../../../../store/templateStore'
import { useUIStore } from '../../../../store/uiStore'
import { useTranslation } from '../../../../i18n'
import { Icon } from '../../../atoms'

interface NavigationRailProps {
  onOpenSchema: () => void
  onOpenHelp: () => void
  onOpenSettings: () => void
}

export function NavigationRail({
  onOpenSchema,
  onOpenHelp,
  onOpenSettings,
}: NavigationRailProps) {
  const { t } = useTranslation()
  const {
    template,
    clearSelection,
    isSidebarMinimized,
    setSidebarMinimized,
  } = useTemplateStore()
  const { theme, toggleTheme, sidebarTab, setSidebarTab } = useUIStore()

  const handleTabClick = (tab: 'document' | 'elements' | 'history') => {
    if (sidebarTab === tab && !isSidebarMinimized) {
      setSidebarMinimized(true)
    } else {
      setSidebarTab(tab)
      setSidebarMinimized(false)
      if (tab === 'document' || tab === 'history') {
        clearSelection()
      }
    }
  }

  return (
    <div className="w-12 bg-slate-950 border-r border-slate-800 flex flex-col items-center py-3 justify-between select-none shrink-0 z-20">
      {/* Top Navigation Icons */}
      <div className="flex flex-col items-center gap-4 text-slate-400">
        <button
          onClick={() => handleTabClick('document')}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition shadow-sm ${
            sidebarTab === 'document' && !isSidebarMinimized
              ? 'bg-indigo-600 text-white shadow-indigo-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
          title={t.sidebar.documentProperties}
        >
          <Icon name="file-text" size="sm" />
        </button>

        <button
          onClick={() => handleTabClick('elements')}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition shadow-sm ${
            sidebarTab === 'elements' && !isSidebarMinimized
              ? 'bg-indigo-600 text-white shadow-indigo-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
          title={t.sidebar.elementsLibrary}
        >
          <Icon name="layers" size="sm" />
        </button>

        <button
          onClick={onOpenSchema}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition shadow-sm relative text-slate-400 hover:text-white hover:bg-slate-800/80"
          title="Validação de Schema (JSON Schema)"
        >
          <span className="font-mono text-xs font-semibold">{`{ }`}</span>
          {template.schema && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
          )}
        </button>

        <button
          onClick={() => handleTabClick('history')}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition shadow-sm ${
            sidebarTab === 'history' && !isSidebarMinimized
              ? 'bg-indigo-600 text-white shadow-indigo-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
          title={t.sidebar.historyVersions}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {/* Bottom Actions: Theme, Help, Settings */}
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
          title={theme === 'dark' ? 'Tema Claro' : 'Tema Escuro'}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size="sm" />
        </button>
        <button
          onClick={onOpenHelp}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
          title={t.settings.documentation}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <button
          onClick={onOpenSettings}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
          title={t.settings.title}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
