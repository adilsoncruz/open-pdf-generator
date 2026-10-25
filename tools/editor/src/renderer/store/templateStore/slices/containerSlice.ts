import type { SetTemplateStore, GetTemplateStore } from './types'
import type { Element, ElementLocation } from '../types'

export interface ContainerSlice {
  addElementToContainer: (
    containerId: string,
    element: Element,
    location?: ElementLocation
  ) => void
  updateContainerChildElement: (
    containerId: string,
    childId: string,
    updates: Partial<Element>,
    location?: ElementLocation
  ) => void
  deleteContainerChildElement: (
    containerId: string,
    childId: string,
    location?: ElementLocation
  ) => void
  reorderContainerChildren: (
    containerId: string,
    fromIndex: number,
    toIndex: number,
    location?: ElementLocation
  ) => void
}

export const createContainerSlice = (
  _set: SetTemplateStore,
  get: GetTemplateStore
): ContainerSlice => ({
  addElementToContainer: (containerId, element, location) =>
    get().addElementToLoop(containerId, element, location),

  deleteContainerChildElement: (containerId, childId, location) =>
    get().deleteLoopChildElement(containerId, childId, location),

  reorderContainerChildren: (containerId, fromIndex, toIndex, location) =>
    get().reorderLoopChildren(containerId, fromIndex, toIndex, location),

  updateContainerChildElement: (containerId, childId, updates, location) =>
    get().updateLoopChildElement(containerId, childId, updates, location),
})
