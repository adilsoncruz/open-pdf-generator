import type { SetTemplateStore, GetTemplateStore } from '../types'
import { saveToHistory } from '../../helpers'
import type { WatermarkConfig } from '../../types'

export const DEFAULT_WATERMARK_CONFIG: WatermarkConfig = {
  type: 'text',
  text: 'CONFIDENTIAL',
  fontSize: 60,
  fontStyle: 'bold',
  color: '#94a3b8',
  opacity: 0.2,
  rotation: 45,
  onTop: false,
}

export interface WatermarkSettingsSlice {
  updateWatermark: (updates: Partial<WatermarkConfig>) => void
  removeWatermark: () => void
}

/**
 * Operations for watermark configuration: text, image, rotation, opacity, and tiling.
 */
export const createWatermarkSettingsSlice = (
  set: SetTemplateStore,
  _get: GetTemplateStore
): WatermarkSettingsSlice => ({
  updateWatermark: (updates) =>
    set((state) => {
      const currentWatermark =
        state.template.pageSettings.watermark || DEFAULT_WATERMARK_CONFIG
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
})
