import { useState, useEffect } from 'react'
import { useTranslation } from '../../../i18n'
import type { Element } from '../../../../store/templateStore'

interface TableGeneralTabProps {
  element: Element
  onUpdate: (field: string | Record<string, unknown>, value?: unknown) => void
}

export function TableGeneralTab({ element, onUpdate }: TableGeneralTabProps) {
  const { t } = useTranslation()
  const [localId, setLocalId] = useState(element.id || '')

  useEffect(() => {
    setLocalId(element.id || '')
  }, [element.id])

  const handleIdCommit = () => {
    const trimmed = localId.trim()
    if (trimmed && trimmed !== element.id) {
      onUpdate('id', trimmed)
    } else {
      setLocalId(element.id || '')
    }
  }

  const isRelative = (((element.positionMode || element.position || 'ABSOLUTE') as string).toUpperCase()) === 'RELATIVE'

  return (
    <>
      {/* Identification / ID */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-slate-300">ID da Tabela</span>
          <span className="text-[10px] text-slate-500 font-mono">identificador</span>
        </div>
        <div className="flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500 transition">
          <span className="text-slate-500 font-mono text-xs mr-2 select-none">#</span>
          <input
            type="text"
            value={localId}
            onChange={(e) => setLocalId(e.target.value)}
            onBlur={handleIdCommit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleIdCommit()
                ;(e.target as HTMLInputElement).blur()
              }
            }}
            className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none"
            placeholder="id_da_tabela"
          />
        </div>
      </div>

      {/* Transform */}
      <div>
        <div className="text-xs font-semibold text-slate-200 mb-2">{t.properties.transform}</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* X */}
          <div className="flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500 transition">
            <span className="text-slate-500 font-mono text-xs w-4">X</span>
            <input
              type="number"
              value={element.x ?? 0}
              onChange={(e) => onUpdate('x', parseFloat(e.target.value) || 0)}
              disabled={element.width === '100%'}
              className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right pr-1 disabled:opacity-50"
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
              <span className="w-full text-indigo-400 font-mono text-xs text-right pr-1 font-semibold">100%</span>
            ) : (
              <input
                type="number"
                value={typeof element.width === 'number' ? element.width : 400}
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
              value={typeof element.height === 'number' ? element.height : 100}
              onChange={(e) => onUpdate('height', parseFloat(e.target.value) || 0)}
              className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right pr-1"
            />
            <span className="text-slate-500 text-[10px]">pt</span>
          </div>
        </div>

        {/* Botão Largura 100% */}
        <div className="mt-2 flex items-center justify-between bg-slate-950/50 border border-slate-800 rounded-lg px-2.5 py-1.5">
          <span className="text-xs text-slate-300">{t.properties.width100}</span>
          <input
            type="checkbox"
            checked={element.width === '100%'}
            onChange={(e) => {
              if (e.target.checked) {
                onUpdate({ width: '100%', x: 0 })
              } else {
                onUpdate({ width: 400 })
              }
            }}
            className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900 cursor-pointer"
          />
        </div>

        {/* Position Mode (Absolute / Relative) */}
        <div className="mt-2.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-medium">{t.properties.position}</span>
            <span className="text-[10px] font-mono text-slate-500">
              {isRelative ? t.properties.relativeFlow : t.properties.absoluteFixed}
            </span>
          </div>
          <div className="grid grid-cols-2 bg-slate-950 border border-slate-800 rounded-lg p-0.5 gap-1">
            <button
              type="button"
              onClick={() => {
                onUpdate({ positionMode: 'ABSOLUTE', position: 'absolute' })
              }}
              className={`py-1 text-xs font-medium rounded transition text-center ${
                !isRelative
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {t.properties.absolute}
            </button>
            <button
              type="button"
              onClick={() => {
                onUpdate({
                  positionMode: 'RELATIVE',
                  position: 'relative',
                  relativeOffsetY: element.height === '100%' ? 0 : (typeof element.relativeOffsetY === 'number' ? element.relativeOffsetY : 0),
                })
              }}
              className={`py-1 text-xs font-medium rounded transition text-center ${
                isRelative
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {t.properties.relative}
            </button>
          </div>

          {isRelative && (
            <div className={`flex items-center justify-between bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500 mt-1.5 ${element.height === '100%' ? 'opacity-50' : ''}`}>
              <span className="text-slate-400 text-xs">{t.properties.offsetY}</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={element.height === '100%' ? 0 : ((element.relativeOffsetY as number) ?? 0)}
                  disabled={element.height === '100%'}
                  onChange={(e) => onUpdate('relativeOffsetY', parseFloat(e.target.value) || 0)}
                  className="w-16 bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right pr-1 disabled:cursor-not-allowed"
                />
                <span className="text-slate-500 text-[10px]">pt</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Binding */}
      <div>
        <div className="text-xs font-semibold text-slate-200 mb-2">{t.properties.dataBindingList}</div>
        <div className="space-y-2">
          <div>
            <div className="relative flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2 focus-within:border-indigo-500 transition">
              <input
                type="text"
                value={element.dataBinding || ''}
                onChange={(e) => onUpdate('dataBinding', e.target.value)}
                placeholder="Ex: items ou invoice.products"
                className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none pr-6"
              />
              <div className="absolute right-3 flex items-center">
                <span className={`w-2 h-2 rounded-full ${
                  element.dataBinding ? 'bg-emerald-400 shadow-sm shadow-emerald-500/50' : 'bg-slate-600'
                }`} />
              </div>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              {t.properties.dataBindingListHelp}
            </span>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">{t.properties.emptyMessage}</label>
            <input
              type="text"
              value={(element.emptyMessage as string) || ''}
              onChange={(e) => onUpdate('emptyMessage', e.target.value)}
              placeholder={t.properties.emptyMessagePlaceholder}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Comportamento de Cabeçalho */}
      <div>
        <div className="text-xs font-semibold text-slate-200 mb-2">{t.properties.headerBehavior}</div>
        <div className="space-y-2">
          <label className="flex items-center justify-between bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 cursor-pointer hover:border-slate-700">
            <span className="text-xs text-slate-300">{t.properties.showHeader}</span>
            <input
              type="checkbox"
              checked={element.showHeader !== false}
              onChange={(e) => onUpdate('showHeader', e.target.checked)}
              className="rounded border-slate-700 text-indigo-600 bg-slate-900 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 cursor-pointer hover:border-slate-700">
            <span className="text-xs text-slate-300">{t.properties.repeatHeader}</span>
            <input
              type="checkbox"
              checked={element.headerRepeat !== false}
              onChange={(e) => onUpdate('headerRepeat', e.target.checked)}
              className="rounded border-slate-700 text-indigo-600 bg-slate-900 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Print Condition */}
      <div>
        <div className="text-xs font-semibold text-slate-200 mb-2">{t.properties.printCondition}</div>
        <div className="flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2 focus-within:border-indigo-500 transition">
          <input
            type="text"
            value={element.printCondition || ''}
            onChange={(e) => onUpdate('printCondition', e.target.value || null)}
            placeholder="Ex: items.length > 0"
            className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none"
          />
        </div>
        <span className="text-[10px] text-slate-500 mt-1 block">
          {t.properties.printConditionHelp}
        </span>
      </div>
    </>
  )
}
