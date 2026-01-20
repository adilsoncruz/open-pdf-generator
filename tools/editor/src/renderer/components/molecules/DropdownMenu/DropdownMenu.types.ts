import type { ReactNode } from 'react'

export type DropdownMenuProps = {
  trigger: ReactNode
  children: ReactNode
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  align?: 'left' | 'right'
  className?: string
}
