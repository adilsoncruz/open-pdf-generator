import { useTemplateStore } from '../../../store/templateStore'
import { useTranslation } from '../../../i18n'

interface DocumentTitleProps {
  onSave: () => void
}

export function DocumentTitle({ onSave }: DocumentTitleProps) {
  const { t } = useTranslation()
  const { template, currentFilePath, isDirty } = useTemplateStore()

  const displayName = currentFilePath
    ? currentFilePath.split(/[/\\]/).pop()
    : template?.metadata?.name || 'template.json'

  return (
    <div className="flex items-center gap-2 bg-slate-950/60 px-2.5 py-1 rounded border border-slate-800">
      <span className="text-xs text-slate-300 font-mono truncate max-w-[180px]">
        {displayName}
      </span>
      <button
        onClick={onSave}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
          isDirty
            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
        }`}
        title="Ctrl+S / Cmd+S"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
        <span>{isDirty ? t.common.unsaved : t.common.save}</span>
      </button>
    </div>
  )
}
