import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { ContainerElementRenderer } from './ContainerElementRenderer'
import type { Element } from '../../../store/templateStore'

describe('ContainerElementRenderer', () => {
  const pageSize = { width: 595, height: 842 }
  const margins = { top: 20, right: 20, bottom: 20, left: 20 }

  it('renders container element with 100% width and children', () => {
    const onMouseDown = vi.fn()
    const containerEl: Element = {
      type: 'container',
      id: 'cont-1',
      x: 0,
      y: 0,
      width: '100%',
      height: 200,
      elements: [
        { type: 'text', id: 'child-1', x: 10, y: 10, width: 100, height: 20, value: 'Inside Container' },
      ],
      style: {
        borderColor: '#000000',
        borderWidth: 1,
        fillColor: '#FFFFFF',
      },
    }

    const { getByText, container } = render(
      <ContainerElementRenderer
        element={containerEl}
        pageSize={pageSize}
        margins={margins}
        isSelected={true}
        location="body"
        onMouseDown={onMouseDown}
      />
    )

    expect(getByText('Inside Container')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
    const wrapper = container.firstElementChild as HTMLElement
    fireEvent.mouseDown(wrapper)
    expect(onMouseDown).toHaveBeenCalled()
  })

  it('renders empty container with placeholder text and snapshot', () => {
    const containerEl: Element = {
      type: 'container',
      id: 'cont-empty',
      x: 0,
      y: 0,
      width: 400,
      height: 100,
      elements: [],
    }

    const { container } = render(
      <ContainerElementRenderer
        element={containerEl}
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

  it('renders multiple relative children and computes container flow coordinates', () => {
    const containerEl: Element = {
      type: 'container',
      id: 'cont-flow',
      x: 20,
      y: 30,
      width: 500,
      height: 200,
      elements: [
        {
          type: 'text',
          id: 'cf-1',
          x: 10,
          y: 10,
          width: 150,
          height: 30,
          positionMode: 'RELATIVE',
          relativeOffsetY: 5,
        },
        {
          type: 'text',
          id: 'cf-2',
          x: 10,
          y: 0,
          width: 150,
          height: 30,
          positionMode: 'RELATIVE',
          relativeOffsetY: 10,
        },
      ],
    }

    const { container } = render(
      <ContainerElementRenderer
        element={containerEl}
        pageSize={pageSize}
        margins={margins}
        isSelected={false}
        location="body"
        onMouseDown={vi.fn()}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
