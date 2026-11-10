import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { Checkbox } from './Checkbox'

describe('Checkbox atom', () => {
  it('renders correctly with label and matches snapshot', () => {
    const { container } = render(<Checkbox label="Accept terms" />)
    expect(container).toMatchSnapshot()
    expect(screen.getByText('Accept terms')).toBeInTheDocument()
  })

  it('handles change events and disabled state', () => {
    const onChange = vi.fn()
    const { rerender } = render(<Checkbox label="Click me" onChange={onChange} />)
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)
    expect(onChange).toHaveBeenCalled()

    rerender(<Checkbox label="Click me" disabled />)
    expect(checkbox).toBeDisabled()
  })
})
