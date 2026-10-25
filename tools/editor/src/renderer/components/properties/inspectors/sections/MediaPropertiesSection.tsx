import React, { useRef } from 'react'
import type { Element } from '../../../../store/templateStore'
import { Icon } from '../../../atoms'
import { useTranslation } from '../../../../i18n'

interface MediaPropertiesSectionProps {
  element: Element
  onUpdate: (field: string | Record<string, any>, value?: any) => void
  onStyleUpdate: (field: string | Record<string, any>, value?: any) => void
}

export function MediaPropertiesSection({ element, onUpdate, onStyleUpdate }: MediaPropertiesSectionProps) {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      if (result) {
        onUpdate({
          url: result,
          value: result,
          source: result,
        })
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleRemoveImage = () => {
    onUpdate({
      url: '',
      value: '',
      source: '',
    })
  }

  return (
    <>
        {/* Media Properties (Image / Barcode) */}
        {element.type === 'image' && (() => {
          const imageSrc = (element.url as string) || (element.source as string) || (element.value as string) || ''
          const isBase64 = imageSrc.startsWith('data:image')
          const base64SizeKB = isBase64 ? Math.round((imageSrc.length * 0.75) / 1024) : 0

          return (
            <div>
              <div className="text-xs font-semibold text-slate-200 mb-2">Imagem</div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif"
                className="hidden"
                onChange={handleImageFileSelect}
              />

              {imageSrc ? (
                <div className="space-y-2 mb-3">
                  <div className="relative group bg-slate-950/80 border border-slate-800 rounded-lg p-2 flex flex-col items-center justify-center">
                    <img
                      src={imageSrc}
                      alt="Preview"
                      className="max-h-24 max-w-full rounded object-contain border border-slate-800/60 bg-slate-900/60"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none'
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
                <div className="space-y-2 mb-3">
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
                    onChange={(e) => {
                      onUpdate({
                        url: e.target.value,
                        value: e.target.value,
                        source: e.target.value,
                      })
                    }}
                    placeholder="https://exemplo.com/imagem.png"
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Ajuste (Fit)</label>
                  <select
                    value={(element.fit as string) || 'contain'}
                    onChange={(e) => onUpdate('fit', e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="contain">Contain</option>
                    <option value="cover">Cover</option>
                    <option value="fill">Fill</option>
                    <option value="scale-down">Scale Down</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Alinhamento</label>
                  <select
                    value={(element.alignment as string) || 'center'}
                    onChange={(e) => onUpdate('alignment', e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="left">Esquerda</option>
                    <option value="center">Centro</option>
                    <option value="right">Direita</option>
                  </select>
                </div>
              </div>
            </div>
          )
        })()}

        {element.type === 'barcode' && (
          <div>
            <div className="text-xs font-semibold text-slate-200 mb-2">{t.properties.barcodeSettings}</div>
            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Formato</label>
                <select
                  value={(element.barcodeType as string) || 'qrcode'}
                  onChange={(e) => onUpdate('barcodeType', e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="qrcode">QR Code (2D)</option>
                  <option value="code128">Code 128 (1D)</option>
                  <option value="code39">Code 39 (1D)</option>
                  <option value="ean13">EAN-13 (13 dígitos)</option>
                  <option value="ean8">EAN-8 (8 dígitos)</option>
                  <option value="upc_a">UPC-A (12 dígitos)</option>
                  <option value="upc_e">UPC-E (8 dígitos)</option>
                  <option value="pdf417">PDF417 (2D)</option>
                  <option value="datamatrix">Data Matrix (2D)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Conteúdo ou Campo (Data Binding)</label>
                <input
                  type="text"
                  value={(element.value as string) ?? (element.dataBinding as string) ?? ''}
                  onChange={(e) => {
                    onUpdate({ value: e.target.value, dataBinding: e.target.value })
                  }}
                  placeholder={element.barcodeType === 'qrcode' ? 'https://... ou campo.json' : '123456789012 ou campo.json'}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              {((element.barcodeType as string) || 'qrcode') === 'qrcode' && (
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Correção de Erro (QR)</label>
                  <select
                    value={(element.style?.errorCorrection as string) || 'M'}
                    onChange={(e) => onStyleUpdate('errorCorrection', e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="L">Baixa (L - 7%)</option>
                    <option value="M">Média (M - 15%)</option>
                    <option value="Q">Quartil (Q - 25%)</option>
                    <option value="H">Alta (H - 30%)</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}


    </>
  )
}
