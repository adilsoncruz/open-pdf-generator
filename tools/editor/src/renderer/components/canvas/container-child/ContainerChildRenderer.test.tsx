import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { ContainerChildRenderer } from './ContainerChildRenderer'
import type { Element } from '../../../store/templateStore'

describe('ContainerChildRenderer', () => {
  const resolve = (val: any) => (typeof val === 'number' ? val : 50)

  it('renders editing textarea when isEditingText is true', () => {
    const onTextChange = vi.fn()
    const onTextBlur = vi.fn()
    const { getByRole } = render(
      <ContainerChildRenderer
        child={{ type: 'text', id: 't-edit', width: 100, height: 30 }}
        containerWidth={400}
        containerHeight={300}
        resolveWidth={resolve}
        resolveHeight={resolve}
        isEditingText={true}
        editingValue="Current text"
        onTextChange={onTextChange}
        onTextBlur={onTextBlur}
      />
    )

    const textarea = getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'New text' } })
    expect(onTextChange).toHaveBeenCalledWith('New text')
    fireEvent.blur(textarea)
    expect(onTextBlur).toHaveBeenCalled()
  })

  it('renders all element types inside container', () => {
    const elements: Element[] = [
      { type: 'text', id: 'c-text', value: 'Hello Text' },
      { type: 'link', id: 'c-link', value: 'https://openpdf.dev' },
      { type: 'image', id: 'c-img', width: 60, height: 60 },
      { type: 'rectangle', id: 'c-rect', width: 80, height: 40 },
      { type: 'spacer', id: 'c-spacer', height: 20 },
      { type: 'line', id: 'c-line', width: 120 },
      { type: 'barcode', id: 'c-bc-2d', barcodeType: 'qrcode' },
      { type: 'barcode', id: 'c-bc-1d', barcodeType: 'code128', value: '987654321' },
      { type: 'list', id: 'c-list', items: ['A', 'B'] },
      { type: 'table', id: 'c-table', columns: [] } as any,
      { type: 'loop', id: 'c-loop', elements: [] },
    ]

    for (const child of elements) {
      const { unmount, container } = render(
        <ContainerChildRenderer
          child={child}
          containerWidth={400}
          containerHeight={300}
          resolveWidth={resolve}
          resolveHeight={resolve}
        />
      )
      expect(container.firstChild).toBeInTheDocument()
      unmount()
    }
  })
})
