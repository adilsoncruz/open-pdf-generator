import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { Badge } from './Badge'

describe('Badge atom', () => {
  it('renders default badge and matches snapshot', () => {
    const { container } = render(<Badge>Default</Badge>)
    expect(container).toMatchSnapshot()
    expect(screen.getByText('Default')).toBeInTheDocument()
  })

  it('renders all variants and custom className', () => {
    const { container, rerender } = render(<Badge variant="primary">Primary</Badge>)
    expect(container).toMatchSnapshot()

    rerender(<Badge variant="success">Success</Badge>)
    expect(container).toMatchSnapshot()

    rerender(<Badge variant="warning">Warning</Badge>)
    expect(container).toMatchSnapshot()

    rerender(<Badge variant="danger" className="custom-extra">Danger</Badge>)
    expect(container).toMatchSnapshot()
    expect(screen.getByText('Danger')).toHaveClass('custom-extra')
  })
})
