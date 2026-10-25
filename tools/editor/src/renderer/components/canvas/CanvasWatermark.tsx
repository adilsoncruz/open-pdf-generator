import React from 'react'

interface WatermarkConfig {
  type?: 'text' | 'image'
  text?: string
  dataBinding?: string
  imageSource?: string
  fontSize?: number
  fontStyle?: string
  fontName?: string
  color?: string
  opacity?: number
  rotation?: number
  repeat?: boolean
  width?: number
  height?: number
  spacingX?: number
  spacingY?: number
  onTop?: boolean
}

interface CanvasWatermarkProps {
  watermark: WatermarkConfig
  pageSize: { width: number; height: number }
  totalCanvasHeight: number
  numberOfPages: number
  bodyUsableHeight: number
}

export function CanvasWatermark({
  watermark: wm,
  pageSize,
  totalCanvasHeight,
  numberOfPages,
  bodyUsableHeight,
}: CanvasWatermarkProps) {
  const rotation = wm.rotation ?? 45
  const opacity = wm.opacity ?? 0.2
  const imageTileWidth =
    wm.width || (wm.repeat ? Math.round(pageSize.width * 0.25) : Math.round(pageSize.width * 0.6))

  const renderWatermarkContent = () =>
    wm.type === 'image' && wm.imageSource ? (
      <img
        src={wm.imageSource}
        alt="Watermark"
        style={{
          width: `${imageTileWidth}px`,
          height: wm.height ? `${wm.height}px` : 'auto',
          maxWidth: pageSize.width * 0.8,
          objectFit: 'contain',
        }}
      />
    ) : (
      <span
        style={{
          fontSize: `${wm.fontSize || 60}px`,
          fontWeight: wm.fontStyle?.includes('bold') ? 'bold' : 'normal',
          fontStyle: wm.fontStyle?.includes('italic') ? 'italic' : 'normal',
          fontFamily: wm.fontName || 'Outfit, sans-serif',
          color: wm.color || '#94a3b8',
          letterSpacing: '0.1em',
        }}
      >
        {wm.text || (wm.dataBinding ? `{{${wm.dataBinding}}}` : 'WATERMARK')}
      </span>
    )

  if (wm.repeat) {
    const rawText = wm.text || (wm.dataBinding ? `{{${wm.dataBinding}}}` : 'WATERMARK')
    const estimatedTextWidth = (wm.fontSize || 60) * (rawText.length * 0.6)
    const defaultStepX =
      wm.type === 'image'
        ? Math.round(imageTileWidth * 1.8)
        : Math.min(320, Math.max(160, estimatedTextWidth * 1.5))
    const defaultStepY =
      wm.type === 'image'
        ? Math.round((wm.height || imageTileWidth) * 1.8)
        : Math.min(260, Math.max(120, (wm.fontSize || 60) * 3.5))

    const stepX = wm.spacingX || defaultStepX
    const stepY = wm.spacingY || defaultStepY

    const gridItems: { x: number; y: number }[] = []
    let rowIndex = 0
    for (let y = -stepY / 2; y <= totalCanvasHeight + stepY; y += stepY) {
      const offsetX = rowIndex % 2 !== 0 ? stepX / 2 : 0
      for (let x = -stepX / 2 + offsetX; x <= pageSize.width + stepX; x += stepX) {
        gridItems.push({ x, y })
      }
      rowIndex++
    }

    return (
      <div
        className="absolute inset-0 pointer-events-none select-none overflow-hidden"
        style={{ zIndex: wm.onTop ? 45 : 3 }}
      >
        {gridItems.map((pt, idx) => (
          <div
            key={`wm-grid-${idx}`}
            className="absolute flex items-center justify-center pointer-events-none select-none"
            style={{
              left: pt.x,
              top: pt.y,
              transform: `translate(-50%, -50%) rotate(-${rotation}deg)`,
              opacity,
              whiteSpace: 'nowrap',
            }}
          >
            {renderWatermarkContent()}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none overflow-hidden"
      style={{ zIndex: wm.onTop ? 45 : 3 }}
    >
      {Array.from({ length: numberOfPages }).map((_, i) => (
        <div
          key={i}
          className="absolute flex items-center justify-center pointer-events-none select-none"
          style={{
            left: '50%',
            top: pageSize.height / 2 + i * bodyUsableHeight,
            transform: `translate(-50%, -50%) rotate(-${rotation}deg)`,
            opacity,
            whiteSpace: 'nowrap',
          }}
        >
          {renderWatermarkContent()}
        </div>
      ))}
    </div>
  )
}
