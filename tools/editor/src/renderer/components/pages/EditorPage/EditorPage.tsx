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
  StatusBar,
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
    if (!window.electronAPI) return
    window.electronAPI.onMenuUndo?.(() => {
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

  const { isPropertiesPanelPinned } = useTemplateStore()

  // Determine if properties panel should be shown
  const showPropertiesPanel =
    isPropertiesPanelPinned ||
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
          {/* Left Vertical Icon Rail (Estilo Figma / Studio Slate) */}
          <div className="w-12 bg-slate-950 border-r border-slate-800 flex flex-col items-center py-3 justify-between select-none shrink-0 z-20">
            {/* Top Navigation Icons */}
            <div className="flex flex-col items-center gap-4 text-slate-400">
              <button 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
                title="Templates / Documentos"
              >
                <Icon name="file-text" size="sm" />
              </button>
              <button 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-indigo-400 bg-indigo-600/20 border border-indigo-500/30 transition shadow-sm"
                title="Biblioteca de Componentes"
              >
                <Icon name="layers" size="sm" />
              </button>
              <button 
                onClick={() => setShowDataPanel(true)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
                title="Dados JSON de Teste"
              >
                <span className="font-mono text-xs font-semibold">{`{ }`}</span>
              </button>
              <button 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
                title="Histórico / Versões"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>

            {/* Bottom Actions: Lock, Settings, Help */}
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <button 
                onClick={() => setShowHelpModal(true)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
                title="Ajuda e Documentação"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
                title="Configurações"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>

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

          {/* Right Panel - Properties */}
          <PropertiesPanel />
        </div>

        {/* Status Bar */}
        <StatusBar />

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
