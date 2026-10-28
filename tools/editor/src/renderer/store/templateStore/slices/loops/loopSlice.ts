import type { SetTemplateStore, GetTemplateStore } from '../types'
import {
  createLoopChildOperations,
  type LoopChildOperationsSlice,
} from './loopChildOperations'
import {
  createLoopTransforms,
  type LoopTransformsSlice,
} from './loopTransforms'

export type LoopSlice = LoopChildOperationsSlice & LoopTransformsSlice

/**
 * Lean orchestrator composing the loop slice from child operations and transforms.
 */
export const createLoopSlice = (
  set: SetTemplateStore,
  get: GetTemplateStore
): LoopSlice => ({
  ...createLoopChildOperations(set, get),
  ...createLoopTransforms(set, get),
})
