import { useState, forwardRef, useImperativeHandle, useEffect, useCallback } from 'react'
import { useTemplateStore } from '../store/templateStore'
import { useTabStore } from '../store/tabStore'
import { useUIStore } from '../store/uiStore'
import { usePreviewStore } from '../store/previewStore'
import { UpdateNotification } from './UpdateNotification'
import { useTranslation, type LanguageCode } from '../i18n'
import { Icon, Button } from './atoms'
import { MenuItem, DropdownMenu } from './molecules'
import { TabBar } from './TabBar'
import { StudioLogo } from './pages/LoadingPage'

// CLI status interface
interface CLIStatus {
  installed: boolean
  version: string | null
  jarPath: string
  needsUpdate: boolean
  javaInstalled: boolean
  javaVersion: string | null
}

interface ToolbarProps {
  onToggleDataPanel: () => void
  onTogglePreview?: () => void
  previewMode?: 'hidden' | 'tab' | 'split'
}

interface AppVersions {
  editor: string
  core: string | null
  cli: string | null
}

export interface ToolbarRef {
  handleNew: () => void
  handleOpen: () => void
  handleSave: () => void
  handleSaveAs: () => void
  handleExport: () => void
  handleGeneratePDF: () => void
  openSettings: () => void
}

const Toolbar = forwardRef<ToolbarRef, ToolbarProps>(({ onToggleDataPanel, onTogglePreview, previewMode = 'hidden' }, ref) => {
  const { t, language, setLanguage, availableLanguages } = useTranslation()
  const {
    template,
    testData,
    currentFilePath,
    isDirty,
    setTemplate,
    setCurrentFilePath,
    markClean,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useTemplateStore()
  
  const { theme, toggleTheme, zoom, setZoom, snapToGuides, toggleSnapToGuides } = useUIStore()
  const { mode: previewModeFromStore, triggerRefresh, refreshTrigger } = usePreviewStore()
  
  // Use previewMode from store if not passed as prop
  const effectivePreviewMode = previewMode || previewModeFromStore
  


  const [showFileMenu, setShowFileMenu] = useState(false)
  const [showCLIModal, setShowCLIModal] = useState(false)
  const [cliStatus, setCLIStatus] = useState<CLIStatus | null>(null)
  const [isInstallingCLI, setIsInstallingCLI] = useState(false)
  const [installError, setInstallError] = useState<string | null>(null)
  const [appVersions, setAppVersions] = useState<AppVersions | null>(null)
  

  
  // Check CLI status on mount
  const checkCLIStatus = useCallback(async () => {
    if (!window.electronAPI?.getCLIStatus) return
    try {
      const status = await window.electronAPI.getCLIStatus()
      setCLIStatus(status)
    } catch (error) {
      console.error('Error checking CLI:', error)
    }
  }, [])
  
  useEffect(() => {
    checkCLIStatus()
  }, [checkCLIStatus])

  useEffect(() => {
    const loadVersions = async () => {
      if (!window.electronAPI?.getAppVersions) return
      try {
        const versions = await window.electronAPI.getAppVersions()
        setAppVersions(versions)
      } catch (error) {
        console.error('Error loading app versions:', error)
      }
    }

    loadVersions()
  }, [])
  
  // Map error codes to translated messages
  const getErrorMessage = useCallback((errorCode?: string): string => {
    switch (errorCode) {
      case 'JAVA_NOT_INSTALLED':
        return t.errors.javaNotInstalled
      case 'CLI_NOT_INSTALLED':
        return t.errors.cliNotInstalled
      case 'ERROR_GENERATING_PDF':
        return t.errors.errorGeneratingPdf
      case 'ERROR_EXECUTING_JAVA':
        return t.errors.errorExecutingJava
      case 'MAIN_WINDOW_NOT_FOUND':
        return t.errors.mainWindowNotFound
      case 'OPERATION_CANCELLED':
        return t.errors.operationCancelled
      default:
        return t.errors.unknownError
    }
  }, [t])
  
  // Install CLI automatically
  const handleInstallCLI = async () => {
    setIsInstallingCLI(true)
    setInstallError(null)
    
    try {
      const result = await window.electronAPI.installCLI()
      if (result.success) {
        await checkCLIStatus()
        setShowCLIModal(false)
      } else {
        setInstallError(getErrorMessage(result.errorCode))
      }
    } catch {
      setInstallError(t.errors.unknownError)
    } finally {
      setIsInstallingCLI(false)
    }
  }
  
  // Install CLI from file
  const handleInstallCLIFromFile = async () => {
    setIsInstallingCLI(true)
    setInstallError(null)
    
    try {
      const result = await window.electronAPI.installCLIFromFile()
      if (result.success) {
        await checkCLIStatus()
        setShowCLIModal(false)
      } else if (result.errorCode !== 'OPERATION_CANCELLED') {
        setInstallError(getErrorMessage(result.errorCode))
      }
    } catch {
      setInstallError(t.errors.unknownError)
    } finally {
      setIsInstallingCLI(false)
    }
  }

  const handleNew = () => {
    useTabStore.getState().createNewTemplateTab()
  }

  const handleOpen = async () => {
    // Loop to keep file dialog open until valid template or user cancels
    let keepTrying = true
    while (keepTrying) {
      const result = await window.electronAPI.openFile()
      if (!result) {
        // User cancelled the file dialog
        break
      }
      try {
        // First, try to parse JSON to catch syntax errors
        const loadedTemplate = JSON.parse(result.content)
        // Always do basic structural validation first (CLI may not validate structure properly)
        let structuralError = ''
        if (!loadedTemplate.version) {
          structuralError = t.validation.missingVersion
        } else if (!loadedTemplate.pageSettings) {
          structuralError = t.validation.missingPageSettings
        } else if (!loadedTemplate.elements && !loadedTemplate.page) {
          structuralError = t.validation.missingElements
        }
        if (structuralError) {
          keepTrying = confirm(`${t.validation.invalidTemplate}\n\n${structuralError}\n\n${t.validation.selectAnotherFile}`)
          continue
        }
        // Validate template using CLI (if available) for deeper validation
        const validation = await window.electronAPI.validateTemplate(result.path)
        if (!validation.valid) {
          // CLI validation failed - show friendly error message
          if (validation.errorCode !== 'CLI_NOT_INSTALLED' && validation.errorCode !== 'JAVA_NOT_INSTALLED') {
            keepTrying = confirm(`${t.validation.invalidTemplate}\n\n${t.validation.templateValidationFailed}\n\n${t.validation.selectAnotherFile}`)
            continue
          }
          // If CLI not installed, we already did structural validation above, so proceed
        }
        
        // Valid template - open as new tab
        const tabTitle = result.convertedFromJasper
          ? 'Converted Template'
          : result.path.split(/[/\\]/).pop() || loadedTemplate.metadata?.name || 'Opened Template'

        useTabStore.getState().addTab({
          name: tabTitle,
          path: result.convertedFromJasper ? null : result.path,
          isDirty: false,
          stateSnapshot: {
            template: loadedTemplate,
            currentFilePath: result.convertedFromJasper ? null : result.path,
            isDirty: false,
            history: [loadedTemplate],
            historyIndex: 0,
            selectedElementIds: [],
            selectedElementLocation: 'body',
            selectedGroupId: null,
            currentSection: 'body',
          },
        })
        if (result.convertedFromJasper) {
          alert('Template JASPER (.jrxml) convertido para JSON. Use "Save As" para salvar o template convertido.')
        }
        keepTrying = false
      } catch {
        // JSON parse error - show friendly message and ask to try again
        keepTrying = confirm(`${t.validation.invalidTemplate}\n\n${t.validation.invalidJson}\n\n${t.validation.selectAnotherFile}`)
      }
    }
  }

  const handleSave = async () => {
    const content = JSON.stringify(template, null, 2)

    if (currentFilePath) {
      const result = await window.electronAPI.writeFile(currentFilePath, content)
      if (result.success) {
        markClean()
        useTabStore.getState().updateActiveTab({
          path: currentFilePath,
          name: currentFilePath.split(/[/\\]/).pop() || 'template.json',
          isDirty: false,
        })
        // Update preview if open
        if (effectivePreviewMode !== 'hidden') {
          triggerRefresh()
        }
      } else {
        alert('Error saving: ' + result.error)
      }
    } else {
      handleSaveAs()
    }
  }

  const handleSaveAs = async () => {
    const content = JSON.stringify(template, null, 2)
    const rawName = template?.metadata?.name || 'template'
    const fileName = rawName.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.json'

    const result = await window.electronAPI.saveFile(content, fileName)
    if (result) {
      setCurrentFilePath(result)
      markClean()
      useTabStore.getState().updateActiveTab({
        path: result,
        name: result.split(/[/\\]/).pop() || fileName,
        isDirty: false,
      })
      // Update preview if open
      if (effectivePreviewMode !== 'hidden') {
        triggerRefresh()
      }
    }
  }

  const handleExport = async () => {
    const content = JSON.stringify(template, null, 2)
    const rawName = template?.metadata?.name || 'template'
    const fileName = rawName.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.json'

    await window.electronAPI.saveFile(content, fileName)
  }

  const handleGeneratePDF = async () => {
    try {
      // Check CLI status before generating
      const status = await window.electronAPI.getCLIStatus()
      setCLIStatus(status)
      
      if (!status.javaInstalled) {
        alert(
          `⚠️ ${t.pdf.javaNotInstalled}\n\n` +
          `${t.pdf.javaRequired}\n\n` +
          `${t.pdf.installJava}:\n` +
          'https://adoptium.net/'
        )
        return
      }
      
      if (!status.installed) {
        setShowCLIModal(true)
        return
      }
      
      const templateJson = JSON.stringify(template)
      const { testData } = useTemplateStore.getState()
      
      // Check if test data exists
      const hasTestData = testData && Object.keys(testData).length > 0
      
      if (!hasTestData) {
        const useEmpty = confirm(
          `⚠️ ${t.pdf.noTestData}\n\n` +
          `${t.pdf.noTestDataTip}\n\n` +
          `${t.pdf.generateAnyway}`
        )
        
        if (!useEmpty) {
          return
        }
      }
      
      const dataJson = JSON.stringify(testData || {})

      console.log('🎯 Generating PDF...')
      console.log('  Template:', template.metadata.name)
      console.log('  Data:', hasTestData ? 'With test data' : 'No data (empty)')
      console.log('  CLI Version:', status.version)

      // Generate PDF
      const result = await window.electronAPI.generatePDF(templateJson, dataJson)

      if (result.success) {
        const openConfirm = confirm(t.pdf.generated)
        if (openConfirm && result.outputPath) {
          await window.electronAPI.openPDF(result.outputPath)
        }
      } else {
        // Check if CLI not installed error
        if (result.cliNotInstalled) {
          await checkCLIStatus()
          setShowCLIModal(true)
        } else if (result.javaNotInstalled) {
          alert(
            `⚠️ ${t.pdf.javaNotInstalled}\n\n` +
            `${t.pdf.javaRequired}\n\n` +
            `${t.pdf.installJava}:\n` +
            'https://adoptium.net/'
          )
        } else {
          alert(`${t.pdf.error}:\n\n${result.cliError || getErrorMessage(result.errorCode)}`)
        }
      }
    } catch (error) {
      alert(`${t.pdf.error}: ${(error as Error).message}`)
    }
  }

  // Expose functions via ref for menu
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

        {/* Menu Arquivo */}
        <DropdownMenu
          isOpen={showFileMenu}
          onOpenChange={setShowFileMenu}
          trigger={
            <button
              className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded transition flex items-center gap-1.5"
              title={t.toolbar.file}
            >
              <Icon name="file-text" size="sm" />
              <span>{t.toolbar.file}</span>
              <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          }
        >
          <MenuItem shortcut="Ctrl+N" onClick={() => { handleNew(); setShowFileMenu(false) }}>
            {t.toolbar.new}
          </MenuItem>
          <MenuItem shortcut="Ctrl+O" onClick={() => { handleOpen(); setShowFileMenu(false) }}>
            {t.toolbar.open}
          </MenuItem>
          <div className="border-t border-slate-800 my-1" />
          <MenuItem shortcut="Ctrl+S" onClick={() => { handleSave(); setShowFileMenu(false) }}>
            {t.toolbar.save}
          </MenuItem>
          <MenuItem shortcut="Ctrl+Shift+S" onClick={() => { handleSaveAs(); setShowFileMenu(false) }}>
            {t.toolbar.saveAs}
          </MenuItem>
          <div className="border-t border-slate-800 my-1" />
          <MenuItem onClick={() => { handleExport(); setShowFileMenu(false) }}>
            {t.toolbar.export}
          </MenuItem>
          <div className="border-t border-slate-800 my-1" />
          <MenuItem onClick={() => { setShowCLIModal(true); setShowFileMenu(false) }}>
            {t.toolbar.settings}
          </MenuItem>
        </DropdownMenu>

        {/* Nome do Documento */}
        <div className="flex items-center gap-2 bg-slate-950/60 px-2.5 py-1 rounded border border-slate-800">
          <span className="text-xs text-slate-300 font-mono truncate max-w-[180px]">
            {currentFilePath ? currentFilePath.split('/').pop() : template?.metadata?.name || 'template.json'}
          </span>
          <button
            onClick={handleSave}
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
              isDirty
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
            }`}
            title="Ctrl+S / Cmd+S"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            <span>{isDirty ? t.common.unsaved : t.common.save}</span>
          </button>
        </div>
        
        <UpdateNotification />
      </div>

      {/* 2. SEÇÃO CENTRAL: Abas de Templates (Multi-tabs) */}
      <div className="flex-1 flex items-center justify-start px-3 min-w-0 overflow-hidden">
        <TabBar />
      </div>

      {/* 3. SEÇÃO DIREITA: Test Data + Split Preview + Language + Settings + Gerar PDF Principal */}
      <div className="flex items-center space-x-2">
        {/* Indicador de Status CLI */}
        {cliStatus && !cliStatus.installed && (
          <button
            onClick={() => setShowCLIModal(true)}
            className="px-2.5 py-1 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded flex items-center gap-1.5 hover:bg-amber-500/20"
          >
            <Icon name="warning" size="sm" />
            <span>{t.toolbar.cliNotInstalled}</span>
          </button>
        )}

        {/* Dados de Teste */}
        <button
          onClick={onToggleDataPanel}
          className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 border border-slate-800 rounded-lg transition flex items-center gap-1.5"
        >
          <Icon name="data" size="sm" />
          <span>{t.toolbar.testData}</span>
        </button>

        {/* Alternar Preview / Split View */}
        {onTogglePreview && (
          <button
            onClick={onTogglePreview}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition flex items-center gap-1.5 ${
              effectivePreviewMode !== 'hidden'
                ? 'bg-slate-800 text-indigo-400 border-indigo-500/40'
                : 'text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
            title="Ctrl+Shift+P"
          >
            <Icon name={effectivePreviewMode === 'split' ? 'split' : 'preview'} size="sm" />
            <span>{t.toolbar.preview}</span>
          </button>
        )}

        {/* Seletor Rápido de Idioma */}
        <div className="flex items-center">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
            className="px-2 py-1 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            title={t.toolbar.language}
            aria-label={t.toolbar.language}
          >
            {Object.entries(availableLanguages).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Botão de Configurações */}
        <button
          onClick={() => setShowCLIModal(true)}
          className="p-1.5 text-slate-300 hover:bg-slate-800 border border-slate-800 rounded-lg transition"
          title={t.toolbar.settings}
          aria-label={t.toolbar.settings}
        >
          <Icon name="settings" size="sm" />
        </button>

        {/* Ação Primária: Gerar PDF */}
        <button
          onClick={handleGeneratePDF}
          className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-600/30 transition flex items-center gap-1.5"
          title={t.pdf.generating}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>{t.menu.exportPdf || 'PDF'}</span>
        </button>
      </div>
      
      {/* CLI Installation Modal */}
      {showCLIModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="theme-surface rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b theme-border flex items-center justify-between">
              <h2 className="text-lg font-semibold theme-text flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {t.settings.title}
              </h2>
              <button
                onClick={() => setShowCLIModal(false)}
                className="theme-text-secondary hover:theme-text transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="px-6 py-4 space-y-4">
              {/* Language Selection */}
              <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium theme-text block">
                      🌐 {t.settings.language}
                    </label>
                    <p className="text-xs theme-text-secondary mt-0.5">
                      {t.settings.selectLanguage}
                    </p>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {Object.entries(availableLanguages).map(([code, name]) => (
                      <option key={code} value={code}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Cards */}
              <div className="grid grid-cols-2 gap-4">
                {/* Java Status */}
                <div className={`p-4 rounded-lg border ${cliStatus?.javaInstalled ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {cliStatus?.javaInstalled ? (
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <span className="font-medium theme-text">{t.settings.java}</span>
                  </div>
                  <p className="text-sm theme-text-secondary">
                    {cliStatus?.javaInstalled 
                      ? `${t.settings.version}: ${cliStatus.javaVersion}`
                      : t.settings.notInstalled}
                  </p>
                </div>
                
                {/* CLI Status */}
                <div className={`p-4 rounded-lg border ${cliStatus?.installed ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {cliStatus?.installed ? (
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                    <span className="font-medium theme-text">{t.settings.cli}</span>
                  </div>
                  <p className="text-sm theme-text-secondary">
                    {cliStatus?.installed 
                      ? `${t.settings.version}: ${cliStatus.version}`
                      : t.settings.notInstalled}
                  </p>
                </div>
              </div>
              
              {/* CLI Path */}
              {cliStatus && (
                <div className="p-3 rounded-lg theme-bg-secondary">
                  <p className="text-xs theme-text-secondary mb-1">{t.settings.installationPath}:</p>
                  <code className="text-sm theme-text font-mono break-all">{cliStatus.jarPath}</code>
                </div>
              )}
              
              {/* Error Message */}
              {installError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-sm text-red-500">{installError}</p>
                </div>
              )}
              
              {/* Installation Options */}
              {!cliStatus?.installed && cliStatus?.javaInstalled && (
                <div className="space-y-3">
                  <p className="text-sm theme-text-secondary">
                    {t.settings.cliNeeded} {t.settings.chooseOption}
                  </p>
                  
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={handleInstallCLI}
                      disabled={isInstallingCLI}
                      variant="primary"
                      className="w-full py-3"
                      leftIcon={
                        isInstallingCLI ? (
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <Icon name="download" size="sm" />
                        )
                      }
                    >
                      {isInstallingCLI ? t.settings.installing : t.settings.installAutomatically}
                    </Button>
                    
                    <Button
                      onClick={handleInstallCLIFromFile}
                      disabled={isInstallingCLI}
                      variant="secondary"
                      className="w-full py-3"
                      leftIcon={<Icon name="file-text" size="sm" />}
                    >
                      {t.settings.selectJarFile}
                    </Button>
                  </div>
                  
                  <p className="text-xs theme-text-muted">
                    💡 {t.settings.manualInstallTip}
                  </p>
                </div>
              )}
              
              {/* Java Not Installed Warning */}
              {cliStatus && !cliStatus.javaInstalled && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-sm text-red-500 mb-2">
                    ⚠️ {t.pdf.javaNotInstalled}
                  </p>
                  <p className="text-sm theme-text-secondary mb-3">
                    {t.settings.javaRequired}
                  </p>
                  <a
                    href="https://adoptium.net/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary-500 hover:text-primary-400 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {t.settings.downloadJava}
                  </a>
                </div>
              )}
              
              {/* Already Installed */}
              {cliStatus?.installed && (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ✅ {t.settings.cliReady}
                  </p>
                </div>
              )}
              
              {/* Version Info */}
              <div className="p-4 rounded-lg theme-bg-secondary border theme-border">
                <h3 className="text-sm font-medium theme-text mb-2">{t.settings.versionInfo}</h3>
                <div className="space-y-1 text-xs theme-text-secondary">
                  <p><span className="font-medium">{t.settings.editor}:</span> v{appVersions?.editor || '—'}</p>
                  <p><span className="font-medium">{t.settings.coreLibrary}:</span> v{appVersions?.core || '—'}</p>
                  <p><span className="font-medium">{t.settings.cli}:</span> v{appVersions?.cli || cliStatus?.version || '—'}</p>
                </div>
              </div>
              
              {/* Documentation Link */}
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">📚 {t.settings.documentation}</p>
                    <p className="text-xs theme-text-secondary mt-1">{t.settings.learnMore}</p>
                  </div>
                  <a
                    href="https://adilsoncruz.github.io/open-pdf-generator/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {t.settings.open}
                  </a>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 border-t theme-border flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => checkCLIStatus()}
              >
                {t.settings.refreshStatus}
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowCLIModal(false)}
              >
                {t.common.close}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

Toolbar.displayName = 'Toolbar'

export default Toolbar
