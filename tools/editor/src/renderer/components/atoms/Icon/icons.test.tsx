import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { icons } from './icons'

describe('Icon icons map', () => {
  it('renders all icon SVGs successfully', () => {
    Object.entries(icons).forEach(([name, IconComponent]) => {
      const { container } = render(<IconComponent className="test-icon" />)
      const svg = container.querySelector('svg')
      expect(svg, `Icon ${name} should render an svg element`).toBeInTheDocument()
    })
  })
})
