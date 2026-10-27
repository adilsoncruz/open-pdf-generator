import type { SetTemplateStore, GetTemplateStore } from '../types'
import {
  createMarginSettingsSlice,
  type MarginSettingsSlice,
} from './marginSettings'
import {
  createWatermarkSettingsSlice,
  type WatermarkSettingsSlice,
} from './watermarkSettings'
import {
  createBackgroundSettingsSlice,
  type BackgroundSettingsSlice,
} from './backgroundSettings'

export type PageSettingsSlice = MarginSettingsSlice &
  WatermarkSettingsSlice &
  BackgroundSettingsSlice

/**
 * Lean orchestrator composing the page settings slice from margin,
 * watermark, and background modules.
 */
export const createPageSettingsSlice = (
  set: SetTemplateStore,
  get: GetTemplateStore
): PageSettingsSlice => ({
  ...createMarginSettingsSlice(set, get),
  ...createWatermarkSettingsSlice(set, get),
  ...createBackgroundSettingsSlice(set, get),
})
