import type React from 'react'
import type { PaletteItemConfig } from './paletteConfig'

export interface PaletteItemProps {
  item: PaletteItemConfig
  onAdd: () => void
  disabled?: boolean
}

export function PaletteItem({ item, onAdd, disabled = false }: PaletteItemProps) {
  const Icon = item.icon

  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>) => {
    try {
      const element = item.createElement()
      e.dataTransfer.setData('application/x-openpdf-element', JSON.stringify(element))
      e.dataTransfer.setData('text/plain', item.type)
      e.dataTransfer.effectAllowed = 'copy'
    } catch {
      // Fallback for environments where dataTransfer is limited
    }
  }

  return (
    <button
      type="button"
      onClick={onAdd}
      draggable={!disabled}
      onDragStart={handleDragStart}
      disabled={disabled}
      className="h-14 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/60 transition flex flex-col items-center justify-center p-1 group cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
      title={item.title}
    >
      <Icon />
      <span className="text-[9.5px] leading-tight text-slate-400 group-hover:text-slate-200 truncate max-w-full px-0.5">
        {item.label}
      </span>
    </button>
  )
}
