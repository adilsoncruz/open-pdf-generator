import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { ContainerPropertiesSection } from './ContainerPropertiesSection'
import type { Element } from '../../../../store/templateStore'

describe('ContainerPropertiesSection', () => {
  it('renders nothing for non-container element', () => {
    const onUpdate = vi.fn()
    const element: Element = {
      id: 'el-text',
      type: 'text',
      x: 0,
      y: 0,
    }

    const { container } = render(
      <ContainerPropertiesSection element={element} onUpdate={onUpdate} />
    )
    expect(container.textContent).toBe('')
  })

  it('renders container settings and updates container name and height mode', () => {
    const onUpdate = vi.fn()
    const element: Element = {
      id: 'el-c1',
      type: 'container',
      name: 'Main Container',
      x: 0,
      y: 0,
      autoHeight: true,
      heightMode: 'auto',
    }

    const { getByDisplayValue, getByText, container } = render(
      <ContainerPropertiesSection element={element} onUpdate={onUpdate} />
    )

    expect(container).toMatchSnapshot()

    const nameInput = getByDisplayValue('Main Container')
    fireEvent.change(nameInput, { target: { value: 'Header Container' } })
    expect(onUpdate).toHaveBeenCalledWith('name', 'Header Container')

    // Click Fixed-Height
    fireEvent.click(getByText('Fixed-Height'))
    expect(onUpdate).toHaveBeenCalledWith({
      heightMode: 'fixed',
      autoHeight: false,
    })

    // Click Auto-Height
    fireEvent.click(getByText('Auto-Height'))
    expect(onUpdate).toHaveBeenCalledWith({
      heightMode: 'auto',
      autoHeight: true,
    })
  })

  it('handles pageBreakBefore toggle and condition input', () => {
    const onUpdate = vi.fn()
    const element: Element = {
      id: 'el-c2',
      type: 'container',
      x: 0,
      y: 0,
      pageBreakBefore: true,
      pageBreakCondition: 'total > 1000',
    }

    const { getByRole, getByDisplayValue, getByText } = render(
      <ContainerPropertiesSection element={element} onUpdate={onUpdate} />
    )

    const checkbox = getByRole('checkbox')
    expect(checkbox).toBeChecked()
    fireEvent.click(checkbox)
    expect(onUpdate).toHaveBeenCalledWith('pageBreakBefore', false)

    const condInput = getByDisplayValue('total > 1000')
    fireEvent.change(condInput, { target: { value: 'pageNumber == 1' } })
    expect(onUpdate).toHaveBeenCalledWith('pageBreakCondition', 'pageNumber == 1')

    // Preset button click
    fireEvent.click(getByText('items.length > 5'))
    expect(onUpdate).toHaveBeenCalledWith('pageBreakCondition', 'items.length > 5')

    // Clear condition button
    fireEvent.click(getByText('✕'))
    expect(onUpdate).toHaveBeenCalledWith('pageBreakCondition', null)
  })
})
