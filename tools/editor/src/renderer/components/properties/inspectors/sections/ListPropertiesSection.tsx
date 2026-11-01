import React from 'react'
import type { ElementInspectorProps } from '../../types'

type ListPropertiesSectionProps = Pick<ElementInspectorProps, 'element' | 'onUpdate'>

export function ListPropertiesSection({ element, onUpdate }: ListPropertiesSectionProps) {
  if (element.type === 'list') {
    const listStyle = (element.listStyle as string) || 'BULLETED'
    const itemSpacing = typeof element.itemSpacing === 'number' ? element.itemSpacing : 10
    const startY = typeof element.startY === 'number' ? element.startY : ''

    return (
      <div className="space-y-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
        <div className="text-xs font-semibold text-slate-200">Configurações da Lista</div>

        <div>
          <label className="text-[10px] text-slate-400 block mb-1">Estilo do Marcador</label>
          <select
            value={listStyle}
            onChange={(e) => onUpdate('listStyle', e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="BULLETED">Marcador Bullet (•)</option>
            <option value="NUMBERED">Numerada (1, 2, 3...)</option>
            <option value="START">Estrela (★ / *)</option>
            <option value="DASH">Traço (–)</option>
            <option value="DIAMOND">Losango (◆ / +)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Espaçamento (pt)</label>
            <input
              type="number"
              min="0"
              value={itemSpacing}
              onChange={(e) => onUpdate('itemSpacing', Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Start Y (opcional)</label>
            <input
              type="number"
              placeholder="Auto"
              value={startY}
              onChange={(e) => {
                const val = e.target.value.trim()
                onUpdate('startY', val === '' ? undefined : Number(val))
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>
      </div>
    )
  }

  if (element.type === 'check_list') {
    const checkStyle = (element.checkStyle as string) || 'RECTANGLE'
    const itemSpacing = typeof element.itemSpacing === 'number' ? element.itemSpacing : 0
    const startY = typeof element.startY === 'number' ? element.startY : ''

    return (
      <div className="space-y-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
        <div className="text-xs font-semibold text-slate-200">Configurações da Checklist</div>

        <div>
          <label className="text-[10px] text-slate-400 block mb-1">Formato da Caixa</label>
          <select
            value={checkStyle}
            onChange={(e) => onUpdate('checkStyle', e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="RECTANGLE">Quadrada (Borda Reta)</option>
            <option value="BORDERED">Arredondada</option>
            <option value="CIRCLE">Circular</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Espaçamento (pt)</label>
            <input
              type="number"
              min="0"
              value={itemSpacing}
              onChange={(e) => onUpdate('itemSpacing', Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Start Y (opcional)</label>
            <input
              type="number"
              placeholder="Auto"
              value={startY}
              onChange={(e) => {
                const val = e.target.value.trim()
                onUpdate('startY', val === '' ? undefined : Number(val))
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>
      </div>
    )
  }

  return null
}
