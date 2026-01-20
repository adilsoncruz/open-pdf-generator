import { forwardRef } from 'react'
import { clsx } from 'clsx'
import { Label, Select } from '../../atoms'
import type { SelectFieldProps } from './SelectField.types'

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, options, onValueChange, className, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onValueChange) {
        onValueChange(e.target.value)
      }
    }

    return (
      <div className={clsx('space-y-1', className)}>
        <Label>{label}</Label>
        <Select ref={ref} options={options} onChange={handleChange} {...props} />
      </div>
    )
  }
)

SelectField.displayName = 'SelectField'
