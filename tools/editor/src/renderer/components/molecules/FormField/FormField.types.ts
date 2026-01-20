import type { ReactNode } from 'react'

export type FormFieldProps = {
  label: string
  htmlFor?: string
  required?: boolean
  hint?: string
  error?: string
  children: ReactNode
  className?: string
  horizontal?: boolean
}
