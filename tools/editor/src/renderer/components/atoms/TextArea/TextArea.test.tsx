import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { TextArea } from './TextArea'

describe('TextArea atom', () => {
  it('renders default textarea and matches snapshot', () => {
    const { container } = render(<TextArea placeholder="Type here..." />)
    expect(container).toMatchSnapshot()
    expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument()
  })

  it('renders with error, sizes, and resizes', () => {
    const { container, rerender } = render(
      <TextArea size="lg" resize="none" error={true} defaultValue="Content" />
    )
    expect(container).toMatchSnapshot()
    expect(screen.getByRole('textbox')).toHaveClass('border-red-500')

    rerender(<TextArea size="md" resize="both" />)
    expect(container).toMatchSnapshot()
  })
})
