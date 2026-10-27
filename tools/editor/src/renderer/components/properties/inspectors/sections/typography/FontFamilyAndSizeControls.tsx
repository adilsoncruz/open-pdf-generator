import type { Element } from '../../../../../store/templateStore'
import { useTranslation } from '../../../../../i18n'

export interface FontFamilyAndSizeControlsProps {
  element: Element
  onStyleUpdate: (field: string | Record<string, any>, value?: any) => void
}

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48]

export function FontFamilyAndSizeControls({ element, onStyleUpdate }: FontFamilyAndSizeControlsProps) {
  const { t } = useTranslation()
  const fontFamily = (element.style?.fontFamily as string) || 'Helvetica'
  const fontSize = (element.style?.fontSize as number) || 12
  const lineHeight = (element.style?.lineHeight as number) ?? 1.2
  const letterSpacing = (element.style?.letterSpacing as number) ?? 0

  return (
    <div className="space-y-2">
      {/* Font Family */}
      <div className="relative">
        <select
          value={fontFamily}
          onChange={(e) => onStyleUpdate('fontFamily', e.target.value)}
          data-testid="font-family-select"
          aria-label={t.properties.fontFamily || 'Font Family'}
          className="w-full appearance-none bg-slate-950/70 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none pr-8 cursor-pointer"
        >
          <option value="Inter">Inter</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times-Roman">Times New Roman</option>
          <option value="Courier">Courier</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Font Size, Line Height, Letter Spacing */}
      <div className="grid grid-cols-3 gap-2">
        {/* Font Size */}
        <div className="relative">
          <select
            value={fontSize}
            onChange={(e) => onStyleUpdate('fontSize', parseFloat(e.target.value))}
            data-testid="font-size-select"
            aria-label={t.properties.fontSize || 'Font Size'}
            className="w-full appearance-none bg-slate-950/70 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none pr-6 cursor-pointer font-mono"
          >
            {FONT_SIZES.map((size) => (
              <option key={size} value={size}>{size}pt</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-slate-400">
            <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Line Height */}
        <div className="flex flex-col bg-slate-950/70 border border-slate-800 rounded-lg px-2 py-1 focus-within:border-indigo-500">
          <span className="text-[9px] text-slate-500 font-mono leading-none mb-0.5">{t.properties.lineHeight}</span>
          <input
            type="number"
            step="0.1"
            min="0.5"
            max="3"
            value={lineHeight}
            onChange={(e) => onStyleUpdate('lineHeight', parseFloat(e.target.value) || 1.2)}
            data-testid="line-height-input"
            aria-label={t.properties.lineHeight}
            className="bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right"
          />
        </div>

        {/* Letter Spacing */}
        <div className="flex flex-col bg-slate-950/70 border border-slate-800 rounded-lg px-2 py-1 focus-within:border-indigo-500">
          <span className="text-[9px] text-slate-500 font-mono leading-none mb-0.5">ESPAÇAMENTO</span>
          <input
            type="number"
            step="0.5"
            min="-5"
            max="20"
            value={letterSpacing}
            onChange={(e) => onStyleUpdate('letterSpacing', parseFloat(e.target.value) || 0)}
            data-testid="letter-spacing-input"
            aria-label="Espaçamento de Letras"
            className="bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right"
          />
        </div>
      </div>
    </div>
  )
}

export default FontFamilyAndSizeControls
