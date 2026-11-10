import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import { Divider } from './Divider'

describe('Divider atom', () => {
  it('renders horizontal divider and matches snapshot', () => {
    const { container } = render(<Divider orientation="horizontal" />)
    expect(container).toMatchSnapshot()
  })

  it('renders vertical divider with custom class and matches snapshot', () => {
    const { container } = render(<Divider orientation="vertical" className="my-2" />)
    expect(container).toMatchSnapshot()
  })
})
