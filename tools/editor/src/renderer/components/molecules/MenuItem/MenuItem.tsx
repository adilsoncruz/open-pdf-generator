import { clsx } from 'clsx'
import type { MenuItemProps } from './MenuItem.types'

const variantStyles = {
  default: 'theme-text hover:bg-primary-500/10',
  danger: 'text-red-500 hover:bg-red-500/10',
}

export function MenuItem({
  children,
  shortcut,
  icon,
  variant = 'default',
  className,
  ...props
}: MenuItemProps) {
  return (
    <button
      className={clsx(
        'w-full text-left px-4 py-2 text-sm flex items-center justify-between transition',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <span className="flex items-center gap-2">
        {icon}
        {children}
      </span>
      {shortcut && <span className="text-xs theme-text-muted">{shortcut}</span>}
    </button>
  )
}
