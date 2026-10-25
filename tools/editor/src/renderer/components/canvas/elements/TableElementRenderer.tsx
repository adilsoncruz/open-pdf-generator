import React, { type MouseEvent as ReactMouseEvent } from 'react'
import type { Element } from '../../../store/templateStore'
import { getHeaderBorderValues, getCellBorderValues } from '../types'
import { processExpression, hasTransformations } from '../../../utils/expressionProcessor'

interface TableElementRendererProps {
  element: Element
  isSelected: boolean
  onMouseDown: (e: ReactMouseEvent) => void
}

export function TableElementRenderer({
  element,
  isSelected,
  onMouseDown,
}: TableElementRendererProps) {
        try {
          console.log('🔍 Renderizando tabela:', element.id, {
            hasColumns: !!element.columns,
            isArray: Array.isArray(element.columns),
            columnsLength: element.columns?.length,
            columns: element.columns,
            style: element.style
          })
          
          const columns = Array.isArray(element.columns) ? element.columns : []
          const hasValidColumns = columns.length > 0 && columns.every((col: unknown) => col && typeof col === 'object')
          
          console.log('  ✅ Colunas validadas:', hasValidColumns, columns)
          
          // Estilos da tabela
          const tableStyle = element.style || {}
          const headerBg = tableStyle.headerBackground || '#f0f0f0'
          const headerColor = tableStyle.headerColor || '#000000'
          const headerFontSize = tableStyle.headerFontSize || 12
          const fontSize = tableStyle.fontSize || 10
          const cellColor = tableStyle.cellColor || '#000000'
          const borderColor = tableStyle.borderColor || '#cccccc'
          const headerBorderColor = tableStyle.headerBorderColor || borderColor
          const borderStyle = tableStyle.borderStyle || 'solid'
          
          // Calcular valores de border dinamicamente
          const headerBorderValues = getHeaderBorderValues(tableStyle)
          const cellBorderValues = getCellBorderValues(tableStyle)
          
          // Paddings - Prioridade: specific > general > default
          const headerPaddingTop = tableStyle.headerPaddingTop ?? tableStyle.headerPadding ?? tableStyle.cellPadding ?? 5
          const headerPaddingRight = tableStyle.headerPaddingRight ?? tableStyle.headerPadding ?? tableStyle.cellPadding ?? 5
          const headerPaddingBottom = tableStyle.headerPaddingBottom ?? tableStyle.headerPadding ?? tableStyle.cellPadding ?? 5
          const headerPaddingLeft = tableStyle.headerPaddingLeft ?? tableStyle.headerPadding ?? tableStyle.cellPadding ?? 5
          
          const cellPaddingTop = tableStyle.cellPaddingTop ?? tableStyle.cellPadding ?? 5
          const cellPaddingRight = tableStyle.cellPaddingRight ?? tableStyle.cellPadding ?? 5
          const cellPaddingBottom = tableStyle.cellPaddingBottom ?? tableStyle.cellPadding ?? 5
          const cellPaddingLeft = tableStyle.cellPaddingLeft ?? tableStyle.cellPadding ?? 5
          
          // Calcular larguras proporcionais das colunas
          const columnWidths = columns.map((col: Record<string, unknown>) => (col.width as number) || 100)
          const totalWidth = columnWidths.reduce((sum: number, w: number) => sum + w, 0)
          const tableWidth = element.width || 400
          const proportionalWidths = columnWidths.map((w: number) => (w / totalWidth) * tableWidth)
          
          // Helper para converter alignment
          const getTextAlign = (alignment?: string): string => {
            switch (alignment?.toLowerCase()) {
              case 'center': return 'center'
              case 'right': return 'right'
              case 'justify': return 'justify'
              default: return 'left'
            }
          }
          
          return (
            <div
              className={`cursor-move select-none ${
                isSelected ? 'ring-2 ring-primary-500' : ''
              }`}
              style={{
                width: element.width || 400,
                minHeight: 50,
              }}
              onMouseDown={onMouseDown}
            >
              {hasValidColumns ? (
                <table className="w-full pointer-events-none border-collapse" style={{ tableLayout: 'fixed' }}>
                  <thead>
                    <tr
                      style={{
                        backgroundColor: headerBg,
                        color: headerColor,
                        fontSize: `${headerFontSize}px`,
                      }}
                    >
                      {columns.map((col: Record<string, unknown>, i: number) => {
                        const isFirstColumn = i === 0
                        const isLastColumn = i === columns.length - 1
                        const headerBorderType = tableStyle.headerBorderType
                        
                        // Calcular bordas baseado no tipo
                        let leftBorder = headerBorderValues.left
                        let rightBorder = headerBorderValues.right
                        
                        if (headerBorderType === 'columns') {
                          // Cada coluna tem borders, dividir bordas laterais adjacentes
                          leftBorder = isFirstColumn ? headerBorderValues.left : headerBorderValues.left / 2
                          rightBorder = isLastColumn ? headerBorderValues.right : headerBorderValues.right / 2
                        } else if (headerBorderType === 'row') {
                          
                          leftBorder = isFirstColumn ? headerBorderValues.left : 0
                          rightBorder = isLastColumn ? headerBorderValues.right : 0
                        }
                        
                        return (
                        <th
                          key={`header-${i}`}
                          className="font-semibold"
                          style={{
                              borderLeftWidth: `${leftBorder}px`,
                              borderLeftStyle: borderStyle,
                              borderLeftColor: headerBorderColor,
                              borderRightWidth: `${rightBorder}px`,
                              borderRightStyle: borderStyle,
                              borderRightColor: headerBorderColor,
                              borderTopWidth: `${headerBorderValues.top}px`,
                              borderTopStyle: borderStyle,
                              borderTopColor: headerBorderColor,
                              borderBottomWidth: `${headerBorderValues.bottom}px`,
                              borderBottomStyle: borderStyle,
                              borderBottomColor: headerBorderColor,
                            width: `${proportionalWidths[i]}px`,
                            minWidth: `${proportionalWidths[i]}px`,
                            maxWidth: `${proportionalWidths[i]}px`,
                              paddingTop: `${headerPaddingTop}px`,
                              paddingRight: `${headerPaddingRight}px`,
                              paddingBottom: `${headerPaddingBottom}px`,
                              paddingLeft: `${headerPaddingLeft}px`,
                            boxSizing: 'border-box',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                              textAlign: getTextAlign(col.headerAlignment || col.alignment || 'left'),
                              verticalAlign: col.headerVerticalAlignment || 'center',
                          }}
                        >
                          {String(col?.header || 'Header')}
                        </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      style={{
                        fontSize: `${fontSize}px`,
                        color: cellColor,
                      }}
                    >
                      {columns.map((col: Record<string, unknown>, i: number) => {
                        const isFirstColumn = i === 0
                        const isLastColumn = i === columns.length - 1
                        const cellBorderType = tableStyle.cellBorderType
                        
                        // Calcular bordas baseado no tipo
                        let leftBorder = cellBorderValues.left
                        let rightBorder = cellBorderValues.right
                        
                        if (cellBorderType === 'cells') {
                          
                          leftBorder = isFirstColumn ? cellBorderValues.left : cellBorderValues.left / 2
                          rightBorder = isLastColumn ? cellBorderValues.right : cellBorderValues.right / 2
                        } else if (cellBorderType === 'row') {
                          
                          leftBorder = isFirstColumn ? cellBorderValues.left : 0
                          rightBorder = isLastColumn ? cellBorderValues.right : 0
                        }
                        
                        return (
                        <td
                          key={`field-${i}`}
                          style={{
                              borderTopWidth: `${cellBorderValues.top}px`,
                              borderTopStyle: borderStyle,
                              borderTopColor: borderColor,
                              borderRightWidth: `${rightBorder}px`,
                              borderRightStyle: borderStyle,
                              borderRightColor: borderColor,
                              borderBottomWidth: `${cellBorderValues.bottom}px`,
                              borderBottomStyle: borderStyle,
                              borderBottomColor: borderColor,
                              borderLeftWidth: `${leftBorder}px`,
                              borderLeftStyle: borderStyle,
                              borderLeftColor: borderColor,
                            width: `${proportionalWidths[i]}px`,
                            minWidth: `${proportionalWidths[i]}px`,
                            maxWidth: `${proportionalWidths[i]}px`,
                              paddingTop: `${cellPaddingTop}px`,
                              paddingRight: `${cellPaddingRight}px`,
                              paddingBottom: `${cellPaddingBottom}px`,
                              paddingLeft: `${cellPaddingLeft}px`,
                            boxSizing: 'border-box',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                              textAlign: getTextAlign(col.alignment || 'left'),
                              verticalAlign: col.verticalAlignment || 'center',
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
                <div className="w-full h-full min-h-[50px] flex items-center justify-center text-gray-400 text-xs p-4">
                  📊 Table without columns<br />
                  <span className="text-xs">Select and add columns</span>
                </div>
              )}
            </div>
          )
        } catch (tableError) {
          console.error('Erro ao renderizar tabela:', element.id, tableError)
          return (
            <div
              className="cursor-move select-none border-2 border-red-300 bg-red-50 text-red-700 text-xs p-2"
              style={{
                width: element.width || 400,
                minHeight: 50,
              }}
              onMouseDown={onMouseDown}
            >
              ⚠️ Erro na tabela {element.id}<br/>
              {tableError instanceof Error ? tableError.message : 'Erro desconhecido'}
            </div>
          )
        }
}
