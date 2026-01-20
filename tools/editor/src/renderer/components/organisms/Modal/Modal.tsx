import { useEffect } from 'react'
import { clsx } from 'clsx'
import { Icon } from '../../atoms'
import type { ModalProps } from './Modal.types'

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
}

export function Modal({
  isOpen,
  onClose,
  title,
  titleIcon,
  children,
  footer,
  size = 'lg',
}: ModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className={clsx(
          'theme-surface rounded-xl shadow-2xl w-full mx-4 overflow-hidden',
          sizeStyles[size]
        )}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b theme-border flex items-center justify-between">
          <h2 className="text-lg font-semibold theme-text flex items-center gap-2">
            {titleIcon}
            {title}
          </h2>
          <button
            onClick={onClose}
            className="theme-text-secondary hover:theme-text transition p-1 rounded-lg hover:theme-bg-tertiary"
          >
            <Icon name="close" size="md" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t theme-border flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
