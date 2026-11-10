import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ContextMenu } from './ContextMenu'
import { ContextMenuPortal } from './ContextMenuPortal'
import { useUIStore } from '../../store/uiStore'
import { useTemplateStore } from '../../store/templateStore'
import type { Element } from '../../store/templateStore/types'

describe('ContextMenu Component', () => {
  const mockElement: Element = {
    id: 'text-1',
    type: 'text',
    x: 100,
    y: 100,
    width: 200,
    height: 50,
    value: 'Hello World',
  }

  beforeEach(() => {
    useUIStore.setState({ contextMenu: null })
    useTemplateStore.setState({
      template: {
        id: 'tpl-1',
        name: 'Test Template',
        version: '1.0',
        metadata: { name: 'Test Template' },
        pageSettings: {
          size: 'A4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
        },
        page: [mockElement],
      },
      selectedElementIds: ['text-1'],
      selectedElementLocation: 'body',
      copiedElements: null,
    })
  })

  it('renders nothing when contextMenu is null', () => {
    const { container } = render(<ContextMenu />)
    expect(container.firstChild).toBeNull()
  })

  it('renders menu when contextMenu is set with element target', () => {
    useUIStore.getState().openContextMenu({
      x: 150,
      y: 200,
      targetType: 'element',
      elementId: 'text-1',
    })

    render(<ContextMenu />)

    expect(screen.getByText('#text-1')).toBeDefined()
    expect(screen.getByText('text')).toBeDefined()
    expect(screen.getByText('Copiar')).toBeDefined()
    expect(screen.getByText('Colar')).toBeDefined()
    expect(screen.getByText('Duplicar')).toBeDefined()
    expect(document.body).toMatchSnapshot()
    expect(screen.getByText('Ocultar Elemento')).toBeDefined()
    expect(screen.getByText('Trazer para frente')).toBeDefined()
    expect(screen.getByText('Enviar para trás')).toBeDefined()
    expect(screen.getByText('Excluir')).toBeDefined()
  })

  it('copies and closes context menu on "Copiar" click', () => {
    const copyElementSpy = vi.spyOn(useTemplateStore.getState(), 'copyElement')
    const closeContextMenuSpy = vi.spyOn(useUIStore.getState(), 'closeContextMenu')

    useUIStore.getState().openContextMenu({
      x: 150,
      y: 200,
      targetType: 'element',
      elementId: 'text-1',
    })

    render(<ContextMenu />)

    fireEvent.click(screen.getByText('Copiar'))

    expect(copyElementSpy).toHaveBeenCalled()
    expect(closeContextMenuSpy).toHaveBeenCalled()
  })

  it('duplicates and closes context menu on "Duplicar" click', () => {
    const copyElementSpy = vi.spyOn(useTemplateStore.getState(), 'copyElement')
    const pasteElementSpy = vi.spyOn(useTemplateStore.getState(), 'pasteElement')
    const closeContextMenuSpy = vi.spyOn(useUIStore.getState(), 'closeContextMenu')

    useUIStore.getState().openContextMenu({
      x: 150,
      y: 200,
      targetType: 'element',
      elementId: 'text-1',
    })

    render(<ContextMenu />)

    fireEvent.click(screen.getByText('Duplicar'))

    expect(copyElementSpy).toHaveBeenCalled()
    expect(pasteElementSpy).toHaveBeenCalled()
    expect(closeContextMenuSpy).toHaveBeenCalled()
  })

  it('pastes element when clipboard has items', () => {
    const pasteElementSpy = vi.spyOn(useTemplateStore.getState(), 'pasteElement')
    const closeContextMenuSpy = vi.spyOn(useUIStore.getState(), 'closeContextMenu')

    useTemplateStore.setState({
      copiedElements: { elements: [mockElement], sourceLocation: 'body' },
    })

    useUIStore.getState().openContextMenu({
      x: 150,
      y: 200,
      targetType: 'element',
      elementId: 'text-1',
    })

    render(<ContextMenu />)

    const pasteBtn = screen.getByText('Colar').closest('button')!
    expect(pasteBtn.disabled).toBe(false)
    fireEvent.click(pasteBtn)

    expect(pasteElementSpy).toHaveBeenCalled()
    expect(closeContextMenuSpy).toHaveBeenCalled()
  })

  it('toggles element visibility', () => {
    const toggleVisibilitySpy = vi.spyOn(useTemplateStore.getState(), 'toggleElementVisibility')

    useUIStore.getState().openContextMenu({
      x: 150,
      y: 200,
      targetType: 'element',
      elementId: 'text-1',
    })

    render(<ContextMenu />)

    fireEvent.click(screen.getByText('Ocultar Elemento'))

    expect(toggleVisibilitySpy).toHaveBeenCalledWith('text-1', 'body')
  })

  it('reorders element to front', () => {
    const reorderElementSpy = vi.spyOn(useTemplateStore.getState(), 'reorderElement')

    useUIStore.getState().openContextMenu({
      x: 150,
      y: 200,
      targetType: 'element',
      elementId: 'text-1',
    })

    render(<ContextMenu />)

    fireEvent.click(screen.getByText('Trazer para frente'))
    expect(reorderElementSpy).toHaveBeenCalledWith('text-1', 9999, 'body')
  })

  it('reorders element to back', () => {
    const reorderElementSpy = vi.spyOn(useTemplateStore.getState(), 'reorderElement')

    useUIStore.getState().openContextMenu({
      x: 150,
      y: 200,
      targetType: 'element',
      elementId: 'text-1',
    })

    render(<ContextMenu />)

    fireEvent.click(screen.getByText('Enviar para trás'))
    expect(reorderElementSpy).toHaveBeenCalledWith('text-1', 0, 'body')
  })

  it('deletes single element', () => {
    const deleteElementSpy = vi.spyOn(useTemplateStore.getState(), 'deleteElement')

    useUIStore.getState().openContextMenu({
      x: 150,
      y: 200,
      targetType: 'element',
      elementId: 'text-1',
    })

    render(<ContextMenu />)

    fireEvent.click(screen.getByText('Excluir'))
    expect(deleteElementSpy).toHaveBeenCalledWith('text-1', 'body')
  })

  it('shows group option when 2+ elements are selected', () => {
    const el2: Element = { id: 'text-2', type: 'text', x: 20, y: 20, width: 100, height: 20 }
    useTemplateStore.setState((s) => ({
      template: { ...s.template, page: [...s.template.page, el2] },
      selectedElementIds: ['text-1', 'text-2'],
    }))

    const createGroupSpy = vi.spyOn(useTemplateStore.getState(), 'createGroup')

    useUIStore.getState().openContextMenu({
      x: 150,
      y: 200,
      targetType: 'element',
      elementId: 'text-1',
    })

    render(<ContextMenu />)

    const groupButton = screen.getByText(/Agrupar Seleção \(2\)/)
    expect(groupButton).toBeDefined()

    fireEvent.click(groupButton)
    expect(createGroupSpy).toHaveBeenCalledWith('Grupo 1', ['text-1', 'text-2'], 'body')
  })

  it('shows quick add elements when targetType is canvas', () => {
    const addElementSpy = vi.spyOn(useTemplateStore.getState(), 'addElement')

    useUIStore.getState().openContextMenu({
      x: 300,
      y: 400,
      targetType: 'canvas',
    })

    render(<ContextMenu />)

    expect(screen.getByText('Adicionar Elemento')).toBeDefined()
    expect(screen.getByText('Texto Dinâmico')).toBeDefined()
    expect(screen.getByText('Texto Estático')).toBeDefined()
    expect(screen.getByText('Container')).toBeDefined()
    expect(screen.getByText('Retângulo')).toBeDefined()
    expect(screen.getByText('Linha')).toBeDefined()

    fireEvent.click(screen.getByText('Texto Dinâmico'))
    expect(addElementSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'text', dataBinding: 'field' }),
      'body'
    )
  })

  it('closes on Escape key', () => {
    const closeContextMenuSpy = vi.spyOn(useUIStore.getState(), 'closeContextMenu')

    useUIStore.getState().openContextMenu({
      x: 100,
      y: 100,
      targetType: 'canvas',
    })

    render(<ContextMenu />)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(closeContextMenuSpy).toHaveBeenCalled()
  })

  it('closes on outside click', () => {
    const closeContextMenuSpy = vi.spyOn(useUIStore.getState(), 'closeContextMenu')

    useUIStore.getState().openContextMenu({
      x: 100,
      y: 100,
      targetType: 'canvas',
    })

    render(
      <div>
        <div data-testid="outside">Outside area</div>
        <ContextMenu />
      </div>
    )

    fireEvent.mouseDown(screen.getByTestId('outside'))
    expect(closeContextMenuSpy).toHaveBeenCalled()
  })

  it('flips position when overflowing viewport boundaries in ContextMenuPortal', () => {
    const onClose = vi.fn()
    // Window inner dimensions in jsdom are 1024x768 by default
    // If x = 900 (menuWidth = 210, 900 + 210 = 1110 > 1014), it flips to 900 - 210 = 690
    // If y = 700 (menuHeight = 310, 700 + 310 = 1010 > 758), it flips to 700 - 310 = 390
    const { container } = render(
      <ContextMenuPortal x={900} y={700} onClose={onClose}>
        <span>Inside Portal</span>
      </ContextMenuPortal>
    )

    const menuEl = container.ownerDocument.body.querySelector('.fixed') as HTMLElement
    expect(menuEl).toBeDefined()
    expect(menuEl.style.left).toBe('690px')
    expect(menuEl.style.top).toBe('390px')
  })

  it('handles ungroup, edit group, bring to front, send to back, and delete container child', () => {
    const ungroupSpy = vi.spyOn(useTemplateStore.getState(), 'ungroupElements').mockImplementation(() => {})
    const selectGroupSpy = vi.spyOn(useTemplateStore.getState(), 'selectGroup').mockImplementation(() => {})
    const reorderSpy = vi.spyOn(useTemplateStore.getState(), 'reorderElement').mockImplementation(() => {})
    const deleteChildSpy = vi.spyOn(useTemplateStore.getState(), 'deleteLoopChildElement').mockImplementation(() => {})

    useTemplateStore.setState({
      template: {
        ...useTemplateStore.getState().template,
        groups: [{ id: 'grp-active', name: 'MyGroup', elementIds: ['text-1'], location: 'body' as const }],
      },
      selectedElementIds: ['text-1'],
      selectedGroupId: 'grp-active',
    })

    useUIStore.getState().openContextMenu({
      x: 100,
      y: 100,
      targetType: 'element',
      elementId: 'text-1',
      containerId: 'loop-parent-1',
      location: 'body',
    })

    const { getByText, rerender } = render(<ContextMenu />)

    // Edit group
    fireEvent.click(getByText('Propriedades do Grupo'))
    expect(selectGroupSpy).toHaveBeenCalledWith('grp-active', 'body')

    // Reopen menu for ungroup
    useTemplateStore.setState({ selectedElementIds: ['text-1'], selectedGroupId: 'grp-active' })
    useUIStore.getState().openContextMenu({
      x: 100,
      y: 100,
      targetType: 'element',
      elementId: 'text-1',
      location: 'body',
    })
    rerender(<ContextMenu />)
    fireEvent.click(getByText('Desagrupar'))
    expect(ungroupSpy).toHaveBeenCalledWith('grp-active', 'body')

    // Reopen menu for bring to front & send to back
    useUIStore.getState().openContextMenu({
      x: 100,
      y: 100,
      targetType: 'element',
      elementId: 'text-1',
      location: 'body',
    })
    rerender(<ContextMenu />)
    fireEvent.click(getByText('Trazer para frente'))
    expect(reorderSpy).toHaveBeenCalledWith('text-1', 9999, 'body')

    useUIStore.getState().openContextMenu({
      x: 100,
      y: 100,
      targetType: 'element',
      elementId: 'text-1',
      location: 'body',
    })
    rerender(<ContextMenu />)
    fireEvent.click(getByText('Enviar para trás'))
    expect(reorderSpy).toHaveBeenCalledWith('text-1', 0, 'body')

    // Delete loop child element
    useUIStore.getState().openContextMenu({
      x: 100,
      y: 100,
      targetType: 'element',
      elementId: 'text-1',
      containerId: 'loop-parent-1',
      location: 'body',
    })
    rerender(<ContextMenu />)
    fireEvent.click(getByText('Excluir'))
    expect(deleteChildSpy).toHaveBeenCalledWith('loop-parent-1', 'text-1', 'body')
  })
})
