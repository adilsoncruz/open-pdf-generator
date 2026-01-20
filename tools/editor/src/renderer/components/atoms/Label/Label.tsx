import { clsx } from 'clsx'
import type { LabelProps } from './Label.types'

export function Label({ children, required, hint, className, ...props }: LabelProps) {
  return (
    <label
      className={clsx('flex items-center gap-1 text-xs font-medium theme-text-muted', className)}
      {...props}
    >
      {children}
      {required && <span className="text-red-500">*</span>}
      {hint && <span className="text-xs theme-text-muted opacity-70">({hint})</span>}
    </label>
  )
}
