import type { SetTemplateStore, GetTemplateStore } from './types'
import {
  createGroupOperations,
  createGroupTransforms,
  type GroupOperationsSlice,
  type GroupTransformsSlice,
} from './groups'

export * from './groups'

export type GroupSlice = GroupOperationsSlice & GroupTransformsSlice

/**
 * Aggregates and creates the group slice for templateStore by combining
 * operations and transform submodules.
 */
export const createGroupSlice = (
  set: SetTemplateStore,
  get: GetTemplateStore
): GroupSlice => ({
  ...createGroupOperations(set, get),
  ...createGroupTransforms(set, get),
})
