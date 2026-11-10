import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { CanvasWatermark } from './CanvasWatermark'

describe('CanvasWatermark', () => {
  const pageSize = { width: 595, height: 842 }

  it('renders text watermark single and repeated', () => {
    const { getByText, getAllByText, rerender } = render(
      <CanvasWatermark
        watermark={{
          type: 'text',
          text: 'CONFIDENCIAL',
          rotation: 45,
          opacity: 0.3,
          fontSize: 48,
          color: '#ff0000',
          repeat: false,
        }}
        pageSize={pageSize}
        totalCanvasHeight={842}
        numberOfPages={1}
        bodyUsableHeight={700}
      />
    )

    expect(getByText('CONFIDENCIAL')).toBeInTheDocument()

    rerender(
      <CanvasWatermark
        watermark={{
          type: 'text',
          text: 'RASCUNHO',
          repeat: true,
          spacingX: 100,
          spacingY: 100,
        }}
        pageSize={pageSize}
        totalCanvasHeight={1684}
        numberOfPages={2}
        bodyUsableHeight={700}
      />
    )

    expect(getAllByText('RASCUNHO').length).toBeGreaterThan(0)
  })

  it('renders image watermark single and repeated', () => {
    const { getByRole, getAllByRole, rerender } = render(
      <CanvasWatermark
        watermark={{
          type: 'image',
          imageSource: 'data:image/png;base64,abc',
          repeat: false,
          width: 200,
          height: 100,
        }}
        pageSize={pageSize}
        totalCanvasHeight={842}
        numberOfPages={1}
        bodyUsableHeight={700}
      />
    )

    expect(getByRole('img')).toHaveAttribute('src', 'data:image/png;base64,abc')

    rerender(
      <CanvasWatermark
        watermark={{
          type: 'image',
          imageSource: 'https://example.com/logo.png',
          repeat: true,
        }}
        pageSize={pageSize}
        totalCanvasHeight={842}
        numberOfPages={1}
        bodyUsableHeight={700}
      />
    )

    expect(getAllByRole('img').length).toBeGreaterThan(0)
  })
})
