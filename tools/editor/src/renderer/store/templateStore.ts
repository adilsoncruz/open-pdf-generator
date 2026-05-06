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
  pageElements: Element[]
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
  selectedLoopParentId: string | null  // ID do loop pai do elemento selecionado
  expandedLoopIds: string[]  // IDs dos loops expandidos na sidebar
  currentFilePath: string | null
  isDirty: boolean
  testData: Record<string, unknown>
  currentSection: ElementLocation
  history: Template[]
  historyIndex: number
  copiedElements: { elements: Element[]; location: ElementLocation } | null
  isPropertiesPanelPinned: boolean
  isSidebarPinned: boolean
  isSidebarMinimized: boolean

  // Actions
  setTemplate: (template: Template) => void
  updateTemplate: (updates: Partial<Template>) => void
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
  pageElements: [],
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
      template,
      isDirty: false,
      selectedElementIds: [],
      selectedElementLocation: 'body',
      
      history: [JSON.parse(JSON.stringify(template))],
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

  addElement: (element, location = 'body') =>
    set((state) => {
      let newTemplate
      if (location === 'header' && state.template.pageSettings.header) {
        newTemplate = {
            ...state.template,
            pageSettings: {
              ...state.template.pageSettings,
              header: {
                ...state.template.pageSettings.header,
                elements: [...state.template.pageSettings.header.elements, element],
              },
            },
        }
        return {
          template: newTemplate,
          selectedElementIds: [element.id],
          selectedElementLocation: 'header',
          isDirty: true,
          ...saveToHistory(state, newTemplate),
        }
      } else if (location === 'footer' && state.template.pageSettings.footer) {
        newTemplate = {
            ...state.template,
            pageSettings: {
              ...state.template.pageSettings,
              footer: {
                ...state.template.pageSettings.footer,
                elements: [...state.template.pageSettings.footer.elements, element],
              },
            },
        }
        return {
          template: newTemplate,
          selectedElementIds: [element.id],
          selectedElementLocation: 'footer',
          isDirty: true,
          ...saveToHistory(state, newTemplate),
        }
      } else if (location === 'bodyBackground' && state.template.pageSettings.bodyBackground) {
        newTemplate = {
            ...state.template,
            pageSettings: {
              ...state.template.pageSettings,
              bodyBackground: {
                ...state.template.pageSettings.bodyBackground,
                elements: [...state.template.pageSettings.bodyBackground.elements, element],
              },
            },
        }
        return {
          template: newTemplate,
          selectedElementIds: [element.id],
          selectedElementLocation: 'bodyBackground',
          isDirty: true,
          ...saveToHistory(state, newTemplate),
        }
      } else if (location === 'summary' && state.template.summaryPage) {
        newTemplate = {
            ...state.template,
            summaryPage: {
              ...state.template.summaryPage,
              elements: [...state.template.summaryPage.elements, element],
            },
        }
        return {
          template: newTemplate,
          selectedElementIds: [element.id],
          selectedElementLocation: 'summary',
          isDirty: true,
          ...saveToHistory(state, newTemplate),
        }
      } else {
        newTemplate = {
          ...state.template,
          pageElements: [...state.template.pageElements, element],
        }
        return {
          template: newTemplate,
          selectedElementIds: [element.id],
          selectedElementLocation: 'body',
          isDirty: true,
          ...saveToHistory(state, newTemplate),
        }
      }
    }),

  updateElement: (id, updates, location) =>
    set((state) => {
      const loc = location || state.selectedElementLocation
      
      if (loc === 'header' && state.template.pageSettings.header) {
        return {
          template: {
            ...state.template,
            pageSettings: {
              ...state.template.pageSettings,
              header: {
                ...state.template.pageSettings.header,
                elements: state.template.pageSettings.header.elements.map((el) =>
                  el.id === id ? { ...el, ...updates } : el
                ),
              },
            },
          },
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
                elements: state.template.pageSettings.footer.elements.map((el) =>
                  el.id === id ? { ...el, ...updates } : el
                ),
              },
            },
          },
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
                elements: state.template.pageSettings.bodyBackground.elements.map((el) =>
                  el.id === id ? { ...el, ...updates } : el
                ),
              },
            },
          },
          isDirty: true,
        }
      } else if (loc === 'summary' && state.template.summaryPage) {
        return {
          template: {
            ...state.template,
            summaryPage: {
              ...state.template.summaryPage,
              elements: state.template.summaryPage.elements.map((el) =>
                el.id === id ? { ...el, ...updates } : el
              ),
            },
          },
          isDirty: true,
        }
      } else {
        return {
          template: {
            ...state.template,
            pageElements: state.template.pageElements.map((el) =>
              el.id === id ? { ...el, ...updates } : el
            ),
          },
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
            pageElements: state.template.pageElements.filter((el) => el.id !== id),
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
        elements = template.pageElements
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
          pageElements: filterElements(template.pageElements),
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
          pageElements: updateElements(template.pageElements),
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
        return {
          template: {
            ...state.template,
            pageElements: moveUp(state.template.pageElements),
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
        return {
          template: {
            ...state.template,
            pageElements: moveDown(state.template.pageElements),
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
            pageElements: moveToTop(state.template.pageElements),
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
            pageElements: moveToBottom(state.template.pageElements),
          },
          isDirty: true,
        }
      }
    }),

  reorderElement: (id, newIndex, location = 'body') =>
    set((state) => {
      const reorder = (elements: Element[]) => {
        const oldIndex = elements.findIndex((el) => el.id === id)
        if (oldIndex < 0 || oldIndex === newIndex) return elements
        
        const newElements = [...elements]
        const [element] = newElements.splice(oldIndex, 1)
        newElements.splice(newIndex, 0, element)
        
        return newElements
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
      } else {
        return {
          ...historyState,
          template: {
            ...state.template,
            pageElements: reorder(state.template.pageElements),
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
            pageElements: toggleInElements(state.template.pageElements),
          },
          isDirty: true,
        }
      }
    }),

  copyElement: () =>
    set((state) => {
      const { selectedElementIds, selectedElementLocation, template } = state
      
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
        allElements = template.pageElements
      }
      
      // Filtrar apenas os elementos selecionados
      const elementsToCopy = allElements.filter(el => selectedElementIds.includes(el.id))
      
      if (elementsToCopy.length === 0) return state
      
      // Copiar os elementos (deep clone)
      const copiedElements = JSON.parse(JSON.stringify(elementsToCopy))
      
      console.log(`✂️ ${copiedElements.length} elemento(s) copiado(s)`)
      
      return {
        copiedElements: {
          elements: copiedElements,
          location: selectedElementLocation,
        },
      }
    }),

  pasteElement: () =>
    set((state) => {
      const { copiedElements, currentSection, template } = state
      
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
          pageElements: [...template.pageElements, ...newElements],
        }
      }
      
      return {
        template: newTemplate,
        selectedElementIds: newElements.map(el => el.id),
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
          pageElements: updateElementsWithGroup(state.template.pageElements),
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
          pageElements: removeGroupFromElements(state.template.pageElements),
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
          return { group, elements: state.template.pageElements }
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
          pageElements: toggleVisibility(state.template.pageElements),
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
          pageElements: addToLoop(state.template.pageElements),
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
          pageElements: updateInLoop(state.template.pageElements),
        }
      }
      
      return {
        ...historyState,
        template: newTemplate,
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
          pageElements: deleteFromLoop(state.template.pageElements),
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
          pageElements: reorderInLoop(state.template.pageElements),
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
            pageElements: updateInContainer(state.template.pageElements),
          }
        }

        return {
          ...historyState,
          template: newTemplate,
          isDirty: true,
        }
      }),
}))

