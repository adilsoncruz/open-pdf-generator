import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LoopChildElement } from './LoopChildElement'
import { resolveChildDisplayText } from './childDisplayText'
import { resolveChildWidth, resolveChildHeight } from './childDimensions'
import { useTemplateStore, type Element } from '../../../store/templateStore'
import { useUIStore } from '../../../store/uiStore'

describe('childDimensions', () => {
  it('resolves 100% to loop width and height', () => {
    expect(resolveChildWidth('100%', 450)).toBe(450)
    expect(resolveChildHeight('100%', 250)).toBe(250)
  })

  it('resolves numeric values directly', () => {
    expect(resolveChildWidth(150, 450)).toBe(150)
    expect(resolveChildHeight(35, 250)).toBe(35)
  })

  it('provides default fallback dimensions for undefined', () => {
    expect(resolveChildWidth(undefined, 450)).toBe(100)
    expect(resolveChildHeight(undefined, 250)).toBe(20)
  })
})

describe('childDisplayText', () => {
  beforeEach(() => {
    useTemplateStore.setState({
      template: {
        page: [
          {
            id: 'loop-1',
            type: 'loop',
            dataBinding: 'items',
            elements: [],
          },
        ],
        pageSettings: {
          header: { elements: [] },
          footer: { elements: [] },
        },
      } as any,
      testData: {},
    })
  })

  it('returns direct value when present', () => {
    expect(resolveChildDisplayText({ value: 'Fixed Label' }, 'loop-1', null)).toBe('Fixed Label')
  })

  it('resolves direct testData property when available', () => {
    const testData = { title: 'Global Title' }
    expect(resolveChildDisplayText({ dataBinding: 'title' }, 'loop-1', testData)).toBe('Global Title')
  })

  it('resolves nested loop item property via template loop dataBinding', () => {
    const testData = {
      items: [
        { name: 'Item A', price: 99.9 },
        { name: 'Item B', price: 199.9 },
      ],
    }
    expect(resolveChildDisplayText({ dataBinding: 'name' }, 'loop-1', testData)).toBe('Item A')
    expect(resolveChildDisplayText({ dataBinding: 'price' }, 'loop-1', testData)).toBe('99.9')
  })

  it('returns {binding} placeholder when key is missing or no testData', () => {
    expect(resolveChildDisplayText({ dataBinding: 'missingField' }, 'loop-1', {})).toBe('{missingField}')
    expect(resolveChildDisplayText({ dataBinding: 'missingField' }, 'loop-1', null)).toBe('{missingField}')
  })

  it('returns fallback when neither value nor dataBinding are present', () => {
    expect(resolveChildDisplayText({}, 'loop-1', null, 'Default')).toBe('Default')
  })
})

