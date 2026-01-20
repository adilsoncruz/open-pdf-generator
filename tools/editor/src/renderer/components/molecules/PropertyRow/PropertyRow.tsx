import { clsx } from 'clsx'
import type { PropertyRowProps } from './PropertyRow.types'

const labelWidthStyles = {
  sm: 'w-16',
  md: 'w-20',
  lg: 'w-24',
}

export function PropertyRow({
  label,
  children,
  className,
  labelWidth = 'md',
}: PropertyRowProps) {
  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <label
        className={clsx(
          'text-xs font-medium theme-text-muted shrink-0',
          labelWidthStyles[labelWidth]
        )}
      >
        {label}
      </label>
      <div className="flex-1">{children}</div>
    </div>
  )
}
