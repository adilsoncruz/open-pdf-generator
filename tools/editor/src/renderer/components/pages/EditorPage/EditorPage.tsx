import { useState, useEffect, useRef, useCallback } from 'react'
import { useUIStore } from '../../../store/uiStore'
import { usePreviewStore } from '../../../store/previewStore'
import {
  Toolbar,
  Sidebar,
  Canvas,
  PropertiesPanel,
  PDFPreview,
  StatusBar,
} from '../../organisms'
import ContextMenu from '../../ContextMenu'
import type { ToolbarRef } from '../../organisms'
import { useEditorShortcuts } from './hooks/useEditorShortcuts'
import { useElectronMenuEvents } from './hooks/useElectronMenuEvents'
import { NavigationRail } from './components/NavigationRail'
import { EditorModals } from './components/EditorModals'

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
  const [showSchemaPanel, setShowSchemaPanel] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [helpModalInitialTab, setHelpModalInitialTab] = useState<'text' | 'conditions'>('text')

  const { theme, sidebarTab } = useUIStore()
  const { mode: previewMode, setMode: setPreviewMode, clearPreview } = usePreviewStore()
  const toolbarRef = useRef<ToolbarRef>(null)

  const togglePreview = useCallback(() => {
    if (previewMode === 'hidden') {
      setPreviewMode('split')
    } else {
      setPreviewMode('hidden')
      clearPreview()
    }
  }, [previewMode, setPreviewMode, clearPreview])

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  useEditorShortcuts({
    toolbarRef,
    togglePreview,
    showHelpModal,
    setShowHelpModal,
    setHelpModalInitialTab,
  })

  useElectronMenuEvents({
    toolbarRef,
  })

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
        {/* Left Vertical Icon Rail */}
        <NavigationRail
          onOpenSchema={() => setShowSchemaPanel(true)}
          onOpenHelp={() => setShowHelpModal(true)}
          onOpenSettings={() => toolbarRef.current?.openSettings()}
        />

        {/* Left Sidebar */}
        <Sidebar />

        {/* Canvas/Editor Area */}
        <div className="flex flex-col min-w-0 overflow-hidden flex-1">
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

        {/* Right Panel - Properties (only in elements/components tab) */}
        {sidebarTab === 'elements' && <PropertiesPanel />}
      </div>

      {/* Status Bar */}
      <StatusBar />

      {/* Modals */}
      <EditorModals
        showDataPanel={showDataPanel}
        onCloseDataPanel={() => setShowDataPanel(false)}
        showSchemaPanel={showSchemaPanel}
        onCloseSchemaPanel={() => setShowSchemaPanel(false)}
        showHelpModal={showHelpModal}
        onCloseHelpModal={() => setShowHelpModal(false)}
        helpModalInitialTab={helpModalInitialTab}
      />

      {/* Global Context Menu */}
      <ContextMenu />
    </div>
  )
}
