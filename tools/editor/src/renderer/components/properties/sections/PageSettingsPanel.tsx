import React, { useRef } from 'react'
import { useTemplateStore } from '../../../store/templateStore'
import { Icon } from '../../atoms'
import { useTranslation } from '../../../i18n'

export function PageSettingsPanel() {
  const { t } = useTranslation()
  const store = useTemplateStore()
  const template = store.template
  const watermarkFileInputRef = useRef<HTMLInputElement>(null)

  const handleWatermarkImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleRemoveWatermarkImage = () => {
    store.updateWatermark({ imageSource: '' })
  }

  return (
    <div className="w-[300px] bg-slate-900 border-l border-slate-800 flex flex-col h-full shrink-0 select-none">
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          <h2 className="text-sm font-semibold text-slate-200">{t.sidebar.pageSettings}</h2>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
          {template.pageSettings.size || 'A4'}
        </span>
      </div>
      <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs text-slate-400">
        <div>
          <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">{t.sidebar.paperSize}</label>
          <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 font-medium">
            {template.pageSettings.size} ({template.pageSettings.orientation || 'portrait'})
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">{t.sidebar.margins}</label>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-950 border border-slate-800 p-2 rounded">
              <span className="text-slate-500 block text-[10px]">{t.sidebar.top}:</span>
              <span className="font-mono text-slate-200">{template.pageSettings.margins.top} pt</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-2 rounded">
              <span className="text-slate-500 block text-[10px]">{t.sidebar.bottom}:</span>
              <span className="font-mono text-slate-200">{template.pageSettings.margins.bottom} pt</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-2 rounded">
              <span className="text-slate-500 block text-[10px]">{t.sidebar.left}:</span>
              <span className="font-mono text-slate-200">{template.pageSettings.margins.left} pt</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-2 rounded">
              <span className="text-slate-500 block text-[10px]">{t.sidebar.right}:</span>
              <span className="font-mono text-slate-200">{template.pageSettings.margins.right} pt</span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800/80">
          <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">{t.sidebar.activeSections}</label>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between items-center px-2 py-1.5 rounded bg-slate-950/60 border border-slate-800/60">
              <span className="text-slate-300">{t.sidebar.header}</span>
              <span className={template.pageSettings.header ? "text-indigo-400 font-medium" : "text-slate-600"}>
                {template.pageSettings.header ? `${template.pageSettings.header.height} pt` : t.sidebar.inactive}
              </span>
            </div>
            <div className="flex justify-between items-center px-2 py-1.5 rounded bg-slate-950/60 border border-slate-800/60">
              <span className="text-slate-300">{t.sidebar.footer}</span>
              <span className={template.pageSettings.footer ? "text-indigo-400 font-medium" : "text-slate-600"}>
                {template.pageSettings.footer ? `${template.pageSettings.footer.height} pt` : t.sidebar.inactive}
              </span>
            </div>
            <div className="flex justify-between items-center px-2 py-1.5 rounded bg-slate-950/60 border border-slate-800/60">
              <span className="text-slate-300">{t.sidebar.summary}</span>
              <span className={template.summaryPage ? "text-emerald-400 font-medium" : "text-slate-600"}>
                {template.summaryPage ? t.sidebar.active : t.sidebar.inactive}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block">Marca d'Água (Watermark)</label>
              <span className="text-[10px] text-slate-500">Exibida em todas as páginas</span>
            </div>
            <input
              type="checkbox"
              checked={!!template.pageSettings.watermark}
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

          {template.pageSettings.watermark && (
            <div className="space-y-3 pt-2 border-t border-slate-800/60">
              {/* Seletor Tipo: Texto vs Imagem */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Tipo de Marca:</span>
                <div className="flex bg-slate-950 border border-slate-800 rounded p-0.5">
                  <button
                    type="button"
                    onClick={() => store.updateWatermark({ type: 'text' })}
                    className={`px-2 py-1 text-[10px] font-medium rounded ${
                      (template.pageSettings.watermark.type || 'text') === 'text'
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
                      template.pageSettings.watermark.type === 'image'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Imagem
                  </button>
                </div>
              </div>

              {/* Campos para Texto */}
              {(template.pageSettings.watermark.type || 'text') === 'text' && (
                <>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-1">Texto Estático:</span>
                    <input
                      type="text"
                      value={template.pageSettings.watermark.text || ''}
                      onChange={(e) => store.updateWatermark({ text: e.target.value })}
                      placeholder="Ex: CONFIDENTIAL, DRAFT"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-1">Data Binding (opcional):</span>
                    <input
                      type="text"
                      value={template.pageSettings.watermark.dataBinding || ''}
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
                        value={template.pageSettings.watermark.fontSize || 60}
                        onChange={(e) => store.updateWatermark({ fontSize: Number(e.target.value) || 60 })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-1">Estilo:</span>
                      <select
                        value={template.pageSettings.watermark.fontStyle || 'bold'}
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
                        value={template.pageSettings.watermark.color || '#94a3b8'}
                        onChange={(e) => store.updateWatermark({ color: e.target.value })}
                        className="w-7 h-7 rounded border border-slate-800 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={template.pageSettings.watermark.color || '#94a3b8'}
                        onChange={(e) => store.updateWatermark({ color: e.target.value })}
                        className="flex-1 px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 text-xs font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Campos para Imagem */}
              {template.pageSettings.watermark.type === 'image' && (() => {
                const imageSrc = template.pageSettings.watermark.imageSource || ''
                const isBase64 = imageSrc.startsWith('data:image')
                const base64SizeKB = isBase64 ? Math.round((imageSrc.length * 0.75) / 1024) : 0

                return (
                  <div className="space-y-3">
                    <input
                      ref={watermarkFileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif"
                      className="hidden"
                      onChange={handleWatermarkImageFileSelect}
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
                              onClick={handleRemoveWatermarkImage}
                              className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 transition cursor-pointer"
                            >
                              <Icon name="trash" size="xs" />
                              Remover
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => watermarkFileInputRef.current?.click()}
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
                          onClick={() => watermarkFileInputRef.current?.click()}
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
                          value={template.pageSettings.watermark.width || ''}
                          onChange={(e) => store.updateWatermark({ width: e.target.value ? Number(e.target.value) : undefined })}
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block mb-1">Altura (px):</span>
                        <input
                          type="number"
                          placeholder="Auto"
                          value={template.pageSettings.watermark.height || ''}
                          onChange={(e) => store.updateWatermark({ height: e.target.value ? Number(e.target.value) : undefined })}
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Controles Comuns: Rotação, Opacidade, OnTop, Condição */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-slate-500">Rotação:</span>
                  <span className="font-mono text-[10px] text-slate-300">{template.pageSettings.watermark.rotation ?? 45}°</span>
                </div>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  value={template.pageSettings.watermark.rotation ?? 45}
                  onChange={(e) => store.updateWatermark({ rotation: Number(e.target.value) })}
                  className="w-full accent-indigo-500 h-1 bg-slate-800 rounded"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-slate-500">Opacidade:</span>
                  <span className="font-mono text-[10px] text-slate-300">{Math.round((template.pageSettings.watermark.opacity ?? 0.2) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={template.pageSettings.watermark.opacity ?? 0.2}
                  onChange={(e) => store.updateWatermark({ opacity: Number(e.target.value) })}
                  className="w-full accent-indigo-500 h-1 bg-slate-800 rounded"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-300">Renderizar sobre o conteúdo</span>
                <input
                  type="checkbox"
                  checked={template.pageSettings.watermark.onTop || false}
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
                    checked={template.pageSettings.watermark.repeat || false}
                    onChange={(e) => store.updateWatermark({ repeat: e.target.checked })}
                    className="w-4 h-4 accent-indigo-600 rounded bg-slate-900 border-slate-700 cursor-pointer"
                  />
                </div>

                {template.pageSettings.watermark.repeat && (
                  <div className="space-y-2 pt-1 pl-1">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-slate-400">Espaçamento Horizontal:</span>
                        <span className="font-mono text-[10px] text-slate-300">
                          {template.pageSettings.watermark.spacingX ? `${template.pageSettings.watermark.spacingX} pt` : 'Automático'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={80}
                        max={400}
                        value={template.pageSettings.watermark.spacingX ?? 200}
                        onChange={(e) => store.updateWatermark({ spacingX: Number(e.target.value) })}
                        className="w-full accent-indigo-500 h-1 bg-slate-800 rounded"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-slate-400">Espaçamento Vertical:</span>
                        <span className="font-mono text-[10px] text-slate-300">
                          {template.pageSettings.watermark.spacingY ? `${template.pageSettings.watermark.spacingY} pt` : 'Automático'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={60}
                        max={350}
                        value={template.pageSettings.watermark.spacingY ?? 150}
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
                  value={template.pageSettings.watermark.printCondition || ''}
                  onChange={(e) => store.updateWatermark({ printCondition: e.target.value })}
                  placeholder="Ex: status == 'draft'"
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 text-xs font-mono"
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] leading-relaxed">
          {t.sidebar.useSidebar}
        </div>
      </div>
    </div>
  )
}
