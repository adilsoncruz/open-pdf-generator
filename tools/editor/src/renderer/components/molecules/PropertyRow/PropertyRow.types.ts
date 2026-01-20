import type { ReactNode } from 'react'

export type PropertyRowProps = {
  label: string
  children: ReactNode
  className?: string
  labelWidth?: 'sm' | 'md' | 'lg'
}
