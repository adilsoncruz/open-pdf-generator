import type { InputHTMLAttributes } from 'react'

export type InputSize = 'sm' | 'md' | 'lg'

export type InputProps = {
  size?: InputSize
  error?: boolean
  leftAddon?: string
  rightAddon?: string
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>
