import { useState } from 'react'
import type { Element } from '../../../../../store/templateStore'
import { useTranslation } from '../../../../../i18n'
import { FontFamilyAndSizeControls } from './FontFamilyAndSizeControls'
import { FontFormatControls } from './FontFormatControls'
import { TextAlignControls } from './TextAlignControls'
import { TextSpacingAndContentControls } from './TextSpacingAndContentControls'

export interface TypographySectionProps {
  element: Element
  onUpdate: (field: string | Record<string, any>, value?: any) => void
  onStyleUpdate: (field: string | Record<string, any>, value?: any) => void
}

export function TypographySection({
  element,
  onUpdate,
  onStyleUpdate,
}: TypographySectionProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(true)

  const isTextElement = ['text', 'rich_text', 'link', 'static_text'].includes(element.type)
  if (!isTextElement) {
    return null
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between text-xs font-semibold text-slate-200 mb-2 focus:outline-none cursor-pointer group select-none"
        aria-expanded={isOpen}
        data-testid="typography-accordion-toggle"
      >
        <span>{t.properties.typography}</span>
        <svg
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="space-y-2">
          <FontFamilyAndSizeControls element={element} onStyleUpdate={onStyleUpdate} />
          <FontFormatControls element={element} onStyleUpdate={onStyleUpdate} />
          <TextAlignControls element={element} onStyleUpdate={onStyleUpdate} />
          <TextSpacingAndContentControls
            element={element}
            onUpdate={onUpdate}
            onStyleUpdate={onStyleUpdate}
          />
        </div>
      )}
    </div>
  )
}

export default TypographySection
