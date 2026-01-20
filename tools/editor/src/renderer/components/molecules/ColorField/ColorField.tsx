import { forwardRef } from 'react'
import { clsx } from 'clsx'
import { Label, ColorInput } from '../../atoms'
import type { ColorFieldProps } from './ColorField.types'

export const ColorField = forwardRef<HTMLInputElement, ColorFieldProps>(
  ({ label, onValueChange, className, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onValueChange) {
        onValueChange(e.target.value)
      }
    }

    return (
      <div className={clsx('space-y-1', className)}>
        <Label>{label}</Label>
        <ColorInput ref={ref} onChange={handleChange} {...props} />
      </div>
    )
  }
)

ColorField.displayName = 'ColorField'
