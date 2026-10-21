import { describe, it, expect, beforeEach } from 'vitest'
import { getNextNewTemplateName, useTabStore, type Tab } from './tabStore'

describe('tabStore new template naming', () => {
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
})
