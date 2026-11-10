import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { TransformSection } from './TransformSection'
import type { Element } from '../../../../store/templateStore'

describe('TransformSection', () => {
  it('renders X, Y, W, H and updates values', () => {
    const onUpdate = vi.fn()
    const element: Element = {
      id: 'el-1',
      type: 'text',
      x: 10,
      y: 20,
      width: 150,
      height: 40,
    }

    const { getByDisplayValue, container } = render(
      <TransformSection element={element} onUpdate={onUpdate} />
    )

    expect(container).toMatchSnapshot()

    fireEvent.change(getByDisplayValue('10'), { target: { value: '25' } })
    expect(onUpdate).toHaveBeenCalledWith('x', 25)

    fireEvent.change(getByDisplayValue('20'), { target: { value: '35' } })
    expect(onUpdate).toHaveBeenCalledWith('y', 35)

    fireEvent.change(getByDisplayValue('150'), { target: { value: '200' } })
    expect(onUpdate).toHaveBeenCalledWith('width', 200)

    fireEvent.change(getByDisplayValue('40'), { target: { value: '60' } })
    expect(onUpdate).toHaveBeenCalledWith('height', 60)
  })

  it('handles 100% width and 100% height checkboxes and disables inputs', () => {
    const onUpdate = vi.fn()
    const element: Element = {
      id: 'el-2',
      type: 'rectangle',
      x: 0,
      y: 0,
      width: '100%',
      height: '100%',
    }

    const { getByRole, getAllByRole } = render(
      <TransformSection element={element} onUpdate={onUpdate} />
    )

    const checkboxes = getAllByRole('checkbox')
    expect(checkboxes.length).toBe(2)

    // Uncheck 100% width
    fireEvent.click(checkboxes[0])
    expect(onUpdate).toHaveBeenCalledWith({ width: 100 })

    // Uncheck 100% height
    fireEvent.click(checkboxes[1])
    expect(onUpdate).toHaveBeenCalledWith({ height: 60 })
  })

  it('checks 100% width and 100% height checkboxes for container/loop', () => {
    const onUpdate = vi.fn()
    const element: Element = {
      id: 'el-loop',
      type: 'loop',
      x: 10,
      y: 10,
      width: 200,
      height: 80,
    }

    const { getAllByRole } = render(
      <TransformSection element={element} onUpdate={onUpdate} />
    )

    const checkboxes = getAllByRole('checkbox')
    // Check 100% width
    fireEvent.click(checkboxes[0])
    expect(onUpdate).toHaveBeenCalledWith({ width: '100%', x: 0 })

    // Check 100% height
    fireEvent.click(checkboxes[1])
    expect(onUpdate).toHaveBeenCalledWith({ height: '100%', y: 0, relativeOffsetY: 0 })
  })

  it('switches between absolute and relative position mode', () => {
    const onUpdate = vi.fn()
    const element: Element = {
      id: 'el-3',
      type: 'text',
      x: 10,
      y: 20,
      width: 100,
      height: 30,
      positionMode: 'RELATIVE',
      relativeOffsetY: 15,
    }

    const { getByText, getByDisplayValue } = render(
      <TransformSection element={element} onUpdate={onUpdate} />
    )

    // Relative offset input is rendered
    const offsetInput = getByDisplayValue('15')
    fireEvent.change(offsetInput, { target: { value: '25' } })
    expect(onUpdate).toHaveBeenCalledWith('relativeOffsetY', 25)

    // Switch to Absolute
    fireEvent.click(getByText(/Absolute/i))
    expect(onUpdate).toHaveBeenCalledWith({
      positionMode: 'ABSOLUTE',
      position: 'absolute',
    })

    // Switch to Relative
    fireEvent.click(getByText(/^Relative$/i))
    expect(onUpdate).toHaveBeenCalledWith({
      positionMode: 'RELATIVE',
      position: 'relative',
      relativeOffsetY: 15,
    })
  })
})
