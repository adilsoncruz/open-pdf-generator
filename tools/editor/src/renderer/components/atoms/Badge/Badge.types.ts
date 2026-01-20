import type { HTMLAttributes, ReactNode } from 'react'

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger'

export type BadgeProps = {
  children: ReactNode
  variant?: BadgeVariant
} & HTMLAttributes<HTMLSpanElement>
