import type { SelectHTMLAttributes } from 'react'

export type SelectSize = 'sm' | 'md' | 'lg'

export type SelectOption = {
  value: string
  label: string
  disabled?: boolean
}

export type SelectProps = {
  size?: SelectSize
  options: SelectOption[]
  placeholder?: string
  error?: boolean
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'>
