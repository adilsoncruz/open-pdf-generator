import { useRef, useEffect } from 'react'
import { clsx } from 'clsx'
import type { DropdownMenuProps } from './DropdownMenu.types'

export function DropdownMenu({
  trigger,
  children,
  isOpen,
  onOpenChange,
  align = 'left',
  className,
}: DropdownMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onOpenChange(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onOpenChange])

  return (
    <div className={clsx('relative', className)} ref={menuRef}>
      <div onClick={() => onOpenChange(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div
          className={clsx(
            'absolute top-full mt-1 w-48 theme-surface border theme-border rounded-lg shadow-lg z-50',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {children}
        </div>
      )}
    </div>
  )
}
