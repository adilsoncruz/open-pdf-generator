import type { InputHTMLAttributes } from 'react'

export type ColorFieldProps = {
  label: string
  onValueChange?: (value: string) => void
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'>
