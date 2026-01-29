import { forwardRef } from 'react'
import { clsx } from 'clsx'
import { Icon } from '../../atoms'
import type { SidebarButtonProps } from './SidebarButton.types'

const variantStyles = {
  primary: {
    active: 'bg-primary-500 text-white',
    inactive: 'theme-surface border theme-border theme-text-secondary hover:border-primary-500/50',
  },
  blue: {
    active: 'bg-blue-500 text-white',
    inactive: 'theme-surface border theme-border theme-text-secondary hover:border-blue-500/50',
  },
  green: {
    active: 'bg-green-500 text-white',
    inactive: 'theme-surface border theme-border theme-text-secondary hover:border-green-500/50',
  },
  purple: {
    active: 'bg-purple-500 text-white',
    inactive: 'theme-surface border theme-border theme-text-secondary hover:border-purple-500/50',
  },
  add: {
    active: 'border-2 border-dashed theme-border theme-text-muted',
    inactive: 'border-2 border-dashed theme-border theme-text-muted hover:border-primary-500/50',
  },
}

export const SidebarButton = forwardRef<HTMLButtonElement, SidebarButtonProps>(
  ({ icon, label, tooltip, isActive = false, variant = 'primary', className, ...props }, ref) => {
    const styles = variantStyles[variant]
    const stateStyle = isActive ? styles.active : styles.inactive

    return (
      <button
        ref={ref}
        title={tooltip}
        className={clsx(
          'w-10 h-10 flex flex-col items-center justify-center rounded-lg transition gap-0.5',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          stateStyle,
          className
        )}
        {...props}
      >
        <Icon name={icon} size="sm" />
        {label && (
          <span className="text-[8px] font-medium leading-none truncate max-w-full px-0.5">
            {label}
          </span>
        )}
      </button>
    )
  }
)

SidebarButton.displayName = 'SidebarButton'
