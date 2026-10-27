import { Element, ElementGroup, Template, ElementLocation } from '../types'
import { SetTemplateStore, GetTemplateStore } from './types'
import { flattenElements, saveToHistory, restackBodyContainers } from '../helpers'

export const createElementSlice = (set: SetTemplateStore, get: GetTemplateStore) => ({
  copiedElements: null as { elements: Element[]; location: ElementLocation; isChild?: boolean; parentId?: string | null } | null,

  addElement: (element: Element, location: ElementLocation = 'body') =>
    set((state) => {
      let normalizedElement = { ...element }
      const size = state.template.pageSettings.size
      const pageSize = size === 'Letter' ? { width: 612, height: 792 } : { width: 595, height: 842 }
      const margins = state.template.pageSettings.margins
      const headerHeight = state.template.pageSettings.header?.height || 0
      const footerHeight = state.template.pageSettings.footer?.height || 0
      
      let sectionHeight = pageSize.height - (margins.top || 0) - (margins.bottom || 0)
      if (location === 'header') sectionHeight = headerHeight
      else if (location === 'footer') sectionHeight = footerHeight
      else if (location === 'body') sectionHeight -= (headerHeight + footerHeight)

      if (element.type === 'container' || element.type === 'page_break' || element.type === 'spacer') {
        let sectionElements: Element[] = []
        if (location === 'header') sectionElements = state.template.pageSettings.header?.elements || []
        else if (location === 'footer') sectionElements = state.template.pageSettings.footer?.elements || []
        else if (location === 'bodyBackground') sectionElements = state.template.pageSettings.bodyBackground?.elements || []
        else if (location === 'summary') sectionElements = state.template.summaryPage?.elements || []
        else sectionElements = state.template.page || []

        const containers = sectionElements.filter(el => el.type === 'container')
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
          height: element.type === 'page_break' ? 20 : (element.type === 'spacer' ? 50 : Math.min(typeof element.height === 'number' ? element.height : 120, remainingHeight))
        }
      }
      const selectedId = state.selectedElementIds[0]
      const selectedParentId = state.selectedContainerParentId
      const selectedLoopParentId = state.selectedLoopParentId

      const insertIntoElements = (elements: Element[]) => {
        if (normalizedElement.type === 'container' || normalizedElement.type === 'page_break' || normalizedElement.type === 'spacer') {
          return {
            newElements: [...elements, normalizedElement],
            newSelectedId: normalizedElement.id,
            newSelectedChildId: null,
            isTargetLoop: false,
          }
        }

        let targetLoop: Element | null = null
        if (selectedLoopParentId) {
          targetLoop = elements.find((el) => el.id === selectedLoopParentId && el.type === 'loop') || null
          if (!targetLoop) {
            for (const el of elements) {
              if (el.elements) {
                const nested = el.elements.find((c) => c.id === selectedLoopParentId && c.type === 'loop')
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
                const loopParent = el.elements.find((c) => c.type === 'loop' && c.elements?.some((gc) => gc.id === selectedId))
                if (loopParent) {
                  targetLoop = loopParent
                  break
                }
              }
            }
          }
          if (!targetLoop) {
            targetLoop = elements.find((el) => el.type === 'loop' && el.elements?.some((c) => c.id === selectedId)) || null
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
            if ((lastChild.positionMode || lastChild.position || '').toUpperCase() === 'RELATIVE') {
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
            targetContainer = elements.find((el) => el.id === selectedParentId && el.type === 'container')
          }
          if (!targetContainer && selectedId) {
            targetContainer = elements.find(
              (el) => el.type === 'container' && el.elements?.some((child) => child.id === selectedId)
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
          if ((lastChild.positionMode || lastChild.position || '').toUpperCase() === 'RELATIVE') {
            normalizedElement.positionMode = 'RELATIVE'
            normalizedElement.position = 'relative'
            normalizedElement.relativeOffsetY = 0
          }
        }
        const adaptedChild = {
          ...normalizedElement,
          x: childX,
          y: childY,
          ...(childWidth !== undefined ? { width: childWidth } : {})
        }

        const childH = typeof adaptedChild.height === 'number' ? adaptedChild.height : 25
        const childBottom = childY + childH
        const requiredContainerHeight = childBottom + 15
        const currentContainerHeight = typeof targetContainer.height === 'number' ? targetContainer.height : 150
        const isFixed = targetContainer.heightMode === 'fixed' || targetContainer.autoHeight === false
        const maxContainerHeight = Math.max(30, sectionHeight - (targetContainer.y || 0))

        if (isFixed) {
          if (childBottom > currentContainerHeight) {
            alert(`O container "${targetContainer.name || targetContainer.id}" possui altura fixa (${currentContainerHeight} pt) e não há espaço suficiente para adicionar este elemento (necessário: ${childBottom} pt). Altere para auto-height ou aumente a altura do container.`)
            return {
              newElements: elements,
              newSelectedId: targetContainer.id,
              newSelectedChildId: null,
              isTargetLoop: false,
            }
          }
        } else {
          if (childBottom > maxContainerHeight) {
            alert(`Não é possível adicionar o elemento: o container ultrapassaria o limite da página (altura máxima disponível: ${Math.round(maxContainerHeight)} pt, necessário: ${Math.round(childBottom)} pt).`)
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
            alert(`Não é possível adicionar o elemento: os containers seguintes seriam empurrados para fora da página.`)
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
        const { newElements, newSelectedId, newSelectedChildId, isTargetLoop } = insertIntoElements(state.template.pageSettings.header.elements)
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
        const { newElements, newSelectedId, newSelectedChildId, isTargetLoop } = insertIntoElements(state.template.pageSettings.footer.elements)
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
        const { newElements, newSelectedId, newSelectedChildId, isTargetLoop } = insertIntoElements(state.template.pageSettings.bodyBackground.elements)
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
        const { newElements, newSelectedId, newSelectedChildId, isTargetLoop } = insertIntoElements(state.template.summaryPage.elements)
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
        const { newElements, newSelectedId, newSelectedChildId, isTargetLoop } = insertIntoElements(state.template.page)
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
      
      const updateGroups = (groups?: ElementGroup[]) => {
        if (!groups || newId === id) return groups
        return groups.map(g => ({
          ...g,
          elementIds: g.elementIds.map(eid => eid === id ? newId : eid)
        }))
      }

      const applyUpdates = (elements: Element[]): Element[] => {
        return elements.map((el) => {
          if (el.id === id) {
            let result = { ...el, ...updates }
            
            if (el.type === 'container') {
               const size = state.template.pageSettings.size
               const pageSize = size === 'Letter' ? { width: 612, height: 792 } : { width: 595, height: 842 }
               const margins = state.template.pageSettings.margins
               const headerHeight = state.template.pageSettings.header?.height || 0
               const footerHeight = state.template.pageSettings.footer?.height || 0
               
               let sectionHeight = pageSize.height - (margins.top || 0) - (margins.bottom || 0)
               if (loc === 'header') sectionHeight = headerHeight
               else if (loc === 'footer') sectionHeight = footerHeight
               else if (loc === 'body') sectionHeight -= (headerHeight + footerHeight)
               
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
      
      const newSelectedElementIds = newId !== id 
        ? state.selectedElementIds.map(sid => sid === id ? newId : sid)
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
                groups: updateGroups(state.template.pageSettings.header.groups),
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
                groups: updateGroups(state.template.pageSettings.footer.groups),
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
                groups: updateGroups(state.template.pageSettings.bodyBackground.groups),
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
              groups: updateGroups(state.template.summaryPage.groups),
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
            groups: updateGroups(state.template.groups),
          },
          selectedElementIds: newSelectedElementIds,
          isDirty: true,
        }
      }
    }),

  deleteElement: (id: string, location?: ElementLocation) =>
    set((state) => {
      const loc = location || state.selectedElementLocation
      
      const updateGroupsAfterDelete = (groups: ElementGroup[] | undefined) => {
        if (!groups) return undefined
        return groups
          .map(group => ({
            ...group,
            elementIds: group.elementIds.filter(elementId => elementId !== id)
          }))
          .filter(group => group.elementIds.length > 0)
      }
      
      let newTemplate: Template

      if (loc === 'header' && state.template.pageSettings.header) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            header: {
              ...state.template.pageSettings.header,
              elements: state.template.pageSettings.header.elements.filter((el) => el.id !== id),
              groups: updateGroupsAfterDelete(state.template.pageSettings.header.groups),
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
              elements: state.template.pageSettings.footer.elements.filter((el) => el.id !== id),
              groups: updateGroupsAfterDelete(state.template.pageSettings.footer.groups),
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
              elements: state.template.pageSettings.bodyBackground.elements.filter((el) => el.id !== id),
              groups: updateGroupsAfterDelete(state.template.pageSettings.bodyBackground.groups),
            },
          },
        }
      } else if (loc === 'summary' && state.template.summaryPage) {
        newTemplate = {
          ...state.template,
          summaryPage: {
            ...state.template.summaryPage,
            elements: state.template.summaryPage.elements.filter((el) => el.id !== id),
            groups: updateGroupsAfterDelete(state.template.summaryPage.groups),
          },
        }
      } else {
        newTemplate = {
          ...state.template,
          page: restackBodyContainers(state.template.page.filter((el) => el.id !== id), state.template),
          groups: updateGroupsAfterDelete(state.template.groups),
        }
      }

      return {
        template: newTemplate,
        selectedElementIds: state.selectedElementIds.filter(selectedId => selectedId !== id),
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
          .filter(el => !selectedElementIds.includes(el.id))
          .map(el => {
            if (el.elements && el.elements.length > 0) {
              return {
                ...el,
                elements: filterElements(el.elements),
              }
            }
            return el
          })
      
      const updateGroupsAfterDelete = (groups: ElementGroup[] | undefined) => {
        if (!groups) return undefined
        return groups
          .map(group => ({
            ...group,
            elementIds: group.elementIds.filter(elementId => !selectedElementIds.includes(elementId))
          }))
          .filter(group => group.elementIds.length > 0)
      }
      
      let newTemplate: Template
      
      if (selectedElementLocation === 'header' && template.pageSettings.header) {
        newTemplate = {
          ...template,
          pageSettings: {
            ...template.pageSettings,
            header: {
              ...template.pageSettings.header,
              elements: filterElements(template.pageSettings.header.elements),
              groups: updateGroupsAfterDelete(template.pageSettings.header.groups),
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
              groups: updateGroupsAfterDelete(template.pageSettings.footer.groups),
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
              groups: updateGroupsAfterDelete(template.pageSettings.bodyBackground.groups),
            },
          },
        }
      } else if (selectedElementLocation === 'summary' && template.summaryPage) {
        newTemplate = {
          ...template,
          summaryPage: {
            ...template.summaryPage,
            elements: filterElements(template.summaryPage.elements),
            groups: updateGroupsAfterDelete(template.summaryPage.groups),
          },
        }
      } else {
        newTemplate = {
          ...template,
          page: restackBodyContainers(filterElements(template.page), template),
          groups: updateGroupsAfterDelete(template.groups),
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
        elements.map(el => {
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

  moveElementUp: (id: string, location: ElementLocation = 'body') =>
    set((state) => {
      const moveUp = (elements: Element[]) => {
        const index = elements.findIndex((el) => el.id === id)
        if (index <= 0) return elements
        const newElements = [...elements]
        ;[newElements[index - 1], newElements[index]] = [newElements[index], newElements[index - 1]]
        return newElements
      }

      if (location === 'header' && state.template.pageSettings.header) {
        return {
          template: {
            ...state.template,
            pageSettings: {
              ...state.template.pageSettings,
              header: {
                ...state.template.pageSettings.header,
                elements: moveUp(state.template.pageSettings.header.elements),
              },
            },
          },
          isDirty: true,
        }
      } else if (location === 'footer' && state.template.pageSettings.footer) {
        return {
          template: {
            ...state.template,
            pageSettings: {
              ...state.template.pageSettings,
              footer: {
                ...state.template.pageSettings.footer,
                elements: moveUp(state.template.pageSettings.footer.elements),
              },
            },
          },
          isDirty: true,
        }
      } else {
        const moved = moveUp(state.template.page)
        return {
          template: {
            ...state.template,
            page: restackBodyContainers(moved),
          },
          isDirty: true,
        }
      }
    }),

  moveElementDown: (id: string, location: ElementLocation = 'body') =>
    set((state) => {
      const moveDown = (elements: Element[]) => {
        const index = elements.findIndex((el) => el.id === id)
        if (index < 0 || index >= elements.length - 1) return elements
        const newElements = [...elements]
        ;[newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]]
        return newElements
      }

      if (location === 'header' && state.template.pageSettings.header) {
        return {
          template: {
            ...state.template,
            pageSettings: {
              ...state.template.pageSettings,
              header: {
                ...state.template.pageSettings.header,
                elements: moveDown(state.template.pageSettings.header.elements),
              },
            },
          },
          isDirty: true,
        }
      } else if (location === 'footer' && state.template.pageSettings.footer) {
        return {
          template: {
            ...state.template,
            pageSettings: {
              ...state.template.pageSettings,
              footer: {
                ...state.template.pageSettings.footer,
                elements: moveDown(state.template.pageSettings.footer.elements),
              },
            },
          },
          isDirty: true,
        }
      } else {
        const moved = moveDown(state.template.page)
        return {
          template: {
            ...state.template,
            page: restackBodyContainers(moved),
          },
          isDirty: true,
        }
      }
    }),

  moveElementToTop: (id: string, location: ElementLocation = 'body') =>
    set((state) => {
      const moveToTop = (elements: Element[]) => {
        const index = elements.findIndex((el) => el.id === id)
        if (index <= 0) return elements
        const element = elements[index]
        const newElements = [element, ...elements.filter((el) => el.id !== id)]
        return newElements
      }

      if (location === 'header' && state.template.pageSettings.header) {
        return {
          template: {
            ...state.template,
            pageSettings: {
              ...state.template.pageSettings,
              header: {
                ...state.template.pageSettings.header,
                elements: moveToTop(state.template.pageSettings.header.elements),
              },
            },
          },
          isDirty: true,
        }
      } else if (location === 'footer' && state.template.pageSettings.footer) {
        return {
          template: {
            ...state.template,
            pageSettings: {
              ...state.template.pageSettings,
              footer: {
                ...state.template.pageSettings.footer,
                elements: moveToTop(state.template.pageSettings.footer.elements),
              },
            },
          },
          isDirty: true,
        }
      } else {
        return {
          template: {
            ...state.template,
            page: restackBodyContainers(moveToTop(state.template.page), state.template),
          },
          isDirty: true,
        }
      }
    }),

  moveElementToBottom: (id: string, location: ElementLocation = 'body') =>
    set((state) => {
      const moveToBottom = (elements: Element[]) => {
        const index = elements.findIndex((el) => el.id === id)
        if (index < 0 || index >= elements.length - 1) return elements
        const element = elements[index]
        const newElements = [...elements.filter((el) => el.id !== id), element]
        return newElements
      }

      if (location === 'header' && state.template.pageSettings.header) {
        return {
          template: {
            ...state.template,
            pageSettings: {
              ...state.template.pageSettings,
              header: {
                ...state.template.pageSettings.header,
                elements: moveToBottom(state.template.pageSettings.header.elements),
              },
            },
          },
          isDirty: true,
        }
      } else if (location === 'footer' && state.template.pageSettings.footer) {
        return {
          template: {
            ...state.template,
            pageSettings: {
              ...state.template.pageSettings,
              footer: {
                ...state.template.pageSettings.footer,
                elements: moveToBottom(state.template.pageSettings.footer.elements),
              },
            },
          },
          isDirty: true,
        }
      } else {
        return {
          template: {
            ...state.template,
            page: restackBodyContainers(moveToBottom(state.template.page), state.template),
          },
          isDirty: true,
        }
      }
    }),

  reorderElement: (id: string, newIndex: number, location: ElementLocation = 'body') =>
    set((state) => {
      const reorder = (elements: Element[]): Element[] => {
        const oldIndex = elements.findIndex((el) => el.id === id)
        if (oldIndex >= 0) {
          if (oldIndex === newIndex) return elements
          const newElements = [...elements]
          const [element] = newElements.splice(oldIndex, 1)
          newElements.splice(newIndex, 0, element)
          return newElements
        }

        return elements.map(el => {
          if ((el.type === 'container' || el.type === 'loop') && el.elements) {
            const childIdx = el.elements.findIndex(c => c.id === id)
            if (childIdx >= 0) {
              if (childIdx === newIndex) return el
              const newChildren = [...el.elements]
              const [movedChild] = newChildren.splice(childIdx, 1)
              newChildren.splice(newIndex, 0, movedChild)
              return { ...el, elements: newChildren }
            }
            return {
              ...el,
              elements: reorder(el.elements),
            }
          }
          return el
        })
      }

      const historyState = saveToHistory(state, state.template)

      if (location === 'header' && state.template.pageSettings.header) {
        return {
          ...historyState,
          template: {
            ...state.template,
            pageSettings: {
              ...state.template.pageSettings,
              header: {
                ...state.template.pageSettings.header,
                elements: reorder(state.template.pageSettings.header.elements),
              },
            },
          },
          isDirty: true,
        }
      } else if (location === 'footer' && state.template.pageSettings.footer) {
        return {
          ...historyState,
          template: {
            ...state.template,
            pageSettings: {
              ...state.template.pageSettings,
              footer: {
                ...state.template.pageSettings.footer,
                elements: reorder(state.template.pageSettings.footer.elements),
              },
            },
          },
          isDirty: true,
        }
      } else if (location === 'bodyBackground' && state.template.pageSettings.bodyBackground) {
        return {
          ...historyState,
          template: {
            ...state.template,
            pageSettings: {
              ...state.template.pageSettings,
              bodyBackground: {
                ...state.template.pageSettings.bodyBackground,
                elements: reorder(state.template.pageSettings.bodyBackground.elements),
              },
            },
          },
          isDirty: true,
        }
      } else if (location === 'summary' && state.template.summaryPage) {
        return {
          ...historyState,
          template: {
            ...state.template,
            summaryPage: {
              ...state.template.summaryPage,
              elements: reorder(state.template.summaryPage.elements),
            },
          },
          isDirty: true,
        }
      } else {
        return {
          ...historyState,
          template: {
            ...state.template,
            page: restackBodyContainers(reorder(state.template.page), state.template),
          },
          isDirty: true,
        }
      }
    }),

  toggleElementVisibility: (id: string, location?: ElementLocation) =>
    set((state) => {
      const loc = location || state.selectedElementLocation
      
      const toggleInElements = (elements: Element[]) => 
        elements.map(el => el.id === id ? { ...el, hidden: !el.hidden } : el)
      
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
      const { selectedElementIds, selectedElementLocation, selectedContainerChildId, template } = state
      
      if (selectedElementIds.length === 0) return state
      
      let allElements: Element[] = []
      
      if (selectedElementLocation === 'header' && template.pageSettings.header) {
        allElements = template.pageSettings.header.elements
      } else if (selectedElementLocation === 'footer' && template.pageSettings.footer) {
        allElements = template.pageSettings.footer.elements
      } else if (selectedElementLocation === 'bodyBackground' && template.pageSettings.bodyBackground) {
        allElements = template.pageSettings.bodyBackground.elements
      } else {
        allElements = template.page
      }
      
      let elementsToCopy: Element[] = []
      let isChild = false
      let parentId: string | null = null

      if (selectedContainerChildId) {
        const parentIdTarget = state.selectedContainerParentId || selectedElementIds[0]
        const container = allElements.find(el => el.id === parentIdTarget) as any
        if (container && container.elements) {
          const child = container.elements.find((el: any) => el.id === selectedContainerChildId)
          if (child) {
            elementsToCopy = [child]
            isChild = true
            parentId = container.id
          }
        }
      } else {
        const flatElements = flattenElements(allElements)
        elementsToCopy = flatElements.filter(el => selectedElementIds.includes(el.id))
      }
      
      if (elementsToCopy.length === 0) return state
      
      const copiedElements = JSON.parse(JSON.stringify(elementsToCopy))
      
      return {
        copiedElements: {
          elements: copiedElements,
          location: selectedElementLocation,
          isChild,
          parentId
        },
      }
    }),

  pasteElement: () =>
    set((state) => {
      const { copiedElements, currentSection, template, selectedElementIds, selectedContainerChildId, selectedContainerParentId } = state
      
      if (!copiedElements || copiedElements.elements.length === 0) {
        return state
      }
      
      const timestamp = Date.now()
      const newElements = copiedElements.elements.map((element, index) => ({
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
        let allElements: any[] = []
        if (currentSection === 'header' && template.pageSettings.header) {
          allElements = template.pageSettings.header.elements
        } else if (currentSection === 'footer' && template.pageSettings.footer) {
          allElements = template.pageSettings.footer.elements
        } else if (currentSection === 'bodyBackground' && template.pageSettings.bodyBackground) {
          allElements = template.pageSettings.bodyBackground.elements
        } else {
          allElements = template.page
        }
        
        const el = allElements.find(e => e.id === selectedElementIds[0])
        if (el && el.type === 'container') {
          targetContainerId = el.id
        }
      }
      
      if (targetContainerId) {
        const insertIntoContainer = (elements: any[]): any[] => {
          return elements.map(el => {
            if (el.id === targetContainerId && el.type === 'container') {
              return {
                ...el,
                elements: [...(el.elements || []), ...newElements]
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
      } else {
        newTemplate = {
          ...template,
          page: restackBodyContainers([...template.page, ...newElements], template),
        }
      }
      
      return {
        template: newTemplate,
        selectedElementIds: newElements.map(el => el.id),
        selectedContainerChildId: null,
        selectedElementLocation: currentSection,
        isDirty: true,
        ...saveToHistory(state, newTemplate),
      }
    }),
})
