import { clsx } from 'clsx'
import { icons } from './icons'
import type { IconProps, IconSize } from './Icon.types'

const sizeStyles: Record<IconSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
}

export function Icon({ name, size = 'sm', className, ...props }: IconProps) {
  const IconComponent = icons[name]

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`)
    return null
  }

  return (
    <IconComponent
      className={clsx(sizeStyles[size], className)}
      {...props}
    />
  )
}
