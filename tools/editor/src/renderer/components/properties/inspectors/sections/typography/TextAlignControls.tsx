import type { Element } from '../../../../../store/templateStore'
import { useTranslation } from '../../../../../i18n'

export interface TextAlignControlsProps {
  element: Element
  onStyleUpdate: (field: string | Record<string, any>, value?: any) => void
}

const HORIZONTAL_ALIGNMENTS = [
  {
    align: 'left',
    key: 'alignLeft',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4 6h16M4 12h10M4 18h14"
      />
    ),
  },
  {
    align: 'center',
    key: 'alignCenter',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4 6h16M7 12h10M5 18h14"
      />
    ),
  },
  {
    align: 'right',
    key: 'alignRight',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4 6h16M10 12h10M6 18h14"
      />
    ),
  },
  {
    align: 'justify',
    key: 'alignJustify',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4 6h16M4 12h16M4 18h16"
      />
    ),
  },
] as const

const VERTICAL_ALIGNMENTS = [
  {
    val: 'top',
    key: 'alignTop',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4 4h16M7 8h10M9 12h6"
      />
    ),
  },
  {
    val: 'center',
    key: 'alignMiddle',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4 12h16M7 7h10M7 17h10"
      />
    ),
  },
  {
    val: 'bottom',
    key: 'alignBottom',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4 20h16M7 16h10M9 12h6"
      />
    ),
  },
] as const

export function TextAlignControls({ element, onStyleUpdate }: TextAlignControlsProps) {
  const { t } = useTranslation()
  const currentAlign = (element.style?.alignment as string) || 'left'
  const currentVerticalAlign = (element.style?.verticalAlignment as string) || 'center'

  return (
    <div className="space-y-1.5">
      {/* Horizontal Alignment */}
      <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-1 gap-1">
        {HORIZONTAL_ALIGNMENTS.map(({ align, key, icon }) => {
          const title = t.properties[key]
          const isSelected = currentAlign === align
          return (
            <button
              key={align}
              type="button"
              onClick={() => onStyleUpdate('alignment', align)}
              data-testid={`align-${align}-btn`}
              className={`flex-1 py-1.5 flex items-center justify-center rounded transition ${
                isSelected
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              title={title}
              aria-label={title}
              aria-pressed={isSelected}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {icon}
              </svg>
            </button>
          )
        })}
      </div>

      {/* Vertical Alignment */}
      <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-1 gap-1">
        {VERTICAL_ALIGNMENTS.map(({ val, key, icon }) => {
          const title = t.properties[key]
          const isSelected = currentVerticalAlign === val
          return (
            <button
              key={val}
              type="button"
              onClick={() => onStyleUpdate('verticalAlignment', val)}
              data-testid={`vertical-align-${val}-btn`}
              className={`flex-1 py-1 flex items-center justify-center rounded text-xs transition ${
                isSelected
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              title={title}
              aria-label={title}
              aria-pressed={isSelected}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {icon}
              </svg>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default TextAlignControls
