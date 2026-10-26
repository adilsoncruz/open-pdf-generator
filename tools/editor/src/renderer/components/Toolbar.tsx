import { useState, forwardRef, useImperativeHandle } from 'react'
import { usePreviewStore } from '../store/previewStore'
import { UpdateNotification } from './UpdateNotification'
import { TabBar } from './TabBar'
import { StudioLogo } from './pages/LoadingPage'
import { useCLIStatus } from './toolbar/hooks/useCLIStatus'
import { useFileOperations } from './toolbar/hooks/useFileOperations'
import { FileMenu } from './toolbar/components/FileMenu'
import { DocumentTitle } from './toolbar/components/DocumentTitle'
import { ToolbarActions } from './toolbar/components/ToolbarActions'
import { SettingsModal } from './toolbar/components/SettingsModal'
import type { ToolbarProps, ToolbarRef } from './toolbar/types'

export type { ToolbarProps, ToolbarRef }

const Toolbar = forwardRef<ToolbarRef, ToolbarProps>(({ onToggleDataPanel, onTogglePreview, previewMode = 'hidden' }, ref) => {
  const { mode: previewModeFromStore } = usePreviewStore()
  const effectivePreviewMode = previewMode || previewModeFromStore

  const [showFileMenu, setShowFileMenu] = useState(false)
  const [showCLIModal, setShowCLIModal] = useState(false)

  const {
    cliStatus,
    setCLIStatus,
    appVersions,
    isInstallingCLI,
    installError,
    checkCLIStatus,
    getErrorMessage,
    handleInstallCLI,
    handleInstallCLIFromFile,
  } = useCLIStatus()

  const {
    handleNew,
    handleOpen,
    handleSave,
    handleSaveAs,
    handleExport,
    handleGeneratePDF,
  } = useFileOperations({
    effectivePreviewMode,
    checkCLIStatus,
    getErrorMessage,
    openSettings: () => setShowCLIModal(true),
    setCLIStatus,
  })

  useImperativeHandle(ref, () => ({
    handleNew,
    handleOpen,
    handleSave,
    handleSaveAs,
    handleExport,
    handleGeneratePDF,
    openSettings: () => setShowCLIModal(true),
  }))

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between h-14 text-slate-200">
      {/* 1. SEÇÃO ESQUERDA: Logo + Menu Arquivo + Nome do Template + Status Salvo */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center gap-2 pr-2 border-r border-slate-800">
          <StudioLogo className="w-7 h-7 rounded-lg shadow-sm shadow-indigo-500/30" />
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-300">
            Open PDF
          </span>
        </div>

        <FileMenu
          isOpen={showFileMenu}
          onOpenChange={setShowFileMenu}
          onNew={handleNew}
          onOpen={handleOpen}
          onSave={handleSave}
          onSaveAs={handleSaveAs}
          onExport={handleExport}
          onOpenSettings={() => setShowCLIModal(true)}
        />

        <DocumentTitle onSave={handleSave} />

        <UpdateNotification />
      </div>

      {/* 2. SEÇÃO CENTRAL: Abas de Templates (Multi-tabs) */}
      <div className="flex-1 flex items-center justify-start px-3 min-w-0 overflow-hidden">
        <TabBar />
      </div>

      {/* 3. SEÇÃO DIREITA: Test Data + Split Preview + Language + Settings + Gerar PDF Principal */}
      <ToolbarActions
        cliStatus={cliStatus}
        onOpenSettings={() => setShowCLIModal(true)}
        onToggleDataPanel={onToggleDataPanel}
        onTogglePreview={onTogglePreview}
        effectivePreviewMode={effectivePreviewMode}
        onGeneratePDF={handleGeneratePDF}
      />

      {/* Modal de Configurações CLI */}
      <SettingsModal
        isOpen={showCLIModal}
        onClose={() => setShowCLIModal(false)}
        cliStatus={cliStatus}
        appVersions={appVersions}
        isInstallingCLI={isInstallingCLI}
        installError={installError}
        onInstallCLI={() => handleInstallCLI(() => setShowCLIModal(false))}
        onInstallCLIFromFile={() => handleInstallCLIFromFile(() => setShowCLIModal(false))}
        onRefreshStatus={checkCLIStatus}
      />
    </div>
  )
})

Toolbar.displayName = 'Toolbar'

export default Toolbar
