import type { ButtonHTMLAttributes } from 'react'
import type { IconName, IconSize } from '../../atoms'

export type IconButtonProps = {
  icon: IconName
  iconSize?: IconSize
  size?: 'sm' | 'md' | 'lg'
  tooltip?: string
  active?: boolean
  variant?: 'default' | 'ghost' | 'danger' | 'outline'
} & ButtonHTMLAttributes<HTMLButtonElement>
