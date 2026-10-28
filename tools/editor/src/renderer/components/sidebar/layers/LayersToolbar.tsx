import React from 'react'
import type { ElementLocation } from '../../../store/templateStore'
import { AddSectionDropdown } from '../AddSectionDropdown'
import { useTranslation } from '../../../i18n'

export interface LayersToolbarProps {
  currentSection: ElementLocation
  showAddDropdown: boolean
  onToggleAddDropdown: (e: React.MouseEvent) => void
  onCloseAddDropdown: () => void
}

export function LayersToolbar({
  currentSection,
  showAddDropdown,
  onToggleAddDropdown,
  onCloseAddDropdown,
}: LayersToolbarProps) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between mb-2 px-0.5 relative shrink-0 z-30">
      <span className="text-[11px] font-medium text-slate-300">{t.sidebar.layers}</span>

      <AddSectionDropdown
        show={showAddDropdown}
        onToggle={onToggleAddDropdown}
        onClose={onCloseAddDropdown}
        currentSection={currentSection}
      />
    </div>
  )
}
