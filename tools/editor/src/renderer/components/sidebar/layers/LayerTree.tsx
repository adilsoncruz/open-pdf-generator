import React from 'react'
import type { Element, ElementGroup, ElementLocation } from '../../../store/templateStore'
import { LayerElementRow } from '../LayerElementRow'
import { LayerContainerNode } from './LayerContainerNode'
import { LayerLoopNode } from './LayerLoopNode'

export interface LayerTreeProps {
  elements?: Element[]
  sectionKey: ElementLocation
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

export function LayerTree({
  elements,
  sectionKey,
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
}: LayerTreeProps) {
  if (!elements || elements.length === 0) {
    return (
      <div className="text-[10px] text-slate-500 py-0.5 pl-3 italic">
        Vazio
      </div>
    )
  }

  return (
    <div className="pl-2 pr-0.5 border-l border-slate-800 ml-1.5 space-y-0.5 py-0.5">
      {elements.map((el, index) => {
        if (el.type === 'container') {
          return (
            <LayerContainerNode
              key={el.id}
              el={el}
              sectionKey={sectionKey}
              index={index}
              totalCount={elements.length}
              currentGroups={currentGroups}
              isExpanded={isContainerExpanded(el.id)}
              onToggleExpand={onToggleContainerExpand}
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
          )
        }

        if (el.type === 'loop') {
          return (
            <LayerLoopNode
              key={el.id}
              el={el}
              sectionKey={sectionKey}
              index={index}
              totalCount={elements.length}
              currentGroups={currentGroups}
              isExpanded={isLoopExpanded(el.id)}
              onToggleExpand={onToggleLoopExpand}
              draggedElementId={draggedElementId}
              dragOverElementId={dragOverElementId}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onDragEnd={onDragEnd}
            />
          )
        }

        return (
          <LayerElementRow
            key={el.id}
            el={el}
            sectionKey={sectionKey}
            index={index}
            totalCount={elements.length}
            currentGroups={currentGroups}
            draggedElementId={draggedElementId}
            dragOverElementId={dragOverElementId}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={(e, dropIdx) => onDrop(e, dropIdx, sectionKey)}
            onDragEnd={onDragEnd}
          />
        )
      })}
    </div>
  )
}
