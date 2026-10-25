import React, { type MouseEvent as ReactMouseEvent, type CSSProperties } from 'react'

interface CanvasResizeHandlesProps {
  width: number
  height: number
  isWidthFull: boolean
  isHeightFull: boolean
  onResizeMouseDown: (e: ReactMouseEvent, direction: string) => void
}

export function CanvasResizeHandles({
  width,
  height,
  isWidthFull,
  isHeightFull,
  onResizeMouseDown,
}: CanvasResizeHandlesProps) {
  const handleSize = 8
  const handleStyle: CSSProperties = {
    position: 'absolute',
    width: handleSize,
    height: handleSize,
    backgroundColor: '#ffffff',
    border: '1.5px solid #3b82f6',
    borderRadius: '50%',
    zIndex: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  }

  return (
    <>
      {/* 4 Handles nos cantos */}
      {!isWidthFull && !isHeightFull && (
        <>
          <div
            style={{ ...handleStyle, top: -handleSize / 2, left: -handleSize / 2, cursor: 'nw-resize' }}
            onMouseDown={(e) => onResizeMouseDown(e, 'nw')}
          />
          <div
            style={{ ...handleStyle, top: -handleSize / 2, right: -handleSize / 2, cursor: 'ne-resize' }}
            onMouseDown={(e) => onResizeMouseDown(e, 'ne')}
          />
          <div
            style={{ ...handleStyle, bottom: -handleSize / 2, left: -handleSize / 2, cursor: 'sw-resize' }}
            onMouseDown={(e) => onResizeMouseDown(e, 'sw')}
          />
          <div
            style={{ ...handleStyle, bottom: -handleSize / 2, right: -handleSize / 2, cursor: 'se-resize' }}
            onMouseDown={(e) => onResizeMouseDown(e, 'se')}
          />
        </>
      )}

      {/* Handles no topo e base */}
      {!isHeightFull && (
        <>
          <div
            style={{ ...handleStyle, top: -handleSize / 2, left: width / 2 - handleSize / 2, cursor: 'n-resize' }}
            onMouseDown={(e) => onResizeMouseDown(e, 'n')}
          />
          <div
            style={{ ...handleStyle, bottom: -handleSize / 2, left: width / 2 - handleSize / 2, cursor: 's-resize' }}
            onMouseDown={(e) => onResizeMouseDown(e, 's')}
          />
        </>
      )}

      {/* Handles nas laterais */}
      {!isWidthFull && (
        <>
          <div
            style={{ ...handleStyle, top: height / 2 - handleSize / 2, left: -handleSize / 2, cursor: 'w-resize' }}
            onMouseDown={(e) => onResizeMouseDown(e, 'w')}
          />
          <div
            style={{ ...handleStyle, top: height / 2 - handleSize / 2, right: -handleSize / 2, cursor: 'e-resize' }}
            onMouseDown={(e) => onResizeMouseDown(e, 'e')}
          />
        </>
      )}
    </>
  )
}
