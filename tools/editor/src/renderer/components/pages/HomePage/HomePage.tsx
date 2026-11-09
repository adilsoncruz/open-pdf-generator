import { Badge, Icon } from '../../atoms'
import { StudioLogo } from '../LoadingPage'
import { useUIStore } from '../../../store/uiStore'
import { useRecentFilesStore, type RecentFileItem } from '../../../store/recentFilesStore'
import { useTranslation, LanguageCode } from '../../../i18n'
import { GALLERY_TEMPLATES, GalleryTemplateItem } from '../../../samples/galleryTemplates'

interface HomePageProps {
  onNewTemplate: () => void
  onOpenFile: () => void
  onImportJasper?: () => void
  onImportAI?: () => void
  onOpenRecentFile?: (filePath: string) => void
  onSelectGalleryTemplate?: (item: GalleryTemplateItem) => void
}

export function HomePage({
  onNewTemplate,
  onOpenFile,
  onImportJasper,
  onImportAI,
  onOpenRecentFile,
  onSelectGalleryTemplate,
}: HomePageProps) {
  const { theme, toggleTheme } = useUIStore()
  const { recentFiles, removeRecentFile } = useRecentFilesStore()
  const { t, language, setLanguage, availableLanguages } = useTranslation()

  const handleItemClick = (file: RecentFileItem) => {
    if (onOpenRecentFile) {
      onOpenRecentFile(file.path)
    } else {
      onOpenFile()
    }
  }

  const formatTimestamp = (isoDate: string) => {
    try {
      const date = new Date(isoDate)
      return date.toLocaleDateString(undefined, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return isoDate
    }
  }

  return (
    <main className="min-h-screen overflow-auto bg-slate-950 px-8 py-10 text-slate-100 animate-[fadeIn_0.35s_ease-out]">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <StudioLogo className="h-20 w-20 rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.3)]" />
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Open PDF Template Studio</h1>
              <p className="mt-1 text-sm text-slate-400">{t.home.tagline}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.6 9h16.8M3.6 15h16.8" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3a15 15 0 010 18 15 15 0 010-18z" />
              </svg>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                className="bg-transparent font-medium text-slate-200 focus:outline-none cursor-pointer"
                title={t.home.selectLanguage}
                aria-label={t.home.selectLanguage}
              >
                {Object.entries(availableLanguages).map(([code, name]) => (
                  <option key={code} value={code} className="bg-slate-900 text-slate-200">
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? t.home.switchThemeLight : t.home.switchThemeDark}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 transition hover:border-indigo-400 hover:bg-slate-800 hover:text-indigo-400"
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size="md" />
            </button>
          </div>
        </header>

        <section className="mx-auto mt-16 max-w-5xl">
          <div className="text-center">
            <h2 className="text-5xl font-semibold tracking-tight text-slate-50">{t.home.whatDoYouWantToDo}</h2>
            <p className="mt-4 text-lg text-slate-400">{t.home.chooseOption}</p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Novo Template */}
            <button
              onClick={onNewTemplate}
              className="group rounded-xl border border-indigo-500/80 bg-indigo-600/15 p-6 text-left shadow-[0_0_28px_rgba(99,102,241,0.12)] transition hover:bg-indigo-600/25 flex flex-col justify-between"
            >
              <div>
                <Icon name="plus" size="xl" className="text-indigo-300" />
                <span className="mt-5 block text-lg font-semibold">{t.home.newTemplate}</span>
                <span className="mt-2 block text-xs text-slate-400">{t.home.startFromScratch}</span>
              </div>
              <span className="mt-5 block text-right text-xl text-indigo-300">→</span>
            </button>

            {/* 2. Abrir JSON */}
            <button
              onClick={onOpenFile}
              className="group rounded-xl border border-slate-700 bg-slate-900/80 p-6 text-left transition hover:border-indigo-400 hover:bg-slate-800 flex flex-col justify-between"
            >
              <div>
                <Icon name="folder-open" size="xl" className="text-indigo-400" />
                <span className="mt-5 block text-lg font-semibold">{t.home.browseFile}</span>
                <span className="mt-2 block text-xs text-slate-400">{t.home.openFromComputer}</span>
              </div>
              <span className="mt-5 block text-right text-xl text-slate-500 transition group-hover:text-indigo-400">→</span>
            </button>

            {/* 3. Importar Jasper (.jrxml) */}
            <button
              onClick={onImportJasper || onOpenFile}
              className="group rounded-xl border border-slate-700 bg-slate-900/80 p-6 text-left transition hover:border-emerald-400 hover:bg-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <Icon name="file-text" size="xl" className="text-emerald-400" />
                  <Badge variant="warning" className="uppercase tracking-wider text-[10px] font-semibold">Beta</Badge>
                </div>
                <span className="mt-5 block text-lg font-semibold">{t.home.importJasper}</span>
                <span className="mt-2 block text-xs text-slate-400">{t.home.importJasperDesc}</span>
              </div>
              <span className="mt-5 block text-right text-xl text-slate-500 transition group-hover:text-emerald-400">→</span>
            </button>

            {/* 4. Importar PDF com IA */}
            <button
              onClick={onImportAI}
              className="group rounded-xl border border-slate-700 bg-slate-900/80 p-6 text-left transition hover:border-purple-400 hover:bg-slate-800 flex flex-col justify-between"
            >
              <div>
                <Icon name="preview" size="xl" className="text-purple-400" />
                <span className="mt-5 block text-lg font-semibold">{t.home.importAI}</span>
                <span className="mt-2 block text-xs text-slate-400">{t.home.importAIDesc}</span>
              </div>
              <span className="mt-5 block text-right text-xl text-slate-500 transition group-hover:text-purple-400">→</span>
            </button>
          </div>

          {/* Galeria de Modelos Prontos */}
          <section className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                  <span>🎨</span> {t.home.galleryTitle}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t.home.gallerySubtitle}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {GALLERY_TEMPLATES.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectGalleryTemplate?.(item)}
                  className="group relative cursor-pointer rounded-xl border border-slate-800 bg-slate-900/80 p-5 transition hover:border-indigo-500/80 hover:bg-slate-800/90 hover:shadow-[0_0_24px_rgba(99,102,241,0.15)] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[11px] font-medium text-indigo-300">
                        {item.badge}
                      </span>
                      <span className="text-xs text-slate-500 group-hover:text-indigo-400 transition font-medium">
                        {t.home.testNow}
                      </span>
                    </div>
                    <h4 className="mt-3 text-base font-semibold text-slate-200 group-hover:text-white">
                      {item.title}
                    </h4>
                    <p className="mt-1.5 text-xs text-slate-400 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {(item.template.pageSettings as { size?: string; orientation?: string })?.size || 'A4'} •{' '}
                      {(item.template.pageSettings as { orientation?: string })?.orientation || 'portrait'}
                    </span>
                    <span className="text-indigo-400 font-medium">{t.home.openInEditor}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-12 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70">
            <h3 className="border-b border-slate-800 px-6 py-5 text-lg font-semibold">{t.home.recentFiles}</h3>
            {recentFiles.length === 0 ? (
              <div className="px-6 py-10 text-center text-slate-400">
                <Icon name="file-text" size="xl" className="mx-auto mb-2 text-slate-600 opacity-60" />
                <p className="text-sm">{t.home.noRecentFiles}</p>
              </div>
            ) : (
              recentFiles.map((file) => (
                <div
                  key={file.path}
                  className="group flex w-full items-center gap-4 border-b border-slate-800 px-6 py-5 text-left transition last:border-b-0 hover:bg-slate-800/70"
                >
                  <button
                    onClick={() => handleItemClick(file)}
                    className="flex flex-1 items-center gap-4 text-left overflow-hidden"
                  >
                    <Icon name="file-text" size="lg" className="text-indigo-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-slate-200 truncate">{file.name}</span>
                      <span className="block text-xs text-slate-500 truncate">{file.path}</span>
                    </div>
                    <span className="text-xs text-slate-500 shrink-0">{formatTimestamp(file.lastOpened)}</span>
                    <span className="text-xl text-slate-500 group-hover:text-indigo-400 transition shrink-0">→</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeRecentFile(file.path)
                    }}
                    title={t.home.removeRecent}
                    className="text-slate-500 hover:text-red-400 transition p-1 rounded"
                  >
                    <Icon name="trash" size="sm" />
                  </button>
                </div>
              ))
            )}
          </section>
        </section>
      </div>
    </main>
  )
}
