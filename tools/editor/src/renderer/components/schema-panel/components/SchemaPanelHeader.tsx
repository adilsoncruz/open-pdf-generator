interface SchemaPanelHeaderProps {
  hasActiveSchema: boolean
  onClose: () => void
}

export function SchemaPanelHeader({ hasActiveSchema, onClose }: SchemaPanelHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono text-xs font-bold">
          {`{ }`}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-100">Schema Validation</h2>
            <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              JSON Schema
            </span>
            {hasActiveSchema && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Ativo no Template
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Define o contrato de dados do PDF. Não obrigatório no template.
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        title="Fechar (Esc)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
