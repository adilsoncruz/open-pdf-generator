import { useRef, type ChangeEvent } from 'react'
import { useTemplateStore } from '../../../../store/templateStore'
import { Icon } from '../../../atoms'

export function WatermarkImageControls() {
  const store = useTemplateStore()
  const watermark = store.template.pageSettings.watermark
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!watermark) return null

  const imageSrc = watermark.imageSource || ''
  const isBase64 = imageSrc.startsWith('data:image')
  const base64SizeKB = isBase64 ? Math.round((imageSrc.length * 0.75) / 1024) : 0

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      if (result) {
        store.updateWatermark({ imageSource: result })
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleRemoveImage = () => {
    store.updateWatermark({ imageSource: '' })
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif"
        className="hidden"
        onChange={handleFileSelect}
      />

      {imageSrc ? (
        <div className="space-y-2">
          <div className="relative group bg-slate-950/80 border border-slate-800 rounded-lg p-2 flex flex-col items-center justify-center">
            <img
              src={imageSrc}
              alt="Preview"
              className="max-h-24 max-w-full rounded object-contain border border-slate-800/60 bg-slate-900/60"
              onError={(e) => {
                ;(e.target as HTMLElement).style.display = 'none'
              }}
            />
            <div className="mt-2 flex items-center justify-between w-full px-1">
              {isBase64 ? (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Base64 (~{base64SizeKB} KB)
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                  Remoto / URL
                </span>
              )}
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 transition cursor-pointer"
              >
                <Icon name="trash" size="xs" />
                Remover
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
          >
            <Icon name="upload" size="xs" />
            Substituir por Imagem Local
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition cursor-pointer shadow-sm"
          >
            <Icon name="upload" size="xs" />
            Procurar Imagem Local
          </button>
          <p className="text-[10px] text-slate-500 text-center">
            PNG, JPG, SVG, WebP ou GIF (converte em Base64)
          </p>
        </div>
      )}

      <div className="space-y-1">
        <label className="text-[10px] text-slate-400 block">
          {isBase64 ? 'Origem dos Dados' : 'URL ou Caminho da Imagem'}
        </label>
        {isBase64 ? (
          <div className="flex items-center justify-between bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-400 font-mono">
            <span className="truncate pr-2">data:image/...;base64 (~{base64SizeKB} KB)</span>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(imageSrc)}
              title="Copiar Base64"
              className="text-slate-400 hover:text-indigo-400 shrink-0 cursor-pointer"
            >
              <Icon name="copy" size="xs" />
            </button>
          </div>
        ) : (
          <input
            type="text"
            value={imageSrc}
            onChange={(e) => store.updateWatermark({ imageSource: e.target.value })}
            placeholder="https://exemplo.com/logo.png"
            className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-[10px] text-slate-500 block mb-1">Largura (px):</span>
          <input
            type="number"
            placeholder="Auto"
            value={watermark.width || ''}
            onChange={(e) => store.updateWatermark({ width: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 text-xs font-mono"
          />
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block mb-1">Altura (px):</span>
          <input
            type="number"
            placeholder="Auto"
            value={watermark.height || ''}
            onChange={(e) => store.updateWatermark({ height: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 text-xs font-mono"
          />
        </div>
      </div>
    </div>
  )
}
