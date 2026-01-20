import { clsx } from 'clsx'
import { Icon } from '../../atoms'
import type { TreeItemProps } from './TreeItem.types'

export function TreeItem({
  id,
  label,
  icon,
  isSelected = false,
  isExpanded = false,
  isVisible = true,
  isDragging = false,
  depth = 0,
  hasChildren = false,
  children,
  onSelect,
  onToggleExpand,
  onToggleVisibility,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: TreeItemProps) {
  return (
    <div>
      <div
        className={clsx(
          'flex items-center gap-1 py-1 px-2 rounded-lg cursor-pointer transition group',
          isSelected
            ? 'bg-primary-500/20 border border-primary-500/50'
            : 'hover:theme-bg-tertiary',
          isDragging && 'opacity-50'
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={onSelect}
        draggable={!!onDragStart}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
      >
        {/* Expand/Collapse */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand?.()
            }}
            className="p-0.5 hover:theme-bg-secondary rounded"
          >
            <Icon name={isExpanded ? 'chevron-down' : 'chevron-right'} size="xs" />
          </button>
        )}

        {/* Icon */}
        {icon && <Icon name={icon} size="sm" className="theme-text-muted" />}

        {/* Label */}
        <span
          className={clsx(
            'flex-1 text-xs truncate',
            isVisible ? 'theme-text' : 'theme-text-muted line-through'
          )}
        >
          {label}
        </span>

        {/* Visibility Toggle */}
        {onToggleVisibility && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleVisibility()
            }}
            className="p-0.5 opacity-0 group-hover:opacity-100 hover:theme-bg-secondary rounded transition"
            title={isVisible ? 'Hide' : 'Show'}
          >
            <Icon name={isVisible ? 'eye' : 'eye-off'} size="xs" />
          </button>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && children}
    </div>
  )
}
