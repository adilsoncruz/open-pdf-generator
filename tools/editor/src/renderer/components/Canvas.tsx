import React, { useRef } from 'react'
import { useTemplateStore } from '../store/templateStore'
import { useUIStore } from '../store/uiStore'
import { useTranslation } from '../i18n'
import { CanvasRulers } from './canvas/CanvasRulers'
import { CanvasGuidelines } from './canvas/CanvasGuidelines'
import { CanvasStandardPage } from './canvas/CanvasStandardPage'
import { CanvasSummaryPage } from './canvas/CanvasSummaryPage'
import { useCanvasZoom } from './canvas/useCanvasZoom'
import { useCanvasGuides } from './canvas/useCanvasGuides'
import { checkMarginSnap } from './canvas/snapping'

export default function Canvas() {
  const { t } = useTranslation()
  const {
    template,
    currentSection,
  } = useTemplateStore()

  const snapToGuides = useUIStore((state) => state.snapToGuides)
  const pageRef = useRef<HTMLDivElement>(null)

  const { zoom } = useCanvasZoom()
  const scale = zoom / 100

  // Page dimensions calculation
  const getPageDimensions = () => {
    const isLandscape = template.pageSettings.orientation === 'landscape'

    let width = 595
    let height = 842

    switch (template.pageSettings.size) {
      case 'A4':
        width = 595
        height = 842
        break
      case 'LETTER':
        width = 612
        height = 792
        break
      case 'LEGAL':
        width = 612
        height = 1008
        break
      case 'CUSTOM':
        width = template.pageSettings.customWidth || 595
        height = template.pageSettings.customHeight || 842
        break
      default:
        width = 595
        height = 842
    }

    if (isLandscape && template.pageSettings.size !== 'CUSTOM') {
      return { width: height, height: width }
    }

    return { width, height }
  }

  const pageSize = getPageDimensions()

  const margins = {
    top: template.pageSettings.margins.top,
    right: template.pageSettings.margins.right,
    bottom: template.pageSettings.margins.bottom,
    left: template.pageSettings.margins.left,
  }

  const {
    horizontalGuides,
    verticalGuides,
    snappedGuides,
    setSnappedGuides,
    draggingGuide,
    setDraggingGuide,
    removeGuide,
    handleRulerMouseDownH,
    handleRulerMouseDownV,
  } = useCanvasGuides({
    pageRef,
    pageSize,
    scale,
    snapToGuides,
    margins,
  })

  const headerHeight = template.pageSettings.header?.height || 0
  const footerHeight = template.pageSettings.footer?.height || 0
  const bodyUsableHeight =
    pageSize.height - (margins.top || 0) - (margins.bottom || 0) - headerHeight - footerHeight

  let maxBodyBottom = 0
  let pageBreakCount = 0
  template.page.forEach((el) => {
    const h =
      typeof el.height === 'number'
        ? el.height
        : el.type === 'page_break'
        ? 20
        : el.type === 'spacer'
        ? 50
        : 150
    const bottom = (el.y || 0) + h
    if (bottom > maxBodyBottom) maxBodyBottom = bottom
    if (el.type === 'page_break' || (el.type === 'container' && el.pageBreakBefore)) pageBreakCount++
  })

  const minPagesFromBreaks = pageBreakCount > 0 ? pageBreakCount + 1 : 1
  const numberOfPages = Math.max(minPagesFromBreaks, Math.ceil(maxBodyBottom / (bodyUsableHeight || 1)))
  const totalCanvasHeight = pageSize.height + (numberOfPages - 1) * bodyUsableHeight

  const marginSnap = checkMarginSnap(template.page, pageSize, margins, bodyUsableHeight)

  return (
    <div
      className={`flex-1 flex flex-col h-full overflow-hidden select-none bg-slate-950 ${
        draggingGuide
          ? draggingGuide.type === 'h'
            ? 'cursor-ns-resize'
            : 'cursor-ew-resize'
          : ''
      }`}
    >
      <CanvasRulers
        onRulerMouseDownH={handleRulerMouseDownH}
        onRulerMouseDownV={handleRulerMouseDownV}
        dragHorizontalGuideTooltip={t.canvas.dragHorizontalGuide}
        dragVerticalGuideTooltip={t.canvas.dragVerticalGuide}
      >
        {/* Scrollable content area */}
        <div
          id="canvas-scroll-container"
          className="flex-1 overflow-auto p-8 bg-slate-950/80"
          onContextMenu={(e) => {
            e.preventDefault()
            useUIStore.getState().openContextMenu({
              x: e.clientX,
              y: e.clientY,
              targetType: 'canvas',
              location: currentSection,
            })
          }}
        >
          <div className="inline-block min-w-full min-h-full">
            {/* Wrapper que define o tamanho real para scroll funcionar com zoom */}
            <div
              className="flex justify-center items-start min-w-max"
              style={{
                minWidth: pageSize.width * scale + 240,
                minHeight: pageSize.height * scale + 50,
              }}
            >
              <div
                ref={pageRef}
                className="relative"
                style={{
                  width: pageSize.width,
                  height: pageSize.height,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top center',
                }}
              >
                {currentSection === 'summary' && template.summaryPage ? (
                  <CanvasSummaryPage
                    pageSize={pageSize}
                    margins={margins}
                    totalCanvasHeight={totalCanvasHeight}
                    scale={scale}
                    horizontalGuides={horizontalGuides}
                    verticalGuides={verticalGuides}
                    onSnapGuide={setSnappedGuides}
                    marginSnap={marginSnap}
                    numberOfPages={numberOfPages}
                    bodyUsableHeight={bodyUsableHeight}
                  />
                ) : (
                  <CanvasStandardPage
                    pageSize={pageSize}
                    margins={margins}
                    totalCanvasHeight={totalCanvasHeight}
                    scale={scale}
                    horizontalGuides={horizontalGuides}
                    verticalGuides={verticalGuides}
                    onSnapGuide={setSnappedGuides}
                    marginSnap={marginSnap}
                    numberOfPages={numberOfPages}
                    bodyUsableHeight={bodyUsableHeight}
                    headerHeight={headerHeight}
                    footerHeight={footerHeight}
                    pageLabel={t.canvas.page}
                    headerEndLabel={t.canvas.headerEnd}
                    footerStartLabel={t.canvas.footerStart}
                  />
                )}

                {/* Linhas Guias Interativas com Tooltips e Magnetismo */}
                <CanvasGuidelines
                  pageSize={pageSize}
                  horizontalGuides={horizontalGuides}
                  verticalGuides={verticalGuides}
                  snappedGuides={snappedGuides}
                  draggingGuide={draggingGuide}
                  onGuideMouseDown={(type, index, e) => {
                    e.stopPropagation()
                    setDraggingGuide({ type, index })
                  }}
                  onGuideDoubleClick={(type, index, e) => {
                    e.stopPropagation()
                    removeGuide(type, index)
                  }}
                  tooltip={t.canvas.guideTooltip}
                />
              </div>
            </div>
          </div>
        </div>
      </CanvasRulers>
    </div>
  )
}
