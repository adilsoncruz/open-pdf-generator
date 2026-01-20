import { useState } from 'react'
import { clsx } from 'clsx'
import { Icon } from '../../atoms'
import type { PropertyGroupProps } from './PropertyGroup.types'

export function PropertyGroup({
  title,
  children,
  className,
  collapsible = true,
  defaultExpanded = true,
}: PropertyGroupProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className={clsx('border-b theme-border pb-3 mb-3', className)}>
      <button
        type="button"
        onClick={() => collapsible && setIsExpanded(!isExpanded)}
        className={clsx(
          'flex items-center justify-between w-full text-xs font-semibold theme-text mb-2',
          collapsible && 'cursor-pointer hover:text-primary-500'
        )}
      >
        {title}
        {collapsible && (
          <Icon
            name={isExpanded ? 'chevron-down' : 'chevron-right'}
            size="xs"
            className="theme-text-muted"
          />
        )}
      </button>
      {(!collapsible || isExpanded) && (
        <div className="space-y-2">{children}</div>
      )}
    </div>
  )
}
