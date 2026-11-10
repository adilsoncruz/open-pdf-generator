import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { Label } from './Label'

describe('Label atom', () => {
  it('renders default label and matches snapshot', () => {
    const { container } = render(<Label>Name</Label>)
    expect(container).toMatchSnapshot()
    expect(screen.getByText('Name')).toBeInTheDocument()
  })

  it('renders required asterisk and hint and matches snapshot', () => {
    const { container } = render(
      <Label required hint="optional">
        Email
      </Label>
    )
    expect(container).toMatchSnapshot()
    expect(screen.getByText('*')).toBeInTheDocument()
    expect(screen.getByText('(optional)')).toBeInTheDocument()
  })
})
