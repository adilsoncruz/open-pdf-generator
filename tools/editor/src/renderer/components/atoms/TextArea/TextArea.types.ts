import type { TextareaHTMLAttributes } from 'react'

export type TextAreaSize = 'sm' | 'md' | 'lg'

export type TextAreaProps = {
  size?: TextAreaSize
  error?: boolean
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>
