import { useState, useCallback, type DragEvent, type RefObject } from 'react'
import { useTemplateStore, type ElementLocation, type Element } from '../../../store/templateStore'

export interface UseCanvasPageDropOptions {
  section: ElementLocation
  scale?: number
  containerRef?: RefObject<HTMLElement | null>
  onDropElement?: (element: Element, location: ElementLocation) => void
}

export interface UseCanvasPageDropResult {
  isDragOver: boolean
  handleDragOver: (e: DragEvent) => void
  handleDragEnter: (e: DragEvent) => void
  handleDragLeave: (e: DragEvent) => void
  handleDrop: (e: DragEvent) => void
  calculateDropCoords: (
    clientX: number,
    clientY: number,
    containerRect: DOMRect
  ) => { x: number; y: number }
}

export function useCanvasPageDrop({
  section,
  scale = 1,
  containerRef,
  onDropElement,
}: UseCanvasPageDropOptions): UseCanvasPageDropResult {
  const [isDragOver, setIsDragOver] = useState(false)
  const addElement = useTemplateStore((state) => state.addElement)

  const calculateDropCoords = useCallback(
    (clientX: number, clientY: number, containerRect: DOMRect) => {
      const currentScale = scale > 0 ? scale : 1
      const rawX = (clientX - containerRect.left) / currentScale
      const rawY = (clientY - containerRect.top) / currentScale
      return {
        x: Math.round(Math.max(0, rawX)),
        y: Math.round(Math.max(0, rawY)),
      }
    },
    [scale]
  )

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setIsDragOver(true)
  }, [])

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return
    }
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const elementData =
        e.dataTransfer.getData('application/json') ||
        e.dataTransfer.getData('text/plain')

      if (!elementData) return

      try {
        const parsed = JSON.parse(elementData)
        if (!parsed || typeof parsed !== 'object' || !parsed.type) return

        const rect =
          containerRef?.current?.getBoundingClientRect() ||
          (e.currentTarget as HTMLElement).getBoundingClientRect()
        const coords = calculateDropCoords(e.clientX, e.clientY, rect)

        const newElement: Element = {
          ...parsed,
          id: parsed.id || `${parsed.type}-${Date.now()}`,
          x: coords.x,
          y: coords.y,
        }

        if (onDropElement) {
          onDropElement(newElement, section)
        } else {
          addElement(newElement, section)
        }
      } catch {
        // Not a valid JSON payload, ignore
      }
    },
    [calculateDropCoords, containerRef, onDropElement, section, addElement]
  )

  return {
    isDragOver,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    calculateDropCoords,
  }
}
