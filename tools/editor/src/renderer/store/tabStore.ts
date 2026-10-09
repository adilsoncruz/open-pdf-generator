import { create } from 'zustand'
import { useTemplateStore } from './templateStore'

export interface Tab {
  id: string
  name: string
  path: string | null
  isDirty: boolean
  stateSnapshot: any // will hold the snapshot of templateStore
}

interface TabStore {
  tabs: Tab[]
  activeTabId: string | null
  
  addTab: (tab: Omit<Tab, 'id' | 'stateSnapshot'> & { stateSnapshot?: any }) => void
  closeTab: (id: string) => void
  switchTab: (id: string) => void
  updateActiveTab: (updates: Partial<Tab>) => void
  closeAllTabs: () => void
}

export const useTabStore = create<TabStore>((set, get) => ({
  tabs: [],
  activeTabId: null,

  addTab: (tabData) => {
    // save current state to active tab before switching
    const currentActiveId = get().activeTabId
    if (currentActiveId) {
      const currentState = useTemplateStore.getState()
      set((state) => ({
        tabs: state.tabs.map(t => 
          t.id === currentActiveId 
            ? { ...t, stateSnapshot: currentState } 
            : t
        )
      }))
    }

    const newTab: Tab = {
      id: Math.random().toString(36).substring(7),
      name: tabData.name,
      path: tabData.path,
      isDirty: tabData.isDirty,
      stateSnapshot: tabData.stateSnapshot || null
    }

    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id
    }))

    if (newTab.stateSnapshot) {
      useTemplateStore.setState(newTab.stateSnapshot)
    }
  },

  switchTab: (id: string) => {
    const currentActiveId = get().activeTabId
    if (currentActiveId === id) return

    // save current state to active tab
    if (currentActiveId) {
      const currentState = useTemplateStore.getState()
      set((state) => ({
        tabs: state.tabs.map(t => 
          t.id === currentActiveId 
            ? { ...t, stateSnapshot: currentState, isDirty: currentState.isDirty, path: currentState.currentFilePath, name: currentState.currentFilePath ? currentState.currentFilePath.split('/').pop() || 'Untitled' : 'Untitled' } 
            : t
        )
      }))
    }

    const targetTab = get().tabs.find(t => t.id === id)
    if (targetTab && targetTab.stateSnapshot) {
      useTemplateStore.setState(targetTab.stateSnapshot)
    }

    set({ activeTabId: id })
  },

  closeTab: (id: string) => {
    const { tabs, activeTabId } = get()
    const newTabs = tabs.filter(t => t.id !== id)
    
    if (newTabs.length === 0) {
      // create a default empty tab?
      // For now, let it be empty
      set({ tabs: [], activeTabId: null })
    } else if (activeTabId === id) {
      // switch to the last tab
      get().switchTab(newTabs[newTabs.length - 1].id)
      set({ tabs: newTabs })
    } else {
      set({ tabs: newTabs })
    }
  },

  updateActiveTab: (updates) => {
    const activeTabId = get().activeTabId
    if (activeTabId) {
      set((state) => ({
        tabs: state.tabs.map(t => t.id === activeTabId ? { ...t, ...updates } : t)
      }))
    }
  },

  closeAllTabs: () => {
    set({ tabs: [], activeTabId: null })
  }
}))
