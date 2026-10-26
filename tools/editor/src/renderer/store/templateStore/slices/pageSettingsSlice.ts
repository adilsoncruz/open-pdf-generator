import type { SetTemplateStore, GetTemplateStore } from './types'
import {
  defaultTemplate,
  normalizeBodyContainers,
  saveToHistory,
} from '../helpers'
import type { Template, WatermarkConfig } from '../types'

export interface PageSettingsSlice {
  template: Template

  setTemplate: (template: Template) => void
  updateTemplate: (updates: Partial<Template>) => void
  updatePageSettings: (updates: Partial<Template['pageSettings']>) => void
  updateWatermark: (updates: Partial<WatermarkConfig>) => void
  removeWatermark: () => void
  updateMetadata: (updates: Partial<Template['metadata']>) => void
  addHeader: () => void
  addFooter: () => void
  removeHeader: () => void
  removeFooter: () => void
  addBodyBackground: () => void
  removeBodyBackground: () => void
  addSummaryPage: () => void
  removeSummaryPage: () => void
  updateSummaryPage: (updates: { printCondition?: string }) => void
  updateHeader: (updates: { height?: number; printCondition?: string }) => void
  updateFooter: (updates: { height?: number; printCondition?: string }) => void
  updateBodyBackground: (updates: { printCondition?: string }) => void
}

export const createPageSettingsSlice = (
  set: SetTemplateStore,
  _get: GetTemplateStore
): PageSettingsSlice => ({
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

  updateWatermark: (updates) =>
    set((state) => {
      const currentWatermark = state.template.pageSettings.watermark || {
        type: 'text',
        text: 'CONFIDENTIAL',
        fontSize: 60,
        fontStyle: 'bold',
        color: '#94a3b8',
        opacity: 0.2,
        rotation: 45,
        onTop: false,
      }
      const newTemplate = {
        ...state.template,
        pageSettings: {
          ...state.template.pageSettings,
          watermark: {
            ...currentWatermark,
            ...updates,
          },
        },
      }
      return {
        template: newTemplate,
        isDirty: true,
        ...saveToHistory(state, newTemplate),
      }
    }),

  removeWatermark: () =>
    set((state) => {
      const newPageSettings = { ...state.template.pageSettings }
      delete newPageSettings.watermark
      const newTemplate = {
        ...state.template,
        pageSettings: newPageSettings,
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

  addHeader: () =>
    set((state) => ({
      template: {
        ...state.template,
        pageSettings: {
          ...state.template.pageSettings,
          header: {
            height: 100,
            elements: [
              {
                type: 'container',
                id: `container-header-${Date.now()}`,
                name: 'Header Container',
                x: 0,
                y: 0,
                width: '100%',
                height: 100,
                elements: [],
              },
            ],
          },
        },
      },
      currentSection: 'header',
      isDirty: true,
    })),

  addFooter: () =>
    set((state) => ({
      template: {
        ...state.template,
        pageSettings: {
          ...state.template.pageSettings,
          footer: {
            height: 80,
            elements: [
              {
                type: 'container',
                id: `container-footer-${Date.now()}`,
                name: 'Footer Container',
                x: 0,
                y: 0,
                width: '100%',
                height: 80,
                elements: [],
              },
            ],
          },
        },
      },
      currentSection: 'footer',
      isDirty: true,
    })),

  removeHeader: () =>
    set((state) => ({
      template: {
        ...state.template,
        pageSettings: {
          ...state.template.pageSettings,
          header: undefined,
        },
      },
      selectedElementIds: state.selectedElementLocation === 'header' ? [] : state.selectedElementIds,
      isDirty: true,
    })),

  removeFooter: () =>
    set((state) => ({
      template: {
        ...state.template,
        pageSettings: {
          ...state.template.pageSettings,
          footer: undefined,
        },
      },
      selectedElementIds: state.selectedElementLocation === 'footer' ? [] : state.selectedElementIds,
      isDirty: true,
    })),

  addBodyBackground: () =>
    set((state) => ({
      template: {
        ...state.template,
        pageSettings: {
          ...state.template.pageSettings,
          bodyBackground: {
            elements: [
              {
                type: 'container',
                id: `container-bg-${Date.now()}`,
                name: 'Background Container',
                x: 0,
                y: 0,
                width: '100%',
                height: 200,
                elements: [],
              },
            ],
          },
        },
      },
      currentSection: 'bodyBackground',
      isDirty: true,
    })),

  removeBodyBackground: () =>
    set((state) => ({
      template: {
        ...state.template,
        pageSettings: {
          ...state.template.pageSettings,
          bodyBackground: undefined,
        },
      },
      selectedElementIds:
        state.selectedElementLocation === 'bodyBackground' ? [] : state.selectedElementIds,
      isDirty: true,
    })),

  addSummaryPage: () =>
    set((state) => ({
      template: {
        ...state.template,
        summaryPage: {
          elements: [
            {
              type: 'container',
              id: `container-summary-${Date.now()}`,
              name: 'Summary Container',
              x: 0,
              y: 0,
              width: '100%',
              height: 200,
              elements: [],
            },
          ],
        },
      },
      currentSection: 'summary',
      isDirty: true,
    })),

  removeSummaryPage: () =>
    set((state) => ({
      template: {
        ...state.template,
        summaryPage: undefined,
      },
      selectedElementIds: state.selectedElementLocation === 'summary' ? [] : state.selectedElementIds,
      isDirty: true,
    })),

  updateSummaryPage: (updates) =>
    set((state) => {
      if (!state.template.summaryPage) return state
      return {
        template: {
          ...state.template,
          summaryPage: {
            ...state.template.summaryPage,
            ...updates,
          },
        },
        isDirty: true,
      }
    }),

  updateHeader: (updates) =>
    set((state) => {
      if (!state.template.pageSettings.header) return state
      return {
        template: {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            header: {
              ...state.template.pageSettings.header,
              ...updates,
            },
          },
        },
        isDirty: true,
      }
    }),

  updateFooter: (updates) =>
    set((state) => {
      if (!state.template.pageSettings.footer) return state
      return {
        template: {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            footer: {
              ...state.template.pageSettings.footer,
              ...updates,
            },
          },
        },
        isDirty: true,
      }
    }),

  updateBodyBackground: (updates) =>
    set((state) => {
      if (!state.template.pageSettings.bodyBackground) return state
      return {
        template: {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            bodyBackground: {
              ...state.template.pageSettings.bodyBackground,
              ...updates,
            },
          },
        },
        isDirty: true,
      }
    }),
})
