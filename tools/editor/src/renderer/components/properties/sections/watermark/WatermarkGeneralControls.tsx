import { useTemplateStore } from '../../../../store/templateStore'

export function WatermarkActivationToggle() {
  const store = useTemplateStore()
  const watermark = store.template.pageSettings.watermark

  return (
    <div className="flex items-center justify-between">
      <div>
        <label className="text-[11px] font-semibold text-slate-300 block">Marca d'Água (Watermark)</label>
        <span className="text-[10px] text-slate-500">Exibida em todas as páginas</span>
      </div>
      <input
        type="checkbox"
        checked={!!watermark}
        onChange={(e) => {
          if (e.target.checked) {
            store.updateWatermark({
              type: 'text',
              text: 'CONFIDENTIAL',
              fontSize: 60,
              opacity: 0.15,
              rotation: 45,
              color: '#94a3b8',
              onTop: false,
            })
          } else {
            store.removeWatermark()
          }
        }}
        className="w-4 h-4 accent-indigo-600 rounded bg-slate-900 border-slate-700 cursor-pointer"
      />
    </div>
  )
}

export interface WatermarkGeneralControlsProps {
  showActivation?: boolean
}

export function WatermarkGeneralControls({ showActivation = false }: WatermarkGeneralControlsProps = {}) {
  const store = useTemplateStore()
  const watermark = store.template.pageSettings.watermark

  if (!watermark && !showActivation) return null

  return (
    <div className="space-y-3">
      {showActivation && <WatermarkActivationToggle />}

      {watermark && (
        <>
          {/* Controles Comuns: Rotação, Opacidade, OnTop, Condição */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-slate-500">Rotação:</span>
              <span className="font-mono text-[10px] text-slate-300">{watermark.rotation ?? 45}°</span>
            </div>
            <input
              type="range"
              min={-180}
              max={180}
              value={watermark.rotation ?? 45}
              onChange={(e) => store.updateWatermark({ rotation: Number(e.target.value) })}
              className="w-full accent-indigo-500 h-1 bg-slate-800 rounded"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-slate-500">Opacidade:</span>
              <span className="font-mono text-[10px] text-slate-300">
                {Math.round((watermark.opacity ?? 0.2) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={watermark.opacity ?? 0.2}
              onChange={(e) => store.updateWatermark({ opacity: Number(e.target.value) })}
              className="w-full accent-indigo-500 h-1 bg-slate-800 rounded"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-300">Renderizar sobre o conteúdo</span>
            <input
              type="checkbox"
              checked={watermark.onTop || false}
              onChange={(e) => store.updateWatermark({ onTop: e.target.checked })}
              className="w-4 h-4 accent-indigo-600 rounded bg-slate-900 border-slate-700 cursor-pointer"
            />
          </div>

          {/* Repetição em mosaico / grade preenchendo a folha */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-slate-300 block">Repetir na página (Mosaico)</span>
                <span className="text-[10px] text-slate-500">Preenche toda a folha em grade alternada</span>
              </div>
              <input
                type="checkbox"
                checked={watermark.repeat || false}
                onChange={(e) => store.updateWatermark({ repeat: e.target.checked })}
                className="w-4 h-4 accent-indigo-600 rounded bg-slate-900 border-slate-700 cursor-pointer"
              />
            </div>

            {watermark.repeat && (
              <div className="space-y-2 pt-1 pl-1">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-slate-400">Espaçamento Horizontal:</span>
                    <span className="font-mono text-[10px] text-slate-300">
                      {watermark.spacingX ? `${watermark.spacingX} pt` : 'Automático'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={80}
                    max={400}
                    value={watermark.spacingX ?? 200}
                    onChange={(e) => store.updateWatermark({ spacingX: Number(e.target.value) })}
                    className="w-full accent-indigo-500 h-1 bg-slate-800 rounded"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-slate-400">Espaçamento Vertical:</span>
                    <span className="font-mono text-[10px] text-slate-300">
                      {watermark.spacingY ? `${watermark.spacingY} pt` : 'Automático'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={60}
                    max={350}
                    value={watermark.spacingY ?? 150}
                    onChange={(e) => store.updateWatermark({ spacingY: Number(e.target.value) })}
                    className="w-full accent-indigo-500 h-1 bg-slate-800 rounded"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <span className="text-[10px] text-slate-500 block mb-1">Condição de Impressão:</span>
            <input
              type="text"
              value={watermark.printCondition || ''}
              onChange={(e) => store.updateWatermark({ printCondition: e.target.value })}
              placeholder="Ex: status == 'draft'"
              className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 text-xs font-mono"
            />
          </div>
        </>
      )}
    </div>
  )
}
