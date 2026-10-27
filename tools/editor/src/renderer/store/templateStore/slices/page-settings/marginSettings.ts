import type { SetTemplateStore, GetTemplateStore } from '../types'
import {
  defaultTemplate,
  normalizeBodyContainers,
  saveToHistory,
} from '../../helpers'
import type { Template } from '../../types'

export interface MarginSettingsSlice {
  template: Template
  setTemplate: (template: Template) => void
  updateTemplate: (updates: Partial<Template>) => void
  updatePageSettings: (updates: Partial<Template['pageSettings']>) => void
  updateMetadata: (updates: Partial<Template['metadata']>) => void
}

/**
 * Operations for page settings, margins, padding, and document metadata.
 */
export const createMarginSettingsSlice = (
  set: SetTemplateStore,
  _get: GetTemplateStore
): MarginSettingsSlice => ({
  template: defaultTemplate,

  setTemplate: (template) =>
    set(() => ({
      template: normalizeBodyContainers(template),
      isDirty: false,
      selectedElementIds: [],
      selectedElementLocation: 'body',
      history: [JSON.parse(JSON.stringify(normalizeBodyContainers(template)))],
      historyIndex: 0,
    })),

  updateTemplate: (updates) =>
    set((state) => {
      const newTemplate = { ...state.template, ...updates }
      return {
        template: newTemplate,
        isDirty: true,
        ...saveToHistory(state, newTemplate),
      }
    }),

  updatePageSettings: (updates) =>
    set((state) => {
      const newTemplate = {
        ...state.template,
        pageSettings: {
          ...state.template.pageSettings,
          ...updates,
        },
      }
      return {
        template: newTemplate,
        isDirty: true,
        ...saveToHistory(state, newTemplate),
      }
    }),

  updateMetadata: (updates) =>
    set((state) => {
      const newTemplate = {
        ...state.template,
        metadata: {
          ...state.template.metadata,
          ...updates,
        },
      }
      return {
        template: newTemplate,
        isDirty: true,
        ...saveToHistory(state, newTemplate),
      }
    }),
})
