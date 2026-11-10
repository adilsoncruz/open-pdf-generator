import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { CanvasResizeHandles } from './CanvasResizeHandles'

describe('CanvasResizeHandles', () => {
  it('renders all 8 handles when width and height are not full and matches snapshot', () => {
    const onResizeMouseDown = vi.fn()
    const { container } = render(
      <CanvasResizeHandles
        width={100}
        height={80}
        isWidthFull={false}
        isHeightFull={false}
        onResizeMouseDown={onResizeMouseDown}
      />
    )

    expect(container).toMatchSnapshot()

    // Query all handle elements
    const handles = container.querySelectorAll('div')
    // 4 corners + 2 top/bottom + 2 left/right = 8 handles
    expect(handles.length).toBe(8)

    // Trigger mousedown on each handle
    handles.forEach((h) => {
      fireEvent.mouseDown(h)
    })

    expect(onResizeMouseDown).toHaveBeenCalledTimes(8)
    const calledDirections = onResizeMouseDown.mock.calls.map((c) => c[1])
    expect(calledDirections).toEqual(['nw', 'ne', 'sw', 'se', 'n', 's', 'w', 'e'])
  })

  it('renders only vertical handles (n, s) when isWidthFull is true', () => {
    const onResizeMouseDown = vi.fn()
    const { container } = render(
      <CanvasResizeHandles
        width={200}
        height={100}
        isWidthFull={true}
        isHeightFull={false}
        onResizeMouseDown={onResizeMouseDown}
      />
    )

    const handles = container.querySelectorAll('div')
    expect(handles.length).toBe(2)

    handles.forEach((h) => fireEvent.mouseDown(h))
    const calledDirections = onResizeMouseDown.mock.calls.map((c) => c[1])
    expect(calledDirections).toEqual(['n', 's'])
  })

  it('renders only horizontal handles (w, e) when isHeightFull is true', () => {
    const onResizeMouseDown = vi.fn()
    const { container } = render(
      <CanvasResizeHandles
        width={200}
        height={100}
        isWidthFull={false}
        isHeightFull={true}
        onResizeMouseDown={onResizeMouseDown}
      />
    )

    const handles = container.querySelectorAll('div')
    expect(handles.length).toBe(2)

    handles.forEach((h) => fireEvent.mouseDown(h))
    const calledDirections = onResizeMouseDown.mock.calls.map((c) => c[1])
    expect(calledDirections).toEqual(['w', 'e'])
  })

  it('renders no handles when both width and height are full', () => {
    const onResizeMouseDown = vi.fn()
    const { container } = render(
      <CanvasResizeHandles
        width={200}
        height={100}
        isWidthFull={true}
        isHeightFull={true}
        onResizeMouseDown={onResizeMouseDown}
      />
    )

    const handles = container.querySelectorAll('div')
    expect(handles.length).toBe(0)
    expect(container).toMatchSnapshot()
  })
})
