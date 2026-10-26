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
  heightMode?: 'auto' | 'fixed'
  autoHeight?: boolean
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

export interface WatermarkConfig {
  type?: 'text' | 'image'
  text?: string
  dataBinding?: string
  imageSource?: string
  fontName?: string
  fontSize?: number
  fontStyle?: string
  color?: string
  opacity?: number
  rotation?: number
  width?: number
  height?: number
  onTop?: boolean
  repeat?: boolean
  spacingX?: number
  spacingY?: number
  printCondition?: string
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
    watermark?: WatermarkConfig
  }
  page: Element[]
  groups?: ElementGroup[] // Grupos do body
  summaryPage?: {
    elements: Element[]
    groups?: ElementGroup[]
    printCondition?: string  
    background?: {
      elements: Element[]
      groups?: ElementGroup[]
    }
  }
  schema?: Record<string, any>
}

export interface TemplateStore {
  template: Template
  selectedElementIds: string[]
  selectedElementLocation: ElementLocation
  selectedGroupId: string | null // ID do grupo selecionado
  selectedLoopChildId: string | null // ID do elemento filho do loop selecionado
  selectedLoopParentId: string | null
  expandedLoopIds: string[] // IDs dos loops expandidos na sidebar
  selectedContainerChildId: string | null
  selectedContainerParentId: string | null
  expandedContainerIds: string[]
  currentFilePath: string | null
  isDirty: boolean
  testData: Record<string, unknown>
  currentSection: ElementLocation
  history: Template[]
  historyIndex: number
  copiedElements: { elements: Element[]; location: ElementLocation; isChild?: boolean; parentId?: string | null } | null
  isSidebarPinned: boolean
  isSidebarMinimized: boolean

  // Actions
  setTemplate: (template: Template) => void
  updateTemplate: (updates: Partial<Template>) => void
  updatePageSettings: (updates: Partial<Template['pageSettings']>) => void
  updateWatermark: (updates: Partial<WatermarkConfig>) => void
  removeWatermark: () => void
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
  setSchema: (schema: Record<string, any> | null) => void
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
  addElementToContainer: (containerId: string, element: Element, location?: ElementLocation) => void
  updateContainerChildElement: (containerId: string, childId: string, updates: Partial<Element>, location?: ElementLocation) => void
  deleteContainerChildElement: (containerId: string, childId: string, location?: ElementLocation) => void
  selectContainerChild: (containerId: string, childId: string, location?: ElementLocation) => void
  clearContainerChildSelection: () => void
  toggleContainerExpanded: (containerId: string) => void
  reorderContainerChildren: (containerId: string, fromIndex: number, toIndex: number, location?: ElementLocation) => void
  
  // UI State Actions
  toggleSidebarPinned: () => void
  toggleSidebarMinimized: () => void
  setSidebarMinimized: (minimized: boolean) => void
}
