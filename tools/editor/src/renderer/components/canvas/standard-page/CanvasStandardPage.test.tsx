import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react'
import { CanvasStandardPage } from './CanvasStandardPage'
import { useCanvasPageDrop } from './useCanvasPageDrop'
import { useBodyFlowLayout } from './useBodyFlowLayout'
import { CanvasBandOverlay, CanvasSectionBadge } from './CanvasBandOverlay'
import { useTemplateStore, type Element } from '../../../store/templateStore'

describe('CanvasStandardPage modular components', () => {
  beforeEach(() => {
    useTemplateStore.setState({
      template: {
        version: '1.0',
        metadata: { name: 'Test' },
        pageSettings: {
          size: 'A4',
          orientation: 'portrait',
          margins: { top: 30, right: 30, bottom: 30, left: 30 },
          header: {
            height: 50,
            elements: [
              { id: 'header-el-1', type: 'text', value: 'Header Title', x: 10, y: 10, width: 100, height: 20 },
            ],
          },
          footer: {
            height: 40,
            elements: [
              { id: 'footer-el-1', type: 'text', value: 'Footer Page 1', x: 10, y: 10, width: 100, height: 20 },
            ],
          },
          bodyBackground: {
            elements: [
              { id: 'bg-el-1', type: 'text', value: 'Background Watermark', x: 50, y: 50, width: 200, height: 50 },
            ],
          },
        },
        page: [
          { id: 'body-el-1', type: 'text', value: 'Body Content', x: 20, y: 20, width: 200, height: 30 },
        ],
      },
      currentSection: 'body',
      selectedElementIds: [],
      selectedElementLocation: 'body',
    })
  })

  describe('useBodyFlowLayout', () => {
    it('computes static and relative elements positions correctly', () => {
      const elements: Element[] = [
        { id: '1', type: 'text', value: 'First', x: 10, y: 10, width: 100, height: 20 },
        {
          id: '2',
          type: 'text',
          value: 'Second',
          x: 0,
          y: 0,
          positionMode: 'RELATIVE',
          relativeOffsetY: 5,
          width: 100,
          height: 25,
        },
      ]

      const { result } = renderHook(() => useBodyFlowLayout(elements, 700))
      expect(result.current).toHaveLength(2)
      expect(result.current[0].effectiveY).toBeUndefined()
      // Relative element continues after previous element (10 + 20 = 30) + offsetY (5) = 35
      expect(result.current[1].effectiveY).toBe(35)
    })
  })

  describe('useCanvasPageDrop', () => {
    it('calculates drop coordinates respecting scale factor', () => {
      const { result } = renderHook(() =>
        useCanvasPageDrop({
          section: 'body',
          scale: 2,
        })
      )

      const coords = result.current.calculateDropCoords(100, 200, {
        left: 20,
        top: 40,
      } as DOMRect)

      // (100 - 20) / 2 = 40
      // (200 - 40) / 2 = 80
      expect(coords).toEqual({ x: 40, y: 80 })
    })

    it('handles drag over and drop of elements with application/x-openpdf-element', () => {
      const onDropElement = vi.fn()
      const { result } = renderHook(() =>
        useCanvasPageDrop({
          section: 'body',
          scale: 1,
          onDropElement,
        })
      )

      const preventDefault = vi.fn()
      const mockDragEvent = {
        preventDefault,
        dataTransfer: {
          dropEffect: '',
          getData: (type: string) =>
            type === 'application/x-openpdf-element'
              ? JSON.stringify({ type: 'static_text', value: 'Static Text Dropped' })
              : '',
        },
        clientX: 50,
        clientY: 60,
        currentTarget: {
          getBoundingClientRect: () => ({ left: 10, top: 10 }),
        },
      } as unknown as React.DragEvent

      act(() => {
        result.current.handleDrop(mockDragEvent)
      })

      expect(onDropElement).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'static_text',
          value: 'Static Text Dropped',
          x: 40,
          y: 50,
        }),
        'body'
      )
    })

    it('handles drag over and drop of elements', () => {
      const onDropElement = vi.fn()
      const { result } = renderHook(() =>
        useCanvasPageDrop({
          section: 'body',
          scale: 1,
          onDropElement,
        })
      )

      const preventDefault = vi.fn()
      const mockDragEvent = {
        preventDefault,
        dataTransfer: {
          dropEffect: '',
          getData: (type: string) =>
            type === 'application/json' ? JSON.stringify({ type: 'text', value: 'Dropped Text' }) : '',
        },
        clientX: 50,
        clientY: 60,
        currentTarget: {
          getBoundingClientRect: () => ({ left: 10, top: 10 }),
        },
      } as unknown as React.DragEvent

      act(() => {
        result.current.handleDragOver(mockDragEvent)
      })
      expect(result.current.isDragOver).toBe(true)

      act(() => {
        result.current.handleDrop(mockDragEvent)
      })
      expect(result.current.isDragOver).toBe(false)
      expect(onDropElement).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'text',
          value: 'Dropped Text',
          x: 40,
          y: 50,
        }),
        'body'
      )
    })
  })

  describe('CanvasBandOverlay & CanvasSectionBadge', () => {
    it('renders section badge with proper styling', () => {
      render(<CanvasSectionBadge section="header" top={40} />)
      const badge = screen.getByText('HEADER')
      expect(badge).toBeDefined()
      expect(badge.className).toContain('bg-blue-500')
    })

    it('renders band overlay with disabled backdrop when inactive', () => {
      const { container } = render(
        <CanvasBandOverlay section="header" isActive={false} style={{ top: 0, left: 0, right: 0, height: 50 }}>
          <span>Header Content</span>
        </CanvasBandOverlay>
      )

      expect(screen.getByText('Header Content')).toBeDefined()
      const disabledOverlay = container.querySelector('.cursor-not-allowed')
      expect(disabledOverlay).not.toBeNull()
    })
  })

  describe('CanvasStandardPage', () => {
    const defaultProps = {
      pageSize: { width: 595, height: 842 },
      margins: { top: 30, right: 30, bottom: 30, left: 30 },
      totalCanvasHeight: 842,
      scale: 1,
      horizontalGuides: [],
      verticalGuides: [],
      onSnapGuide: vi.fn(),
      marginSnap: { top: false, bottom: false, left: false, right: false },
      numberOfPages: 1,
      bodyUsableHeight: 692,
      headerHeight: 50,
      footerHeight: 40,
    }

    it('renders body elements and body badge when currentSection is body', () => {
      const { container } = render(<CanvasStandardPage {...defaultProps} />)
      expect(screen.getByText('BODY')).toBeDefined()
      expect(screen.getByText('Body Content')).toBeDefined()
      expect(container).toMatchSnapshot()
    })

    it('switches section to header when clicking header band', () => {
      const { container } = render(<CanvasStandardPage {...defaultProps} />)
      // Header has inactive backdrop
      const headerText = screen.getByText('Header Title')
      expect(headerText).toBeDefined()

      // Header overlay clickable to activate
      const disabledOverlays = container.querySelectorAll('.cursor-not-allowed')
      disabledOverlays.forEach((overlay) => {
        fireEvent.click(overlay)
      })
    })

    it('renders background elements and BACKGROUND badge when section is bodyBackground', () => {
      useTemplateStore.setState({ currentSection: 'bodyBackground' })
      const { container } = render(<CanvasStandardPage {...defaultProps} />)
      expect(screen.getByText('BACKGROUND')).toBeDefined()
      expect(screen.getByText('Background Watermark')).toBeDefined()
      expect(container).toMatchSnapshot()
    })

    it('renders footer section and handles element selection and watermark', () => {
      useTemplateStore.setState({
        currentSection: 'footer',
        selectedElementLocation: 'footer',
        template: {
          ...useTemplateStore.getState().template,
          pageSettings: {
            ...useTemplateStore.getState().template.pageSettings,
            watermark: { type: 'text', text: 'DRAFT', opacity: 0.3 },
          },
        },
      })
      const { container } = render(<CanvasStandardPage {...defaultProps} />)
      expect(screen.getByText('FOOTER')).toBeDefined()
      expect(container).toMatchSnapshot()

      // Select element with and without ctrlKey via mouseDown
      fireEvent.mouseDown(screen.getByText('Footer Page 1'), { ctrlKey: true })
      expect(useTemplateStore.getState().selectedElementIds).toContain('footer-el-1')

      fireEvent.mouseDown(screen.getByText('Footer Page 1'), { ctrlKey: false })
      expect(useTemplateStore.getState().selectedElementIds).toEqual(['footer-el-1'])
    })

    it('handles selection and activation across header, body and background', () => {
      // 1. Header active
      useTemplateStore.setState({ currentSection: 'header', selectedElementLocation: 'header' })
      const hRender = render(<CanvasStandardPage {...defaultProps} />)
      expect(screen.getByText('HEADER')).toBeDefined()

      // Select header element with ctrlKey and without ctrlKey
      fireEvent.mouseDown(screen.getByText('Header Title'), { ctrlKey: true })
      expect(useTemplateStore.getState().selectedElementIds).toContain('header-el-1')
      fireEvent.mouseDown(screen.getByText('Header Title'), { ctrlKey: false })
      expect(useTemplateStore.getState().selectedElementIds).toEqual(['header-el-1'])
      hRender.unmount()

      // 2. Body active selection
      useTemplateStore.setState({ currentSection: 'body', selectedElementLocation: 'body', selectedElementIds: [] })
      const bRender = render(<CanvasStandardPage {...defaultProps} />)
      fireEvent.mouseDown(screen.getByText('Body Content'), { ctrlKey: true })
      expect(useTemplateStore.getState().selectedElementIds).toContain('body-el-1')
      fireEvent.mouseDown(screen.getByText('Body Content'), { ctrlKey: false })
      expect(useTemplateStore.getState().selectedElementIds).toEqual(['body-el-1'])
      bRender.unmount()

      // 3. BodyBackground active selection
      useTemplateStore.setState({ currentSection: 'bodyBackground', selectedElementLocation: 'bodyBackground', selectedElementIds: [] })
      const bgRender = render(<CanvasStandardPage {...defaultProps} />)
      fireEvent.mouseDown(screen.getByText('Background Watermark'), { ctrlKey: true })
      expect(useTemplateStore.getState().selectedElementIds).toContain('bg-el-1')
      fireEvent.mouseDown(screen.getByText('Background Watermark'), { ctrlKey: false })
      expect(useTemplateStore.getState().selectedElementIds).toEqual(['bg-el-1'])
      bgRender.unmount()
    })

    it('triggers element drag updates in header, body, footer, and bodyBackground', () => {
      // 1. Header drag update
      useTemplateStore.setState({ currentSection: 'header', selectedElementLocation: 'header', selectedElementIds: [] })
      const hRender = render(<CanvasStandardPage {...defaultProps} />)
      fireEvent.mouseDown(screen.getByText('Header Title'), { clientX: 10, clientY: 10 })
      fireEvent.mouseMove(document, { clientX: 30, clientY: 30 })
      fireEvent.mouseUp(document)
      hRender.unmount()

      // 2. Body drag update
      useTemplateStore.setState({ currentSection: 'body', selectedElementLocation: 'body', selectedElementIds: [] })
      const bRender = render(<CanvasStandardPage {...defaultProps} />)
      fireEvent.mouseDown(screen.getByText('Body Content'), { clientX: 20, clientY: 20 })
      fireEvent.mouseMove(document, { clientX: 40, clientY: 40 })
      fireEvent.mouseUp(document)
      bRender.unmount()

      // 3. Footer drag update
      useTemplateStore.setState({ currentSection: 'footer', selectedElementLocation: 'footer', selectedElementIds: [] })
      const fRender = render(<CanvasStandardPage {...defaultProps} />)
      fireEvent.mouseDown(screen.getByText('Footer Page 1'), { clientX: 10, clientY: 10 })
      fireEvent.mouseMove(document, { clientX: 25, clientY: 25 })
      fireEvent.mouseUp(document)
      fRender.unmount()

      // 4. Background drag update
      useTemplateStore.setState({ currentSection: 'bodyBackground', selectedElementLocation: 'bodyBackground', selectedElementIds: [] })
      const bgRender = render(<CanvasStandardPage {...defaultProps} />)
      fireEvent.mouseDown(screen.getByText('Background Watermark'), { clientX: 50, clientY: 50 })
      fireEvent.mouseMove(document, { clientX: 70, clientY: 70 })
      fireEvent.mouseUp(document)
      bgRender.unmount()
    })
  })
})
