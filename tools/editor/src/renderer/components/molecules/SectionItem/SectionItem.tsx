import type { SectionItemProps } from './SectionItem.types'
import { Icon } from '../../atoms'

export const SectionItem = ({
  label,
  isActive = false,
  onClick,
  onRemove,
  removeConfirmMessage,
  className = '',
  rightContent
}: SectionItemProps) => {
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (removeConfirmMessage) {
      if (confirm(removeConfirmMessage)) {
        onRemove?.()
      }
    } else {
      onRemove?.()
    }
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={onClick}
        className={`w-full px-3 py-2 text-xs font-medium rounded-lg transition text-left ${
          isActive
            ? 'bg-blue-500 text-white shadow-sm'
            : 'theme-surface border theme-border theme-text hover:border-primary-500/50'
        }`}
      >
        {label}
      </button>
      {(onRemove || rightContent) && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {rightContent}
          {onRemove && (
            <button
              onClick={handleRemove}
              className={`p-1 rounded transition ${
                isActive
                  ? 'text-white/70 hover:text-white hover:bg-white/20'
                  : 'theme-text-muted hover:text-red-500 hover:bg-red-500/10'
              }`}
              title="Remove"
            >
              <Icon name="close" size="xs" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
