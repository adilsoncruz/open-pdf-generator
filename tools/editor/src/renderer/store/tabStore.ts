import { create } from 'zustand'
import { useTemplateStore, type Template } from './templateStore'

export interface Tab {
  id: string
  name: string
  path: string | null
  isDirty: boolean
  stateSnapshot: any
}

interface TabStore {
  tabs: Tab[]
  activeTabId: string | null

  addTab: (tabData: { name: string; path: string | null; isDirty?: boolean; stateSnapshot?: any }) => void
  closeTab: (id: string) => void
  switchTab: (id: string) => void
  updateActiveTab: (updates: Partial<Tab>) => void
  closeAllTabs: () => void
  createNewTemplateTab: () => void
}

export const createDefaultTemplate = (): Template => ({
  version: '1.0',
  metadata: {
    name: 'New Template',
    description: '',
    author: '',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
  },
  pageSettings: {
    size: 'A4',
    orientation: 'portrait',
    margins: { top: 30, right: 30, bottom: 30, left: 30 },
  },
  page: [
    {
      type: 'container',
      id: 'container-body-1',
      name: 'Container 1',
      x: 0,
      y: 0,
      width: '100%',
      height: 200,
      elements: [],
    },
  ],
})

export const useTabStore = create<TabStore>((set, get) => ({
  tabs: [],
  activeTabId: null,

  addTab: (tabData) => {
    const currentActiveId = get().activeTabId
    if (currentActiveId) {
      const currentState = useTemplateStore.getState()
      set((state) => ({
        tabs: state.tabs.map((t) =>
          t.id === currentActiveId
            ? {
                ...t,
                stateSnapshot: {
                  template: currentState.template,
                  currentFilePath: currentState.currentFilePath,
                  isDirty: currentState.isDirty,
                  history: currentState.history,
                  historyIndex: currentState.historyIndex,
                  selectedElementIds: currentState.selectedElementIds,
                  selectedElementLocation: currentState.selectedElementLocation,
                  selectedGroupId: currentState.selectedGroupId,
                  currentSection: currentState.currentSection,
                },
                isDirty: currentState.isDirty,
                path: currentState.currentFilePath,
                name: currentState.currentFilePath
                  ? currentState.currentFilePath.split(/[/\\]/).pop() || 'Untitled'
                  : currentState.template?.metadata?.name || 'Untitled',
              }
            : t
        ),
      }))
    }

    const newTab: Tab = {
      id: 'tab_' + Math.random().toString(36).substring(2, 9),
      name: tabData.name,
      path: tabData.path,
      isDirty: tabData.isDirty ?? false,
      stateSnapshot: tabData.stateSnapshot || null,
    }

    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id,
    }))

    if (newTab.stateSnapshot) {
      useTemplateStore.setState({
        ...newTab.stateSnapshot,
        selectedElementIds: [],
        selectedGroupId: null,
      })
    }
  },

  createNewTemplateTab: () => {
    const defaultTemplate = createDefaultTemplate()
    get().addTab({
      name: 'New Template',
      path: null,
      isDirty: false,
      stateSnapshot: {
        template: defaultTemplate,
        currentFilePath: null,
        isDirty: false,
        history: [defaultTemplate],
        historyIndex: 0,
        selectedElementIds: [],
        selectedElementLocation: 'body',
        selectedGroupId: null,
        currentSection: 'body',
      },
    })
  },

  switchTab: (id: string) => {
    const currentActiveId = get().activeTabId
    if (currentActiveId === id) return

    if (currentActiveId) {
      const currentState = useTemplateStore.getState()
      set((state) => ({
        tabs: state.tabs.map((t) =>
          t.id === currentActiveId
            ? {
                ...t,
                stateSnapshot: {
                  template: currentState.template,
                  currentFilePath: currentState.currentFilePath,
                  isDirty: currentState.isDirty,
                  history: currentState.history,
                  historyIndex: currentState.historyIndex,
                  selectedElementIds: currentState.selectedElementIds,
                  selectedElementLocation: currentState.selectedElementLocation,
                  selectedGroupId: currentState.selectedGroupId,
                  currentSection: currentState.currentSection,
                },
                isDirty: currentState.isDirty,
                path: currentState.currentFilePath,
                name: currentState.currentFilePath
                  ? currentState.currentFilePath.split(/[/\\]/).pop() || 'Untitled'
                  : currentState.template?.metadata?.name || 'Untitled',
              }
            : t
        ),
      }))
    }

    const targetTab = get().tabs.find((t) => t.id === id)
    if (targetTab && targetTab.stateSnapshot) {
      useTemplateStore.setState({
        ...targetTab.stateSnapshot,
        selectedElementIds: [],
        selectedGroupId: null,
      })
    }

    set({ activeTabId: id })
  },

  closeTab: (id: string) => {
    const { tabs, activeTabId } = get()
    const tabToClose = tabs.find((t) => t.id === id)

    if (tabToClose?.isDirty) {
      const confirmed = window.confirm(`"${tabToClose.name}" possui alterações não salvas. Deseja fechar mesmo assim?`)
      if (!confirmed) return
    }

    const remainingTabs = tabs.filter((t) => t.id !== id)

    if (remainingTabs.length === 0) {
      // Re-create a fresh blank tab so the editor never sits blank
      const defaultTemplate = createDefaultTemplate()
      const fallbackTab: Tab = {
        id: 'tab_' + Math.random().toString(36).substring(2, 9),
        name: 'New Template',
        path: null,
        isDirty: false,
        stateSnapshot: {
          template: defaultTemplate,
          currentFilePath: null,
          isDirty: false,
          history: [defaultTemplate],
          historyIndex: 0,
          selectedElementIds: [],
          selectedElementLocation: 'body',
          selectedGroupId: null,
          currentSection: 'body',
        },
      }
      set({
        tabs: [fallbackTab],
        activeTabId: fallbackTab.id,
      })
      useTemplateStore.setState({
        ...fallbackTab.stateSnapshot,
      })
      return
    }

    if (activeTabId === id) {
      const closedIndex = tabs.findIndex((t) => t.id === id)
      const nextTab = remainingTabs[Math.min(closedIndex, remainingTabs.length - 1)]
      set({
        tabs: remainingTabs,
        activeTabId: nextTab.id,
      })
      if (nextTab.stateSnapshot) {
        useTemplateStore.setState({
          ...nextTab.stateSnapshot,
          selectedElementIds: [],
          selectedGroupId: null,
        })
      }
    } else {
      set({ tabs: remainingTabs })
    }
  },

  updateActiveTab: (updates) => {
    const activeTabId = get().activeTabId
    if (activeTabId) {
      set((state) => ({
        tabs: state.tabs.map((t) => (t.id === activeTabId ? { ...t, ...updates } : t)),
      }))
    }
  },

  closeAllTabs: () => {
    set({ tabs: [], activeTabId: null })
  },
}))
