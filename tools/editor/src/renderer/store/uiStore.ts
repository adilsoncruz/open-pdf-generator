import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark'
export type SidebarTab = 'elements' | 'document' | 'history'

interface UIStore {
  theme: Theme
  zoom: number
  snapToGuides: boolean
  sidebarTab: SidebarTab
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setZoom: (zoom: number) => void
  toggleSnapToGuides: () => void
  setSidebarTab: (tab: SidebarTab) => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      theme: 'dark', // Default to dark theme
      zoom: 100,
      snapToGuides: true,
      sidebarTab: 'elements',
      setSidebarTab: (sidebarTab) => set({ sidebarTab }),
      
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
      onRehydrateStorage: () => (state) => {
        // Apply theme on rehydration
        if (state?.theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
    }
  )
)















