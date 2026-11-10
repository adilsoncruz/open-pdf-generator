import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { RulersAndGuides, Guide } from './RulersAndGuides'

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    scale: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
  })
})

describe('RulersAndGuides', () => {
  it('renders correctly with given guides and matches snapshot', () => {
    const guides: Guide[] = [
      { id: '1', pos: 100, type: 'horizontal' },
      { id: '2', pos: 200, type: 'vertical' },
    ]
    const setGuides = vi.fn()

    const { container } = render(
      <RulersAndGuides
        width={800}
        height={600}
        scale={1}
        guides={guides}
        setGuides={setGuides}
      />
    )

    expect(document.querySelectorAll('.pointer-events-auto.flex')).toHaveLength(2)
    expect(container).toMatchSnapshot()
  })

  it('removes guide on double click', () => {
    let guides: Guide[] = [{ id: '1', pos: 100, type: 'horizontal' }]
    const setGuides = vi.fn((fn) => {
      guides = typeof fn === 'function' ? fn(guides) : fn
    })

    render(
      <RulersAndGuides
        width={800}
        height={600}
        scale={1}
        guides={guides}
        setGuides={setGuides}
      />
    )

    const guideElement = document.querySelector('.pointer-events-auto.flex')
    expect(guideElement).not.toBeNull()

    fireEvent.doubleClick(guideElement!)
    expect(setGuides).toHaveBeenCalled()
    expect(guides).toHaveLength(0)
  })

  it('handles ruler mouse down to create and drag new guides', () => {
    let currentGuides: Guide[] = []
    const setGuides = vi.fn((updater) => {
      if (typeof updater === 'function') {
        currentGuides = updater(currentGuides)
      } else {
        currentGuides = updater
      }
    })

    const { container } = render(
      <RulersAndGuides
        width={800}
        height={600}
        scale={1}
        guides={currentGuides}
        setGuides={setGuides}
      />
    )

    const canvases = container.querySelectorAll('canvas')
    const topRuler = canvases[0]
    const leftRuler = canvases[1]

    // Create horizontal guide from top ruler
    fireEvent.mouseDown(topRuler, { clientX: 100, clientY: 50 })
    expect(setGuides).toHaveBeenCalled()

    // Move mouse on window
    fireEvent(window, new MouseEvent('mousemove', { clientX: 100, clientY: 150 }))

    // Mouse up on window
    fireEvent(window, new MouseEvent('mouseup'))

    // Create and drag horizontal guide out of bounds (> height)
    fireEvent.mouseDown(topRuler, { clientX: 100, clientY: 50 })
    fireEvent(window, new MouseEvent('mousemove', { clientX: 100, clientY: 700 }))
    fireEvent(window, new MouseEvent('mouseup'))

    // Create and drag horizontal guide out of bounds (< 0)
    fireEvent.mouseDown(topRuler, { clientX: 100, clientY: 50 })
    fireEvent(window, new MouseEvent('mousemove', { clientX: 100, clientY: -10 }))
    fireEvent(window, new MouseEvent('mouseup'))

    // Create vertical guide from left ruler
    fireEvent.mouseDown(leftRuler, { clientX: 50, clientY: 100 })
    expect(setGuides).toHaveBeenCalled()

    fireEvent(window, new MouseEvent('mousemove', { clientX: 250, clientY: 100 }))
    fireEvent(window, new MouseEvent('mouseup'))

    // Create and drag vertical guide out of bounds (> width)
    fireEvent.mouseDown(leftRuler, { clientX: 50, clientY: 100 })
    fireEvent(window, new MouseEvent('mousemove', { clientX: 900, clientY: 100 }))
    fireEvent(window, new MouseEvent('mouseup'))

    // Create and drag vertical guide out of bounds (< 0)
    fireEvent.mouseDown(leftRuler, { clientX: 50, clientY: 100 })
    fireEvent(window, new MouseEvent('mousemove', { clientX: -10, clientY: 100 }))
    fireEvent(window, new MouseEvent('mouseup'))
  })

  it('handles guide dragging and removing when dragged out of bounds', () => {
    const guide: Guide = { id: 'g-h', pos: 100, type: 'horizontal' }
    let guides = [guide]
    const setGuides = vi.fn((updater) => {
      if (typeof updater === 'function') {
        guides = updater(guides)
      } else {
        guides = updater
      }
    })

    const firstRender = render(
      <RulersAndGuides
        width={800}
        height={600}
        scale={1}
        guides={[guide]}
        setGuides={setGuides}
      />
    )

    const guideEl = firstRender.container.querySelector('.pointer-events-auto.flex')!
    fireEvent.mouseDown(guideEl, { clientX: 100, clientY: 100 })

    // Move guide out of bounds (y = -50)
    fireEvent(window, new MouseEvent('mousemove', { clientX: 100, clientY: -50 }))
    fireEvent(window, new MouseEvent('mouseup'))

    // Test horizontal guide drag > height (y = 700)
    fireEvent.mouseDown(guideEl, { clientX: 100, clientY: 100 })
    fireEvent(window, new MouseEvent('mousemove', { clientX: 100, clientY: 700 }))
    fireEvent(window, new MouseEvent('mouseup'))

    firstRender.unmount()

    // Test vertical guide drag out of bounds
    const vGuide: Guide = { id: 'g-v', pos: 100, type: 'vertical' }
    guides = [vGuide]
    const vRender = render(
      <RulersAndGuides
        width={800}
        height={600}
        scale={1}
        guides={[vGuide]}
        setGuides={setGuides}
      />
    )
    const vGuideEl = vRender.container.querySelector('.pointer-events-auto.flex')!
    fireEvent.mouseDown(vGuideEl, { clientX: 100, clientY: 100 })
    fireEvent(window, new MouseEvent('mousemove', { clientX: -50, clientY: 100 }))
    fireEvent(window, new MouseEvent('mouseup'))

    // Test vertical guide drag > width (x = 900)
    fireEvent.mouseDown(vGuideEl, { clientX: 100, clientY: 100 })
    fireEvent(window, new MouseEvent('mousemove', { clientX: 900, clientY: 100 }))
    fireEvent(window, new MouseEvent('mouseup'))
    vRender.unmount()
  })
})
