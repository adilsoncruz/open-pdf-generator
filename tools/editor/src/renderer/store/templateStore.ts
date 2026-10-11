import { create } from 'zustand'

export type ElementLocation = 'body' | 'header' | 'footer' | 'bodyBackground' | 'summary'

/**
 * Represents a template element that can be rendered in the PDF.
 * Elements can be text, images, tables, rectangles, lines, barcodes, or loops.
 */
export interface Element {
  type: string
  id: string
  x: number
  y: number
  groupId?: string 
  hidden?: boolean  
  width?: number | string
  height?: number | string
  style?: Record<string, unknown>  
  value?: string
  dataBinding?: string
  printCondition?: string  
  elements?: Element[]
  itemSpacing?: number  
  startY?: number  
  [key: string]: unknown  
}

export interface ElementGroup {
  id: string
  name: string
  elementIds: string[]
  location: ElementLocation
  printCondition?: string  
  collapsed?: boolean  
}

export interface Template {
  version: string
  metadata: {
    name: string
    description: string
    author?: string
    created?: string
    modified?: string
    tags?: string[]
  }
  pageSettings: {
    size: string
    orientation: string
    margins: {
      top: number
      right: number
      bottom: number
      left: number
    }
    header?: {
      height: number
      elements: Element[]
      groups?: ElementGroup[]
      printCondition?: string
    }
    footer?: {
      height: number
      elements: Element[]
      groups?: ElementGroup[]
      printCondition?: string
    }
    bodyBackground?: {
      elements: Element[]
      groups?: ElementGroup[]
      printCondition?: string
    }
  }
  page: Element[]
  groups?: ElementGroup[]  // Grupos do body
  summaryPage?: {
    elements: Element[]
    groups?: ElementGroup[]
    printCondition?: string  
    background?: {
      elements: Element[]
      groups?: ElementGroup[]
    }
  }
}

interface TemplateStore {
  template: Template
  selectedElementIds: string[]
  selectedElementLocation: ElementLocation
  selectedGroupId: string | null  // ID do grupo selecionado
  selectedLoopChildId: string | null  // ID do elemento filho do loop selecionado
  selectedLoopParentId: string | null
  expandedLoopIds: string[]
  selectedContainerChildId: string | null
  selectedContainerParentId: string | null
  expandedContainerIds: string[]
  expandedLoopIds: string[]  // IDs dos loops expandidos na sidebar
  currentFilePath: string | null
  isDirty: boolean
  testData: Record<string, unknown>
  currentSection: ElementLocation
  history: Template[]
  historyIndex: number
  copiedElements: { elements: Element[]; location: ElementLocation; isChild?: boolean; parentId?: string | null } | null
  isPropertiesPanelPinned: boolean
  isSidebarPinned: boolean
  isSidebarMinimized: boolean

  // Actions
  setTemplate: (template: Template) => void
  updateTemplate: (updates: Partial<Template>) => void
  updatePageSettings: (updates: Partial<Template['pageSettings']>) => void
  updateMetadata: (updates: Partial<Template['metadata']>) => void
  addElement: (element: Element, location?: ElementLocation) => void
  updateElement: (id: string, updates: Partial<Element>, location?: ElementLocation) => void
  deleteElement: (id: string, location?: ElementLocation) => void
  selectElement: (id: string | null, location?: ElementLocation) => void
  toggleElementSelection: (id: string, location?: ElementLocation) => void
  selectMultipleElements: (ids: string[], location?: ElementLocation) => void
  clearSelection: () => void
  selectAllElements: () => void
  deleteSelectedElements: () => void
  updateSelectedElements: (updates: Partial<Element>) => void
  setCurrentFilePath: (path: string | null) => void
  setTestData: (data: Record<string, unknown>) => void
  markClean: () => void
  setCurrentSection: (section: ElementLocation) => void
  addHeader: () => void
  addFooter: () => void
  removeHeader: () => void
  removeFooter: () => void
  addBodyBackground: () => void
  removeBodyBackground: () => void
  addSummaryPage: () => void
  removeSummaryPage: () => void
  updateSummaryPage: (updates: { printCondition?: string }) => void
  updateHeader: (updates: { height?: number; printCondition?: string }) => void
  updateFooter: (updates: { height?: number; printCondition?: string }) => void
  updateBodyBackground: (updates: { printCondition?: string }) => void
  moveElementUp: (id: string, location?: ElementLocation) => void
  moveElementDown: (id: string, location?: ElementLocation) => void
  moveElementToTop: (id: string, location?: ElementLocation) => void
  moveElementToBottom: (id: string, location?: ElementLocation) => void
  reorderElement: (id: string, newIndex: number, location?: ElementLocation) => void
  toggleElementVisibility: (id: string, location?: ElementLocation) => void
  copyElement: () => void
  pasteElement: () => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  jumpToHistoryIndex: (index: number) => void
  saveSnapshot: () => void  
  
  // Group Actions
  createGroup: (name: string, elementIds: string[], location?: ElementLocation) => void
  updateGroup: (groupId: string, updates: Partial<ElementGroup>, location?: ElementLocation) => void
  deleteGroup: (groupId: string, location?: ElementLocation) => void
  ungroupElements: (groupId: string, location?: ElementLocation) => void
  toggleGroupCollapse: (groupId: string, location?: ElementLocation) => void
  toggleGroupVisibility: (groupId: string, location?: ElementLocation) => void
  selectGroup: (groupId: string | null, location?: ElementLocation) => void
  reorderGroup: (groupId: string, newIndex: number, location?: ElementLocation) => void
  
  // Loop Element Actions
  addElementToLoop: (loopId: string, element: Element, location?: ElementLocation) => void
  updateLoopChildElement: (loopId: string, childId: string, updates: Partial<Element>, location?: ElementLocation) => void
  deleteLoopChildElement: (loopId: string, childId: string, location?: ElementLocation) => void
  selectLoopChild: (loopId: string, childId: string, location?: ElementLocation) => void
  clearLoopChildSelection: () => void
  toggleLoopExpanded: (loopId: string) => void
  reorderLoopChildren: (loopId: string, fromIndex: number, toIndex: number, location?: ElementLocation) => void

