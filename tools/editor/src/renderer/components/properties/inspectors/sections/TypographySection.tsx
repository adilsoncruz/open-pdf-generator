import type { Element } from '../../../../store/templateStore'
import { useTranslation } from '../../../../i18n'

interface TypographySectionProps {
  element: Element
  onUpdate: (field: string | Record<string, any>, value?: any) => void
  onStyleUpdate: (field: string | Record<string, any>, value?: any) => void
}

export function TypographySection({ element, onUpdate, onStyleUpdate }: TypographySectionProps) {
  const { t } = useTranslation()
  const isTextElement = ['text', 'rich_text', 'link', 'static_text'].includes(element.type)

  return (
    <>
        {/* 3. Typography Section (for text elements) */}
        {isTextElement && (
          <div>
            <div className="text-xs font-semibold text-slate-200 mb-2">
              {t.properties.typography}
            </div>
            <div className="space-y-2">
              {/* Font Family */}
              <div className="relative">
                <select
                  value={(element.style?.fontFamily as string) || 'Helvetica'}
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
                    value={(element.style?.fontSize as number) || 12}
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
                        onStyleUpdate({ fontWeight: 'bold', fontStyle: 'normal' })
                      } else if (val === 'Italic') {
                        onStyleUpdate({ fontWeight: 'normal', fontStyle: 'italic' })
                      } else {
                        onStyleUpdate({ fontWeight: 'normal', fontStyle: 'normal' })
                      }
                    }}
                    className="w-full appearance-none bg-slate-950/70 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none pr-8 cursor-pointer"
                  >
                    <option value="Regular">{t.properties.regular}</option>
                    <option value="Bold">{t.properties.bold}</option>
                    <option value="Italic">{t.properties.italic}</option>
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
                  { align: 'left', title: t.properties.alignLeft, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h10M4 18h14" /> },
                  { align: 'center', title: t.properties.alignCenter, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M7 12h10M5 18h14" /> },
                  { align: 'right', title: t.properties.alignRight, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M10 12h10M6 18h14" /> },
                  { align: 'justify', title: t.properties.alignJustify, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /> },
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

              {/* Vertical Alignment & Text Decoration */}
              <div className="flex items-center gap-2">
                {/* Vertical Align */}
                <div className="flex flex-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5 gap-0.5">
                  {[
                    { val: 'top', title: t.properties.alignTop, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h16M7 8h10M9 12h6" /> },
                    { val: 'center', title: t.properties.alignMiddle, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12h16M7 7h10M7 17h10" /> },
                    { val: 'bottom', title: t.properties.alignBottom, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 20h16M7 16h10M9 12h6" /> },
                  ].map(({ val, title, icon }) => (
                    <button
                      key={val}
                      onClick={() => onStyleUpdate('verticalAlignment', val)}
                      className={`flex-1 py-1 flex items-center justify-center rounded text-xs transition ${
                        (element.style?.verticalAlignment || 'center') === val
                          ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                      title={title}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {icon}
                      </svg>
                    </button>
                  ))}
                </div>

                {/* Text Decoration (Underline, Line-through) */}
                <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5 gap-0.5">
                  <button
                    onClick={() => {
                      const cur = element.style?.textDecoration || 'none'
                      onStyleUpdate('textDecoration', cur === 'underline' ? 'none' : 'underline')
                    }}
                    className={`w-7 h-7 flex items-center justify-center rounded text-xs font-serif underline transition ${
                      element.style?.textDecoration === 'underline'
                        ? 'bg-slate-800 text-indigo-400 border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                    title={t.properties.underline}
                  >
                    U
                  </button>
                  <button
                    onClick={() => {
                      const cur = element.style?.textDecoration || 'none'
                      onStyleUpdate('textDecoration', cur === 'line-through' ? 'none' : 'line-through')
                    }}
                    className={`w-7 h-7 flex items-center justify-center rounded text-xs font-serif line-through transition ${
                      element.style?.textDecoration === 'line-through'
                        ? 'bg-slate-800 text-indigo-400 border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                    title={t.properties.strikethrough}
                  >
                    S
                  </button>
                </div>
              </div>

              {/* Line Wrap (Multiline) & Flow Settings */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-300 font-medium">{t.properties.lineWrap}</span>
                  <input
                    type="checkbox"
                    checked={element.style?.multiline === true}
                    onChange={(e) => onStyleUpdate('multiline', e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-500 focus:ring-0 cursor-pointer"
                  />
                </div>

                {Boolean(element.style?.multiline) && (
                  <div className="pt-2 border-t border-slate-800/60 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col bg-slate-950/80 border border-slate-800 rounded px-2 py-1 focus-within:border-indigo-500">
                        <span className="text-[9px] text-slate-500 font-mono">{t.properties.lineHeight}</span>
                        <input
                          type="number"
                          step="0.1"
                          min="0.5"
                          max="3"
                          value={(element.style?.lineHeight as number) ?? 1.2}
                          onChange={(e) => onStyleUpdate('lineHeight', parseFloat(e.target.value) || 1.2)}
                          className="bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right"
                        />
                      </div>
                      <div className="flex flex-col bg-slate-950/80 border border-slate-800 rounded px-2 py-1 focus-within:border-indigo-500">
                        <span className="text-[9px] text-slate-500 font-mono">{t.properties.firstLineIndent}</span>
                        <input
                          type="number"
                          min="0"
                          value={(element.style?.firstLineIndent as number) ?? 0}
                          onChange={(e) => onStyleUpdate('firstLineIndent', parseFloat(e.target.value) || 0)}
                          className="bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[10px]">{t.properties.overflow}</span>
                      <select
                        value={(element.style?.overflow as string) || 'visible'}
                        onChange={(e) => onStyleUpdate('overflow', e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="visible">{t.properties.overflowVisible}</option>
                        <option value="hidden">{t.properties.overflowHidden}</option>
                        <option value="auto">{t.properties.overflowAuto}</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Text Margins / Paddings (Top, Right, Bottom, Left) */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">{t.properties.internalMargins}</label>
                <div className="grid grid-cols-4 gap-1.5">
                  <div className="flex flex-col bg-slate-950/70 border border-slate-800 rounded-lg px-2 py-1 focus-within:border-indigo-500">
                    <span className="text-[9px] text-slate-500 font-mono">{t.properties.top}</span>
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
                    <span className="text-[9px] text-slate-500 font-mono">{t.properties.right}</span>
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
                    <span className="text-[9px] text-slate-500 font-mono">{t.properties.bottom}</span>
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
                    <span className="text-[9px] text-slate-500 font-mono">{t.properties.left}</span>
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
                <label className="text-[10px] text-slate-400 block mb-1">{t.properties.textContent}</label>
                <textarea
                  value={(element.value as string) || ''}
                  onChange={(e) => onUpdate('value', e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans resize-none"
                  placeholder={t.properties.textPlaceholder}
                />
              </div>

              {/* URL for Link */}
              {element.type === 'link' && (
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">{t.properties.targetUrl}</label>
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


    </>
  )
}
