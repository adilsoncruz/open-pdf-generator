import type { SetTemplateStore, GetTemplateStore } from './types'
import {
  createElementCrud,
  createElementTransforms,
  createElementAlignment,
  type ElementCrudSlice,
  type ElementTransformsSlice,
  type ElementAlignmentSlice,
} from './elements'

export * from './elements'

export type ElementSlice = ElementCrudSlice & ElementTransformsSlice & ElementAlignmentSlice

/**
 * Aggregates and creates the element slice for templateStore by combining
 * CRUD, transform, and alignment submodules.
 */
export const createElementSlice = (
  set: SetTemplateStore,
  get: GetTemplateStore
): ElementSlice => ({
  ...createElementCrud(set, get),
  ...createElementTransforms(set, get),
  ...createElementAlignment(set, get),
})
