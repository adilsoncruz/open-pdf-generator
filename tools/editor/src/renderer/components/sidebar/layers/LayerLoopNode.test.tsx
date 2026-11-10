import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { LayerLoopNode } from './LayerLoopNode'
import { useTemplateStore, type Element } from '../../../store/templateStore'

describe('LayerLoopNode', () => {
  const loopEl: Element = {
    type: 'loop',
    id: 'loop-node-1',
    name: 'loop-node-1',
    elements: [
      { type: 'text', id: 'child-1', name: 'child-1', x: 0, y: 0, width: 50, height: 20, value: 'Child item' },
    ],
  }

  it('renders loop node with header and expanded children', () => {
    const onToggleExpand = vi.fn()
    const { getByText } = render(
      <LayerLoopNode
        el={loopEl}
        sectionKey="body"
        index={0}
        totalCount={1}
        currentGroups={[]}
        isExpanded={true}
        onToggleExpand={onToggleExpand}
        draggedElementId={null}
        dragOverElementId={null}
        onDragStart={vi.fn()}
        onDragOver={vi.fn()}
        onDragLeave={vi.fn()}
        onDrop={vi.fn()}
        onDragEnd={vi.fn()}
      />
    )

    expect(getByText(/loop-node-1/)).toBeInTheDocument()
    expect(getByText('Child item')).toBeInTheDocument()
  })

  it('toggles expand on click and handles item actions', () => {
    const onToggleExpand = vi.fn()
    const onDragStart = vi.fn()
    const onDragOver = vi.fn()
    const onDragLeave = vi.fn()
    const onDrop = vi.fn()
    const onDragEnd = vi.fn()

    const { getByText, getAllByText, getAllByTitle } = render(
      <LayerLoopNode
        el={loopEl}
        sectionKey="body"
        index={1}
        totalCount={3}
        currentGroups={[]}
        isExpanded={true}
        onToggleExpand={onToggleExpand}
        draggedElementId={null}
        dragOverElementId={null}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
      />
    )

    // Expand button click
    const toggleBtn = getAllByText('▼')[0]
    fireEvent.click(toggleBtn)
    expect(onToggleExpand).toHaveBeenCalledWith('loop-node-1')

    const label = getByText(/loop-node-1/)
    // Context menu
    fireEvent.contextMenu(label)

    // Shift click
    fireEvent.click(label, { shiftKey: true })

    // Normal click
    fireEvent.click(label)

    // Move up & down
    const upButtons = getAllByTitle('Mover para cima')
    fireEvent.click(upButtons[0])
    const downButtons = getAllByTitle('Mover para baixo')
    fireEvent.click(downButtons[0])

    // Visibility
    const visButtons = getAllByTitle('Ocultar')
    fireEvent.click(visButtons[0])

    // Drag events
    fireEvent.dragStart(label)
    fireEvent.dragOver(label)
    fireEvent.dragLeave(label)
    fireEvent.drop(label)
    fireEvent.dragEnd(label)

    // Delete without parentContainerId
    const deleteBtn = getAllByTitle('Excluir')[0]
    fireEvent.click(deleteBtn)

    // Drop on child element to trigger reorder
    const childEl = getByText('Child item')
    fireEvent.drop(childEl)
  })

  it('renders inside parent container and handles empty loop and delete', () => {
    const emptyLoop: Element = {
      type: 'loop',
      id: 'loop-empty-1',
      dataBinding: 'items',
      elements: [],
    }

    const { getByText, getAllByTitle, container } = render(
      <LayerLoopNode
        el={emptyLoop}
        sectionKey="body"
        index={1}
        totalCount={3}
        parentContainerId="cont-parent-1"
        currentGroups={[]}
        isExpanded={true}
        onToggleExpand={vi.fn()}
        draggedElementId={null}
        dragOverElementId={null}
        onDragStart={vi.fn()}
        onDragOver={vi.fn()}
        onDragLeave={vi.fn()}
        onDrop={vi.fn()}
        onDragEnd={vi.fn()}
      />
    )

    expect(getByText('Loop (items)')).toBeInTheDocument()
    expect(getByText('Loop vazio')).toBeInTheDocument()
    expect(container).toMatchSnapshot()

    // Move up with parentContainerId
    fireEvent.click(getAllByTitle('Mover para cima')[0])

    // Move down with parentContainerId
    fireEvent.click(getAllByTitle('Mover para baixo')[0])

    // Delete with parentContainerId
    fireEvent.click(getAllByTitle('Excluir')[0])
  })
})
