import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import React from 'react'
import { WatermarkImageControls } from './WatermarkImageControls'
import { useTemplateStore } from '../../../../store/templateStore'

describe('WatermarkImageControls', () => {
  it('renders watermark image controls, matches snapshot, and removes image', () => {
    useTemplateStore.setState({
      template: {
        ...useTemplateStore.getState().template,
        pageSettings: {
          ...useTemplateStore.getState().template.pageSettings,
          watermark: {
            type: 'image',
            imageSource: 'data:image/png;base64,abcdef',
          },
        },
      },
    })

    const { getByText, getByRole, container } = render(<WatermarkImageControls />)

    expect(container).toMatchSnapshot()
    const img = getByRole('img')
    expect(img).toHaveAttribute('src', 'data:image/png;base64,abcdef')
    expect(getByText(/Base64/)).toBeInTheDocument()

    // Test onError on image
    fireEvent.error(img)
    expect(img.style.display).toBe('none')

    // Click "Substituir por Imagem Local"
    const replaceBtn = getByText('Substituir por Imagem Local')
    fireEvent.click(replaceBtn)

    const removeBtn = getByText('Remover')
    fireEvent.click(removeBtn)

    expect(useTemplateStore.getState().template.pageSettings.watermark?.imageSource).toBe('')
  })

  it('returns null when watermark is not defined', () => {
    useTemplateStore.setState({
      template: {
        ...useTemplateStore.getState().template,
        pageSettings: {
          ...useTemplateStore.getState().template.pageSettings,
          watermark: undefined,
        },
      },
    })

    const { container } = render(<WatermarkImageControls />)
    expect(container.firstChild).toBeNull()
  })

  it('renders empty image state, matches snapshot, and handles file upload via FileReader', () => {
    useTemplateStore.setState({
      template: {
        ...useTemplateStore.getState().template,
        pageSettings: {
          ...useTemplateStore.getState().template.pageSettings,
          watermark: {
            type: 'image',
            imageSource: '',
          },
        },
      },
    })

    const { getByText, container } = render(<WatermarkImageControls />)
    expect(container).toMatchSnapshot()

    const browseBtn = getByText('Procurar Imagem Local')
    fireEvent.click(browseBtn)

    // Simulate FileReader
    class MockFileReader {
      result: string = ''
      onload: (() => void) | null = null
      readAsDataURL() {
        this.result = 'data:image/png;base64,wmloaded'
        if (this.onload) this.onload()
      }
    }
    const originalFileReader = window.FileReader
    window.FileReader = MockFileReader as any

    try {
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['dummy'], 'wm.png', { type: 'image/png' })
      fireEvent.change(fileInput, { target: { files: [file] } })
      expect(useTemplateStore.getState().template.pageSettings.watermark?.imageSource).toBe(
        'data:image/png;base64,wmloaded'
      )

      // Empty files
      fireEvent.change(fileInput, { target: { files: [] } })
    } finally {
      window.FileReader = originalFileReader
    }
  })

  it('handles remote URL, width/height changes and clearing, and clipboard copy', () => {
    const writeTextSpy = vi.fn()
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextSpy,
      },
    })

    useTemplateStore.setState({
      template: {
        ...useTemplateStore.getState().template,
        pageSettings: {
          ...useTemplateStore.getState().template.pageSettings,
          watermark: {
            type: 'image',
            imageSource: 'https://example.com/logo.png',
            width: 200,
            height: 100,
          },
        },
      },
    })

    const { getByDisplayValue, unmount } = render(<WatermarkImageControls />)

    const urlInput = getByDisplayValue('https://example.com/logo.png')
    fireEvent.change(urlInput, { target: { value: 'https://example.com/updated.png' } })
    expect(useTemplateStore.getState().template.pageSettings.watermark?.imageSource).toBe('https://example.com/updated.png')

    const widthInput = getByDisplayValue('200')
    fireEvent.change(widthInput, { target: { value: '250' } })
    expect(useTemplateStore.getState().template.pageSettings.watermark?.width).toBe(250)

    // Clear width
    fireEvent.change(widthInput, { target: { value: '' } })
    expect(useTemplateStore.getState().template.pageSettings.watermark?.width).toBeUndefined()

    const heightInput = getByDisplayValue('100')
    fireEvent.change(heightInput, { target: { value: '150' } })
    expect(useTemplateStore.getState().template.pageSettings.watermark?.height).toBe(150)

    // Clear height
    fireEvent.change(heightInput, { target: { value: '' } })
    expect(useTemplateStore.getState().template.pageSettings.watermark?.height).toBeUndefined()

    unmount()

    // Test copy base64 when imageSource is base64
    useTemplateStore.setState({
      template: {
        ...useTemplateStore.getState().template,
        pageSettings: {
          ...useTemplateStore.getState().template.pageSettings,
          watermark: {
            type: 'image',
            imageSource: 'data:image/png;base64,copytest',
          },
        },
      },
    })
    const { getByTitle } = render(<WatermarkImageControls />)
    const copyBtn = getByTitle('Copiar Base64')
    fireEvent.click(copyBtn)
    expect(writeTextSpy).toHaveBeenCalledWith('data:image/png;base64,copytest')
  })
})
