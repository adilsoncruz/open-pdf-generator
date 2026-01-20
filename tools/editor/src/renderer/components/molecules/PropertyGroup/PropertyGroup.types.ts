import type { ReactNode } from 'react'

export type PropertyGroupProps = {
  title: string
  children: ReactNode
  className?: string
  collapsible?: boolean
  defaultExpanded?: boolean
}
