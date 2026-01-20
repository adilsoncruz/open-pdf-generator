import { clsx } from 'clsx'
import { Label } from '../../atoms'
import type { FormFieldProps } from './FormField.types'

export function FormField({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
  className,
  horizontal = false,
}: FormFieldProps) {
  return (
    <div className={clsx(horizontal ? 'flex items-center gap-2' : 'space-y-1', className)}>
      <Label htmlFor={htmlFor} required={required} hint={hint}>
        {label}
      </Label>
      {children}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
