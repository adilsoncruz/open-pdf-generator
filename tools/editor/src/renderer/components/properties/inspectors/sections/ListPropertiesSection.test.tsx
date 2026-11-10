import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { ListPropertiesSection } from './ListPropertiesSection'
import type { Element } from '../../../../store/templateStore'

describe('ListPropertiesSection', () => {
  it('renders list settings and handles dataBinding, items, style updates', () => {
    const onUpdate = vi.fn()
    const onStyleUpdate = vi.fn()

    const listEl: Element = {
      type: 'list',
      id: 'list-1',
      x: 0,
      y: 0,
      width: 200,
      height: 80,
      dataBinding: 'users',
      items: ['Item A', 'Item B'],
      listStyle: 'BULLETED',
      itemSpacing: 8,
      startY: 20,
      style: {
        fillColor: '#ffffff',
        backgroundColor: '#ffffff',
      },
    }

    const { getByPlaceholderText, getByDisplayValue, getByText, rerender, container } = render(
      <ListPropertiesSection
        element={listEl}
        onUpdate={onUpdate}
        onStyleUpdate={onStyleUpdate}
      />
    )

    // Data binding change
    const dbInput = getByPlaceholderText('ex: items ou pedido.itens')
    fireEvent.change(dbInput, { target: { value: 'orders.items' } })
    expect(onUpdate).toHaveBeenCalledWith('dataBinding', 'orders.items')

    // Items textarea change
    const textarea = getByPlaceholderText(/teste 1/)
    fireEvent.change(textarea, { target: { value: 'Line 1\nLine 2' } })
    expect(onUpdate).toHaveBeenCalledWith('items', ['Line 1', 'Line 2'])

    // Transparent button toggle
    const transBtn = getByText('Tornar Transparente')
    fireEvent.click(transBtn)
    expect(onStyleUpdate).toHaveBeenCalledWith({
      backgroundColor: 'transparent',
      fillColor: 'transparent',
    })

    // Height change
    const heightInput = getByDisplayValue('80')
    fireEvent.change(heightInput, { target: { value: '95' } })
    expect(onUpdate).toHaveBeenCalledWith('height', 95)

    // Width change
    const widthInput = getByDisplayValue('200')
    fireEvent.change(widthInput, { target: { value: '250' } })
    expect(onUpdate).toHaveBeenCalledWith('width', 250)

    // Color picker input change
    const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement
    fireEvent.change(colorInput, { target: { value: '#ff0000' } })
    expect(onStyleUpdate).toHaveBeenCalledWith({
      backgroundColor: '#ff0000',
      fillColor: '#ff0000',
    })

    // List text input for background color
    const listBgText = getByPlaceholderText('transparent ou #RRGGBB')
    fireEvent.change(listBgText, { target: { value: '#001122' } })
    expect(onStyleUpdate).toHaveBeenCalledWith({
      backgroundColor: '#001122',
      fillColor: '#001122',
    })

    // List style change
    const listStyleSelect = getByDisplayValue(/Marcador Bullet/)
    fireEvent.change(listStyleSelect, { target: { value: 'NUMBERED' } })
    expect(onUpdate).toHaveBeenCalledWith('listStyle', 'NUMBERED')

    // Espaçamento & startY change
    const spacingInput = getByDisplayValue('8')
    fireEvent.change(spacingInput, { target: { value: '12' } })
    expect(onUpdate).toHaveBeenCalledWith('itemSpacing', 12)

    const startYInput = getByDisplayValue('20')
    fireEvent.change(startYInput, { target: { value: '35' } })
    expect(onUpdate).toHaveBeenCalledWith('startY', 35)

    // Clear startY
    fireEvent.change(startYInput, { target: { value: '' } })
    expect(onUpdate).toHaveBeenCalledWith('startY', undefined)

    // Fallback when element is not list
    rerender(
      <ListPropertiesSection
        element={{ type: 'text', id: 't1' }}
        onUpdate={onUpdate}
      />
    )
    expect(getByPlaceholderText).toThrow()
  })

  it('renders check_list settings with 100% width, array items, background inputs, and snapshot', () => {
    const onUpdate = vi.fn()
    const checkListEl: Element = {
      type: 'check_list',
      id: 'cl-1',
      x: 0,
      y: 0,
      width: '100%',
      height: 100,
      dataBinding: 'tasks',
      checkStyle: 'RECTANGLE',
      items: ['[X] Task A', '[ ] Task B', 'Task C'],
      itemSpacing: 6,
      style: {
        backgroundColor: '#123456',
        fillColor: '#123456',
      },
    }

    const { getByPlaceholderText, getByDisplayValue, getByText, container, rerender } = render(
      <ListPropertiesSection
        element={checkListEl}
        onUpdate={onUpdate}
      />
    )

    expect(container).toMatchSnapshot()

    // 100% width badge
    expect(getByText('100%')).toBeInTheDocument()

    // Textarea with array items
    const textarea = getByPlaceholderText(/Primeira tarefa/)
    fireEvent.change(textarea, { target: { value: '[x] Done\n[ ] Todo\nRegular' } })
    expect(onUpdate).toHaveBeenCalledWith('items', {
      Done: true,
      Todo: false,
      Regular: false,
    })

    // Select checkStyle
    const select = getByDisplayValue(/Quadrada/i)
    fireEvent.change(select, { target: { value: 'CIRCLE' } })
    expect(onUpdate).toHaveBeenCalledWith('checkStyle', 'CIRCLE')

    // Item spacing and startY
    const spacingInput = getByDisplayValue('6')
    fireEvent.change(spacingInput, { target: { value: '10' } })
    expect(onUpdate).toHaveBeenCalledWith('itemSpacing', 10)

    // Checklist color picker and height
    const clColor = container.querySelector('input[type="color"]') as HTMLInputElement
    fireEvent.change(clColor, { target: { value: '#00ff00' } })
    expect(onUpdate).toHaveBeenCalledWith('style', expect.objectContaining({ backgroundColor: '#00ff00' }))

    const clHeight = getByDisplayValue('100')
    fireEvent.change(clHeight, { target: { value: '120' } })
    expect(onUpdate).toHaveBeenCalledWith('height', 120)

    // Checklist startY
    const clStartY = getByPlaceholderText('Auto')
    fireEvent.change(clStartY, { target: { value: '40' } })
    expect(onUpdate).toHaveBeenCalledWith('startY', 40)

    // Data binding change
    const dbInput = getByPlaceholderText('ex: tasks ou checklist')
    fireEvent.change(dbInput, { target: { value: 'myTasks' } })
    expect(onUpdate).toHaveBeenCalledWith('dataBinding', 'myTasks')

    // Bg color text input
    const bgTextInput = getByPlaceholderText('transparent ou #RRGGBB')
    fireEvent.change(bgTextInput, { target: { value: '#abcdef' } })
    expect(onUpdate).toHaveBeenCalledWith('style', expect.objectContaining({ backgroundColor: '#abcdef' }))

    // Transparent button toggle without onStyleUpdate
    const transBtn = getByText('Tornar Transparente')
    fireEvent.click(transBtn)
    expect(onUpdate).toHaveBeenCalledWith('style', expect.objectContaining({ backgroundColor: 'transparent' }))

    // Rerender as transparent to test "Transparente ✓"
    rerender(
      <ListPropertiesSection
        element={{
          ...checkListEl,
          style: { backgroundColor: 'transparent' },
        }}
        onUpdate={onUpdate}
      />
    )
    const toggleToWhite = getByText('Transparente ✓')
    fireEvent.click(toggleToWhite)
    expect(onUpdate).toHaveBeenCalledWith('style', expect.objectContaining({ backgroundColor: '#ffffff' }))

    // Rerender with numeric width to test width input onChange
    rerender(
      <ListPropertiesSection
        element={{
          ...checkListEl,
          width: 300,
        }}
        onUpdate={onUpdate}
      />
    )
    const clWidthInput = getByDisplayValue('300')
    fireEvent.change(clWidthInput, { target: { value: '350' } })
    expect(onUpdate).toHaveBeenCalledWith('width', 350)
  })
})
