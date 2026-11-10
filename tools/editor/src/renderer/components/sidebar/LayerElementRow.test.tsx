import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { LayerElementRow } from './LayerElementRow'
import { useTemplateStore, type Element } from '../../store/templateStore'
import { useUIStore } from '../../store/uiStore'

describe('LayerElementRow', () => {
  beforeEach(() => {
    useTemplateStore.setState({
      selectedElementIds: [],
      selectedContainerChildId: null,
      selectedLoopChildId: null,
    })
  })

  it('renders text element and handles click, move up/down, visibility, and delete', () => {
    const el: Element = {
      type: 'text',
      id: 'row-el-1',
      value: 'Sample Label',
      hidden: false,
    }

    const onDragStart = vi.fn()
    const onDragOver = vi.fn()
    const onDragLeave = vi.fn()
    const onDrop = vi.fn()
    const onDragEnd = vi.fn()

    const { getByText, getByTitle, container } = render(
      <LayerElementRow
        el={el}
        sectionKey="body"
        index={1}
        totalCount={3}
        currentGroups={[]}
        draggedElementId={null}
        dragOverElementId={null}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
      />
    )

    expect(container).toMatchSnapshot()

    expect(getByText('Sample Label')).toBeInTheDocument()

    // Click row
    fireEvent.click(getByText('Sample Label'))
    expect(useTemplateStore.getState().selectedElementIds).toContain('row-el-1')

    // Move up
    fireEvent.click(getByTitle('Mover para cima'))

    // Move down
    fireEvent.click(getByTitle('Mover para baixo'))

    // Visibility toggle
    fireEvent.click(getByTitle('Ocultar'))

    // Delete
    fireEvent.click(getByTitle('Excluir'))
  })

  it('handles child inside loop and container with context menu and group tag', () => {
    const openContextMenuSpy = vi.spyOn(useUIStore.getState(), 'openContextMenu')

    const el: Element = {
      type: 'table',
      id: 'table-row-1',
      columns: [{}, {}],
      hidden: true,
      groupId: 'grp-1',
    }

    const { getByText, getByTitle } = render(
      <LayerElementRow
        el={el}
        sectionKey="body"
        index={0}
        totalCount={2}
        parentContainerId="cont-p-1"
        currentGroups={[{ id: 'grp-1', name: 'HeaderGroup', elementIds: ['table-row-1'], location: 'body' as const }]}
        draggedElementId="table-row-1"
        dragOverElementId="table-row-1"
        onDragStart={vi.fn()}
        onDragOver={vi.fn()}
        onDragLeave={vi.fn()}
        onDrop={vi.fn()}
        onDragEnd={vi.fn()}
      />
    )

    expect(getByText(/Tabela/)).toBeInTheDocument()
    expect(getByText('HeaderGroup')).toBeInTheDocument()

    // Click group chip
    fireEvent.click(getByText('HeaderGroup'))

    // Context menu
    fireEvent.contextMenu(getByText(/Tabela/))
    expect(openContextMenuSpy).toHaveBeenCalled()

    // Delete child from container
    fireEvent.click(getByTitle('Excluir'))

    openContextMenuSpy.mockRestore()
  })

  it('renders line, barcode, loop icon and labels and handles loop child reorder', () => {
    const loopEl: Element = {
      type: 'barcode',
      id: 'bar-row-1',
      barcodeType: 'qrcode',
    }

    const { getByText, getByTitle } = render(
      <LayerElementRow
        el={loopEl}
        sectionKey="body"
        index={1}
        totalCount={3}
        parentLoopId="loop-p-1"
        currentGroups={[]}
        draggedElementId={null}
        dragOverElementId={null}
        onDragStart={vi.fn()}
        onDragOver={vi.fn()}
        onDragLeave={vi.fn()}
        onDrop={vi.fn()}
        onDragEnd={vi.fn()}
      />
    )

    expect(getByText(/Barcode/)).toBeInTheDocument()

    // Click loop child
    fireEvent.click(getByText(/Barcode/))
    expect(useTemplateStore.getState().selectedLoopChildId).toBe('bar-row-1')

    // Move up in loop
    fireEvent.click(getByTitle('Mover para cima'))

    // Move down in loop
    fireEvent.click(getByTitle('Mover para baixo'))

    // Delete in loop
    fireEvent.click(getByTitle('Excluir'))
  })

  it('handles drag events: dragStart, dragOver, dragLeave, drop, dragEnd and ctrl-click', () => {
    const onDragStart = vi.fn()
    const onDragOver = vi.fn()
    const onDragLeave = vi.fn()
    const onDrop = vi.fn()
    const onDragEnd = vi.fn()

    const el: Element = {
      type: 'image',
      id: 'img-row-drag',
      name: 'LogoImage',
    }

    const { getByText, rerender } = render(
      <LayerElementRow
        el={el}
        sectionKey="header"
        index={0}
        totalCount={1}
        currentGroups={[]}
        draggedElementId={null}
        dragOverElementId={null}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
      />
    )

    const row = getByText('LogoImage').closest('[draggable="true"]') as HTMLElement
    expect(row).toBeDefined()

    // Drag events
    fireEvent.dragStart(row)
    expect(onDragStart).toHaveBeenCalledWith(expect.anything(), 'img-row-drag')

    fireEvent.dragOver(row)
    expect(onDragOver).toHaveBeenCalledWith(expect.anything(), 'img-row-drag')

    fireEvent.dragLeave(row)
    expect(onDragLeave).toHaveBeenCalledWith(expect.anything(), 'img-row-drag')

    fireEvent.drop(row)
    expect(onDrop).toHaveBeenCalledWith(expect.anything(), 0)

    fireEvent.dragEnd(row)
    expect(onDragEnd).toHaveBeenCalled()

    // Ctrl+Click toggle selection
    fireEvent.click(row, { ctrlKey: true })

    // Other element icons & labels: link, rich_text, line, loop, spacer, rectangle, container
    const elementsToRender: Element[] = [
      { type: 'link', id: 'l1', value: 'https://test.com' },
      { type: 'rich_text', id: 'rt1', value: 'Rich text' },
      { type: 'line', id: 'ln1', width: 100 },
      { type: 'loop', id: 'lp1', elements: [] },
      { type: 'spacer', id: 'sp1' },
      { type: 'rectangle', id: 'rc1' },
      { type: 'container', id: 'ct1' },
      { type: 'custom' as any, id: 'cust1' },
    ]

    elementsToRender.forEach((testEl) => {
      rerender(
        <LayerElementRow
          el={testEl}
          sectionKey="body"
          index={0}
          totalCount={1}
          currentGroups={[]}
          draggedElementId={null}
          dragOverElementId={null}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onDragEnd={onDragEnd}
        />
      )
    })

    // Context menu on standalone element (line 167) and loop child (line 163)
    const standaloneEl: Element = { type: 'text', id: 'standalone-ctx', value: 'Ctx Test' }
    rerender(
      <LayerElementRow
        el={standaloneEl}
        sectionKey="body"
        index={0}
        totalCount={1}
        currentGroups={[]}
        draggedElementId={null}
        dragOverElementId={null}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
      />
    )
    fireEvent.contextMenu(getByText('Ctx Test'))

    // Context menu on loop child
    rerender(
      <LayerElementRow
        el={standaloneEl}
        sectionKey="body"
        index={0}
        totalCount={1}
        parentLoopId="loop-ctx"
        currentGroups={[]}
        draggedElementId={null}
        dragOverElementId={null}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
      />
    )
    fireEvent.contextMenu(getByText('Ctx Test'))

    // Click on container child (line 187)
    rerender(
      <LayerElementRow
        el={standaloneEl}
        sectionKey="body"
        index={0}
        totalCount={1}
        parentContainerId="cont-click"
        currentGroups={[]}
        draggedElementId={null}
        dragOverElementId={null}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
      />
    )
    fireEvent.click(getByText('Ctx Test'))
  })
})
