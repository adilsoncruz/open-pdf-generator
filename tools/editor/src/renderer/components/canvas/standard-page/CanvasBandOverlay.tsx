import { useRef, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import type { ElementLocation } from '../../../store/templateStore'
import { useCanvasPageDrop } from './useCanvasPageDrop'

export interface CanvasBandOverlayProps {
  section: ElementLocation
  isActive: boolean
  style: CSSProperties
  className?: string
  onClick?: (e: MouseEvent<HTMLDivElement>) => void
  scale?: number
  children?: ReactNode
}

export function CanvasBandOverlay({
  section,
  isActive,
  style,
  className = '',
  onClick,
  scale = 1,
  children,
}: CanvasBandOverlayProps) {
  const bandRef = useRef<HTMLDivElement>(null)
  const { isDragOver, handleDragOver, handleDragEnter, handleDragLeave, handleDrop } =
    useCanvasPageDrop({
      section,
      scale,
      containerRef: bandRef,
    })

  return (
    <div
      ref={bandRef}
      className={`absolute ${className} ${isDragOver ? 'ring-2 ring-primary-500' : ''}`}
      style={style}
      onClick={onClick}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}

      {!isActive && (
        <div
          className="absolute inset-0 bg-gray-400/30 cursor-not-allowed"
          style={{ zIndex: 100 }}
        />
      )}
    </div>
  )
}

export interface CanvasSectionBadgeProps {
  section: 'header' | 'footer' | 'body' | 'bodyBackground'
  top: number | string
  label?: string
}

const BADGE_COLORS: Record<string, string> = {
  header: 'bg-blue-500 text-white',
  footer: 'bg-green-500 text-white',
  body: 'bg-purple-500 text-white',
  bodyBackground: 'bg-purple-500 text-white',
}

const BADGE_DEFAULTS: Record<string, string> = {
  header: 'HEADER',
  footer: 'FOOTER',
  body: 'BODY',
  bodyBackground: 'BACKGROUND',
}

export function CanvasSectionBadge({ section, top, label }: CanvasSectionBadgeProps) {
  return (
    <div
      className={`absolute right-full mr-3 px-3 py-1 rounded-l text-xs font-semibold whitespace-nowrap ${
        BADGE_COLORS[section] || 'bg-slate-700 text-white'
      }`}
      style={{
        top,
        transform: 'translateY(-50%)',
      }}
    >
      {label || BADGE_DEFAULTS[section] || section.toUpperCase()}
    </div>
  )
}
