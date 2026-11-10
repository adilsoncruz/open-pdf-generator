import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getNextNewTemplateName, useTabStore, type Tab } from './tabStore'
import { useTemplateStore } from './templateStore'

describe('tabStore', () => {
  beforeEach(() => {
    useTabStore.setState({ tabs: [], activeTabId: null })
  })

  it('generates New Template for first tab, then New Template 2, New Template 3', () => {
    const tabs: Tab[] = []
    expect(getNextNewTemplateName(tabs)).toBe('New Template')

    tabs.push({ id: '1', name: 'New Template', path: null, isDirty: false, stateSnapshot: null })
    expect(getNextNewTemplateName(tabs)).toBe('New Template 2')

    tabs.push({ id: '2', name: 'New Template 2', path: null, isDirty: false, stateSnapshot: null })
    expect(getNextNewTemplateName(tabs)).toBe('New Template 3')
  })

  it('reuses available gap in sequence', () => {
    const tabs: Tab[] = [
      { id: '1', name: 'New Template', path: null, isDirty: false, stateSnapshot: null },
      { id: '3', name: 'New Template 3', path: null, isDirty: false, stateSnapshot: null },
    ]
    expect(getNextNewTemplateName(tabs)).toBe('New Template 2')
  })

  it('creates new tabs with distinct names and metadata in store', () => {
    const { createNewTemplateTab } = useTabStore.getState()
    createNewTemplateTab()
    expect(useTabStore.getState().tabs[0].name).toBe('New Template')
    expect(useTabStore.getState().tabs[0].stateSnapshot.template.metadata.name).toBe('New Template')

    createNewTemplateTab()
    expect(useTabStore.getState().tabs[1].name).toBe('New Template 2')
    expect(useTabStore.getState().tabs[1].stateSnapshot.template.metadata.name).toBe('New Template 2')

    createNewTemplateTab()
    expect(useTabStore.getState().tabs[2].name).toBe('New Template 3')
    expect(useTabStore.getState().tabs[2].stateSnapshot.template.metadata.name).toBe('New Template 3')
  })

  it('switches between tabs and takes state snapshots', () => {
    const { createNewTemplateTab, switchTab } = useTabStore.getState()
    createNewTemplateTab()
    const tab1Id = useTabStore.getState().tabs[0].id

    createNewTemplateTab()
    const tab2Id = useTabStore.getState().tabs[1].id

    expect(useTabStore.getState().activeTabId).toBe(tab2Id)

    // Modify template state for tab 2
    useTemplateStore.setState({ isDirty: true, currentFilePath: '/path/to/invoice.json' })

    // Switch back to tab 1
    switchTab(tab1Id)
    expect(useTabStore.getState().activeTabId).toBe(tab1Id)
    // Check that tab 2 took snapshot of dirty and path
    const updatedTab2 = useTabStore.getState().tabs.find((t) => t.id === tab2Id)
    expect(updatedTab2?.isDirty).toBe(true)
    expect(updatedTab2?.path).toBe('/path/to/invoice.json')
    expect(updatedTab2?.name).toBe('invoice.json')

    // Switching to already active tab is a no-op
    switchTab(tab1Id)
    expect(useTabStore.getState().activeTabId).toBe(tab1Id)
  })

  it('handles closing tabs and fallback when all closed', () => {
    const { createNewTemplateTab, closeTab, closeAllTabs, updateActiveTab } = useTabStore.getState()
    createNewTemplateTab()
    createNewTemplateTab()
    const [tab1, tab2] = useTabStore.getState().tabs

    // Update active tab
    updateActiveTab({ isDirty: true })
    expect(useTabStore.getState().tabs.find((t) => t.id === tab2.id)?.isDirty).toBe(true)

    // Confirm cancel on dirty tab
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    closeTab(tab2.id)
    expect(useTabStore.getState().tabs.length).toBe(2)

    // Confirm ok on dirty tab
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    closeTab(tab2.id)
    expect(useTabStore.getState().tabs.length).toBe(1)
    expect(useTabStore.getState().activeTabId).toBe(tab1.id)

    // Close remaining tab triggers fallback tab creation
    closeTab(tab1.id)
    expect(useTabStore.getState().tabs.length).toBe(1)
    expect(useTabStore.getState().tabs[0].name).toBe('New Template')

    // Close all tabs
    closeAllTabs()
    expect(useTabStore.getState().tabs.length).toBe(0)
    expect(useTabStore.getState().activeTabId).toBeNull()
  })
})
