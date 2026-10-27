import type { Element } from '../../../../../store/templateStore'
import { TableHeaderStyleSection } from './TableHeaderStyleSection'
import { TableDataRowStyleSection } from './TableDataRowStyleSection'
import { TableBorderStyleSection } from './TableBorderStyleSection'

export interface TableStylesTabProps {
  element: Element
  onStyleUpdate: (field: string | Record<string, unknown>, value?: unknown) => void
}

export function TableStylesTab({ element, onStyleUpdate }: TableStylesTabProps) {
  return (
    <div className="space-y-4">
      <TableHeaderStyleSection element={element} onStyleUpdate={onStyleUpdate} />
      <TableDataRowStyleSection element={element} onStyleUpdate={onStyleUpdate} />
      <TableBorderStyleSection element={element} onStyleUpdate={onStyleUpdate} />
    </div>
  )
}
