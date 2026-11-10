import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { ColorInput } from './ColorInput'

describe('ColorInput atom', () => {
  it('renders correctly with hex display and matches snapshot', () => {
    const { container } = render(<ColorInput value="#ff5500" showHex={true} onChange={() => {}} />)
    expect(container).toMatchSnapshot()
    expect(screen.getByText('#FF5500')).toBeInTheDocument()
  })

  it('renders without hex display and handles change event', () => {
    const onChange = vi.fn()
    const { container } = render(<ColorInput value="#00aa00" showHex={false} onChange={onChange} />)
    expect(container).toMatchSnapshot()
    expect(screen.queryByText('#00AA00')).not.toBeInTheDocument()

    const input = container.querySelector('input[type="color"]')!
    fireEvent.change(input, { target: { value: '#123456' } })
    expect(onChange).toHaveBeenCalled()
  })
})
