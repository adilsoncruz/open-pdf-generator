import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LayersPanel } from './LayersPanel'
import { useTemplateStore } from '../../store/templateStore'

describe('LayersPanel', () => {
  beforeEach(() => {
    useTemplateStore.setState({
      template: {
        version: '1.0',
        metadata: { name: 'Test Template', description: '' },
        pageSettings: {
          size: 'A4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
          header: { height: 50, elements: [] },
          footer: { height: 40, elements: [] },
          bodyBackground: { elements: [] },
        },
        page: [
          {
            id: 'text-1',
            type: 'text',
            value: 'Hello World',
            x: 10,
            y: 10,
            width: 100,
            height: 20,
          },
          {
            id: 'container-1',
            type: 'container',
            name: 'Card Container',
            x: 10,
            y: 40,
            width: 200,
            height: 100,
            elements: [
              {
                id: 'text-in-container',
                type: 'text',
                value: 'Inside Card',
                x: 0,
                y: 0,
                width: 100,
                height: 20,
              },
            ],
          },
          {
            id: 'loop-1',
            type: 'loop',
            name: 'Items Loop',
            dataBinding: 'items',
            x: 10,
            y: 150,
            width: 200,
            height: 50,
            elements: [
              {
                id: 'text-in-loop',
                type: 'text',
                value: 'Item Name',
                x: 0,
                y: 0,
                width: 100,
                height: 20,
              },
            ],
          },
        ],
        summaryPage: {
          elements: [],
        },
      },
      selectedElementIds: [],
    })
  })

  it('renders all sections and responds to toggle callback', () => {
    const onToggleLayer = vi.fn()
    render(
      <LayersPanel
        currentSection="body"
        openLayer="body"
        onToggleLayer={onToggleLayer}
      />
    )

    expect(screen.getByText('Background Layer')).toBeInTheDocument()
    expect(screen.getByText('Header (50pt)')).toBeInTheDocument()
    expect(screen.getByText('Body Content')).toBeInTheDocument()
    expect(screen.getByText('Summary Band')).toBeInTheDocument()
    expect(screen.getByText('Footer (40pt)')).toBeInTheDocument()

    // Test clicking each band header calls onToggleLayer
    fireEvent.click(screen.getByText('Header (50pt)'))
    expect(onToggleLayer).toHaveBeenCalledWith('header')

    fireEvent.click(screen.getByText('Background Layer'))
    expect(onToggleLayer).toHaveBeenCalledWith('bodyBackground')

    fireEvent.click(screen.getByText('Summary Band'))
    expect(onToggleLayer).toHaveBeenCalledWith('summary')

    fireEvent.click(screen.getByText('Footer (40pt)'))
    expect(onToggleLayer).toHaveBeenCalledWith('footer')
  })

  it('toggles and closes the Add Band dropdown and matches snapshot', () => {
    const onToggleLayer = vi.fn()
    const { container } = render(
      <LayersPanel
        currentSection="body"
        openLayer="body"
        onToggleLayer={onToggleLayer}
      />
    )
    expect(container).toMatchSnapshot()

    // Find and click the add band button
    const addBandBtn = screen.getByTitle('Add')
    fireEvent.click(addBandBtn)
    expect(container).toMatchSnapshot()
  })

  it('renders elements in the open section including containers and loops', () => {
    const onToggleLayer = vi.fn()
    render(
      <LayersPanel
        currentSection="body"
        openLayer="body"
        onToggleLayer={onToggleLayer}
      />
    )

    // Elements rendered
    expect(screen.getByText('Hello World')).toBeInTheDocument()
    expect(screen.getByText('Card Container')).toBeInTheDocument()
    expect(screen.getByText('Items Loop')).toBeInTheDocument()
    expect(screen.getByText('Inside Card')).toBeInTheDocument()
    expect(screen.getByText('Item Name')).toBeInTheDocument()
  })

  it('selects element when clicked', () => {
    const onToggleLayer = vi.fn()
    render(
      <LayersPanel
        currentSection="body"
        openLayer="body"
        onToggleLayer={onToggleLayer}
      />
    )

    const textEl = screen.getByText('Hello World')
    fireEvent.click(textEl)

    expect(useTemplateStore.getState().selectedElementIds).toContain('text-1')
  })
})
