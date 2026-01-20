import type { SelectHTMLAttributes } from 'react'
import type { SelectOption } from '../../atoms'

export type SelectFieldProps = {
  label: string
  options: SelectOption[]
  onValueChange?: (value: string) => void
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'>
