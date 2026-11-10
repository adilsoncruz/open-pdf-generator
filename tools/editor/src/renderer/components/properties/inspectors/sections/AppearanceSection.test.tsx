import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { AppearanceSection } from './AppearanceSection'
import type { Element } from '../../../../store/templateStore'

describe('AppearanceSection', () => {
  it('renders appearance settings for shape element and updates fill and stroke', () => {
    const onStyleUpdate = vi.fn()
    const element: Element = {
      type: 'rectangle',
      id: 'rect-1',
      style: {
        fillColor: '#ff0000',
        strokeColor: '#000000',
        strokeWidth: 2,
        borderStyle: 'solid',
        cornerRadius: 6,
      },
    }

    const { getByDisplayValue, container } = render(
      <AppearanceSection element={element} onStyleUpdate={onStyleUpdate} />
    )

    expect(getByDisplayValue('ff0000')).toBeInTheDocument()
    expect(container).toMatchSnapshot()

    // Stroke width input
    const strokeWidthInput = getByDisplayValue('2')
    fireEvent.change(strokeWidthInput, { target: { value: '4' } })
    expect(onStyleUpdate).toHaveBeenCalledWith({ strokeWidth: 4, borderWidth: 4 })

    // Border style select
    const borderStyleSelect = getByDisplayValue(/Sólida|Solid/i)
    fireEvent.change(borderStyleSelect, { target: { value: 'dashed' } })
    expect(onStyleUpdate).toHaveBeenCalledWith('borderStyle', 'dashed')

    // Corner radius input
    const cornerRadiusInput = getByDisplayValue('6')
    fireEvent.change(cornerRadiusInput, { target: { value: '12' } })
    expect(onStyleUpdate).toHaveBeenCalledWith('cornerRadius', 12)
  })

  it('handles fill color picker and hex text input for shape element', () => {
    const onStyleUpdate = vi.fn()
    const element: Element = {
      type: 'rectangle',
      id: 'rect-1',
      style: {
        fillColor: '#aabbcc',
      },
    }

    const { getByDisplayValue, container } = render(
      <AppearanceSection element={element} onStyleUpdate={onStyleUpdate} />
    )

    // Fill color picker
    const colorPickers = container.querySelectorAll('input[type="color"]')
    const fillColorPicker = colorPickers[0]
    fireEvent.change(fillColorPicker, { target: { value: '#112233' } })
    expect(onStyleUpdate).toHaveBeenCalledWith({ fillColor: '#112233', backgroundColor: '#112233' })

    // Fill hex input
    const hexInput = getByDisplayValue('aabbcc')
    fireEvent.change(hexInput, { target: { value: '334455' } })
    expect(onStyleUpdate).toHaveBeenCalledWith({ fillColor: '#334455', backgroundColor: '#334455' })
  })

  it('renders appearance settings for text element and updates color via picker and text input', () => {
    const onStyleUpdate = vi.fn()
    const element: Element = {
      type: 'text',
      id: 'text-1',
      style: {
        color: '#123456',
      },
    }

    const { getByDisplayValue, container } = render(
      <AppearanceSection element={element} onStyleUpdate={onStyleUpdate} />
    )

    expect(getByDisplayValue('123456')).toBeInTheDocument()
    expect(container).toMatchSnapshot()

    // Color picker
    const colorPicker = container.querySelector('input[type="color"]')!
    fireEvent.change(colorPicker, { target: { value: '#654321' } })
    expect(onStyleUpdate).toHaveBeenCalledWith('color', '#654321')

    // Hex input
    const hexInput = getByDisplayValue('123456')
    fireEvent.change(hexInput, { target: { value: 'abcdef' } })
    expect(onStyleUpdate).toHaveBeenCalledWith('color', '#abcdef')
  })

  it('toggles transparent fill on container or loop elements', () => {
    const onStyleUpdate = vi.fn()
    const element: Element = {
      type: 'container',
      id: 'c-1',
      style: {
        fillColor: 'transparent',
      },
    }

    const { getByRole, container } = render(
      <AppearanceSection element={element} onStyleUpdate={onStyleUpdate} />
    )

    expect(container).toMatchSnapshot()

    const checkbox = getByRole('checkbox')
    expect(checkbox).toBeChecked()

    // Uncheck transparent -> #ffffff
    fireEvent.click(checkbox)
    expect(onStyleUpdate).toHaveBeenCalledWith({ fillColor: '#ffffff', backgroundColor: '#ffffff' })
  })

  it('updates stroke color and border color pickers', () => {
    const onStyleUpdate = vi.fn()
    const element: Element = {
      type: 'circle',
      id: 'c-2',
      style: {
        strokeColor: '#333333',
        strokeWidth: 1,
      },
    }

    const { container } = render(
      <AppearanceSection element={element} onStyleUpdate={onStyleUpdate} />
    )

    const colorPickers = container.querySelectorAll('input[type="color"]')
    // [0]: fill, [1]: stroke, [2]: border
    const strokePicker = colorPickers[1]
    fireEvent.change(strokePicker, { target: { value: '#444444' } })
    expect(onStyleUpdate).toHaveBeenCalledWith({ strokeColor: '#444444', borderColor: '#444444' })

    const borderPicker = colorPickers[2]
    fireEvent.change(borderPicker, { target: { value: '#555555' } })
    expect(onStyleUpdate).toHaveBeenCalledWith({ borderColor: '#555555', strokeColor: '#555555' })
  })
})
