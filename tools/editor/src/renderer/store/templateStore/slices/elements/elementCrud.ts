import type { SetTemplateStore, GetTemplateStore } from '../types'
import { createElementAdd, type ElementAddSlice } from './elementAdd'
import { createElementUpdate, type ElementUpdateSlice } from './elementUpdate'
import { createElementDelete, type ElementDeleteSlice } from './elementDelete'
import { createElementClone, type ElementCloneSlice } from './elementClone'

export * from './elementAdd'
export * from './elementUpdate'
export * from './elementDelete'
export * from './elementClone'

export interface ElementCrudSlice
  extends ElementAddSlice,
    ElementUpdateSlice,
    ElementDeleteSlice,
    ElementCloneSlice {}

/**
 * Combines CRUD submodules (add, update, delete, clone) into a unified slice.
 */
export const createElementCrud = (
  set: SetTemplateStore,
  get: GetTemplateStore
): ElementCrudSlice => ({
  ...createElementAdd(set, get),
  ...createElementUpdate(set, get),
  ...createElementDelete(set, get),
  ...createElementClone(set, get),
})
