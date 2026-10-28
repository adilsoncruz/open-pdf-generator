import type { Element } from '../../../../../store/templateStore'
import { useTranslation } from '../../../../../i18n'

export interface FontFormatControlsProps {
  element: Element
  onStyleUpdate: (field: string | Record<string, any>, value?: any) => void
}

export function FontFormatControls({ element, onStyleUpdate }: FontFormatControlsProps) {
  const { t } = useTranslation()
  const isBold = element.style?.fontWeight === 'bold'
  const isItalic = element.style?.fontStyle === 'italic'
  const textDecoration = (element.style?.textDecoration as string) || 'none'
  const isUnderline = textDecoration === 'underline'
  const isStrikethrough = textDecoration === 'line-through'
  const textTransform = (element.style?.textTransform as string) || 'none'
  const isUppercase = textTransform === 'uppercase'
  const isLowercase = textTransform === 'lowercase'

  return (
    <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-1 gap-1">
      {/* Bold */}
      <button
        type="button"
        onClick={() => onStyleUpdate('fontWeight', isBold ? 'normal' : 'bold')}
        data-testid="toggle-bold-btn"
        className={`flex-1 py-1.5 flex items-center justify-center rounded text-xs font-bold transition ${
          isBold
            ? 'bg-slate-800 text-indigo-400 border border-slate-700 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
        }`}
        title={t.properties.bold}
        aria-label={t.properties.bold}
        aria-pressed={isBold}
      >
        B
      </button>

      {/* Italic */}
      <button
        type="button"
        onClick={() => onStyleUpdate('fontStyle', isItalic ? 'normal' : 'italic')}
        data-testid="toggle-italic-btn"
        className={`flex-1 py-1.5 flex items-center justify-center rounded text-xs italic font-serif transition ${
          isItalic
            ? 'bg-slate-800 text-indigo-400 border border-slate-700 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
        }`}
        title={t.properties.italic}
        aria-label={t.properties.italic}
        aria-pressed={isItalic}
      >
        I
      </button>

      {/* Underline */}
      <button
        type="button"
        onClick={() => onStyleUpdate('textDecoration', isUnderline ? 'none' : 'underline')}
        data-testid="toggle-underline-btn"
        className={`flex-1 py-1.5 flex items-center justify-center rounded text-xs font-serif underline transition ${
          isUnderline
            ? 'bg-slate-800 text-indigo-400 border border-slate-700 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
        }`}
        title={t.properties.underline}
        aria-label={t.properties.underline}
        aria-pressed={isUnderline}
      >
        U
      </button>

      {/* Strikethrough */}
      <button
        type="button"
        onClick={() => onStyleUpdate('textDecoration', isStrikethrough ? 'none' : 'line-through')}
        data-testid="toggle-strikethrough-btn"
        className={`flex-1 py-1.5 flex items-center justify-center rounded text-xs font-serif line-through transition ${
          isStrikethrough
            ? 'bg-slate-800 text-indigo-400 border border-slate-700 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
        }`}
        title={t.properties.strikethrough}
        aria-label={t.properties.strikethrough}
        aria-pressed={isStrikethrough}
      >
        S
      </button>

      {/* Uppercase */}
      <button
        type="button"
        onClick={() => onStyleUpdate('textTransform', isUppercase ? 'none' : 'uppercase')}
        data-testid="toggle-uppercase-btn"
        className={`flex-1 py-1.5 flex items-center justify-center rounded text-[11px] font-mono font-semibold transition ${
          isUppercase
            ? 'bg-slate-800 text-indigo-400 border border-slate-700 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
        }`}
        title="Maiúsculas"
        aria-label="Maiúsculas"
        aria-pressed={isUppercase}
      >
        AA
      </button>

      {/* Lowercase */}
      <button
        type="button"
        onClick={() => onStyleUpdate('textTransform', isLowercase ? 'none' : 'lowercase')}
        data-testid="toggle-lowercase-btn"
        className={`flex-1 py-1.5 flex items-center justify-center rounded text-[11px] font-mono font-semibold transition ${
          isLowercase
            ? 'bg-slate-800 text-indigo-400 border border-slate-700 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
        }`}
        title="Minúsculas"
        aria-label="Minúsculas"
        aria-pressed={isLowercase}
      >
        aa
      </button>
    </div>
  )
}

export default FontFormatControls
