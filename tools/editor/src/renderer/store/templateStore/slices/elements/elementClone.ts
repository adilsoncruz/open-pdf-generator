import type { Element, ElementLocation } from '../../types'
import type { SetTemplateStore, GetTemplateStore } from '../types'
import { flattenElements, saveToHistory } from '../../helpers'
import { getSectionElements, updateSectionElements } from './shared'

export interface ElementCloneSlice {
  copiedElements: {
    elements: Element[]
    location: ElementLocation
    isChild?: boolean
    parentId?: string | null
  } | null
  copyElement: () => void
  pasteElement: () => void
  duplicateElement: (id: string, location?: ElementLocation) => void
}

export const createElementClone = (
  set: SetTemplateStore,
  _get: GetTemplateStore
): ElementCloneSlice => ({
  copiedElements: null,

  copyElement: () =>
    set((state) => {
      const {
        selectedElementIds,
        selectedElementLocation,
        selectedContainerChildId,
        template,
      } = state

      if (selectedElementIds.length === 0) return state

      const allElements = getSectionElements(template, selectedElementLocation)
      let elementsToCopy: Element[] = []
      let isChild = false
      let parentId: string | null = null

      if (selectedContainerChildId) {
        const parentIdTarget = state.selectedContainerParentId || selectedElementIds[0]
        const container = allElements.find((el) => el.id === parentIdTarget)
        if (container && container.elements) {
          const child = container.elements.find((el) => el.id === selectedContainerChildId)
          if (child) {
            elementsToCopy = [child]
            isChild = true
            parentId = container.id
          }
        }
      } else {
        const flatElements = flattenElements(allElements)
        elementsToCopy = flatElements.filter((el) => selectedElementIds.includes(el.id))
      }

      if (elementsToCopy.length === 0) return state

      const copiedElements = JSON.parse(JSON.stringify(elementsToCopy))

      return {
        copiedElements: {
          elements: copiedElements,
          location: selectedElementLocation,
          isChild,
          parentId,
        },
      }
    }),

  pasteElement: () =>
    set((state) => {
      const {
        copiedElements,
        currentSection,
        template,
        selectedElementIds,
        selectedContainerChildId,
        selectedContainerParentId,
      } = state

      if (!copiedElements || copiedElements.elements.length === 0) {
        return state
      }

      const timestamp = Date.now()
      const newElements: Element[] = copiedElements.elements.map((element, index) => ({
        ...element,
        id: `${element.type}-${timestamp + index}`,
        x: (element.x || 0) + 20,
        y: (element.y || 0) + 20,
      }))

      let targetContainerId: string | null = null

      if (selectedContainerChildId) {
        targetContainerId = selectedContainerParentId || selectedElementIds[0]
      } else if (selectedElementIds.length === 1) {
        const allElements = getSectionElements(template, currentSection)
        const el = allElements.find((e) => e.id === selectedElementIds[0])
        if (el && el.type === 'container') {
          targetContainerId = el.id
        }
      }

      if (targetContainerId) {
        const insertIntoContainer = (elements: Element[]): Element[] =>
          elements.map((el) => {
            if (el.id === targetContainerId && el.type === 'container') {
              return {
                ...el,
                elements: [...(el.elements || []), ...newElements],
              }
            }
            if (el.elements && el.elements.length > 0) {
              return {
                ...el,
                elements: insertIntoContainer(el.elements),
              }
            }
            return el
          })

        const newTemplate = updateSectionElements(template, currentSection, insertIntoContainer)

        return {
          template: newTemplate,
          selectedElementIds: [targetContainerId],
          selectedContainerChildId: newElements[0].id,
          selectedElementLocation: currentSection,
          isDirty: true,
          ...saveToHistory(state, newTemplate),
        }
      }

      const newTemplate = updateSectionElements(template, currentSection, (elements) => [
        ...elements,
        ...newElements,
      ])

      return {
        template: newTemplate,
        selectedElementIds: newElements.map((el) => el.id),
        selectedContainerChildId: null,
        selectedElementLocation: currentSection,
        isDirty: true,
        ...saveToHistory(state, newTemplate),
      }
    }),

  duplicateElement: (id: string, location?: ElementLocation) =>
    set((state) => {
      const loc = location || state.selectedElementLocation
      const sectionElements = getSectionElements(state.template, loc)
      const allFlat = flattenElements(sectionElements)
      const source = allFlat.find((el) => el.id === id)
      if (!source) return state

      const newId = `${source.type}-${Date.now()}`
      const duplicated: Element = {
        ...JSON.parse(JSON.stringify(source)),
        id: newId,
        x: (source.x || 0) + 20,
        y: (source.y || 0) + 20,
      }

      const duplicateInList = (list: Element[]): { elements: Element[]; added: boolean } => {
        let added = false
        const nextList = list.flatMap((el) => {
          if (el.id === id) {
            added = true
            return [el, duplicated]
          }
          if (el.elements && el.elements.length > 0) {
            const res = duplicateInList(el.elements)
            if (res.added) {
              added = true
              return [{ ...el, elements: res.elements }]
            }
          }
          return [el]
        })
        return { elements: nextList, added }
      }

      const { elements: updatedElements } = duplicateInList(sectionElements)
      const newTemplate = updateSectionElements(state.template, loc, () => updatedElements)

      return {
        template: newTemplate,
        selectedElementIds: [newId],
        selectedElementLocation: loc,
        isDirty: true,
        ...saveToHistory(state, newTemplate),
      }
    }),
})
