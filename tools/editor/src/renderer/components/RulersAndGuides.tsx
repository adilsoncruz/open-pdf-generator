import { useEffect, useRef, useState, MouseEvent as ReactMouseEvent } from 'react'

export interface Guide {
  id: string
  pos: number
  type: 'horizontal' | 'vertical'
}

interface RulersAndGuidesProps {
  width: number
  height: number
  scale: number
  guides: Guide[]
  setGuides: React.Dispatch<React.SetStateAction<Guide[]>>
}

export function RulersAndGuides({ width, height, scale, guides, setGuides }: RulersAndGuidesProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const topRulerRef = useRef<HTMLCanvasElement>(null)
  const leftRulerRef = useRef<HTMLCanvasElement>(null)
  const [activeGuide, setActiveGuide] = useState<string | null>(null)

  // Draw Top Ruler
  useEffect(() => {
    const canvas = topRulerRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = 20 * dpr
    ctx.scale(dpr, dpr)
    
    ctx.clearRect(0, 0, width, 20)
    ctx.fillStyle = '#f9fafb'
    ctx.fillRect(0, 0, width, 20)
    
    ctx.strokeStyle = '#d1d5db'
    ctx.fillStyle = '#6b7280'
    ctx.font = '10px sans-serif'
    ctx.lineWidth = 1
    
    ctx.beginPath()
    for (let i = 0; i <= width; i += 10) {
      const isMajor = i % 50 === 0
      const tick = isMajor ? 10 : 5
      ctx.moveTo(i, 20)
      ctx.lineTo(i, 20 - tick)
      if (isMajor && i > 0) ctx.fillText(i.toString(), i + 2, 10)
    }
    ctx.moveTo(0, 20)
    ctx.lineTo(width, 20)
    ctx.stroke()
  }, [width, scale])

  // Draw Left Ruler
  useEffect(() => {
    const canvas = leftRulerRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = 20 * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)
    
    ctx.clearRect(0, 0, 20, height)
    ctx.fillStyle = '#f9fafb'
    ctx.fillRect(0, 0, 20, height)
    
    ctx.strokeStyle = '#d1d5db'
    ctx.fillStyle = '#6b7280'
    ctx.font = '10px sans-serif'
    ctx.lineWidth = 1
    
    ctx.beginPath()
    for (let i = 0; i <= height; i += 10) {
      const isMajor = i % 50 === 0
      const tick = isMajor ? 10 : 5
      ctx.moveTo(20, i)
      ctx.lineTo(20 - tick, i)
      if (isMajor && i > 0) {
        ctx.save()
        ctx.translate(10, i + 2)
        ctx.rotate(-Math.PI / 2)
        ctx.fillText(i.toString(), 0, 0)
        ctx.restore()
      }
    }
    ctx.moveTo(20, 0)
    ctx.lineTo(20, height)
    ctx.stroke()
  }, [height, scale])

  // Handle Dragging
  const handleRulerMouseDown = (e: ReactMouseEvent, type: 'horizontal' | 'vertical') => {
    e.preventDefault()
    const id = Date.now().toString()
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    // Position relative to the container without scale, mapped to scaled coordinates
    const initialPos = type === 'horizontal' 
      ? (e.clientY - rect.top) / scale 
      : (e.clientX - rect.left) / scale

    const newGuide: Guide = { id, type, pos: initialPos }
    setGuides(prev => [...prev, newGuide])
    setActiveGuide(id)

    const handleMouseMove = (moveEvent: MouseEvent) => {
      setGuides(prev => prev.map(g => {
        if (g.id !== id) return g
        const pos = type === 'horizontal' 
          ? (moveEvent.clientY - rect.top) / scale 
          : (moveEvent.clientX - rect.left) / scale
        return { ...g, pos }
      }))
    }

    const handleMouseUp = () => {
      setActiveGuide(null)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      
      // Remove guide if dragged out
      setGuides(prev => {
        const guide = prev.find(g => g.id === id)
        if (!guide) return prev
        if (type === 'horizontal' && (guide.pos < 0 || guide.pos > height)) {
          return prev.filter(g => g.id !== id)
        }
        if (type === 'vertical' && (guide.pos < 0 || guide.pos > width)) {
          return prev.filter(g => g.id !== id)
        }
        return prev
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const handleGuideMouseDown = (e: ReactMouseEvent, guide: Guide) => {
    e.preventDefault()
    e.stopPropagation()
    setActiveGuide(guide.id)
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const handleMouseMove = (moveEvent: MouseEvent) => {
      setGuides(prev => prev.map(g => {
        if (g.id !== guide.id) return g
        const pos = guide.type === 'horizontal' 
          ? (moveEvent.clientY - rect.top) / scale 
          : (moveEvent.clientX - rect.left) / scale
        return { ...g, pos }
      }))
    }

    const handleMouseUp = () => {
      setActiveGuide(null)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)

      // Remove guide if dragged out
      setGuides(prev => {
        const g = prev.find(x => x.id === guide.id)
        if (!g) return prev
        if (g.type === 'horizontal' && (g.pos < 0 || g.pos > height)) {
          return prev.filter(x => x.id !== guide.id)
        }
        if (g.type === 'vertical' && (g.pos < 0 || g.pos > width)) {
          return prev.filter(x => x.id !== guide.id)
        }
        return prev
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 40 }}>
      {/* Top Ruler */}
      <canvas
        ref={topRulerRef}
        className="absolute pointer-events-auto cursor-row-resize"
        style={{ top: -20, left: 0, width, height: 20 }}
        onMouseDown={e => handleRulerMouseDown(e, 'horizontal')}
      />
      {/* Left Ruler */}
      <canvas
        ref={leftRulerRef}
        className="absolute pointer-events-auto cursor-col-resize"
        style={{ top: 0, left: -20, width: 20, height }}
        onMouseDown={e => handleRulerMouseDown(e, 'vertical')}
      />
      {/* Corner */}
      <div 
        className="absolute bg-gray-100 border-r border-b border-gray-300"
        style={{ top: -20, left: -20, width: 20, height: 20 }}
      />
      
      {/* Guides */}
      {guides.map(guide => (
        <div
          key={guide.id}
          className="absolute pointer-events-auto flex items-center justify-center"
          style={{
            ...(guide.type === 'horizontal' ? {
              top: guide.pos - 2, // -2 to center the hit area
              left: 0,
              width: '100%',
              height: 5,
              cursor: 'row-resize',
            } : {
              top: 0,
              left: guide.pos - 2,
              width: 5,
              height: '100%',
              cursor: 'col-resize',
            }),
          }}
          onMouseDown={e => handleGuideMouseDown(e, guide)}
          onDoubleClick={(e) => {
            e.stopPropagation()
            setGuides(prev => prev.filter(g => g.id !== guide.id))
          }}
        >
          <div 
            style={{
              ...(guide.type === 'horizontal' ? {
                width: '100%',
                height: 1,
              } : {
                width: 1,
                height: '100%',
              }),
              backgroundColor: '#0ea5e9', // sky-500
            }}
          />
        </div>
      ))}
    </div>
  )
}
