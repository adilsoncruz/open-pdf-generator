import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { Input } from './Input'

describe('Input atom', () => {
  it('renders default input and matches snapshot', () => {
    const { container } = render(<Input placeholder="Enter value" />)
    expect(container).toMatchSnapshot()
    expect(screen.getByPlaceholderText('Enter value')).toBeInTheDocument()
  })

  it('renders with error, sizes, and addons', () => {
    const { container, rerender } = render(
      <Input
        size="lg"
        error={true}
        leftAddon="$"
        rightAddon="USD"
        defaultValue="100"
      />
    )
    expect(container).toMatchSnapshot()
    expect(screen.getByText('$')).toBeInTheDocument()
    expect(screen.getByText('USD')).toBeInTheDocument()

    rerender(<Input size="md" error={false} />)
    expect(container).toMatchSnapshot()
  })
})
