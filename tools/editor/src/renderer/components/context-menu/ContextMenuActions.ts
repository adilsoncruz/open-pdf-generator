import { useUIStore } from '../../store/uiStore'
import { useTemplateStore, flattenElements } from '../../store/templateStore'
import type { ElementGroup, ElementLocation } from '../../store/templateStore/types'

export function useContextMenuActions() {
  const { contextMenu, closeContextMenu } = useUIStore()
  const {
    template,
    selectedElementIds,
    selectedElementLocation,
    selectedGroupId,
    currentSection,
    copiedElements,
    copyElement,
    pasteElement,
    deleteElement,
    deleteSelectedElements,
    deleteLoopChildElement,
    createGroup,
    ungroupElements,
    selectGroup,
    toggleElementVisibility,
    addElement,
    reorderElement,
  } = useTemplateStore()

  const elementId = contextMenu?.elementId
  const targetType = contextMenu?.targetType
  const targetLocation: ElementLocation =
    (contextMenu?.location || selectedElementLocation || currentSection || 'body') as ElementLocation

  // Find target element details
  const sectionElements = (() => {
    if (targetLocation === 'header') return template.pageSettings.header?.elements || []
    if (targetLocation === 'footer') return template.pageSettings.footer?.elements || []
    if (targetLocation === 'bodyBackground') return template.pageSettings.bodyBackground?.elements || []
    if (targetLocation === 'summary') return template.summaryPage?.elements || []
    return template.page || []
  })()

  const flatElements = flattenElements(sectionElements)
  const targetElement = elementId ? flatElements.find((el) => el.id === elementId) : null

  // Groups
  const allGroups: ElementGroup[] = [
    ...(template.groups || []),
    ...(template.pageSettings.header?.groups || []),
    ...(template.pageSettings.footer?.groups || []),
    ...(template.pageSettings.bodyBackground?.groups || []),
    ...(template.summaryPage?.groups || []),
  ]

  const activeGroup = allGroups.find(
    (g) =>
      g.elementIds.includes(elementId || '') ||
      selectedElementIds.some((id) => g.elementIds.includes(id)) ||
      (selectedGroupId && g.id === selectedGroupId)
  )

  const canGroup = selectedElementIds.length >= 2 && !activeGroup
  const canUngroup = !!activeGroup
  const hasCopiedElements = !!copiedElements && copiedElements.elements?.length > 0

  const handleCopy = () => {
    copyElement()
    closeContextMenu()
  }

  const handlePaste = () => {
    pasteElement()
    closeContextMenu()
  }

  const handleDuplicate = () => {
    copyElement()
    pasteElement()
    closeContextMenu()
  }

  const handleDelete = () => {
    if (selectedElementIds.length > 1) {
      deleteSelectedElements()
    } else if (contextMenu?.containerId && elementId) {
      deleteLoopChildElement(contextMenu.containerId, elementId, targetLocation)
    } else if (elementId) {
      deleteElement(elementId, targetLocation)
    }
    closeContextMenu()
  }

  const handleToggleVisibility = () => {
    if (elementId) {
      toggleElementVisibility(elementId, targetLocation)
    }
    closeContextMenu()
  }

  const handleGroup = () => {
    const defaultName = `Grupo ${allGroups.length + 1}`
    createGroup(defaultName, selectedElementIds, targetLocation)
    closeContextMenu()
  }

  const handleUngroup = () => {
    if (activeGroup) {
      ungroupElements(activeGroup.id, (activeGroup.location || targetLocation) as any)
    }
    closeContextMenu()
  }

  const handleEditGroup = () => {
    if (activeGroup) {
      selectGroup(activeGroup.id, (activeGroup.location || targetLocation) as any)
    }
    closeContextMenu()
  }

  const handleBringToFront = () => {
    if (elementId) {
      reorderElement(elementId, 9999, targetLocation)
    }
    closeContextMenu()
  }

  const handleSendToBack = () => {
    if (elementId) {
      reorderElement(elementId, 0, targetLocation)
    }
    closeContextMenu()
  }

  const handleAddQuickElement = (type: string) => {
    const newId = `${type}-${Date.now()}`
    const baseElement = {
      type,
      id: newId,
      x: 30,
      y: 30,
      width: type === 'line' ? 200 : type === 'container' ? '100%' : 150,
      height: type === 'line' ? 0 : 30,
      dataBinding: type === 'text' ? 'field' : undefined,
      value: type === 'static_text' ? 'Texto Fixo' : '',
    }
    addElement(baseElement as any, targetLocation)
    closeContextMenu()
  }

  return {
    targetType,
    targetLocation,
    targetElement,
    activeGroup,
    canGroup,
    canUngroup,
    hasCopiedElements,
    selectedCount: selectedElementIds.length,
    handleCopy,
    handlePaste,
    handleDuplicate,
    handleDelete,
    handleToggleVisibility,
    handleGroup,
    handleUngroup,
    handleEditGroup,
    handleBringToFront,
    handleSendToBack,
    handleAddQuickElement,
  }
}
