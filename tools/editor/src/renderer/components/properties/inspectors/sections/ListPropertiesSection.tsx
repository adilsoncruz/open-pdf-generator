import React from 'react'

type ListPropertiesSectionProps = {
  element: Element
  onUpdate: (field: string | Record<string, unknown>, value?: unknown) => void
  onStyleUpdate?: (field: string | Record<string, unknown>, value?: unknown) => void
}

export function ListPropertiesSection({ element, onUpdate, onStyleUpdate }: ListPropertiesSectionProps) {
  const isWidthFull = element.width === '100%'
  const widthVal = typeof element.width === 'number' ? element.width : 300
  const heightVal = typeof element.height === 'number' ? element.height : 60
  const style = (element.style || {}) as Record<string, unknown>
  const currentBg = (style.backgroundColor as string) || (style.fillColor as string) || ''
  const isTransparent = !currentBg || currentBg.toLowerCase() === 'transparent'

  const handleBgChange = (color: string) => {
    if (onStyleUpdate) {
      onStyleUpdate({ backgroundColor: color, fillColor: color })
    } else {
      onUpdate('style', { ...style, backgroundColor: color, fillColor: color })
    }
  }

  if (element.type === 'list') {
    const listStyle = (element.listStyle as string) || 'BULLETED'
    const itemSpacing = typeof element.itemSpacing === 'number' ? element.itemSpacing : 10
    const startY = typeof element.startY === 'number' ? element.startY : ''

    return (
      <div className="space-y-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
        <div className="text-xs font-semibold text-slate-200">Configurações da Lista</div>

        {/* Data Binding */}
        <div>
          <label className="text-[10px] text-slate-400 block mb-1">Data Binding (Caminho dos Itens)</label>
          <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500">
            <input
              type="text"
              value={element.dataBinding || ''}
              onChange={(e) => onUpdate('dataBinding', e.target.value)}
              placeholder="ex: items ou pedido.itens"
              className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none pr-5"
            />
            <span
              className={`w-2 h-2 rounded-full absolute right-2.5 ${
                element.dataBinding ? 'bg-emerald-400 shadow-sm shadow-emerald-500/50' : 'bg-slate-600'
              }`}
            />
          </div>
          <span className="text-[9px] text-slate-500 mt-0.5 block">
            Deve apontar para uma lista/array de strings ou objetos.
          </span>
        </div>

        {/* Itens Estáticos (quando não usar dataBinding) */}
        <div>
          <label className="text-[10px] text-slate-400 block mb-1">Itens da Lista (um por linha)</label>
          <textarea
            rows={3}
            value={Array.isArray(element.items) ? (element.items as string[]).join('\n') : ''}
            onChange={(e) => {
              const lines = e.target.value.split('\n')
              onUpdate('items', lines)
            }}
            placeholder="teste 1&#10;teste 2&#10;teste 3"
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono resize-y"
          />
          <span className="text-[9px] text-slate-500 mt-0.5 block">
            Usado caso não haja Data Binding definido.
          </span>
        </div>

        {/* Cor de Fundo */}
        <div>
          <label className="text-[10px] text-slate-400 block mb-1">Cor de Fundo</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={!isTransparent && currentBg.startsWith('#') && currentBg.length === 7 ? currentBg : '#ffffff'}
              onChange={(e) => handleBgChange(e.target.value)}
              className={`w-8 h-8 rounded-lg border border-slate-700 bg-slate-950 cursor-pointer p-0.5 shrink-0 ${
                isTransparent ? 'opacity-30' : ''
              }`}
            />
            <input
              type="text"
              value={currentBg}
              onChange={(e) => handleBgChange(e.target.value)}
              placeholder="transparent ou #RRGGBB"
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <button
              type="button"
              onClick={() => handleBgChange(isTransparent ? '#ffffff' : 'transparent')}
              className={`text-[10px] px-2 py-1 rounded border transition ${
                isTransparent
                  ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              {isTransparent ? 'Transparente ✓' : 'Tornar Transparente'}
            </button>
          </div>
        </div>

        {/* Largura e Altura */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Largura (W)</label>
            {isWidthFull ? (
              <div className="w-full bg-slate-900/60 border border-indigo-500/40 rounded-lg px-2 py-1 text-xs text-indigo-400 font-mono text-center font-semibold">
                100%
              </div>
            ) : (
              <input
                type="number"
                min="10"
                value={widthVal}
                onChange={(e) => onUpdate('width', parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            )}
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Altura (H)</label>
            <input
              type="number"
              min="10"
              value={heightVal}
              onChange={(e) => onUpdate('height', parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* Estilo do Marcador */}
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

        {/* Espaçamento e StartY */}
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

        {/* Data Binding */}
        <div>
          <label className="text-[10px] text-slate-400 block mb-1">Data Binding (Chave do Mapa/Objeto)</label>
          <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500">
            <input
              type="text"
              value={element.dataBinding || ''}
              onChange={(e) => onUpdate('dataBinding', e.target.value)}
              placeholder="ex: tasks ou checklist"
              className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none pr-5"
            />
            <span
              className={`w-2 h-2 rounded-full absolute right-2.5 ${
                element.dataBinding ? 'bg-emerald-400 shadow-sm shadow-emerald-500/50' : 'bg-slate-600'
              }`}
            />
          </div>
          <span className="text-[9px] text-slate-500 mt-0.5 block">
            Deve apontar para um mapa {'{ "Rótulo": true/false }'}.
          </span>
        </div>

        {/* Itens Estáticos (quando não usar dataBinding) */}
        <div>
          <label className="text-[10px] text-slate-400 block mb-1">Tarefas (use [x] ou [ ] no início)</label>
          <textarea
            rows={3}
            value={
              element.items && typeof element.items === 'object' && !Array.isArray(element.items)
                ? Object.entries(element.items as Record<string, boolean>)
                    .map(([k, v]) => `${v ? '[x]' : '[ ]'} ${k}`)
                    .join('\n')
                : Array.isArray(element.items)
                ? (element.items as string[]).join('\n')
                : ''
            }
            onChange={(e) => {
              const lines = e.target.value.split('\n')
              const map: Record<string, boolean> = {}
              lines.forEach((line) => {
                const trimmed = line.trim()
                if (!trimmed) return
                if (trimmed.startsWith('[x]') || trimmed.startsWith('[X]')) {
                  map[trimmed.substring(3).trim()] = true
                } else if (trimmed.startsWith('[ ]')) {
                  map[trimmed.substring(3).trim()] = false
                } else {
                  map[trimmed] = false
                }
              })
              onUpdate('items', map)
            }}
            placeholder="[x] Primeira tarefa&#10;[ ] Segunda tarefa"
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono resize-y"
          />
          <span className="text-[9px] text-slate-500 mt-0.5 block">
            Usado caso não haja Data Binding definido.
          </span>
        </div>

        {/* Cor de Fundo */}
        <div>
          <label className="text-[10px] text-slate-400 block mb-1">Cor de Fundo</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={!isTransparent && currentBg.startsWith('#') && currentBg.length === 7 ? currentBg : '#ffffff'}
              onChange={(e) => handleBgChange(e.target.value)}
              className={`w-8 h-8 rounded-lg border border-slate-700 bg-slate-950 cursor-pointer p-0.5 shrink-0 ${
                isTransparent ? 'opacity-30' : ''
              }`}
            />
            <input
              type="text"
              value={currentBg}
              onChange={(e) => handleBgChange(e.target.value)}
              placeholder="transparent ou #RRGGBB"
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <button
              type="button"
              onClick={() => handleBgChange(isTransparent ? '#ffffff' : 'transparent')}
              className={`text-[10px] px-2 py-1 rounded border transition ${
                isTransparent
                  ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              {isTransparent ? 'Transparente ✓' : 'Tornar Transparente'}
            </button>
          </div>
        </div>

        {/* Largura e Altura */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Largura (W)</label>
            {isWidthFull ? (
              <div className="w-full bg-slate-900/60 border border-indigo-500/40 rounded-lg px-2 py-1 text-xs text-indigo-400 font-mono text-center font-semibold">
                100%
              </div>
            ) : (
              <input
                type="number"
                min="10"
                value={widthVal}
                onChange={(e) => onUpdate('width', parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            )}
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Altura (H)</label>
            <input
              type="number"
              min="10"
              value={heightVal}
              onChange={(e) => onUpdate('height', parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* Formato da Caixa */}
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

        {/* Espaçamento e StartY */}
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
