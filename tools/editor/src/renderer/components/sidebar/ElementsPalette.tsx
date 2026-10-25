import React from 'react'
import { useTemplateStore, type ElementLocation } from '../../store/templateStore'

interface ElementsPaletteProps {
  currentSection: ElementLocation
}

export function ElementsPalette({ currentSection }: ElementsPaletteProps) {
  const { addElement } = useTemplateStore()

  return (
    <div className="p-2.5 space-y-2.5 border-b border-slate-800/80 shrink-0">
      {/* Categoria 1: Standard */}
      <div>
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-0.5">
          Standard
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {/* Text */}
          <button
            onClick={() =>
              addElement(
                {
                  type: 'text',
                  id: `text-${Date.now()}`,
                  value: 'Novo Texto',
                  x: 40,
                  y: 40,
                  width: 200,
                  height: 25,
                  style: { fontSize: 12, fontFamily: 'Helvetica', color: '#000000' },
                },
                currentSection
              )
            }
            className="h-14 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/60 transition flex flex-col items-center justify-center p-1 group"
            title="Texto Dinâmico / Expressão"
          >
            <svg
              className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 mb-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M4 7V4h16v3M9 20h6M12 4v16" />
            </svg>
            <span className="text-[9.5px] leading-tight text-slate-400 group-hover:text-slate-200">Text</span>
          </button>

          {/* Static Text */}
          <button
            onClick={() =>
              addElement(
                {
                  type: 'static_text',
                  id: `static_text-${Date.now()}`,
                  value: 'Texto Fixo',
                  x: 40,
                  y: 40,
                  width: 200,
                  height: 25,
                  style: { fontSize: 12, fontFamily: 'Helvetica', color: '#000000' },
                },
                currentSection
              )
            }
            className="h-14 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/60 transition flex flex-col items-center justify-center p-1 group"
            title="Texto Estático / Rótulo"
          >
            <svg
              className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 mb-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M4 6h16M4 10h16M4 14h12M4 18h8" strokeLinecap="round" />
            </svg>
            <span className="text-[9.5px] leading-tight text-slate-400 group-hover:text-slate-200">Static Text</span>
          </button>

          {/* Rich Text */}
          <button
            onClick={() =>
              addElement(
                {
                  type: 'rich_text',
                  id: `rich_text-${Date.now()}`,
                  value: '**Texto** em *Markdown*',
                  x: 40,
                  y: 40,
                  width: 200,
                  height: 30,
                  style: { fontSize: 12, fontFamily: 'Helvetica', color: '#000000' },
                },
                currentSection
              )
            }
            className="h-14 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/60 transition flex flex-col items-center justify-center p-1 group"
            title="Rich Text"
          >
            <svg
              className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 mb-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M4 6h16M4 12h10M4 18h14" />
            </svg>
            <span className="text-[9.5px] leading-tight text-slate-400 group-hover:text-slate-200">Rich Text</span>
          </button>

          {/* Hyperlink */}
          <button
            onClick={() =>
              addElement(
                {
                  type: 'link',
                  id: `link-${Date.now()}`,
                  value: 'Clique aqui',
                  url: 'https://exemplo.com',
                  x: 40,
                  y: 40,
                  width: 140,
                  height: 25,
                  style: { fontSize: 12, fontFamily: 'Helvetica', color: '#3b82f6' },
                },
                currentSection
              )
            }
            className="h-14 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/60 transition flex flex-col items-center justify-center p-1 group"
            title="Hyperlink"
          >
            <svg
              className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 mb-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span className="text-[9.5px] leading-tight text-slate-400 group-hover:text-slate-200">Hyperlink</span>
          </button>
        </div>
      </div>

      {/* Categoria 2: Layout */}
      <div>
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-0.5">
          Layout
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {/* Container */}
          <button
            onClick={() =>
              addElement(
                {
                  type: 'container',
                  id: `container-${Date.now()}`,
                  name: 'Container',
                  x: 0,
                  width: '100%',
                  height: 120,
                  elements: [],
                },
                currentSection
              )
            }
            className="h-14 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/60 transition flex flex-col items-center justify-center p-1 group"
            title="Container"
          >
            <svg
              className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 mb-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="3" y="3" width="18" height="18" rx="3" strokeDasharray="3 3" />
            </svg>
            <span className="text-[9.5px] leading-tight text-slate-400 group-hover:text-slate-200">Container</span>
          </button>

          {/* Loop */}
          <button
            onClick={() =>
              addElement(
                {
                  type: 'loop',
                  id: `loop-${Date.now()}`,
                  width: 400,
                  height: 120,
                  dataBinding: '',
                  itemSpacing: 10,
                  elements: [],
                  style: { borderColor: '#8b5cf6', borderWidth: 1, borderStyle: 'dashed' },
                },
                currentSection
              )
            }
            className="h-14 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/60 transition flex flex-col items-center justify-center p-1 group"
            title="Loop Repetidor de Dados"
          >
            <svg
              className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 mb-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
            <span className="text-[9.5px] leading-tight text-slate-400 group-hover:text-slate-200">Loop</span>
          </button>

          {/* Spacer */}
          <button
            onClick={() =>
              addElement(
                { type: 'spacer', id: `spacer-${Date.now()}`, x: 0, width: '100%', height: 40 },
                currentSection
              )
            }
            className="h-14 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/60 transition flex flex-col items-center justify-center p-1 group"
            title="Spacer"
          >
            <svg
              className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 mb-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M7 3h10M7 21h10M12 7v10M9 10l3-3 3 3M9 14l3 3 3-3" />
            </svg>
            <span className="text-[9.5px] leading-tight text-slate-400 group-hover:text-slate-200">Spacer</span>
          </button>

          {/* Page Break */}
          <button
            onClick={() =>
              addElement(
                { type: 'page_break', id: `page_break-${Date.now()}`, x: 0, width: '100%', height: 20 },
                currentSection
              )
            }
            className="h-14 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/60 transition flex flex-col items-center justify-center p-1 group"
            title="Page Break"
          >
            <svg
              className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 mb-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M4 12h16M14 3l4 4H14V3z" />
              <path d="M5 21h14a2 2 0 0 0 2-2V7l-5-5H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" />
            </svg>
            <span className="text-[9.5px] leading-tight text-slate-400 group-hover:text-slate-200">Page Break</span>
          </button>
        </div>
      </div>

      {/* Categoria 3: Media & Shapes */}
      <div>
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-0.5">
          Media & Shapes
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {/* Image */}
          <button
            onClick={() =>
              addElement(
                { type: 'image', id: `image-${Date.now()}`, width: 120, height: 80, source: '', fit: 'contain' },
                currentSection
              )
            }
            className="h-14 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/60 transition flex flex-col items-center justify-center p-1 group"
            title="Image"
          >
            <svg
              className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 mb-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span className="text-[9.5px] leading-tight text-slate-400 group-hover:text-slate-200">Image</span>
          </button>

          {/* Table */}
          <button
            onClick={() =>
              addElement(
                {
                  type: 'table',
                  id: `table-${Date.now()}`,
                  width: 400,
                  dataBinding: '',
                  columns: [{ header: 'Coluna 1', field: 'item', width: 200 }],
                  style: { headerBackground: '#f3f4f6', headerColor: '#000000', borderWidth: 1 },
                },
                currentSection
              )
            }
            className="h-14 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/60 transition flex flex-col items-center justify-center p-1 group"
            title="Table"
          >
            <svg
              className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 mb-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
            </svg>
            <span className="text-[9.5px] leading-tight text-slate-400 group-hover:text-slate-200">Table</span>
          </button>

          {/* Shape / Rectangle */}
          <button
            onClick={() =>
              addElement(
                {
                  type: 'rectangle',
                  id: `rect-${Date.now()}`,
                  x: 40,
                  y: 40,
                  width: 100,
                  height: 60,
                  style: { fillColor: '#e2e8f0', borderColor: '#94a3b8', borderWidth: 1 },
                },
                currentSection
              )
            }
            className="h-14 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/60 transition flex flex-col items-center justify-center p-1 group"
            title="Shape (Retângulo)"
          >
            <svg
              className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 mb-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
            <span className="text-[9.5px] leading-tight text-slate-400 group-hover:text-slate-200">Shape</span>
          </button>

          {/* Line */}
          <button
            onClick={() =>
              addElement(
                {
                  type: 'line',
                  id: `line-${Date.now()}`,
                  x: 40,
                  y: 40,
                  width: 200,
                  height: 0,
                  style: { strokeColor: '#000000', strokeWidth: 1 },
                },
                currentSection
              )
            }
            className="h-14 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/60 transition flex flex-col items-center justify-center p-1 group"
            title="Linha Divisória"
          >
            <svg
              className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 mb-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <span className="text-[9.5px] leading-tight text-slate-400 group-hover:text-slate-200">Line</span>
          </button>

          {/* Barcodes / QR */}
          <button
            onClick={() =>
              addElement(
                {
                  type: 'barcode',
                  id: `barcode-${Date.now()}`,
                  x: 40,
                  y: 40,
                  width: 100,
                  height: 100,
                  barcodeType: 'qrcode',
                  value: 'https://openpdf.dev',
                  dataBinding: 'https://openpdf.dev',
                  style: { errorCorrection: 'M' },
                },
                currentSection
              )
            }
            className="h-14 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/60 transition flex flex-col items-center justify-center p-1 group"
            title="Barcodes / QR"
          >
            <svg
              className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 mb-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="4" height="4" />
              <path d="M18 18h3v3h-3z" />
            </svg>
            <span className="text-[9.5px] leading-tight text-slate-400 group-hover:text-slate-200">QR Code</span>
          </button>

          {/* Barcode 1D */}
          <button
            onClick={() =>
              addElement(
                {
                  type: 'barcode',
                  id: `barcode-${Date.now()}`,
                  x: 40,
                  y: 40,
                  width: 140,
                  height: 50,
                  barcodeType: 'code128',
                  value: '123456789012',
                  dataBinding: '123456789012',
                  style: { errorCorrection: 'M' },
                },
                currentSection
              )
            }
            className="h-14 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/60 transition flex flex-col items-center justify-center p-1 group"
            title="Código de Barras 1D"
          >
            <svg
              className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 mb-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M4 5v14M7 5v14M10 5v14M13 5v14M16 5v14M19 5v14" />
            </svg>
            <span className="text-[9.5px] leading-tight text-slate-400 group-hover:text-slate-200">Barcode</span>
          </button>
        </div>
      </div>
    </div>
  )
}
