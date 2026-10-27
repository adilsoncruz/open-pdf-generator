import { useTemplateStore } from '../../../../store/templateStore'

export function WatermarkTextControls() {
  const store = useTemplateStore()
  const watermark = store.template.pageSettings.watermark

  if (!watermark) return null

  return (
    <div className="space-y-3">
      <div>
        <span className="text-[10px] text-slate-500 block mb-1">Texto Estático:</span>
        <input
          type="text"
          value={watermark.text || ''}
          onChange={(e) => store.updateWatermark({ text: e.target.value })}
          placeholder="Ex: CONFIDENTIAL, DRAFT"
          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-medium"
        />
      </div>

      <div>
        <span className="text-[10px] text-slate-500 block mb-1">Data Binding (opcional):</span>
        <input
          type="text"
          value={watermark.dataBinding || ''}
          onChange={(e) => store.updateWatermark({ dataBinding: e.target.value })}
          placeholder="Ex: status, watermarkText"
          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-mono"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-[10px] text-slate-500 block mb-1">Tamanho da Fonte:</span>
          <input
            type="number"
            min={10}
            max={200}
            value={watermark.fontSize || 60}
            onChange={(e) => store.updateWatermark({ fontSize: Number(e.target.value) || 60 })}
            className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 text-xs font-mono"
          />
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block mb-1">Estilo:</span>
          <select
            value={watermark.fontStyle || 'bold'}
            onChange={(e) => store.updateWatermark({ fontStyle: e.target.value })}
            className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 text-xs font-medium"
          >
            <option value="normal">Normal</option>
            <option value="bold">Negrito</option>
            <option value="italic">Itálico</option>
          </select>
        </div>
      </div>

      <div>
        <span className="text-[10px] text-slate-500 block mb-1">Cor:</span>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={watermark.color || '#94a3b8'}
            onChange={(e) => store.updateWatermark({ color: e.target.value })}
            className="w-7 h-7 rounded border border-slate-800 bg-transparent cursor-pointer"
          />
          <input
            type="text"
            value={watermark.color || '#94a3b8'}
            onChange={(e) => store.updateWatermark({ color: e.target.value })}
            className="flex-1 px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 text-xs font-mono"
          />
        </div>
      </div>
    </div>
  )
}
