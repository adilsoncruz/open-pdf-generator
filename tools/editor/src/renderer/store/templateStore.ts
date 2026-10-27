import { create } from 'zustand'
import { TemplateStore } from './templateStore/types'
import { createHistorySlice } from './templateStore/slices/historySlice'
import { createUiStateSlice } from './templateStore/slices/uiStateSlice'
import { createSelectionSlice } from './templateStore/slices/selectionSlice'
import { createPageSettingsSlice } from './templateStore/slices/pageSettingsSlice'
import { createGroupSlice } from './templateStore/slices/groupSlice'
import { createLoopSlice } from './templateStore/slices/loopSlice'
import { createContainerSlice } from './templateStore/slices/containerSlice'
import { createElementSlice } from './templateStore/slices/elementSlice'

export * from './templateStore/types'
export * from './templateStore/helpers'

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  ...createHistorySlice(set, get),
  ...createUiStateSlice(set, get),
  ...createSelectionSlice(set, get),
  ...createPageSettingsSlice(set, get),
  ...createGroupSlice(set, get),
  ...createLoopSlice(set, get),
  ...createContainerSlice(set, get),
  ...createElementSlice(set, get),
}))
