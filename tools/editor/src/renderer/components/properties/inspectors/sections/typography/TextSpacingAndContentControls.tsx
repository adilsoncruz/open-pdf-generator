import type { Element } from '../../../../../store/templateStore'
import { useTranslation } from '../../../../../i18n'

export interface TextSpacingAndContentControlsProps {
  element: Element
  onUpdate: (field: string | Record<string, any>, value?: any) => void
  onStyleUpdate: (field: string | Record<string, any>, value?: any) => void
}

export function TextSpacingAndContentControls({
  element,
  onUpdate,
  onStyleUpdate,
}: TextSpacingAndContentControlsProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-2">
      {/* Line Wrap (Multiline) & Flow Settings */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-300 font-medium">{t.properties.lineWrap}</span>
          <input
            type="checkbox"
            checked={element.style?.multiline === true}
            onChange={(e) => onStyleUpdate('multiline', e.target.checked)}
            data-testid="multiline-checkbox"
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
                  data-testid="first-line-indent-input"
                  className="bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[10px]">{t.properties.overflow}</span>
              <select
                value={(element.style?.overflow as string) || 'visible'}
                onChange={(e) => onStyleUpdate('overflow', e.target.value)}
                data-testid="overflow-select"
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
              data-testid="padding-top-input"
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
              data-testid="padding-right-input"
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
              data-testid="padding-bottom-input"
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
              data-testid="padding-left-input"
              className="bg-transparent text-slate-200 font-mono text-xs focus:outline-none text-right"
            />
          </div>
        </div>
      </div>

      {/* Text Value */}
      {element.type !== 'text' && (
        <div>
          <label className="text-[10px] text-slate-400 block mb-1">{t.properties.textContent}</label>
          <textarea
            value={(element.value as string) || ''}
            onChange={(e) => onUpdate('value', e.target.value)}
            rows={2}
            data-testid="text-content-textarea"
            className="w-full bg-slate-950/70 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans resize-none"
            placeholder={t.properties.textPlaceholder}
          />
        </div>
      )}

      {/* URL for Link */}
      {element.type === 'link' && (
        <div>
          <label className="text-[10px] text-slate-400 block mb-1">{t.properties.targetUrl}</label>
          <input
            type="text"
            value={(element.url as string) || ''}
            onChange={(e) => onUpdate('url', e.target.value)}
            placeholder="https://..."
            data-testid="target-url-input"
            className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
      )}
    </div>
  )
}

export default TextSpacingAndContentControls
