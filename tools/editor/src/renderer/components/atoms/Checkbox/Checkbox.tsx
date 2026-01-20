import { forwardRef } from 'react'
import { clsx } from 'clsx'
import type { CheckboxProps } from './Checkbox.types'

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, ...props }, ref) => {
    return (
      <label className={clsx('flex items-center gap-2 cursor-pointer', className)}>
        <input
          ref={ref}
          type="checkbox"
          className={clsx(
            'w-4 h-4 rounded border transition-colors cursor-pointer',
            'theme-bg-tertiary theme-border',
            'checked:bg-blue-600 checked:border-blue-600',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          {...props}
        />
        {label && <span className="text-xs theme-text">{label}</span>}
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'
