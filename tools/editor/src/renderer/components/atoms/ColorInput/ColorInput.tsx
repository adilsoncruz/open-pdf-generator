import { forwardRef } from 'react'
import { clsx } from 'clsx'
import type { ColorInputProps } from './ColorInput.types'

export const ColorInput = forwardRef<HTMLInputElement, ColorInputProps>(
  ({ showHex = true, className, value, ...props }, ref) => {
    return (
      <div className={clsx('flex items-center gap-2 flex-1', className)}>
        <input
          ref={ref}
          type="color"
          value={value}
          className={clsx(
            'w-10 h-8 rounded-lg border cursor-pointer shrink-0',
            'theme-bg-tertiary theme-border',
            'focus:outline-none focus:ring-2 focus:ring-blue-500'
          )}
          {...props}
        />
        {showHex && (
          <span className="text-xs theme-text-muted font-mono flex-1">
            {value?.toString().toUpperCase()}
          </span>
        )}
      </div>
    )
  }
)

ColorInput.displayName = 'ColorInput'
