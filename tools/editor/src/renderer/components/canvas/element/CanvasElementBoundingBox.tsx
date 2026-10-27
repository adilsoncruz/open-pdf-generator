import React, { type MouseEvent as ReactMouseEvent } from 'react'
import { useUIStore } from '../../../store/uiStore'
import { CanvasResizeHandles } from '../CanvasResizeHandles'

export interface CanvasElementBoundingBoxProps {
  isSelected: boolean
  isDragging: boolean
  isResizing: boolean
  width: number
  height: number
  isWidthFull: boolean
  isHeightFull: boolean
  elementGroup?: { id: string; name: string; printCondition?: string } | null
  onResizeMouseDown: (e: ReactMouseEvent, direction: string) => void
}

export function CanvasElementBoundingBox({
  isSelected,
  isDragging,
  isResizing,
  width,
  height,
  isWidthFull,
  isHeightFull,
  elementGroup,
  onResizeMouseDown,
}: CanvasElementBoundingBoxProps) {
  return (
    <>
      {/* Active outline / borda pontilhada durante drag ou resize */}
      {isSelected && (isDragging || isResizing) && (
        <div
          data-testid="canvas-element-active-outline"
          className="absolute inset-0 pointer-events-none border border-dashed border-primary-500/80 z-10"
        />
      )}

      {/* Resize handles */}
      {isSelected && !isDragging && !isResizing && (
        <CanvasResizeHandles
          width={width}
          height={height}
          isWidthFull={isWidthFull}
          isHeightFull={isHeightFull}
          onResizeMouseDown={onResizeMouseDown}
        />
      )}

      {/* Badge do grupo */}
      {elementGroup && (
        <div
          data-testid="canvas-element-group-badge"
          className="absolute -top-1 -right-1 z-20 pointer-events-auto cursor-pointer group/badge"
          title={`Grupo: ${elementGroup.name}${
            elementGroup.printCondition ? `\nCondição: ${elementGroup.printCondition}` : ''
          }\nClique para editar grupo`}
          onClick={(e) => {
            e.stopPropagation()
            const store = useUIStore.getState() as unknown as { openGroupModal?: (g: unknown) => void }
            store.openGroupModal?.(elementGroup)
          }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-violet-600 border border-white shadow-sm flex items-center justify-center hover:scale-125 transition-transform" />
        </div>
      )}
    </>
  )
}
