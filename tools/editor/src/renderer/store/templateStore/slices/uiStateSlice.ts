import type { SetTemplateStore, GetTemplateStore } from './types'
import { saveToHistory } from '../helpers'
import type { ElementLocation } from '../types'

export interface UiStateSlice {
  currentFilePath: string | null
  isDirty: boolean
  testData: Record<string, unknown>
  currentSection: ElementLocation
  isSidebarPinned: boolean
  isSidebarMinimized: boolean

  setCurrentFilePath: (path: string | null) => void
  setTestData: (data: Record<string, unknown>) => void
  setSchema: (schema: Record<string, any> | null) => void
  markClean: () => void
  setCurrentSection: (section: ElementLocation) => void
  toggleSidebarPinned: () => void
  toggleSidebarMinimized: () => void
  setSidebarMinimized: (minimized: boolean) => void
}

export const createUiStateSlice = (
  set: SetTemplateStore,
  _get: GetTemplateStore
): UiStateSlice => ({
  currentFilePath: null,
  isDirty: false,
  testData: {},
  currentSection: 'body',
  isSidebarPinned: false,
  isSidebarMinimized: false,

  setCurrentFilePath: (path) =>
    set({
      currentFilePath: path,
    }),

  setTestData: (data) =>
    set({
      testData: data,
    }),

  setSchema: (schema) =>
    set((state) => {
      const newTemplate = { ...state.template }
      if (schema && Object.keys(schema).length > 0) {
        newTemplate.schema = schema
      } else {
        delete newTemplate.schema
      }
      return {
        template: newTemplate,
        isDirty: true,
        ...saveToHistory(state, newTemplate),
      }
    }),

  markClean: () =>
    set({
      isDirty: false,
    }),

  setCurrentSection: (section) =>
    set({
      currentSection: section,
      selectedElementIds: [],
      selectedGroupId: null,
    }),

  toggleSidebarPinned: () =>
    set((state) => ({
      isSidebarPinned: !state.isSidebarPinned,
    })),

  toggleSidebarMinimized: () =>
    set((state) => ({
      isSidebarMinimized: !state.isSidebarMinimized,
    })),

  setSidebarMinimized: (minimized: boolean) =>
    set({ isSidebarMinimized: minimized }),
})