  // Container Element Actions
  addElementToLoop: (containerId: string, element: Element, location?: ElementLocation) => void
  updateContainerChildElement: (containerId: string, childId: string, updates: Partial<Element>, location?: ElementLocation) => void
  deleteContainerChildElement: (containerId: string, childId: string, location?: ElementLocation) => void
  selectContainerChild: (containerId: string, childId: string, location?: ElementLocation) => void
  clearContainerChildSelection: () => void
  toggleContainerExpanded: (containerId: string) => void
  reorderContainerChildren: (containerId: string, fromIndex: number, toIndex: number, location?: ElementLocation) => void
  
  // UI State Actions
  togglePropertiesPanelPinned: () => void
  toggleSidebarPinned: () => void
  toggleSidebarMinimized: () => void
}

const defaultTemplate: Template = {
  version: '1.0',
  metadata: {
    name: 'New Template',
    description: '',
    author: '',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    tags: [],
  },
  pageSettings: {
    size: 'A4',
    orientation: 'portrait',
    margins: {
      top: 30,
      right: 30,
      bottom: 30,
      left: 30,
    },
  },
  page: [],
}

const normalizeBodyContainers = (template: Template): Template => ({
  ...template,
  page: (template.page || []).map((el) =>
    el.type === 'container' ? { ...el, x: 0, width: '100%' } : el
  ),
})

const restackBodyContainers = (elements: Element[]): Element[] => {
  let currentY = 0
  return elements.map((el) => {
    if (el.type !== 'container') return el
    const next = {
      ...el,
      x: 0,
      y: currentY,
      width: '100%',
    }
    const h = typeof el.height === 'number' ? el.height : 150
    currentY += h
    return next
  })
}


