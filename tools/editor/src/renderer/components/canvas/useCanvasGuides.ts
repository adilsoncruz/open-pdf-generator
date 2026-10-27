import { useState, useEffect, type MouseEvent as ReactMouseEvent, type RefObject } from 'react'

interface UseCanvasGuidesOptions {
  pageRef: RefObject<HTMLDivElement | null>
  pageSize: { width: number; height: number }
  scale: number
  snapToGuides: boolean
  margins: { top: number; right: number; bottom: number; left: number }
}

export function useCanvasGuides({
  pageRef,
  pageSize,
  scale,
  snapToGuides,
  margins,
}: UseCanvasGuidesOptions) {
  const [horizontalGuides, setHorizontalGuides] = useState<number[]>([])
  const [verticalGuides, setVerticalGuides] = useState<number[]>([])
  const [snappedGuides, setSnappedGuides] = useState<{ h: number | null; v: number | null }>({ h: null, v: null })
  const [draggingGuide, setDraggingGuide] = useState<{ type: 'h' | 'v'; index: number; isNew?: boolean } | null>(null)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  const addHorizontalGuide = (yPos: number) => {
    setHorizontalGuides((prev) => [...prev, Math.round(yPos)])
  }

  const addVerticalGuide = (xPos: number) => {
    setVerticalGuides((prev) => [...prev, Math.round(xPos)])
  }

  const removeGuide = (type: 'h' | 'v', index: number) => {
    if (type === 'h') {
      setHorizontalGuides((prev) => prev.filter((_, i) => i !== index))
    } else {
      setVerticalGuides((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const handleRulerMouseDownH = (e: ReactMouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const pageRect = pageRef.current?.getBoundingClientRect()
    const initialY = pageRect
      ? Math.max(0, Math.min(pageSize.height, Math.round((e.clientY - pageRect.top) / scale)))
      : 0
    const newIndex = horizontalGuides.length
    setHorizontalGuides((prev) => [...prev, initialY])
    setDraggingGuide({ type: 'h', index: newIndex, isNew: true })
  }

  const handleRulerMouseDownV = (e: ReactMouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const pageRect = pageRef.current?.getBoundingClientRect()
    const initialX = pageRect
      ? Math.max(0, Math.min(pageSize.width, Math.round((e.clientX - pageRect.left) / scale)))
      : 0
    const newIndex = verticalGuides.length
    setVerticalGuides((prev) => [...prev, initialX])
    setDraggingGuide({ type: 'v', index: newIndex, isNew: true })
  }

  useEffect(() => {
    if (!draggingGuide) return

    const handleMouseMove = (e: MouseEvent) => {
      const pageRect = pageRef.current?.getBoundingClientRect()
      if (!pageRect) return

      if (draggingGuide.type === 'h') {
        const rawY = (e.clientY - pageRect.top) / scale
        let clampedY = Math.max(0, Math.min(pageSize.height, Math.round(rawY)))
        if (snapToGuides) {
          if (Math.abs(clampedY - margins.top) <= 6) clampedY = Math.round(margins.top)
          else if (Math.abs(clampedY - (pageSize.height - margins.bottom)) <= 6) clampedY = Math.round(pageSize.height - margins.bottom)
          else if (Math.abs(clampedY - pageSize.height / 2) <= 6) clampedY = Math.round(pageSize.height / 2)
        }
        setHorizontalGuides((prev) =>
          prev.map((g, i) => (i === draggingGuide.index ? clampedY : g))
        )
      } else {
        const rawX = (e.clientX - pageRect.left) / scale
        let clampedX = Math.max(0, Math.min(pageSize.width, Math.round(rawX)))
        if (snapToGuides) {
          if (Math.abs(clampedX - margins.left) <= 6) clampedX = Math.round(margins.left)
          else if (Math.abs(clampedX - (pageSize.width - margins.right)) <= 6) clampedX = Math.round(pageSize.width - margins.right)
          else if (Math.abs(clampedX - pageSize.width / 2) <= 6) clampedX = Math.round(pageSize.width / 2)
        }
        setVerticalGuides((prev) =>
          prev.map((g, i) => (i === draggingGuide.index ? clampedX : g))
        )
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      const pageRect = pageRef.current?.getBoundingClientRect()
      if (pageRect) {
        if (draggingGuide.type === 'h') {
          const rawY = (e.clientY - pageRect.top) / scale
          if (draggingGuide.isNew && rawY < 0) {
            setHorizontalGuides((prev) =>
              prev.map((g, i) => (i === draggingGuide.index ? Math.round(margins.top) : g))
            )
          } else if (rawY < 0 || rawY > pageSize.height) {
            setHorizontalGuides((prev) => prev.filter((_, i) => i !== draggingGuide.index))
          }
        } else {
          const rawX = (e.clientX - pageRect.left) / scale
          if (draggingGuide.isNew && rawX < 0) {
            setVerticalGuides((prev) =>
              prev.map((g, i) => (i === draggingGuide.index ? Math.round(margins.left) : g))
            )
          } else if (rawX < 0 || rawX > pageSize.width) {
            setVerticalGuides((prev) => prev.filter((_, i) => i !== draggingGuide.index))
          }
        }
      }
      setDraggingGuide(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [draggingGuide, scale, pageSize.width, pageSize.height, margins.top, margins.left, snapToGuides])

  return {
    horizontalGuides,
    verticalGuides,
    snappedGuides,
    setSnappedGuides,
    draggingGuide,
    setDraggingGuide,
    mousePosition,
    setMousePosition,
    addHorizontalGuide,
    addVerticalGuide,
    removeGuide,
    handleRulerMouseDownH,
    handleRulerMouseDownV,
  }
}
