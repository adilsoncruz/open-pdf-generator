import { forwardRef } from 'react'
import { clsx } from 'clsx'
import { Icon } from '../../atoms'
import type { IconButtonProps } from './IconButton.types'

const variantStyles = {
  default: 'theme-text-muted hover:theme-bg-tertiary',
  ghost: 'theme-text-muted hover:theme-text',
  danger: 'text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30',
  outline: 'border theme-border theme-text hover:theme-bg-tertiary',
}

const sizeStyles = {
  sm: 'p-1',
  md: 'p-1.5',
  lg: 'p-2',
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, iconSize = 'sm', size = 'md', tooltip, active, variant = 'default', className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        title={tooltip}
        className={clsx(
          'rounded-lg transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeStyles[size],
          variantStyles[variant],
          active && 'theme-bg-tertiary ring-1 ring-blue-500',
          className
        )}
        {...props}
      >
        <Icon name={icon} size={iconSize} />
      </button>
    )
  }
)

IconButton.displayName = 'IconButton'
