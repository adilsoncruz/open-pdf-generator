import type { InputHTMLAttributes, ReactNode } from 'react'

export type NumberFieldProps = {
  label: ReactNode
  unit?: string
  leftIcon?: ReactNode
  onValueChange?: (value: number) => void
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'>
