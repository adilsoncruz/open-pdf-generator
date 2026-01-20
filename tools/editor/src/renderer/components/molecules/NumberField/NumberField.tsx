import { forwardRef } from 'react'
import { clsx } from 'clsx'
import { Label, Input } from '../../atoms'
import type { NumberFieldProps } from './NumberField.types'

export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
  ({ label, unit, onValueChange, className, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value)
      if (!isNaN(value) && onValueChange) {
        onValueChange(value)
      }
    }

    return (
      <div className={clsx('space-y-1', className)}>
        <Label>{label}</Label>
        <Input
          ref={ref}
          type="number"
          rightAddon={unit}
          onChange={handleChange}
          {...props}
        />
      </div>
    )
  }
)

NumberField.displayName = 'NumberField'
