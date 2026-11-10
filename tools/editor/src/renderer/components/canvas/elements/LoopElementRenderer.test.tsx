import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { LoopElementRenderer } from './LoopElementRenderer'
import type { Element } from '../../../store/templateStore'

describe('LoopElementRenderer', () => {
  const pageSize = { width: 595, height: 842 }
  const margins = { top: 20, right: 20, bottom: 20, left: 20 }

  it('renders loop with 100% width, children, and badge', () => {
    const onMouseDown = vi.fn()
    const element: Element = {
      type: 'loop',
      id: 'loop-1',
      x: 0,
      y: 0,
      width: '100%',
      height: 120,
      dataBinding: 'items',
      itemSpacing: 15,
      style: {
        fillColor: '#FFFFFF',
        borderColor: '#6366f1',
        borderWidth: 2,
        borderStyle: 'solid',
        cornerRadius: 6,
      },
      elements: [
        { type: 'text', id: 't1', x: 5, y: 5, width: 80, height: 20, value: 'Item row' },
      ],
    }

    const { getByText, container } = render(
      <LoopElementRenderer
        element={element}
        pageSize={pageSize}
        margins={margins}
        isSelected={true}
        location="body"
        onMouseDown={onMouseDown}
      />
    )

    expect(getByText('Item row')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
    fireEvent.mouseDown(container.firstElementChild as HTMLElement)
    expect(onMouseDown).toHaveBeenCalled()
  })

  it('renders empty loop element with placeholder text and snapshot', () => {
    const element: Element = {
      type: 'loop',
      id: 'loop-empty',
      x: 10,
      y: 20,
      width: 300,
      height: 80,
      elements: [],
      style: {
        borderStyle: 'none',
      },
    }

    const { container } = render(
      <LoopElementRenderer
        element={element}
        pageSize={pageSize}
        margins={margins}
        isSelected={false}
        location="body"
        onMouseDown={vi.fn()}
      />
    )

    expect(container).toMatchSnapshot()
    expect(container.textContent).toMatch(/elementos|elements/i)
  })

  it('renders multiple relative children and computes loop flow coordinates', () => {
    const element: Element = {
      type: 'loop',
      id: 'loop-rel',
      x: 50,
      y: 60,
      width: 400,
      height: 250,
      dataBinding: 'products',
      elements: [
        {
          type: 'text',
          id: 'rel-c1',
          x: 10,
          y: 15,
          width: 120,
          height: 25,
          positionMode: 'RELATIVE',
          relativeOffsetY: 5,
        },
        {
          type: 'text',
          id: 'rel-c2',
          x: 10,
          y: 0,
          width: 120,
          height: 25,
          positionMode: 'RELATIVE',
          relativeOffsetY: 10,
        },
      ],
    }

    const { container, getByText } = render(
      <LoopElementRenderer
        element={element}
        pageSize={pageSize}
        margins={margins}
        isSelected={false}
        location="body"
        onMouseDown={vi.fn()}
      />
    )

    expect(container).toMatchSnapshot()
    expect(container.querySelectorAll('.absolute').length).toBeGreaterThanOrEqual(2)
  })
})
