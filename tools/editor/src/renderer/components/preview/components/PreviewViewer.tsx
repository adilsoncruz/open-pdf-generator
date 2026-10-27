import React, { useState, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { IconButton } from '../../molecules'
import type { PreviewViewerProps } from '../types'

// Configure PDF.js worker using local file from node_modules
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker

export const PreviewViewer: React.FC<PreviewViewerProps> = ({
  pdfData,
  scale,
  currentPage,
  onDocumentLoadSuccess,
  onScaleChange,
  onZoomIn,
  onZoomOut,
  onFitWidth,
}) => {
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const contentRef = useRef<HTMLDivElement>(null)

  // Pan / Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && contentRef.current) {
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY })
      e.preventDefault()
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && contentRef.current) {
      const deltaX = e.clientX - panStart.x
      const deltaY = e.clientY - panStart.y

      contentRef.current.scrollLeft -= deltaX
      contentRef.current.scrollTop -= deltaY

      setPanStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  const handleMouseLeave = () => {
    setIsPanning(false)
  }

  const currentPercent = Math.round(scale * 100)
  const baseOptions = [40, 60, 80, 100, 120, 150, 200]
  const allOptions = Array.from(new Set([...baseOptions, currentPercent])).sort((a, b) => a - b)

  return (
    <div
      ref={contentRef}
      className={`flex-1 overflow-auto p-4 bg-gray-600 dark:bg-gray-900 relative ${
        isPanning ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <div className="inline-block min-w-full min-h-full">
        <div className="flex justify-center items-start min-w-max">
          <Document
            file={`data:application/pdf;base64,${pdfData}`}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center p-8">
                <ArrowPathIcon className="w-6 h-6 text-white animate-spin" />
              </div>
            }
            error={
              <div className="flex items-center justify-center p-8 text-red-400">
                Error loading PDF
              </div>
            }
            className="shadow-2xl"
          >
            <Page
              pageNumber={currentPage}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={true}
              className="bg-white"
            />
          </Document>
        </div>
      </div>

      {/* Floating Bottom Zoom Controls Bar */}
      {onScaleChange && onZoomIn && onZoomOut && onFitWidth && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-slate-900/95 backdrop-blur-md rounded-lg shadow-xl border border-slate-800 px-2 py-1 flex items-center gap-1 text-slate-200">
          <IconButton
            icon="zoom-out"
            onClick={onZoomOut}
            disabled={scale <= 0.4}
            tooltip="Diminuir Zoom"
            size="sm"
            className="text-slate-400 hover:text-white"
          />

          <div className="relative flex items-center">
            <select
              value={currentPercent.toString()}
              onChange={(e) => onScaleChange(Number(e.target.value) / 100)}
              className="w-[72px] bg-slate-950 border border-slate-700/80 hover:border-slate-600 rounded-md text-[11px] font-mono font-medium text-slate-200 py-0.5 pl-2 pr-4 text-left cursor-pointer appearance-none focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            >
              {allOptions.map((opt) => (
                <option key={opt} value={opt.toString()} className="bg-slate-900 text-slate-200">
                  {opt}%
                </option>
              ))}
            </select>
            <div className="absolute right-1.5 pointer-events-none text-slate-400">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <IconButton
            icon="zoom-in"
            onClick={onZoomIn}
            disabled={scale >= 2}
            tooltip="Aumentar Zoom"
            size="sm"
            className="text-slate-400 hover:text-white"
          />

          <div className="w-px h-3.5 bg-slate-800 mx-0.5" />

          <button
            onClick={onFitWidth}
            className="px-1.5 py-0.5 text-[11px] font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded transition"
            title="Ajustar à largura"
          >
            Fit
          </button>

          <button
            onClick={() => onScaleChange(1)}
            className="px-1.5 py-0.5 text-[11px] font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded transition"
            title="Resetar 100%"
          >
            100%
          </button>
        </div>
      )}
    </div>
  )
}
