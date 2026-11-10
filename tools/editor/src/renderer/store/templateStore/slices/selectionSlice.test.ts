import { describe, it, expect, beforeEach } from 'vitest'
import { useTemplateStore } from '../../templateStore'
import { defaultTemplate } from '../helpers'

describe('selectionSlice', () => {
  beforeEach(() => {
    useTemplateStore.setState({
      template: JSON.parse(JSON.stringify(defaultTemplate)),
      history: [defaultTemplate],
      historyIndex: 0,
      selectedElementIds: [],
    })
    useTemplateStore.getState().addElement({
      type: 'text',
      id: 'text-1',
      x: 10,
      y: 10,
      width: 100,
      height: 20,
      value: 'T1',
    })
    useTemplateStore.getState().addElement({
      type: 'text',
      id: 'text-2',
      x: 10,
      y: 40,
      width: 100,
      height: 20,
      value: 'T2',
    })
  })

  it('selects, toggles and clears elements', () => {
    const { selectElement, toggleElementSelection, selectMultipleElements, clearSelection, selectAllElements } =
      useTemplateStore.getState()

    selectElement('text-1')
    expect(useTemplateStore.getState().selectedElementIds).toEqual(['text-1'])

    // Toggle
    toggleElementSelection('text-2')
    expect(useTemplateStore.getState().selectedElementIds).toEqual(['text-1', 'text-2'])

    toggleElementSelection('text-1')
    expect(useTemplateStore.getState().selectedElementIds).toEqual(['text-2'])

    // Multiple
    selectMultipleElements(['text-1', 'text-2'])
    expect(useTemplateStore.getState().selectedElementIds).toEqual(['text-1', 'text-2'])

    // Select all
    selectAllElements()
    expect(useTemplateStore.getState().selectedElementIds.length).toBeGreaterThanOrEqual(2)

    // Clear
    clearSelection()
    expect(useTemplateStore.getState().selectedElementIds).toEqual([])
  })

  it('handles selectGroup and selectAllElements for each section', () => {
    const { selectGroup, selectAllElements } = useTemplateStore.getState()

    selectGroup('grp-1', 'header')
    expect(useTemplateStore.getState().selectedGroupId).toBe('grp-1')
    expect(useTemplateStore.getState().selectedElementLocation).toBe('header')

    // Header selectAll
    useTemplateStore.setState({
      currentSection: 'header',
      template: {
        ...useTemplateStore.getState().template,
        pageSettings: {
          ...useTemplateStore.getState().template.pageSettings,
          header: {
            elements: [{ id: 'hdr-1', type: 'text', x: 0, y: 0, width: 10, height: 10 } as any],
          } as any,
          footer: {
            elements: [{ id: 'ftr-1', type: 'text', x: 0, y: 0, width: 10, height: 10 } as any],
          } as any,
          bodyBackground: {
            elements: [{ id: 'bg-1', type: 'text', x: 0, y: 0, width: 10, height: 10 } as any],
          } as any,
        },
        summaryPage: {
          elements: [{ id: 'sum-1', type: 'text', x: 0, y: 0, width: 10, height: 10 } as any],
        } as any,
      },
    })

    selectAllElements()
    expect(useTemplateStore.getState().selectedElementIds).toEqual(['hdr-1'])

    // Footer selectAll
    useTemplateStore.setState({ currentSection: 'footer' })
    selectAllElements()
    expect(useTemplateStore.getState().selectedElementIds).toEqual(['ftr-1'])

    // BodyBackground selectAll
    useTemplateStore.setState({ currentSection: 'bodyBackground' })
    selectAllElements()
    expect(useTemplateStore.getState().selectedElementIds).toEqual(['bg-1'])

    // Summary selectAll
    useTemplateStore.setState({ currentSection: 'summary' })
    selectAllElements()
    expect(useTemplateStore.getState().selectedElementIds).toEqual(['sum-1'])
  })

  it('handles loop and container child selection and expansion toggling', () => {
    const {
      selectLoopChild,
      clearLoopChildSelection,
      selectContainerChild,
      clearContainerChildSelection,
      toggleLoopExpanded,
      toggleContainerExpanded,
    } = useTemplateStore.getState()

    // Loops
    toggleLoopExpanded('loop-1')
    expect(useTemplateStore.getState().expandedLoopIds).toContain('loop-1')
    toggleLoopExpanded('loop-1')
    expect(useTemplateStore.getState().expandedLoopIds).not.toContain('loop-1')

    selectLoopChild('loop-1', 'child-1')
    expect(useTemplateStore.getState().selectedLoopChildId).toBe('child-1')
    expect(useTemplateStore.getState().selectedLoopParentId).toBe('loop-1')

    clearLoopChildSelection()
    expect(useTemplateStore.getState().selectedLoopChildId).toBeNull()

    // Containers
    toggleContainerExpanded('c-1')
    expect(useTemplateStore.getState().expandedContainerIds).toContain('c-1')
    toggleContainerExpanded('c-1')
    expect(useTemplateStore.getState().expandedContainerIds).not.toContain('c-1')

    selectContainerChild('c-1', 'child-c1')
    expect(useTemplateStore.getState().selectedContainerChildId).toBe('child-c1')

    clearContainerChildSelection()
    expect(useTemplateStore.getState().selectedContainerChildId).toBeNull()
  })
})
