import { forwardRef } from 'react'
import { clsx } from 'clsx'
import type { ButtonProps } from './Button.types'

const variantStyles: Record<string, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
  secondary: 'theme-bg-tertiary theme-text hover:opacity-80 border theme-border',
  ghost: 'theme-text-muted hover:theme-bg-tertiary',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  icon: 'theme-text-muted hover:theme-bg-tertiary p-2',
  outline: 'border theme-border theme-text hover:theme-bg-tertiary bg-transparent',
}

const sizeStyles: Record<string, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      active = false,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const isIconOnly = variant === 'icon'

    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantStyles[variant],
          !isIconOnly && sizeStyles[size],
          fullWidth && 'w-full',
          active && 'ring-2 ring-blue-500',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
