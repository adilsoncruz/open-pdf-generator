import type { ButtonHTMLAttributes } from 'react'
import type { IconName } from '../../atoms'

export type SidebarButtonVariant = 'primary' | 'blue' | 'green' | 'purple' | 'add'

export type SidebarButtonProps = {
  icon: IconName
  label?: string
  tooltip?: string
  isActive?: boolean
  variant?: SidebarButtonVariant
} & ButtonHTMLAttributes<HTMLButtonElement>
