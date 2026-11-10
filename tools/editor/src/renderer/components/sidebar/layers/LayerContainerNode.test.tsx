import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { LayerContainerNode } from './LayerContainerNode'
import type { Element } from '../../../store/templateStore'

describe('LayerContainerNode', () => {
  const containerEl: Element = {
    type: 'container',
    id: 'container-node-1',
    name: 'container-node-1',
    elements: [
      { type: 'text', id: 'c-text-1', name: 'c-text-1', x: 0, y: 0, width: 50, height: 20, value: 'Child item' },
      {
        type: 'loop',
        id: 'c-loop-1',
        name: 'c-loop-1',
        elements: [
          { type: 'text', id: 'loop-child-1', name: 'loop-child-1', x: 0, y: 0, width: 40, height: 20 },
        ],
      },
    ],
  }

  it('renders container node with children and nested loop and matches snapshot', () => {
    const onToggleExpand = vi.fn()
    const { getByText, container } = render(
      <LayerContainerNode
        el={containerEl}
        sectionKey="body"
        index={0}
        totalCount={1}
        currentGroups={[]}
        isExpanded={true}
        onToggleExpand={onToggleExpand}
        isLoopExpanded={() => true}
        onToggleLoopExpand={vi.fn()}
        draggedElementId={null}
        dragOverElementId={null}
        onDragStart={vi.fn()}
        onDragOver={vi.fn()}
        onDragLeave={vi.fn()}
        onDrop={vi.fn()}
        onDragEnd={vi.fn()}
      />
    )

    expect(getByText(/container-node-1/)).toBeInTheDocument()
    expect(getByText('Child item')).toBeInTheDocument()
    expect(getByText(/c-loop-1/)).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('handles item actions, move up/down, visibility, delete and drag events', () => {
    const onToggleExpand = vi.fn()
    const onDragStart = vi.fn()
    const onDragOver = vi.fn()
    const onDragLeave = vi.fn()
    const onDrop = vi.fn()
    const onDragEnd = vi.fn()

    const { getByText, getAllByText, getAllByTitle } = render(
      <LayerContainerNode
        el={containerEl}
        sectionKey="body"
        index={1}
        totalCount={3}
        currentGroups={[]}
        isExpanded={true}
        onToggleExpand={onToggleExpand}
        isLoopExpanded={() => true}
        onToggleLoopExpand={vi.fn()}
        draggedElementId={null}
        dragOverElementId={null}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
      />
    )

    // Expand button toggle click
    const toggleBtn = getAllByText('▼')[0]
    fireEvent.click(toggleBtn)
    expect(onToggleExpand).toHaveBeenCalledWith('container-node-1')

    const label = getByText(/container-node-1/)
    fireEvent.contextMenu(label)
    fireEvent.click(label, { shiftKey: true })
    fireEvent.click(label)

    const upButtons = getAllByTitle('Mover para cima')
    fireEvent.click(upButtons[0])
    const downButtons = getAllByTitle('Mover para baixo')
    fireEvent.click(downButtons[0])
    const visButtons = getAllByTitle('Ocultar')
    fireEvent.click(visButtons[0])

    fireEvent.dragStart(label)
    fireEvent.dragOver(label)
    fireEvent.dragLeave(label)
    fireEvent.drop(label)
    fireEvent.dragEnd(label)

    // Delete container
    const deleteBtn = getAllByTitle('Excluir')[0]
    fireEvent.click(deleteBtn)

    // Drop on child element to trigger reorder
    const childEl = getByText('Child item')
    fireEvent.drop(childEl)
  })

  it('renders empty container state', () => {
    const emptyContainer: Element = {
      type: 'container',
      id: 'c-empty',
      elements: [],
    }

    const { getByText, container } = render(
      <LayerContainerNode
        el={emptyContainer}
        sectionKey="body"
        index={0}
        totalCount={1}
        currentGroups={[]}
        isExpanded={true}
        onToggleExpand={vi.fn()}
        isLoopExpanded={() => false}
        onToggleLoopExpand={vi.fn()}
        draggedElementId={null}
        dragOverElementId={null}
        onDragStart={vi.fn()}
        onDragOver={vi.fn()}
        onDragLeave={vi.fn()}
        onDrop={vi.fn()}
        onDragEnd={vi.fn()}
      />
    )

    expect(getByText('Container vazio')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })
})
