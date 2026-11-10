import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { MediaElementRenderer } from './MediaElementRenderer'
import type { Element } from '../../../store/templateStore'

describe('MediaElementRenderer', () => {
  it('renders image element with source and fallback placeholder', () => {
    const onMouseDown = vi.fn()
    const imgEl: Element = {
      type: 'image',
      id: 'img-1',
      x: 0,
      y: 0,
      width: 150,
      height: 100,
      source: 'https://example.com/photo.jpg',
      fit: 'cover',
      alignment: 'left',
    }

    const { getByRole, rerender, container } = render(
      <MediaElementRenderer
        element={imgEl}
        isSelected={true}
        onMouseDown={onMouseDown}
      />
    )

    const img = container.querySelector('img')
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg')
    fireEvent.mouseDown(container.firstElementChild as HTMLElement)
    expect(onMouseDown).toHaveBeenCalled()

    rerender(
      <MediaElementRenderer
        element={{ type: 'image', id: 'img-2', x: 0, y: 0, alignment: 'right' }}
        isSelected={false}
        onMouseDown={vi.fn()}
      />
    )
    expect(container.textContent).toMatch(/Image/i)
  })

  it('renders barcode element with 2D qr code and 1D barcode', () => {
    const qrEl: Element = {
      type: 'barcode',
      id: 'qr-1',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      barcodeType: 'qrcode',
      value: 'https://example.com',
      dataBinding: 'qrValue',
    }

    const { rerender, container } = render(
      <MediaElementRenderer
        element={qrEl}
        isSelected={false}
        onMouseDown={vi.fn()}
      />
    )
    expect(container.querySelector('svg')).toBeInTheDocument()

    const code128El: Element = {
      type: 'barcode',
      id: 'bar-1',
      x: 0,
      y: 0,
      width: 200,
      height: 60,
      barcodeType: 'code128',
      value: '1234567890',
    }

    rerender(
      <MediaElementRenderer
        element={code128El}
        isSelected={true}
        onMouseDown={vi.fn()}
      />
    )
    expect(container.textContent).toMatch(/1234567890/)

    // Null fallback on unknown element type
    const { container: emptyContainer } = render(
      <MediaElementRenderer
        element={{ type: 'unknown' as any, id: 'u-media' }}
        isSelected={false}
        onMouseDown={vi.fn()}
      />
    )
    expect(emptyContainer.firstChild).toBeNull()
  })
})
