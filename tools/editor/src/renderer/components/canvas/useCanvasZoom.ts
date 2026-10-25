import { useEffect } from 'react'
import { useUIStore } from '../../store/uiStore'

export function useCanvasZoom() {
  const zoom = useUIStore((state) => state.zoom)
  const setZoom = useUIStore((state) => state.setZoom)

  const handleZoomIn = () => {
    setZoom(Math.min(200, zoom + 25))
  }

  const handleZoomOut = () => {
    setZoom(Math.max(25, zoom - 25))
  }

  const handleZoomReset = () => {
    setZoom(100)
  }

  const handleZoomFit = () => {
    setZoom(75)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement
      const target = e.target as HTMLElement
      if (
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.isContentEditable ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault()
        handleZoomIn()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault()
        handleZoomOut()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault()
        handleZoomReset()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [zoom, setZoom])

  return {
    zoom,
    setZoom,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handleZoomFit,
  }
}
