import { useEffect, type RefObject } from 'react'
import { useTemplateStore } from '../../../../store/templateStore'
import type { ToolbarRef } from '../../../organisms'

interface UseElectronMenuEventsProps {
  toolbarRef: RefObject<ToolbarRef | null>
}

export function useElectronMenuEvents({ toolbarRef }: UseElectronMenuEventsProps) {
  const {
    undo,
    redo,
    canUndo,
    canRedo,
    selectedElementIds,
    selectedElementLocation,
    deleteSelectedElements,
    copyElement,
    pasteElement,
    copiedElements,
    selectedContainerChildId,
    selectedContainerParentId,
    selectedLoopChildId,
    selectedLoopParentId,
    deleteLoopChildElement,
  } = useTemplateStore()

  useEffect(() => {
    if (!window.electronAPI) return

    window.electronAPI.onMenuUndo?.(() => {
      if (canUndo()) undo()
    })
    window.electronAPI.onMenuRedo?.(() => {
      if (canRedo()) redo()
    })
    window.electronAPI.onMenuCopy?.(() => {
      if (selectedElementIds.length > 0) {
        copyElement()
      }
    })
    window.electronAPI.onMenuPaste?.(() => {
      if (copiedElements) {
        pasteElement()
      }
    })
    window.electronAPI.onMenuDelete?.(() => {
      if (selectedContainerChildId && selectedContainerParentId) {
        deleteLoopChildElement(selectedContainerParentId, selectedContainerChildId, selectedElementLocation)
      } else if (selectedLoopChildId && selectedLoopParentId) {
        deleteLoopChildElement(selectedLoopParentId, selectedLoopChildId, selectedElementLocation)
      } else if (selectedElementIds.length > 0) {
        deleteSelectedElements()
      }
    })
    window.electronAPI.onMenuNew?.(() => {
      toolbarRef.current?.handleNew()
    })
    window.electronAPI.onMenuOpen?.(() => {
      toolbarRef.current?.handleOpen()
    })
    window.electronAPI.onMenuSave?.(() => {
      toolbarRef.current?.handleSave()
    })
    window.electronAPI.onMenuSaveAs?.(() => {
      toolbarRef.current?.handleSaveAs()
    })
    window.electronAPI.onMenuExport?.(() => {
      toolbarRef.current?.handleExport()
    })
  }, [
    undo,
    redo,
    canUndo,
    canRedo,
    selectedElementIds,
    selectedElementLocation,
    deleteSelectedElements,
    copyElement,
    pasteElement,
    copiedElements,
    selectedContainerChildId,
    selectedContainerParentId,
    selectedLoopChildId,
    selectedLoopParentId,
    deleteLoopChildElement,
    toolbarRef,
  ])
}
