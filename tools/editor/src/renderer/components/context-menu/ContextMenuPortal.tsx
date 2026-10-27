import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export interface ContextMenuPortalProps {
  x: number
  y: number
  onClose: () => void
  children: ReactNode
  menuWidth?: number
  menuHeight?: number
  className?: string
}

export function ContextMenuPortal({
  x,
  y,
  onClose,
  children,
  menuWidth = 210,
  menuHeight = 310,
  className = '',
}: ContextMenuPortalProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Close context menu on outside click or Escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    // Use capture phase so stopPropagation in elements doesn't prevent closing
    window.addEventListener('mousedown', handleOutsideClick, true)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick, true)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  // Viewport flip & clamp positioning
  const winWidth = typeof window !== 'undefined' ? window.innerWidth : 1024
  const winHeight = typeof window !== 'undefined' ? window.innerHeight : 768

  let targetX = x
  if (x + menuWidth > winWidth - 10) {
    targetX = x - menuWidth
  }

  let targetY = y
  if (y + menuHeight > winHeight - 10) {
    targetY = y - menuHeight
  }

  const clampedX = Math.max(10, Math.min(targetX, Math.max(10, winWidth - menuWidth - 10)))
  const clampedY = Math.max(10, Math.min(targetY, Math.max(10, winHeight - menuHeight - 10)))

  const content = (
    <div
      ref={menuRef}
      style={{ left: clampedX, top: clampedY }}
      className={`fixed z-[9999] w-52 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-2xl py-1 text-xs text-slate-200 select-none animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-800/80 ${className}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </div>
  )

  if (typeof document !== 'undefined' && document.body) {
    return createPortal(content, document.body)
  }

  return content
}

export default ContextMenuPortal
