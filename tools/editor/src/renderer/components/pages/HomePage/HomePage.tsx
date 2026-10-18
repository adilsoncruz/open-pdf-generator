import { Icon } from '../../atoms'
import { StudioLogo } from '../LoadingPage'

interface HomePageProps {
  onNewTemplate: () => void
  onOpenFile: () => void
}

export function HomePage({ onNewTemplate, onOpenFile }: HomePageProps) {
  return (
    <main className="min-h-screen overflow-auto bg-[#0b0f19] px-8 py-10 text-slate-100 animate-[fadeIn_0.35s_ease-out]">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center gap-5">
          <StudioLogo className="h-20 w-20 rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.3)]" />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Open PDF Template Studio</h1>
            <p className="mt-1 text-sm text-slate-400">Studio Slate Template Editor</p>
          </div>
        </header>

        <section className="mx-auto mt-16 max-w-5xl">
          <div className="text-center">
            <h2 className="text-5xl font-semibold tracking-tight text-slate-50">O que você deseja fazer?</h2>
            <p className="mt-4 text-lg text-slate-400">Escolha uma opção para continuar.</p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <button onClick={onOpenFile} className="group rounded-xl border border-slate-700 bg-slate-900/80 p-6 text-left transition hover:border-indigo-400 hover:bg-slate-800">
              <Icon name="file-text" size="xl" className="text-indigo-400" />
              <span className="mt-5 block text-xl font-semibold">Abrir recente</span>
              <span className="mt-2 block text-sm text-slate-400">Continue de onde parou</span>
              <span className="mt-5 block text-right text-2xl text-slate-500 transition group-hover:text-indigo-400">→</span>
            </button>
            <button onClick={onNewTemplate} className="group rounded-xl border border-indigo-500/80 bg-indigo-600/15 p-6 text-left shadow-[0_0_28px_rgba(99,102,241,0.12)] transition hover:bg-indigo-600/25">
              <Icon name="plus" size="xl" className="text-indigo-300" />
              <span className="mt-5 block text-xl font-semibold">Novo template</span>
              <span className="mt-2 block text-sm text-slate-400">Comece do zero</span>
              <span className="mt-5 block text-right text-2xl text-indigo-300">→</span>
            </button>
            <button onClick={onOpenFile} className="group rounded-xl border border-slate-700 bg-slate-900/80 p-6 text-left transition hover:border-indigo-400 hover:bg-slate-800">
              <Icon name="folder-open" size="xl" className="text-indigo-400" />
              <span className="mt-5 block text-xl font-semibold">Buscar arquivo</span>
              <span className="mt-2 block text-sm text-slate-400">Abra um arquivo do computador</span>
              <span className="mt-5 block text-right text-2xl text-slate-500 transition group-hover:text-indigo-400">→</span>
            </button>
          </div>

          <section className="mt-12 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70">
            <h3 className="border-b border-slate-800 px-6 py-5 text-lg font-semibold">Arquivos recentes</h3>
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
