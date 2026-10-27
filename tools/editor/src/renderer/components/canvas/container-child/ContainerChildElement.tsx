import React from 'react'
import type { ContainerChildElementProps } from '../types'
import { ContainerChildRenderer } from './ContainerChildRenderer'
import { useContainerChildInteraction } from './useContainerChildInteraction'

export function ContainerChildElement(props: ContainerChildElementProps) {
  const { child, effectiveX, effectiveY, effectiveWidth } = props
  const {
    isSelected,
    handleMouseDown,
    handleResizeMouseDown,
    handleContextMenu,
    resolveWidth,
    resolveHeight,
  } = useContainerChildInteraction(props)

  return (
    <div
      className={`absolute cursor-move ${isSelected ? 'ring-2 ring-purple-500' : ''}`}
      style={{
        left: child.width === '100%' ? 0 : effectiveX !== undefined ? effectiveX : child.x || 0,
        top: child.height === '100%' ? 0 : effectiveY !== undefined ? effectiveY : child.y || 0,
        ...(child.width === '100%'
          ? { width: '100%' }
          : effectiveWidth !== undefined && !child.width
          ? { width: effectiveWidth }
          : {}),
      }}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
    >
      <ContainerChildRenderer
        {...props}
        resolveWidth={resolveWidth}
        resolveHeight={resolveHeight}
      />
      {isSelected && (
        <>
          <div className="absolute -top-4 left-0 text-[9px] bg-purple-500 text-white px-1 rounded z-30">
            {child.type}
          </div>
          <div
            className="absolute -right-1 -bottom-1 w-2.5 h-2.5 bg-white border-2 border-purple-500 rounded-full cursor-se-resize z-40"
            onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
          />
          <div
            className="absolute -right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border-2 border-purple-500 rounded-full cursor-e-resize z-40"
            onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
          />
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-2 border-purple-500 rounded-full cursor-s-resize z-40"
            onMouseDown={(e) => handleResizeMouseDown(e, 's')}
          />
        </>
      )}
    </div>
  )
}
