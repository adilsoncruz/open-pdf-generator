import React, { type CSSProperties } from 'react'
import type { Element } from '../../../store/templateStore'
import { getFontFamily } from '../types'

interface ListElementRendererProps {
  element: Element
  effectiveWidth?: number | string
  isSelected: boolean
  testData: Record<string, unknown> | null
  onMouseDown: () => void
}

export function ListElementRenderer({
  element,
  effectiveWidth,
  isSelected,
  testData,
  onMouseDown,
}: ListElementRendererProps) {
  const style = (element.style || {}) as Record<string, unknown>
  const fontSize = typeof style.fontSize === 'number' ? style.fontSize : 12
  const fontFamily = getFontFamily(style.fontFamily)
  const color = style.color || '#000000'
  const backgroundColor = style.backgroundColor || 'transparent'
  const itemSpacing = typeof element.itemSpacing === 'number' ? element.itemSpacing : 6
  const paddingLeft = typeof style.paddingLeft === 'number' ? style.paddingLeft : 0
  const paddingRight = typeof style.paddingRight === 'number' ? style.paddingRight : 0
  const paddingTop = typeof style.paddingTop === 'number' ? style.paddingTop : 0
  const paddingBottom = typeof style.paddingBottom === 'number' ? style.paddingBottom : 0

  const containerStyle: CSSProperties = {
    width: effectiveWidth || element.width || 300,
    minHeight: element.height || 60,
    backgroundColor,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    fontFamily,
    fontSize: `${fontSize}px`,
    color,
    display: 'flex',
    flexDirection: 'column',
    userSelect: 'none',
  }

  if (element.type === 'check_list') {
    let tasks: [string, boolean][] = [
      ['Primeira tarefa concluída', true],
      ['Segunda tarefa pendente', false],
      ['Terceira tarefa aprovada', true],
    ]

    if (element.dataBinding && testData && typeof testData[element.dataBinding] === 'object' && testData[element.dataBinding] !== null) {
      const bindingData = testData[element.dataBinding] as Record<string, unknown>
      tasks = Object.entries(bindingData).map(([key, val]) => [key, Boolean(val)])
    }

    const checkStyle = (element.checkStyle as string) || 'RECTANGLE'
    const boxRadius = checkStyle === 'CIRCLE' ? '50%' : checkStyle === 'BORDERED' ? '3px' : '0px'
    const boxSize = Math.max(10, fontSize)

    return (
      <div
        style={containerStyle}
        onMouseDown={onMouseDown}
        className={`cursor-pointer ${isSelected ? 'ring-2 ring-indigo-500 rounded' : ''}`}
      >
        {tasks.map(([label, isChecked], idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: idx < tasks.length - 1 ? `${itemSpacing}px` : 0,
              gap: '6px',
            }}
          >
            <div
              style={{
                width: `${boxSize}px`,
                height: `${boxSize}px`,
                borderRadius: boxRadius,
                border: `1.5px solid ${color}`,
                backgroundColor: isChecked ? color : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {isChecked && (
                <svg
                  viewBox="0 0 12 12"
                  style={{
                    width: `${boxSize * 0.75}px`,
                    height: `${boxSize * 0.75}px`,
                    fill: 'none',
                    stroke: backgroundColor && backgroundColor !== 'transparent' ? backgroundColor : '#FFFFFF',
                    strokeWidth: 2,
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                  }}
                >
                  <polyline points="2 6 5 9 10 3" />
                </svg>
              )}
            </div>
            <span style={{ lineHeight: 1.2, wordBreak: 'break-word' }}>{label}</span>
          </div>
        ))}
      </div>
    )
  }

  // List Element
  let items: string[] = ['Primeiro item da lista', 'Segundo item com detalhamento', 'Terceiro item de exemplo']
  if (element.dataBinding && testData && Array.isArray(testData[element.dataBinding])) {
    items = (testData[element.dataBinding] as unknown[]).map((it) => String(it))
  }

  const listMode = (element.listStyle as string) || 'BULLETED'
  const getPrefix = (idx: number): string => {
    switch (listMode) {
      case 'NUMBERED':
        return `${idx + 1}. `
      case 'BULLETED':
        return '• '
      case 'START':
        return '★ '
      case 'DASH':
        return '– '
      case 'DIAMOND':
        return '◆ '
      default:
        return '• '
    }
  }

  return (
    <div
      style={containerStyle}
      onMouseDown={onMouseDown}
      className={`cursor-pointer ${isSelected ? 'ring-2 ring-indigo-500 rounded' : ''}`}
    >
      {items.map((item, idx) => (
        <div
          key={idx}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            marginBottom: idx < items.length - 1 ? `${itemSpacing}px` : 0,
            gap: '4px',
          }}
        >
          <span style={{ flexShrink: 0, fontWeight: listMode === 'NUMBERED' ? 600 : 'normal' }}>
            {getPrefix(idx)}
          </span>
          <span style={{ lineHeight: 1.2, wordBreak: 'break-word' }}>{item}</span>
        </div>
      ))}
    </div>
  )
}
