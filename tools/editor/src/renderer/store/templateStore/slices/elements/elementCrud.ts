import type { Element, ElementLocation, Template } from '../../types'
import type { SetTemplateStore, GetTemplateStore } from '../types'
import { flattenElements, saveToHistory, restackBodyContainers } from '../../helpers'
import {
  getSectionHeight,
  getSectionElements,
  updateGroupsForRenamedElement,
  updateGroupsAfterElementDelete,
} from './shared'

export interface ElementCrudSlice {
  copiedElements: {
    elements: Element[]
    location: ElementLocation
    isChild?: boolean
    parentId?: string | null
  } | null
  addElement: (element: Element, location?: ElementLocation) => void
  updateElement: (id: string, updates: Partial<Element>, location?: ElementLocation) => void
  deleteElement: (id: string, location?: ElementLocation) => void
  deleteSelectedElements: () => void
  updateSelectedElements: (updates: Partial<Element>) => void
  toggleElementVisibility: (id: string, location?: ElementLocation) => void
  copyElement: () => void
  pasteElement: () => void
  duplicateElement: (id: string, location?: ElementLocation) => void
}

export const createElementCrud = (
  set: SetTemplateStore,
  _get: GetTemplateStore
): ElementCrudSlice => ({
  copiedElements: null,

  addElement: (element: Element, location: ElementLocation = 'body') =>
    set((state) => {
      let normalizedElement = { ...element }
      const sectionHeight = getSectionHeight(state.template, location)

      if (
        element.type === 'container' ||
        element.type === 'page_break' ||
        element.type === 'spacer'
      ) {
        const sectionElements = getSectionElements(state.template, location)
        const containers = sectionElements.filter((el) => el.type === 'container')
        let nextY = 0

        if (containers.length > 0) {
          const lastContainer = containers[containers.length - 1]
          const lastY = typeof lastContainer.y === 'number' ? lastContainer.y : 0
          const lastHeight = typeof lastContainer.height === 'number' ? lastContainer.height : 120
          nextY = lastY + lastHeight
        } else if (typeof element.y === 'number' && element.y > 0) {
          nextY = element.y
        }

        const remainingHeight = Math.max(30, sectionHeight - nextY)
        normalizedElement = {
          ...element,
          x: 0,
          y: nextY,
          width: '100%',
          height:
            element.type === 'page_break'
              ? 20
              : element.type === 'spacer'
              ? 50
              : Math.min(
                  typeof element.height === 'number' ? element.height : 120,
                  remainingHeight
                ),
        }
      }

      const selectedId = state.selectedElementIds[0]
      const selectedParentId = state.selectedContainerParentId
      const selectedLoopParentId = state.selectedLoopParentId

      const insertIntoElements = (elements: Element[]) => {
        if (
          normalizedElement.type === 'container' ||
          normalizedElement.type === 'page_break' ||
          normalizedElement.type === 'spacer'
        ) {
          return {
            newElements: [...elements, normalizedElement],
            newSelectedId: normalizedElement.id,
            newSelectedChildId: null,
            isTargetLoop: false,
          }
        }

        let targetLoop: Element | null = null
        if (selectedLoopParentId) {
          targetLoop =
            elements.find((el) => el.id === selectedLoopParentId && el.type === 'loop') || null
          if (!targetLoop) {
            for (const el of elements) {
              if (el.elements) {
                const nested = el.elements.find(
                  (c) => c.id === selectedLoopParentId && c.type === 'loop'
                )
                if (nested) {
                  targetLoop = nested
                  break
                }
              }
            }
          }
        }

        if (!targetLoop && selectedId) {
          targetLoop = elements.find((el) => el.id === selectedId && el.type === 'loop') || null
          if (!targetLoop) {
            for (const el of elements) {
              if (el.elements) {
                const nested = el.elements.find((c) => c.id === selectedId && c.type === 'loop')
                if (nested) {
                  targetLoop = nested
                  break
                }
                const loopParent = el.elements.find(
                  (c) => c.type === 'loop' && c.elements?.some((gc) => gc.id === selectedId)
                )
                if (loopParent) {
                  targetLoop = loopParent
                  break
                }
              }
            }
          }
          if (!targetLoop) {
            targetLoop =
              elements.find(
                (el) => el.type === 'loop' && el.elements?.some((c) => c.id === selectedId)
              ) || null
          }
        }

        if (targetLoop) {
          const loopChildren = targetLoop.elements || []
          let childY = normalizedElement.y ?? 10
          let childX = normalizedElement.x ?? 10
          let childWidth = normalizedElement.width
          if (loopChildren.length > 0) {
            const lastChild = loopChildren[loopChildren.length - 1]
            const lastY = typeof lastChild.y === 'number' ? lastChild.y : 0
            const lastH = typeof lastChild.height === 'number' ? lastChild.height : 20
            childY = lastY + lastH + 8
            childX = lastChild.x ?? childX
            if (childWidth === undefined && typeof lastChild.width === 'number') {
              childWidth = lastChild.width
            }
            if (
              String(lastChild.positionMode || lastChild.position || '').toUpperCase() === 'RELATIVE'
            ) {
              normalizedElement.positionMode = 'RELATIVE'
              normalizedElement.position = 'relative'
              normalizedElement.relativeOffsetY = 0
            }
          }
          const adaptedChild = {
            ...normalizedElement,
            x: childX,
            y: childY,
            ...(childWidth !== undefined ? { width: childWidth } : {}),
          }

          const addIntoLoop = (list: Element[]): Element[] => {
            return list.map((el) => {
              if (el.id === targetLoop!.id && el.type === 'loop') {
                return {
                  ...el,
                  elements: [...loopChildren, adaptedChild],
                }
              }
              if (el.elements && el.elements.length > 0) {
                return {
                  ...el,
                  elements: addIntoLoop(el.elements),
                }
              }
              return el
            })
          }

          return {
            newElements: addIntoLoop(elements),
            newSelectedId: targetLoop.id,
            newSelectedChildId: adaptedChild.id,
            isTargetLoop: true,
          }
        }

        let targetContainer = elements.find((el) => el.id === selectedId && el.type === 'container')

        if (!targetContainer && (selectedParentId || selectedId)) {
          if (selectedParentId) {
            targetContainer = elements.find(
              (el) => el.id === selectedParentId && el.type === 'container'
            )
          }
          if (!targetContainer && selectedId) {
            targetContainer = elements.find(
              (el) =>
                el.type === 'container' && el.elements?.some((child) => child.id === selectedId)
            )
          }
        }

        if (!targetContainer) {
          const containers = elements.filter((el) => el.type === 'container')
          if (containers.length > 0) {
            targetContainer = containers[containers.length - 1]
          }
        }

        if (!targetContainer) {
          const autoContainerId = `container-${location}-${Date.now()}`
          const adaptedChild = {
            ...normalizedElement,
            x: normalizedElement.x ?? 20,
            y: normalizedElement.y ?? 20,
          }
          const autoContainer: Element = {
            type: 'container',
            id: autoContainerId,
            name: `${location.toUpperCase()} Container`,
            x: 0,
            y: 0,
            width: '100%',
            height: Math.min(200, Math.max(30, sectionHeight)),
            heightMode: 'auto',
            autoHeight: true,
            elements: [adaptedChild],
          }
          return {
            newElements: [...elements, autoContainer],
            newSelectedId: autoContainerId,
            newSelectedChildId: adaptedChild.id,
            isTargetLoop: false,
          }
        }

        const containerChildren = targetContainer.elements || []
        let childY = normalizedElement.y ?? 20
        let childX = normalizedElement.x ?? 20
        let childWidth = normalizedElement.width
        if (containerChildren.length > 0) {
          const lastChild = containerChildren[containerChildren.length - 1]
          const lastY = typeof lastChild.y === 'number' ? lastChild.y : 0
          const lastH = typeof lastChild.height === 'number' ? lastChild.height : 25
          childY = lastY + lastH + 10
          childX = lastChild.x ?? childX
          if (childWidth === undefined && typeof lastChild.width === 'number') {
            childWidth = lastChild.width
          }
          if (
            String(lastChild.positionMode || lastChild.position || '').toUpperCase() === 'RELATIVE'
          ) {
            normalizedElement.positionMode = 'RELATIVE'
            normalizedElement.position = 'relative'
            normalizedElement.relativeOffsetY = 0
          }
        }
        const adaptedChild = {
          ...normalizedElement,
          x: childX,
          y: childY,
          ...(childWidth !== undefined ? { width: childWidth } : {}),
        }

        const childH = typeof adaptedChild.height === 'number' ? adaptedChild.height : 25
        const childBottom = childY + childH
        const requiredContainerHeight = childBottom + 15
        const currentContainerHeight =
          typeof targetContainer.height === 'number' ? targetContainer.height : 150
        const isFixed =
          targetContainer.heightMode === 'fixed' || targetContainer.autoHeight === false
        const maxContainerHeight = Math.max(30, sectionHeight - (targetContainer.y || 0))

        if (isFixed) {
          if (childBottom > currentContainerHeight) {
            alert(
              `O container "${targetContainer.name || targetContainer.id}" possui altura fixa (${currentContainerHeight} pt) e não há espaço suficiente para adicionar este elemento (necessário: ${childBottom} pt). Altere para auto-height ou aumente a altura do container.`
            )
            return {
              newElements: elements,
              newSelectedId: targetContainer.id,
              newSelectedChildId: null,
              isTargetLoop: false,
            }
          }
        } else {
          if (childBottom > maxContainerHeight) {
            alert(
              `Não é possível adicionar o elemento: o container ultrapassaria o limite da página (altura máxima disponível: ${Math.round(maxContainerHeight)} pt, necessário: ${Math.round(childBottom)} pt).`
            )
            return {
              newElements: elements,
              newSelectedId: targetContainer.id,
              newSelectedChildId: null,
              isTargetLoop: false,
            }
          }
        }

        let newContainerHeight = currentContainerHeight
        let deltaHeight = 0
        if (!isFixed && requiredContainerHeight > currentContainerHeight) {
          const clampedHeight = Math.min(requiredContainerHeight, maxContainerHeight)
          deltaHeight = clampedHeight - currentContainerHeight
          newContainerHeight = clampedHeight
        }

        const targetIndex = elements.findIndex((el) => el.id === targetContainer!.id)

        if (deltaHeight > 0) {
          const wouldExceedPage = elements.some((el, idx) => {
            if (idx > targetIndex) {
              const elY = (typeof el.y === 'number' ? el.y : 0) + deltaHeight
              const elH = typeof el.height === 'number' ? el.height : 30
              return elY + elH > sectionHeight
            }
            return false
          })
          if (wouldExceedPage) {
            alert(
              `Não é possível adicionar o elemento: os containers seguintes seriam empurrados para fora da página.`
            )
            return {
              newElements: elements,
              newSelectedId: targetContainer.id,
              newSelectedChildId: null,
              isTargetLoop: false,
            }
          }
        }

        return {
          newElements: elements.map((el, idx) => {
            if (el.id === targetContainer!.id) {
              return {
                ...el,
                height: newContainerHeight,
                elements: [...containerChildren, adaptedChild],
              }
            }
            if (deltaHeight > 0 && idx > targetIndex && typeof el.y === 'number') {
              return {
                ...el,
                y: el.y + deltaHeight,
              }
            }
            return el
          }),
          newSelectedId: targetContainer.id,
          newSelectedChildId: adaptedChild.id,
          isTargetLoop: false,
        }
      }

      let newTemplate: Template
      if (location === 'header' && state.template.pageSettings.header) {
        const { newElements, newSelectedId, newSelectedChildId, isTargetLoop } =
          insertIntoElements(state.template.pageSettings.header.elements)
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            header: {
              ...state.template.pageSettings.header,
              elements: newElements,
            },
          },
        }
        return {
          template: newTemplate,
          selectedElementIds: [newSelectedId],
          selectedContainerChildId: isTargetLoop ? null : newSelectedChildId,
          selectedContainerParentId: isTargetLoop ? null : (newSelectedChildId ? newSelectedId : null),
          selectedLoopChildId: isTargetLoop ? newSelectedChildId : null,
          selectedLoopParentId: isTargetLoop ? newSelectedId : null,
          selectedElementLocation: 'header',
          isDirty: true,
          ...saveToHistory(state, newTemplate),
        }
      } else if (location === 'footer' && state.template.pageSettings.footer) {
        const { newElements, newSelectedId, newSelectedChildId, isTargetLoop } =
          insertIntoElements(state.template.pageSettings.footer.elements)
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            footer: {
              ...state.template.pageSettings.footer,
              elements: newElements,
            },
          },
        }
        return {
          template: newTemplate,
          selectedElementIds: [newSelectedId],
          selectedContainerChildId: isTargetLoop ? null : newSelectedChildId,
          selectedContainerParentId: isTargetLoop ? null : (newSelectedChildId ? newSelectedId : null),
          selectedLoopChildId: isTargetLoop ? newSelectedChildId : null,
          selectedLoopParentId: isTargetLoop ? newSelectedId : null,
          selectedElementLocation: 'footer',
          isDirty: true,
          ...saveToHistory(state, newTemplate),
        }
      } else if (location === 'bodyBackground' && state.template.pageSettings.bodyBackground) {
        const { newElements, newSelectedId, newSelectedChildId, isTargetLoop } =
          insertIntoElements(state.template.pageSettings.bodyBackground.elements)
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            bodyBackground: {
              ...state.template.pageSettings.bodyBackground,
              elements: newElements,
            },
          },
        }
        return {
          template: newTemplate,
          selectedElementIds: [newSelectedId],
          selectedContainerChildId: isTargetLoop ? null : newSelectedChildId,
          selectedContainerParentId: isTargetLoop ? null : (newSelectedChildId ? newSelectedId : null),
          selectedLoopChildId: isTargetLoop ? newSelectedChildId : null,
          selectedLoopParentId: isTargetLoop ? newSelectedId : null,
          selectedElementLocation: 'bodyBackground',
          isDirty: true,
          ...saveToHistory(state, newTemplate),
        }
      } else if (location === 'summary' && state.template.summaryPage) {
        const { newElements, newSelectedId, newSelectedChildId, isTargetLoop } =
          insertIntoElements(state.template.summaryPage.elements)
        newTemplate = {
          ...state.template,
          summaryPage: {
            ...state.template.summaryPage,
            elements: newElements,
          },
        }
        return {
          template: newTemplate,
          selectedElementIds: [newSelectedId],
          selectedContainerChildId: isTargetLoop ? null : newSelectedChildId,
          selectedContainerParentId: isTargetLoop ? null : (newSelectedChildId ? newSelectedId : null),
          selectedLoopChildId: isTargetLoop ? newSelectedChildId : null,
          selectedLoopParentId: isTargetLoop ? newSelectedId : null,
          selectedElementLocation: 'summary',
          isDirty: true,
          ...saveToHistory(state, newTemplate),
        }
      } else {
        const { newElements, newSelectedId, newSelectedChildId, isTargetLoop } =
          insertIntoElements(state.template.page)
        newTemplate = {
          ...state.template,
          page: restackBodyContainers(newElements, state.template),
        }
        return {
          template: newTemplate,
          selectedElementIds: [newSelectedId],
          selectedContainerChildId: isTargetLoop ? null : newSelectedChildId,
          selectedContainerParentId: isTargetLoop ? null : (newSelectedChildId ? newSelectedId : null),
          selectedLoopChildId: isTargetLoop ? newSelectedChildId : null,
          selectedLoopParentId: isTargetLoop ? newSelectedId : null,
          selectedElementLocation: 'body',
          isDirty: true,
          ...saveToHistory(state, newTemplate),
        }
      }
    }),

  updateElement: (id: string, updates: Partial<Element>, location?: ElementLocation) =>
    set((state) => {
      const loc = location || state.selectedElementLocation
      const newId = updates.id !== undefined ? updates.id : id

      const applyUpdates = (elements: Element[]): Element[] => {
        return elements.map((el) => {
          if (el.id === id) {
            let result = { ...el, ...updates }

            if (el.type === 'container') {
              const sectionHeight = getSectionHeight(state.template, loc)
              if (typeof result.height === 'number') {
                result.height = Math.min(result.height, Math.max(0, sectionHeight))
              }
              result.x = 0
              result.width = '100%'
            }

            return result
          }

          if (el.elements && el.elements.length > 0) {
            return {
              ...el,
              elements: applyUpdates(el.elements),
            }
          }

          return el
        })
      }

      const newSelectedElementIds =
        newId !== id
          ? state.selectedElementIds.map((sid) => (sid === id ? newId : sid))
          : state.selectedElementIds

      if (loc === 'header' && state.template.pageSettings.header) {
        return {
          template: {
            ...state.template,
            pageSettings: {
              ...state.template.pageSettings,
              header: {
                ...state.template.pageSettings.header,
                elements: applyUpdates(state.template.pageSettings.header.elements),
                groups: updateGroupsForRenamedElement(
                  state.template.pageSettings.header.groups,
                  id,
                  newId
                ),
              },
            },
          },
          selectedElementIds: newSelectedElementIds,
          isDirty: true,
        }
      } else if (loc === 'footer' && state.template.pageSettings.footer) {
        return {
          template: {
            ...state.template,
            pageSettings: {
              ...state.template.pageSettings,
              footer: {
                ...state.template.pageSettings.footer,
                elements: applyUpdates(state.template.pageSettings.footer.elements),
                groups: updateGroupsForRenamedElement(
                  state.template.pageSettings.footer.groups,
                  id,
                  newId
                ),
              },
            },
          },
          selectedElementIds: newSelectedElementIds,
          isDirty: true,
        }
      } else if (loc === 'bodyBackground' && state.template.pageSettings.bodyBackground) {
        return {
          template: {
            ...state.template,
            pageSettings: {
              ...state.template.pageSettings,
              bodyBackground: {
                ...state.template.pageSettings.bodyBackground,
                elements: applyUpdates(state.template.pageSettings.bodyBackground.elements),
                groups: updateGroupsForRenamedElement(
                  state.template.pageSettings.bodyBackground.groups,
                  id,
                  newId
                ),
              },
            },
          },
          selectedElementIds: newSelectedElementIds,
          isDirty: true,
        }
      } else if (loc === 'summary' && state.template.summaryPage) {
        return {
          template: {
            ...state.template,
            summaryPage: {
              ...state.template.summaryPage,
              elements: applyUpdates(state.template.summaryPage.elements),
              groups: updateGroupsForRenamedElement(
                state.template.summaryPage.groups,
                id,
                newId
              ),
            },
          },
          selectedElementIds: newSelectedElementIds,
          isDirty: true,
        }
      } else {
        return {
          template: {
            ...state.template,
            page: restackBodyContainers(applyUpdates(state.template.page), state.template),
            groups: updateGroupsForRenamedElement(state.template.groups, id, newId),
          },
          selectedElementIds: newSelectedElementIds,
          isDirty: true,
        }
      }
    }),

  deleteElement: (id: string, location?: ElementLocation) =>
    set((state) => {
      const loc = location || state.selectedElementLocation
      let newTemplate: Template

      const filterOut = (elements: Element[]): Element[] =>
        elements
          .filter((el) => el.id !== id)
          .map((el) =>
            el.elements && el.elements.length > 0
              ? { ...el, elements: filterOut(el.elements) }
              : el
          )

      if (loc === 'header' && state.template.pageSettings.header) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            header: {
              ...state.template.pageSettings.header,
              elements: filterOut(state.template.pageSettings.header.elements),
              groups: updateGroupsAfterElementDelete(
                state.template.pageSettings.header.groups,
                id
              ),
            },
          },
        }
      } else if (loc === 'footer' && state.template.pageSettings.footer) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            footer: {
              ...state.template.pageSettings.footer,
              elements: filterOut(state.template.pageSettings.footer.elements),
              groups: updateGroupsAfterElementDelete(
                state.template.pageSettings.footer.groups,
                id
              ),
            },
          },
        }
      } else if (loc === 'bodyBackground' && state.template.pageSettings.bodyBackground) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            bodyBackground: {
              ...state.template.pageSettings.bodyBackground,
              elements: filterOut(state.template.pageSettings.bodyBackground.elements),
              groups: updateGroupsAfterElementDelete(
                state.template.pageSettings.bodyBackground.groups,
                id
              ),
            },
          },
        }
      } else if (loc === 'summary' && state.template.summaryPage) {
        newTemplate = {
          ...state.template,
          summaryPage: {
            ...state.template.summaryPage,
            elements: filterOut(state.template.summaryPage.elements),
            groups: updateGroupsAfterElementDelete(state.template.summaryPage.groups, id),
          },
        }
      } else {
        newTemplate = {
          ...state.template,
          page: restackBodyContainers(
            filterOut(state.template.page),
            state.template
          ),
          groups: updateGroupsAfterElementDelete(state.template.groups, id),
        }
      }

      return {
        template: newTemplate,
        selectedElementIds: state.selectedElementIds.filter((selectedId) => selectedId !== id),
        isDirty: true,
        ...saveToHistory(state, newTemplate),
      }
    }),

  deleteSelectedElements: () =>
    set((state) => {
      const { selectedElementIds, selectedElementLocation, template } = state

      if (selectedElementIds.length === 0) return state

      const historyState = saveToHistory(state, template)

      const filterElements = (elements: Element[]): Element[] =>
        elements
          .filter((el) => !selectedElementIds.includes(el.id))
          .map((el) => {
            if (el.elements && el.elements.length > 0) {
              return {
                ...el,
                elements: filterElements(el.elements),
              }
            }
            return el
          })

      let newTemplate: Template

      if (selectedElementLocation === 'header' && template.pageSettings.header) {
        newTemplate = {
          ...template,
          pageSettings: {
            ...template.pageSettings,
            header: {
              ...template.pageSettings.header,
              elements: filterElements(template.pageSettings.header.elements),
              groups: updateGroupsAfterElementDelete(
                template.pageSettings.header.groups,
                selectedElementIds
              ),
            },
          },
        }
      } else if (selectedElementLocation === 'footer' && template.pageSettings.footer) {
        newTemplate = {
          ...template,
          pageSettings: {
            ...template.pageSettings,
            footer: {
              ...template.pageSettings.footer,
              elements: filterElements(template.pageSettings.footer.elements),
              groups: updateGroupsAfterElementDelete(
                template.pageSettings.footer.groups,
                selectedElementIds
              ),
            },
          },
        }
      } else if (selectedElementLocation === 'bodyBackground' && template.pageSettings.bodyBackground) {
        newTemplate = {
          ...template,
          pageSettings: {
            ...template.pageSettings,
            bodyBackground: {
              ...template.pageSettings.bodyBackground,
              elements: filterElements(template.pageSettings.bodyBackground.elements),
              groups: updateGroupsAfterElementDelete(
                template.pageSettings.bodyBackground.groups,
                selectedElementIds
              ),
            },
          },
        }
      } else if (selectedElementLocation === 'summary' && template.summaryPage) {
        newTemplate = {
          ...template,
          summaryPage: {
            ...template.summaryPage,
            elements: filterElements(template.summaryPage.elements),
            groups: updateGroupsAfterElementDelete(
              template.summaryPage.groups,
              selectedElementIds
            ),
          },
        }
      } else {
        newTemplate = {
          ...template,
          page: restackBodyContainers(filterElements(template.page), template),
          groups: updateGroupsAfterElementDelete(template.groups, selectedElementIds),
        }
      }

      return {
        ...historyState,
        template: newTemplate,
        selectedElementIds: [],
        selectedContainerChildId: null,
        selectedContainerParentId: null,
        selectedLoopChildId: null,
        selectedLoopParentId: null,
        isDirty: true,
      }
    }),

  updateSelectedElements: (updates: Partial<Element>) =>
    set((state) => {
      const { selectedElementIds, selectedElementLocation, template } = state

      if (selectedElementIds.length === 0) return state

      const updateElements = (elements: Element[]): Element[] =>
        elements.map((el) => {
          let updated = selectedElementIds.includes(el.id) ? { ...el, ...updates } : el
          if (updated.elements && updated.elements.length > 0) {
            updated = {
              ...updated,
              elements: updateElements(updated.elements),
            }
          }
          return updated
        })

      let newTemplate: Template

      if (selectedElementLocation === 'header' && template.pageSettings.header) {
        newTemplate = {
          ...template,
          pageSettings: {
            ...template.pageSettings,
            header: {
              ...template.pageSettings.header,
              elements: updateElements(template.pageSettings.header.elements),
            },
          },
        }
      } else if (selectedElementLocation === 'footer' && template.pageSettings.footer) {
        newTemplate = {
          ...template,
          pageSettings: {
            ...template.pageSettings,
            footer: {
              ...template.pageSettings.footer,
              elements: updateElements(template.pageSettings.footer.elements),
            },
          },
        }
      } else if (selectedElementLocation === 'bodyBackground' && template.pageSettings.bodyBackground) {
        newTemplate = {
          ...template,
          pageSettings: {
            ...template.pageSettings,
            bodyBackground: {
              ...template.pageSettings.bodyBackground,
              elements: updateElements(template.pageSettings.bodyBackground.elements),
            },
          },
        }
      } else if (selectedElementLocation === 'summary' && template.summaryPage) {
        newTemplate = {
          ...template,
          summaryPage: {
            ...template.summaryPage,
            elements: updateElements(template.summaryPage.elements),
          },
        }
      } else {
        newTemplate = {
          ...template,
          page: updateElements(template.page),
        }
      }

      return {
        template: newTemplate,
        isDirty: true,
      }
    }),

  toggleElementVisibility: (id: string, location?: ElementLocation) =>
    set((state) => {
      const loc = location || state.selectedElementLocation

      const toggleInElements = (elements: Element[]): Element[] =>
        elements.map((el) => {
          if (el.id === id) {
            return { ...el, hidden: !el.hidden }
          }
          if (el.elements && el.elements.length > 0) {
            return {
              ...el,
              elements: toggleInElements(el.elements),
            }
          }
          return el
        })

      const historyState = saveToHistory(state, state.template)

      if (loc === 'header' && state.template.pageSettings.header) {
        return {
          ...historyState,
          template: {
            ...state.template,
            pageSettings: {
              ...state.template.pageSettings,
              header: {
                ...state.template.pageSettings.header,
                elements: toggleInElements(state.template.pageSettings.header.elements),
              },
            },
          },
          isDirty: true,
        }
      } else if (loc === 'footer' && state.template.pageSettings.footer) {
        return {
          ...historyState,
          template: {
            ...state.template,
            pageSettings: {
              ...state.template.pageSettings,
              footer: {
                ...state.template.pageSettings.footer,
                elements: toggleInElements(state.template.pageSettings.footer.elements),
              },
            },
          },
          isDirty: true,
        }
      } else if (loc === 'bodyBackground' && state.template.pageSettings.bodyBackground) {
        return {
          ...historyState,
          template: {
            ...state.template,
            pageSettings: {
              ...state.template.pageSettings,
              bodyBackground: {
                ...state.template.pageSettings.bodyBackground,
                elements: toggleInElements(state.template.pageSettings.bodyBackground.elements),
              },
            },
          },
          isDirty: true,
        }
      } else if (loc === 'summary' && state.template.summaryPage) {
        return {
          ...historyState,
          template: {
            ...state.template,
            summaryPage: {
              ...state.template.summaryPage,
              elements: toggleInElements(state.template.summaryPage.elements),
            },
          },
          isDirty: true,
        }
      } else {
        return {
          ...historyState,
          template: {
            ...state.template,
            page: restackBodyContainers(toggleInElements(state.template.page), state.template),
          },
          isDirty: true,
        }
      }
    }),

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

      let newTemplate: Template
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
        const insertIntoContainer = (elements: Element[]): Element[] => {
          return elements.map((el) => {
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
        }

        if (currentSection === 'header' && template.pageSettings.header) {
          newTemplate = {
            ...template,
            pageSettings: {
              ...template.pageSettings,
              header: {
                ...template.pageSettings.header,
                elements: insertIntoContainer(template.pageSettings.header.elements),
              },
            },
          }
        } else if (currentSection === 'footer' && template.pageSettings.footer) {
          newTemplate = {
            ...template,
            pageSettings: {
              ...template.pageSettings,
              footer: {
                ...template.pageSettings.footer,
                elements: insertIntoContainer(template.pageSettings.footer.elements),
              },
            },
          }
        } else if (currentSection === 'bodyBackground' && template.pageSettings.bodyBackground) {
          newTemplate = {
            ...template,
            pageSettings: {
              ...template.pageSettings,
              bodyBackground: {
                ...template.pageSettings.bodyBackground,
                elements: insertIntoContainer(template.pageSettings.bodyBackground.elements),
              },
            },
          }
        } else if (currentSection === 'summary' && template.summaryPage) {
          newTemplate = {
            ...template,
            summaryPage: {
              ...template.summaryPage,
              elements: insertIntoContainer(template.summaryPage.elements),
            },
          }
        } else {
          newTemplate = {
            ...template,
            page: restackBodyContainers(insertIntoContainer(template.page), template),
          }
        }

        return {
          template: newTemplate,
          selectedElementIds: [targetContainerId],
          selectedContainerChildId: newElements[0].id,
          selectedElementLocation: currentSection,
          isDirty: true,
          ...saveToHistory(state, newTemplate),
        }
      }

      if (currentSection === 'header' && template.pageSettings.header) {
        newTemplate = {
          ...template,
          pageSettings: {
            ...template.pageSettings,
            header: {
              ...template.pageSettings.header,
              elements: [...template.pageSettings.header.elements, ...newElements],
            },
          },
        }
      } else if (currentSection === 'footer' && template.pageSettings.footer) {
        newTemplate = {
          ...template,
          pageSettings: {
            ...template.pageSettings,
            footer: {
              ...template.pageSettings.footer,
              elements: [...template.pageSettings.footer.elements, ...newElements],
            },
          },
        }
      } else if (currentSection === 'bodyBackground' && template.pageSettings.bodyBackground) {
        newTemplate = {
          ...template,
          pageSettings: {
            ...template.pageSettings,
            bodyBackground: {
              ...template.pageSettings.bodyBackground,
              elements: [...template.pageSettings.bodyBackground.elements, ...newElements],
            },
          },
        }
      } else if (currentSection === 'summary' && template.summaryPage) {
        newTemplate = {
          ...template,
          summaryPage: {
            ...template.summaryPage,
            elements: [...template.summaryPage.elements, ...newElements],
          },
        }
      } else {
        newTemplate = {
          ...template,
          page: restackBodyContainers([...template.page, ...newElements], template),
        }
      }

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

      // Check if source is inside a container or loop
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

      let newTemplate: Template
      const { elements: updatedElements } = duplicateInList(sectionElements)

      if (loc === 'header' && state.template.pageSettings.header) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            header: {
              ...state.template.pageSettings.header,
              elements: updatedElements,
            },
          },
        }
      } else if (loc === 'footer' && state.template.pageSettings.footer) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            footer: {
              ...state.template.pageSettings.footer,
              elements: updatedElements,
            },
          },
        }
      } else if (loc === 'bodyBackground' && state.template.pageSettings.bodyBackground) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            bodyBackground: {
              ...state.template.pageSettings.bodyBackground,
              elements: updatedElements,
            },
          },
        }
      } else if (loc === 'summary' && state.template.summaryPage) {
        newTemplate = {
          ...state.template,
          summaryPage: {
            ...state.template.summaryPage,
            elements: updatedElements,
          },
        }
      } else {
        newTemplate = {
          ...state.template,
          page: restackBodyContainers(updatedElements, state.template),
        }
      }

      return {
        template: newTemplate,
        selectedElementIds: [newId],
        selectedElementLocation: loc,
        isDirty: true,
        ...saveToHistory(state, newTemplate),
      }
    }),
})
