import { useEffect, type RefObject } from 'react'
import { useTemplateStore, type Element, flattenElements } from '../../../../store/templateStore'
import type { ToolbarRef } from '../../../organisms'

interface UseEditorShortcutsProps {
  toolbarRef: RefObject<ToolbarRef | null>
  togglePreview: () => void
  showHelpModal: boolean
  setShowHelpModal: (show: boolean) => void
  setHelpModalInitialTab: (tab: 'text' | 'conditions') => void
}

export function useEditorShortcuts({
  toolbarRef,
  togglePreview,
  showHelpModal,
  setShowHelpModal,
  setHelpModalInitialTab,
}: UseEditorShortcutsProps) {
  const {
    template,
    undo,
    redo,
    canUndo,
    canRedo,
    selectedElementIds,
    selectedElementLocation,
    deleteSelectedElements,
    clearSelection,
    selectAllElements,
    updateElement,
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
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement
      const isInputField =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.isContentEditable ||
        (e.target as HTMLElement)?.tagName === 'INPUT' ||
        (e.target as HTMLElement)?.tagName === 'TEXTAREA' ||
        (e.target as HTMLElement)?.isContentEditable

      if (isInputField) {
        if (
          (e.ctrlKey || e.metaKey) &&
          ['a', 'x', 'c', 'v', 'z', 'y'].includes(e.key.toLowerCase())
        ) {
          return
        }
        if (
          [
            'ArrowLeft',
            'ArrowRight',
            'ArrowUp',
            'ArrowDown',
            'Home',
            'End',
            'Delete',
            'Backspace',
          ].includes(e.key)
        ) {
          return
        }
      }

      // Arrow keys: move selected elements
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) &&
        !isInputField
      ) {
        if (selectedElementIds.length > 0) {
          e.preventDefault()
          const increment = e.shiftKey ? 10 : 1
          const store = useTemplateStore.getState()
          let allElements: Element[] = []

          if (selectedElementLocation === 'header' && template.pageSettings.header) {
            allElements = template.pageSettings.header.elements
          } else if (selectedElementLocation === 'footer' && template.pageSettings.footer) {
            allElements = template.pageSettings.footer.elements
          } else if (
            selectedElementLocation === 'bodyBackground' &&
            template.pageSettings.bodyBackground
          ) {
            allElements = template.pageSettings.bodyBackground.elements
          } else if (selectedElementLocation === 'summary' && template.summaryPage) {
            allElements = template.summaryPage.elements
          } else {
            allElements = template.page
          }

          const flatElements = flattenElements(allElements)

          selectedElementIds.forEach((id) => {
            const currentElement = flatElements.find((el) => el.id === id)
            if (currentElement) {
              const updates: Partial<Element> = {}
              switch (e.key) {
                case 'ArrowUp':
                  updates.y = (currentElement.y || 0) - increment
                  break
                case 'ArrowDown':
                  updates.y = (currentElement.y || 0) + increment
                  break
                case 'ArrowLeft':
                  updates.x = (currentElement.x || 0) - increment
                  break
                case 'ArrowRight':
                  updates.x = (currentElement.x || 0) + increment
                  break
              }
              store.updateElement(id, updates, selectedElementLocation)
            }
          })
        }
        return
      }

      // Delete/Backspace: delete selected elements
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isInputField) {
        if (selectedElementIds.length > 1) {
          e.preventDefault()
          deleteSelectedElements()
        } else if (selectedContainerChildId && selectedContainerParentId) {
          e.preventDefault()
          deleteLoopChildElement(selectedContainerParentId, selectedContainerChildId, selectedElementLocation)
        } else if (selectedLoopChildId && selectedLoopParentId) {
          e.preventDefault()
          deleteLoopChildElement(selectedLoopParentId, selectedLoopChildId, selectedElementLocation)
        } else if (selectedElementIds.length > 0) {
          e.preventDefault()
          deleteSelectedElements()
        }
        return
      }

      // Ctrl+A: Select all
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a' && !isInputField) {
        e.preventDefault()
        selectAllElements()
        return
      }

      // Ctrl+G / Cmd+G: Group / Ungroup
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g' && !isInputField) {
        e.preventDefault()
        const store = useTemplateStore.getState()
        const currentLoc = store.selectedElementLocation || store.currentSection
        const groups = (() => {
          if (currentLoc === 'header') return store.template.pageSettings.header?.groups || []
          if (currentLoc === 'footer') return store.template.pageSettings.footer?.groups || []
          if (currentLoc === 'bodyBackground') return store.template.pageSettings.bodyBackground?.groups || []
          if (currentLoc === 'summary') return store.template.summaryPage?.groups || []
          return store.template.groups || []
        })()

        if (e.shiftKey) {
          // Ungroup
          const activeGrp = groups.find(
            (g) => g.id === store.selectedGroupId || store.selectedElementIds.some((id) => g.elementIds.includes(id))
          )
          if (activeGrp) {
            store.ungroupElements(activeGrp.id, currentLoc)
          }
        } else {
          // Group
          const activeGrp = groups.find(
            (g) => g.id === store.selectedGroupId || store.selectedElementIds.some((id) => g.elementIds.includes(id))
          )
          if (!activeGrp && store.selectedElementIds.length >= 2) {
            const name = prompt('Nome do Grupo:', `Grupo ${groups.length + 1}`)
            if (name && name.trim()) {
              store.createGroup(name.trim(), store.selectedElementIds, currentLoc)
            }
          }
        }
        return
      }

      // Escape: Clear selection
      if (e.key === 'Escape' && !isInputField) {
        e.preventDefault()
        clearSelection()
        return
      }

      // F1: Help - Expressions
      if (e.key === 'F1') {
        e.preventDefault()
        setHelpModalInitialTab('text')
        setShowHelpModal(true)
        return
      }

      // F2: Help - Conditions
      if (e.key === 'F2') {
        e.preventDefault()
        setHelpModalInitialTab('conditions')
        setShowHelpModal(true)
        return
      }

      // Ctrl+Shift+P: Toggle preview
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault()
        togglePreview()
        return
      }

      // Ctrl+C: Copy
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (showHelpModal) return
        if (!isInputField && selectedElementIds.length > 0) {
          e.preventDefault()
          copyElement()
        }
      }

      // Ctrl+V: Paste
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        if (showHelpModal) return
        if (!isInputField && copiedElements) {
          e.preventDefault()
          pasteElement()
        }
      }

      // Ctrl+S / Cmd+S: Save
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        if (e.shiftKey) {
          toolbarRef.current?.handleSaveAs()
        } else {
          toolbarRef.current?.handleSave()
        }
        return
      }

      // Ctrl+Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey && !isInputField) {
        e.preventDefault()
        if (canUndo()) undo()
      }

      // Ctrl+Y / Ctrl+Shift+Z: Redo
      if (
        (((e.ctrlKey || e.metaKey) && e.key === 'y') ||
          ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')) &&
        !isInputField
      ) {
        e.preventDefault()
        if (canRedo()) redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    undo,
    redo,
    canUndo,
    canRedo,
    selectedElementIds,
    selectedElementLocation,
    deleteSelectedElements,
    clearSelection,
    selectAllElements,
    template,
    copyElement,
    pasteElement,
    copiedElements,
    updateElement,
    togglePreview,
    showHelpModal,
    toolbarRef,
    deleteLoopChildElement,
    selectedContainerChildId,
    selectedContainerParentId,
    selectedLoopChildId,
    selectedLoopParentId,
    setHelpModalInitialTab,
    setShowHelpModal,
  ])
}
