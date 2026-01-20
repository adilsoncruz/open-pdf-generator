import type { InputHTMLAttributes } from 'react'

export type CheckboxProps = {
  label?: string
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>
