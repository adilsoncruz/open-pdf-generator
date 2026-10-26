import React from 'react'
import {
  useTemplateStore,
  type Element,
  type ElementGroup,
  type ElementLocation,
} from '../../store/templateStore'
import { useUIStore } from '../../store/uiStore'
import { Icon } from '../atoms'

interface LayerElementRowProps {
  el: Element
  sectionKey: ElementLocation
  index: number
  totalCount: number
  parentContainerId?: string
  parentLoopId?: string
  currentGroups: ElementGroup[]
  draggedElementId: string | null
  dragOverElementId: string | null
  onDragStart: (e: React.DragEvent, id: string) => void
  onDragOver: (e: React.DragEvent, id: string) => void
  onDragLeave: (e: React.DragEvent, id: string) => void
  onDrop: (e: React.DragEvent, index: number) => void
  onDragEnd: () => void
}

export function LayerElementRow({
  el,
  sectionKey,
  index,
  totalCount,
  parentContainerId,
  parentLoopId,
  currentGroups,
  draggedElementId,
  dragOverElementId,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: LayerElementRowProps) {
  const {
    selectedElementIds,
    selectedContainerChildId,
    selectedLoopChildId,
    selectElement,
    selectContainerChild,
    selectLoopChild,
    toggleElementSelection,
    toggleElementVisibility,
    deleteElement,
    deleteContainerChildElement,
    deleteLoopChildElement,
    reorderElement,
    reorderContainerChildren,
    reorderLoopChildren,
    selectGroup,
    setCurrentSection,
  } = useTemplateStore()

  const isSelected =
    selectedElementIds.includes(el.id) ||
    (parentContainerId && selectedContainerChildId === el.id) ||
    (parentLoopId && selectedLoopChildId === el.id)

  const isDraggingThis = draggedElementId === el.id
  const isDragOverThis = dragOverElementId === el.id
  const elGroup = currentGroups.find((g) => g.elementIds.includes(el.id) || g.id === el.groupId)

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (index > 0) {
      if (parentLoopId) {
        reorderLoopChildren(parentLoopId, index, index - 1, sectionKey)
      } else if (parentContainerId) {
        reorderContainerChildren(parentContainerId, index, index - 1, sectionKey)
      } else {
        reorderElement(el.id, index - 1, sectionKey)
      }
    }
  }

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (index < totalCount - 1) {
      if (parentLoopId) {
        reorderLoopChildren(parentLoopId, index, index + 1, sectionKey)
      } else if (parentContainerId) {
        reorderContainerChildren(parentContainerId, index, index + 1, sectionKey)
      } else {
        reorderElement(el.id, index + 1, sectionKey)
      }
    }
  }

  const getIcon = () => {
    switch (el.type) {
      case 'text':
        return 'T'
      case 'static_text':
        return 'S'
      case 'rich_text':
        return '¶'
      case 'link':
        return <Icon name="link" size="xs" className="w-3 h-3 text-slate-400" />
      case 'image':
        return <Icon name="image" size="xs" className="w-3 h-3 text-slate-400" />
      case 'table':
        return '▦'
      case 'barcode':
        return '▥'
      case 'rectangle':
        return '▭'
      case 'line':
        return '―'
      case 'loop':
        return '⟳'
      case 'container':
        return '⊞'
      case 'spacer':
        return '↕'
      case 'page_break':
        return '✂'
      default:
        return '•'
    }
  }

  const getLabel = () => {
    if (el.type === 'text' || el.type === 'static_text' || el.type === 'rich_text' || el.type === 'link') {
      return (el.value as string) || el.id
    }
    if (el.type === 'line') {
      return `Linha (${el.width || 200}px)`
    }
    if (el.type === 'loop') {
      return `Loop (${el.elements?.length || 0} itens)`
    }
    if (el.type === 'table') {
      return `Tabela (${(el as any).columns?.length || 0} col)`
    }
    if (el.type === 'barcode') {
      return `Barcode (${el.barcodeType || 'code128'})`
    }
    return el.name || el.id
  }

  return (
    <div
      key={el.id}
      draggable
      onDragStart={(e) => onDragStart(e, el.id)}
      onDragOver={(e) => onDragOver(e, el.id)}
      onDragLeave={(e) => onDragLeave(e, el.id)}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setCurrentSection(sectionKey)
        if (!selectedElementIds.includes(el.id)) {
          if (parentLoopId) {
            selectLoopChild(parentLoopId, el.id, sectionKey)
          } else if (parentContainerId) {
            selectContainerChild(parentContainerId, el.id, sectionKey)
          } else {
            selectElement(el.id, sectionKey)
          }
        }
        useUIStore.getState().openContextMenu({
          x: e.clientX,
          y: e.clientY,
          targetType: el.type === 'container' ? 'container' : 'element',
          elementId: el.id,
          containerId: parentContainerId,
          location: sectionKey,
        })
      }}
      onClick={(e) => {
        e.stopPropagation()
        setCurrentSection(sectionKey)
        if (e.ctrlKey || e.metaKey || e.shiftKey) {
          toggleElementSelection(el.id, sectionKey)
        } else if (parentLoopId) {
          selectLoopChild(parentLoopId, el.id, sectionKey)
        } else if (parentContainerId) {
          selectContainerChild(parentContainerId, el.id, sectionKey)
        } else {
          selectElement(el.id, sectionKey)
        }
      }}
      className={`flex items-center justify-between px-1.5 py-0.5 rounded text-[11px] cursor-grab active:cursor-grabbing transition group ${
        isDraggingThis ? 'opacity-40 bg-slate-800' : ''
      } ${
        isDragOverThis ? 'border-t-2 border-indigo-400 bg-indigo-950/40' : ''
      } ${
        isSelected
          ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40'
          : 'hover:bg-slate-800/60 text-slate-300'
      }`}
    >
      <div className="flex items-center gap-1.5 truncate flex-1 min-w-0">
        <span className="text-[10px] text-slate-500 hover:text-slate-300 cursor-grab select-none">⠿</span>
        <span className="text-[10px] font-mono text-slate-400 w-3.5 h-3.5 flex items-center justify-center shrink-0">
          {getIcon()}
        </span>
        <span className="truncate">{getLabel()}</span>
        {elGroup && (
          <span
            onClick={(e) => {
              e.stopPropagation()
              selectGroup(elGroup.id, sectionKey)
            }}
            className="text-[9px] px-1 py-0.2 rounded bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 hover:text-white font-mono shrink-0 select-none cursor-pointer transition"
            title={`Grupo: ${elGroup.name}\nClique para editar grupo`}
          >
            {elGroup.name}
          </span>
        )}
      </div>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
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
          className="text-slate-400 hover:text-slate-200 p-0.5"
          title={el.hidden ? 'Mostrar' : 'Ocultar'}
        >
          <Icon name={el.hidden ? 'eye-off' : 'eye'} size="xs" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (parentLoopId) {
              deleteLoopChildElement(parentLoopId, el.id, sectionKey)
            } else if (parentContainerId) {
              deleteContainerChildElement(parentContainerId, el.id, sectionKey)
            } else {
              deleteElement(el.id, sectionKey)
            }
          }}
          className="text-slate-400 hover:text-red-400 p-0.5"
          title="Excluir"
        >
          <Icon name="trash" size="xs" />
        </button>
      </div>
    </div>
  )
}
