import { useState, useEffect, useRef, useCallback } from 'react'
import { useTemplateStore, type Element } from '../../../store/templateStore'
import { useUIStore } from '../../../store/uiStore'
import { usePreviewStore } from '../../../store/previewStore'
import {
  Toolbar,
  Sidebar,
  Canvas,
  PropertiesPanel,
  DataPanel,
  PDFPreview,
  HelpModal,
  ElementsToolbar,
} from '../../organisms'
import type { ToolbarRef } from '../../organisms'

/**
 * EditorPage - Main page component for the PDF Template Editor
 * 
 * This is a Page-level component that:
 * - Connects UI with business logic
 * - Handles keyboard shortcuts
 * - Manages modal states
 * - Orchestrates the editor layout
 */
export function EditorPage() {
  const [showDataPanel, setShowDataPanel] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [helpModalInitialTab, setHelpModalInitialTab] = useState<'text' | 'conditions'>('text')
  
  const {
    template,
    undo,
    redo,
    canUndo,
    canRedo,
    selectedElementIds,
    selectedElementLocation,
    selectedGroupId,
    currentSection,
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

  const { theme } = useUIStore()
  const { mode: previewMode, setMode: setPreviewMode, clearPreview } = usePreviewStore()
  const toolbarRef = useRef<ToolbarRef>(null)

  // Toggle preview mode
  const togglePreview = useCallback(() => {
    if (previewMode === 'hidden') {
      setPreviewMode('split')
    } else {
      setPreviewMode('hidden')
      clearPreview()
    }
  }, [previewMode, setPreviewMode, clearPreview])

  // Initialize theme on mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    console.log('🚀 PDF Template Editor v4.0 - Build 20251202')
    console.log('🎨 Theme:', theme)
    console.log('✅ Dark Mode Support Enabled')
  }, [theme])

  // Keyboard shortcuts
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

      // Allow standard text shortcuts in input fields
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
          const { updateElement } = useTemplateStore.getState()
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
          } else {
            allElements = template.page
          }

          selectedElementIds.forEach((id) => {
            const currentElement = allElements.find((el) => el.id === id)
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
              updateElement(id, updates, selectedElementLocation)
            }
          })
        }
        return
      }

      // Delete/Backspace: delete selected elements
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isInputField) {
        if (selectedContainerChildId && selectedContainerParentId) {
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
  ])

  // Menu events from Electron
  useEffect(() => {
    window.electronAPI.onMenuUndo(() => {
      if (canUndo()) undo()
    })
    window.electronAPI.onMenuRedo(() => {
      if (canRedo()) redo()
    })
    window.electronAPI.onMenuCopy(() => {
      if (selectedElementIds.length > 0) {
        copyElement()
        console.log('✂️ Element copied via menu')
      }
    })
    window.electronAPI.onMenuPaste(() => {
      if (copiedElements) {
        pasteElement()
        console.log('📋 Element(s) pasted via menu')
      }
    })
    window.electronAPI.onMenuDelete(() => {
      if (selectedContainerChildId && selectedContainerParentId) {
        deleteLoopChildElement(selectedContainerParentId, selectedContainerChildId, selectedElementLocation)
      } else if (selectedLoopChildId && selectedLoopParentId) {
        deleteLoopChildElement(selectedLoopParentId, selectedLoopChildId, selectedElementLocation)
      } else if (selectedElementIds.length > 0) {
        deleteSelectedElements()
      }
    })
    window.electronAPI.onMenuNew(() => {
      toolbarRef.current?.handleNew()
    })
    window.electronAPI.onMenuOpen(() => {
      toolbarRef.current?.handleOpen()
    })
    window.electronAPI.onMenuSave(() => {
      toolbarRef.current?.handleSave()
    })
    window.electronAPI.onMenuSaveAs(() => {
      toolbarRef.current?.handleSaveAs()
    })
    window.electronAPI.onMenuExport(() => {
      toolbarRef.current?.handleExport()
    })
  }, [
    undo,
    redo,
    canUndo,
    canRedo,
    selectedElementIds,
    deleteSelectedElements,
    copyElement,
    pasteElement,
    copiedElements,
  ])


  const showPropertiesPanel =
    selectedElementIds.length > 0 ||
    selectedGroupId ||
    (currentSection === 'header' && template.pageSettings.header) ||
    (currentSection === 'footer' && template.pageSettings.footer) ||
    (currentSection === 'summary' && template.summaryPage) ||
    (currentSection === 'bodyBackground' && template.pageSettings.bodyBackground)

  return (
    <>
      <div className="flex flex-col h-screen theme-bg">
        {/* Toolbar */}
        <Toolbar
          ref={toolbarRef}
          onToggleDataPanel={() => setShowDataPanel(!showDataPanel)}
          onTogglePreview={togglePreview}
          previewMode={previewMode}
        />

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <Sidebar />

          {/* Canvas/Editor Area */}
          <div className={`flex flex-col min-w-0 overflow-hidden flex-1`}>
            <Canvas />
          </div>

          {/* PDF Preview Panel - Split View */}
          {previewMode === 'split' && (
            <div className="flex-1 min-w-0 overflow-hidden">
              <PDFPreview
                onClose={() => {
                  setPreviewMode('hidden')
                  clearPreview()
                }}
              />
            </div>
          )}

          {/* Right Toolbar - Add Elements */}
          <ElementsToolbar />

          {/* Right Panel - Properties */}
          {showPropertiesPanel && <PropertiesPanel />}
        </div>

        {/* Data Panel Modal */}
        {showDataPanel && <DataPanel onClose={() => setShowDataPanel(false)} />}

        {/* Help Modal */}
        <HelpModal
          isOpen={showHelpModal}
          onClose={() => setShowHelpModal(false)}
          initialTab={helpModalInitialTab}
        />
      </div>
    </>
  )
}
