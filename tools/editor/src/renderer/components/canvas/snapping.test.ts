import { describe, it, expect, vi } from 'vitest'
import { checkMarginSnap, applyCanvasSnap } from './snapping'
import type { Element } from '../../store/templateStore'

describe('canvas snapping', () => {
  const pageSize = { width: 595, height: 842 }
  const margins = { top: 30, right: 30, bottom: 30, left: 30 }
  const containerWidth = 595 - 60 // 535
  const bodyUsableHeight = 842 - 60 // 782

  it('checks margin snap detection', () => {
    const elements: Element[] = [
      { type: 'text', id: 'e1', x: 2, y: 1, width: 100, height: 20 },
      { type: 'text', id: 'e2', x: containerWidth - 102, y: bodyUsableHeight - 21, width: 100, height: 20 },
      { type: 'text', id: 'e3' }, // undefined x/y
    ]

    const result = checkMarginSnap(elements, pageSize, margins, bodyUsableHeight, 5)
    expect(result.left).toBe(true)
    expect(result.top).toBe(true)
    expect(result.right).toBe(true)
    expect(result.bottom).toBe(true)
  })

  it('applies canvas snap for body margins and centers', () => {
    const onSnapGuide = vi.fn()
    // Snap to left margin (x=3 -> 0)
    const snap1 = applyCanvasSnap({
      x: 3,
      y: 2,
      width: 100,
      height: 50,
      pageSize,
      margins,
      location: 'body',
      onSnapGuide,
    })
    expect(snap1.x).toBe(0)
    expect(snap1.y).toBe(0)

    // Snap to right and bottom margins
    const snap2 = applyCanvasSnap({
      x: containerWidth - 102,
      y: bodyUsableHeight - 52,
      width: 100,
      height: 50,
      pageSize,
      margins,
      location: 'body',
    })
    expect(snap2.x).toBe(containerWidth - 100)
    expect(snap2.y).toBe(bodyUsableHeight - 50)

    // Snap to center
    const snapCenter = applyCanvasSnap({
      x: containerWidth / 2 - 50 + 2,
      y: bodyUsableHeight / 2 - 25 + 2,
      width: 100,
      height: 50,
      pageSize,
      margins,
      location: 'body',
    })
    expect(snapCenter.x).toBe(containerWidth / 2 - 50)
    expect(snapCenter.y).toBe(bodyUsableHeight / 2 - 25)
  })

  it('applies canvas snap for header and footer locations', () => {
    const snapHeader = applyCanvasSnap({
      x: 0,
      y: 2,
      width: 100,
      height: 20,
      headerHeight: 50,
      pageSize,
      margins,
      location: 'header',
    })
    expect(snapHeader.y).toBe(0)

    const snapHeaderBottom = applyCanvasSnap({
      x: 0,
      y: 29, // 29 + 20 = 49 (close to 50, dist=1)
      width: 100,
      height: 20,
      headerHeight: 50,
      pageSize,
      margins,
      location: 'header',
    })
    expect(snapHeaderBottom.y).toBe(30) // 50 - 20 = 30

    const snapFooter = applyCanvasSnap({
      x: 0,
      y: 2,
      width: 100,
      height: 15,
      footerHeight: 40,
      pageSize,
      margins,
      location: 'footer',
    })
    expect(snapFooter.y).toBe(0)

    const snapFooterBottom = applyCanvasSnap({
      x: 0,
      y: 24, // 24 + 15 = 39 (close to 40, dist=1)
      width: 100,
      height: 15,
      footerHeight: 40,
      pageSize,
      margins,
      location: 'footer',
    })
    expect(snapFooterBottom.y).toBe(25) // 40 - 15 = 25
  })

  it('applies canvas snap against horizontal and vertical guide lines including center', () => {
    const onSnap = vi.fn()
    const snapGuides = applyCanvasSnap({
      x: 98, // Guide is at pageX=130 (relativeX = 130 - 30 = 100)
      y: 198, // Guide is at pageY=230 (relativeY = 230 - 30 = 200)
      width: 60,
      height: 40,
      pageSize,
      margins,
      location: 'body',
      verticalGuides: [130],
      horizontalGuides: [230],
      onSnapGuide: onSnap,
    })

    expect(snapGuides.x).toBe(100)
    expect(snapGuides.y).toBe(200)
    expect(onSnap).toHaveBeenCalledWith({ h: 230, v: 130 })

    // Test snap right edge and bottom edge to guide
    const snapEdges = applyCanvasSnap({
      x: 42, // x + width = 42 + 60 = 102 (close to 100)
      y: 162, // y + height = 162 + 40 = 202 (close to 200)
      width: 60,
      height: 40,
      pageSize,
      margins,
      location: 'body',
      verticalGuides: [130],
      horizontalGuides: [230],
    })
    expect(snapEdges.x).toBe(40)
    expect(snapEdges.y).toBe(160)

    // Test snap element center to guide
    const snapCenterToGuide = applyCanvasSnap({
      x: 71, // x + 30 = 101 (close to 100)
      y: 181, // y + 20 = 201 (close to 200)
      width: 60,
      height: 40,
      pageSize,
      margins,
      location: 'body',
      verticalGuides: [130],
      horizontalGuides: [230],
    })
    expect(snapCenterToGuide.x).toBe(70)
    expect(snapCenterToGuide.y).toBe(180)
  })

  it('respects options snapX: false and snapY: false and custom offsets', () => {
    const snapNoX = applyCanvasSnap({
      x: 3,
      y: 2,
      width: 100,
      height: 50,
      pageSize,
      margins,
      location: 'body',
      options: { snapX: false, snapY: false },
      containerOffsetX: 50,
      containerOffsetY: 50,
    })
    expect(snapNoX.x).toBe(3)
    expect(snapNoX.y).toBe(2)
  })
})
