import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { TextSpacingAndContentControls } from './TextSpacingAndContentControls'
import type { Element } from '../../../../../store/templateStore'

describe('TextSpacingAndContentControls', () => {
  const baseElement: Element = {
    id: 'el-1',
    type: 'text',
    name: 'Text 1',
    page: 1,
    x: 0,
    y: 0,
    width: 100,
    height: 30,
    style: {
      multiline: false,
    },
  }

  it('renders correctly and matches snapshot when multiline is false', () => {
    const onUpdate = vi.fn()
    const onStyleUpdate = vi.fn()

    const { container } = render(
      <TextSpacingAndContentControls
        element={baseElement}
        onUpdate={onUpdate}
        onStyleUpdate={onStyleUpdate}
      />
    )

    expect(container).toMatchSnapshot()
    expect(screen.getByTestId('multiline-checkbox')).not.toBeChecked()
    expect(screen.queryByTestId('first-line-indent-input')).not.toBeInTheDocument()
  })

  it('renders and matches snapshot when multiline is true and element is link', () => {
    const linkElement: Element = {
      ...baseElement,
      type: 'link',
      value: 'Click here',
      url: 'https://example.com',
      style: {
        multiline: true,
        lineHeight: 1.5,
        firstLineIndent: 10,
        overflow: 'hidden',
        paddingTop: 5,
        paddingRight: 6,
        paddingBottom: 7,
        paddingLeft: 8,
      },
    }

    const onUpdate = vi.fn()
    const onStyleUpdate = vi.fn()

    const { container } = render(
      <TextSpacingAndContentControls
        element={linkElement}
        onUpdate={onUpdate}
        onStyleUpdate={onStyleUpdate}
      />
    )

    expect(container).toMatchSnapshot()
    expect(screen.getByTestId('multiline-checkbox')).toBeChecked()
    expect(screen.getByTestId('first-line-indent-input')).toHaveValue(10)
    expect(screen.getByTestId('overflow-select')).toHaveValue('hidden')
    expect(screen.getByTestId('text-content-textarea')).toHaveValue('Click here')
    expect(screen.getByTestId('target-url-input')).toHaveValue('https://example.com')
  })

  it('handles multiline and spacing inputs change events', () => {
    const onUpdate = vi.fn()
    const onStyleUpdate = vi.fn()

    render(
      <TextSpacingAndContentControls
        element={{
          ...baseElement,
          style: {
            multiline: true,
          },
        }}
        onUpdate={onUpdate}
        onStyleUpdate={onStyleUpdate}
      />
    )

    // Toggle multiline
    fireEvent.click(screen.getByTestId('multiline-checkbox'))
    expect(onStyleUpdate).toHaveBeenCalledWith('multiline', false)

    // Line height
    const inputs = screen.getAllByRole('spinbutton')
    // LineHeight is first spinbutton
    fireEvent.change(inputs[0], { target: { value: '1.8' } })
    expect(onStyleUpdate).toHaveBeenCalledWith('lineHeight', 1.8)

    // First line indent
    fireEvent.change(screen.getByTestId('first-line-indent-input'), { target: { value: '12' } })
    expect(onStyleUpdate).toHaveBeenCalledWith('firstLineIndent', 12)

    // Overflow
    fireEvent.change(screen.getByTestId('overflow-select'), { target: { value: 'auto' } })
    expect(onStyleUpdate).toHaveBeenCalledWith('overflow', 'auto')

    // Top padding
    fireEvent.change(screen.getByTestId('padding-top-input'), { target: { value: '4' } })
    expect(onStyleUpdate).toHaveBeenCalledWith('paddingTop', 4)
    expect(onStyleUpdate).toHaveBeenCalledWith('marginTop', 4)

    // Right padding
    fireEvent.change(screen.getByTestId('padding-right-input'), { target: { value: '8' } })
    expect(onStyleUpdate).toHaveBeenCalledWith('paddingRight', 8)
    expect(onStyleUpdate).toHaveBeenCalledWith('marginRight', 8)

    // Bottom padding
    fireEvent.change(screen.getByTestId('padding-bottom-input'), { target: { value: '10' } })
    expect(onStyleUpdate).toHaveBeenCalledWith('paddingBottom', 10)
    expect(onStyleUpdate).toHaveBeenCalledWith('marginBottom', 10)

    // Left padding
    fireEvent.change(screen.getByTestId('padding-left-input'), { target: { value: '6' } })
    expect(onStyleUpdate).toHaveBeenCalledWith('paddingLeft', 6)
    expect(onStyleUpdate).toHaveBeenCalledWith('marginLeft', 6)
  })

  it('handles content textarea and link url change', () => {
    const onUpdate = vi.fn()
    const onStyleUpdate = vi.fn()

    render(
      <TextSpacingAndContentControls
        element={{
          ...baseElement,
          type: 'link',
          value: 'Old value',
          url: 'https://old.com',
        }}
        onUpdate={onUpdate}
        onStyleUpdate={onStyleUpdate}
      />
    )

    fireEvent.change(screen.getByTestId('text-content-textarea'), { target: { value: 'New text' } })
    expect(onUpdate).toHaveBeenCalledWith('value', 'New text')

    fireEvent.change(screen.getByTestId('target-url-input'), { target: { value: 'https://new.com' } })
    expect(onUpdate).toHaveBeenCalledWith('url', 'https://new.com')
  })
})
