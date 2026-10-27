import type { ReactNode } from 'react'
import { Icon } from '../atoms'
import type { IconName } from '../atoms/Icon/Icon.types'

export type ContextMenuItemVariant = 'default' | 'danger' | 'indigo' | 'purple' | 'amber'

export interface ContextMenuItemProps {
  label: ReactNode
  icon?: IconName | ReactNode
  shortcut?: string
  onClick?: () => void
  disabled?: boolean
  variant?: ContextMenuItemVariant
  className?: string
}

export function ContextMenuItem({
  label,
  icon,
  shortcut,
  onClick,
  disabled = false,
  variant = 'default',
  className = '',
}: ContextMenuItemProps) {
  const getVariantStyles = () => {
    if (disabled) {
      return {
        button: 'text-slate-600 cursor-not-allowed',
        icon: 'text-slate-600',
        shortcut: 'text-slate-600 font-mono',
      }
    }

    switch (variant) {
      case 'danger':
        return {
          button: 'hover:bg-red-500/20 text-red-400 hover:text-red-300 cursor-pointer font-medium',
          icon: 'text-red-400',
          shortcut: 'text-red-400/70 font-mono',
        }
      case 'indigo':
        return {
          button: 'hover:bg-slate-800 text-indigo-300 hover:text-indigo-200 cursor-pointer font-medium',
          icon: 'text-indigo-400',
          shortcut: 'text-slate-500 font-mono',
        }
      case 'purple':
        return {
          button: 'hover:bg-slate-800 text-purple-300 hover:text-purple-200 cursor-pointer font-medium',
          icon: 'text-purple-400',
          shortcut: 'text-slate-500 font-mono',
        }
      case 'amber':
        return {
          button: 'hover:bg-slate-800 text-amber-300 hover:text-amber-200 cursor-pointer font-medium',
          icon: 'text-amber-400',
          shortcut: 'text-slate-500 font-mono',
        }
      default:
        return {
          button: 'hover:bg-slate-800 text-slate-200 hover:text-white cursor-pointer',
          icon: 'text-slate-400',
          shortcut: 'text-slate-500 font-mono',
        }
    }
  }

  const styles = getVariantStyles()

  const renderIcon = () => {
    if (!icon) return null
    if (typeof icon === 'string') {
      return <Icon name={icon as IconName} size="xs" className={styles.icon} />
    }
    return icon
  }

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition text-xs ${styles.button} ${className}`}
    >
      <div className="flex items-center gap-2">
        {renderIcon()}
        <span>{label}</span>
      </div>
      {shortcut && <span className={`text-[10px] ${styles.shortcut}`}>{shortcut}</span>}
    </button>
  )
}

export function ContextMenuHeader({ id, type }: { id: string; type: string }) {
  return (
    <div className="px-3 py-1.5 flex items-center justify-between text-[10px] text-slate-400 bg-slate-950/40">
      <span className="font-mono truncate max-w-[120px]">#{id}</span>
      <span className="uppercase font-semibold text-indigo-400 px-1 py-0.2 rounded bg-indigo-500/10">
        {type}
      </span>
    </div>
  )
}

export function ContextMenuSection({
  children,
  title,
  className = '',
}: {
  children: ReactNode
  title?: string
  className?: string
}) {
  return (
    <div className={`p-1 space-y-0.5 ${className}`}>
      {title && (
        <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </div>
      )}
      {children}
    </div>
  )
}

export function ContextMenuSeparator({ className = '' }: { className?: string }) {
  return <div className={`h-px bg-slate-800/80 my-0.5 ${className}`} />
}

export interface QuickAddOption {
  type: string
  label: string
  icon: ReactNode
}

export const DEFAULT_QUICK_ADD_OPTIONS: QuickAddOption[] = [
  { type: 'text', label: 'Texto Dinâmico', icon: <span className="text-slate-400 font-serif font-bold text-xs w-4 text-center">T</span> },
  { type: 'static_text', label: 'Texto Estático', icon: <span className="text-slate-400 font-serif font-bold text-xs w-4 text-center">S</span> },
  { type: 'container', label: 'Container', icon: <span className="text-indigo-400 text-xs w-4 text-center">⊞</span> },
  { type: 'rectangle', label: 'Retângulo', icon: <span className="text-slate-400 text-xs w-4 text-center">▭</span> },
  { type: 'line', label: 'Linha', icon: <span className="text-slate-400 text-xs w-4 text-center">―</span> },
]

export default ContextMenuItem