const saveToHistory = (state: TemplateStore, newTemplate: Template) => {
  const newHistory = state.history.slice(0, state.historyIndex + 1)
  newHistory.push(JSON.parse(JSON.stringify(newTemplate))) // Deep clone
  
  
  if (newHistory.length > 50) {
    newHistory.shift()
  } else {
    return {
      history: newHistory,
      historyIndex: newHistory.length - 1,
    }
  }
  
  return {
    history: newHistory,
    historyIndex: newHistory.length - 1,
  }
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  template: defaultTemplate,
  selectedElementIds: [],
  selectedElementLocation: 'body',
  selectedGroupId: null,
  selectedLoopChildId: null,
  selectedLoopParentId: null,
  expandedLoopIds: [],
  selectedContainerChildId: null,
  selectedContainerParentId: null,
  expandedContainerIds: [],
  currentFilePath: null,
  isDirty: false,
  testData: {},
  currentSection: 'body',
  history: [JSON.parse(JSON.stringify(defaultTemplate))],
  historyIndex: 0,
  copiedElements: null,
  isPropertiesPanelPinned: true,
  isSidebarPinned: true,
  isSidebarMinimized: false,

  setTemplate: (template) =>
    set(() => ({
      template: normalizeBodyContainers(template),
      isDirty: false,
      selectedElementIds: [],
      selectedElementLocation: 'body',
      
      history: [JSON.parse(JSON.stringify(normalizeBodyContainers(template)))],
      historyIndex: 0,
    })),

  updateTemplate: (updates) =>
    set((state) => {
      const newTemplate = { ...state.template, ...updates }
      return {
        template: newTemplate,
        isDirty: true,
        ...saveToHistory(state, newTemplate),
      }
    }),

  updatePageSettings: (updates) =>
    set((state) => {
      const newTemplate = {
        ...state.template,
        pageSettings: {
          ...state.template.pageSettings,
          ...updates,
        },
      }
      return {
        template: newTemplate,
        isDirty: true,
        ...saveToHistory(state, newTemplate),
      }
    }),

  updateMetadata: (updates) =>
    set((state) => {
      const newTemplate = {
        ...state.template,
        metadata: {
          ...state.template.metadata,
          ...updates,
        },
      }
      return {
        template: newTemplate,
        isDirty: true,
        ...saveToHistory(state, newTemplate),
      }
    }),

  addElement: (element, location = 'body') =>
    set((state) => {
      let normalizedElement = { ...element }
      if (element.type === 'container') {
        const size = state.template.pageSettings.size
        const pageSize = size === 'Letter' ? { width: 612, height: 792 } : { width: 595, height: 842 }
        const margins = state.template.pageSettings.margins
        const headerHeight = state.template.pageSettings.header?.height || 0
        const footerHeight = state.template.pageSettings.footer?.height || 0
        
        let sectionHeight = pageSize.height - (margins.top || 0) - (margins.bottom || 0)
        if (location === 'header') sectionHeight = headerHeight
        else if (location === 'footer') sectionHeight = footerHeight
        else if (location === 'body') sectionHeight -= (headerHeight + footerHeight)
        
        // Obter os elementos atuais da seção para posicionar o novo container abaixo do anterior
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

        normalizedElement = {
          ...element,
          x: 0,
          y: nextY,
          width: '100%',
          height: Math.min(typeof element.height === 'number' ? element.height : 120, Math.max(0, sectionHeight))
        }
      }
      const selectedId = state.selectedElementIds[0]
      const insertIntoElements = (elements: Element[]) => {
        const selectedContainer = elements.find(
          (el) => el.id === selectedId && el.type === 'container'
        )
        if (selectedContainer && normalizedElement.type !== 'container') {
          const containerChildren = selectedContainer.elements || []
          let childY = normalizedElement.y ?? 20
          let childX = normalizedElement.x ?? 20
          let childWidth = normalizedElement.width
          if (containerChildren.length > 0) {
            const lastChild = containerChildren[containerChildren.length - 1]
            const lastY = typeof lastChild.y === 'number' ? lastChild.y : 0
            const lastH = typeof lastChild.height === 'number' ? lastChild.height : 25
            childY = lastY + lastH + 10
            childX = lastChild.x ?? childX
            if (typeof lastChild.width === 'number') {
              childWidth = lastChild.width
            }
            if ((lastChild.positionMode || lastChild.position || '').toUpperCase() === 'RELATIVE') {
              normalizedElement.positionMode = 'RELATIVE'
              normalizedElement.position = 'relative'
              normalizedElement.relativeOffsetY = 10
            }
          }
          const adaptedChild = {
            ...normalizedElement,
            x: childX,
            y: childY,
            ...(childWidth !== undefined ? { width: childWidth } : {})
          }
          return {
            newElements: elements.map((el) =>
              el.id === selectedContainer.id
                ? { ...el, elements: [...containerChildren, adaptedChild] }
                : el
            ),
            newSelectedId: selectedContainer.id
          }
        }

        // Se adicionando elemento regular na secao
        let refElement: Element | undefined = undefined
        if (selectedId) {
          refElement = elements.find(el => el.id === selectedId)
        }
        if (!refElement && elements.length > 0) {
          refElement = elements[elements.length - 1]
        }

        if (refElement && refElement.type !== 'container' && normalizedElement.type !== 'container') {
          const isRefRelative = (refElement.positionMode || refElement.position || '').toUpperCase() === 'RELATIVE'
          const isNewRelative = (normalizedElement.positionMode || normalizedElement.position || '').toUpperCase() === 'RELATIVE'

          const refY = typeof refElement.y === 'number' ? refElement.y : 40
          const refH = typeof refElement.height === 'number' ? refElement.height : 25
          const nextY = refY + refH + 10

          normalizedElement = {
            ...normalizedElement,
            x: refElement.x ?? normalizedElement.x,
            y: nextY,
            width: refElement.width ?? normalizedElement.width,
            ...(isRefRelative || isNewRelative ? {
              positionMode: 'RELATIVE',
              position: 'relative',
              relativeOffsetY: 10,
            } : {})
          }
        }

        return {
          newElements: [...elements, normalizedElement],
          newSelectedId: normalizedElement.id
        }
      }

      let newTemplate
      if (location === 'header' && state.template.pageSettings.header) {
        const { newElements, newSelectedId } = insertIntoElements(state.template.pageSettings.header.elements)
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
          selectedElementLocation: 'header',
          isDirty: true,
          ...saveToHistory(state, newTemplate),
        }
      } else if (location === 'footer' && state.template.pageSettings.footer) {
        const { newElements, newSelectedId } = insertIntoElements(state.template.pageSettings.footer.elements)
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
          selectedElementLocation: 'footer',
          isDirty: true,
          ...saveToHistory(state, newTemplate),
        }
      } else if (location === 'bodyBackground' && state.template.pageSettings.bodyBackground) {
        const { newElements, newSelectedId } = insertIntoElements(state.template.pageSettings.bodyBackground.elements)
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
          selectedElementLocation: 'bodyBackground',
          isDirty: true,
          ...saveToHistory(state, newTemplate),
        }
      } else if (location === 'summary' && state.template.summaryPage) {
        const { newElements, newSelectedId } = insertIntoElements(state.template.summaryPage.elements)
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
          selectedElementLocation: 'summary',
          isDirty: true,
          ...saveToHistory(state, newTemplate),
        }
      } else {
        const { newElements, newSelectedId } = insertIntoElements(state.template.page)
        newTemplate = {
          ...state.template,
          page: newElements,
        }
        return {
          template: newTemplate,
          selectedElementIds: [newSelectedId],
          selectedElementLocation: 'body',
          isDirty: true,
          ...saveToHistory(state, newTemplate),
        }
      }
    }),

  updateElement: (id, updates, location) =>
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

      const applyUpdates = (elements: Element[]) => {
        return elements.map((el) => {
          if (el.id !== id) return el
          
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
            page: applyUpdates(state.template.page),
            groups: updateGroups(state.template.groups),
          },
          selectedElementIds: newSelectedElementIds,
          isDirty: true,
        }
      }
    }),

  deleteElement: (id, location) =>
    set((state) => {
      const loc = location || state.selectedElementLocation
      
      
      const updateGroupsAfterDelete = (groups: ElementGroup[] | undefined) => {
        if (!groups) return undefined
        
        // Remover elementId dos grupos e filtrar grupos vazios
        return groups
          .map(group => ({
            ...group,
            elementIds: group.elementIds.filter(elementId => elementId !== id)
          }))
          .filter(group => group.elementIds.length > 0) // Remover grupos vazios
      }
      
      if (loc === 'header' && state.template.pageSettings.header) {
        return {
          template: {
            ...state.template,
            pageSettings: {
              ...state.template.pageSettings,
              header: {
                ...state.template.pageSettings.header,
                elements: state.template.pageSettings.header.elements.filter((el) => el.id !== id),
                groups: updateGroupsAfterDelete(state.template.pageSettings.header.groups),
              },
            },
          },
          selectedElementIds: state.selectedElementIds.filter(selectedId => selectedId !== id),
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
                elements: state.template.pageSettings.footer.elements.filter((el) => el.id !== id),
                groups: updateGroupsAfterDelete(state.template.pageSettings.footer.groups),
              },
            },
          },
          selectedElementIds: state.selectedElementIds.filter(selectedId => selectedId !== id),
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
                elements: state.template.pageSettings.bodyBackground.elements.filter((el) => el.id !== id),
                groups: updateGroupsAfterDelete(state.template.pageSettings.bodyBackground.groups),
              },
            },
          },
          selectedElementIds: state.selectedElementIds.filter(selectedId => selectedId !== id),
          isDirty: true,
        }
      } else if (loc === 'summary' && state.template.summaryPage) {
        return {
          template: {
            ...state.template,
            summaryPage: {
              ...state.template.summaryPage,
              elements: state.template.summaryPage.elements.filter((el) => el.id !== id),
              groups: updateGroupsAfterDelete(state.template.summaryPage.groups),
            },
          },
          selectedElementIds: state.selectedElementIds.filter(selectedId => selectedId !== id),
          isDirty: true,
        }
      } else {
        return {
          template: {
            ...state.template,
            page: state.template.page.filter((el) => el.id !== id),
            groups: updateGroupsAfterDelete(state.template.groups),
          },
          selectedElementIds: state.selectedElementIds.filter(selectedId => selectedId !== id),
          isDirty: true,
        }
      }
    }),

  selectElement: (id, location = 'body') =>
    set({
      selectedElementIds: id ? [id] : [],
      selectedElementLocation: location,
      selectedGroupId: null, 
      selectedLoopChildId: null, 
      selectedLoopParentId: null,
      selectedContainerChildId: null,
      selectedContainerParentId: null,
    }),

  toggleElementSelection: (id, location) =>
    set((state) => {
      const loc = location || state.selectedElementLocation
      const isSelected = state.selectedElementIds.includes(id)
      
      return {
        selectedElementIds: isSelected
          ? state.selectedElementIds.filter(selectedId => selectedId !== id)
          : [...state.selectedElementIds, id],
        selectedElementLocation: loc,
        selectedGroupId: null, 
      }
    }),

  selectMultipleElements: (ids, location = 'body') =>
    set({
      selectedElementIds: ids,
      selectedElementLocation: location,
    }),

  clearSelection: () =>
    set({
      selectedElementIds: [],
      selectedGroupId: null,
    }),

  selectAllElements: () =>
    set((state) => {
      const { currentSection, template } = state
      let elements: Element[] = []
      
      if (currentSection === 'header' && template.pageSettings.header) {
        elements = template.pageSettings.header.elements
      } else if (currentSection === 'footer' && template.pageSettings.footer) {
        elements = template.pageSettings.footer.elements
      } else if (currentSection === 'bodyBackground' && template.pageSettings.bodyBackground) {
        elements = template.pageSettings.bodyBackground.elements
      } else {
        elements = template.page
      }
      
      return {
        selectedElementIds: elements.map(el => el.id),
        selectedElementLocation: currentSection,
        selectedGroupId: null,
      }
    }),

  deleteSelectedElements: () =>
    set((state) => {
      const { selectedElementIds, selectedElementLocation, template } = state
      
      if (selectedElementIds.length === 0) return state
      
      const historyState = saveToHistory(state, template)
      
      const filterElements = (elements: Element[]) =>
        elements.filter(el => !selectedElementIds.includes(el.id))
      
      
      const updateGroupsAfterDelete = (groups: ElementGroup[] | undefined) => {
        if (!groups) return undefined
        
        // Remover elementIds dos grupos e filtrar grupos vazios
        return groups
          .map(group => ({
            ...group,
            elementIds: group.elementIds.filter(elementId => !selectedElementIds.includes(elementId))
          }))
          .filter(group => group.elementIds.length > 0) // Remover grupos vazios
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
          page: filterElements(template.page),
          groups: updateGroupsAfterDelete(template.groups),
        }
      }
      
      return {
        ...historyState,
        template: newTemplate,
        selectedElementIds: [],
        isDirty: true,
      }
    }),

  updateSelectedElements: (updates) =>
    set((state) => {
      const { selectedElementIds, selectedElementLocation, template } = state
      
      if (selectedElementIds.length === 0) return state
      
      const updateElements = (elements: Element[]) =>
        elements.map(el =>
          selectedElementIds.includes(el.id) ? { ...el, ...updates } : el
        )
      
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

  setCurrentFilePath: (path) =>
    set({
      currentFilePath: path,
    }),

  setTestData: (data) =>
    set({
      testData: data,
    }),

  markClean: () =>
    set({
      isDirty: false,
    }),

  setCurrentSection: (section) =>
    set({
      currentSection: section,
      selectedElementIds: [],
      selectedGroupId: null,
    }),

  addHeader: () =>
    set((state) => ({
      template: {
        ...state.template,
        pageSettings: {
          ...state.template.pageSettings,
          header: {
            height: 100,
            elements: [],
          },
          },
        },
      currentSection: 'header',
      isDirty: true,
    })),

  addFooter: () =>
    set((state) => ({
      template: {
        ...state.template,
        pageSettings: {
          ...state.template.pageSettings,
          footer: {
            height: 80,
            elements: [],
          },
          },
        },
      currentSection: 'footer',
      isDirty: true,
    })),

  removeHeader: () =>
    set((state) => ({
      template: {
        ...state.template,
        pageSettings: {
          ...state.template.pageSettings,
          header: undefined,
        },
      },
      selectedElementIds: state.selectedElementLocation === 'header' ? [] : state.selectedElementIds,
      isDirty: true,
    })),

  removeFooter: () =>
    set((state) => ({
      template: {
        ...state.template,
        pageSettings: {
          ...state.template.pageSettings,
          footer: undefined,
        },
      },
      selectedElementIds: state.selectedElementLocation === 'footer' ? [] : state.selectedElementIds,
      isDirty: true,
    })),

  addBodyBackground: () =>
    set((state) => ({
      template: {
        ...state.template,
        pageSettings: {
          ...state.template.pageSettings,
          bodyBackground: {
            elements: [],
          },
        },
      },
      currentSection: 'bodyBackground',
      isDirty: true,
    })),

  removeBodyBackground: () =>
    set((state) => ({
      template: {
        ...state.template,
        pageSettings: {
          ...state.template.pageSettings,
          bodyBackground: undefined,
        },
      },
      selectedElementIds: state.selectedElementLocation === 'bodyBackground' ? [] : state.selectedElementIds,
      isDirty: true,
    })),

  addSummaryPage: () =>
    set((state) => ({
      template: {
        ...state.template,
        summaryPage: {
          elements: [],
        },
      },
      currentSection: 'summary',
      isDirty: true,
    })),

  removeSummaryPage: () =>
    set((state) => ({
      template: {
        ...state.template,
        summaryPage: undefined,
      },
      selectedElementIds: state.selectedElementLocation === 'summary' ? [] : state.selectedElementIds,
      isDirty: true,
    })),

  updateSummaryPage: (updates) =>
    set((state) => {
      if (!state.template.summaryPage) return state
      return {
        template: {
          ...state.template,
          summaryPage: {
            ...state.template.summaryPage,
            ...updates,
          },
        },
        isDirty: true,
      }
    }),

  updateHeader: (updates) =>
    set((state) => {
      if (!state.template.pageSettings.header) return state
      return {
        template: {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            header: {
              ...state.template.pageSettings.header,
              ...updates,
            },
          },
        },
        isDirty: true,
      }
    }),

  updateFooter: (updates) =>
    set((state) => {
      if (!state.template.pageSettings.footer) return state
      return {
        template: {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            footer: {
              ...state.template.pageSettings.footer,
              ...updates,
            },
          },
        },
        isDirty: true,
      }
    }),

  updateBodyBackground: (updates) =>
    set((state) => {
      if (!state.template.pageSettings.bodyBackground) return state
      return {
        template: {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            bodyBackground: {
              ...state.template.pageSettings.bodyBackground,
              ...updates,
            },
          },
        },
        isDirty: true,
      }
    }),

  moveElementUp: (id, location = 'body') =>
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

  moveElementDown: (id, location = 'body') =>
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

  moveElementToTop: (id, location = 'body') =>
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
            page: moveToTop(state.template.page),
          },
          isDirty: true,
        }
      }
    }),

  moveElementToBottom: (id, location = 'body') =>
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
            page: moveToBottom(state.template.page),
          },
          isDirty: true,
        }
      }
    }),

  reorderElement: (id, newIndex, location = 'body') =>
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
          if (el.type === 'container' && el.elements) {
            const childIdx = el.elements.findIndex(c => c.id === id)
            if (childIdx >= 0) {
              if (childIdx === newIndex) return el
              const newChildren = [...el.elements]
              const [movedChild] = newChildren.splice(childIdx, 1)
              newChildren.splice(newIndex, 0, movedChild)
              return { ...el, elements: newChildren }
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
            page: reorder(state.template.page),
          },
          isDirty: true,
        }
      }
    }),

  toggleElementVisibility: (id, location) =>
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
            page: toggleInElements(state.template.page),
          },
          isDirty: true,
        }
      }
    }),

  copyElement: () =>
    set((state) => {
      const { selectedElementIds, selectedElementLocation, selectedContainerChildId, template } = state
      
      if (selectedElementIds.length === 0) return state
      
      // Encontrar todos os elementos selecionados na location correta
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
        const container = allElements.find(el => el.id === selectedElementIds[0]) as any
        if (container && container.elements) {
          const child = container.elements.find((el: any) => el.id === selectedContainerChildId)
          if (child) {
            elementsToCopy = [child]
            isChild = true
            parentId = container.id
          }
        }
      } else {
        // Filtrar apenas os elementos selecionados
        elementsToCopy = allElements.filter(el => selectedElementIds.includes(el.id))
      }
      
      if (elementsToCopy.length === 0) return state
      
      // Copiar os elementos (deep clone)
      const copiedElements = JSON.parse(JSON.stringify(elementsToCopy))
      
      console.log(`✂️ ${copiedElements.length} elemento(s) copiado(s)`)
      
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
      const { copiedElements, currentSection, template, selectedElementIds, selectedContainerChildId } = state
      
      if (!copiedElements || copiedElements.elements.length === 0) {
        console.log('⚠️ Nenhum elemento copiado')
        return state
      }
      
      const timestamp = Date.now()
      const newElements = copiedElements.elements.map((element, index) => ({
        ...element,
        id: `${element.type}-${timestamp + index}`,
        x: element.x + 20,
        y: element.y + 20,
      }))
      
      console.log(`📋 Pasting ${newElements.length} element(s) to section:`, currentSection)
      
      let newTemplate: Template
      
      let targetContainerId: string | null = null
      
      if (selectedContainerChildId) {
        targetContainerId = selectedElementIds[0]
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
            page: insertIntoContainer(template.page),
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
          page: [...template.page, ...newElements],
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

  undo: () =>
    set((state) => {
      if (state.historyIndex <= 0) return state
      
      const newIndex = state.historyIndex - 1
      const previousTemplate = state.history[newIndex]
      
      return {
        template: previousTemplate,
        historyIndex: newIndex,
        isDirty: true,
      }
    }),

  redo: () =>
    set((state) => {
      if (state.historyIndex >= state.history.length - 1) return state
      
      const newIndex = state.historyIndex + 1
      const nextTemplate = state.history[newIndex]
      
      return {
        template: nextTemplate,
        historyIndex: newIndex,
        isDirty: true,
      }
    }),

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  jumpToHistoryIndex: (index: number) =>
    set((state) => {
      if (index < 0 || index >= state.history.length) return state
      const targetTemplate = state.history[index]
      return {
        template: JSON.parse(JSON.stringify(targetTemplate)),
        historyIndex: index,
        selectedElementIds: [],
        selectedContainerChildId: null,
        selectedLoopChildId: null,
        isDirty: true,
      }
    }),
  
  saveSnapshot: () =>
    set((state) => {
      
      const lastTemplate = state.history[state.historyIndex]
      const currentTemplateJson = JSON.stringify(state.template)
      const lastTemplateJson = JSON.stringify(lastTemplate)
      
      if (currentTemplateJson === lastTemplateJson) {
        return state 
      }
      
      return saveToHistory(state, state.template)
    }),

  // Group Actions
  createGroup: (name, elementIds, location = 'body') =>
    set((state) => {
      const groupId = `group-${Date.now()}`
      const newGroup: ElementGroup = {
        id: groupId,
        name,
        elementIds,
        location,
        collapsed: false,
        printCondition: null, // Valor default
      }
      
      const historyState = saveToHistory(state, state.template)
      
      // Atualizar elementos para incluir groupId
      const updateElementsWithGroup = (elements: Element[]) =>
        elements.map(el =>
          elementIds.includes(el.id) ? { ...el, groupId } : el
        )
      
      let newTemplate: Template
      
      if (location === 'header' && state.template.pageSettings.header) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            header: {
              ...state.template.pageSettings.header,
              elements: updateElementsWithGroup(state.template.pageSettings.header.elements),
              groups: [...(state.template.pageSettings.header.groups || []), newGroup],
            },
          },
        }
      } else if (location === 'footer' && state.template.pageSettings.footer) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            footer: {
              ...state.template.pageSettings.footer,
              elements: updateElementsWithGroup(state.template.pageSettings.footer.elements),
              groups: [...(state.template.pageSettings.footer.groups || []), newGroup],
            },
          },
        }
      } else if (location === 'bodyBackground' && state.template.pageSettings.bodyBackground) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            bodyBackground: {
              ...state.template.pageSettings.bodyBackground,
              elements: updateElementsWithGroup(state.template.pageSettings.bodyBackground.elements),
              groups: [...(state.template.pageSettings.bodyBackground.groups || []), newGroup],
            },
          },
        }
      } else {
        newTemplate = {
          ...state.template,
          page: updateElementsWithGroup(state.template.page),
          groups: [...(state.template.groups || []), newGroup],
        }
      }
      
      console.log(`📦 Grupo criado: ${name} com ${elementIds.length} elementos`)
      
      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),

  updateGroup: (groupId, updates, location) =>
    set((state) => {
      const loc = location || state.selectedElementLocation
      
      const updateGroups = (groups: ElementGroup[]) =>
        groups.map(g => g.id === groupId ? { ...g, ...updates } : g)
      
      const historyState = saveToHistory(state, state.template)
      
      let newTemplate: Template
      
      if (loc === 'header' && state.template.pageSettings.header) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            header: {
              ...state.template.pageSettings.header,
              groups: updateGroups(state.template.pageSettings.header.groups || []),
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
              groups: updateGroups(state.template.pageSettings.footer.groups || []),
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
              groups: updateGroups(state.template.pageSettings.bodyBackground.groups || []),
            },
          },
        }
      } else {
        newTemplate = {
          ...state.template,
          groups: updateGroups(state.template.groups || []),
        }
      }
      
      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),

  deleteGroup: (groupId, location) =>
    set((state) => {
      const loc = location || state.selectedElementLocation
      
      const historyState = saveToHistory(state, state.template)
      
      // Remover groupId dos elementos
      const removeGroupFromElements = (elements: Element[]) =>
        elements.map(el => {
          if (el.groupId === groupId) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { groupId: _removed, ...rest } = el
            return rest as Element
          }
          return el
        })
      
      const filterGroups = (groups: ElementGroup[]) =>
        groups.filter(g => g.id !== groupId)
      
      let newTemplate: Template
      
      if (loc === 'header' && state.template.pageSettings.header) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            header: {
              ...state.template.pageSettings.header,
              elements: removeGroupFromElements(state.template.pageSettings.header.elements),
              groups: filterGroups(state.template.pageSettings.header.groups || []),
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
              elements: removeGroupFromElements(state.template.pageSettings.footer.elements),
              groups: filterGroups(state.template.pageSettings.footer.groups || []),
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
              elements: removeGroupFromElements(state.template.pageSettings.bodyBackground.elements),
              groups: filterGroups(state.template.pageSettings.bodyBackground.groups || []),
            },
          },
        }
      } else {
        newTemplate = {
          ...state.template,
          page: removeGroupFromElements(state.template.page),
          groups: filterGroups(state.template.groups || []),
        }
      }
      
      console.log(`🗑️ Grupo deletado: ${groupId}`)
      
      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),

  ungroupElements: (groupId, location) =>
    set(() => {
      // Alias para deleteGroup - apenas desagrupa sem deletar elementos
      return get().deleteGroup(groupId, location)
    }),

  toggleGroupCollapse: (groupId, location) =>
    set((state) => {
      const loc = location || state.selectedElementLocation
      
      const toggleCollapse = (groups: ElementGroup[]) =>
        groups.map(g =>
          g.id === groupId ? { ...g, collapsed: !g.collapsed } : g
        )
      
      let newTemplate: Template
      
      if (loc === 'header' && state.template.pageSettings.header) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            header: {
              ...state.template.pageSettings.header,
              groups: toggleCollapse(state.template.pageSettings.header.groups || []),
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
              groups: toggleCollapse(state.template.pageSettings.footer.groups || []),
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
              groups: toggleCollapse(state.template.pageSettings.bodyBackground.groups || []),
            },
          },
        }
      } else {
        newTemplate = {
          ...state.template,
          groups: toggleCollapse(state.template.groups || []),
        }
      }
      
      return {
        template: newTemplate,
        isDirty: true,
      }
    }),

  toggleGroupVisibility: (groupId, location) =>
    set((state) => {
      const loc = location || state.selectedElementLocation
      
      // Encontrar o grupo e seus elementos
      const getGroupAndElements = () => {
        if (loc === 'header' && state.template.pageSettings.header) {
          const group = state.template.pageSettings.header.groups?.find(g => g.id === groupId)
          return { group, elements: state.template.pageSettings.header.elements }
        } else if (loc === 'footer' && state.template.pageSettings.footer) {
          const group = state.template.pageSettings.footer.groups?.find(g => g.id === groupId)
          return { group, elements: state.template.pageSettings.footer.elements }
        } else if (loc === 'bodyBackground' && state.template.pageSettings.bodyBackground) {
          const group = state.template.pageSettings.bodyBackground.groups?.find(g => g.id === groupId)
          return { group, elements: state.template.pageSettings.bodyBackground.elements }
        } else if (loc === 'summary' && state.template.summaryPage) {
          const group = state.template.summaryPage.groups?.find(g => g.id === groupId)
          return { group, elements: state.template.summaryPage.elements }
        } else {
          const group = state.template.groups?.find(g => g.id === groupId)
          return { group, elements: state.template.page }
        }
      }
      
      const { group, elements } = getGroupAndElements()
      if (!group || !elements) return state
      
      
      const groupElements = elements.filter(el => group.elementIds.includes(el.id))
      const hasVisibleElement = groupElements.some(el => !el.hidden)
      
      
      const newHiddenState = hasVisibleElement
      
      const toggleVisibility = (els: Element[]) =>
        els.map(el =>
          group.elementIds.includes(el.id) ? { ...el, hidden: newHiddenState } : el
        )
      
      const historyState = saveToHistory(state, state.template)
      
      let newTemplate: Template
      
      if (loc === 'header' && state.template.pageSettings.header) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            header: {
              ...state.template.pageSettings.header,
              elements: toggleVisibility(state.template.pageSettings.header.elements),
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
              elements: toggleVisibility(state.template.pageSettings.footer.elements),
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
              elements: toggleVisibility(state.template.pageSettings.bodyBackground.elements),
            },
          },
        }
      } else if (loc === 'summary' && state.template.summaryPage) {
        newTemplate = {
          ...state.template,
          summaryPage: {
            ...state.template.summaryPage,
            elements: toggleVisibility(state.template.summaryPage.elements),
          },
        }
      } else {
        newTemplate = {
          ...state.template,
          page: toggleVisibility(state.template.page),
        }
      }
      
      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),

  selectGroup: (groupId, location = 'body') =>
    set({
      selectedGroupId: groupId,
      selectedElementIds: [],
      selectedElementLocation: location,
    }),

  reorderGroup: (groupId, newIndex, location) =>
    set((state) => {
      const loc = location || state.currentSection
      const historyState = saveToHistory(state, state.template)
      
      const reorder = (groups: ElementGroup[]) => {
        const currentIndex = groups.findIndex(g => g.id === groupId)
        if (currentIndex === -1 || currentIndex === newIndex) return groups
        
        const newGroups = [...groups]
        const [removed] = newGroups.splice(currentIndex, 1)
        newGroups.splice(newIndex, 0, removed)
        return newGroups
      }
      
      let newTemplate: Template
      
      if (loc === 'header' && state.template.pageSettings.header) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            header: {
              ...state.template.pageSettings.header,
              groups: reorder(state.template.pageSettings.header.groups || []),
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
              groups: reorder(state.template.pageSettings.footer.groups || []),
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
              groups: reorder(state.template.pageSettings.bodyBackground.groups || []),
            },
          },
        }
      } else {
        newTemplate = {
          ...state.template,
          groups: reorder(state.template.groups || []),
        }
      }
      
      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),

  // Loop Element Actions
  addElementToLoop: (loopId, element, location) =>
    set((state) => {
      const loc = location || state.currentSection
      const historyState = saveToHistory(state, state.template)
      
      const addToLoop = (elements: Element[]): Element[] => {
        return elements.map(el => {
          if (el.id === loopId && (el.type === 'loop' || el.type === 'container')) {
            return {
              ...el,
              elements: [...(el.elements || []), element],
            }
          }
          return el
        })
      }
      
      let newTemplate: Template
      
      if (loc === 'header' && state.template.pageSettings.header) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            header: {
              ...state.template.pageSettings.header,
              elements: addToLoop(state.template.pageSettings.header.elements),
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
              elements: addToLoop(state.template.pageSettings.footer.elements),
            },
          },
        }
      } else if (loc === 'summary' && state.template.summaryPage) {
        newTemplate = {
          ...state.template,
          summaryPage: {
            ...state.template.summaryPage,
            elements: addToLoop(state.template.summaryPage.elements),
          },
        }
      } else {
        newTemplate = {
          ...state.template,
          page: addToLoop(state.template.page),
        }
      }
      
      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),

  updateLoopChildElement: (loopId, childId, updates, location) =>
    set((state) => {
      const loc = location || state.currentSection
      const historyState = saveToHistory(state, state.template)
      const newChildId = updates.id !== undefined ? updates.id : childId
      
      const updateInLoop = (elements: Element[]): Element[] => {
        return elements.map(el => {
          if (el.id === loopId) {
            return {
              ...el,
              elements: (el.elements || []).map(child =>
                child.id === childId ? { ...child, ...updates } : child
              ),
            }
          }
          return el
        })
      }
      
      let newTemplate: Template
      
      if (loc === 'header' && state.template.pageSettings.header) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            header: {
              ...state.template.pageSettings.header,
              elements: updateInLoop(state.template.pageSettings.header.elements),
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
              elements: updateInLoop(state.template.pageSettings.footer.elements),
            },
          },
        }
      } else if (loc === 'summary' && state.template.summaryPage) {
        newTemplate = {
          ...state.template,
          summaryPage: {
            ...state.template.summaryPage,
            elements: updateInLoop(state.template.summaryPage.elements),
          },
        }
      } else {
        newTemplate = {
          ...state.template,
          page: updateInLoop(state.template.page),
        }
      }
      
      return {
        ...historyState,
        template: newTemplate,
        selectedLoopChildId: state.selectedLoopChildId === childId ? newChildId : state.selectedLoopChildId,
        isDirty: true,
      }
    }),

  deleteLoopChildElement: (loopId, childId, location) =>
    set((state) => {
      const loc = location || state.currentSection
      const historyState = saveToHistory(state, state.template)
      
      const deleteFromLoop = (elements: Element[]): Element[] => {
        return elements.map(el => {
          if (el.id === loopId && (el.type === 'loop' || el.type === 'container')) {
            return {
              ...el,
              elements: (el.elements || []).filter(child => child.id !== childId),
            }
          }
          return el
        })
      }
      
      let newTemplate: Template
      
      if (loc === 'header' && state.template.pageSettings.header) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            header: {
              ...state.template.pageSettings.header,
              elements: deleteFromLoop(state.template.pageSettings.header.elements),
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
              elements: deleteFromLoop(state.template.pageSettings.footer.elements),
            },
          },
        }
      } else if (loc === 'summary' && state.template.summaryPage) {
        newTemplate = {
          ...state.template,
          summaryPage: {
            ...state.template.summaryPage,
            elements: deleteFromLoop(state.template.summaryPage.elements),
          },
        }
      } else {
        newTemplate = {
          ...state.template,
          page: deleteFromLoop(state.template.page),
        }
      }
      
      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
        selectedLoopChildId: null,
        selectedLoopParentId: null,
        selectedContainerChildId: null,
        selectedContainerParentId: null,
      }
    }),

  selectLoopChild: (loopId, childId, location) =>
    set((state) => ({
      selectedLoopParentId: loopId,
      selectedLoopChildId: childId,
      selectedElementIds: [loopId], 
      selectedElementLocation: location || state.currentSection,
      selectedGroupId: null,
    })),
  selectContainerChild: (containerId, childId, location) => {
      console.log(containerId, childId)
      set((state) => ({
        selectedContainerParentId: containerId,
        selectedContainerChildId: childId,
        selectedElementIds: [containerId],
        selectedElementLocation: location || state.currentSection,
        selectedGroupId: null,
      }))
  },
  clearLoopChildSelection: () =>
    set({
      selectedLoopChildId: null,
      selectedLoopParentId: null,
      selectedContainerChildId: null,
      selectedContainerParentId: null,
    }),
  clearContainerChildSelection: () =>
      set({
        selectedContainerChildId: null,
        selectedContainerParentId: null,
        selectedLoopChildId: null,
        selectedLoopParentId: null,
    }),

  toggleLoopExpanded: (loopId) =>
    set((state) => ({
      expandedLoopIds: state.expandedLoopIds.includes(loopId)
        ? state.expandedLoopIds.filter(id => id !== loopId)
        : [...state.expandedLoopIds, loopId],
    })),
  toggleContainerExpanded: (containerId) =>
    set((state) => ({
      expandedContainerIds: state.expandedContainerIds.includes(containerId)
        ? state.expandedContainerIds.filter(id => id !== containerId)
        : [...state.expandedContainerIds, containerId],
    })),

  reorderLoopChildren: (loopId, fromIndex, toIndex, location) =>
    set((state) => {
      const loc = location || state.currentSection
      const historyState = saveToHistory(state, state.template)
      
      const reorderInLoop = (elements: Element[]): Element[] => {
        return elements.map(el => {
          if (el.id === loopId && (el.type === 'loop' || el.type === 'container') && el.elements) {
            const children = [...el.elements]
            const [removed] = children.splice(fromIndex, 1)
            children.splice(toIndex, 0, removed)
            return { ...el, elements: children }
          }
          return el
        })
      }
      
      let newTemplate: Template
      
      if (loc === 'header' && state.template.pageSettings.header) {
        newTemplate = {
          ...state.template,
          pageSettings: {
            ...state.template.pageSettings,
            header: {
              ...state.template.pageSettings.header,
              elements: reorderInLoop(state.template.pageSettings.header.elements),
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
              elements: reorderInLoop(state.template.pageSettings.footer.elements),
            },
          },
        }
      } else if (loc === 'summary' && state.template.summaryPage) {
        newTemplate = {
          ...state.template,
          summaryPage: {
            ...state.template.summaryPage,
            elements: reorderInLoop(state.template.summaryPage.elements),
          },
        }
      } else {
        newTemplate = {
          ...state.template,
          page: reorderInLoop(state.template.page),
        }
      }
      
      return {
        ...historyState,
        template: newTemplate,
        isDirty: true,
      }
    }),

  // UI State Actions
  togglePropertiesPanelPinned: () =>
    set((state) => ({
      isPropertiesPanelPinned: !state.isPropertiesPanelPinned,
    })),

  toggleSidebarPinned: () =>
    set((state) => ({
      isSidebarPinned: !state.isSidebarPinned,
    })),

  toggleSidebarMinimized: () =>
    set((state) => ({
      isSidebarMinimized: !state.isSidebarMinimized,
    })),

  updateContainerChildElement: (containerId, childId, updates, location) =>
      set((state) => {
        const loc = location || state.currentSection
        const historyState = saveToHistory(state, state.template)
        const newChildId = updates.id !== undefined ? updates.id : childId

        const updateInContainer = (elements: Element[]): Element[] => {
          return elements.map(el => {
            if (el.id === containerId) {
              return {
                ...el,
                elements: (el.elements || []).map(child =>
                  child.id === childId ? { ...child, ...updates } : child
                ),
              }
            }
            return el
          })
        }

        let newTemplate: Template

        if (loc === 'header' && state.template.pageSettings.header) {
          newTemplate = {
            ...state.template,
            pageSettings: {
              ...state.template.pageSettings,
              header: {
                ...state.template.pageSettings.header,
                elements: updateInContainer(state.template.pageSettings.header.elements),
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
                elements: updateInContainer(state.template.pageSettings.footer.elements),
              },
            },
          }
        } else if (loc === 'summary' && state.template.summaryPage) {
          newTemplate = {
            ...state.template,
            summaryPage: {
              ...state.template.summaryPage,
              elements: updateInContainer(state.template.summaryPage.elements),
            },
          }
        } else {
          newTemplate = {
            ...state.template,
            page: updateInContainer(state.template.page),
          }
        }

        return {
          ...historyState,
          template: newTemplate,
          selectedContainerChildId: state.selectedContainerChildId === childId ? newChildId : state.selectedContainerChildId,
          isDirty: true,
        }
      }),
}))
