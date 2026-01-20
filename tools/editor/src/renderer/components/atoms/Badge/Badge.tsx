import { clsx } from 'clsx'
import type { BadgeProps } from './Badge.types'

const variantStyles = {
  default: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
  primary: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  success: 'bg-green-500/10 text-green-600 dark:text-green-400',
  warning: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  danger: 'bg-red-500/10 text-red-600 dark:text-red-400',
}

export function Badge({ children, variant = 'default', className, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
