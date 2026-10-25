import type { Element } from '../../store/templateStore'

export interface ElementInspectorProps {
  element: Element
  onUpdate: (field: string | Record<string, any>, value?: any) => void
  onStyleUpdate: (field: string | Record<string, any>, value?: any) => void
  parentName?: string
  isMultiSelection?: boolean
  selectedCount?: number
}
