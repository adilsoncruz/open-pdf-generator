import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface RecentFileItem {
  path: string
  name: string
  lastOpened: string
}

interface RecentFilesStore {
  recentFiles: RecentFileItem[]
  addRecentFile: (filePath: string, fileName?: string) => void
  removeRecentFile: (filePath: string) => void
  clearRecentFiles: () => void
}

const MAX_RECENT_FILES = 10

export const useRecentFilesStore = create<RecentFilesStore>()(
  persist(
    (set) => ({
      recentFiles: [],

      addRecentFile: (filePath: string, fileName?: string) => {
        if (!filePath) return
        const resolvedName = fileName || filePath.split(/[/\\]/).pop() || 'template.json'
        const now = new Date().toISOString()

        set((state) => {
          const filtered = state.recentFiles.filter((item) => item.path !== filePath)
          const updated = [
            { path: filePath, name: resolvedName, lastOpened: now },
            ...filtered,
          ].slice(0, MAX_RECENT_FILES)
          return { recentFiles: updated }
        })
      },

      removeRecentFile: (filePath: string) => {
        set((state) => ({
          recentFiles: state.recentFiles.filter((item) => item.path !== filePath),
        }))
      },

      clearRecentFiles: () => {
        set({ recentFiles: [] })
      },
    }),
    {
      name: 'pdf-editor-recent-files',
    }
  )
)
