import { useState } from 'react'
import {
  useTemplateStore,
  type ElementLocation,
  type ElementGroup,
} from '../../../store/templateStore'

export function useLayersPanel() {
  const { template, reorderElement } = useTemplateStore()

  const [expandedContainers, setExpandedContainers] = useState<Record<string, boolean>>({})
  const [expandedLoops, setExpandedLoops] = useState<Record<string, boolean>>({})
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null)
  const [dragOverElementId, setDragOverElementId] = useState<string | null>(null)
  const [showAddBandDropdown, setShowAddBandDropdown] = useState(false)

  const getSectionGroups = (sectionKey: ElementLocation): ElementGroup[] => {
    if (sectionKey === 'header') return template.pageSettings.header?.groups || []
    if (sectionKey === 'footer') return template.pageSettings.footer?.groups || []
    if (sectionKey === 'bodyBackground') return template.pageSettings.bodyBackground?.groups || []
    if (sectionKey === 'summary') return template.summaryPage?.groups || []
    return template.groups || []
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.stopPropagation()
    setDraggedElementId(id)
    e.dataTransfer.setData('text/plain', id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverElementId !== id) setDragOverElementId(id)
  }

  const handleDragLeave = (e: React.DragEvent, id: string) => {
    e.stopPropagation()
    if (dragOverElementId === id) setDragOverElementId(null)
  }

  const handleDrop = (e: React.DragEvent, index: number, sectionKey: ElementLocation) => {
    e.preventDefault()
    e.stopPropagation()
    if (draggedElementId) {
      reorderElement(draggedElementId, index, sectionKey)
    }
    setDraggedElementId(null)
    setDragOverElementId(null)
  }

  const handleDragEnd = () => {
    setDraggedElementId(null)
    setDragOverElementId(null)
  }

  const isContainerExpanded = (id: string) => expandedContainers[id] !== false
  const toggleContainerExpanded = (id: string) => {
    setExpandedContainers((prev) => ({
      ...prev,
      [id]: !isContainerExpanded(id),
    }))
  }

  const isLoopExpanded = (id: string) => expandedLoops[id] !== false
  const toggleLoopExpanded = (id: string) => {
    setExpandedLoops((prev) => ({
      ...prev,
      [id]: !isLoopExpanded(id),
    }))
  }

  return {
    template,
    expandedContainers,
    expandedLoops,
    draggedElementId,
    dragOverElementId,
    showAddBandDropdown,
    setShowAddBandDropdown,
    getSectionGroups,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    isContainerExpanded,
    toggleContainerExpanded,
    isLoopExpanded,
    toggleLoopExpanded,
  }
}
