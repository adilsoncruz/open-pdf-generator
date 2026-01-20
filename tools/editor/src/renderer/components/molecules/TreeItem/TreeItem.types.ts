import type { ReactNode } from 'react'
import type { IconName } from '../../atoms'

export type TreeItemProps = {
  id: string
  label: string
  icon?: IconName
  isSelected?: boolean
  isExpanded?: boolean
  isVisible?: boolean
  isDragging?: boolean
  depth?: number
  hasChildren?: boolean
  children?: ReactNode
  onSelect?: () => void
  onToggleExpand?: () => void
  onToggleVisibility?: () => void
  onDragStart?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  onDragEnd?: () => void
}
