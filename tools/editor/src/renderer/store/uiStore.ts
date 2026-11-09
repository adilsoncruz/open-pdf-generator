import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ElementLocation } from './templateStore'

export type Theme = 'light' | 'dark'
export type SidebarTab = 'elements' | 'document' | 'history'

export interface ContextMenuState {
  x: number
  y: number
  targetType: 'element' | 'canvas' | 'container'
  elementId?: string
  containerId?: string
  loopId?: string
  location?: ElementLocation
}

interface UIStore {
  theme: Theme
  zoom: number
  snapToGuides: boolean
  sidebarTab: SidebarTab
  contextMenu: ContextMenuState | null
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setZoom: (zoom: number) => void
  toggleSnapToGuides: () => void
  setSidebarTab: (tab: SidebarTab) => void
  openContextMenu: (menu: ContextMenuState) => void
  closeContextMenu: () => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      theme: 'dark', // Default to dark theme
      zoom: 100,
      snapToGuides: true,
      sidebarTab: 'elements',
      contextMenu: null,
      setSidebarTab: (sidebarTab) => set({ sidebarTab }),
      openContextMenu: (contextMenu) => set({ contextMenu }),
      closeContextMenu: () => set({ contextMenu: null }),
      
      setTheme: (theme) => {
        set({ theme })
        // Apply theme to document
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
      
      toggleTheme: () => {
        const currentTheme = get().theme
        const newTheme = currentTheme === 'light' ? 'dark' : 'light'
        get().setTheme(newTheme)
      },

      setZoom: (zoom) => {
        set({ zoom: Math.max(25, Math.min(300, zoom)) })
      },

      toggleSnapToGuides: () => {
        set((state) => ({ snapToGuides: !state.snapToGuides }))
      },
    }),
    {
      name: 'pdf-editor-ui-settings',
      partialize: (state) => ({
        theme: state.theme,
        zoom: state.zoom,
        snapToGuides: state.snapToGuides,
        sidebarTab: state.sidebarTab,
      }),
      onRehydrateStorage: () => (state) => {
        const activeTheme = state?.theme ?? 'dark'
        if (activeTheme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
    }
  )
)

if (typeof document !== 'undefined') {
  const initialTheme = useUIStore.getState().theme
  document.documentElement.classList.toggle('dark', initialTheme === 'dark')
}















