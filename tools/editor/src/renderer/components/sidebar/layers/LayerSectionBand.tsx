import React from 'react'
import type { Element, ElementGroup, ElementLocation } from '../../../store/templateStore'
import { LayerTree } from './LayerTree'

export interface LayerSectionBandProps {
  sectionKey: ElementLocation
  title: string
  isOpen: boolean
  onToggle: () => void
  icon: React.ReactNode
  showLockIcon?: boolean
  elements?: Element[]
  currentGroups: ElementGroup[]
  isContainerExpanded: (id: string) => boolean
  onToggleContainerExpand: (id: string) => void
  isLoopExpanded: (id: string) => boolean
  onToggleLoopExpand: (id: string) => void
  draggedElementId: string | null
  dragOverElementId: string | null
  onDragStart: (e: React.DragEvent, id: string) => void
  onDragOver: (e: React.DragEvent, id: string) => void
  onDragLeave: (e: React.DragEvent, id: string) => void
  onDrop: (e: React.DragEvent, index: number, sectionKey: ElementLocation) => void
  onDragEnd: () => void
}

export function LayerSectionBand({
  sectionKey,
  title,
  isOpen,
  onToggle,
  icon,
  showLockIcon,
  elements,
  currentGroups,
  isContainerExpanded,
  onToggleContainerExpand,
  isLoopExpanded,
  onToggleLoopExpand,
  draggedElementId,
  dragOverElementId,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: LayerSectionBandProps) {
  return (
    <div>
      <div
        onClick={onToggle}
        className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition ${
          isOpen
            ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
            : 'hover:bg-slate-800/60 text-slate-300'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <span className="text-slate-400 hover:text-white text-[10px] p-0.5 select-none">
            {isOpen ? '▼' : '▶'}
          </span>
          {icon}
          <span className="truncate font-medium">{title}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
          {showLockIcon && (
            <svg className="w-3.5 h-3.5 hover:text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="5" y="11" width="14" height="10" rx="2" strokeWidth="2" />
              <circle cx="12" cy="7" r="3" strokeWidth="2" />
            </svg>
          )}
          <svg className="w-3.5 h-3.5 hover:text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
      </div>
      {isOpen && (
        <LayerTree
          elements={elements}
          sectionKey={sectionKey}
          currentGroups={currentGroups}
          isContainerExpanded={isContainerExpanded}
          onToggleContainerExpand={onToggleContainerExpand}
          isLoopExpanded={isLoopExpanded}
          onToggleLoopExpand={onToggleLoopExpand}
          draggedElementId={draggedElementId}
          dragOverElementId={dragOverElementId}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onDragEnd={onDragEnd}
        />
      )}
    </div>
  )
}
