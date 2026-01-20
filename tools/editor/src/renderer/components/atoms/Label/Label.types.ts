import type { LabelHTMLAttributes, ReactNode } from 'react'

export type LabelProps = {
  children: ReactNode
  required?: boolean
  hint?: string
} & LabelHTMLAttributes<HTMLLabelElement>
