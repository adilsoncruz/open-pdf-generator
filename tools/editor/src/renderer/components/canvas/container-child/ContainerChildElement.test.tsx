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
})
