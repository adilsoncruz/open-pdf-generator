import { useTemplateStore } from '../../../../store/templateStore'

export function WatermarkTypeSelector() {
  const store = useTemplateStore()
  const watermark = store.template.pageSettings.watermark

  if (!watermark) return null

  const currentType = watermark.type || 'text'

  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-slate-400">Tipo de Marca:</span>
      <div className="flex bg-slate-950 border border-slate-800 rounded p-0.5">
        <button
          type="button"
          onClick={() => store.updateWatermark({ type: 'text' })}
          className={`px-2 py-1 text-[10px] font-medium rounded ${
            currentType === 'text'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Texto
        </button>
        <button
          type="button"
          onClick={() => store.updateWatermark({ type: 'image' })}
          className={`px-2 py-1 text-[10px] font-medium rounded ${
            currentType === 'image'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Imagem
        </button>
      </div>
    </div>
  )
}
