import type { SetTemplateStore, GetTemplateStore } from '../types'
import {
  createElementMove,
  type ElementMoveSlice,
} from './elementMove'
import {
  createElementResize,
  type ElementResizeSlice,
} from './elementResize'

export * from './elementMove'
export * from './elementResize'

export interface ElementTransformsSlice
  extends ElementMoveSlice,
    ElementResizeSlice {}

/**
 * Combines transform submodules (move and resize) into a unified slice.
 */
export const createElementTransforms = (
  set: SetTemplateStore,
  get: GetTemplateStore
): ElementTransformsSlice => ({
  ...createElementMove(set, get),
  ...createElementResize(set, get),
})
