import type { SetTemplateStore, GetTemplateStore } from '../types'
import type { ElementLocation } from '../../types'

const createSectionContainer = (idPrefix: string, name: string, height: number) => [
  {
    type: 'container',
    id: `container-${idPrefix}-${Date.now()}`,
    name: `${name} Container`,
    x: 0,
    y: 0,
    width: '100%',
    height,
    elements: [],
  },
]

const clearSelectionIfIn = (loc: ElementLocation, target: ElementLocation, ids: string[]) =>
  loc === target ? [] : ids

export interface BackgroundSettingsSlice {
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

/**
 * Operations for body background, headers, footers, and summary page layouts.
 */
export const createBackgroundSettingsSlice = (
  set: SetTemplateStore,
  _get: GetTemplateStore
): BackgroundSettingsSlice => ({
  addHeader: () =>
    set((state) => ({
      template: {
        ...state.template,
        pageSettings: {
          ...state.template.pageSettings,
          header: { height: 100, elements: createSectionContainer('header', 'Header', 100) },
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
          footer: { height: 80, elements: createSectionContainer('footer', 'Footer', 80) },
        },
      },
      currentSection: 'footer',
      isDirty: true,
    })),

  removeHeader: () =>
    set((state) => ({
      template: {
        ...state.template,
        pageSettings: { ...state.template.pageSettings, header: undefined },
      },
      selectedElementIds: clearSelectionIfIn(state.selectedElementLocation, 'header', state.selectedElementIds),
      isDirty: true,
    })),

  removeFooter: () =>
    set((state) => ({
      template: {
        ...state.template,
        pageSettings: { ...state.template.pageSettings, footer: undefined },
      },
      selectedElementIds: clearSelectionIfIn(state.selectedElementLocation, 'footer', state.selectedElementIds),
      isDirty: true,
    })),

  addBodyBackground: () =>
    set((state) => ({
      template: {
        ...state.template,
        pageSettings: {
          ...state.template.pageSettings,
          bodyBackground: { elements: createSectionContainer('bg', 'Background', 200) },
        },
      },
      currentSection: 'bodyBackground',
      isDirty: true,
    })),

  removeBodyBackground: () =>
    set((state) => ({
      template: {
        ...state.template,
        pageSettings: { ...state.template.pageSettings, bodyBackground: undefined },
      },
      selectedElementIds: clearSelectionIfIn(state.selectedElementLocation, 'bodyBackground', state.selectedElementIds),
      isDirty: true,
    })),

  addSummaryPage: () =>
    set((state) => ({
      template: {
        ...state.template,
        summaryPage: { elements: createSectionContainer('summary', 'Summary', 200) },
      },
      currentSection: 'summary',
      isDirty: true,
    })),

  removeSummaryPage: () =>
    set((state) => ({
      template: { ...state.template, summaryPage: undefined },
      selectedElementIds: clearSelectionIfIn(state.selectedElementLocation, 'summary', state.selectedElementIds),
      isDirty: true,
    })),

  updateSummaryPage: (updates) =>
    set((state) => {
      if (!state.template.summaryPage) return state
      return {
        template: {
          ...state.template,
          summaryPage: { ...state.template.summaryPage, ...updates },
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
            header: { ...state.template.pageSettings.header, ...updates },
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
            footer: { ...state.template.pageSettings.footer, ...updates },
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
