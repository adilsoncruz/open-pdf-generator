import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type MenuItemProps = {
  children: ReactNode
  shortcut?: string
  icon?: ReactNode
  variant?: 'default' | 'danger'
} & ButtonHTMLAttributes<HTMLButtonElement>
