import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ContainerChildElement } from './ContainerChildElement'
import { resolveChildDisplayText } from './childDisplayText'
import { resolveChildWidth, resolveChildHeight } from './childDimensions'
import { useTemplateStore, type Element } from '../../../store/templateStore'
import { useUIStore } from '../../../store/uiStore'

describe('childDimensions', () => {
  it('resolves 100% to container width/height', () => {
    expect(resolveChildWidth('100%', 500)).toBe(500)
    expect(resolveChildHeight('100%', 300)).toBe(300)
  })

  it('resolves numeric values directly', () => {
    expect(resolveChildWidth(120, 500)).toBe(120)
    expect(resolveChildHeight(45, 300)).toBe(45)
  })

  it('provides sensible defaults for undefined', () => {
    expect(resolveChildWidth(undefined, 500)).toBe(100)
    expect(resolveChildHeight(undefined, 300)).toBe(20)
  })
})

describe('childDisplayText', () => {
  it('returns value when present', () => {
    expect(resolveChildDisplayText({ value: 'Fixed Title' }, null)).toBe('Fixed Title')
  })

  it('resolves simple dataBinding from testData', () => {
    const testData = { customer: { name: 'Alice' } }
    expect(resolveChildDisplayText({ dataBinding: 'customer.name' }, testData)).toBe('Alice')
  })

  it('returns {binding} placeholder when key is missing in testData', () => {
    expect(resolveChildDisplayText({ dataBinding: 'missing.key' }, {})).toBe('{missing.key}')
  })

  it('returns fallback when neither value nor dataBinding are present', () => {
    expect(resolveChildDisplayText({}, null, 'Fallback')).toBe('Fallback')
  })
})

describe('ContainerChildElement component', () => {
  const baseChild: Element = {
    id: 'child-1',
    type: 'text',
    x: 10,
    y: 20,
    width: 100,
    height: 30,
    value: 'Hello Child',
  }

  beforeEach(() => {
    useTemplateStore.setState({
      selectedElementIds: [],
      selectedContainerChildId: null,
      selectedContainerParentId: null,
      testData: {},
    })
  })

  it('renders text element content correctly', () => {
    render(
      <ContainerChildElement
        child={baseChild}
        containerId="cont-1"
        containerWidth={400}
        containerHeight={200}
      />
    )

    expect(screen.getByText('Hello Child')).toBeInTheDocument()
  })

  it('renders image placeholder', () => {
    const imgChild: Element = {
      id: 'img-1',
      type: 'image',
      x: 0,
      y: 0,
      width: 50,
      height: 50,
    }

    const { container } = render(
      <ContainerChildElement
        child={imgChild}
        containerId="cont-1"
        containerWidth={400}
        containerHeight={200}
      />
    )

    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders barcode element', () => {
    const barcodeChild: Element = {
      id: 'bc-1',
      type: 'barcode',
      barcodeType: 'qrcode',
      value: 'https://example.com',
      x: 0,
      y: 0,
      width: 80,
      height: 80,
    }

    render(
      <ContainerChildElement
        child={barcodeChild}
        containerId="cont-1"
        containerWidth={400}
        containerHeight={200}
      />
    )

    expect(screen.getByText('https://example.com')).toBeInTheDocument()
  })

  it('shows selection badge and handles when selected', () => {
    useTemplateStore.setState({
      selectedContainerParentId: 'cont-1',
      selectedContainerChildId: 'child-1',
    })

    render(
      <ContainerChildElement
        child={baseChild}
        containerId="cont-1"
        containerWidth={400}
        containerHeight={200}
      />
    )

    expect(screen.getByText('text')).toBeInTheDocument()
  })

  it('opens context menu on right click', () => {
    const openContextMenuSpy = vi.fn()
    vi.spyOn(useUIStore.getState(), 'openContextMenu').mockImplementation(openContextMenuSpy)

    render(
      <ContainerChildElement
        child={baseChild}
        containerId="cont-1"
        containerWidth={400}
        containerHeight={200}
      />
    )

    const el = screen.getByText('Hello Child')
    fireEvent.contextMenu(el)

    expect(openContextMenuSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        targetType: 'element',
        elementId: 'child-1',
        containerId: 'cont-1',
      })
    )
  })

  it('renders list element with items and background inside container', () => {
    const listChild: Element = {
      id: 'child-list-1',
      type: 'list',
      x: 10,
      y: 10,
      width: 280,
      height: 70,
      listStyle: 'BULLETED',
      items: ['teste 1', 'teste 2', 'teste 3'],
      style: {
        backgroundColor: '#f1f5f9',
      },
    }

    render(
      <ContainerChildElement
        child={listChild}
        containerId="cont-1"
        containerWidth={400}
        containerHeight={200}
      />
    )

    expect(screen.getByText('teste 1')).toBeInTheDocument()
    expect(screen.getByText('teste 2')).toBeInTheDocument()
    expect(screen.getByText('teste 3')).toBeInTheDocument()
  })

  it('allows inline editing of dataBinding on double click for container child text', () => {
    const updateSpy = vi.spyOn(useTemplateStore.getState(), 'updateContainerChildElement')
    const dynamicChild: Element = {
      id: 'dyn-child-1',
      type: 'text',
      x: 10,
      y: 10,
      width: 100,
      height: 30,
      dataBinding: 'item.name',
    }

    render(
      <ContainerChildElement
        child={dynamicChild}
        containerId="cont-1"
        containerWidth={400}
        containerHeight={200}
      />
    )

    const textNode = screen.getByText('{item.name}')
    fireEvent.doubleClick(textNode)

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(textarea.value).toBe('item.name')

    fireEvent.change(textarea, { target: { value: 'item.sku' } })
    fireEvent.blur(textarea)

    expect(updateSpy).toHaveBeenCalledWith(
      'cont-1',
      'dyn-child-1',
      { dataBinding: 'item.sku' },
      'body'
    )
  })

  it('allows inline editing of value on double click for container child static_text', () => {
    const updateSpy = vi.spyOn(useTemplateStore.getState(), 'updateContainerChildElement')
    const staticChild: Element = {
      id: 'static-child-1',
      type: 'static_text',
      x: 10,
      y: 10,
      width: 100,
      height: 30,
      value: 'Static Child',
    }

    render(
      <ContainerChildElement
        child={staticChild}
        containerId="cont-1"
        containerWidth={400}
        containerHeight={200}
      />
    )

    const textNode = screen.getByText('Static Child')
    fireEvent.doubleClick(textNode)

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(textarea.value).toBe('Static Child')

    fireEvent.change(textarea, { target: { value: 'Updated Static' } })
    fireEvent.blur(textarea)

    expect(updateSpy).toHaveBeenCalledWith(
      'cont-1',
      'static-child-1',
      { value: 'Updated Static' },
      'body'
    )
  })
})
