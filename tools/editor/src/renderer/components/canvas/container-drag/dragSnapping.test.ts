import { describe, it, expect } from 'vitest'
import {
  snapSingleChildCoordinates,
  snapMultiChildCoordinates,
  calculateMultiChildDragDeltas,
} from './dragSnapping'

describe('dragSnapping', () => {
  describe('snapSingleChildCoordinates', () => {
    it('snaps to container start and end edges within tolerance', () => {
      const snapLeft = snapSingleChildCoordinates({
        rawX: 4,
        rawY: 100,
        childWidth: 50,
        childHeight: 30,
        containerWidth: 200,
        containerHeight: 200,
      })
      expect(snapLeft.snappedX).toBe(0)

      const snapRight = snapSingleChildCoordinates({
        rawX: 147, // 200 - 50 = 150, delta is 3 < 8
        rawY: 100,
        childWidth: 50,
        childHeight: 30,
        containerWidth: 200,
        containerHeight: 200,
      })
      expect(snapRight.snappedX).toBe(150)
    })

    it('snaps to container center', () => {
      // container center = 100. child center = snappedX + 25 -> snappedX = 75
      const snapCenter = snapSingleChildCoordinates({
        rawX: 73, // |73 + 25 - 100| = 2 < 8
        rawY: 100,
        childWidth: 50,
        childHeight: 30,
        containerWidth: 200,
        containerHeight: 200,
      })
      expect(snapCenter.snappedX).toBe(75)
    })

    it('snaps to vertical and horizontal guides on start edge', () => {
      // containerPageX = 50, vertical guide at pageX = 150 => guideLocalX = 100
      const snapGuide = snapSingleChildCoordinates({
        rawX: 98,
        rawY: 48,
        childWidth: 50,
        childHeight: 30,
        containerWidth: 400,
        containerHeight: 400,
        containerPageX: 50,
        containerPageY: 50,
        verticalGuides: [150],
        horizontalGuides: [100], // guideLocalY = 50
      })
      expect(snapGuide.snappedX).toBe(100)
      expect(snapGuide.activeSnapV).toBe(150)
      expect(snapGuide.snappedY).toBe(50)
      expect(snapGuide.activeSnapH).toBe(100)
    })

    it('snaps to guides on end edge and center edge', () => {
      // containerPageX = 0, guide at 200.
      // childWidth = 50. snapped + 50 ≈ 200 => snapped ≈ 150.
      // rawX = 148 => distEnd = |148 + 50 - 200| = 2 < 8.
      const snapEnd = snapSingleChildCoordinates({
        rawX: 148,
        rawY: 100,
        childWidth: 50,
        childHeight: 30,
        containerWidth: 500,
        containerHeight: 500,
        containerPageX: 0,
        containerPageY: 0,
        verticalGuides: [200],
      })
      expect(snapEnd.snappedX).toBe(150)
      expect(snapEnd.activeSnapV).toBe(200)

      // guide at 200. snapped + 25 ≈ 200 => snapped ≈ 175.
      // rawX = 176 => distCenter = |176 + 25 - 200| = 1 < 8.
      const snapCenterGuide = snapSingleChildCoordinates({
        rawX: 176,
        rawY: 100,
        childWidth: 50,
        childHeight: 30,
        containerWidth: 500,
        containerHeight: 500,
        containerPageX: 0,
        containerPageY: 0,
        verticalGuides: [200],
      })
      expect(snapCenterGuide.snappedX).toBe(175)
      expect(snapCenterGuide.activeSnapV).toBe(200)
    })
  })

  describe('snapMultiChildCoordinates', () => {
    it('snaps multi-child reference position to container bounds', () => {
      const snap = snapMultiChildCoordinates({
        rawX: 5,
        rawY: 295,
        childWidth: 100,
        childHeight: 50,
        containerWidth: 300,
        containerHeight: 340, // 340 - 50 = 290, delta is 5
      })
      expect(snap.snappedX).toBe(0)
      expect(snap.snappedY).toBe(290)
    })

    it('snaps multi-child reference position to guides (start and end edges)', () => {
      const snap = snapMultiChildCoordinates({
        rawX: 98,
        rawY: 148,
        childWidth: 50,
        childHeight: 50,
        containerWidth: 500,
        containerHeight: 500,
        containerPageX: 0,
        containerPageY: 0,
        verticalGuides: [100], // snaps start edge to 100
        horizontalGuides: [200], // snaps end edge to 200 - 50 = 150
      })
      expect(snap.snappedX).toBe(100)
      expect(snap.snappedY).toBe(150)
    })
  })

  describe('calculateMultiChildDragDeltas', () => {
    it('returns raw deltas when snapToGuides is false', () => {
      const result = calculateMultiChildDragDeltas(
        { x: 20, y: 30 },
        15,
        25,
        100,
        50,
        400,
        400,
        undefined,
        undefined,
        [],
        [],
        false
      )
      expect(result).toEqual({ moveDeltaX: 15, moveDeltaY: 25 })
    })

    it('calculates snapped deltas based on primary child', () => {
      const result = calculateMultiChildDragDeltas(
        { x: 10, y: 10 },
        -7, // rawX = 3, snaps to 0 -> moveDeltaX = 0 - 10 = -10
        20,
        100,
        50,
        400,
        400,
        undefined,
        undefined,
        [],
        [],
        true
      )
      expect(result.moveDeltaX).toBe(-10)
    })
  })
})
