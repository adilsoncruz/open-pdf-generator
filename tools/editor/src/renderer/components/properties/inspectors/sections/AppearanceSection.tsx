import type { Element } from '../../../../store/templateStore'
import { useTranslation } from '../../../../i18n'

interface AppearanceSectionProps {
  element: Element
  onStyleUpdate: (field: string | Record<string, any>, value?: any) => void
}

export function AppearanceSection({ element, onStyleUpdate }: AppearanceSectionProps) {
  const { t } = useTranslation()
  const isTextElement = ['text', 'rich_text', 'link', 'static_text'].includes(element.type)
  const isShapeOrContainer = ['rectangle', 'circle', 'container', 'loop', 'list', 'check_list'].includes(element.type)
  const isTransparentByDefault = ['container', 'loop', 'list', 'check_list'].includes(element.type)
  const rawFillColor = String(
    isTextElement
      ? (element.style?.color || '#000000')
      : (element.style?.fillColor || element.style?.backgroundColor || (isTransparentByDefault ? 'transparent' : '#ffffff'))
  )
  const isFillTransparent = !isTextElement && (!rawFillColor || rawFillColor.toLowerCase() === 'transparent')
  const fillColor = isFillTransparent ? '#ffffff' : rawFillColor
  const strokeColor = String(element.style?.strokeColor || element.style?.borderColor || (element.type === 'container' || element.type === 'loop' ? '#8b5cf6' : '#374151'))
  const strokeWidth = (element.style?.strokeWidth ?? element.style?.borderWidth ?? (element.type === 'container' || element.type === 'loop' ? 2 : 0)) as number
  const borderStyle = (element.style?.borderStyle as string) || (element.type === 'container' || element.type === 'loop' ? 'dashed' : 'solid')

  return (
    <>
        {/* 4. Appearance Section (Não exibido para Page Break) */}
        {element.type !== 'page_break' && (
        <div>
          <div className="text-xs font-semibold text-slate-200 mb-2">
            {t.properties.appearance}
          </div>
          <div className="space-y-2.5">
            {/* Fill Color Swatch + Hex Input + Transparent toggle */}
            <div className="flex items-center gap-2">
              <div className="relative shrink-0">
                <input
                  type="color"
                  value={fillColor.startsWith('#') && fillColor.length === 7 ? fillColor : '#ffffff'}
                  onChange={(e) => {
                    if (isTextElement) {
                      onStyleUpdate('color', e.target.value)
                    } else {
                      onStyleUpdate({ fillColor: e.target.value, backgroundColor: e.target.value })
                    }
                  }}
                  className={`w-8 h-8 rounded-lg border border-slate-700 bg-slate-950 cursor-pointer p-0.5 shrink-0 ${
                    isFillTransparent ? 'opacity-30' : ''
                  }`}
                />
                {isFillTransparent && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-0.5 bg-rose-500 rotate-45 rounded" />
                  </div>
                )}
              </div>
              <div className="flex-1 flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500 min-w-0">
                {isFillTransparent ? (
                  <span className="text-slate-500 font-mono text-xs uppercase select-none truncate">
                    {t.properties.transparent}
                  </span>
                ) : (
                  <>
                    <span className="text-slate-500 text-xs font-mono">#</span>
                    <input
                      type="text"
                      value={fillColor.replace('#', '')}
                      onChange={(e) => {
                        const hex = `#${e.target.value.replace('#', '')}`
                        if (isTextElement) {
                          onStyleUpdate('color', hex)
                        } else {
                          onStyleUpdate({ fillColor: hex, backgroundColor: hex })
                        }
                      }}
                      className="w-full bg-transparent text-slate-200 font-mono text-xs uppercase focus:outline-none ml-1"
                    />
                  </>
                )}
              </div>
              {!isTextElement && (
                <label className="flex items-center gap-1 text-[11px] text-slate-400 cursor-pointer shrink-0 select-none">
                  <input
                    type="checkbox"
                    checked={isFillTransparent}
                    onChange={(e) => {
                      const nextColor = e.target.checked ? 'transparent' : '#ffffff'
                      onStyleUpdate({ fillColor: nextColor, backgroundColor: nextColor })
                    }}
                    className="rounded border-slate-700 text-indigo-600 bg-slate-900 cursor-pointer"
                  />
                  <span>{t.properties.transparent}</span>
                </label>
              )}
            </div>

            {/* Stroke row */}
            <div className="flex items-center justify-between text-xs gap-2">
              <span className="text-slate-400 w-14 shrink-0">{t.properties.stroke}</span>
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <input
                  type="color"
                  value={strokeColor.startsWith('#') && strokeColor.length === 7 ? strokeColor : '#ffffff'}
                  onChange={(e) => onStyleUpdate({ strokeColor: e.target.value, borderColor: e.target.value })}
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
                    onStyleUpdate({ strokeWidth: val, borderWidth: val })
                  }}
                  className="w-16 bg-slate-950/70 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500 text-center"
                />
              </div>
            </div>

            {/* Border row */}
            <div className="flex items-center justify-between text-xs gap-2">
              <span className="text-slate-400 w-14 shrink-0">{t.properties.border}</span>
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <input
                  type="color"
                  value={strokeColor.startsWith('#') && strokeColor.length === 7 ? strokeColor : '#374151'}
                  onChange={(e) => onStyleUpdate({ borderColor: e.target.value, strokeColor: e.target.value })}
                  className="w-7 h-7 rounded border border-slate-700 bg-slate-950 cursor-pointer p-0.5 shrink-0"
                />
                <select
                  value={borderStyle}
                  onChange={(e) => onStyleUpdate('borderStyle', e.target.value)}
                  className="flex-1 bg-slate-950/70 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="solid">{t.properties.solid}</option>
                  <option value="dashed">{t.properties.dashed}</option>
                  <option value="dotted">{t.properties.dotted}</option>
                  <option value="none">{t.properties.none}</option>
                </select>
              </div>
            </div>

            {/* Corner Radius for Containers / Shapes */}
            {isShapeOrContainer && (
              <div className="flex items-center justify-between text-xs gap-2">
                <span className="text-slate-400 w-14 shrink-0">{t.properties.radius}</span>
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={(element.style?.cornerRadius as number) || 0}
                    onChange={(e) => onStyleUpdate('cornerRadius', parseFloat(e.target.value) || 0)}
                    className="w-20 bg-slate-950/70 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500 text-center"
                  />
                  <span className="text-slate-500 text-[10px]">px</span>
                </div>
              </div>
            )}
          </div>
        </div>
        )}
    </>
  )
}
