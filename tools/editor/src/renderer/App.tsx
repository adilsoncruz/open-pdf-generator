import { useState, useEffect, useRef, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import Canvas from './components/Canvas'
import PropertiesPanel from './components/PropertiesPanel'
import Toolbar, { ToolbarRef } from './components/Toolbar'
import DataPanel from './components/DataPanel'
import ElementsToolbar from './components/ElementsToolbar'
import HelpModal from './components/HelpModal'
import PDFPreview from './components/PDFPreview'
import { useTemplateStore } from './store/templateStore'
import { useUIStore } from './store/uiStore'
import { usePreviewStore, PreviewMode } from './store/previewStore'

function App() {
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
    deleteElement,
    deleteSelectedElements,
    clearSelection,
    selectAllElements,
    updateElement,
    copyElement,
    pasteElement,
    copiedElements
  } = useTemplateStore()
  
  const { theme, setTheme } = useUIStore()
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
    // Apply saved theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    console.log('🚀 PDF Template Editor v4.0 - Build 20251202')
    console.log('🎨 Theme:', theme)
    console.log('✅ Dark Mode Support Enabled')
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if focus is on a text field
      const activeEl = document.activeElement as HTMLElement
      const isInputField = activeEl?.tagName === 'INPUT' || 
                          activeEl?.tagName === 'TEXTAREA' || 
                          activeEl?.isContentEditable ||
                          (e.target as HTMLElement)?.tagName === 'INPUT' ||
                          (e.target as HTMLElement)?.tagName === 'TEXTAREA' ||
                          (e.target as HTMLElement)?.isContentEditable
      
      // If in input, allow all standard text shortcuts
      if (isInputField) {
        // Ctrl+A (Select All), Ctrl+X (Cut), Ctrl+C (Copy), Ctrl+V (Paste)
        // Ctrl+Z (Undo), Ctrl+Y (Redo) - all should work natively
        if ((e.ctrlKey || e.metaKey) && ['a', 'x', 'c', 'v', 'z', 'y'].includes(e.key.toLowerCase())) {
          // Do nothing - let browser default behavior
          return
        }
        // Arrows, Home, End, Delete, Backspace should also work natively in inputs
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Delete', 'Backspace'].includes(e.key)) {
          return
        }
      }
      
      // Arrows: move selected element(s)
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && !isInputField) {
        if (selectedElementIds.length > 0) {
          e.preventDefault()
          
          // Increment: 1px normal, 10px with Shift
          const increment = e.shiftKey ? 10 : 1
          
          // Get all selected elements
          const { updateElement } = useTemplateStore.getState()
          let allElements: any[] = []
          
          if (selectedElementLocation === 'header' && template.pageSettings.header) {
            allElements = template.pageSettings.header.elements
          } else if (selectedElementLocation === 'footer' && template.pageSettings.footer) {
            allElements = template.pageSettings.footer.elements
          } else if (selectedElementLocation === 'bodyBackground' && template.pageSettings.bodyBackground) {
            allElements = template.pageSettings.bodyBackground.elements
          } else {
            allElements = template.pageElements
          }
          
          // Move all selected elements
          selectedElementIds.forEach(id => {
            const currentElement = allElements.find(el => el.id === id)
            
            if (currentElement) {
              const updates: any = {}
              
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
      
      // Delete or Backspace: delete selected element(s)
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isInputField) {
        if (selectedElementIds.length > 0) {
          e.preventDefault()
          deleteSelectedElements()
        }
        return
      }
      
      // Ctrl+A or Cmd+A: Select all elements
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
      
      // F1: Open help - Expressions
      if (e.key === 'F1') {
        e.preventDefault()
        setHelpModalInitialTab('text')
        setShowHelpModal(true)
        return
      }
      
      // F2: Open help - Conditions
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
      
      // Ctrl+C or Cmd+C (Mac) - Copy element
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        // Don't copy element if help modal is open (allow copying text)
        if (showHelpModal) return
        
        // Only copy element if NOT in input field AND element is selected
        if (!isInputField && selectedElementIds.length > 0) {
          e.preventDefault()
          copyElement()
        }
        // If in input field, let default behavior (copy text)
      }
      
      // Ctrl+V or Cmd+V (Mac) - Paste element(s)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        // Don't paste element if help modal is open
        if (showHelpModal) return
        
        // Only paste element(s) if NOT in input field AND element(s) are copied
        if (!isInputField && copiedElements) {
          e.preventDefault()
          pasteElement()
        }
        // If in input field, let default behavior (paste text)
      }
      
      // Ctrl+Z ou Cmd+Z (Mac) - Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey && !isInputField) {
        e.preventDefault()
        if (canUndo()) {
          undo()
        }
      }
      
      // Ctrl+Y ou Cmd+Shift+Z (Mac) - Redo
      if ((((e.ctrlKey || e.metaKey) && e.key === 'y') || 
          ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')) && !isInputField) {
        e.preventDefault()
        if (canRedo()) {
          redo()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, canUndo, canRedo, selectedElementIds, selectedElementLocation, deleteSelectedElements, clearSelection, selectAllElements, template, copyElement, pasteElement, copiedElements, updateElement, togglePreview])

  // Menu events from Electron
  useEffect(() => {
    // Undo/Redo via menu
    window.electronAPI.onMenuUndo(() => {
      if (canUndo()) undo()
    })
    window.electronAPI.onMenuRedo(() => {
      if (canRedo()) redo()
    })
    
    // Copy/Paste via menu
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
    
    // Delete element(s) via menu
    window.electronAPI.onMenuDelete(() => {
      if (selectedElementIds.length > 0) {
        deleteSelectedElements()
      }
    })
    
    // File menu events
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
  }, [undo, redo, canUndo, canRedo, selectedElementIds, selectedElementLocation, deleteSelectedElements, copyElement, pasteElement, copiedElements])

  return (
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

        {/* Canvas/Editor Area - with split support */}
        <div className={`flex flex-col min-w-0 overflow-hidden ${previewMode === 'split' ? 'flex-1' : 'flex-1'}`}>
          <Canvas />
        </div>

        {/* PDF Preview Panel - Split View */}
        {previewMode === 'split' && (
          <div className="flex-1 min-w-0 overflow-hidden">
            <PDFPreview onClose={() => { setPreviewMode('hidden'); clearPreview(); }} />
          </div>
        )}

        {/* Right Toolbar - Add Elements */}
        <ElementsToolbar />

        {/* Right Panel - Properties (show when element, group or section selected) */}
        {(selectedElementIds.length > 0 || 
          selectedGroupId || 
          (currentSection === 'header' && template.pageSettings.header) ||
          (currentSection === 'footer' && template.pageSettings.footer) ||
          (currentSection === 'summary' && template.summaryPage) ||
          (currentSection === 'bodyBackground' && template.pageSettings.bodyBackground)
        ) && <PropertiesPanel />}
      </div>

      {/* Data Panel Modal */}
      {showDataPanel && (
        <DataPanel onClose={() => setShowDataPanel(false)} />
      )}

      {/* Help Modal */}
      <HelpModal 
        isOpen={showHelpModal} 
        onClose={() => setShowHelpModal(false)}
        initialTab={helpModalInitialTab}
      />
    </div>
  )
}

export default App
