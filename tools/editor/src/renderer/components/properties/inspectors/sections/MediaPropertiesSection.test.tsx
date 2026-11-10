import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/react'
import { MediaPropertiesSection } from './MediaPropertiesSection'
import type { Element } from '../../../../store/templateStore'

describe('MediaPropertiesSection', () => {
  it('renders image controls with remove and fit changes', () => {
    const onUpdate = vi.fn()
    const onStyleUpdate = vi.fn()

    const imgEl: Element = {
      type: 'image',
      id: 'img-1',
      url: 'data:image/png;base64,123456',
      fit: 'contain',
      alignment: 'center',
    }

    const { getByText, getByDisplayValue, container, getByAltText } = render(
      <MediaPropertiesSection
        element={imgEl}
        onUpdate={onUpdate}
        onStyleUpdate={onStyleUpdate}
      />
    )

    expect(container).toMatchSnapshot()
    expect(getByText(/Base64/)).toBeInTheDocument()

    // Test img onError handler
    const imgTag = getByAltText('Preview')
    fireEvent.error(imgTag)
    expect(imgTag.style.display).toBe('none')

    // Click "Substituir por Imagem Local"
    const replaceBtn = getByText('Substituir por Imagem Local')
    fireEvent.click(replaceBtn)

    // Remove image
    const removeBtn = getByText('Remover')
    fireEvent.click(removeBtn)
    expect(onUpdate).toHaveBeenCalledWith({ url: '', value: '', source: '' })

    // Change fit
    const fitSelect = getByDisplayValue('Contain')
    fireEvent.change(fitSelect, { target: { value: 'cover' } })
    expect(onUpdate).toHaveBeenCalledWith('fit', 'cover')
  })

  it('renders barcode controls and updates barcode format, value, and QR error correction', () => {
    const onUpdate = vi.fn()
    const onStyleUpdate = vi.fn()

    const barcodeEl: Element = {
      type: 'barcode',
      id: 'bar-1',
      barcodeType: 'qrcode',
      value: 'https://example.com',
      style: {
        errorCorrection: 'M',
      },
    }

    const { getByDisplayValue, getByText } = render(
      <MediaPropertiesSection
        element={barcodeEl}
        onUpdate={onUpdate}
        onStyleUpdate={onStyleUpdate}
      />
    )

    const formatSelect = getByDisplayValue(/QR Code/)
    fireEvent.change(formatSelect, { target: { value: 'code128' } })
    expect(onUpdate).toHaveBeenCalledWith('barcodeType', 'code128')

    const input = getByDisplayValue('https://example.com')
    fireEvent.change(input, { target: { value: '12345678' } })
    expect(onUpdate).toHaveBeenCalledWith({ value: '12345678', dataBinding: '12345678' })

    // QR error correction
    const errorCorrectionSelect = screen.getByDisplayValue(/Média \(M - 15%\)/)
    fireEvent.change(errorCorrectionSelect, { target: { value: 'H' } })
    expect(onStyleUpdate).toHaveBeenCalledWith('errorCorrection', 'H')
  })

  it('renders remote image URL and handles empty image upload and clipboard copy', () => {
    const onUpdate = vi.fn()
    const onStyleUpdate = vi.fn()

    const remoteImgEl: Element = {
      type: 'image',
      id: 'img-remote',
      url: 'https://example.com/logo.png',
      fit: 'cover',
      alignment: 'left',
    }

    const { getByText, getByDisplayValue } = render(
      <MediaPropertiesSection
        element={remoteImgEl}
        onUpdate={onUpdate}
        onStyleUpdate={onStyleUpdate}
      />
    )

    expect(getByText('Remoto / URL')).toBeInTheDocument()
    const urlInput = getByDisplayValue('https://example.com/logo.png')
    fireEvent.change(urlInput, { target: { value: 'https://example.com/new.png' } })
    expect(onUpdate).toHaveBeenCalledWith({
      url: 'https://example.com/new.png',
      value: 'https://example.com/new.png',
      source: 'https://example.com/new.png',
    })

    const alignSelect = getByDisplayValue('Esquerda')
    fireEvent.change(alignSelect, { target: { value: 'right' } })
    expect(onUpdate).toHaveBeenCalledWith('alignment', 'right')
  })

  it('renders empty image with upload button and handles file reader simulation', () => {
    const onUpdate = vi.fn()
    const onStyleUpdate = vi.fn()
    const emptyImgEl: Element = {
      type: 'image',
      id: 'img-empty',
      url: '',
    }

    const { getByText, container } = render(
      <MediaPropertiesSection
        element={emptyImgEl}
        onUpdate={onUpdate}
        onStyleUpdate={onStyleUpdate}
      />
    )

    const searchBtn = getByText('Procurar Imagem Local')
    fireEvent.click(searchBtn)

    // Simulate FileReader
    class MockFileReader {
      result: string = ''
      onload: (() => void) | null = null
      readAsDataURL() {
        this.result = 'data:image/png;base64,mocked'
        if (this.onload) this.onload()
      }
    }
    const originalFileReader = window.FileReader
    window.FileReader = MockFileReader as any

    try {
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['mock'], 'mock.png', { type: 'image/png' })
      fireEvent.change(fileInput, { target: { files: [file] } })
      expect(onUpdate).toHaveBeenCalledWith({
        url: 'data:image/png;base64,mocked',
        value: 'data:image/png;base64,mocked',
        source: 'data:image/png;base64,mocked',
      })

      // Change with no files
      fireEvent.change(fileInput, { target: { files: [] } })
    } finally {
      window.FileReader = originalFileReader
    }
  })

  it('copies base64 to clipboard', () => {
    const onUpdate = vi.fn()
    const onStyleUpdate = vi.fn()
    const writeTextSpy = vi.fn()
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextSpy,
      },
    })

    const base64Img: Element = {
      type: 'image',
      id: 'img-b64',
      url: 'data:image/png;base64,samplebase64',
    }

    const { getByTitle } = render(
      <MediaPropertiesSection
        element={base64Img}
        onUpdate={onUpdate}
        onStyleUpdate={onStyleUpdate}
      />
    )

    const copyBtn = getByTitle('Copiar Base64')
    fireEvent.click(copyBtn)
    expect(writeTextSpy).toHaveBeenCalledWith('data:image/png;base64,samplebase64')
  })
})
