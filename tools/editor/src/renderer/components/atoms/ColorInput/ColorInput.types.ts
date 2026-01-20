import type { InputHTMLAttributes } from 'react'

export type ColorInputProps = {
  showHex?: boolean
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>
