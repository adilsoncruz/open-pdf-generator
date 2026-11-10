import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { StudioSlateElementInspector } from './StudioSlateElementInspector'
import { useTemplateStore, type Element } from '../../../store/templateStore'

describe('StudioSlateElementInspector', () => {
  it('renders inspector for text element and handles ID change', () => {
    const onUpdate = vi.fn()
    const onStyleUpdate = vi.fn()
    const element: Element = {
      type: 'text',
      id: 'text-inspector-1',
      x: 10,
      y: 20,
      width: 150,
      height: 30,
    }

    const { getByDisplayValue, getByText, container } = render(
      <StudioSlateElementInspector
        element={element}
        onUpdate={onUpdate}
        onStyleUpdate={onStyleUpdate}
        isMultiSelection={false}
      />
    )

    expect(container).toMatchSnapshot()

    const idInput = getByDisplayValue('text-inspector-1')
    fireEvent.change(idInput, { target: { value: 'text-renamed' } })
    fireEvent.keyDown(idInput, { key: 'Enter' })
    expect(onUpdate).toHaveBeenCalledWith('id', 'text-renamed')

    // Empty ID falls back
    fireEvent.change(idInput, { target: { value: '   ' } })
    fireEvent.blur(idInput)

    // Delete single element button
    useTemplateStore.setState({ selectedElementLocation: 'body' })
    const deleteBtn = getByText('Excluir elemento')
    fireEvent.click(deleteBtn)
  })

  it('renders multi-selection header when isMultiSelection is true', () => {
    const element: Element = { type: 'text', id: 't1', x: 0, y: 0 }
    const { getAllByText, container } = render(
      <StudioSlateElementInspector
        element={element}
        onUpdate={vi.fn()}
        onStyleUpdate={vi.fn()}
        isMultiSelection={true}
        selectedCount={3}
      />
    )
    expect(getAllByText(/3 selecionados/).length).toBeGreaterThan(0)
    expect(container).toMatchSnapshot()
  })

  it('renders inspector for container, image, and list elements', () => {
    const containerEl: Element = {
      type: 'container',
      id: 'cont-ins',
      x: 0,
      y: 0,
      width: '100%',
      height: 200,
      elements: [],
    }
    const { rerender } = render(
      <StudioSlateElementInspector
        element={containerEl}
        onUpdate={vi.fn()}
        onStyleUpdate={vi.fn()}
        isMultiSelection={false}
      />
    )

    // Image
    const imgEl: Element = {
      type: 'image',
      id: 'img-ins',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      url: 'https://example.com/logo.png',
    }
    rerender(
      <StudioSlateElementInspector
        element={imgEl}
        onUpdate={vi.fn()}
        onStyleUpdate={vi.fn()}
        isMultiSelection={false}
      />
    )

    // List
    const listEl: Element = {
      type: 'list',
      id: 'list-ins',
      x: 0,
      y: 0,
      width: 200,
      height: 100,
      dataBinding: 'items',
    }
    rerender(
      <StudioSlateElementInspector
        element={listEl}
        onUpdate={vi.fn()}
        onStyleUpdate={vi.fn()}
        isMultiSelection={false}
      />
    )
  })

  it('handles element inside a group and multi-selection grouping actions', () => {
    useTemplateStore.setState({
      template: {
        ...useTemplateStore.getState().template,
        groups: [{ id: 'grp-1', name: 'My Group', elementIds: ['t1', 't2'], location: 'body' as const }],
      },
      selectedElementIds: ['t1', 't2'],
    })

    const onUpdate = vi.fn()
    const { getByText, rerender } = render(
      <StudioSlateElementInspector
        element={{ type: 'text', id: 't1', x: 0, y: 0, groupId: 'grp-1' }}
        onUpdate={onUpdate}
        onStyleUpdate={vi.fn()}
        isMultiSelection={false}
      />
    )

    expect(getByText('Grupo: My Group')).toBeInTheDocument()
    fireEvent.click(getByText('Propriedades do Grupo'))

    rerender(
      <StudioSlateElementInspector
        element={{ type: 'text', id: 't1', x: 0, y: 0 }}
        onUpdate={onUpdate}
        onStyleUpdate={vi.fn()}
        isMultiSelection={true}
        selectedCount={2}
      />
    )
    const groupBtn = getByText(/Criar Grupo com Seleção|Desagrupar/)
    fireEvent.click(groupBtn)

    // Delete multi-selection button
    const deleteMultiBtn = getByText(/Excluir 2 elementos/)
    fireEvent.click(deleteMultiBtn)

    // Test sections: header, footer, bodyBackground, summary
    const sections = ['header', 'footer', 'bodyBackground', 'summary'] as const
    sections.forEach((sec) => {
      useTemplateStore.setState({
        currentSection: sec,
        template: {
          ...useTemplateStore.getState().template,
          pageSettings: {
            ...useTemplateStore.getState().template.pageSettings,
            header: { height: 50, elements: [{ type: 'text', id: 'sec-el', x: 0, y: 0 }] },
            footer: { height: 50, elements: [{ type: 'text', id: 'sec-el', x: 0, y: 0 }] },
            bodyBackground: { elements: [{ type: 'text', id: 'sec-el', x: 0, y: 0 }] },
          },
          summaryPage: { elements: [{ type: 'text', id: 'sec-el', x: 0, y: 0 }] },
        },
      })
      rerender(
        <StudioSlateElementInspector
          element={{ type: 'text', id: 'sec-el', x: 0, y: 0 }}
          onUpdate={onUpdate}
          onStyleUpdate={vi.fn()}
          isMultiSelection={false}
        />
      )
    })
  })

  it('cleans up dataBinding on static elements and value on text elements', () => {
    const onUpdate = vi.fn()
    render(
      <StudioSlateElementInspector
        element={{ type: 'rectangle', id: 'r1', x: 0, y: 0, dataBinding: 'foo' }}
        onUpdate={onUpdate}
        onStyleUpdate={vi.fn()}
      />
    )
    expect(onUpdate).toHaveBeenCalledWith('dataBinding', undefined)

    render(
      <StudioSlateElementInspector
        element={{ type: 'text', id: 't-val', x: 0, y: 0, value: 'val' }}
        onUpdate={onUpdate}
        onStyleUpdate={vi.fn()}
      />
    )
    expect(onUpdate).toHaveBeenCalledWith('value', undefined)
  })
})
