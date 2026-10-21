import { Icon } from '../../atoms'
import { StudioLogo } from '../LoadingPage'
import { useUIStore } from '../../../store/uiStore'
import { useTranslation, LanguageCode } from '../../../i18n'

interface HomePageProps {
  onNewTemplate: () => void
  onOpenFile: () => void
}

export function HomePage({ onNewTemplate, onOpenFile }: HomePageProps) {
  const { theme, toggleTheme } = useUIStore()
  const { t, language, setLanguage, availableLanguages } = useTranslation()

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
              <Icon name="globe" size="sm" className="text-slate-400" />
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

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <button onClick={onOpenFile} className="group rounded-xl border border-slate-700 bg-slate-900/80 p-6 text-left transition hover:border-indigo-400 hover:bg-slate-800">
              <Icon name="file-text" size="xl" className="text-indigo-400" />
              <span className="mt-5 block text-xl font-semibold">{t.home.openRecent}</span>
              <span className="mt-2 block text-sm text-slate-400">{t.home.continueWhereLeftOff}</span>
              <span className="mt-5 block text-right text-2xl text-slate-500 transition group-hover:text-indigo-400">→</span>
            </button>
            <button onClick={onNewTemplate} className="group rounded-xl border border-indigo-500/80 bg-indigo-600/15 p-6 text-left shadow-[0_0_28px_rgba(99,102,241,0.12)] transition hover:bg-indigo-600/25">
              <Icon name="plus" size="xl" className="text-indigo-300" />
              <span className="mt-5 block text-xl font-semibold">{t.home.newTemplate}</span>
              <span className="mt-2 block text-sm text-slate-400">{t.home.startFromScratch}</span>
              <span className="mt-5 block text-right text-2xl text-indigo-300">→</span>
            </button>
            <button onClick={onOpenFile} className="group rounded-xl border border-slate-700 bg-slate-900/80 p-6 text-left transition hover:border-indigo-400 hover:bg-slate-800">
              <Icon name="folder-open" size="xl" className="text-indigo-400" />
              <span className="mt-5 block text-xl font-semibold">{t.home.browseFile}</span>
              <span className="mt-2 block text-sm text-slate-400">{t.home.openFromComputer}</span>
              <span className="mt-5 block text-right text-2xl text-slate-500 transition group-hover:text-indigo-400">→</span>
            </button>
          </div>

          <section className="mt-12 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70">
            <h3 className="border-b border-slate-800 px-6 py-5 text-lg font-semibold">{t.home.recentFiles}</h3>
            {['invoice-template.json', 'relatorio-mensal.json'].map((file, index) => (
              <button key={file} onClick={onOpenFile} className="flex w-full items-center gap-4 border-b border-slate-800 px-6 py-5 text-left transition last:border-b-0 hover:bg-slate-800/70">
                <Icon name="file-text" size="lg" className="text-indigo-400" />
                <span className="flex-1 text-sm font-medium text-slate-200">{file}</span>
                <span className="text-xs text-slate-500">{index === 0 ? '12/04/2024 14:28' : '09/04/2024 10:16'}</span>
                <span className="text-xl text-slate-500">→</span>
              </button>
            ))}
          </section>
        </section>
      </div>
    </main>
  )
}
