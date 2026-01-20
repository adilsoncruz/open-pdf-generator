import type { ReactNode } from 'react'

export interface PanelProps {
  title: string
  icon?: ReactNode
  isExpanded?: boolean
  onToggle?: () => void
  collapsible?: boolean
  children: ReactNode
  className?: string
}
