import type { Element } from '../../../../store/templateStore'
import { useTranslation } from '../../../../i18n'

interface TransformSectionProps {
  element: Element
  onUpdate: (field: string | Record<string, any>, value?: any) => void
}

export function TransformSection({ element, onUpdate }: TransformSectionProps) {
  const { t } = useTranslation()
  return (
    <>
        {/* 2. Transform Section */}
        <div>
          <div className="text-xs font-semibold text-slate-200 mb-2">
            {t.properties.transform}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* X */}
            <div className={`flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500 transition ${element.width === '100%' ? 'opacity-50' : ''}`}>
              <span className="text-slate-500 font-mono text-xs w-4">X</span>
              <input
                type="number"
                value={element.x ?? 0}
                disabled={element.width === '100%'}
                onChange={(e) => onUpdate('x', parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right pr-1 disabled:cursor-not-allowed"
              />
              <span className="text-slate-500 text-[10px]">pt</span>
            </div>

            {/* Y */}
            <div className={`flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500 transition ${element.height === '100%' ? 'opacity-50' : ''}`}>
              <span className="text-slate-500 font-mono text-xs w-4">Y</span>
              <input
                type="number"
                value={element.y ?? 0}
                disabled={element.height === '100%'}
                onChange={(e) => onUpdate('y', parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right pr-1 disabled:cursor-not-allowed"
              />
              <span className="text-slate-500 text-[10px]">pt</span>
            </div>

            {/* W */}
            <div className={`flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500 transition ${element.width === '100%' ? 'border-indigo-500/40' : ''}`}>
              <span className="text-slate-500 font-mono text-xs w-4">W</span>
              {element.width === '100%' ? (
                <span className="w-full text-indigo-400 font-mono text-xs text-right pr-1 font-semibold">100%</span>
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
            <div className={`flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500 transition ${element.height === '100%' ? 'border-indigo-500/40' : ''}`}>
              <span className="text-slate-500 font-mono text-xs w-4">H</span>
              {element.height === '100%' ? (
                <span className="w-full text-indigo-400 font-mono text-xs text-right pr-1 font-semibold">100%</span>
              ) : (
                <input
                  type="number"
                  value={typeof element.height === 'number' ? element.height : 30}
                  onChange={(e) => onUpdate('height', parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right pr-1"
                />
              )}
              <span className="text-slate-500 text-[10px]">pt</span>
            </div>
          </div>

          {/* Checkboxes de 100% Width e 100% Height */}
          {['rectangle', 'container', 'loop', 'line', 'image', 'spacer', 'list', 'check_list'].includes(element.type) && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <label className="flex items-center justify-between bg-slate-950/50 border border-slate-800 rounded-lg px-2.5 py-1.5 cursor-pointer hover:border-slate-700 transition select-none">
                <span className="text-[11px] text-slate-300 font-medium">Width 100%</span>
                <input
                  type="checkbox"
                  checked={element.width === '100%'}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onUpdate({ width: '100%', x: 0 })
                    } else {
                      onUpdate({ width: 100 })
                    }
                  }}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900 cursor-pointer w-3.5 h-3.5"
                />
              </label>

              {element.type !== 'line' && (
                <label className="flex items-center justify-between bg-slate-950/50 border border-slate-800 rounded-lg px-2.5 py-1.5 cursor-pointer hover:border-slate-700 transition select-none">
                  <span className="text-[11px] text-slate-300 font-medium">Height 100%</span>
                  <input
                    type="checkbox"
                    checked={element.height === '100%'}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onUpdate({ height: '100%', y: 0, relativeOffsetY: 0 })
                      } else {
                        onUpdate({ height: element.type === 'container' || element.type === 'loop' ? 100 : 60 })
                      }
                    }}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900 cursor-pointer w-3.5 h-3.5"
                  />
                </label>
              )}
            </div>
          )}

          {/* Position Mode (Absolute / Relative) - Oculto para Container porque container é sempre relativo */}
          {element.type !== 'container' && (
            <div className="mt-2.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">{t.properties.position}</span>
                <span className="text-[10px] font-mono text-slate-500">
                  {(((element.positionMode || element.position || 'ABSOLUTE') as string).toUpperCase()) === 'RELATIVE' ? t.properties.relativeFlow : t.properties.absoluteFixed}
                </span>
              </div>
              <div className="grid grid-cols-2 bg-slate-950 border border-slate-800 rounded-lg p-0.5 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    onUpdate({
                      positionMode: 'ABSOLUTE',
                      position: 'absolute',
                    })
                  }}
                  className={`py-1 text-xs font-medium rounded transition text-center ${
                    (((element.positionMode || element.position || 'ABSOLUTE') as string).toUpperCase()) !== 'RELATIVE'
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
                    (((element.positionMode || element.position || 'ABSOLUTE') as string).toUpperCase()) === 'RELATIVE'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {t.properties.relative}
                </button>
              </div>

              {(((element.positionMode || element.position || 'ABSOLUTE') as string).toUpperCase()) === 'RELATIVE' && (
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
          )}
        </div>

    </>
  )
}
