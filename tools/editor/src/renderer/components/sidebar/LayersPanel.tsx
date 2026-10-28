import React from 'react'
import type { ElementLocation } from '../../store/templateStore'
import {
  useLayersPanel,
  LayersToolbar,
  LayerSectionBand,
} from './layers'

export interface LayersPanelProps {
  currentSection: ElementLocation
  openLayer: string
  onToggleLayer: (layerName: string) => void
}

export function LayersPanel({ currentSection, openLayer, onToggleLayer }: LayersPanelProps) {
  const {
    template,
    draggedElementId,
    dragOverElementId,
    showAddBandDropdown,
    setShowAddBandDropdown,
    getSectionGroups,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    isContainerExpanded,
    toggleContainerExpanded,
    isLoopExpanded,
    toggleLoopExpanded,
  } = useLayersPanel()

  const commonBandProps = {
    isContainerExpanded,
    onToggleContainerExpand: toggleContainerExpanded,
    isLoopExpanded,
    onToggleLoopExpand: toggleLoopExpanded,
    draggedElementId,
    dragOverElementId,
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
    onDragEnd: handleDragEnd,
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 p-3 overflow-hidden">
      <LayersToolbar
        currentSection={currentSection}
        showAddDropdown={showAddBandDropdown}
        onToggleAddDropdown={(e) => {
          e.stopPropagation()
          setShowAddBandDropdown(!showAddBandDropdown)
        }}
        onCloseAddDropdown={() => setShowAddBandDropdown(false)}
      />

      <div className="flex-1 overflow-y-auto space-y-1 text-xs pr-0.5">
        {/* Background Layer (se adicionado) */}
        {template.pageSettings.bodyBackground && (
          <LayerSectionBand
            {...commonBandProps}
            sectionKey="bodyBackground"
            title="Background Layer"
            isOpen={openLayer === 'bodyBackground'}
            onToggle={() => onToggleLayer('bodyBackground')}
            elements={template.pageSettings.bodyBackground.elements}
            currentGroups={getSectionGroups('bodyBackground')}
            icon={
              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="2 2" />
              </svg>
            }
          />
        )}

        {/* 1. Header (apenas se existir) */}
        {template.pageSettings.header && (
          <LayerSectionBand
            {...commonBandProps}
            sectionKey="header"
            title={`Header (${template.pageSettings.header.height}pt)`}
            isOpen={openLayer === 'header'}
            onToggle={() => onToggleLayer('header')}
            showLockIcon
            elements={template.pageSettings.header.elements}
            currentGroups={getSectionGroups('header')}
            icon={
              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="6" rx="1" />
              </svg>
            }
          />
        )}

        {/* 2. Body Content (sempre presente) */}
        <LayerSectionBand
          {...commonBandProps}
          sectionKey="body"
          title="Body Content"
          isOpen={openLayer === 'body'}
          onToggle={() => onToggleLayer('body')}
          elements={template.page}
          currentGroups={getSectionGroups('body')}
          icon={
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          }
        />

        {/* 3. Summary Band (apenas se existir) */}
        {template.summaryPage && (
          <LayerSectionBand
            {...commonBandProps}
            sectionKey="summary"
            title="Summary Band"
            isOpen={openLayer === 'summary'}
            onToggle={() => onToggleLayer('summary')}
            elements={template.summaryPage.elements}
            currentGroups={getSectionGroups('summary')}
            icon={
              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            }
          />
        )}

        {/* 4. Footer (apenas se existir) */}
        {template.pageSettings.footer && (
          <LayerSectionBand
            {...commonBandProps}
            sectionKey="footer"
            title={`Footer (${template.pageSettings.footer.height}pt)`}
            isOpen={openLayer === 'footer'}
            onToggle={() => onToggleLayer('footer')}
            showLockIcon
            elements={template.pageSettings.footer.elements}
            currentGroups={getSectionGroups('footer')}
            icon={
              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="15" width="18" height="6" rx="1" />
              </svg>
            }
          />
        )}
      </div>
    </div>
  )
}
