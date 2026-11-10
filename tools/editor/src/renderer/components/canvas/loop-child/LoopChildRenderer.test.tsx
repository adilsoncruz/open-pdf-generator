import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { LoopChildRenderer } from './LoopChildRenderer'
import type { Element } from '../../../store/templateStore'

describe('LoopChildRenderer', () => {
  const resolveWidth = (val: any) => (typeof val === 'number' ? val : 100)
  const resolveHeight = (val: any) => (typeof val === 'number' ? val : 30)

  it('renders text element and matches snapshot', () => {
    const onDoubleClick = vi.fn()
    const textChild: Element = {
      id: 'txt-1',
      type: 'text',
      value: 'Sample loop text',
      width: 120,
      height: 25,
      style: {
        fontSize: 12,
        fontFamily: 'Helvetica',
        color: '#111827',
        fontWeight: 'bold',
      },
    }

    const { container } = render(
      <LoopChildRenderer
        child={textChild}
        loopId="loop-1"
        loopWidth={500}
        loopHeight={300}
        resolveWidth={resolveWidth}
        resolveHeight={resolveHeight}
        onDoubleClick={onDoubleClick}
      />
    )

    expect(container).toMatchSnapshot()
    expect(screen.getByText('Sample loop text')).toBeInTheDocument()

    fireEvent.doubleClick(screen.getByText('Sample loop text'))
    expect(onDoubleClick).toHaveBeenCalled()
  })

  it('renders text element in editing mode with textarea', () => {
    const onTextChange = vi.fn()
    const onTextBlur = vi.fn()
    const onTextKeyDown = vi.fn()

    const textChild: Element = {
      id: 'txt-edit',
      type: 'text',
      value: 'Original',
    }

    const { container } = render(
      <LoopChildRenderer
        child={textChild}
        loopId="loop-1"
        loopWidth={500}
        loopHeight={300}
        resolveWidth={resolveWidth}
        resolveHeight={resolveHeight}
        isEditingText={true}
        editingValue="Editing Value"
        onTextChange={onTextChange}
        onTextBlur={onTextBlur}
        onTextKeyDown={onTextKeyDown}
      />
    )

    expect(container).toMatchSnapshot()
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue('Editing Value')

    fireEvent.change(textarea, { target: { value: 'New text' } })
    expect(onTextChange).toHaveBeenCalledWith('New text')

    fireEvent.blur(textarea)
    expect(onTextBlur).toHaveBeenCalled()

    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(onTextKeyDown).toHaveBeenCalled()
  })

  it('renders link, image, rectangle, line, table, list, container, and barcodes', () => {
    // 1. Link element
    const linkChild: Element = {
      id: 'link-1',
      type: 'link',
      value: 'Click here',
    }
    const { container: linkContainer } = render(
      <LoopChildRenderer
        child={linkChild}
        loopId="loop-1"
        loopWidth={500}
        loopHeight={300}
        resolveWidth={resolveWidth}
        resolveHeight={resolveHeight}
      />
    )
    expect(linkContainer).toMatchSnapshot()

    // 2. Image element
    const imgChild: Element = { id: 'img-1', type: 'image', width: 60, height: 60 }
    const { container: imgContainer } = render(
      <LoopChildRenderer
        child={imgChild}
        loopId="loop-1"
        loopWidth={500}
        loopHeight={300}
        resolveWidth={resolveWidth}
        resolveHeight={resolveHeight}
      />
    )
    expect(imgContainer).toMatchSnapshot()

    // 3. Rectangle element
    const rectChild: Element = {
      id: 'rect-1',
      type: 'rectangle',
      width: 100,
      height: 40,
      style: {
        fillColor: '#3b82f6',
        borderWidth: 2,
        borderColor: '#1d4ed8',
        borderStyle: 'dashed',
        cornerRadius: 4,
      },
    }
    const { container: rectContainer } = render(
      <LoopChildRenderer
        child={rectChild}
        loopId="loop-1"
        loopWidth={500}
        loopHeight={300}
        resolveWidth={resolveWidth}
        resolveHeight={resolveHeight}
      />
    )
    expect(rectContainer).toMatchSnapshot()

    // 4. Line element (positive and negative)
    const lineChild: Element = {
      id: 'line-1',
      type: 'line',
      width: 120,
      height: 0,
      style: { strokeColor: '#ef4444', strokeWidth: 2 },
    }
    const { container: lineContainer } = render(
      <LoopChildRenderer
        child={lineChild}
        loopId="loop-1"
        loopWidth={500}
        loopHeight={300}
        resolveWidth={resolveWidth}
        resolveHeight={resolveHeight}
      />
    )
    expect(lineContainer).toMatchSnapshot()

    // 5. Container element
    const contChild: Element = { id: 'c-1', type: 'container', width: '100%', height: 50 }
    const { container: cContainer } = render(
      <LoopChildRenderer
        child={contChild}
        loopId="loop-1"
        loopWidth={500}
        loopHeight={300}
        resolveWidth={resolveWidth}
        resolveHeight={resolveHeight}
      />
    )
    expect(cContainer).toMatchSnapshot()

    // 6. Barcodes (QR and Code128)
    const qrChild: Element = { id: 'qr-1', type: 'barcode', barcodeType: 'qrcode', value: 'https://test.io' }
    const { container: qrContainer } = render(
      <LoopChildRenderer
        child={qrChild}
        loopId="loop-1"
        loopWidth={500}
        loopHeight={300}
        resolveWidth={resolveWidth}
        resolveHeight={resolveHeight}
      />
    )
    expect(qrContainer).toMatchSnapshot()

    const bar128Child: Element = { id: 'b-128', type: 'barcode', barcodeType: 'code128', value: '12345678' }
    const { container: bar128Container } = render(
      <LoopChildRenderer
        child={bar128Child}
        loopId="loop-1"
        loopWidth={500}
        loopHeight={300}
        resolveWidth={resolveWidth}
        resolveHeight={resolveHeight}
      />
    )
    expect(bar128Container).toMatchSnapshot()

    // 7. Table and List
    const tableChild: Element = {
      id: 'tbl-1',
      type: 'table',
      columns: [{ title: 'Col 1', dataKey: 'c1' }],
    }
    const { container: tblContainer } = render(
      <LoopChildRenderer
        child={tableChild}
        loopId="loop-1"
        loopWidth={500}
        loopHeight={300}
        resolveWidth={resolveWidth}
        resolveHeight={resolveHeight}
      />
    )
    expect(tblContainer).toMatchSnapshot()

    // 8. Default unknown
    const unknownChild: Element = { id: 'unk-1', type: 'unknown_type' as any }
    const { container: unkContainer } = render(
      <LoopChildRenderer
        child={unknownChild}
        loopId="loop-1"
        loopWidth={500}
        loopHeight={300}
        resolveWidth={resolveWidth}
        resolveHeight={resolveHeight}
      />
    )
    expect(unkContainer).toMatchSnapshot()
  })
})
