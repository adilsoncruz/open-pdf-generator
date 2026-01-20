import { useState } from 'react'
import { clsx } from 'clsx'
import { Icon } from '../../atoms'
import type { AccordionProps } from './Accordion.types'

export function Accordion({ title, children, defaultOpen = false, className }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={clsx('border-b theme-border', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-2 text-sm font-medium theme-text hover:theme-bg-tertiary transition-colors"
      >
        {title}
        <Icon
          name={isOpen ? 'chevron-down' : 'chevron-right'}
          size="xs"
          className="transition-transform"
        />
      </button>
      {isOpen && <div className="pb-3">{children}</div>}
    </div>
  )
}
