import React from 'react'
import { Icon } from '../atoms'
import { IconButton } from '../molecules'
import { useTranslation } from '../../i18n'

interface SidebarHeaderProps {
  sidebarTab: 'elements' | 'document' | 'history'
  isElementsCollapsed: boolean
  onToggleElementsCollapsed: () => void
  onToggleSidebarMinimized: () => void
}

export function SidebarHeader({
  sidebarTab,
  isElementsCollapsed,
  onToggleElementsCollapsed,
  onToggleSidebarMinimized,
}: SidebarHeaderProps) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between border-b border-slate-800 px-3.5 py-3 bg-slate-950/40 shrink-0">
      <div className="flex items-center gap-2">
        <Icon
          name={sidebarTab === 'document' ? 'file-text' : sidebarTab === 'history' ? 'clock' : 'layers'}
          size="sm"
          className="text-indigo-400"
        />
        <h2 className="text-xs font-semibold text-slate-200">
          {sidebarTab === 'document'
            ? t.sidebar.documentProperties
            : sidebarTab === 'history'
            ? t.sidebar.historyVersions
            : isElementsCollapsed
            ? t.sidebar.layers
            : t.sidebar.elementsLibrary}
        </h2>
      </div>

      {sidebarTab === 'elements' ? (
        <IconButton
          icon={isElementsCollapsed ? 'chevron-down' : 'chevron-up'}
          onClick={onToggleElementsCollapsed}
          tooltip={isElementsCollapsed ? 'Expandir Elementos' : 'Recolher Elementos (mais espaço para Camadas)'}
          size="sm"
          className="text-slate-400 hover:text-white"
        />
      ) : (
        <IconButton
          icon="chevron-left"
          onClick={onToggleSidebarMinimized}
          tooltip="Minimizar barra"
          size="sm"
          className="text-slate-400 hover:text-white"
        />
      )}
    </div>
  )
}
