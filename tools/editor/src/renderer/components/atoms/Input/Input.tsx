import { forwardRef } from 'react'
import { clsx } from 'clsx'
import type { InputProps } from './Input.types'

const sizeStyles = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ size = 'sm', error = false, leftAddon, rightAddon, className, ...props }, ref) => {
    const inputClasses = clsx(
      'w-full rounded-lg border transition-colors',
      'theme-bg-tertiary theme-border theme-text',
      'placeholder:theme-text-muted',
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
      sizeStyles[size],
      className
    )

    if (leftAddon || rightAddon) {
      return (
        <div className="flex items-center gap-1">
          {leftAddon && (
            <span className="text-xs theme-text-muted shrink-0">{leftAddon}</span>
          )}
          <input ref={ref} className={inputClasses} {...props} />
          {rightAddon && (
            <span className="text-xs theme-text-muted shrink-0">{rightAddon}</span>
          )}
        </div>
      )
    }

    return <input ref={ref} className={inputClasses} {...props} />
  }
)

Input.displayName = 'Input'
