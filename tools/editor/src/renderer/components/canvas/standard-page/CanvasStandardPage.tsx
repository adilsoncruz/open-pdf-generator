import { useTemplateStore, type ElementLocation, flattenElements } from '../../../store/templateStore'
import { CanvasWatermark } from '../CanvasWatermark'
import { CanvasMarginGuides } from '../CanvasMarginGuides'
import { CanvasSectionBadge } from './CanvasBandOverlay'
import { CanvasBackgroundSection } from './CanvasBackgroundSection'
import { CanvasHeaderSection } from './CanvasHeaderSection'
import { CanvasFooterSection } from './CanvasFooterSection'
import { CanvasBodySection } from './CanvasBodySection'
import { useBodyFlowLayout } from './useBodyFlowLayout'
import type { CanvasStandardPageProps } from './types'

export function CanvasStandardPage({
  pageSize,
  margins,
  totalCanvasHeight,
  scale,
  horizontalGuides,
  verticalGuides,
  onSnapGuide,
  marginSnap,
  numberOfPages,
  bodyUsableHeight,
  headerHeight,
  footerHeight,
  pageLabel,
  headerEndLabel,
  footerStartLabel,
}: CanvasStandardPageProps) {
  const {
    template,
    currentSection,
    setCurrentSection,
    selectedElementIds,
    selectedElementLocation,
    selectElement,
    toggleElementSelection,
    updateElement,
    clearSelection,
  } = useTemplateStore()

  const computedBodyElements = useBodyFlowLayout(template.page, bodyUsableHeight)

  const activateSection = (section: ElementLocation) => {
    setCurrentSection(section)
    clearSelection()
  }

  const handleElementSelect = (id: string, ctrlKey: boolean, location: ElementLocation) => {
    if (ctrlKey) {
      toggleElementSelection(id, location)
    } else {
      selectElement(id, location)
    }
  }

  const marginGuides = (
    <CanvasMarginGuides
      pageSize={pageSize}
      margins={margins}
      totalCanvasHeight={totalCanvasHeight}
      marginSnap={marginSnap}
      numberOfPages={numberOfPages}
      bodyUsableHeight={bodyUsableHeight}
      headerConfig={template.pageSettings.header}
      footerConfig={template.pageSettings.footer}
      pageLabel={pageLabel}
      headerEndLabel={headerEndLabel}
      footerStartLabel={footerStartLabel}
    />
  )

  if (currentSection === 'bodyBackground') {
    return (
      <CanvasBackgroundSection
        pageSize={pageSize}
        margins={margins}
        totalCanvasHeight={totalCanvasHeight}
        elements={template.pageSettings.bodyBackground?.elements ?? []}
        scale={scale}
        selectedElementIds={selectedElementIds}
        selectedElementLocation={selectedElementLocation}
        onSelect={(id, ctrl) => handleElementSelect(id, ctrl, 'bodyBackground')}
        onUpdate={(id, updates) => updateElement(id, updates, 'bodyBackground')}
        updateElement={updateElement}
        horizontalGuides={horizontalGuides}
        verticalGuides={verticalGuides}
        onSnapGuide={onSnapGuide}
        marginGuides={marginGuides}
      />
    )
  }

  const footerOffsetTop = totalCanvasHeight - margins.bottom - (template.pageSettings.footer?.height || 0)
  const bodyTopOffset = margins.top + (template.pageSettings.header?.height || 0)

  return (
    <>
      {currentSection === 'header' && (
        <CanvasSectionBadge section="header" top={margins.top + (template.pageSettings.header?.height || 0) / 2} />
      )}
      {currentSection === 'footer' && (
        <CanvasSectionBadge section="footer" top={footerOffsetTop + (template.pageSettings.footer?.height || 0) / 2} />
      )}
      {currentSection === 'body' && <CanvasSectionBadge section="body" top="50%" />}

      <div className="bg-white shadow-lg relative" style={{ width: pageSize.width, height: totalCanvasHeight }}>
        {template.pageSettings.header && (
          <CanvasHeaderSection
            headerConfig={template.pageSettings.header}
            isActive={currentSection === 'header'}
            scale={scale}
            margins={margins}
            pageSize={pageSize}
            selectedElementIds={selectedElementIds}
            selectedElementLocation={selectedElementLocation}
            allElements={flattenElements(template.pageSettings.header.elements ?? [])}
            horizontalGuides={horizontalGuides}
            verticalGuides={verticalGuides}
            onSnapGuide={onSnapGuide}
            onActivate={() => activateSection('header')}
            onSelect={(id, ctrl) => handleElementSelect(id, ctrl, 'header')}
            onUpdate={(id, updates) => updateElement(id, updates, 'header')}
            updateElement={updateElement}
          />
        )}

        <CanvasBodySection
          computedElements={computedBodyElements}
          isActive={currentSection === 'body'}
          scale={scale}
          margins={margins}
          pageSize={pageSize}
          selectedElementIds={selectedElementIds}
          selectedElementLocation={selectedElementLocation}
          allElements={flattenElements(template.page)}
          horizontalGuides={horizontalGuides}
          verticalGuides={verticalGuides}
          topOffset={bodyTopOffset}
          height={numberOfPages * bodyUsableHeight}
          onSnapGuide={onSnapGuide}
          onActivate={() => activateSection('body')}
          onSelect={(id, ctrl) => handleElementSelect(id, ctrl, 'body')}
          onUpdate={(id, updates) => updateElement(id, updates, 'body')}
          updateElement={updateElement}
        />

        {template.pageSettings.footer && (
          <CanvasFooterSection
            footerConfig={template.pageSettings.footer}
            isActive={currentSection === 'footer'}
            scale={scale}
            margins={margins}
            pageSize={pageSize}
            selectedElementIds={selectedElementIds}
            selectedElementLocation={selectedElementLocation}
            allElements={flattenElements(template.pageSettings.footer.elements ?? [])}
            horizontalGuides={horizontalGuides}
            verticalGuides={verticalGuides}
            offsetY={footerOffsetTop}
            onSnapGuide={onSnapGuide}
            onActivate={() => activateSection('footer')}
            onSelect={(id, ctrl) => handleElementSelect(id, ctrl, 'footer')}
            onUpdate={(id, updates) => updateElement(id, updates, 'footer')}
            updateElement={updateElement}
          />
        )}

        {template.pageSettings.watermark && (
          <CanvasWatermark
            watermark={template.pageSettings.watermark}
            pageSize={pageSize}
            totalCanvasHeight={totalCanvasHeight}
            numberOfPages={numberOfPages}
            bodyUsableHeight={bodyUsableHeight}
          />
        )}

        {marginGuides}
      </div>
    </>
  )
}
