import { useState } from 'react'
import { useTemplateStore, type Element, type ElementGroup, type ElementLocation } from '../store/templateStore'
import { Icon, Input, Select, Checkbox, Divider, ColorInput, Button, TextArea } from './atoms'
import type { IconName } from './atoms/Icon/Icon.types'
import { NumberField, ColorField, PropertyGroup, PropertyRow, TabBar, IconButton } from './molecules'

/**
 * Reusable panel header component with pin button
 */
function PanelHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { isPropertiesPanelPinned, togglePropertiesPanelPinned } = useTemplateStore()
  
  return (
    <div className="p-3 border-b theme-border flex items-center justify-between shrink-0">
      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-semibold theme-text truncate">{title}</h2>
        {subtitle && (
          <p className="text-xs theme-text-muted mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
      <IconButton
        icon={isPropertiesPanelPinned ? 'pin' : 'pin-off'}
        onClick={togglePropertiesPanelPinned}
        tooltip={isPropertiesPanelPinned ? 'Unpin panel' : 'Pin panel'}
        variant={isPropertiesPanelPinned ? 'default' : 'ghost'}
        className={isPropertiesPanelPinned ? 'text-blue-500' : ''}
      />
    </div>
  )
}

interface ElementInspectorProps {
  element: Element
  onUpdate: (field: string, value: any) => void
  onStyleUpdate: (field: string, value: any) => void
  parentName?: string
}

function StudioSlateElementInspector({ element, onUpdate, onStyleUpdate, parentName }: ElementInspectorProps) {
  const isTextElement = ['text', 'rich_text', 'link', 'static_text'].includes(element.type)
  const isMediaElement = ['image', 'barcode'].includes(element.type)
  const isShapeOrContainer = ['rectangle', 'container', 'line', 'spacer'].includes(element.type)

  const fillColor = element.style?.color || element.style?.fillColor || (isTextElement ? '#000000' : '#ffffff')
  const strokeColor = element.style?.strokeColor || element.style?.borderColor || '#374151'
  const strokeWidth = element.style?.strokeWidth ?? element.style?.borderWidth ?? 0
  const borderStyle = (element.style?.borderStyle as string) || 'solid'

  return (
    <div className="w-[300px] bg-slate-900 border-l border-slate-800 flex flex-col h-full shrink-0 select-none text-slate-200">
      {/* 1. Header */}
      <div className="border-b border-slate-800 bg-slate-950/40 shrink-0 px-3.5 pt-2.5 pb-0">
        <div className="flex items-center justify-between">
          <div className="relative pb-2">
            <span className="text-xs font-semibold text-slate-200 tracking-wide">
              Properties Panel
            </span>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/50 uppercase">
            {parentName ? `${parentName} / ${element.type}` : element.type}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {/* 2. Transform Section */}
        <div>
          <div className="text-xs font-semibold text-slate-200 mb-2">
            Transform
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* X */}
            <div className="flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500 transition">
              <span className="text-slate-500 font-mono text-xs w-4">X</span>
              <input
                type="number"
                value={element.x ?? 0}
                onChange={(e) => onUpdate('x', parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right pr-1"
              />
              <span className="text-slate-500 text-[10px]">pt</span>
            </div>

            {/* Y */}
            <div className="flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500 transition">
              <span className="text-slate-500 font-mono text-xs w-4">Y</span>
              <input
                type="number"
                value={element.y ?? 0}
                onChange={(e) => onUpdate('y', parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right pr-1"
              />
              <span className="text-slate-500 text-[10px]">pt</span>
            </div>

            {/* W */}
            <div className="flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500 transition">
              <span className="text-slate-500 font-mono text-xs w-4">W</span>
              {element.width === '100%' ? (
                <span className="w-full text-slate-200 font-mono text-xs text-right pr-1">100%</span>
              ) : (
                <input
                  type="number"
                  value={typeof element.width === 'number' ? element.width : 100}
                  onChange={(e) => onUpdate('width', parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right pr-1"
                />
              )}
              <span className="text-slate-500 text-[10px]">pt</span>
            </div>

            {/* H */}
            <div className="flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500 transition">
              <span className="text-slate-500 font-mono text-xs w-4">H</span>
              <input
                type="number"
                value={typeof element.height === 'number' ? element.height : 30}
                onChange={(e) => onUpdate('height', parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right pr-1"
              />
              <span className="text-slate-500 text-[10px]">pt</span>
            </div>
          </div>

          {/* Position Mode (Absolute / Relative) - Oculto para Container porque container é sempre relativo */}
          {element.type !== 'container' && (
            <div className="mt-2.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">Position</span>
                <span className="text-[10px] font-mono text-slate-500">
                  {(((element.positionMode || element.position || 'ABSOLUTE') as string).toUpperCase()) === 'RELATIVE' ? 'Relativo (fluxo)' : 'Absoluto (fixo)'}
                </span>
              </div>
              <div className="grid grid-cols-2 bg-slate-950 border border-slate-800 rounded-lg p-0.5 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    onUpdate('positionMode', 'ABSOLUTE')
                    onUpdate('position', 'absolute')
                  }}
                  className={`py-1 text-xs font-medium rounded transition text-center ${
                    (((element.positionMode || element.position || 'ABSOLUTE') as string).toUpperCase()) !== 'RELATIVE'
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  Absolute
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdate('positionMode', 'RELATIVE')
                    onUpdate('position', 'relative')
                    if (element.relativeOffsetY === undefined) {
                      onUpdate('relativeOffsetY', 10)
                    }
                  }}
                  className={`py-1 text-xs font-medium rounded transition text-center ${
                    (((element.positionMode || element.position || 'ABSOLUTE') as string).toUpperCase()) === 'RELATIVE'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  Relative
                </button>
              </div>

              {(((element.positionMode || element.position || 'ABSOLUTE') as string).toUpperCase()) === 'RELATIVE' && (
                <div className="flex items-center justify-between bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500 mt-1.5">
                  <span className="text-slate-400 text-xs">Offset Y</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={(element.relativeOffsetY as number) ?? 10}
                      onChange={(e) => onUpdate('relativeOffsetY', parseFloat(e.target.value) || 0)}
                      className="w-16 bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right pr-1"
                    />
                    <span className="text-slate-500 text-[10px]">pt</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Typography Section (for text elements) */}
        {isTextElement && (
          <div>
            <div className="text-xs font-semibold text-slate-200 mb-2">
              Typography
            </div>
            <div className="space-y-2">
              {/* Font Family */}
              <div className="relative">
                <select
                  value={element.style?.fontFamily || 'Helvetica'}
                  onChange={(e) => onStyleUpdate('fontFamily', e.target.value)}
                  className="w-full appearance-none bg-slate-950/70 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none pr-8 cursor-pointer"
                >
                  <option value="Inter">Inter</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times-Roman">Times New Roman</option>
                  <option value="Courier">Courier</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              {/* Font Size & Weight */}
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <select
                    value={element.style?.fontSize || 12}
                    onChange={(e) => onStyleUpdate('fontSize', parseFloat(e.target.value))}
                    className="w-full appearance-none bg-slate-950/70 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none pr-8 cursor-pointer font-mono"
                  >
                    {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map((size) => (
                      <option key={size} value={size}>{size}pt</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                <div className="relative">
                  <select
                    value={element.style?.fontWeight === 'bold' ? 'Bold' : (element.style?.fontStyle === 'italic' ? 'Italic' : 'Regular')}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === 'Bold') {
                        onStyleUpdate('fontWeight', 'bold')
                        onStyleUpdate('fontStyle', 'normal')
                      } else if (val === 'Italic') {
                        onStyleUpdate('fontWeight', 'normal')
                        onStyleUpdate('fontStyle', 'italic')
                      } else {
                        onStyleUpdate('fontWeight', 'normal')
                        onStyleUpdate('fontStyle', 'normal')
                      }
                    }}
                    className="w-full appearance-none bg-slate-950/70 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none pr-8 cursor-pointer"
                  >
                    <option value="Regular">Regular</option>
                    <option value="Bold">Bold</option>
                    <option value="Italic">Italic</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Segmented Control Alignment */}
              <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-1 gap-1">
                {[
                  { align: 'left', title: 'Alinhar à Esquerda', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h10M4 18h14" /> },
                  { align: 'center', title: 'Centralizar', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M7 12h10M5 18h14" /> },
                  { align: 'right', title: 'Alinhar à Direita', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M10 12h10M6 18h14" /> },
                  { align: 'justify', title: 'Justificar', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /> },
                ].map(({ align, title, icon }) => (
                  <button
                    key={align}
                    onClick={() => onStyleUpdate('alignment', align)}
                    className={`flex-1 py-1.5 flex items-center justify-center rounded transition ${
                      (element.style?.alignment || 'left') === align
                        ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                    title={title}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {icon}
                    </svg>
                  </button>
                ))}
              </div>

              {/* Text Margins / Paddings (Top, Right, Bottom, Left) */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Margens Internas (pt)</label>
                <div className="grid grid-cols-4 gap-1.5">
                  <div className="flex flex-col bg-slate-950/70 border border-slate-800 rounded-lg px-2 py-1 focus-within:border-indigo-500">
                    <span className="text-[9px] text-slate-500 font-mono">TOP</span>
                    <input
                      type="number"
                      min={0}
                      value={(element.style?.paddingTop ?? element.style?.marginTop ?? 0) as number}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0
                        onStyleUpdate('paddingTop', val)
                        onStyleUpdate('marginTop', val)
                      }}
                      className="bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right"
                    />
                  </div>
                  <div className="flex flex-col bg-slate-950/70 border border-slate-800 rounded-lg px-2 py-1 focus-within:border-indigo-500">
                    <span className="text-[9px] text-slate-500 font-mono">RIGHT</span>
                    <input
                      type="number"
                      min={0}
                      value={(element.style?.paddingRight ?? element.style?.marginRight ?? 0) as number}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0
                        onStyleUpdate('paddingRight', val)
                        onStyleUpdate('marginRight', val)
                      }}
                      className="bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right"
                    />
                  </div>
                  <div className="flex flex-col bg-slate-950/70 border border-slate-800 rounded-lg px-2 py-1 focus-within:border-indigo-500">
                    <span className="text-[9px] text-slate-500 font-mono">BOTTOM</span>
                    <input
                      type="number"
                      min={0}
                      value={(element.style?.paddingBottom ?? element.style?.marginBottom ?? 0) as number}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0
                        onStyleUpdate('paddingBottom', val)
                        onStyleUpdate('marginBottom', val)
                      }}
                      className="bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right"
                    />
                  </div>
                  <div className="flex flex-col bg-slate-950/70 border border-slate-800 rounded-lg px-2 py-1 focus-within:border-indigo-500">
                    <span className="text-[9px] text-slate-500 font-mono">LEFT</span>
                    <input
                      type="number"
                      min={0}
                      value={(element.style?.paddingLeft ?? element.style?.marginLeft ?? 0) as number}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0
                        onStyleUpdate('paddingLeft', val)
                        onStyleUpdate('marginLeft', val)
                      }}
                      className="bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right"
                    />
                  </div>
                </div>
              </div>

              {/* Text Value */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Conteúdo do Texto</label>
                <textarea
                  value={(element.value as string) || ''}
                  onChange={(e) => onUpdate('value', e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans resize-none"
                  placeholder="Texto..."
                />
              </div>

              {/* URL for Link */}
              {element.type === 'link' && (
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">URL de Destino</label>
                  <input
                    type="text"
                    value={(element.url as string) || ''}
                    onChange={(e) => onUpdate('url', e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Media Properties (Image / Barcode) */}
        {element.type === 'image' && (
          <div>
            <div className="text-xs font-semibold text-slate-200 mb-2">Image Source</div>
            <input
              type="text"
              value={(element.url as string) || (element.value as string) || ''}
              onChange={(e) => {
                onUpdate('url', e.target.value)
                onUpdate('value', e.target.value)
              }}
              placeholder="https://exemplo.com/imagem.png"
              className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        )}

        {element.type === 'barcode' && (
          <div>
            <div className="text-xs font-semibold text-slate-200 mb-2">Barcode Settings</div>
            <div className="space-y-2">
              <div className="relative">
                <select
                  value={element.barcodeType || 'code128'}
                  onChange={(e) => onUpdate('barcodeType', e.target.value)}
                  className="w-full appearance-none bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="code128">Code 128 (1D)</option>
                  <option value="qrcode">QR Code (2D)</option>
                  <option value="ean13">EAN-13</option>
                  <option value="pdf417">PDF417</option>
                </select>
              </div>
              <input
                type="text"
                value={(element.value as string) || ''}
                onChange={(e) => onUpdate('value', e.target.value)}
                placeholder="Valor do código..."
                className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>
        )}

        {/* Container specific */}
        {element.type === 'container' && (
          <div>
            <div className="text-xs font-semibold text-slate-200 mb-2">Container Settings</div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Nome do Container</label>
              <input
                type="text"
                value={(element.name as string) || ''}
                onChange={(e) => onUpdate('name', e.target.value)}
                placeholder="Container 1"
                className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>
          </div>
        )}

        {/* 4. Appearance Section */}
        <div>
          <div className="text-xs font-semibold text-slate-200 mb-2">
            Appearance
          </div>
          <div className="space-y-2.5">
            {/* Fill Color Swatch + Hex Input */}
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fillColor.startsWith('#') && fillColor.length === 7 ? fillColor : '#ffffff'}
                onChange={(e) => {
                  if (isTextElement) {
                    onStyleUpdate('color', e.target.value)
                  } else {
                    onStyleUpdate('fillColor', e.target.value)
                  }
                }}
                className="w-8 h-8 rounded-lg border border-slate-700 bg-slate-950 cursor-pointer p-0.5 shrink-0"
              />
              <div className="flex-1 flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500">
                <span className="text-slate-500 text-xs font-mono">#</span>
                <input
                  type="text"
                  value={fillColor.replace('#', '')}
                  onChange={(e) => {
                    const hex = `#${e.target.value.replace('#', '')}`
                    if (isTextElement) {
                      onStyleUpdate('color', hex)
                    } else {
                      onStyleUpdate('fillColor', hex)
                    }
                  }}
                  className="w-full bg-transparent text-slate-200 font-mono text-xs uppercase focus:outline-none ml-1"
                />
              </div>
            </div>

            {/* Stroke row */}
            <div className="flex items-center justify-between text-xs gap-2">
              <span className="text-slate-400 w-14 shrink-0">Stroke</span>
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <input
                  type="color"
                  value={strokeColor.startsWith('#') && strokeColor.length === 7 ? strokeColor : '#ffffff'}
                  onChange={(e) => onStyleUpdate('strokeColor', e.target.value)}
                  className="w-7 h-7 rounded border border-slate-700 bg-slate-950 cursor-pointer p-0.5 shrink-0"
                />
                <span className="text-slate-500 font-mono">/</span>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={strokeWidth}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0
                    onStyleUpdate('strokeWidth', val)
                    onStyleUpdate('borderWidth', val)
                  }}
                  className="w-16 bg-slate-950/70 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500 text-center"
                />
              </div>
            </div>

            {/* Border row */}
            <div className="flex items-center justify-between text-xs gap-2">
              <span className="text-slate-400 w-14 shrink-0">Border</span>
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <input
                  type="color"
                  value={(element.style?.borderColor as string)?.startsWith('#') ? (element.style.borderColor as string) : '#374151'}
                  onChange={(e) => onStyleUpdate('borderColor', e.target.value)}
                  className="w-7 h-7 rounded border border-slate-700 bg-slate-950 cursor-pointer p-0.5 shrink-0"
                />
                <select
                  value={borderStyle}
                  onChange={(e) => onStyleUpdate('borderStyle', e.target.value)}
                  className="flex-1 bg-slate-950/70 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="solid">━━ Solido</option>
                  <option value="dashed">╍╍ Tracejado</option>
                  <option value="dotted">┈┈ Pontilhado</option>
                  <option value="none">Nenhum</option>
                </select>
              </div>
            </div>

            {/* Corner Radius for Containers / Shapes */}
            {isShapeOrContainer && (
              <div className="flex items-center justify-between text-xs gap-2">
                <span className="text-slate-400 w-14 shrink-0">Radius</span>
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={element.style?.cornerRadius || 0}
                    onChange={(e) => onStyleUpdate('cornerRadius', parseFloat(e.target.value) || 0)}
                    className="w-20 bg-slate-950/70 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500 text-center"
                  />
                  <span className="text-slate-500 text-[10px]">px</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 5. Data Binding Section (Não exibido para Container) */}
        {element.type !== 'container' && (
          <div>
            <div className="text-xs font-semibold text-slate-200 mb-2">
              Data Binding
            </div>
            <div className="relative flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2 focus-within:border-indigo-500 transition">
              <input
                type="text"
                value={element.dataBinding || ''}
                onChange={(e) => onUpdate('dataBinding', e.target.value)}
                placeholder="{{ invoice.items }}"
                className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none pr-6"
              />
              {/* Emerald indicator dot when bound or active */}
              <div className="absolute right-3 flex items-center">
                <span className={`w-2 h-2 rounded-full ${
                  element.dataBinding ? 'bg-emerald-400 shadow-sm shadow-emerald-500/50' : 'bg-slate-600'
                }`} />
              </div>
            </div>
            {element.dataBinding && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-emerald-400/90 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Vinculado a dados dinâmicos</span>
              </div>
            )}
          </div>
        )}

        {/* 6. Print Condition Section (Todos os elementos) */}
        <div>
          <div className="text-xs font-semibold text-slate-200 mb-2">
            Print Condition
          </div>
          <div className="flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2 focus-within:border-indigo-500 transition">
            <input
              type="text"
              value={element.printCondition || ''}
              onChange={(e) => onUpdate('printCondition', e.target.value || null)}
              placeholder="Ex: invoice.total > 1000"
              className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none"
            />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Deixe vazio para imprimir sempre
          </span>
        </div>
      </div>
    </div>
  )
}

export default function PropertiesPanel() {
  // HOOKS DEVEM VIR PRIMEIRO (antes de qualquer return)
  const [activeTab, setActiveTab] = useState<string>('appearance')
  
  
  const store = useTemplateStore()
  const isPropertiesPanelPinned = store.isPropertiesPanelPinned
  const togglePropertiesPanelPinned = store.togglePropertiesPanelPinned
  
  const template = store.template
  const selectedElementIds = store.selectedElementIds
  const selectedElementLocation = store.selectedElementLocation
  const selectedGroupId = store.selectedGroupId
  const selectedLoopChildId = store.selectedLoopChildId
  const selectedLoopParentId = store.selectedLoopParentId
  const selectedContainerChildId = store.selectedContainerChildId
  const selectedContainerParentId = store.selectedContainerParentId
  const updateElement = store.updateElement
  const updateSelectedElements = store.updateSelectedElements
  const updateContainerChildElement = store.updateContainerChildElement
  const addElementToLoop = store.addElementToLoop
  const saveSnapshot = store.saveSnapshot
  const addElementToContainer = store.addElementToContainer
  
  const handleInputBlur = () => {
    saveSnapshot()
  }
  
  // Buscar elementos selecionados na location correta (PRIORIDADE sobre grupos)
  const selectedElements = (() => {
    if (selectedElementIds.length === 0) return []
    
    let elements: Element[] = []
    
    if (selectedElementLocation === 'header' && template.pageSettings.header) {
      elements = template.pageSettings.header.elements.filter((el) => selectedElementIds.includes(el.id))
    } else if (selectedElementLocation === 'footer' && template.pageSettings.footer) {
      elements = template.pageSettings.footer.elements.filter((el) => selectedElementIds.includes(el.id))
    } else if (selectedElementLocation === 'bodyBackground' && template.pageSettings.bodyBackground) {
      elements = template.pageSettings.bodyBackground.elements.filter((el) => selectedElementIds.includes(el.id))
    } else if (selectedElementLocation === 'summary' && template.summaryPage) {
      elements = template.summaryPage.elements.filter((el) => selectedElementIds.includes(el.id))
    } else {
      elements = template.page.filter((el) => selectedElementIds.includes(el.id))
    }
    
    return elements
  })()

  
  if (selectedLoopChildId && selectedLoopParentId) {
    // Encontrar o loop pai e o elemento filho
    let loopElement: Element | null = null
    
    if (selectedElementLocation === 'header' && template.pageSettings.header) {
      loopElement = template.pageSettings.header.elements.find(el => el.id === selectedLoopParentId) || null
    } else if (selectedElementLocation === 'footer' && template.pageSettings.footer) {
      loopElement = template.pageSettings.footer.elements.find(el => el.id === selectedLoopParentId) || null
    } else if (selectedElementLocation === 'summary' && template.summaryPage) {
      loopElement = template.summaryPage.elements.find(el => el.id === selectedLoopParentId) || null
    } else {
      loopElement = template.page.find(el => el.id === selectedLoopParentId) || null
    }
    
    if (loopElement && loopElement.elements) {
      const childElement = loopElement.elements.find((c: Element) => c.id === selectedLoopChildId)
      if (childElement) {
        return (
          <StudioSlateElementInspector
            element={childElement}
            parentName="Loop"
            onUpdate={(field, value) => {
              updateLoopChildElement(selectedLoopParentId, selectedLoopChildId, { [field]: value }, selectedElementLocation)
            }}
            onStyleUpdate={(field, value) => {
              updateLoopChildElement(selectedLoopParentId, selectedLoopChildId, { style: { ...childElement.style, [field]: value } }, selectedElementLocation)
            }}
          />
        )
      }
    }
  }

  if (selectedContainerChildId && selectedContainerParentId) {
      // Encontrar o loop pai e o elemento filho
      let containerElement: Element | null = null

      if (selectedElementLocation === 'header' && template.pageSettings.header) {
        containerElement = template.pageSettings.header.elements.find(el => el.id === selectedContainerParentId) || null
      } else if (selectedElementLocation === 'footer' && template.pageSettings.footer) {
        containerElement = template.pageSettings.footer.elements.find(el => el.id === selectedContainerParentId) || null
      } else if (selectedElementLocation === 'summary' && template.summaryPage) {
        containerElement = template.summaryPage.elements.find(el => el.id === selectedContainerParentId) || null
      } else {
        containerElement = template.page?.find(el => el.id === selectedContainerParentId) || null
      }

      if (containerElement && containerElement.elements) {
        const childElement = containerElement.elements.find((c: Element) => c.id === selectedContainerChildId)
        if (childElement) {
          return (
            <StudioSlateElementInspector
              element={childElement}
              parentName={containerElement.name || 'Container'}
              onUpdate={(field, value) => {
                updateContainerChildElement(selectedContainerParentId, selectedContainerChildId, { [field]: value }, selectedElementLocation)
              }}
              onStyleUpdate={(field, value) => {
                updateContainerChildElement(selectedContainerParentId, selectedContainerChildId, { style: { ...childElement.style, [field]: value } }, selectedElementLocation)
              }}
            />
          )
        }
      }
    }

  
  if (selectedElements.length === 0) {
    // Buscar grupo selecionado
    const selectedGroup = (() => {
      if (!selectedGroupId) return null
      
      if (selectedElementLocation === 'header' && template.pageSettings.header) {
        return template.pageSettings.header.groups?.find(g => g.id === selectedGroupId) || null
      } else if (selectedElementLocation === 'footer' && template.pageSettings.footer) {
        return template.pageSettings.footer.groups?.find(g => g.id === selectedGroupId) || null
      } else if (selectedElementLocation === 'bodyBackground' && template.pageSettings.bodyBackground) {
        return template.pageSettings.bodyBackground.groups?.find(g => g.id === selectedGroupId) || null
      } else if (selectedElementLocation === 'summary' && template.summaryPage) {
        return template.summaryPage.groups?.find(g => g.id === selectedGroupId) || null
      } else {
        return template.groups?.find(g => g.id === selectedGroupId) || null
      }
    })()
    
    
    if (selectedGroup) {
      return <GroupPropertiesPanel group={selectedGroup} location={selectedElementLocation} />
    }
    
    
    if (store.currentSection === 'summary' && template.summaryPage) {
      return <SummaryPropertiesPanel />
    }
    
    if (store.currentSection === 'header' && template.pageSettings.header) {
      return <HeaderPropertiesPanel />
    }
    
    if (store.currentSection === 'footer' && template.pageSettings.footer) {
      return <FooterPropertiesPanel />
    }
    
    if (store.currentSection === 'bodyBackground' && template.pageSettings.bodyBackground) {
      return <BackgroundPropertiesPanel />
    }
    
    
    return (
      <div className="w-[300px] bg-slate-900 border-l border-slate-800 flex flex-col h-full shrink-0 select-none">
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <h2 className="text-sm font-semibold text-slate-200">Propriedades da Página</h2>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
            {template.pageSettings.size || 'A4'}
          </span>
        </div>
        <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs text-slate-400">
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">Tamanho do Papel</label>
            <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 font-medium">
              {template.pageSettings.size} ({template.pageSettings.orientation || 'portrait'})
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">Margens do Documento (pt)</label>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950 border border-slate-800 p-2 rounded">
                <span className="text-slate-500 block text-[10px]">Superior:</span>
                <span className="font-mono text-slate-200">{template.pageSettings.margins.top} pt</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-2 rounded">
                <span className="text-slate-500 block text-[10px]">Inferior:</span>
                <span className="font-mono text-slate-200">{template.pageSettings.margins.bottom} pt</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-2 rounded">
                <span className="text-slate-500 block text-[10px]">Esquerda:</span>
                <span className="font-mono text-slate-200">{template.pageSettings.margins.left} pt</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-2 rounded">
                <span className="text-slate-500 block text-[10px]">Direita:</span>
                <span className="font-mono text-slate-200">{template.pageSettings.margins.right} pt</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">Seções Ativas</label>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center px-2 py-1.5 rounded bg-slate-950/60 border border-slate-800/60">
                <span className="text-slate-300">Cabeçalho (Header)</span>
                <span className={template.pageSettings.header ? "text-indigo-400 font-medium" : "text-slate-600"}>
                  {template.pageSettings.header ? `${template.pageSettings.header.height} pt` : 'Inativo'}
                </span>
              </div>
              <div className="flex justify-between items-center px-2 py-1.5 rounded bg-slate-950/60 border border-slate-800/60">
                <span className="text-slate-300">Rodapé (Footer)</span>
                <span className={template.pageSettings.footer ? "text-indigo-400 font-medium" : "text-slate-600"}>
                  {template.pageSettings.footer ? `${template.pageSettings.footer.height} pt` : 'Inativo'}
                </span>
              </div>
              <div className="flex justify-between items-center px-2 py-1.5 rounded bg-slate-950/60 border border-slate-800/60">
                <span className="text-slate-300">Sumário (Summary)</span>
                <span className={template.summaryPage ? "text-emerald-400 font-medium" : "text-slate-600"}>
                  {template.summaryPage ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] leading-relaxed">
            Selecione qualquer elemento no canvas ou na árvore para editar dimensões, tipografia, preenchimento e dados dinâmicos.
          </div>
        </div>
      </div>
    )
  }

  const isMultiSelection = selectedElements.length > 1
  const selectedElement = selectedElements[0] 
   console.log("selected element")
  const handleUpdate = (field: string, value: string | number | boolean | object | null) => {
    if (isMultiSelection) {
      updateSelectedElements({ [field]: value })
    } else {
      updateElement(selectedElement.id, { [field]: value }, selectedElementLocation)
    }
  }

  const handleStyleUpdate = (field: string, value: string | number | boolean | null) => {
    if (isMultiSelection) {
      updateSelectedElements({
        style: { ...selectedElement.style, [field]: value },
      })
    } else {
      updateElement(selectedElement.id, {
        style: { ...selectedElement.style, [field]: value },
      }, selectedElementLocation)
    }
  }

  // Icon mapping for tabs
  const getTabIcon = (id: string) => {
    const iconMap: Record<string, string> = {
      appearance: 'appearance',
      borders: 'borders',
      textfield: 'textfield',
      line: 'line',
      image: 'image',
      barcode: 'qrcode',
      general: 'general',
      columns: 'columns',
      styles: 'styles',
      loop: 'loop',
    }
    return iconMap[id] || 'settings'
  }

  // Define tabs based on element type
  const getTabs = () => {
    if (selectedElement.type === 'text' || selectedElement.type === 'static_text') {
      return [
        { id: 'appearance', label: 'Appearance' },
        { id: 'borders', label: 'Borders' },
        { id: 'textfield', label: 'Text' },
      ]
    } else if (selectedElement.type === 'rectangle') {
      return [
        { id: 'appearance', label: 'Appearance' },
        { id: 'borders', label: 'Borders' },
      ]
    } else if (selectedElement.type === 'line') {
      return [
        { id: 'appearance', label: 'Appearance' },
        { id: 'line', label: 'Line' },
      ]
    } else if (selectedElement.type === 'image') {
      return [
        { id: 'appearance', label: 'Appearance' },
        { id: 'image', label: 'Image' },
      ]
    } else if (selectedElement.type === 'barcode') {
      return [
        { id: 'appearance', label: 'Appearance' },
        { id: 'barcode', label: 'Code' },
      ]
    } else if (selectedElement.type === 'loop') {
      return [
        { id: 'appearance', label: 'Appearance' },
        { id: 'elements', label: 'elements' },
      ]
    } else if (selectedElement.type === 'container') {
      return [{ id: 'appearance', label: 'Appearance' }]
    } else if (selectedElement.type === 'table') {
      return [
        { id: 'general', label: 'General' },
        { id: 'columns', label: 'Columns' },
        { id: 'styles', label: 'Styles' },
      ]
    }
    return [{ id: 'appearance', label: 'Appearance' }]
  }

  if (selectedElement && selectedElement.type !== 'table') {
    return (
      <StudioSlateElementInspector
        element={selectedElement}
        onUpdate={(field, value) => {
          if (isMultiSelection) {
            updateSelectedElements({ [field]: value })
          } else {
            handleUpdate(field, value)
          }
        }}
        onStyleUpdate={(field, value) => {
          if (isMultiSelection) {
            updateSelectedElements({ style: { ...selectedElement.style, [field]: value } })
          } else {
            handleStyleUpdate(field, value)
          }
        }}
      />
    )
  }

  const tabs = getTabs()

  return (
    <div className="w-[360px] theme-bg-secondary border-l theme-border flex flex-col h-full">
      {/* Header with Pin Button */}
      <div className="p-3 border-b theme-border flex items-center justify-between">
        <div className="flex-1">
        <h2 className="text-sm font-semibold theme-text">Properties</h2>
        {isMultiSelection ? (
            <div className="mt-1.5 p-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded">
              <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
              {selectedElements.length} elements selected
            </p>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">
              Changes will be applied to all
            </p>
          </div>
        ) : (
            <p className="text-xs theme-text-muted mt-0.5">{selectedElement.type}</p>
          )}
        </div>
        <IconButton
          icon={isPropertiesPanelPinned ? 'pin' : 'pin-off'}
          onClick={togglePropertiesPanelPinned}
          tooltip={isPropertiesPanelPinned ? 'Unpin panel' : 'Pin panel'}
          variant={isPropertiesPanelPinned ? 'default' : 'ghost'}
          className={isPropertiesPanelPinned ? 'text-blue-500' : ''}
        />
      </div>

      {/* Tabs */}
      <TabBar
        tabs={tabs.map((tab) => ({
          id: tab.id,
          label: tab.label,
          icon: <Icon name={getTabIcon(tab.id) as IconName} size="sm" />,
        }))}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="border-b theme-border"
      />

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TEXT ELEMENT TABS (inclui static_text) */}
        {(selectedElement.type === 'text' || selectedElement.type === 'static_text') && (
          <>
            {/* APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <>
        
        {!isMultiSelection && (
                  <>
            <div className="space-y-1 mb-3">
              <label className="text-xs font-medium theme-text-muted">ID</label>
              <Input
              value={selectedElement.id}
              onChange={(e) => handleUpdate('id', e.target.value)}
                size="sm"
            />
          </div>
            <Divider className="my-3" />
                  </>
        )}

                {/* Location */}
                <PropertyGroup title="Location" collapsible={false}>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField
                      label="X"
                value={selectedElement.x}
                      onValueChange={(value) => handleUpdate('x', value)}
                onBlur={handleInputBlur}
                    />
                    <NumberField
                      label="Y"
                value={selectedElement.y}
                      onValueChange={(value) => handleUpdate('y', value)}
                onBlur={handleInputBlur}
              />
          </div>
          
          {/* Modo de Posicionamento */}
          <div className="mt-3">
                    <Select
              value={selectedElement.positionMode || 'ABSOLUTE'}
              onChange={(e) => handleUpdate('positionMode', e.target.value === 'ABSOLUTE' ? null : e.target.value)}
                      options={[
                        { value: 'ABSOLUTE', label: 'Absolute (fixed on canvas)' },
                        { value: 'RELATIVE', label: 'Relative (follows content above)' },
                      ]}
                    />
            {selectedElement.positionMode === 'RELATIVE' && (
              <>
                <p className="text-[10px] text-purple-500 mt-1 mb-2">
                  ↳ Positioned after the previous element in PDF
                </p>
                        <PropertyRow label="Offset Y (PDF):" labelWidth="lg">
                <div className="flex items-center gap-2">
                            <Input
                    type="number"
                    value={selectedElement.relativeOffsetY ?? 10}
                    onChange={(e) => handleUpdate('relativeOffsetY', parseFloat(e.target.value))}
                              className="w-20"
                              size="sm"
                  />
                  <span className="text-[10px] theme-text-muted">px</span>
                </div>
                        </PropertyRow>
                <p className="text-[10px] theme-text-muted mt-1">
                  Space between the previous element and this one
                </p>
              </>
            )}
          </div>
                </PropertyGroup>

                {/* Size */}
                <PropertyGroup title="Size" collapsible={false}>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField
                      label="W (Width)"
                  value={selectedElement.width}
                      onValueChange={(value) => handleUpdate('width', value)}
                    />
                    <NumberField
                      label="H (Height)"
                  value={selectedElement.height}
                      onValueChange={(value) => handleUpdate('height', value)}
                />
              </div>
                </PropertyGroup>

                {/* Color */}
                <PropertyGroup title="Color" collapsible={false}>
                    <div className="grid grid-cols-2 gap-3">
                    <ColorField
                      label="Text"
                          value={selectedElement.style?.color || '#000000'}
                      onValueChange={(color) => handleStyleUpdate('color', color)}
                    />
                    <ColorField
                      label="Background"
                          value={selectedElement.style?.backgroundColor && selectedElement.style?.backgroundColor !== 'transparent' ? selectedElement.style?.backgroundColor : '#FFFFFF'}
                      onValueChange={(color) => handleStyleUpdate('backgroundColor', color)}
                          disabled={!selectedElement.style?.backgroundColor || selectedElement.style?.backgroundColor === 'transparent'}
                        />
                      </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs theme-text-secondary">Transparent Background</span>
                    <Checkbox
                        checked={!selectedElement.style?.backgroundColor || selectedElement.style?.backgroundColor === 'transparent'}
                        onChange={(e) => handleStyleUpdate('backgroundColor', e.target.checked ? 'transparent' : '#FFFFFF')}
                      />
                    </div>
                </PropertyGroup>

                
                {selectedElement.type === 'text' && (
                  <PropertyGroup title="Print Condition" collapsible={false}>
                    <Input
                        value={selectedElement.printCondition || ''}
                        onChange={(e) => handleUpdate('printCondition', e.target.value || null)}
                        placeholder="Ex: invoice.total > 1000"
                      size="sm"
                      />
                      <p className="text-xs theme-text-muted mt-1">
                        Leave empty to always print
                      </p>
                      
                      {/* Exemplos de Condicionais */}
                      <div className="mt-2 p-2 theme-bg-tertiary rounded border theme-border">
                        <p className="text-xs font-medium theme-text mb-1">Examples:</p>
                        <div className="space-y-0.5 text-xs theme-text-secondary font-mono">
                          <div>• invoice.total &gt; 1000</div>
                          <div>• customer.type == 'VIP'</div>
                          <div>• items.length &gt; 0</div>
                          <div>• discount &gt; 0</div>
                          <div>• status in ['pending', 'approved']</div>
                          <div>• total &gt;= 100 && total &lt; 500</div>
                        </div>
                      </div>
                  </PropertyGroup>
                )}
              </>
            )}

            {/* BORDERS TAB */}
            {activeTab === 'borders' && (
          <>
                {/* Paddings */}
                <PropertyGroup title="Paddings" collapsible={false}>
                    <div className="flex items-center mb-2">
                    <Checkbox
                        id="same-padding"
                        checked={selectedElement.style?.samePadding || false}
                        onChange={(e) => {
                          const checked = e.target.checked
                          if (checked) {
                            // Quando marca, usa o valor do Left em todos
                            const value = selectedElement.style?.paddingLeft || 0
                            const newStyle = {
                              ...selectedElement.style,
                              samePadding: true,
                              paddingLeft: value,
                              paddingRight: value,
                              paddingTop: value,
                              paddingBottom: value,
                            }
                            if (isMultiSelection) {
                              updateSelectedElements({ style: newStyle })
                            } else {
                              updateElement(selectedElement.id, { style: newStyle }, selectedElementLocation)
                            }
                          } else {
                            // Desmarca apenas o checkbox
                            const newStyle = {
                              ...selectedElement.style,
                              samePadding: false,
                            }
                            if (isMultiSelection) {
                              updateSelectedElements({ style: newStyle })
                            } else {
                              updateElement(selectedElement.id, { style: newStyle }, selectedElementLocation)
                            }
                          }
                        }}
                      />
                      <label htmlFor="same-padding" className="ml-2 text-xs theme-text">
                        Use the same value for every padding
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                    <NumberField
                      label="Left"
                          value={selectedElement.style?.paddingLeft || selectedElement.style?.paddingX || 0}
                      onValueChange={(value) => {
                            if (selectedElement.style?.samePadding) {
                              // Se checkbox marcado, atualiza todos de uma vez
                              const newStyle = {
                                ...selectedElement.style,
                                paddingLeft: value,
                                paddingRight: value,
                                paddingTop: value,
                                paddingBottom: value,
                              }
                              if (isMultiSelection) {
                                updateSelectedElements({ style: newStyle })
                              } else {
                                updateElement(selectedElement.id, { style: newStyle }, selectedElementLocation)
                              }
                            } else {
                              handleStyleUpdate('paddingLeft', value)
                            }
                          }}
                      min={0}
                      step={1}
                    />
                    <NumberField
                      label="Right"
                          value={selectedElement.style?.paddingRight || selectedElement.style?.paddingX || 0}
                      onValueChange={(value) => handleStyleUpdate('paddingRight', value)}
                      min={0}
                      step={1}
                          disabled={selectedElement.style?.samePadding || false}
                        />
                      </div>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <NumberField
                      label="Top"
                          value={selectedElement.style?.paddingTop || selectedElement.style?.paddingY || 0}
                      onValueChange={(value) => handleStyleUpdate('paddingTop', value)}
                      min={0}
                      step={1}
                          disabled={selectedElement.style?.samePadding || false}
                        />
                    <NumberField
                      label="Bottom"
                          value={selectedElement.style?.paddingBottom || selectedElement.style?.paddingY || 0}
                      onValueChange={(value) => handleStyleUpdate('paddingBottom', value)}
                      min={0}
                      step={1}
                          disabled={selectedElement.style?.samePadding || false}
                        />
                      </div>
                </PropertyGroup>

                {/* Borders */}
                <PropertyGroup title="Borders" collapsible={false}>
                  {/* Border Preview Box */}
                  <div className="mb-3 p-3 theme-bg-tertiary border theme-border rounded flex items-center justify-center">
                    <div 
                      className="w-32 h-32 bg-white"
                      style={{
                        borderTopWidth: `${selectedElement.style?.borderTopWidth ?? selectedElement.style?.borderWidth ?? 0}px`,
                        borderTopStyle: selectedElement.style?.borderStyle || 'solid',
                        borderTopColor: selectedElement.style?.borderColor || '#000000',
                        borderRightWidth: `${selectedElement.style?.borderRightWidth ?? selectedElement.style?.borderWidth ?? 0}px`,
                        borderRightStyle: selectedElement.style?.borderStyle || 'solid',
                        borderRightColor: selectedElement.style?.borderColor || '#000000',
                        borderBottomWidth: `${selectedElement.style?.borderBottomWidth ?? selectedElement.style?.borderWidth ?? 0}px`,
                        borderBottomStyle: selectedElement.style?.borderStyle || 'solid',
                        borderBottomColor: selectedElement.style?.borderColor || '#000000',
                        borderLeftWidth: `${selectedElement.style?.borderLeftWidth ?? selectedElement.style?.borderWidth ?? 0}px`,
                        borderLeftStyle: selectedElement.style?.borderStyle || 'solid',
                        borderLeftColor: selectedElement.style?.borderColor || '#000000',
                      }}
                    />
                  </div>

                  <div className="space-y-3">
                    <PropertyRow label="Pen Color:" labelWidth="lg">
                      <ColorInput
                        value={selectedElement.style?.borderColor || '#000000'}
                        onChange={(e) => handleStyleUpdate('borderColor', e.target.value)}
                      />
                    </PropertyRow>

                    <PropertyRow label="Pen Style:" labelWidth="lg">
                      <div className="flex gap-1 flex-1">
                        {[
                          { value: 'solid', label: 'Solid' },
                          { value: 'dashed', label: 'Dashed' },
                          { value: 'dotted', label: 'Dotted' }
                        ].map((style) => (
                          <Button
                            key={style.value}
                            variant={((selectedElement.style?.borderStyle || 'solid') === style.value) ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => handleStyleUpdate('borderStyle', style.value)}
                            className="flex-1 flex-col py-2"
                          >
                            <div 
                              className="h-0 mx-auto w-full"
                              style={{ 
                                borderTopWidth: '2px',
                                borderTopStyle: style.value as 'solid' | 'dashed' | 'dotted',
                                borderTopColor: (selectedElement.style?.borderStyle || 'solid') === style.value ? '#fff' : '#666'
                              }}
                            />
                            <span className="mt-1 block text-[10px]">
                              {style.label}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </PropertyRow>

                    <PropertyRow label="Pen Width:" labelWidth="lg">
                      <Input
                        type="number"
                        value={selectedElement.style?.borderWidth ?? 0}
                        onChange={(e) => handleStyleUpdate('borderWidth', parseFloat(e.target.value) || 0)}
                        size="sm"
                        className="w-24"
                        min={0}
                        max={10}
                        step={0.5}
                      />
                    </PropertyRow>
                    
                    {/* Default border styles */}
                    <div className="pt-2">
                      <label className="block text-xs theme-text-secondary mb-2">Default borders styles:</label>
                      {(() => {
                        const bw = selectedElement.style?.borderWidth ?? 0
                        const top = selectedElement.style?.borderTopWidth ?? bw
                        const right = selectedElement.style?.borderRightWidth ?? bw
                        const bottom = selectedElement.style?.borderBottomWidth ?? bw
                        const left = selectedElement.style?.borderLeftWidth ?? bw
                        const isAll = top > 0 && right > 0 && bottom > 0 && left > 0
                        const isNone = top === 0 && right === 0 && bottom === 0 && left === 0
                        const isTopBottom = top > 0 && bottom > 0 && right === 0 && left === 0
                        const isLeftRight = left > 0 && right > 0 && top === 0 && bottom === 0
                        return (
                      <div className="flex gap-2">
                        {/* All borders */}
                        <button
                          onClick={() => {
                            const width = selectedElement.style?.borderWidth || 0
                            if (isMultiSelection) {
                              updateSelectedElements({
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: width,
                                  borderRightWidth: width,
                                  borderBottomWidth: width,
                                  borderLeftWidth: width,
                                }
                              })
                            } else {
                              updateElement(selectedElement.id, {
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: width,
                                  borderRightWidth: width,
                                  borderBottomWidth: width,
                                  borderLeftWidth: width,
                                }
                              }, selectedElementLocation)
                            }
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isAll ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="All borders"
                        >
                          <div className={`w-6 h-6 border-2 ${isAll ? 'border-primary-500' : 'border-gray-500'}`}></div>
                        </button>
                        
                        {/* No borders */}
                        <button
                          onClick={() => {
                            if (isMultiSelection) {
                              updateSelectedElements({
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: 0,
                                  borderRightWidth: 0,
                                  borderBottomWidth: 0,
                                  borderLeftWidth: 0,
                                }
                              })
                            } else {
                              updateElement(selectedElement.id, {
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: 0,
                                  borderRightWidth: 0,
                                  borderBottomWidth: 0,
                                  borderLeftWidth: 0,
                                }
                              }, selectedElementLocation)
                            }
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isNone ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="No borders"
                        >
                          <div className={`w-6 h-6 border-2 border-dashed ${isNone ? 'border-primary-400' : 'border-gray-300'}`}></div>
                        </button>
                        
                        {/* Top and bottom */}
                        <button
                          onClick={() => {
                            const width = selectedElement.style?.borderWidth || 0
                            if (isMultiSelection) {
                              updateSelectedElements({
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: width,
                                  borderRightWidth: 0,
                                  borderBottomWidth: width,
                                  borderLeftWidth: 0,
                                }
                              })
                            } else {
                              updateElement(selectedElement.id, {
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: width,
                                  borderRightWidth: 0,
                                  borderBottomWidth: width,
                                  borderLeftWidth: 0,
                                }
                              }, selectedElementLocation)
                            }
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isTopBottom ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="Top and bottom borders"
                        >
                          <div className={`w-6 h-6 border-t-2 border-b-2 ${isTopBottom ? 'border-primary-500' : 'border-gray-500'}`}></div>
                        </button>
                        
                        {/* Left and right */}
                        <button
                          onClick={() => {
                            const width = selectedElement.style?.borderWidth || 0
                            if (isMultiSelection) {
                              updateSelectedElements({
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: 0,
                                  borderRightWidth: width,
                                  borderBottomWidth: 0,
                                  borderLeftWidth: width,
                                }
                              })
                            } else {
                              updateElement(selectedElement.id, {
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: 0,
                                  borderRightWidth: width,
                                  borderBottomWidth: 0,
                                  borderLeftWidth: width,
                                }
                              }, selectedElementLocation)
                            }
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isLeftRight ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="Left and right borders"
                        >
                          <div className={`w-6 h-6 border-l-2 border-r-2 ${isLeftRight ? 'border-primary-500' : 'border-gray-500'}`}></div>
                        </button>
                      </div>
                        )
                      })()}
                    </div>
                  </div>
                </PropertyGroup>

                <PropertyGroup title="Corner Radius" collapsible={false}>
                  <PropertyRow label="Radius:" labelWidth="lg">
                    <div className="flex items-center gap-2">
                      <Input
                      type="number"
                      value={selectedElement.style?.cornerRadius || 0}
                      onChange={(e) => handleStyleUpdate('cornerRadius', parseFloat(e.target.value))}
                        size="sm"
                        className="w-24"
                        min={0}
                        step={1}
                    />
                    <span className="text-xs theme-text-muted">px</span>
                  </div>
                  </PropertyRow>
                </PropertyGroup>
              </>
            )}

            {/* TEXT FIELD TAB */}
            {activeTab === 'textfield' && (
              <>
                <PropertyGroup title="Content" collapsible={false}>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium theme-text-muted">Text</label>
                      <TextArea
                value={selectedElement.value || ''}
                onChange={(e) => handleUpdate('value', e.target.value)}
                rows={3}
              />
            </div>
                    
                    {selectedElement.type === 'text' && (
                      <div className="space-y-1">
                        <label className="text-xs font-medium theme-text-muted">Data Binding</label>
                        <Input
                value={selectedElement.dataBinding || ''}
                onChange={(e) => handleUpdate('dataBinding', e.target.value)}
                placeholder="e.g., user.name"
                          size="sm"
                          className="font-mono"
              />
            </div>
                    )}
                  </div>
                </PropertyGroup>

                {/* Font Section - Jasper Style */}
                <PropertyGroup title="Font" collapsible={false}>
                    {/* Font Family + Size in one line */}
                    <div className="flex items-center gap-1">
                    <Select
                value={selectedElement.style?.fontFamily || 'Helvetica'}
                onChange={(e) => handleStyleUpdate('fontFamily', e.target.value)}
                      className="flex-1 min-w-0"
                      options={[
                        { value: 'Helvetica', label: 'Helvetica' },
                        { value: 'Helvetica-Bold', label: 'Helvetica Bold' },
                        { value: 'Times', label: 'Times New Roman' },
                        { value: 'Courier', label: 'Courier New' },
                      ]}
                    />
                      
                    <Input
                type="number"
                value={selectedElement.style?.fontSize || 12}
                onChange={(e) => handleStyleUpdate('fontSize', parseFloat(e.target.value))}
                      className="w-11 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      size="sm"
                      min={6}
                      max={72}
                      />
                      
                      <button
                        onClick={() => {
                          const currentSize = selectedElement.style?.fontSize || 12
                          handleStyleUpdate('fontSize', Math.max(6, currentSize - 1))
                        }}
                        className="w-7 h-7 text-xs border theme-border rounded bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition flex items-center justify-center flex-shrink-0"
                        title="Decrease size"
                      >
                        A-
                      </button>
                      <button
                        onClick={() => {
                          const currentSize = selectedElement.style?.fontSize || 12
                          handleStyleUpdate('fontSize', Math.min(72, currentSize + 1))
                        }}
                        className="w-7 h-7 text-xs border theme-border rounded bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition flex items-center justify-center flex-shrink-0"
                        title="Increase size"
                      >
                        A+
                      </button>
            </div>

                    {/* Style Buttons - B I U S */}
                    <div className="flex gap-1">
                <button
                  onClick={() => {
                    const currentWeight = selectedElement.style?.fontWeight || 'normal'
                    handleStyleUpdate('fontWeight', currentWeight === 'bold' ? 'normal' : 'bold')
                  }}
                        className={`w-10 h-10 text-sm font-bold border rounded transition ${
                    selectedElement.style?.fontWeight === 'bold'
                            ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                            : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                        title="Bold"
                >
                  B
                </button>
                <button
                  onClick={() => {
                    const currentStyle = selectedElement.style?.fontStyle || 'normal'
                    handleStyleUpdate('fontStyle', currentStyle === 'italic' ? 'normal' : 'italic')
                  }}
                        className={`w-10 h-10 text-sm italic border rounded transition ${
                    selectedElement.style?.fontStyle === 'italic'
                            ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                            : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                        title="Italic"
                >
                  I
                </button>
                <button
                  onClick={() => {
                    const currentDecoration = selectedElement.style?.textDecoration || 'none'
                    handleStyleUpdate('textDecoration', currentDecoration === 'underline' ? 'none' : 'underline')
                  }}
                        className={`w-10 h-10 text-sm underline border rounded transition ${
                    selectedElement.style?.textDecoration === 'underline'
                            ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                            : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                        title="Underline"
                >
                  U
                </button>
                      <button
                        onClick={() => {
                          const currentDecoration = selectedElement.style?.textDecoration || 'none'
                          handleStyleUpdate('textDecoration', currentDecoration === 'line-through' ? 'none' : 'line-through')
                        }}
                        className={`w-10 h-10 text-sm line-through border rounded transition ${
                          selectedElement.style?.textDecoration === 'line-through'
                            ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                            : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                        }`}
                        title="Strikethrough"
                      >
                        S
                </button>
                </div>

                    {/* Alignment Section */}
            <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Alignment</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">Horizontal</label>
              <div className="flex gap-1">
                <button
                  onClick={() => handleStyleUpdate('alignment', 'left')}
                  className={`w-10 h-10 flex items-center justify-center border rounded transition ${
                    (selectedElement.style?.alignment || 'left') === 'left'
                              ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                      : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                  title="Align left"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="2" y="3" width="12" height="2" />
                    <rect x="2" y="7" width="8" height="2" />
                    <rect x="2" y="11" width="10" height="2" />
                  </svg>
                </button>
                <button
                  onClick={() => handleStyleUpdate('alignment', 'center')}
                  className={`w-10 h-10 flex items-center justify-center border rounded transition ${
                    selectedElement.style?.alignment === 'center'
                              ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                      : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                  title="Center"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="2" y="3" width="12" height="2" />
                    <rect x="4" y="7" width="8" height="2" />
                    <rect x="3" y="11" width="10" height="2" />
                  </svg>
                </button>
                <button
                  onClick={() => handleStyleUpdate('alignment', 'right')}
                  className={`w-10 h-10 flex items-center justify-center border rounded transition ${
                    selectedElement.style?.alignment === 'right'
                              ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                      : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                  title="Align right"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="2" y="3" width="12" height="2" />
                    <rect x="6" y="7" width="8" height="2" />
                    <rect x="4" y="11" width="10" height="2" />
                  </svg>
                </button>
                <button
                  onClick={() => handleStyleUpdate('alignment', 'justify')}
                  className={`w-10 h-10 flex items-center justify-center border rounded transition ${
                    selectedElement.style?.alignment === 'justify'
                              ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                      : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                  title="Justify"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="2" y="3" width="12" height="2" />
                    <rect x="2" y="7" width="12" height="2" />
                    <rect x="2" y="11" width="12" height="2" />
                  </svg>
                </button>
              </div>
            </div>

            <div>
                      <label className="block text-xs theme-text-secondary mb-1">Vertical</label>
              <div className="flex gap-1">
                <button
                  onClick={() => handleStyleUpdate('verticalAlignment', 'top')}
                  className={`w-10 h-10 flex items-center justify-center border rounded transition ${
                    selectedElement.style?.verticalAlignment === 'top'
                              ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                      : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                  title="Top"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="2" y="2" width="12" height="2" />
                    <rect x="5" y="6" width="6" height="1.5" />
                    <rect x="5" y="9" width="6" height="1.5" />
                  </svg>
                </button>
                <button
                  onClick={() => handleStyleUpdate('verticalAlignment', 'center')}
                  className={`w-10 h-10 flex items-center justify-center border rounded transition ${
                    (selectedElement.style?.verticalAlignment || 'center') === 'center'
                              ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                      : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                  title="Center vertical"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="5" y="3" width="6" height="1.5" />
                    <rect x="2" y="7" width="12" height="2" />
                    <rect x="5" y="11.5" width="6" height="1.5" />
                  </svg>
                </button>
                <button
                  onClick={() => handleStyleUpdate('verticalAlignment', 'bottom')}
                  className={`w-10 h-10 flex items-center justify-center border rounded transition ${
                    selectedElement.style?.verticalAlignment === 'bottom'
                              ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                      : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                  title="Bottom"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="5" y="4.5" width="6" height="1.5" />
                    <rect x="5" y="7.5" width="6" height="1.5" />
                    <rect x="2" y="12" width="12" height="2" />
                  </svg>
                </button>
              </div>
            </div>
                  </div>
                </div>
            </PropertyGroup>

            <PropertyGroup title="Multiline" collapsible={false}>
                  <div className="space-y-3">
                    <Checkbox
                  id="multiline"
                  checked={selectedElement.style?.multiline || false}
                  onChange={(e) => handleStyleUpdate('multiline', e.target.checked)}
                      label="Line wrap"
                />
              {selectedElement.style?.multiline && (
                <>
                  <NumberField
                    label="1st Line Indent (pt)"
                    value={selectedElement.style?.firstLineIndent || 0}
                    onValueChange={(value) => handleStyleUpdate('firstLineIndent', value)}
                    min={0}
                    step={5}
                  />
                  
                  <div className="space-y-1">
                    <NumberField
                      label="Line Height"
                      value={selectedElement.style?.lineHeight ?? ''}
                      onValueChange={(value) => handleStyleUpdate('lineHeight', value || null)}
                      min={0.5}
                      max={3}
                      step={0.1}
                    />
                    <p className="text-[10px] theme-text-muted">Ex: 1.0 (no space), 1.2, 1.5</p>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-medium theme-text-muted">Overflow (text height)</label>
                    <Select
                      value={selectedElement.style?.overflow || 'visible'}
                      onChange={(e) => handleStyleUpdate('overflow', e.target.value)}
                      options={[
                        { value: 'visible', label: 'visible - Content can exceed height' },
                        { value: 'hidden', label: 'hidden - Clips content at height' },
                        { value: 'auto', label: 'auto - Height adjusts to content' },
                      ]}
                    />
                    <p className="text-[10px] theme-text-muted">
                      {selectedElement.style?.overflow === 'auto' 
                        ? '✓ Relative elements will be positioned after the actual content'
                        : selectedElement.style?.overflow === 'hidden'
                        ? '✓ Text will be clipped if it exceeds the defined height'
                        : 'Default: content can exceed the defined height'}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium theme-text-muted">Internal Padding (pt)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <NumberField
                        label="Top"
                          value={selectedElement.style?.paddingTop || 0}
                        onValueChange={(value) => handleStyleUpdate('paddingTop', value)}
                        min={0}
                        step={1}
                      />
                      <NumberField
                        label="Bottom"
                          value={selectedElement.style?.paddingBottom || 0}
                        onValueChange={(value) => handleStyleUpdate('paddingBottom', value)}
                        min={0}
                        step={1}
                      />
                      <NumberField
                        label="Left"
                          value={selectedElement.style?.paddingLeft || 0}
                        onValueChange={(value) => handleStyleUpdate('paddingLeft', value)}
                        min={0}
                        step={1}
                      />
                      <NumberField
                        label="Right"
                          value={selectedElement.style?.paddingRight || 0}
                        onValueChange={(value) => handleStyleUpdate('paddingRight', value)}
                        min={0}
                        step={1}
                      />
                    </div>
                  </div>
                </>
              )}
                  </div>
              </PropertyGroup>
              </>
            )}
          </>
        )}

        {/* LINE ELEMENT TABS */}
        {selectedElement.type === 'line' && (
          <>
            {/* APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <>
                {!isMultiSelection && (
                  <>
                    <div className="space-y-1 mb-3">
                      <label className="text-xs font-medium theme-text-muted">ID</label>
                      <Input
                        value={selectedElement.id}
              onChange={(e) => handleUpdate('id', e.target.value)}
                        size="sm"
                      />
                    </div>
                    <Divider className="my-3" />
                  </>
                )}

                <PropertyGroup title="Print Condition" collapsible={false}>
                  <Input
                    value={selectedElement.printCondition || ''}
                    onChange={(e) => handleUpdate('printCondition', e.target.value || null)}
                    placeholder="Ex: invoice.total > 1000"
                    size="sm"
                  />
                  <p className="text-xs theme-text-muted mt-1">
                    Leave empty to always print
                  </p>
                  
                  {/* Exemplos de Condicionais */}
                  <div className="mt-2 p-2 theme-bg-tertiary rounded border theme-border">
                    <p className="text-xs font-medium theme-text mb-1">Examples:</p>
                    <div className="space-y-0.5 text-xs theme-text-secondary font-mono">
                      <div>• invoice.total &gt; 1000</div>
                      <div>• customer.type == 'VIP'</div>
                      <div>• status != 'cancelled'</div>
                      <div>• items.length &gt; 0</div>
                      <div>• status in ['pending', 'approved']</div>
                      <div>• total &gt;= 100 && total &lt; 500</div>
                    </div>
                  </div>
                </PropertyGroup>
              </>
            )}

            {/* LINE TAB */}
            {activeTab === 'line' && (
              <>
                <PropertyGroup title="Position" collapsible={false}>
                    <div className="grid grid-cols-2 gap-3">
                    <NumberField
                      label="X"
                      value={selectedElement.x}
                      onValueChange={(value) => handleUpdate('x', value)}
                    />
                    <NumberField
                      label="Y"
                      value={selectedElement.y}
                      onValueChange={(value) => handleUpdate('y', value)}
                    />
                  </div>
                </PropertyGroup>

                <PropertyGroup title="Size" collapsible={false}>
                    <div className="grid grid-cols-2 gap-3">
                  <div>
                      <NumberField
                        label="Width"
                        value={typeof selectedElement.width === 'string' ? undefined : (selectedElement.width ?? (selectedElement.x2 ? selectedElement.x2 - selectedElement.x : 100))}
                        onValueChange={(value) => handleUpdate('width', value)}
                        disabled={selectedElement.width === '100%'}
                      />
                      <label className="flex items-center mt-2 cursor-pointer">
                        <Checkbox
                          checked={selectedElement.width === '100%'}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateSelectedElements({ width: '100%', x: 0 })
                            } else {
                              updateSelectedElements({ width: 100 })
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-xs theme-text-secondary">100% Width</span>
                      </label>
                  </div>
                  <div>
                      <NumberField
                        label="Height"
                        value={typeof selectedElement.height === 'string' ? undefined : (selectedElement.height ?? (selectedElement.y2 ? selectedElement.y2 - selectedElement.y : 0))}
                        onValueChange={(value) => handleUpdate('height', value)}
                        disabled={selectedElement.height === '100%'}
                      />
                      <label className="flex items-center mt-2 cursor-pointer">
                        <Checkbox
                          checked={selectedElement.height === '100%'}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateSelectedElements({ height: '100%', y: 0 })
                            } else {
                              updateSelectedElements({ height: 0 })
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-xs theme-text-secondary">100% Height</span>
                      </label>
                      </div>
                    </div>
                  <p className="text-xs theme-text-muted mt-2">
                    Line is drawn from (X, Y) to (X + Width, Y + Height)
                  </p>
                </PropertyGroup>

                <PropertyGroup title="Style" collapsible={false}>
                  <PropertyRow label="Line Color" labelWidth="lg">
                    <ColorInput
                    value={selectedElement.style?.strokeColor || '#000000'}
                    onChange={(e) => handleStyleUpdate('strokeColor', e.target.value)}
                    />
                  </PropertyRow>

                  <div className="mt-2">
                    <NumberField
                      label="Thickness (pt)"
                    value={selectedElement.style?.strokeWidth ?? 1}
                      onValueChange={(value) => handleStyleUpdate('strokeWidth', value || 0.5)}
                      min={0.5}
                      max={20}
                      step={0.5}
                  />
                  <p className="text-xs theme-text-muted mt-1">
                    Min: 0.5pt, Max: 20pt
                  </p>
                </div>
                </PropertyGroup>
              </>
            )}
          </>
        )}

        {/* RECTANGLE ELEMENT TABS */}
        {selectedElement.type === 'rectangle' && (
          <>
            {/* APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <>
                {!isMultiSelection && (
          <>
                    <div className="space-y-1 mb-3">
                      <label className="text-xs font-medium theme-text-muted">ID</label>
                      <Input
                        value={selectedElement.id}
              onChange={(e) => handleUpdate('id', e.target.value)}
                        size="sm"
                      />
                    </div>
                    <Divider className="my-3" />
                  </>
                )}

                <PropertyGroup title="Location" collapsible={false}>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <NumberField
                        label="X"
                        value={selectedElement.x}
                        onValueChange={(value) => handleUpdate('x', value)}
                        disabled={selectedElement.width === '100%'}
                      />
                      {selectedElement.width === '100%' && (
                        <p className="text-xs theme-text-muted mt-1">Fixed at 0 (width 100%)</p>
                      )}
                    </div>
                    <div>
                      <NumberField
                        label="Y"
                        value={selectedElement.y}
                        onValueChange={(value) => handleUpdate('y', value)}
                        disabled={selectedElement.height === '100%'}
                      />
                      {selectedElement.height === '100%' && (
                        <p className="text-xs theme-text-muted mt-1">Fixed at 0 (100% height)</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Modo de Posicionamento */}
                  <div className="mt-3">
                    <Select
                      value={selectedElement.positionMode || 'ABSOLUTE'}
                      onChange={(e) => handleUpdate('positionMode', e.target.value === 'ABSOLUTE' ? null : e.target.value)}
                      options={[
                        { value: 'ABSOLUTE', label: 'Absoluto (fixo no canvas)' },
                        { value: 'RELATIVE', label: 'Relative (follows content above)' },
                      ]}
                    />
                    {selectedElement.positionMode === 'RELATIVE' && (
                      <>
                        <p className="text-[10px] text-purple-500 mt-1 mb-2">
                          ↳ Positioned after the previous element in PDF
                        </p>
                        <PropertyRow label="Offset Y (PDF):" labelWidth="lg">
                        <div className="flex items-center gap-2">
                            <Input
                            type="number"
                            value={selectedElement.relativeOffsetY ?? 10}
                            onChange={(e) => handleUpdate('relativeOffsetY', parseFloat(e.target.value))}
                              size="sm"
                              className="w-20"
                          />
                          <span className="text-[10px] theme-text-muted">px</span>
                        </div>
                        </PropertyRow>
                        <p className="text-[10px] theme-text-muted mt-1">
                          Space between the previous element and this one
                        </p>
                      </>
                    )}
                  </div>
                </PropertyGroup>

                <PropertyGroup title="Size" collapsible={false}>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <NumberField
                        label="W (Width)"
                        value={typeof selectedElement.width === 'string' ? undefined : selectedElement.width}
                        onValueChange={(value) => handleUpdate('width', value)}
                        disabled={selectedElement.width === '100%'}
                      />
                      <label className="flex items-center mt-2 cursor-pointer">
                        <Checkbox
                          checked={selectedElement.width === '100%'}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateSelectedElements({ width: '100%', x: 0 })
                            } else {
                              updateSelectedElements({ width: 100 })
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-xs theme-text-secondary">100% Width</span>
              </label>
                    </div>
                    <div>
                      <NumberField
                        label="H (Height)"
                        value={typeof selectedElement.height === 'string' ? undefined : selectedElement.height}
                        onValueChange={(value) => handleUpdate('height', value)}
                        disabled={selectedElement.height === '100%'}
                      />
                      <label className="flex items-center mt-2 cursor-pointer">
                        <Checkbox
                          checked={selectedElement.height === '100%'}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateSelectedElements({ height: '100%', y: 0 })
                            } else {
                              updateSelectedElements({ height: 100 })
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-xs theme-text-secondary">100% Height</span>
                      </label>
                    </div>
                  </div>
                </PropertyGroup>

                <PropertyGroup title="Color" collapsible={false}>
                  <div className="space-y-3">
                    <PropertyRow label="Fill" labelWidth="sm">
                      <ColorInput
                value={selectedElement.style?.fillColor || '#4a90e2'}
                onChange={(e) => handleStyleUpdate('fillColor', e.target.value)}
                        disabled={!selectedElement.style?.fillColor}
                      />
                    </PropertyRow>
                    <Checkbox
                      id="rect-transparent"
                        checked={!selectedElement.style?.fillColor}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleStyleUpdate('fillColor', null)
                          } else {
                            handleStyleUpdate('fillColor', '#4a90e2')
                          }
                        }}
                      label="Transparent"
                      />
                  </div>
                </PropertyGroup>

                <PropertyGroup title="Print Condition" collapsible={false}>
                  <Input
                    value={selectedElement.printCondition || ''}
                    onChange={(e) => handleUpdate('printCondition', e.target.value || null)}
                    placeholder="Ex: invoice.total > 1000"
                    size="sm"
                  />
                  <p className="text-xs theme-text-muted mt-1">
                    Leave empty to always print
                  </p>
                  
                  {/* Exemplos de Condicionais */}
                  <div className="mt-2 p-2 theme-bg-tertiary rounded border theme-border">
                    <p className="text-xs font-medium theme-text mb-1">Examples:</p>
                    <div className="space-y-0.5 text-xs theme-text-secondary font-mono">
                      <div>• invoice.total &gt; 1000</div>
                      <div>• customer.type == 'VIP'</div>
                      <div>• status != 'cancelled'</div>
                      <div>• items.length &gt; 0</div>
                      <div>• status in ['pending', 'approved']</div>
                      <div>• total &gt;= 100 && total &lt; 500</div>
                    </div>
                  </div>
                </PropertyGroup>
              </>
            )}

            {/* BORDERS TAB */}
            {activeTab === 'borders' && (
              <>
                {/* Borders */}
                <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Borders</h3>
                  
                  {/* Border Preview Box */}
                  <div className="mb-3 p-3 theme-bg-tertiary border theme-border rounded flex items-center justify-center">
                    <div 
                      className="w-32 h-32"
                      style={{
                        backgroundColor: selectedElement.style?.fillColor || '#4a90e2',
                        borderTopWidth: `${selectedElement.style?.borderTopWidth ?? selectedElement.style?.borderWidth ?? 1}px`,
                        borderTopStyle: selectedElement.style?.borderStyle || 'solid',
                        borderTopColor: selectedElement.style?.borderColor || '#000000',
                        borderRightWidth: `${selectedElement.style?.borderRightWidth ?? selectedElement.style?.borderWidth ?? 1}px`,
                        borderRightStyle: selectedElement.style?.borderStyle || 'solid',
                        borderRightColor: selectedElement.style?.borderColor || '#000000',
                        borderBottomWidth: `${selectedElement.style?.borderBottomWidth ?? selectedElement.style?.borderWidth ?? 1}px`,
                        borderBottomStyle: selectedElement.style?.borderStyle || 'solid',
                        borderBottomColor: selectedElement.style?.borderColor || '#000000',
                        borderLeftWidth: `${selectedElement.style?.borderLeftWidth ?? selectedElement.style?.borderWidth ?? 1}px`,
                        borderLeftStyle: selectedElement.style?.borderStyle || 'solid',
                        borderLeftColor: selectedElement.style?.borderColor || '#000000',
                        borderRadius: `${selectedElement.style?.cornerRadius || 0}px`,
                      }}
                    />
                  </div>

                  <div className="space-y-3">
                    <PropertyRow label="Pen Color:" labelWidth="lg">
                      <ColorInput
                    value={selectedElement.style?.borderColor || '#000000'}
                    onChange={(e) => handleStyleUpdate('borderColor', e.target.value)}
                  />
                    </PropertyRow>

                    <PropertyRow label="Pen Style:" labelWidth="lg">
                      <div className="flex gap-1 flex-1">
                        {[
                          { value: 'solid', label: 'Solid' },
                          { value: 'dashed', label: 'Dashed' },
                          { value: 'dotted', label: 'Dotted' }
                        ].map((style) => (
                          <Button
                            key={style.value}
                            variant={((selectedElement.style?.borderStyle || 'solid') === style.value) ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => handleStyleUpdate('borderStyle', style.value)}
                            className="flex-1 flex-col py-2"
                          >
                            <div 
                              className="h-0 mx-auto w-full"
                              style={{ 
                                borderTopWidth: '2px',
                                borderTopStyle: style.value as 'solid' | 'dashed' | 'dotted',
                                borderTopColor: (selectedElement.style?.borderStyle || 'solid') === style.value ? '#fff' : '#666'
                              }}
                            />
                            <span className="mt-1 block text-[10px]">
                              {style.label}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </PropertyRow>

                    <PropertyRow label="Pen Width:" labelWidth="lg">
                      <Input
                    type="number"
                    value={selectedElement.style?.borderWidth ?? 1}
                    onChange={(e) => handleStyleUpdate('borderWidth', parseFloat(e.target.value) || 0)}
                        size="sm"
                        className="w-24"
                        min={0}
                        max={10}
                        step={0.5}
                      />
                    </PropertyRow>
                    
                    {/* Default border styles */}
                    <div className="pt-2">
                      <label className="block text-xs theme-text-secondary mb-2">Default borders styles:</label>
                      {(() => {
                        const bw = selectedElement.style?.borderWidth ?? 1
                        const top = selectedElement.style?.borderTopWidth ?? bw
                        const right = selectedElement.style?.borderRightWidth ?? bw
                        const bottom = selectedElement.style?.borderBottomWidth ?? bw
                        const left = selectedElement.style?.borderLeftWidth ?? bw
                        const isAll = top > 0 && right > 0 && bottom > 0 && left > 0
                        const isNone = top === 0 && right === 0 && bottom === 0 && left === 0
                        const isTopBottom = top > 0 && bottom > 0 && right === 0 && left === 0
                        const isLeftRight = left > 0 && right > 0 && top === 0 && bottom === 0
                        return (
                      <div className="flex gap-2">
                        {/* All borders */}
                        <button
                          onClick={() => {
                            const width = selectedElement.style?.borderWidth || 1
                            if (isMultiSelection) {
                              updateSelectedElements({
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: width,
                                  borderRightWidth: width,
                                  borderBottomWidth: width,
                                  borderLeftWidth: width,
                                }
                              })
                            } else {
                              updateElement(selectedElement.id, {
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: width,
                                  borderRightWidth: width,
                                  borderBottomWidth: width,
                                  borderLeftWidth: width,
                                }
                              }, selectedElementLocation)
                            }
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isAll ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="All borders"
                        >
                          <div className={`w-6 h-6 border-2 ${isAll ? 'border-primary-500' : 'border-gray-500'}`}></div>
                        </button>
                        
                        {/* No borders */}
                        <button
                          onClick={() => {
                            if (isMultiSelection) {
                              updateSelectedElements({
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: 0,
                                  borderRightWidth: 0,
                                  borderBottomWidth: 0,
                                  borderLeftWidth: 0,
                                }
                              })
                            } else {
                              updateElement(selectedElement.id, {
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: 0,
                                  borderRightWidth: 0,
                                  borderBottomWidth: 0,
                                  borderLeftWidth: 0,
                                }
                              }, selectedElementLocation)
                            }
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isNone ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="No borders"
                        >
                          <div className={`w-6 h-6 border-2 border-dashed ${isNone ? 'border-primary-400' : 'border-gray-300'}`}></div>
                        </button>
                        
                        {/* Top and bottom */}
                        <button
                          onClick={() => {
                            const width = selectedElement.style?.borderWidth || 1
                            if (isMultiSelection) {
                              updateSelectedElements({
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: width,
                                  borderRightWidth: 0,
                                  borderBottomWidth: width,
                                  borderLeftWidth: 0,
                                }
                              })
                            } else {
                              updateElement(selectedElement.id, {
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: width,
                                  borderRightWidth: 0,
                                  borderBottomWidth: width,
                                  borderLeftWidth: 0,
                                }
                              }, selectedElementLocation)
                            }
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isTopBottom ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="Top and bottom borders"
                        >
                          <div className={`w-6 h-6 border-t-2 border-b-2 ${isTopBottom ? 'border-primary-500' : 'border-gray-500'}`}></div>
                        </button>
                        
                        {/* Left and right */}
                        <button
                          onClick={() => {
                            const width = selectedElement.style?.borderWidth || 1
                            if (isMultiSelection) {
                              updateSelectedElements({
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: 0,
                                  borderRightWidth: width,
                                  borderBottomWidth: 0,
                                  borderLeftWidth: width,
                                }
                              })
                            } else {
                              updateElement(selectedElement.id, {
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: 0,
                                  borderRightWidth: width,
                                  borderBottomWidth: 0,
                                  borderLeftWidth: width,
                                }
                              }, selectedElementLocation)
                            }
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isLeftRight ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="Left and right borders"
                        >
                          <div className={`w-6 h-6 border-l-2 border-r-2 ${isLeftRight ? 'border-primary-500' : 'border-gray-500'}`}></div>
                        </button>
              </div>
                        )
                      })()}
            </div>
                  </div>
                </div>

                <PropertyGroup title="Corner Radius" collapsible={false}>
                  <PropertyRow label="Radius:" labelWidth="lg">
                    <div className="flex items-center gap-2">
                      <Input
                type="number"
                value={selectedElement.style?.cornerRadius || 0}
                onChange={(e) => handleStyleUpdate('cornerRadius', parseFloat(e.target.value))}
                        size="sm"
                        className="w-24"
                        min={0}
                        step={1}
              />
                    <span className="text-xs theme-text-muted">px</span>
                  </div>
                  </PropertyRow>
                </PropertyGroup>
              </>
            )}
          </>
        )}

        {/* IMAGE ELEMENT TABS */}
        {selectedElement.type === 'image' && (
          <>
            {/* APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <>
                {!isMultiSelection && (
          <>
                    <div className="space-y-1 mb-3">
                      <label className="text-xs font-medium theme-text-muted">ID</label>
                      <Input
                        value={selectedElement.id}
              onChange={(e) => handleUpdate('id', e.target.value)}
                        size="sm"
                      />
                    </div>
                    <Divider className="my-3" />
                  </>
                )}

                <PropertyGroup title="Location" collapsible={false}>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField
                      label="X"
                        value={selectedElement.x}
                      onValueChange={(value) => handleUpdate('x', value)}
                    />
                    <NumberField
                      label="Y"
                        value={selectedElement.y}
                      onValueChange={(value) => handleUpdate('y', value)}
                      />
                    </div>
                </PropertyGroup>

                <PropertyGroup title="Size" collapsible={false}>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField
                      label="W (Width)"
                        value={selectedElement.width}
                      onValueChange={(value) => handleUpdate('width', value)}
                    />
                    <NumberField
                      label="H (Height)"
                        value={selectedElement.height}
                      onValueChange={(value) => handleUpdate('height', value)}
                      />
                    </div>
                </PropertyGroup>

                <PropertyGroup title="Image Fit" collapsible={false}>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium theme-text-muted">Redimensionamento (fit)</label>
                      <Select
                        value={selectedElement.fit || 'contain'}
                        onChange={(e) => handleUpdate('fit', e.target.value)}
                        options={[
                          { value: 'contain', label: 'Contain (fits inside, keeps aspect ratio)' },
                          { value: 'cover', label: 'Cover (cobre tudo, pode cortar)' },
                          { value: 'fill', label: 'Fill (estica, pode distorcer)' },
                          { value: 'scale-down', label: 'Scale Down (only shrinks if larger)' },
                        ]}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium theme-text-muted">Alignment</label>
                      <Select
                        value={selectedElement.alignment || 'center'}
                        onChange={(e) => handleUpdate('alignment', e.target.value)}
                        options={[
                          { value: 'left', label: 'Esquerda' },
                          { value: 'center', label: 'Centro' },
                          { value: 'right', label: 'Direita' },
                        ]}
                      />
                    </div>
                  </div>
                </PropertyGroup>

                <PropertyGroup title="Print Condition" collapsible={false}>
                  <Input
                    value={selectedElement.printCondition || ''}
                    onChange={(e) => handleUpdate('printCondition', e.target.value || null)}
                    placeholder="Ex: invoice.total > 1000"
                    size="sm"
                  />
                  <p className="text-xs theme-text-muted mt-1">
                    Leave empty to always print
                  </p>
                  
                  {/* Exemplos de Condicionais */}
                  <div className="mt-2 p-2 theme-bg-tertiary rounded border theme-border">
                    <p className="text-xs font-medium theme-text mb-1">Examples:</p>
                    <div className="space-y-0.5 text-xs theme-text-secondary font-mono">
                      <div>• invoice.total &gt; 1000</div>
                      <div>• customer.type == 'VIP'</div>
                      <div>• status != 'cancelled'</div>
                      <div>• items.length &gt; 0</div>
                      <div>• status in ['pending', 'approved']</div>
                      <div>• total &gt;= 100 && total &lt; 500</div>
                    </div>
                  </div>
                </PropertyGroup>
              </>
            )}

            {/* IMAGE TAB */}
            {activeTab === 'image' && (
              <PropertyGroup title="Image Source" collapsible={false}>
                  <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium theme-text-muted">URL ou Caminho</label>
                    <Input
                value={selectedElement.source || ''}
                onChange={(e) => handleUpdate('source', e.target.value)}
                        placeholder="https://... ou /path/to/image.png"
                      size="sm"
                      className="font-mono"
              />
            </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium theme-text-muted">Data Binding</label>
                    <Input
                value={selectedElement.dataBinding || ''}
                onChange={(e) => handleUpdate('dataBinding', e.target.value)}
                placeholder="e.g., company.logo"
                      size="sm"
                      className="font-mono"
              />
                      <p className="text-xs theme-text-muted mt-1">For dynamic images</p>
                    </div>
                  </div>
              </PropertyGroup>
            )}
          </>
        )}

        {selectedElement.type === 'table' && (
          <TableEditor 
            element={selectedElement}
            onUpdate={handleUpdate}
            onStyleUpdate={handleStyleUpdate}
            activeTab={activeTab as 'general' | 'columns' | 'styles'}
          />
        )}

        {/* BARCODE ELEMENT TABS */}
        {selectedElement.type === 'barcode' && (
          <>
            {/* APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <>
                {!isMultiSelection && (
                  <>
                    <div className="space-y-1 mb-3">
                      <label className="text-xs font-medium theme-text-muted">ID</label>
                      <Input
                        value={selectedElement.id}
              onChange={(e) => handleUpdate('id', e.target.value)}
                        size="sm"
                      />
                    </div>
                    <Divider className="my-3" />
                  </>
                )}

                <PropertyGroup title="Location" collapsible={false}>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField
                      label="X"
                        value={selectedElement.x}
                      onValueChange={(value) => handleUpdate('x', value)}
                    />
                    <NumberField
                      label="Y"
                        value={selectedElement.y}
                      onValueChange={(value) => handleUpdate('y', value)}
                      />
                  </div>
                  
                  {/* Modo de Posicionamento - Barcode */}
                  <div className="mt-3">
                    {selectedElement.type === 'container' ? (
                      <>
                        <p className="text-[10px] text-purple-500 mt-1 mb-2">
                          Container is always RELATIVE (core rule)
                        </p>
                        <PropertyRow label="Offset Y (PDF):" labelWidth="lg">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={selectedElement.relativeOffsetY ?? 0}
                              onChange={(e) => handleUpdate('relativeOffsetY', parseFloat(e.target.value))}
                              size="sm"
                              className="w-20"
                            />
                            <span className="text-[10px] theme-text-muted">px</span>
                          </div>
                        </PropertyRow>
                      </>
                    ) : (
                      <>
                        <Select
                          value={selectedElement.positionMode || 'ABSOLUTE'}
                          onChange={(e) => handleUpdate('positionMode', e.target.value === 'ABSOLUTE' ? null : e.target.value)}
                          options={[
                            { value: 'ABSOLUTE', label: 'Absoluto (fixo no canvas)' },
                            { value: 'RELATIVE', label: 'Relative (follows content above)' },
                          ]}
                        />
                        {selectedElement.positionMode === 'RELATIVE' && (
                          <>
                            <p className="text-[10px] text-purple-500 mt-1 mb-2">
                              ↳ Positioned after the previous element in PDF
                            </p>
                            <PropertyRow label="Offset Y (PDF):" labelWidth="lg">
                            <div className="flex items-center gap-2">
                                <Input
                                type="number"
                                value={selectedElement.relativeOffsetY ?? 0}
                                onChange={(e) => handleUpdate('relativeOffsetY', parseFloat(e.target.value))}
                                  size="sm"
                                  className="w-20"
                              />
                              <span className="text-[10px] theme-text-muted">px</span>
                            </div>
                            </PropertyRow>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </PropertyGroup>

                <PropertyGroup title="Size" collapsible={false}>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField
                      label="W (Width)"
                        value={selectedElement.width}
                      onValueChange={(value) => handleUpdate('width', value)}
                    />
                    <NumberField
                      label="H (Height)"
                        value={selectedElement.height}
                      onValueChange={(value) => handleUpdate('height', value)}
                      />
                    </div>
                </PropertyGroup>

                <PropertyGroup title="Print Condition" collapsible={false}>
                  <Input
                    value={selectedElement.printCondition || ''}
                    onChange={(e) => handleUpdate('printCondition', e.target.value || null)}
                    placeholder="Ex: invoice.total > 1000"
                    size="sm"
                  />
                  <p className="text-xs theme-text-muted mt-1">
                    Leave empty to always print
                  </p>
                  
                  {/* Exemplos de Condicionais */}
                  <div className="mt-2 p-2 theme-bg-tertiary rounded border theme-border">
                    <p className="text-xs font-medium theme-text mb-1">Examples:</p>
                    <div className="space-y-0.5 text-xs theme-text-secondary font-mono">
                      <div>• invoice.total &gt; 1000</div>
                      <div>• customer.type == 'VIP'</div>
                      <div>• status != 'cancelled'</div>
                      <div>• items.length &gt; 0</div>
                      <div>• status in ['pending', 'approved']</div>
                      <div>• total &gt;= 100 && total &lt; 500</div>
                    </div>
                  </div>
                </PropertyGroup>
              </>
            )}

            {/* BARCODE TAB */}
            {activeTab === 'barcode' && (
              <>
                <PropertyGroup title="Code Type" collapsible={false}>
                  <Select
                    value={selectedElement.barcodeType || 'qrcode'}
                    onChange={(e) => handleUpdate('barcodeType', e.target.value)}
                    options={[
                      { value: 'qrcode', label: 'QR Code' },
                      { value: 'barcode', label: 'Barcode' },
                    ]}
                  />
                </PropertyGroup>

                <PropertyGroup title="Data" collapsible={false}>
                  <div className="space-y-1">
                    <label className="text-xs font-medium theme-text-muted">Data Binding</label>
                    <Input
                    value={selectedElement.dataBinding || ''}
                    onChange={(e) => handleUpdate('dataBinding', e.target.value)}
                    placeholder="Ex: invoice.qrCode, customer.cpf"
                      size="sm"
                      className="font-mono"
                  />
                  <p className="text-xs theme-text-muted mt-1">
                      Field to be encoded
                    </p>
                  </div>
                </PropertyGroup>
                
                {/* Error Correction (apenas QR Code) */}
                {selectedElement.barcodeType === 'qrcode' && (
                  <PropertyGroup title="QR Code Quality" collapsible={false}>
                    <div className="space-y-1">
                      <label className="text-xs font-medium theme-text-muted">Error Correction</label>
                      <Select
                      value={selectedElement.style?.errorCorrection || 'M'}
                      onChange={(e) => handleStyleUpdate('errorCorrection', e.target.value)}
                        options={[
                          { value: 'L', label: 'Low (~7%)' },
                          { value: 'M', label: 'Medium (~15%)' },
                          { value: 'Q', label: 'Quartile (~25%)' },
                          { value: 'H', label: 'High (~30%)' },
                        ]}
                      />
                    <p className="text-xs theme-text-muted mt-1">
                          Higher = more damage resistant
                    </p>
                  </div>
                  </PropertyGroup>
                )}
              </>
            )}
          </>
        )}

        {/* LOOP ELEMENT TABS */}
        {(selectedElement.type === 'loop' || selectedElement.type === 'container') && (
          <>
            {/* APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <>
                {!isMultiSelection && (
                  <>
                    <div className="space-y-1 mb-3">
                      <label className="text-xs font-medium theme-text-muted">ID</label>
                      <Input
                        value={selectedElement.id}
                        onChange={(e) => handleUpdate('id', e.target.value)}
                        disabled={selectedElement.type !== 'container'}
                        size="sm"
                      />
                    </div>
                    <Divider className="my-3" />
                  </>
                )}

                {selectedElement.type === 'loop' && (
                  <PropertyGroup title="Location" collapsible={false}>
                    <div className="grid grid-cols-2 gap-3">
                      <NumberField
                        label="X"
                          value={selectedElement.x}
                        onValueChange={(value) => handleUpdate('x', value)}
                      />
                  </div>
                  
                  {/* Modo de Posicionamento - Loop */}
                  <div className="mt-3">
                    {selectedElement.type === 'container' ? (
                      <>
                        <p className="text-[10px] text-purple-500 mt-1 mb-2">
                          Container is always RELATIVE (core rule)
                        </p>
                        <PropertyRow label="Offset Y (PDF):" labelWidth="lg">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={selectedElement.relativeOffsetY ?? 0}
                              onChange={(e) => handleUpdate('relativeOffsetY', parseFloat(e.target.value))}
                              size="sm"
                              className="w-20"
                            />
                            <span className="text-[10px] theme-text-muted">px</span>
                          </div>
                        </PropertyRow>
                      </>
                    ) : (
                      <>
                        <Select
                          value={selectedElement.positionMode || 'ABSOLUTE'}
                          onChange={(e) => handleUpdate('positionMode', e.target.value === 'ABSOLUTE' ? null : e.target.value)}
                          options={[
                            { value: 'ABSOLUTE', label: 'Absoluto (fixo no canvas)' },
                            { value: 'RELATIVE', label: 'Relative (follows content above)' },
                          ]}
                        />
                        {selectedElement.positionMode === 'RELATIVE' && (
                          <>
                            <p className="text-[10px] text-purple-500 mt-1 mb-2">
                              ↳ Positioned after the previous element in PDF
                            </p>
                            <PropertyRow label="Offset Y (PDF):" labelWidth="lg">
                            <div className="flex items-center gap-2">
                                <Input
                                type="number"
                                value={selectedElement.relativeOffsetY ?? 0}
                                onChange={(e) => handleUpdate('relativeOffsetY', parseFloat(e.target.value))}
                                  size="sm"
                                  className="w-20"
                              />
                              <span className="text-[10px] theme-text-muted">px</span>
                            </div>
                            </PropertyRow>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </PropertyGroup>
                )}
                <PropertyGroup title="Size" collapsible={false}>
                  <div className={`grid gap-3 ${selectedElement.type === 'container' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {selectedElement.type === 'loop' && (
                      <NumberField
                        label="W (Width)"
                          value={selectedElement.width}
                        onValueChange={(value) => handleUpdate('width', value)}
                      />
                    )}
                    <NumberField
                      label="H (Height)"
                        value={selectedElement.height}
                      onValueChange={(value) => handleUpdate('height', value)}
                      />
                    </div>
                </PropertyGroup>

                <PropertyGroup title="Print Condition" collapsible={false}>
                  <Input
                    value={selectedElement.printCondition || ''}
                    onChange={(e) => handleUpdate('printCondition', e.target.value || null)}
                    placeholder="Ex: items.length > 0"
                    size="sm"
                  />
                  <p className="text-xs theme-text-muted mt-1">
                    Leave empty to always print
                  </p>
                </PropertyGroup>
              </>
            )}

            {/* LOOP TAB */}
            {activeTab === 'elements' && (
              <>
                <PropertyGroup title="Loop Configuration" collapsible={false}>
                  <div className="space-y-3">
                    {selectedElement.type === 'loop' && (
                      <>
                        <div className="space-y-1">
                          <label className="text-xs font-medium theme-text-muted">Data Binding (Lista)</label>
                          <Input
                            value={selectedElement.dataBinding || ''}
                            onChange={(e) => handleUpdate('dataBinding', e.target.value)}
                            placeholder="Ex: invoice.items"
                            size="sm"
                            className="font-mono"
                          />
                          <p className="text-xs theme-text-muted mt-1">
                            Path to the list in the data JSON
                          </p>
                        </div>

                        <NumberField
                          label="Item Spacing (px)"
                          value={selectedElement.itemSpacing || 20}
                          onValueChange={(value) => handleUpdate('itemSpacing', value)}
                        />
                        <p className="text-xs theme-text-muted -mt-1">
                          Vertical space between each repetition
                        </p>
                      </>
                    )}
                  </div>
                </PropertyGroup>

                <PropertyGroup title="Add Elements" collapsible={false}>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { type: 'text', label: 'Text', icon: 'text' as const },
                      { type: 'static_text', label: 'Static', icon: 'static-text' as const },
                      { type: 'image', label: 'Image', icon: 'image' as const },
                      { type: 'rectangle', label: 'Rectangle', icon: 'rectangle' as const },
                      { type: 'line', label: 'Line', icon: 'minus' as const },
                      { type: 'loop', label: 'Loop', icon: 'loop' as const },
                    ].map((item) => (
                      <Button
                        key={item.type}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const id = `${item.type}-${Date.now()}`
                          let newElement: Partial<Element> = { type: item.type, id, x: 0, y: 0 }
                          
                          if (item.type === 'text' || item.type === 'static_text') {
                            newElement = {
                              ...newElement,
                              value: item.type === 'text' ? 'field' : 'Text',
                              width: 150,
                              height: 20,
                              style: { fontSize: 10, fontFamily: 'Helvetica', color: '#000000' },
                            }
                          } else if (item.type === 'image') {
                            newElement = { ...newElement, width: 50, height: 50, source: '' }
                          } else if (item.type === 'rectangle') {
                            newElement = { ...newElement, width: 100, height: 20, style: { fillColor: '#e0e0e0' } }
                          } else if (item.type === 'line') {
                            newElement = { ...newElement, width: 100, height: 0, style: { strokeColor: '#000000', strokeWidth: 1 } }
                          } else if (item.type === 'loop') {
                            newElement = { ...newElement, width: 100, height: 20, databinding: '' }
                          }
                          
                          addElementToLoop(selectedElement.id, newElement, selectedElementLocation)
                        }}
                        className="flex items-center gap-2 justify-start"
                      >
                        <Icon name={item.icon} size="sm" />
                        {item.label}
                      </Button>
                    ))}
                  </div>
                  
                  {/* Lista de elementos filhos */}
                  {(selectedElement.elements || []).length > 0 && (
                    <>
                      <label className="text-xs font-medium theme-text mb-2 block">
                        Elements ({(selectedElement.elements || []).length})
                      </label>
                      <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                        {(selectedElement.elements || []).map((child: Element, idx: number) => (
                          <LoopChildEditor
                            key={child.id}
                            child={child}
                            index={idx}
                            loopId={selectedElement.id}
                            location={selectedElementLocation}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  
                  {/* Dica */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700 font-medium mb-1">💡 Usage tip:</p>
                    <p className="text-xs text-blue-600">
                      Use only the property name to access item data.
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Ex: <code className="px-1 py-0.5 bg-blue-100 rounded font-mono">name</code>, <code className="px-1 py-0.5 bg-blue-100 rounded font-mono">value</code>, <code className="px-1 py-0.5 bg-blue-100 rounded font-mono">price</code>
                    </p>
                  </div>
                </PropertyGroup>

                <PropertyGroup title="Usage Example" collapsible={false}>
                  <div className="p-2 theme-bg-tertiary rounded border theme-border text-xs font-mono theme-text-secondary">
                    <div className="mb-1">Data Binding: <span className="text-primary-600">invoice.items</span></div>
                    <div className="mb-1">Elements use only the property name:</div>
                    <div className="pl-2 text-[10px]">
                      <div>• name → item name</div>
                      <div>• price → price</div>
                      <div>• qty → quantity</div>
                    </div>
                  </div>
                </PropertyGroup>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}


interface TableEditorProps {
  element: Element
  onUpdate: (field: string, value: string | number | boolean | object | null) => void
  onStyleUpdate: (field: string, value: string | number | boolean | null) => void
  activeTab: 'general' | 'columns' | 'styles'
}

function TableEditor({ element, onUpdate, onStyleUpdate, activeTab }: TableEditorProps) {
  // Helper para calcular valores de border dinamicamente baseado em borderType
  const getHeaderBorderValues = () => {
    const borderWidth = element.style?.headerBorderWidth ?? element.style?.borderWidth ?? 1
    const borderType = element.style?.headerBorderType
    
    if (!borderType || borderType === 'none') {
      return { top: 0, right: 0, bottom: 0, left: 0 }
    }
    
    if (borderType === 'row' || borderType === 'all') {
      return { top: borderWidth, right: borderWidth, bottom: borderWidth, left: borderWidth }
    }
    
    if (borderType === 'columns') {
      return { top: borderWidth, right: borderWidth, bottom: borderWidth, left: borderWidth }
    }
    
    if (borderType === 'top-bottom') {
      return { top: borderWidth, right: 0, bottom: borderWidth, left: 0 }
    }
    
    if (borderType === 'left-right') {
      return { top: 0, right: borderWidth, bottom: 0, left: borderWidth }
    }
    
    return { top: borderWidth, right: borderWidth, bottom: borderWidth, left: borderWidth }
  }
  
  const getCellBorderValues = () => {
    const borderWidth = element.style?.borderWidth ?? 1
    const borderType = element.style?.cellBorderType
    
    if (!borderType || borderType === 'none') {
      return { top: 0, right: 0, bottom: 0, left: 0 }
    }
    
    if (borderType === 'row' || borderType === 'all') {
      return { top: borderWidth, right: borderWidth, bottom: borderWidth, left: borderWidth }
    }
    
    if (borderType === 'cells') {
      return { top: borderWidth, right: borderWidth, bottom: borderWidth, left: borderWidth }
    }
    
    if (borderType === 'top-bottom') {
      return { top: borderWidth, right: 0, bottom: borderWidth, left: 0 }
    }
    
    if (borderType === 'left-right') {
      return { top: 0, right: borderWidth, bottom: 0, left: borderWidth }
    }
    
    return { top: borderWidth, right: borderWidth, bottom: borderWidth, left: borderWidth }
  }

  
  const updateColumn = (index: number, field: string, value: string | number | boolean | null) => {
    if (!element.columns || !element.columns[index]) return
    
    
    const newColumns = JSON.parse(JSON.stringify(element.columns))
    
    
    newColumns[index][field] = value
    
    // Chamar onUpdate com o novo array
    onUpdate('columns', newColumns)
  }

  return (
    <>
      {/* Tab Content */}
      <div>
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            <PropertyGroup title="Position" collapsible={false}>
            <div className="grid grid-cols-2 gap-2">
                <NumberField
                  label="X (pt)"
                  value={element.x || 0}
                  onValueChange={(value) => onUpdate('x', value)}
                  disabled={element.width === '100%'}
                />
                <NumberField
                  label="Y (pt)"
                  value={element.y || 0}
                  onValueChange={(value) => onUpdate('y', value)}
                />
            </div>

            {/* Modo de Posicionamento */}
              <div className="mt-3">
                <Select
                value={element.positionMode || 'ABSOLUTE'}
                onChange={(e) => onUpdate('positionMode', e.target.value === 'ABSOLUTE' ? null : e.target.value)}
                  options={[
                    { value: 'ABSOLUTE', label: 'Absolute (fixed on canvas)' },
                    { value: 'RELATIVE', label: 'Relative (follows content above)' },
                  ]}
                />
              {element.positionMode === 'RELATIVE' && (
                <>
                  <p className="text-[10px] text-purple-500 mt-1 mb-2">
                    ↳ Positioned after the previous element in PDF
                  </p>
                    <PropertyRow label="Offset Y (PDF):" labelWidth="lg">
                  <div className="flex items-center gap-2">
                        <Input
                      type="number"
                      value={element.relativeOffsetY ?? 10}
                      onChange={(e) => onUpdate('relativeOffsetY', parseFloat(e.target.value))}
                          size="sm"
                          className="w-20"
                    />
                    <span className="text-[10px] theme-text-muted">px</span>
                  </div>
                    </PropertyRow>
                </>
              )}
            </div>
            </PropertyGroup>

            <PropertyGroup title="Data" collapsible={false}>
              <div className="space-y-1">
                <label className="text-xs font-medium theme-text-muted">Data Binding</label>
                <Input
                value={element.dataBinding || ''}
                onChange={(e) => onUpdate('dataBinding', e.target.value)}
                placeholder="e.g., invoice.items"
                  size="sm"
              />
              <p className="text-xs theme-text-muted mt-1">
                Data field containing the rows array
              </p>
            </div>
            </PropertyGroup>

            <PropertyGroup title="Size" collapsible={false}>
              <NumberField
                label="Table Width (pt)"
                value={typeof element.width === 'number' ? element.width : 400}
                onValueChange={(value) => onUpdate('width', value)}
                disabled={element.width === '100%'}
              />
              <div className="mt-2">
                <Checkbox
                  id="table-width-100"
                  checked={element.width === '100%'}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onUpdate('width', '100%')
                      onUpdate('x', 0)
                    } else {
                      onUpdate('width', 400)
                    }
                  }}
                  label="100% Width (fit to container)"
                />
              </div>
              {element.width === '100%' && (
                <p className="text-xs theme-text-muted mt-1">
                  X will be fixed at 0 when width is 100%
                </p>
              )}
            </PropertyGroup>

            <PropertyGroup title="Print Condition" collapsible={false}>
              <Input
                value={element.printCondition || ''}
                onChange={(e) => onUpdate('printCondition', e.target.value || null)}
                placeholder="Ex: items.length > 0"
                size="sm"
              />
              <p className="text-xs theme-text-muted mt-1">
                Leave empty to always print
              </p>
            </PropertyGroup>
          </div>
        )}

        {/* Columns Tab */}
        {activeTab === 'columns' && (
          <div className="flex flex-col h-full -mt-4 -mx-4">
            <div className="sticky top-[-16px] bg-white z-10 border-b theme-border px-4 pt-4 pb-4 shadow-sm">
              <div className="flex items-center justify-between">
              <label className="block text-xs font-medium theme-text">
                Columns ({(element.columns || []).length})
              </label>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const columns = element.columns || []
                  const newColumn = {
                    header: `Column ${columns.length + 1}`,
                    field: `field${columns.length + 1}`,
                    width: 100,
                      alignment: 'left',
                      verticalAlignment: 'center',
                      headerAlignment: 'left',
                      headerVerticalAlignment: 'center'
                  }
                  onUpdate('columns', [...columns, newColumn])
                }}
              >
                <Icon name="plus" size="xs" />
                Add
              </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-3">
              {(element.columns || []).map((column: Record<string, unknown>, index: number) => {
                
                const normalizedColumn = {
                  alignment: 'left',
                  verticalAlignment: 'center',
                  headerAlignment: 'left',
                  headerVerticalAlignment: 'center',
                  ...column
                }
                return (
                <div key={index} className="p-3 theme-bg-tertiary rounded-lg border theme-border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold theme-text">
                      Column {index + 1}
                    </span>
                    <IconButton
                      icon="trash"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const columns = [...(element.columns || [])]
                        columns.splice(index, 1)
                        onUpdate('columns', columns)
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      tooltip="Remove column"
                    />
                  </div>

                  <div className="space-y-2">
                    {/* Header */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium theme-text-muted">Header</label>
                      <Input
                        value={normalizedColumn.header || ''}
                        onChange={(e) => updateColumn(index, 'header', e.target.value)}
                        placeholder="Column name"
                        size="sm"
                      />
                    </div>

                    {/* Field */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium theme-text-muted">Field</label>
                      <Input
                        value={normalizedColumn.field || ''}
                        onChange={(e) => updateColumn(index, 'field', e.target.value)}
                        placeholder="nome.campo"
                        size="sm"
                      />
                    </div>

                    {/* Width */}
                    <NumberField
                      label="Width (pt)"
                        value={normalizedColumn.width || 100}
                      onValueChange={(value) => updateColumn(index, 'width', value)}
                      />

                    {/* Alignments */}
                    <div>
                      <label className="block text-xs font-medium theme-text mb-2">
                        Alignment
                      </label>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {/* Header Alignment */}
                        <div>
                          <label className="block text-xs theme-text-secondary mb-1.5">Header</label>
                          <div className="flex gap-1">
                        <button
                              onClick={() => updateColumn(index, 'headerAlignment', 'left')}
                              className={`w-8 h-8 flex items-center justify-center border rounded transition ${
                                (normalizedColumn.headerAlignment || 'left') === 'left'
                                  ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                                  : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                          }`}
                              title="Align left"
                        >
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <rect x="2" y="3" width="12" height="2" />
                                <rect x="2" y="7" width="8" height="2" />
                                <rect x="2" y="11" width="10" height="2" />
                              </svg>
                        </button>
                        <button
                              onClick={() => updateColumn(index, 'headerAlignment', 'center')}
                              className={`w-8 h-8 flex items-center justify-center border rounded transition ${
                                normalizedColumn.headerAlignment === 'center'
                                  ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                                  : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                          }`}
                              title="Center"
                            >
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <rect x="2" y="3" width="12" height="2" />
                                <rect x="4" y="7" width="8" height="2" />
                                <rect x="3" y="11" width="10" height="2" />
                              </svg>
                        </button>
                        <button
                              onClick={() => updateColumn(index, 'headerAlignment', 'right')}
                              className={`w-8 h-8 flex items-center justify-center border rounded transition ${
                                normalizedColumn.headerAlignment === 'right'
                                  ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                                  : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                          }`}
                              title="Align right"
                        >
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <rect x="2" y="3" width="12" height="2" />
                                <rect x="6" y="7" width="8" height="2" />
                                <rect x="4" y="11" width="10" height="2" />
                              </svg>
                        </button>
                      </div>
                    </div>

                        {/* Content Alignment */}
                        <div>
                          <label className="block text-xs theme-text-secondary mb-1.5">Content</label>
                          <div className="flex gap-1">
                            <button
                              onClick={() => updateColumn(index, 'alignment', 'left')}
                              className={`w-8 h-8 flex items-center justify-center border rounded transition ${
                                (normalizedColumn.alignment || 'left') === 'left'
                                  ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                                  : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                              }`}
                              title="Align left"
                            >
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <rect x="2" y="3" width="12" height="2" />
                                <rect x="2" y="7" width="8" height="2" />
                                <rect x="2" y="11" width="10" height="2" />
                              </svg>
                            </button>
                            <button
                              onClick={() => updateColumn(index, 'alignment', 'center')}
                              className={`w-8 h-8 flex items-center justify-center border rounded transition ${
                                normalizedColumn.alignment === 'center'
                                  ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                                  : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                              }`}
                              title="Center"
                            >
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <rect x="2" y="3" width="12" height="2" />
                                <rect x="4" y="7" width="8" height="2" />
                                <rect x="3" y="11" width="10" height="2" />
                              </svg>
                            </button>
                            <button
                              onClick={() => updateColumn(index, 'alignment', 'right')}
                              className={`w-8 h-8 flex items-center justify-center border rounded transition ${
                                normalizedColumn.alignment === 'right'
                                  ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                                  : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                              }`}
                              title="Align right"
                            >
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <rect x="2" y="3" width="12" height="2" />
                                <rect x="6" y="7" width="8" height="2" />
                                <rect x="4" y="11" width="10" height="2" />
                              </svg>
                            </button>
                  </div>
                </div>
                      </div>
                    </div>
                  </div>
                </div>
                )
              })}

              {(!element.columns || element.columns.length === 0) && (
                <div className="text-center py-8 px-4 theme-bg-tertiary rounded-lg border-2 border-dashed theme-border">
                  <p className="text-xs theme-text-muted mb-2">No columns defined</p>
                  <p className="text-xs text-gray-400">Clique em "Add" para criar</p>
                </div>
              )}
              </div>
            </div>
          </div>
        )}

        {/* Styles Tab */}
        {activeTab === 'styles' && (
          <div className="space-y-4">
            
            <div className="p-4 theme-bg-tertiary border theme-border rounded-lg">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Icon name="grid" size="sm" />
                Header
              </h3>
              
              {/* Cor */}
              <div className="mb-3">
                <label className="text-xs font-medium theme-text-muted mb-2 block">Color</label>
                <div className="flex gap-3">
                  <ColorField
                    label="Background"
                    value={element.style?.headerBackground && element.style?.headerBackground !== 'transparent' ? element.style?.headerBackground : '#f0f0f0'}
                    onValueChange={(value) => onStyleUpdate('headerBackground', value)}
                        disabled={!element.style?.headerBackground || element.style?.headerBackground === 'transparent'}
                  />
                  <ColorField
                    label="Text"
                    value={element.style?.headerColor || '#000000'}
                    onValueChange={(value) => onStyleUpdate('headerColor', value)}
                  />
                    </div>
                <div className="mt-2">
                  <Checkbox
                    id="header-transparent-bg"
                    checked={!element.style?.headerBackground || element.style?.headerBackground === 'transparent'}
                    onChange={(e) => onStyleUpdate('headerBackground', e.target.checked ? 'transparent' : '#f0f0f0')}
                    label="Transparent Background"
                  />
                </div>
                </div>

              <Divider className="my-3" />

              {/* Font */}
              <div className="mb-3">
                <label className="text-xs font-medium theme-text-muted mb-2 block">Font</label>
                <div className="flex items-center gap-1">
                  <Select
                    value={element.style?.headerFontFamily || 'Helvetica'}
                    onChange={(e) => onStyleUpdate('headerFontFamily', e.target.value)}
                    options={[
                      { value: 'Helvetica', label: 'Helvetica' },
                      { value: 'Helvetica-Bold', label: 'Helvetica Bold' },
                      { value: 'Times', label: 'Times New Roman' },
                      { value: 'Courier', label: 'Courier New' },
                    ]}
                    className="flex-1 min-w-0"
                  />
                  
                  <Input
                    type="number"
                    min={6}
                    max={72}
                    value={element.style?.headerFontSize || 12}
                    onChange={(e) => onStyleUpdate('headerFontSize', parseFloat(e.target.value))}
                    size="sm"
                    className="w-11 text-center"
                  />
                  
                  <IconButton
                    icon="minus"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const currentSize = element.style?.headerFontSize || 12
                      onStyleUpdate('headerFontSize', Math.max(6, currentSize - 1))
                    }}
                    tooltip="Decrease size"
                  />
                  <IconButton
                    icon="plus"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const currentSize = element.style?.headerFontSize || 12
                      onStyleUpdate('headerFontSize', Math.min(72, currentSize + 1))
                    }}
                    tooltip="Increase size"
                  />
                </div>
                </div>

              <Divider className="my-3" />

              {/* Paddings do Header */}
              <div className="mb-3">
                <label className="text-xs font-medium theme-text-muted mb-2 block">Paddings</label>
                <div className="space-y-2">
                  <Checkbox
                      id="header-same-padding"
                      checked={element.style?.headerSamePadding || false}
                      onChange={(e) => {
                        const checked = e.target.checked
                        if (checked) {
                          const value = element.style?.headerPaddingLeft || element.style?.headerPadding || 5
                          onStyleUpdate('headerPaddingLeft', value)
                          onStyleUpdate('headerPaddingRight', value)
                          onStyleUpdate('headerPaddingTop', value)
                          onStyleUpdate('headerPaddingBottom', value)
                          onStyleUpdate('headerPadding', value)
                          onStyleUpdate('headerSamePadding', true)
                        } else {
                          onStyleUpdate('headerSamePadding', false)
                        }
                      }}
                    label="Use the same value for every padding"
                  />
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <NumberField
                      label="Left"
                        value={element.style?.headerPaddingLeft || element.style?.headerPadding || 5}
                      onValueChange={(value) => {
                          if (element.style?.headerSamePadding) {
                            onStyleUpdate('headerPaddingLeft', value)
                            onStyleUpdate('headerPaddingRight', value)
                            onStyleUpdate('headerPaddingTop', value)
                            onStyleUpdate('headerPaddingBottom', value)
                            onStyleUpdate('headerPadding', value)
                          } else {
                            onStyleUpdate('headerPaddingLeft', value)
                          }
                        }}
                      min={0}
                      step={1}
                    />
                    <NumberField
                      label="Right"
                        value={element.style?.headerPaddingRight || element.style?.headerPadding || 5}
                      onValueChange={(value) => onStyleUpdate('headerPaddingRight', value)}
                      min={0}
                      step={1}
                        disabled={element.style?.headerSamePadding || false}
                      />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField
                      label="Top"
                        value={element.style?.headerPaddingTop || element.style?.headerPadding || 5}
                      onValueChange={(value) => onStyleUpdate('headerPaddingTop', value)}
                      min={0}
                      step={1}
                        disabled={element.style?.headerSamePadding || false}
                      />
                    <NumberField
                      label="Bottom"
                        value={element.style?.headerPaddingBottom || element.style?.headerPadding || 5}
                      onValueChange={(value) => onStyleUpdate('headerPaddingBottom', value)}
                      min={0}
                      step={1}
                        disabled={element.style?.headerSamePadding || false}
                      />
                  </div>
                </div>
              </div>

              <Divider className="my-3" />

              {/* Borders do Header */}
              <div className="mb-3">
                <label className="text-xs font-medium theme-text-muted mb-2 block">Borders</label>
                
                {/* Border Preview Box */}
                <div className="mb-3 p-3 theme-bg-tertiary border theme-border rounded">
                  <div className="flex items-center justify-center mb-2">
                    <div 
                      className="w-32 h-32 bg-white"
                      style={{
                        borderTopWidth: `${getHeaderBorderValues().top}px`,
                        borderTopStyle: element.style?.borderStyle ?? 'solid',
                        borderTopColor: element.style?.headerBorderColor ?? element.style?.borderColor ?? '#cccccc',
                        borderRightWidth: `${getHeaderBorderValues().right}px`,
                        borderRightStyle: element.style?.borderStyle ?? 'solid',
                        borderRightColor: element.style?.headerBorderColor ?? element.style?.borderColor ?? '#cccccc',
                        borderBottomWidth: `${getHeaderBorderValues().bottom}px`,
                        borderBottomStyle: element.style?.borderStyle ?? 'solid',
                        borderBottomColor: element.style?.headerBorderColor ?? element.style?.borderColor ?? '#cccccc',
                        borderLeftWidth: `${getHeaderBorderValues().left}px`,
                        borderLeftStyle: element.style?.borderStyle ?? 'solid',
                        borderLeftColor: element.style?.headerBorderColor ?? element.style?.borderColor ?? '#cccccc',
                      }}
                    />
                  </div>
                  <div className="text-xs theme-text-muted text-center space-y-0.5">
                    <div>Top: {getHeaderBorderValues().top}px</div>
                    <div>Right: {getHeaderBorderValues().right}px</div>
                    <div>Bottom: {getHeaderBorderValues().bottom}px</div>
                    <div>Left: {getHeaderBorderValues().left}px</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <PropertyRow label="Pen Color:" labelWidth="lg">
                    <ColorInput
                    value={element.style?.headerBorderColor || element.style?.borderColor || '#cccccc'}
                    onChange={(e) => onStyleUpdate('headerBorderColor', e.target.value)}
                  />
                  </PropertyRow>

                  <PropertyRow label="Pen Width:" labelWidth="lg">
                    <Input
                    type="number"
                      value={element.style?.headerBorderWidth ?? element.style?.borderWidth ?? 1}
                      onChange={(e) => onStyleUpdate('headerBorderWidth', parseFloat(e.target.value) || 0)}
                      size="sm"
                      className="w-24"
                      min={0}
                      max={10}
                      step={0.5}
                    />
                  </PropertyRow>
                  
                  {/* Default border styles */}
                  <div className="pt-2">
                    <label className="text-xs font-medium theme-text-muted mb-2 block">Quick border setup:</label>
                    <div className="flex gap-2">
                      {/* All borders */}
                      <button
                        onClick={() => onStyleUpdate('headerBorderType', 'row')}
                        className={`w-10 h-10 border-2 rounded hover:bg-blue-50 transition flex items-center justify-center ${
                          element.style?.headerBorderType === 'row'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-400'
                        }`}
                        title="All borders"
                      >
                        <div className="w-6 h-6 border-2 border-gray-600"></div>
                      </button>
                      
                      {/* All columns bordered */}
                      <button
                        onClick={() => onStyleUpdate('headerBorderType', 'columns')}
                        className={`w-10 h-10 border-2 rounded hover:bg-blue-50 transition flex items-center justify-center ${
                          element.style?.headerBorderType === 'columns'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-400'
                        }`}
                        title="All columns bordered"
                      >
                        <div className="w-6 h-6 grid grid-cols-2 gap-0">
                          <div className="border-2 border-gray-600"></div>
                          <div className="border-2 border-gray-600"></div>
                          <div className="border-2 border-gray-600"></div>
                          <div className="border-2 border-gray-600"></div>
                        </div>
                      </button>
                      
                      {/* No borders */}
                      <button
                        onClick={() => onStyleUpdate('headerBorderType', 'none')}
                        className={`w-10 h-10 border-2 rounded hover:bg-blue-50 transition flex items-center justify-center ${
                          !element.style?.headerBorderType || element.style?.headerBorderType === 'none'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-400'
                        }`}
                        title="No borders"
                      >
                        <div className="w-6 h-6 border-2 border-dashed theme-border"></div>
                      </button>
                      
                      {/* Top and bottom */}
                      <button
                        onClick={() => onStyleUpdate('headerBorderType', 'top-bottom')}
                        className={`w-10 h-10 border-2 rounded hover:bg-blue-50 transition flex items-center justify-center ${
                          element.style?.headerBorderType === 'top-bottom'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-400'
                        }`}
                        title="Top and bottom borders"
                      >
                        <div className="w-6 h-6 border-t-2 border-b-2 border-gray-600"></div>
                      </button>
                      
                      {/* Left and right */}
                      <button
                        onClick={() => onStyleUpdate('headerBorderType', 'left-right')}
                        className={`w-10 h-10 border-2 rounded hover:bg-blue-50 transition flex items-center justify-center ${
                          element.style?.headerBorderType === 'left-right'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-400'
                        }`}
                        title="Left and right borders"
                      >
                        <div className="w-6 h-6 border-l-2 border-r-2 border-gray-600"></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            
            <div className="p-4 theme-bg-tertiary border theme-border rounded-lg">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Icon name="grid" size="sm" />
                Cells
              </h3>
              
              {/* Cor */}
              <div className="mb-3">
                <label className="text-xs font-medium theme-text-muted mb-2 block">Color</label>
                <div className="flex gap-3">
                  <ColorField
                    label="Background"
                      value={element.style?.cellBackground && element.style?.cellBackground !== 'transparent' ? element.style?.cellBackground : '#ffffff'}
                    onValueChange={(value) => onStyleUpdate('cellBackground', value)}
                      disabled={!element.style?.cellBackground || element.style?.cellBackground === 'transparent'}
                    />
                  <ColorField
                    label="Text"
                      value={element.style?.cellColor || '#000000'}
                    onValueChange={(value) => onStyleUpdate('cellColor', value)}
                    />
                  </div>
                <div className="mt-2">
                  <Checkbox
                    id="cell-transparent-bg"
                    checked={!element.style?.cellBackground || element.style?.cellBackground === 'transparent'}
                    onChange={(e) => onStyleUpdate('cellBackground', e.target.checked ? 'transparent' : '#ffffff')}
                    label="Transparent Background"
                  />
                </div>
              </div>

              <Divider className="my-3" />

              {/* Font */}
              <div className="mb-3">
                <label className="text-xs font-medium theme-text-muted mb-2 block">Font</label>
                <div className="flex items-center gap-1">
                  <Select
                    value={element.style?.fontFamily || 'Helvetica'}
                    onChange={(e) => onStyleUpdate('fontFamily', e.target.value)}
                    options={[
                      { value: 'Helvetica', label: 'Helvetica' },
                      { value: 'Helvetica-Bold', label: 'Helvetica Bold' },
                      { value: 'Times', label: 'Times New Roman' },
                      { value: 'Courier', label: 'Courier New' },
                    ]}
                    className="flex-1 min-w-0"
                  />
                  
                  <Input
                    type="number"
                    min={6}
                    max={72}
                    value={element.style?.fontSize || 10}
                    onChange={(e) => onStyleUpdate('fontSize', parseFloat(e.target.value))}
                    size="sm"
                    className="w-11 text-center"
                  />
                  
                  <IconButton
                    icon="minus"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const currentSize = element.style?.fontSize || 10
                      onStyleUpdate('fontSize', Math.max(6, currentSize - 1))
                    }}
                    tooltip="Decrease size"
                  />
                  <IconButton
                    icon="plus"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const currentSize = element.style?.fontSize || 10
                      onStyleUpdate('fontSize', Math.min(72, currentSize + 1))
                    }}
                    tooltip="Increase size"
                  />
                </div>
                </div>

              <Divider className="my-3" />

              {/* Paddings das Cells */}
              <div className="mb-3">
                <label className="text-xs font-medium theme-text-muted mb-2 block">Paddings</label>
                <div className="space-y-2">
                  <Checkbox
                      id="cell-same-padding"
                      checked={element.style?.cellSamePadding || false}
                      onChange={(e) => {
                        const checked = e.target.checked
                        if (checked) {
                          const value = element.style?.cellPaddingLeft || element.style?.cellPadding || 5
                          onStyleUpdate('cellPaddingLeft', value)
                          onStyleUpdate('cellPaddingRight', value)
                          onStyleUpdate('cellPaddingTop', value)
                          onStyleUpdate('cellPaddingBottom', value)
                          onStyleUpdate('cellPadding', value)
                          onStyleUpdate('cellSamePadding', true)
                        } else {
                          onStyleUpdate('cellSamePadding', false)
                        }
                      }}
                    label="Use the same value for every padding"
                  />
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <NumberField
                      label="Left"
                        value={element.style?.cellPaddingLeft || element.style?.cellPadding || 5}
                      onValueChange={(value) => {
                          if (element.style?.cellSamePadding) {
                            onStyleUpdate('cellPaddingLeft', value)
                            onStyleUpdate('cellPaddingRight', value)
                            onStyleUpdate('cellPaddingTop', value)
                            onStyleUpdate('cellPaddingBottom', value)
                            onStyleUpdate('cellPadding', value)
                          } else {
                            onStyleUpdate('cellPaddingLeft', value)
                          }
                        }}
                      min={0}
                      step={1}
                    />
                    <NumberField
                      label="Right"
                        value={element.style?.cellPaddingRight || element.style?.cellPadding || 5}
                      onValueChange={(value) => onStyleUpdate('cellPaddingRight', value)}
                      min={0}
                      step={1}
                        disabled={element.style?.cellSamePadding || false}
                      />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField
                      label="Top"
                        value={element.style?.cellPaddingTop || element.style?.cellPadding || 5}
                      onValueChange={(value) => onStyleUpdate('cellPaddingTop', value)}
                      min={0}
                      step={1}
                        disabled={element.style?.cellSamePadding || false}
                      />
                    <NumberField
                      label="Bottom"
                        value={element.style?.cellPaddingBottom || element.style?.cellPadding || 5}
                      onValueChange={(value) => onStyleUpdate('cellPaddingBottom', value)}
                      min={0}
                      step={1}
                        disabled={element.style?.cellSamePadding || false}
                      />
                </div>
              </div>
            </div>

              <Divider className="my-3" />

              {/* Borders das Cells */}
              <div className="mb-3">
                <h4 className="text-xs font-medium theme-text-secondary mb-2">Borders</h4>
                
                {/* Border Preview Box */}
                <div className="mb-3 p-3 theme-bg-tertiary border theme-border rounded">
                  <div className="flex items-center justify-center mb-2">
                    <div 
                      className="w-32 h-32 bg-white"
                      style={{
                        borderTopWidth: `${getCellBorderValues().top}px`,
                        borderTopStyle: element.style?.borderStyle ?? 'solid',
                        borderTopColor: element.style?.borderColor ?? '#cccccc',
                        borderRightWidth: `${getCellBorderValues().right}px`,
                        borderRightStyle: element.style?.borderStyle ?? 'solid',
                        borderRightColor: element.style?.borderColor ?? '#cccccc',
                        borderBottomWidth: `${getCellBorderValues().bottom}px`,
                        borderBottomStyle: element.style?.borderStyle ?? 'solid',
                        borderBottomColor: element.style?.borderColor ?? '#cccccc',
                        borderLeftWidth: `${getCellBorderValues().left}px`,
                        borderLeftStyle: element.style?.borderStyle ?? 'solid',
                        borderLeftColor: element.style?.borderColor ?? '#cccccc',
                      }}
                    />
                  </div>
                  <div className="text-xs theme-text-muted text-center space-y-0.5">
                    <div>Top: {getCellBorderValues().top}px</div>
                    <div>Right: {getCellBorderValues().right}px</div>
                    <div>Bottom: {getCellBorderValues().bottom}px</div>
                    <div>Left: {getCellBorderValues().left}px</div>
                  </div>
                </div>
              
                <div className="space-y-3">
                  <PropertyRow label="Pen Color:" labelWidth="lg">
                    <ColorInput
                      value={element.style?.borderColor ?? '#cccccc'}
                    onChange={(e) => onStyleUpdate('borderColor', e.target.value)}
                  />
                  </PropertyRow>

                  <PropertyRow label="Pen Style:" labelWidth="lg">
                    <div className="flex gap-1 flex-1">
                      {[
                        { value: 'solid', label: 'Solid' },
                        { value: 'dashed', label: 'Dashed' },
                        { value: 'dotted', label: 'Dotted' }
                      ].map((style) => (
                        <Button
                          key={style.value}
                          variant={((element.style?.borderStyle || 'solid') === style.value) ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => onStyleUpdate('borderStyle', style.value)}
                          className="flex-1 flex-col py-2"
                        >
                          <div 
                            className="h-0 mx-auto w-full"
                            style={{ 
                              borderTopWidth: '2px',
                              borderTopStyle: style.value as 'solid' | 'dashed' | 'dotted',
                              borderTopColor: (element.style?.borderStyle || 'solid') === style.value ? '#fff' : '#666'
                            }}
                          />
                          <span className="mt-1 block text-[10px]">
                            {style.label}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </PropertyRow>

                  <PropertyRow label="Pen Width:" labelWidth="lg">
                    <Input
                    type="number"
                      value={element.style?.borderWidth ?? 1}
                      onChange={(e) => {
                        const newWidth = parseFloat(e.target.value) || 0
                        onStyleUpdate('borderWidth', newWidth)
                      }}
                      size="sm"
                      className="w-24"
                      min={0}
                      max={10}
                      step={0.5}
                    />
                  </PropertyRow>
                  
                  {/* Default border styles */}
                  <div className="pt-2">
                    <label className="block text-xs theme-text-secondary mb-2">Quick border setup:</label>
                    <div className="flex gap-2">
                      {/* All borders */}
                      <button
                        onClick={() => onStyleUpdate('cellBorderType', 'row')}
                        className={`w-10 h-10 border-2 rounded hover:bg-blue-50 transition flex items-center justify-center ${
                          element.style?.cellBorderType === 'row'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-400'
                        }`}
                        title="All borders"
                      >
                        <div className="w-6 h-6 border-2 border-gray-600"></div>
                      </button>
                      
                      {/* All cells bordered */}
                      <button
                        onClick={() => onStyleUpdate('cellBorderType', 'cells')}
                        className={`w-10 h-10 border-2 rounded hover:bg-blue-50 transition flex items-center justify-center ${
                          element.style?.cellBorderType === 'cells'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-400'
                        }`}
                        title="All cells bordered"
                      >
                        <div className="w-6 h-6 grid grid-cols-2 gap-0">
                          <div className="border-2 border-gray-600"></div>
                          <div className="border-2 border-gray-600"></div>
                          <div className="border-2 border-gray-600"></div>
                          <div className="border-2 border-gray-600"></div>
              </div>
                      </button>
                      
                      {/* No borders */}
                      <button
                        onClick={() => onStyleUpdate('cellBorderType', 'none')}
                        className={`w-10 h-10 border-2 rounded hover:bg-blue-50 transition flex items-center justify-center ${
                          !element.style?.cellBorderType || element.style?.cellBorderType === 'none'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-400'
                        }`}
                        title="No borders"
                      >
                        <div className="w-6 h-6 border-2 border-dashed theme-border"></div>
                      </button>
                      
                      {/* Top and bottom */}
                      <button
                        onClick={() => onStyleUpdate('cellBorderType', 'top-bottom')}
                        className={`w-10 h-10 border-2 rounded hover:bg-blue-50 transition flex items-center justify-center ${
                          element.style?.cellBorderType === 'top-bottom'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-400'
                        }`}
                        title="Top and bottom borders"
                      >
                        <div className="w-6 h-6 border-t-2 border-b-2 border-gray-600"></div>
                      </button>
                      
                      {/* Left and right */}
                      <button
                        onClick={() => onStyleUpdate('cellBorderType', 'left-right')}
                        className={`w-10 h-10 border-2 rounded hover:bg-blue-50 transition flex items-center justify-center ${
                          element.style?.cellBorderType === 'left-right'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-400'
                        }`}
                        title="Left and right borders"
                      >
                        <div className="w-6 h-6 border-l-2 border-r-2 border-gray-600"></div>
                      </button>
            </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </>
  )
}

/**
 * Component to display and edit group properties
 */
function GroupPropertiesPanel({ 
  group, 
  location 
}: { 
  group: ElementGroup; 
  location: 'body' | 'header' | 'footer' | 'bodyBackground' | 'summary' 
}): JSX.Element {
  const { updateGroup, deleteGroup, template } = useTemplateStore()
  
  // Buscar elementos do grupo
  const groupElements = (() => {
    let allElements: Element[] = []
    
    if (location === 'header' && template.pageSettings.header) {
      allElements = template.pageSettings.header.elements
    } else if (location === 'footer' && template.pageSettings.footer) {
      allElements = template.pageSettings.footer.elements
    } else if (location === 'bodyBackground' && template.pageSettings.bodyBackground) {
      allElements = template.pageSettings.bodyBackground.elements
    } else {
      allElements = template.page
    }
    
    return allElements.filter(el => group.elementIds.includes(el.id))
  })()
  
  return (
    <div className="w-[360px] theme-bg-secondary border-l theme-border p-4 overflow-y-auto">
      <h2 className="text-sm font-semibold theme-text border-b pb-3 mb-3">
        Group Properties
      </h2>
      
      {/* Group Name */}
      <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex items-center mb-2">
          <svg 
            className="w-4 h-4 mr-2 text-purple-600" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
          <label className="text-xs font-semibold text-purple-800">
            Group Name
          </label>
        </div>
        <Input
          value={group.name}
          onChange={(e) => updateGroup(group.id, { name: e.target.value }, location)}
          placeholder="Group name"
          className="border-purple-300"
        />
      </div>
      
      {/* Print Condition */}
      <div className="mb-4">
        <label className="block text-xs font-semibold theme-text mb-2">
          Print Condition
        </label>
        <TextArea
          value={group.printCondition || ''}
          onChange={(e) => updateGroup(group.id, { printCondition: e.target.value }, location)}
          placeholder="Ex: invoice.total > 1000"
          rows={3}
          className="font-mono"
        />
        <p className="text-xs theme-text-muted mt-1">
          If empty, the group will always print. Use JavaScript expressions like:
        </p>
        <ul className="text-xs theme-text-muted mt-1 ml-4 list-disc">
          <li><code>invoice.total &gt; 1000</code></li>
          <li><code>invoice.discount &gt; 0</code></li>
          <li><code>invoice.status === "Aprovado"</code></li>
        </ul>
      </div>
      
      {/* Elementos do Grupo */}
      <div className="mb-4">
        <label className="block text-xs font-semibold theme-text mb-2">
          Elements ({group.elementIds.length})
        </label>
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {groupElements.map((element) => (
            <div
              key={element.id}
              className="px-3 py-2 theme-bg-tertiary border theme-border rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <div className="font-medium theme-text">{element.id}</div>
              <div className="theme-text-muted text-xs">
                Type: {element.type} • Position: ({Math.round(element.x)}, {Math.round(element.y)})
              </div>
            </div>
          ))}
        </div>
      </div>
      
      
      <div className="border-t pt-4">
        <button
          onClick={() => {
            if (confirm(`Ungroup "${group.name}"?\n\nElements will remain, but will no longer be part of the group.`)) {
              deleteGroup(group.id, location)
            }
          }}
          className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium flex items-center justify-center gap-2"
        >
          <Icon name="close" size="sm" />
          Ungroup Elements
        </button>
        <p className="text-xs theme-text-muted mt-2 text-center">
          Elements will not be deleted
        </p>
      </div>
    </div>
  )
}

/**
 * Component to display and edit summary page properties
 */
function SummaryPropertiesPanel(): JSX.Element {
  const { template, updateSummaryPage } = useTemplateStore()
  
  if (!template.summaryPage) {
    return (
      <div className="w-[360px] theme-bg-secondary border-l theme-border p-4">
        <p className="text-sm theme-text-muted">Summary page does not exist</p>
      </div>
    )
  }
  
  return (
    <div className="w-[360px] theme-bg-secondary border-l theme-border p-4 overflow-y-auto">
      <h2 className="text-sm font-semibold theme-text border-b pb-3 mb-3">
        Summary Properties
      </h2>
      
      {/* Info */}
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center">
          <svg 
            className="w-4 h-4 mr-2 text-green-600" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-xs font-semibold text-green-800">
            Summary Page
          </span>
        </div>
        <p className="text-xs text-green-700 mt-1">
          Additional page rendered after the main content
        </p>
      </div>
      
      {/* Print Condition */}
      <div className="mb-4">
        <label className="block text-xs font-semibold theme-text mb-2">
          Print Condition
        </label>
        <textarea
          value={template.summaryPage.printCondition || ''}
          onChange={(e) => updateSummaryPage({ printCondition: e.target.value || undefined })}
          className="w-full px-3 py-2 text-xs border theme-border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono"
          placeholder="Ex: invoice.showSummary === true"
          rows={3}
        />
        <p className="text-xs theme-text-muted mt-1">
          If empty, the summary will always print. Use JavaScript expressions like:
        </p>
        <ul className="text-xs theme-text-muted mt-1 ml-4 list-disc">
          <li><code>invoice.showSummary === true</code></li>
          <li><code>items.length &gt; 10</code></li>
          <li><code>invoice.total &gt; 1000</code></li>
        </ul>
      </div>
    </div>
  )
}

/**
 * Component to display and edit header properties
 */
function HeaderPropertiesPanel(): JSX.Element {
  const { template, updateHeader } = useTemplateStore()
  
  if (!template.pageSettings.header) {
    return (
      <div className="w-[360px] theme-bg-secondary border-l theme-border flex flex-col h-full">
        <PanelHeader title="Header Properties" />
        <div className="p-4">
        <p className="text-sm theme-text-muted">Header does not exist</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="w-[360px] theme-bg-secondary border-l theme-border flex flex-col h-full">
      <PanelHeader title="Header Properties" subtitle="Top of each page" />
      
      <div className="flex-1 overflow-y-auto p-4">
      {/* Info */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-center">
          <svg 
            className="w-4 h-4 mr-2 text-blue-600" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
          </svg>
          <span className="text-xs font-semibold text-blue-800">
            Header
          </span>
        </div>
        <p className="text-xs text-blue-700 mt-1">
          Header rendered at the top of each page
        </p>
      </div>
      
      {/* Altura */}
      <div className="mb-4">
        <NumberField
          label="Height (pt)"
          value={template.pageSettings.header.height}
          onValueChange={(value) => updateHeader({ height: value || 0 })}
          min={0}
          step={1}
        />
      </div>
      
      {/* Print Condition */}
      <div className="mb-4">
        <label className="block text-xs font-semibold theme-text mb-2">
          Print Condition
        </label>
        <TextArea
          value={template.pageSettings.header.printCondition || ''}
          onChange={(e) => updateHeader({ printCondition: e.target.value || undefined })}
          placeholder="Ex: pageNumber > 1"
          rows={3}
          className="font-mono"
        />
        <p className="text-xs theme-text-muted mt-1">
          If empty, the header will always print. Use expressions like:
        </p>
        <ul className="text-xs theme-text-muted mt-1 ml-4 list-disc">
          <li><code>pageNumber &gt; 1</code></li>
          <li><code>invoice.showHeader === true</code></li>
        </ul>
      </div>
      </div>
    </div>
  )
}

/**
 * Component to display and edit footer properties
 */
function FooterPropertiesPanel(): JSX.Element {
  const { template, updateFooter } = useTemplateStore()
  
  if (!template.pageSettings.footer) {
    return (
      <div className="w-[360px] theme-bg-secondary border-l theme-border flex flex-col h-full">
        <PanelHeader title="Footer Properties" />
        <div className="p-4">
        <p className="text-sm theme-text-muted">Footer does not exist</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="w-[360px] theme-bg-secondary border-l theme-border flex flex-col h-full">
      <PanelHeader title="Footer Properties" subtitle="Bottom of each page" />
      
      <div className="flex-1 overflow-y-auto p-4">
      {/* Info */}
      <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg">
        <div className="flex items-center">
          <Icon name="section" size="sm" className="mr-2 text-orange-600 dark:text-orange-400" />
          <span className="text-xs font-semibold text-orange-800 dark:text-orange-300">
            Footer
          </span>
        </div>
        <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
          Footer rendered at the bottom of each page
        </p>
      </div>
      
      {/* Altura */}
      <div className="mb-4">
        <NumberField
          label="Height (pt)"
          value={template.pageSettings.footer.height}
          onValueChange={(value) => updateFooter({ height: value || 0 })}
          min={0}
          step={1}
        />
      </div>
      
      {/* Print Condition */}
      <div className="mb-4">
        <label className="block text-xs font-semibold theme-text mb-2">
          Print Condition
        </label>
        <TextArea
          value={template.pageSettings.footer.printCondition || ''}
          onChange={(e) => updateFooter({ printCondition: e.target.value || undefined })}
          placeholder="Ex: pageNumber > 1"
          rows={3}
          className="font-mono"
        />
        <p className="text-xs theme-text-muted mt-1">
          If empty, the footer will always print. Use expressions like:
        </p>
        <ul className="text-xs theme-text-muted mt-1 ml-4 list-disc">
          <li><code>pageNumber &gt; 1</code></li>
          <li><code>invoice.showFooter === true</code></li>
        </ul>
      </div>
      </div>
    </div>
  )
}

/**
 * Component to display and edit body background properties
 */
function BackgroundPropertiesPanel(): JSX.Element {
  const { template, updateBodyBackground } = useTemplateStore()
  
  if (!template.pageSettings.bodyBackground) {
    return (
      <div className="w-[360px] theme-bg-secondary border-l theme-border p-4">
        <p className="text-sm theme-text-muted">Background does not exist</p>
      </div>
    )
  }
  
  return (
    <div className="w-[360px] theme-bg-secondary border-l theme-border p-4 overflow-y-auto">
      <h2 className="text-sm font-semibold theme-text border-b pb-3 mb-3">
        Background Properties
      </h2>
      
      {/* Info */}
      <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex items-center">
          <svg 
            className="w-4 h-4 mr-2 text-purple-600" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 3l18 18" />
          </svg>
          <span className="text-xs font-semibold text-purple-800">
            Background
          </span>
        </div>
        <p className="text-xs text-purple-700 mt-1">
          Elements rendered behind the main content
        </p>
      </div>
      
      {/* Print Condition */}
      <div className="mb-4">
        <label className="block text-xs font-semibold theme-text mb-2">
          Print Condition
        </label>
        <textarea
          value={template.pageSettings.bodyBackground.printCondition || ''}
          onChange={(e) => updateBodyBackground({ printCondition: e.target.value || undefined })}
          className="w-full px-3 py-2 text-xs border theme-border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono"
          placeholder="Ex: invoice.showBackground === true"
          rows={3}
        />
        <p className="text-xs theme-text-muted mt-1">
          If empty, the background will always print. Use expressions like:
        </p>
        <ul className="text-xs theme-text-muted mt-1 ml-4 list-disc">
          <li><code>invoice.showBackground === true</code></li>
          <li><code>pageNumber === 1</code></li>
        </ul>
      </div>
    </div>
  )
}

// Componente para editar elementos filhos do Loop
interface LoopChildEditorProps {
  child: Element
  index: number
  loopId: string
  location: ElementLocation | null
}

function LoopChildEditor({ child, index, loopId, location }: LoopChildEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { updateLoopChildElement, deleteLoopChildElement } = useTemplateStore()
  
  const getElementIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      text: 'text',
      static_text: 'static-text',
      image: 'image',
      rectangle: 'rectangle',
      line: 'line',
      table: 'table',
      barcode: 'barcode',
      loop: 'loop',
    }
    return iconMap[type] || 'rectangle'
  }
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-mono">{index + 1}</span>
          <span className="text-primary-500"><Icon name={getElementIcon(child.type) as IconName} size="sm" /></span>
          <span className="text-xs font-medium text-gray-700 capitalize">{child.type.replace('_', ' ')}</span>
          {child.value && (
            <span className="text-xs text-gray-400 truncate max-w-[80px]">
              {child.value.substring(0, 15)}{child.value.length > 15 ? '...' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              deleteLoopChildElement(loopId, child.id, location)
            }}
            className="p-1 text-red-500 hover:bg-red-100 rounded"
            title="Remove"
          >
            <Icon name="trash" size="xs" />
          </button>
          <svg 
            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {/* Content expandido */}
      {isExpanded && (
        <div className="p-3 border-t border-gray-100 space-y-3">
          
          <div className="grid grid-cols-2 gap-2">
            <NumberField
              label="X"
                value={child.x || 0}
              onValueChange={(value) => updateLoopChildElement(loopId, child.id, { x: value }, location)}
            />
            <NumberField
              label="Y"
                value={child.y || 0}
              onValueChange={(value) => updateLoopChildElement(loopId, child.id, { y: value }, location)}
              />
          </div>
          
          {/* Tamanho (para elementos com width/height) */}
          {(child.type !== 'line') && (
            <div className="grid grid-cols-2 gap-2">
              <NumberField
                label="Width"
                  value={child.width || 100}
                onValueChange={(value) => updateLoopChildElement(loopId, child.id, { width: value }, location)}
              />
              <NumberField
                label="Height"
                  value={child.height || 20}
                onValueChange={(value) => updateLoopChildElement(loopId, child.id, { height: value }, location)}
                />
            </div>
          )}
          
          {/* Valor (para texto) */}
          {(child.type === 'text' || child.type === 'static_text') && (
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500">Valor/Binding</label>
              <Input
                value={child.value || ''}
                onChange={(e) => updateLoopChildElement(loopId, child.id, { value: e.target.value }, location)}
                placeholder={child.type === 'text' ? 'field' : 'Text'}
                size="sm"
                className="font-mono"
              />
            </div>
          )}
          
          {/* Linha (width, height) */}
          {child.type === 'line' && (
            <div className="grid grid-cols-2 gap-2">
              <NumberField
                label="Width"
                value={child.width ?? (child.x2 ? child.x2 - child.x : 100)}
                onValueChange={(value) => updateLoopChildElement(loopId, child.id, { width: value }, location)}
              />
              <NumberField
                label="Height"
                value={child.height ?? (child.y2 ? child.y2 - child.y : 0)}
                onValueChange={(value) => updateLoopChildElement(loopId, child.id, { height: value }, location)}
              />
            </div>
          )}
          
          {/* Font Size (para texto) */}
          {(child.type === 'text' || child.type === 'static_text') && (
            <div className="grid grid-cols-2 gap-2">
              <NumberField
                label="Font Size"
                  value={child.style?.fontSize || 10}
                onValueChange={(value) => updateLoopChildElement(loopId, child.id, { 
                  style: { ...child.style, fontSize: value } 
                  }, location)}
              />
              <ColorField
                label="Cor"
                  value={child.style?.color || '#000000'}
                onValueChange={(value) => updateLoopChildElement(loopId, child.id, { 
                  style: { ...child.style, color: value } 
                  }, location)}
                />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Painel de propriedades completo para elementos filhos do loop
interface LoopChildPropertiesPanelProps {
  loopId: string
  child: Element
  location: ElementLocation | null
  loopElement: Element
}

function LoopChildPropertiesPanel({ loopId, child, location, loopElement }: LoopChildPropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState<string>('appearance')
  const { updateLoopChildElement, deleteLoopChildElement, clearLoopChildSelection } = useTemplateStore()
  
  
  const loopWidth = loopElement?.width || 400
  const loopHeight = loopElement?.height || 50
  const isContainerParent = loopElement?.type === 'container'
  
  const handleUpdate = (field: string, value: string | number | boolean | object | null) => {
    updateLoopChildElement(loopId, child.id, { [field]: value }, location)
  }
  
  const handleStyleUpdate = (field: string, value: string | number | boolean | null) => {
    updateLoopChildElement(loopId, child.id, { 
      style: { ...child.style, [field]: value } 
    }, location)
  }

  const handleFullUpdate = (updates: Partial<Element>) => {
    updateLoopChildElement(loopId, child.id, updates, location)
  }
  
  // Tabs baseadas no tipo do elemento
  const getTabs = () => {
    if (child.type === 'text' || child.type === 'static_text') {
      return [
        { id: 'appearance', label: 'Appearance' },
        { id: 'font', label: 'Font' },
      ]
    } else if (child.type === 'rectangle') {
      return [
        { id: 'appearance', label: 'Appearance' },
        { id: 'borders', label: 'Borders' },
      ]
    } else if (child.type === 'line') {
      return [
        { id: 'appearance', label: 'Appearance' },
        { id: 'style', label: 'Style' },
      ]
    } else if (child.type === 'image') {
      return [
        { id: 'appearance', label: 'Appearance' },
        { id: 'image', label: 'Image' },
      ]
    }
    return [{ id: 'appearance', label: 'Appearance' }]
  }

  const tabs = getTabs()
  
  const getIcon = () => {
    switch (child.type) {
      case 'text':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7h16M9 20v-13M15 20v-13" />
          </svg>
        )
      case 'static_text':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7h16M9 20v-13M15 20v-13" />
            <circle cx="18" cy="18" r="3" fill="currentColor" stroke="none" />
          </svg>
        )
      case 'image':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        )
      case 'rectangle':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
          </svg>
        )
      case 'line':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 19l14-14" />
          </svg>
        )
      default:
        console.log("clicked")
        return null
    }
  }
  
  return (
    <div className="w-[360px] theme-bg-secondary border-l theme-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b theme-border flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => clearLoopChildSelection()}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500"
              title="Back to Loop"
            >
              <Icon name="arrow-left" size="sm" />
            </button>
            <span className="text-purple-500">{getIcon()}</span>
            <span className="text-sm font-semibold theme-text capitalize">{child.type.replace('_', ' ')}</span>
          </div>
          <button
            onClick={() => {
              deleteLoopChildElement(loopId, child.id, location)
              clearLoopChildSelection()
            }}
            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
            title="Delete element"
          >
            <Icon name="trash" size="sm" />
          </button>
        </div>
        
        <div className="text-xs text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded">
          Loop child element: <span className="font-mono">{loopId}</span>
        </div>
      </div>
      
      {/* Tabs */}
      <TabBar
        tabs={tabs.map((tab) => ({
          id: tab.id,
          label: tab.label,
        }))}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="border-b theme-border flex-shrink-0"
      />
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* APPEARANCE TAB - Comum a todos */}
        {activeTab === 'appearance' && (
          <>
            {/* ID */}
            <div className="space-y-1 mb-3">
              <label className="text-xs font-medium theme-text-muted">ID</label>
              <Input
                value={child.id}
                onChange={(e) => handleUpdate('id', e.target.value)}
                size="sm"
              />
            </div>
            
            <Divider className="my-3" />
            
            <PropertyGroup title="Position (relative to loop)" collapsible={false}>
              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  label="X"
                    value={child.x || 0}
                  onValueChange={(value) => handleUpdate('x', value)}
                />
                <NumberField
                  label="Y"
                    value={child.y || 0}
                  onValueChange={(value) => handleUpdate('y', value)}
                  />
                </div>
            </PropertyGroup>
            
            {child.type !== 'line' && (
              <>
                <PropertyGroup title="Size" collapsible={false}>
                  {/* Info do tamanho do loop */}
                  <div className="mb-3 p-2 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded text-xs">
                    <span className="text-purple-700 dark:text-purple-300">
                      📐 Loop Dimensions: <span className="font-mono font-medium">{loopWidth}×{loopHeight}</span>px
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <NumberField
                        label="Width"
                        value={typeof child.width === 'string' ? 0 : (child.width || 100)}
                        onValueChange={(value) => handleUpdate('width', value)}
                        disabled={child.width === '100%'}
                      />
                      {child.type === 'rectangle' && (
                        <>
                          <Checkbox
                            id="loop-child-width-100"
                              checked={child.width === '100%'}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  handleFullUpdate({ width: '100%', x: 0 })
                                } else {
                                  handleUpdate('width', 100)
                                }
                              }}
                            label="100%"
                            className="mt-2"
                            />
                          {child.width === '100%' && (
                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                              = {loopWidth}px (loop width)
                            </p>
                          )}
                        </>
                      )}
                    </div>
                    <div>
                      <NumberField
                        label="Height"
                        value={typeof child.height === 'string' ? 0 : (child.height || 20)}
                        onValueChange={(value) => handleUpdate('height', value)}
                        disabled={child.height === '100%'}
                      />
                      {child.type === 'rectangle' && (
                        <>
                          <Checkbox
                            id="loop-child-height-100"
                              checked={child.height === '100%'}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  handleFullUpdate({ height: '100%', y: 0 })
                                } else {
                                  handleUpdate('height', 100)
                                }
                              }}
                            label="100%"
                            className="mt-2"
                            />
                          {child.height === '100%' && (
                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                              = {loopHeight}px (loop height)
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </PropertyGroup>
              </>
            )}
            
            {/* Linha: Size */}
            {child.type === 'line' && (
              <PropertyGroup title="Size" collapsible={false}>
                  <div className="grid grid-cols-2 gap-3">
                  <NumberField
                    label="Width"
                    value={child.width ?? (child.x2 ? child.x2 - child.x : 100)}
                    onValueChange={(value) => handleUpdate('width', value)}
                  />
                  <NumberField
                    label="Height"
                    value={child.height ?? (child.y2 ? child.y2 - child.y : 0)}
                    onValueChange={(value) => handleUpdate('height', value)}
                      />
                    </div>
                <p className="text-xs theme-text-muted mt-2">
                  Line is drawn from (X, Y) to (X + Width, Y + Height)
                </p>
              </PropertyGroup>
            )}
            
            {/* Valor/Texto para texto e static_text */}
            {(child.type === 'text' || child.type === 'static_text') && (
              <PropertyGroup title={child.type === 'text' ? 'Data Binding' : 'Texto'} collapsible={false}>
                <TextArea
                  value={child.type === 'text'
                    ? (isContainerParent ? (child.dataBinding || '') : (child.value || ''))
                    : (child.value || '')}
                  onChange={(e) => {
                    if (child.type === 'text') {
                      handleUpdate(isContainerParent ? 'dataBinding' : 'value', e.target.value)
                      return
                    }
                    handleUpdate('value', e.target.value)
                  }}
                  placeholder={child.type === 'text'
                    ? (isContainerParent ? 'customer.name' : 'field_name')
                    : 'Enter text...'}
                  rows={3}
                  className="font-mono"
                />
                {child.type === 'text' && (
                  <p className="text-xs theme-text-muted mt-1">
                    {isContainerParent
                      ? 'Use full data path from template context (e.g., customer.name)'
                      : 'Use only the property name (e.g., name, value, price)'}
                  </p>
                )}
              </PropertyGroup>
            )}
            
            {child.type === 'rectangle' && (
              <PropertyGroup title="Color" collapsible={false}>
                <div className="space-y-3">
                  <PropertyRow label="Fill" labelWidth="lg">
                    <ColorInput
                      value={child.style?.fillColor || '#4a90e2'}
                      onChange={(e) => handleStyleUpdate('fillColor', e.target.value)}
                      disabled={!child.style?.fillColor}
                    />
                  </PropertyRow>
                  <Checkbox
                    id="loop-child-rect-transparent"
                      checked={!child.style?.fillColor}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleStyleUpdate('fillColor', null)
                        } else {
                          handleStyleUpdate('fillColor', '#4a90e2')
                        }
                      }}
                    label="Transparent"
                    />
                </div>
              </PropertyGroup>
            )}
          </>
        )}
        
        {/* FONT TAB - Para texto */}
        {activeTab === 'font' && (child.type === 'text' || child.type === 'static_text') && (
          <>
            <PropertyGroup title="Font" collapsible={false}>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium theme-text-muted">Family</label>
                  <Select
                    value={child.style?.fontFamily || 'Helvetica'}
                    onChange={(e) => handleStyleUpdate('fontFamily', e.target.value)}
                    options={[
                      { value: 'Helvetica', label: 'Helvetica' },
                      { value: 'Times-Roman', label: 'Times Roman' },
                      { value: 'Courier', label: 'Courier' },
                    ]}
                  />
                </div>
                <NumberField
                  label="Size"
                    value={child.style?.fontSize || 12}
                  onValueChange={(value) => handleStyleUpdate('fontSize', value)}
                  />
            </div>
            
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium theme-text-muted">Weight</label>
                  <Select
                  value={child.style?.fontWeight || 'normal'}
                  onChange={(e) => handleStyleUpdate('fontWeight', e.target.value)}
                    options={[
                      { value: 'normal', label: 'Normal' },
                      { value: 'bold', label: 'Bold' },
                    ]}
                  />
              </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium theme-text-muted">Style</label>
                  <Select
                  value={child.style?.fontStyle || 'normal'}
                  onChange={(e) => handleStyleUpdate('fontStyle', e.target.value)}
                    options={[
                      { value: 'normal', label: 'Normal' },
                      { value: 'italic', label: 'Italic' },
                    ]}
                  />
              </div>
            </div>
            </PropertyGroup>
            
            <PropertyGroup title="Colors" collapsible={false}>
              <div className="space-y-3">
                <PropertyRow label="Text" labelWidth="lg">
                  <ColorInput
                    value={child.style?.color || '#000000'}
                    onChange={(e) => handleStyleUpdate('color', e.target.value)}
                  />
                </PropertyRow>
                <PropertyRow label="Background" labelWidth="lg">
                  <ColorInput
                      value={child.style?.backgroundColor || '#ffffff'}
                      onChange={(e) => handleStyleUpdate('backgroundColor', e.target.value)}
                      disabled={!child.style?.backgroundColor}
                  />
                </PropertyRow>
                <Checkbox
                  id="loop-child-bg-none"
                        checked={!child.style?.backgroundColor}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleStyleUpdate('backgroundColor', null)
                          } else {
                            handleStyleUpdate('backgroundColor', '#ffffff')
                          }
                        }}
                  label="None"
                      />
                  </div>
            </PropertyGroup>
            
            <div>
              <h3 className="text-xs font-semibold theme-text mb-2">Alignment</h3>
              <div className="flex gap-1">
                {['left', 'center', 'right'].map(align => (
                  <button
                    key={align}
                    onClick={() => handleStyleUpdate('alignment', align)}
                    className={`flex-1 px-2 py-2 text-xs border rounded transition ${
                      (child.style?.alignment || 'left') === align
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'theme-border bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {align === 'left' ? '◀ Left' : align === 'center' ? '◆ Center' : '▶ Right'}
                  </button>
                ))}
              </div>
            </div>
            
            <PropertyGroup title="Multiline" collapsible={false}>
              <Checkbox
                id="loop-child-multiline"
                  checked={child.style?.multiline || false}
                  onChange={(e) => handleStyleUpdate('multiline', e.target.checked)}
                label="Multiline text"
                />
            
            {child.style?.multiline && (
                <NumberField
                  label="Line Height"
                  value={child.style?.lineHeight || 1.2}
                  onValueChange={(value) => handleStyleUpdate('lineHeight', value)}
                  step={0.1}
                  min={0.5}
                  max={3}
                />
              )}
            </PropertyGroup>
          </>
        )}
        
        
        {activeTab === 'borders' && child.type === 'rectangle' && (
          <>
            <div>
              <h3 className="text-xs font-semibold theme-text mb-2">Borders</h3>
              
              {/* Preview */}
              <div className="mb-3 p-3 theme-bg-tertiary border theme-border rounded flex items-center justify-center">
                <div 
                  className="w-24 h-24"
                  style={{
                    backgroundColor: child.style?.fillColor || '#4a90e2',
                    borderWidth: `${child.style?.borderWidth || 1}px`,
                    borderStyle: child.style?.borderStyle || 'solid',
                    borderColor: child.style?.borderColor || '#000000',
                    borderRadius: `${child.style?.cornerRadius || 0}px`,
                  }}
                />
              </div>
              
              <div className="space-y-3">
                <PropertyRow label="Color:" labelWidth="lg">
                  <ColorInput
                    value={child.style?.borderColor || '#000000'}
                    onChange={(e) => handleStyleUpdate('borderColor', e.target.value)}
                  />
                </PropertyRow>
                
                <PropertyRow label="Style:" labelWidth="lg">
                  <div className="flex gap-1 flex-1">
                    {[
                      { value: 'solid', label: 'Solid' },
                      { value: 'dashed', label: 'Dashed' },
                      { value: 'dotted', label: 'Dotted' }
                    ].map((style) => (
                      <Button
                        key={style.value}
                        variant={((child.style?.borderStyle || 'solid') === style.value) ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handleStyleUpdate('borderStyle', style.value)}
                        className="flex-1 flex-col py-2"
                      >
                        <div 
                          className="h-0 mx-auto w-full"
                          style={{ 
                            borderTopWidth: '2px',
                            borderTopStyle: style.value as 'solid' | 'dashed' | 'dotted',
                            borderTopColor: (child.style?.borderStyle || 'solid') === style.value ? '#fff' : '#666'
                          }}
                        />
                        <span className="mt-1 block text-[10px]">{style.label}</span>
                      </Button>
                    ))}
                  </div>
                </PropertyRow>
                
                <PropertyRow label="Width:" labelWidth="lg">
                  <Input
                    type="number"
                    value={child.style?.borderWidth ?? 1}
                    onChange={(e) => handleStyleUpdate('borderWidth', parseFloat(e.target.value) || 0)}
                    size="sm"
                    className="w-24"
                    min={0}
                    max={10}
                    step={0.5}
                  />
                </PropertyRow>
                
                <PropertyRow label="Radius:" labelWidth="lg">
                  <Input
                    type="number"
                    value={child.style?.cornerRadius || 0}
                    onChange={(e) => handleStyleUpdate('cornerRadius', parseFloat(e.target.value))}
                    size="sm"
                    className="w-24"
                    min={0}
                  />
                </PropertyRow>
                
                {/* Default border styles */}
                <div className="pt-2">
                  <label className="block text-xs theme-text-secondary mb-2">Default borders:</label>
                  {(() => {
                    const bw = child.style?.borderWidth ?? 1
                    const top = child.style?.borderTopWidth ?? bw
                    const right = child.style?.borderRightWidth ?? bw
                    const bottom = child.style?.borderBottomWidth ?? bw
                    const left = child.style?.borderLeftWidth ?? bw
                    const isAll = top > 0 && right > 0 && bottom > 0 && left > 0
                    const isNone = top === 0 && right === 0 && bottom === 0 && left === 0
                    const isTopBottom = top > 0 && bottom > 0 && right === 0 && left === 0
                    const isLeftRight = left > 0 && right > 0 && top === 0 && bottom === 0
                    return (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const width = child.style?.borderWidth || 1
                            handleFullUpdate({
                              style: {
                                ...child.style,
                                borderTopWidth: width,
                                borderRightWidth: width,
                                borderBottomWidth: width,
                                borderLeftWidth: width,
                              }
                            })
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isAll ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="Todas as bordas"
                        >
                          <div className={`w-6 h-6 border-2 ${isAll ? 'border-primary-500' : 'border-gray-500'}`}></div>
                        </button>
                        
                        <button
                          onClick={() => {
                            handleFullUpdate({
                              style: {
                                ...child.style,
                                borderTopWidth: 0,
                                borderRightWidth: 0,
                                borderBottomWidth: 0,
                                borderLeftWidth: 0,
                              }
                            })
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isNone ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="Sem bordas"
                        >
                          <div className={`w-6 h-6 border-2 border-dashed ${isNone ? 'border-primary-300' : 'border-gray-300'}`}></div>
                        </button>
                        
                        <button
                          onClick={() => {
                            const width = child.style?.borderWidth || 1
                            handleFullUpdate({
                              style: {
                                ...child.style,
                                borderTopWidth: width,
                                borderRightWidth: 0,
                                borderBottomWidth: width,
                                borderLeftWidth: 0,
                              }
                            })
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isTopBottom ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="Topo e fundo"
                        >
                          <div className={`w-6 h-6 border-t-2 border-b-2 ${isTopBottom ? 'border-primary-500' : 'border-gray-500'}`}></div>
                        </button>
                        
                        <button
                          onClick={() => {
                            const width = child.style?.borderWidth || 1
                            handleFullUpdate({
                              style: {
                                ...child.style,
                                borderTopWidth: 0,
                                borderRightWidth: width,
                                borderBottomWidth: 0,
                                borderLeftWidth: width,
                              }
                            })
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isLeftRight ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="Esquerda e direita"
                        >
                          <div className={`w-6 h-6 border-l-2 border-r-2 ${isLeftRight ? 'border-primary-500' : 'border-gray-500'}`}></div>
                        </button>
                      </div>
                    )
                  })()}
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* STYLE TAB - Para linha */}
        {activeTab === 'style' && child.type === 'line' && (
          <>
            <PropertyGroup title="Estilo da Linha" collapsible={false}>
              <div className="space-y-3">
                <PropertyRow label="Color:" labelWidth="lg">
                  <ColorInput
                    value={child.style?.strokeColor || '#000000'}
                    onChange={(e) => handleStyleUpdate('strokeColor', e.target.value)}
                  />
                </PropertyRow>
                
                <PropertyRow label="Espessura:" labelWidth="lg">
                  <Input
                    type="number"
                    value={child.style?.strokeWidth || 1}
                    onChange={(e) => handleStyleUpdate('strokeWidth', parseFloat(e.target.value))}
                    size="sm"
                    className="w-24"
                    min={0.5}
                    max={20}
                    step={0.5}
                  />
                </PropertyRow>
                
                <PropertyRow label="Style:" labelWidth="lg">
                  <div className="flex gap-1 flex-1">
                    {[
                      { value: 'solid', label: 'Solid' },
                      { value: 'dashed', label: 'Dashed' },
                      { value: 'dotted', label: 'Dotted' }
                    ].map((style) => (
                      <Button
                        key={style.value}
                        variant={((child.style?.borderStyle || 'solid') === style.value) ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handleStyleUpdate('borderStyle', style.value)}
                        className="flex-1 flex-col py-2"
                      >
                        <div 
                          className="h-0 mx-auto w-full"
                          style={{ 
                            borderTopWidth: '2px',
                            borderTopStyle: style.value as 'solid' | 'dashed' | 'dotted',
                            borderTopColor: (child.style?.borderStyle || 'solid') === style.value ? '#fff' : '#666'
                          }}
                        />
                        <span className="mt-1 block text-[10px]">{style.label}</span>
                      </Button>
                    ))}
                  </div>
                </PropertyRow>
                </div>
            </PropertyGroup>
          </>
        )}
        
        {/* IMAGE TAB - Para imagem */}
        {activeTab === 'image' && child.type === 'image' && (
          <PropertyGroup title="Image Settings" collapsible={false}>
              <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium theme-text-muted">Source / Data Binding</label>
                <Input
                    value={child.source || ''}
                    onChange={(e) => handleUpdate('source', e.target.value)}
                    placeholder="campo_imagem ou URL"
                  size="sm"
                  className="font-mono"
                  />
                  <p className="text-xs theme-text-muted mt-1">
                    Use o nome do campo ou uma URL direta
                  </p>
                </div>
                
              <div className="space-y-1">
                <label className="text-xs font-medium theme-text-muted">Fit (Ajuste)</label>
                <Select
                    value={child.fit || 'contain'}
                    onChange={(e) => handleUpdate('fit', e.target.value)}
                  options={[
                    { value: 'contain', label: 'Contain (maintain aspect ratio, fit)' },
                    { value: 'cover', label: 'Cover (cobrir, cortar)' },
                    { value: 'fill', label: 'Fill (esticar)' },
                  ]}
                />
                </div>
                
              <div className="space-y-1">
                <label className="text-xs font-medium theme-text-muted">Alignment</label>
                <Select
                    value={child.alignment || 'center'}
                    onChange={(e) => handleUpdate('alignment', e.target.value)}
                  options={[
                    { value: 'center', label: 'Centro' },
                    { value: 'top', label: 'Topo' },
                    { value: 'bottom', label: 'Baixo' },
                    { value: 'left', label: 'Esquerda' },
                    { value: 'right', label: 'Direita' },
                  ]}
                />
                </div>
              </div>
          </PropertyGroup>
        )}
      </div>
    </div>
  )
}
