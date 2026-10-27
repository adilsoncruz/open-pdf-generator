import React, { useState, useEffect } from 'react'
import { useTemplateStore, type ElementLocation } from '../store/templateStore'
import { useUIStore } from '../store/uiStore'
import { SidebarHeader } from './sidebar/SidebarHeader'
import { DocumentPropertiesContent } from './sidebar/DocumentPropertiesContent'
import { HistoryContent } from './sidebar/HistoryContent'
import { ElementsPalette } from './sidebar/ElementsPalette'
import { LayersPanel } from './sidebar/LayersPanel'

export default function Sidebar() {
  const {
    currentSection,
    setCurrentSection,
    isSidebarMinimized,
    toggleSidebarMinimized,
  } = useTemplateStore()

  const { sidebarTab } = useUIStore()
  const [isElementsCollapsed, setIsElementsCollapsed] = useState(false)
  const [openLayer, setOpenLayer] = useState<string>(currentSection)

  useEffect(() => {
    if (currentSection) {
      setOpenLayer(currentSection)
    }
  }, [currentSection])

  const toggleLayer = (layerName: string) => {
    setOpenLayer((prev) => (prev === layerName ? '' : layerName))
    setCurrentSection(layerName as ElementLocation)
  }

  if (isSidebarMinimized) {
    return null
  }

  return (
    <div className="w-[280px] bg-slate-900 border-r border-slate-800 flex flex-col h-full text-slate-200 select-none shrink-0">
      <SidebarHeader
        sidebarTab={sidebarTab}
        isElementsCollapsed={isElementsCollapsed}
        onToggleElementsCollapsed={() => setIsElementsCollapsed(!isElementsCollapsed)}
        onToggleSidebarMinimized={toggleSidebarMinimized}
      />

      {sidebarTab === 'document' ? (
        <DocumentPropertiesContent />
      ) : sidebarTab === 'history' ? (
        <HistoryContent />
      ) : (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {!isElementsCollapsed && <ElementsPalette currentSection={currentSection} />}
          <LayersPanel
            currentSection={currentSection}
            openLayer={openLayer}
            onToggleLayer={toggleLayer}
          />
        </div>
      )}
    </div>
  )
}
