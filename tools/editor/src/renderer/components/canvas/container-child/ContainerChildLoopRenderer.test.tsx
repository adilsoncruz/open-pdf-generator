import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { ContainerChildLoopRenderer } from './ContainerChildLoopRenderer'
import type { Element } from '../../../store/templateStore'

describe('ContainerChildLoopRenderer', () => {
  it('renders loop child inside container with children', () => {
    const child: Element = {
      type: 'loop',
      id: 'loop-child-1',
      x: 0,
      y: 0,
      width: '100%',
      height: 120,
      dataBinding: 'products',
      elements: [
        { type: 'text', id: 'c1', x: 0, y: 0, width: 60, height: 20, value: 'Child item' },
      ],
      style: {
        fillColor: '#FFFFFF',
        borderColor: '#8b5cf6',
        borderWidth: 1,
      },
    }

    const { getByText, container } = render(
      <ContainerChildLoopRenderer
        child={child}
        location="body"
        resolveWidth={(w) => (typeof w === 'number' ? w : 400)}
        resolveHeight={(h) => (typeof h === 'number' ? h : 120)}
      />
    )

    expect(getByText('Child item')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('renders empty loop with placeholder and snapshot', () => {
    const child: Element = {
      type: 'loop',
      id: 'loop-child-empty',
      elements: [],
      style: {
        borderStyle: 'none',
        fillColor: 'transparent',
      },
    }

    const { container } = render(
      <ContainerChildLoopRenderer
        child={child}
        resolveWidth={() => 300}
        resolveHeight={() => 80}
      />
    )

    expect(container).toMatchSnapshot()
    expect(container.textContent).toMatch(/elementos|elements/i)
  })

  it('renders nested relative loop children and computes coordinates', () => {
    const child: Element = {
      type: 'loop',
      id: 'loop-nested-rel',
      x: 10,
      y: 10,
      width: 400,
      height: 200,
      dataBinding: 'records',
      elements: [
        {
          type: 'text',
          id: 'nl-1',
          x: 10,
          y: 5,
          width: 150,
          height: 25,
          positionMode: 'RELATIVE',
          relativeOffsetY: 5,
        },
        {
          type: 'text',
          id: 'nl-2',
          x: 10,
          y: 0,
          width: 150,
          height: 25,
          positionMode: 'RELATIVE',
          relativeOffsetY: 10,
        },
      ],
    }

    const { container } = render(
      <ContainerChildLoopRenderer
        child={child}
        resolveWidth={() => 400}
        resolveHeight={() => 200}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
