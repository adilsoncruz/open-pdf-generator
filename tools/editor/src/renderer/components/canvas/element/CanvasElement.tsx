import React from 'react'
import { useTemplateStore } from '../../../store/templateStore'
import type { CanvasElementProps } from '../types'
import { CanvasElementContent } from './CanvasElementContent'
import { CanvasElementBoundingBox } from './CanvasElementBoundingBox'
import { useCanvasElementInteraction } from './useCanvasElementInteraction'

export function CanvasElement(props: CanvasElementProps) {
  const { element, effectiveY, effectiveX, effectiveWidth } = props
  const template = useTemplateStore((state) => state.template)
  const testData = useTemplateStore((state) => state.testData)

  const {
    elementWrapperRef,
    isDragging,
    isResizing,
    isEditingText,
    editingValue,
    setEditingValue,
    handleMouseDown,
    handleResizeMouseDown,
    handleDoubleClick,
    handleTextEditBlur,
    handleTextEditKeyDown,
    handleContextMenu,
    dims,
    elementGroup,
    isWidthFull,
    isHeightFull,
  } = useCanvasElementInteraction(props)

  return (
    <div
      className="absolute"
      style={{
        left: element.width === '100%' ? 0 : (effectiveX !== undefined ? effectiveX : element.x),
        top: element.height === '100%' ? 0 : (effectiveY !== undefined ? effectiveY : element.y),
        ...(element.width === '100%'
          ? { width: '100%' }
          : effectiveWidth !== undefined && element.width === undefined
          ? { width: effectiveWidth }
          : {}),
      }}
      onContextMenu={handleContextMenu}
    >
      <div ref={elementWrapperRef} className="relative">
        <CanvasElementContent
          element={element}
          effectiveWidth={effectiveWidth}
          effectiveX={effectiveX}
          effectiveY={effectiveY}
          scale={props.scale}
          isSelected={props.isSelected}
          isEditingText={isEditingText}
          editingValue={editingValue}
          location={props.location}
          horizontalGuides={props.horizontalGuides}
          verticalGuides={props.verticalGuides}
          containerOffsetX={props.containerOffsetX}
          containerOffsetY={props.containerOffsetY}
          pageSize={props.pageSize}
          margins={props.margins}
          template={template}
          testData={testData}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
          onTextChange={setEditingValue}
          onTextBlur={handleTextEditBlur}
          onTextKeyDown={handleTextEditKeyDown}
          onSnapGuide={props.onSnapGuide}
        />

        <CanvasElementBoundingBox
          isSelected={props.isSelected}
          isDragging={isDragging}
          isResizing={isResizing}
          width={dims.width}
          height={dims.height}
          isWidthFull={isWidthFull}
          isHeightFull={isHeightFull}
          elementGroup={elementGroup}
          onResizeMouseDown={handleResizeMouseDown}
        />
      </div>
    </div>
  )
}

export default CanvasElement
