import { forwardRef } from 'react'
import { clsx } from 'clsx'
import type { TextAreaProps } from './TextArea.types'

const sizeStyles = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
}

const resizeStyles = {
  none: 'resize-none',
  vertical: 'resize-y',
  horizontal: 'resize-x',
  both: 'resize',
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ size = 'sm', error = false, resize = 'vertical', className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={clsx(
          'w-full rounded-lg border transition-colors',
          'theme-bg-tertiary theme-border theme-text',
          'placeholder:theme-text-muted',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
          sizeStyles[size],
          resizeStyles[resize],
          className
        )}
        {...props}
      />
    )
  }
)

TextArea.displayName = 'TextArea'