describe('LoopChildElement component', () => {
  const baseChild: Element = {
    id: 'lchild-1',
    type: 'text',
    x: 15,
    y: 25,
    width: 120,
    height: 30,
    value: 'Item Name',
  }

  beforeEach(() => {
    useTemplateStore.setState({
      selectedElementIds: [],
      selectedLoopChildId: null,
      selectedLoopParentId: null,
      template: {
        page: [
          {
            id: 'loop-1',
            type: 'loop',
            elements: [baseChild],
          },
        ],
        pageSettings: {
          header: { elements: [] },
          footer: { elements: [] },
        },
      } as any,
      testData: {},
    })
  })

  it('renders text element content correctly', () => {
    render(
      <LoopChildElement
        child={baseChild}
        loopId="loop-1"
        location="page"
        loopWidth={500}
        loopHeight={300}
      />
    )

    expect(screen.getByText('Item Name')).toBeInTheDocument()
  })

  it('renders image placeholder', () => {
    const imgChild: Element = {
      id: 'limg-1',
      type: 'image',
      x: 0,
      y: 0,
      width: 60,
      height: 60,
    }

    const { container } = render(
      <LoopChildElement
        child={imgChild}
        loopId="loop-1"
        location="page"
        loopWidth={500}
        loopHeight={300}
      />
    )

    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders rectangle / spacer and line elements', () => {
    const rectChild: Element = {
      id: 'lrect-1',
      type: 'rectangle',
      x: 0,
      y: 0,
      width: 100,
      height: 20,
    }

    const { container: rectContainer } = render(
      <LoopChildElement
        child={rectChild}
        loopId="loop-1"
        location="page"
        loopWidth={500}
        loopHeight={300}
      />
    )
    expect(rectContainer.firstElementChild).toBeInTheDocument()

    const lineChild: Element = {
      id: 'lline-1',
      type: 'line',
      x: 0,
      y: 0,
      width: 200,
      height: 0,
    }

    const { container: lineContainer } = render(
      <LoopChildElement
        child={lineChild}
        loopId="loop-1"
        location="page"
        loopWidth={500}
        loopHeight={300}
      />
    )
    expect(lineContainer.querySelector('line')).toBeInTheDocument()
  })

  it('renders barcode element', () => {
    const barcodeChild: Element = {
      id: 'lbc-1',
      type: 'barcode',
      barcodeType: 'qrcode',
      value: 'https://openpdf.dev',
      x: 0,
      y: 0,
      width: 80,
      height: 80,
    }

    render(
      <LoopChildElement
        child={barcodeChild}
        loopId="loop-1"
        location="page"
        loopWidth={500}
        loopHeight={300}
      />
    )

    expect(screen.getByText('https://openpdf.dev')).toBeInTheDocument()
  })

  it('shows selection badge and resize handles when selected', () => {
    useTemplateStore.setState({
      selectedLoopParentId: 'loop-1',
      selectedLoopChildId: 'lchild-1',
    })

    const { container } = render(
      <LoopChildElement
        child={baseChild}
        loopId="loop-1"
        location="page"
        loopWidth={500}
        loopHeight={300}
      />
    )

    expect(screen.getByText('text')).toBeInTheDocument()
    expect(container.querySelectorAll('.cursor-se-resize').length).toBe(1)
    expect(container.querySelectorAll('.cursor-e-resize').length).toBe(1)
    expect(container.querySelectorAll('.cursor-s-resize').length).toBe(1)
  })

  it('opens context menu on right click and selects child if not selected', () => {
    const openContextMenuSpy = vi.fn()
    vi.spyOn(useUIStore.getState(), 'openContextMenu').mockImplementation(openContextMenuSpy)

    render(
      <LoopChildElement
        child={baseChild}
        loopId="loop-1"
        location="page"
        loopWidth={500}
        loopHeight={300}
      />
    )

    const el = screen.getByText('Item Name').closest('.absolute')
    expect(el).not.toBeNull()

    fireEvent.contextMenu(el!)

    expect(openContextMenuSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        targetType: 'element',
        elementId: 'lchild-1',
        loopId: 'loop-1',
        location: 'page',
      })
    )
  })

  it('allows inline editing of dataBinding on double click for loop child text', () => {
    const updateSpy = vi.spyOn(useTemplateStore.getState(), 'updateLoopChildElement')
    const dynamicChild: Element = {
      id: 'lchild-dyn-1',
      type: 'text',
      x: 10,
      y: 10,
      width: 120,
      height: 30,
      dataBinding: 'item.price',
    }

    render(
      <LoopChildElement
        child={dynamicChild}
        loopId="loop-1"
        location="page"
        loopWidth={500}
        loopHeight={300}
      />
    )

    const textNode = screen.getByText('{item.price}')
    fireEvent.doubleClick(textNode)

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(textarea.value).toBe('item.price')

    fireEvent.change(textarea, { target: { value: 'item.total' } })
    fireEvent.blur(textarea)

    expect(updateSpy).toHaveBeenCalledWith(
      'loop-1',
      'lchild-dyn-1',
      { dataBinding: 'item.total' }
    )
  })

  it('allows inline editing of value on double click for loop child static_text', () => {
    const updateSpy = vi.spyOn(useTemplateStore.getState(), 'updateLoopChildElement')
    const staticChild: Element = {
      id: 'lchild-static-1',
      type: 'static_text',
      x: 10,
      y: 10,
      width: 120,
      height: 30,
      value: 'Static Loop Col',
    }

    render(
      <LoopChildElement
        child={staticChild}
        loopId="loop-1"
        location="page"
        loopWidth={500}
        loopHeight={300}
      />
    )

    const textNode = screen.getByText('Static Loop Col')
    fireEvent.doubleClick(textNode)

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(textarea.value).toBe('Static Loop Col')

    fireEvent.change(textarea, { target: { value: 'Updated Static Col' } })
    fireEvent.blur(textarea)

    expect(updateSpy).toHaveBeenCalledWith(
      'loop-1',
      'lchild-static-1',
      { value: 'Updated Static Col' }
    )
  })
})
