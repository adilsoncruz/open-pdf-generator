import type { SetTemplateStore, GetTemplateStore } from './types'
import { defaultTemplate, saveToHistory } from '../helpers'
import type { Template } from '../types'

export interface HistorySlice {
  history: Template[]
  historyIndex: number
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  jumpToHistoryIndex: (index: number) => void
  saveSnapshot: () => void
}

export const createHistorySlice = (
  set: SetTemplateStore,
  get: GetTemplateStore
): HistorySlice => ({
  history: [defaultTemplate],
  historyIndex: 0,

  undo: () =>
    set((state) => {
      if (state.historyIndex <= 0) return state

      const newIndex = state.historyIndex - 1
      const previousTemplate = JSON.parse(JSON.stringify(state.history[newIndex]))

      return {
        template: previousTemplate,
        historyIndex: newIndex,
        selectedElementIds: [],
        selectedContainerChildId: null,
        selectedLoopChildId: null,
        isDirty: true,
      }
    }),

  redo: () =>
    set((state) => {
      if (state.historyIndex >= state.history.length - 1) return state

      const newIndex = state.historyIndex + 1
      const nextTemplate = JSON.parse(JSON.stringify(state.history[newIndex]))

      return {
        template: nextTemplate,
        historyIndex: newIndex,
        selectedElementIds: [],
        selectedContainerChildId: null,
        selectedLoopChildId: null,
        isDirty: true,
      }
    }),

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  jumpToHistoryIndex: (index: number) =>
    set((state) => {
      if (index < 0 || index >= state.history.length) return state
      const targetTemplate = state.history[index]
      return {
        template: JSON.parse(JSON.stringify(targetTemplate)),
        historyIndex: index,
        selectedElementIds: [],
        selectedContainerChildId: null,
        selectedLoopChildId: null,
        isDirty: true,
      }
    }),

  saveSnapshot: () =>
    set((state) => {
      const lastTemplate = state.history[state.historyIndex]
      const currentTemplateJson = JSON.stringify(state.template)
      const lastTemplateJson = JSON.stringify(lastTemplate)

      if (currentTemplateJson === lastTemplateJson) {
        return state
      }

      return saveToHistory(state, state.template)
    }),
})
