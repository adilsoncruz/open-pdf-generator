import React from 'react'
import type { Element } from '../../../store/templateStore'
import { getHeaderBorderValues, getCellBorderValues } from '../types'

interface ContainerChildTableRendererProps {
  child: Element
  containerWidth: number
}

export function ContainerChildTableRenderer({
  child,
  containerWidth,
}: ContainerChildTableRendererProps) {
        const columns = Array.isArray(child.columns) ? child.columns : []
        const hasValidColumns = columns.length > 0 && columns.every((col: unknown) => col && typeof col === 'object')
        const tableStyle = child.style || {}
        const headerBg = tableStyle.headerBackground || '#f0f0f0'
        const headerColor = (tableStyle.headerTextColor as string) || (tableStyle.headerColor as string) || '#000000'
        const headerFontSize = (tableStyle.headerFontSize as number) || 12
        const fontSize = (tableStyle.fontSize as number) || 10
        const cellColor = tableStyle.cellColor || '#000000'
        const cellBg = (tableStyle.cellBackground as string) || '#ffffff'
        const borderColor = (tableStyle.borderColor as string) || '#cccccc'
        const headerBorderColor = (tableStyle.headerBorderColor as string) || borderColor
        const borderStyle = (tableStyle.borderStyle as string) || 'solid'
        const headerPadding = (tableStyle.headerPadding as number) ?? 5
        const cellPadding = (tableStyle.cellPadding as number) ?? 5
        const headerBorderValues = getHeaderBorderValues(tableStyle)
        const cellBorderValues = getCellBorderValues(tableStyle)
        const headerBorderType = (tableStyle.headerBorderType as string) || 'all'
        const cellBorderType = (tableStyle.cellBorderType as string) || 'all'
        const columnWidths = columns.map((col: Record<string, unknown>) => (col.width as number) || 100)
        const totalWidth = columnWidths.reduce((sum: number, w: number) => sum + w, 0)
        const rawW = child.width ?? 400
        const resolvedW = rawW === '100%' ? containerWidth : (typeof rawW === 'number' ? rawW : 400)
        const proportionalWidths = columnWidths.map((w: number) => totalWidth > 0 ? (w / totalWidth) * resolvedW : (columns.length > 0 ? resolvedW / columns.length : 100))

        return (
          <div
            style={{
              width: resolvedW,
              minHeight: 40,
            }}
          >
            {hasValidColumns ? (
              <table className="w-full pointer-events-none border-collapse" style={{ tableLayout: 'fixed' }}>
                <thead>
                  <tr style={{ backgroundColor: headerBg === 'transparent' ? 'transparent' : headerBg, color: headerColor, fontSize: `${headerFontSize}px` }}>
                    {columns.map((col: Record<string, unknown>, i: number) => {
                      const isFirst = i === 0
                      const isLast = i === columns.length - 1
                      let hLeft = headerBorderValues.left
                      let hRight = headerBorderValues.right

                      if (headerBorderType === 'columns') {
                        hLeft = isFirst ? headerBorderValues.left : headerBorderValues.left / 2
                        hRight = isLast ? headerBorderValues.right : headerBorderValues.right / 2
                      } else if (headerBorderType === 'row') {
                        hLeft = isFirst ? headerBorderValues.left : 0
                        hRight = isLast ? headerBorderValues.right : 0
                      } else if (headerBorderType === 'none') {
                        hLeft = 0
                        hRight = 0
                      }

                      return (
                        <th
                          key={`ch-th-${i}`}
                          className="font-semibold"
                          style={{
                            width: proportionalWidths[i],
                            padding: `${headerPadding}px`,
                            borderTopWidth: `${headerBorderValues.top}px`,
                            borderTopStyle: borderStyle as any,
                            borderTopColor: headerBorderColor,
                            borderBottomWidth: `${headerBorderValues.bottom}px`,
                            borderBottomStyle: borderStyle as any,
                            borderBottomColor: headerBorderColor,
                            borderLeftWidth: `${hLeft}px`,
                            borderLeftStyle: borderStyle as any,
                            borderLeftColor: headerBorderColor,
                            borderRightWidth: `${hRight}px`,
                            borderRightStyle: borderStyle as any,
                            borderRightColor: headerBorderColor,
                            textAlign: (col.headerAlignment as any) || (col.alignment as any) || 'left',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {String(col?.header || 'Header')}
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ fontSize: `${fontSize}px`, color: cellColor, backgroundColor: cellBg === 'transparent' ? 'transparent' : cellBg }}>
                    {columns.map((col: Record<string, unknown>, i: number) => {
                      const isFirst = i === 0
                      const isLast = i === columns.length - 1
                      let cLeft = cellBorderValues.left
                      let cRight = cellBorderValues.right
                      let cTop = cellBorderValues.top
                      let cBottom = cellBorderValues.bottom

                      if (cellBorderType === 'cells' || cellBorderType === 'all') {
                        cLeft = isFirst ? cellBorderValues.left : cellBorderValues.left / 2
                        cRight = isLast ? cellBorderValues.right : cellBorderValues.right / 2
                      } else if (cellBorderType === 'row') {
                        cLeft = isFirst ? cellBorderValues.left : 0
                        cRight = isLast ? cellBorderValues.right : 0
                      } else if (cellBorderType === 'columns') {
                        cTop = 0
                        cBottom = 0
                        cLeft = isFirst ? cellBorderValues.left : cellBorderValues.left / 2
                        cRight = isLast ? cellBorderValues.right : cellBorderValues.right / 2
                      } else if (cellBorderType === 'none') {
                        cTop = 0
                        cBottom = 0
                        cLeft = 0
                        cRight = 0
                      }

                      return (
                        <td
                          key={`ch-td-${i}`}
                          style={{
                            width: proportionalWidths[i],
                            padding: `${cellPadding}px`,
                            borderTopWidth: `${cTop}px`,
                            borderTopStyle: borderStyle as any,
                            borderTopColor: borderColor,
                            borderBottomWidth: `${cBottom}px`,
                            borderBottomStyle: borderStyle as any,
                            borderBottomColor: borderColor,
                            borderLeftWidth: `${cLeft}px`,
                            borderLeftStyle: borderStyle as any,
                            borderLeftColor: borderColor,
                            borderRightWidth: `${cRight}px`,
                            borderRightStyle: borderStyle as any,
                            borderRightColor: borderColor,
                            textAlign: (col.alignment as any) || 'left',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {String(col?.field || 'field')}
                        </td>
                      )
                    })}
                  </tr>
                </tbody>
              </table>
            ) : (
              <div className="w-full min-h-[40px] flex items-center justify-center text-slate-400 text-xs border border-dashed border-slate-600 rounded bg-slate-900/40 p-2">
                📊 Tabela sem colunas (configure no painel)
              </div>
            )}
          </div>
        )

}
