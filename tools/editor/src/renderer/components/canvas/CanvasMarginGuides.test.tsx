import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  CanvasMarginGuides,
  PageSeparators,
  MarginLinesOverlay,
  CanvasGridOverlay,
  MarginLabelsOverlay,
} from './CanvasMarginGuides'

describe('CanvasMarginGuides and Subcomponents', () => {
  const defaultProps = {
    pageSize: { width: 595, height: 842 },
    margins: { top: 30, right: 25, bottom: 35, left: 20 },
    totalCanvasHeight: 842,
    marginSnap: { top: false, right: false, bottom: false, left: false },
  }

  describe('PageSeparators', () => {
    it('does not render any separator when numberOfPages <= 1', () => {
      const { container } = render(
        <PageSeparators
          numberOfPages={1}
          marginTop={30}
          headerHeight={50}
          bodyUsableHeight={700}
        />
      )
      expect(container.firstChild).toBeNull()
      expect(screen.queryByTestId('page-separator')).toBeNull()
    })

    it('renders separators when numberOfPages > 1', () => {
      render(
        <PageSeparators
          numberOfPages={3}
          marginTop={30}
          headerHeight={50}
          bodyUsableHeight={700}
          pageLabel="Folha"
        />
      )

      const separators = screen.getAllByTestId('page-separator')
      expect(separators).toHaveLength(2)
      expect(screen.getByText('Folha 2')).toBeInTheDocument()
      expect(screen.getByText('Folha 3')).toBeInTheDocument()

      expect(separators[0]).toHaveStyle({ top: `${30 + 50 + 1 * 700}px` })
      expect(separators[1]).toHaveStyle({ top: `${30 + 50 + 2 * 700}px` })
    })
  })

  describe('MarginLinesOverlay', () => {
    it('renders normal margin lines when no snap is active', () => {
      render(
        <MarginLinesOverlay
          pageSize={{ width: 600, height: 800 }}
          margins={{ top: 40, right: 30, bottom: 50, left: 20 }}
          totalCanvasHeight={800}
          marginSnap={{ top: false, right: false, bottom: false, left: false }}
        />
      )

      const topLine = screen.getByTestId('margin-line-top')
      expect(topLine).toHaveAttribute('y1', '40')
      expect(topLine).toHaveAttribute('y2', '40')
      expect(topLine).toHaveAttribute('stroke', '#3b82f6')
      expect(topLine).toHaveAttribute('stroke-width', '1')

      const bottomLine = screen.getByTestId('margin-line-bottom')
      expect(bottomLine).toHaveAttribute('y1', '750')
      expect(bottomLine).toHaveAttribute('y2', '750')

      const leftLine = screen.getByTestId('margin-line-left')
      expect(leftLine).toHaveAttribute('x1', '20')
      expect(leftLine).toHaveAttribute('x2', '20')

      const rightLine = screen.getByTestId('margin-line-right')
      expect(rightLine).toHaveAttribute('x1', '570')
      expect(rightLine).toHaveAttribute('x2', '570')
    })

    it('renders snap highlighted margin lines when marginSnap is active', () => {
      render(
        <MarginLinesOverlay
          pageSize={{ width: 600, height: 800 }}
          margins={{ top: 40, right: 30, bottom: 50, left: 20 }}
          totalCanvasHeight={800}
          marginSnap={{ top: true, right: true, bottom: true, left: true }}
        />
      )

      const topLine = screen.getByTestId('margin-line-top')
      expect(topLine).toHaveAttribute('stroke', '#10b981')
      expect(topLine).toHaveAttribute('stroke-width', '2')

      const bottomLine = screen.getByTestId('margin-line-bottom')
      expect(bottomLine).toHaveAttribute('stroke', '#10b981')
      expect(bottomLine).toHaveAttribute('stroke-width', '2')

      const leftLine = screen.getByTestId('margin-line-left')
      expect(leftLine).toHaveAttribute('stroke', '#10b981')

      const rightLine = screen.getByTestId('margin-line-right')
      expect(rightLine).toHaveAttribute('stroke', '#10b981')
    })

    it('renders header and footer delimiter lines for standard page', () => {
      render(
        <MarginLinesOverlay
          pageSize={{ width: 600, height: 800 }}
          margins={{ top: 40, right: 30, bottom: 50, left: 20 }}
          totalCanvasHeight={800}
          headerConfig={{ height: 60 }}
          footerConfig={{ height: 45 }}
          marginSnap={{ top: false, right: false, bottom: false, left: false }}
          isSummary={false}
        />
      )

      const headerLine = screen.getByTestId('header-end-line')
      expect(headerLine).toHaveAttribute('y1', '100') // 40 + 60
      expect(headerLine).toHaveAttribute('y2', '100')

      const footerLine = screen.getByTestId('footer-start-line')
      expect(footerLine).toHaveAttribute('y1', '705') // 800 - 50 - 45
      expect(footerLine).toHaveAttribute('y2', '705')
    })

    it('does not render header and footer delimiter lines when isSummary is true', () => {
      render(
        <MarginLinesOverlay
          pageSize={{ width: 600, height: 800 }}
          margins={{ top: 40, right: 30, bottom: 50, left: 20 }}
          totalCanvasHeight={800}
          headerConfig={{ height: 60 }}
          footerConfig={{ height: 45 }}
          marginSnap={{ top: false, right: false, bottom: false, left: false }}
          isSummary={true}
        />
      )

      expect(screen.queryByTestId('header-end-line')).toBeNull()
      expect(screen.queryByTestId('footer-start-line')).toBeNull()
    })
  })

  describe('CanvasGridOverlay', () => {
    it('renders svg grid pattern with default 50pt size', () => {
      render(<CanvasGridOverlay />)

      const overlay = screen.getByTestId('canvas-grid-overlay')
      expect(overlay).toBeInTheDocument()
      expect(overlay.querySelector('pattern#grid')).toHaveAttribute('width', '50')
      expect(overlay.querySelector('pattern#grid')).toHaveAttribute('height', '50')
    })

    it('supports custom gridSize and patternId', () => {
      render(<CanvasGridOverlay gridSize={25} patternId="custom-grid" />)

      const overlay = screen.getByTestId('canvas-grid-overlay')
      expect(overlay.querySelector('pattern#custom-grid')).toHaveAttribute('width', '25')
      expect(overlay.querySelector('rect')).toHaveAttribute('fill', 'url(#custom-grid)')
    })
  })

  describe('MarginLabelsOverlay', () => {
    it('renders standard page labels with header and footer info', () => {
      render(
        <MarginLabelsOverlay
          pageSize={{ width: 600, height: 800 }}
          margins={{ top: 40, right: 30, bottom: 50, left: 20 }}
          totalCanvasHeight={800}
          headerConfig={{ height: 60 }}
          footerConfig={{ height: 40 }}
          isSummary={false}
          headerEndLabel="Header End"
          footerStartLabel="Footer Start"
        />
      )

      expect(screen.getByTestId('standard-label-top')).toHaveTextContent('↑ Margin: 40pt')
      expect(screen.getByTestId('standard-label-bottom')).toHaveTextContent('↓ Margin: 50pt')
      expect(screen.getByTestId('standard-label-left')).toHaveTextContent('← 20pt')
      expect(screen.getByTestId('standard-label-right')).toHaveTextContent('30pt →')

      expect(screen.getByTestId('standard-label-header-end')).toHaveTextContent('Header End: 100pt')
      expect(screen.getByTestId('standard-label-footer-start')).toHaveTextContent('Footer Start: 710pt')
    })

    it('renders summary page labels with green styling', () => {
      render(
        <MarginLabelsOverlay
          pageSize={{ width: 600, height: 800 }}
          margins={{ top: 40, right: 30, bottom: 50, left: 20 }}
          totalCanvasHeight={800}
          headerConfig={{ height: 60 }}
          footerConfig={{ height: 40 }}
          isSummary={true}
        />
      )

      const topLabel = screen.getByTestId('summary-label-top')
      expect(topLabel).toHaveTextContent('↑ Margin: 40pt')
      expect(topLabel.className).toContain('text-green-500')

      expect(screen.queryByTestId('standard-label-header-end')).toBeNull()
      expect(screen.queryByTestId('standard-label-footer-start')).toBeNull()
    })
  })

  describe('CanvasMarginGuides (Composed Orchestrator)', () => {
    it('renders full guides composition for standard page with multiple pages', () => {
      render(
        <CanvasMarginGuides
          {...defaultProps}
          headerConfig={{ height: 50 }}
          footerConfig={{ height: 40 }}
          numberOfPages={2}
          bodyUsableHeight={700}
        />
      )

      expect(screen.getByTestId('margin-lines-overlay')).toBeInTheDocument()
      expect(screen.getByTestId('canvas-grid-overlay')).toBeInTheDocument()
      expect(screen.getByTestId('standard-label-top')).toHaveTextContent('↑ Margin: 30pt')
      expect(screen.getByTestId('standard-label-header-end')).toHaveTextContent('Header End: 80pt')
      expect(screen.getByTestId('page-separator')).toBeInTheDocument()
      expect(screen.getByText('Page 2')).toBeInTheDocument()
    })

    it('renders summary mode correctly', () => {
      render(
        <CanvasMarginGuides
          {...defaultProps}
          isSummary={true}
        />
      )

      expect(screen.getByTestId('summary-label-top')).toBeInTheDocument()
      expect(screen.queryByTestId('header-end-line')).toBeNull()
    })
  })
})
