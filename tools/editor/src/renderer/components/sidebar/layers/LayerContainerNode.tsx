import React from 'react'
import {
  useTemplateStore,
  type Element,
  type ElementGroup,
  type ElementLocation,
} from '../../../store/templateStore'
import { useUIStore } from '../../../store/uiStore'
import { Icon } from '../../atoms'
import { LayerElementRow } from '../LayerElementRow'
import { LayerLoopNode } from './LayerLoopNode'

export interface LayerContainerNodeProps {
  el: Element
  sectionKey: ElementLocation
  index: number
  totalCount: number
  currentGroups: ElementGroup[]
  isExpanded: boolean
  onToggleExpand: (id: string) => void
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

export function LayerContainerNode({
  el,
  sectionKey,
  index,
  totalCount,
  currentGroups,
  isExpanded,
  onToggleExpand,
  isLoopExpanded,
  onToggleLoopExpand,
  draggedElementId,
  dragOverElementId,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: LayerContainerNodeProps) {
  const {
    selectedElementIds,
    selectElement,
    toggleElementSelection,
    toggleElementVisibility,
    deleteElement,
    reorderElement,
    reorderContainerChildren,
    setCurrentSection,
  } = useTemplateStore()

  const isContainerSelected = selectedElementIds.includes(el.id)
  const childElements = el.elements || []

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (index > 0) reorderElement(el.id, index - 1, sectionKey)
  }

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (index < totalCount - 1) reorderElement(el.id, index + 1, sectionKey)
  }

  return (
    <div
      key={el.id}
      className="space-y-0.5"
      draggable
      onDragStart={(e) => onDragStart(e, el.id)}
      onDragOver={(e) => onDragOver(e, el.id)}
      onDragLeave={(e) => onDragLeave(e, el.id)}
      onDrop={(e) => onDrop(e, index, sectionKey)}
      onDragEnd={onDragEnd}
    >
      <div
        onContextMenu={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setCurrentSection(sectionKey)
          if (!selectedElementIds.includes(el.id)) {
            selectElement(el.id, sectionKey)
          }
          useUIStore.getState().openContextMenu({
            x: e.clientX,
            y: e.clientY,
            targetType: 'container',
            elementId: el.id,
            location: sectionKey,
          })
        }}
        onClick={(e) => {
          e.stopPropagation()
          setCurrentSection(sectionKey)
          if (e.ctrlKey || e.metaKey || e.shiftKey) {
            toggleElementSelection(el.id, sectionKey)
          } else {
            selectElement(el.id, sectionKey)
          }
        }}
        className={`flex items-center justify-between px-2 py-1 rounded text-xs cursor-pointer transition group ${
          draggedElementId === el.id ? 'opacity-40 bg-slate-800' : ''
        } ${
          dragOverElementId === el.id ? 'border-t-2 border-indigo-400 bg-indigo-950/40' : ''
        } ${
          isContainerSelected
            ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40'
            : 'hover:bg-slate-800/60 text-slate-300'
        }`}
      >
        <div className="flex items-center gap-1.5 truncate flex-1 min-w-0">
          <span className="text-[10px] text-slate-500 hover:text-slate-300 cursor-grab select-none">⠿</span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand(el.id)
            }}
            className="text-[9px] text-slate-400 hover:text-white p-0.5"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          <span className="text-[11px] text-indigo-400">⊞</span>
          <span className="truncate font-medium">{el.name || el.id}</span>
          <span className="text-[9px] text-slate-500">({childElements.length})</span>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 shrink-0">
          <button
            onClick={handleMoveUp}
            disabled={index === 0}
            className={`p-0.5 rounded ${
              index === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
            title="Mover para cima"
          >
            <span className="text-[9px]">▲</span>
          </button>
          <button
            onClick={handleMoveDown}
            disabled={index === totalCount - 1}
            className={`p-0.5 rounded ${
              index === totalCount - 1
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
            title="Mover para baixo"
          >
            <span className="text-[9px]">▼</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleElementVisibility(el.id, sectionKey)
            }}
            className="hover:text-slate-200 p-0.5"
            title={el.hidden ? 'Mostrar' : 'Ocultar'}
          >
            <Icon name={el.hidden ? 'eye-off' : 'eye'} size="xs" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              deleteElement(el.id, sectionKey)
            }}
            className="hover:text-red-400 p-0.5"
            title="Excluir"
          >
            <Icon name="trash" size="xs" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="pl-2 border-l border-slate-800/80 ml-1.5 space-y-0.5">
          {childElements.length === 0 ? (
            <div className="text-[10px] text-slate-500 py-0.5 italic">
              Container vazio
            </div>
          ) : (
            childElements.map((child, cIdx) => {
              if (child.type === 'loop') {
                return (
                  <LayerLoopNode
                    key={child.id}
                    el={child}
                    sectionKey={sectionKey}
                    index={cIdx}
                    totalCount={childElements.length}
                    parentContainerId={el.id}
                    currentGroups={currentGroups}
                    isExpanded={isLoopExpanded(child.id)}
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
                  key={child.id}
                  el={child}
                  sectionKey={sectionKey}
                  index={cIdx}
                  totalCount={childElements.length}
                  parentContainerId={el.id}
                  currentGroups={currentGroups}
                  draggedElementId={draggedElementId}
                  dragOverElementId={dragOverElementId}
                  onDragStart={onDragStart}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={(e, dropIdx) => {
                    e.preventDefault()
                    e.stopPropagation()
                    reorderContainerChildren(el.id, cIdx, dropIdx, sectionKey)
                    onDragEnd()
                  }}
                  onDragEnd={onDragEnd}
                />
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
