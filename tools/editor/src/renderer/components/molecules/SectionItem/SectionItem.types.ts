import type { ReactNode } from 'react'

export interface SectionItemProps {
  label: string
  isActive?: boolean
  onClick?: () => void
  onRemove?: () => void
  removeConfirmMessage?: string
  className?: string
  rightContent?: ReactNode
}
