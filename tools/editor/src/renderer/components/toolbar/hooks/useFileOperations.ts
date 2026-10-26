import { useTemplateStore } from '../../../store/templateStore'
import { useTabStore } from '../../../store/tabStore'
import { usePreviewStore } from '../../../store/previewStore'
import { useRecentFilesStore } from '../../../store/recentFilesStore'
import { useTranslation } from '../../../i18n'
import type { CLIStatus } from '../types'

interface UseFileOperationsOptions {
  effectivePreviewMode: string
  checkCLIStatus: () => Promise<CLIStatus | null | undefined>
  getErrorMessage: (errorCode?: string) => string
  openSettings: () => void
  setCLIStatus: (status: CLIStatus | null) => void
}

export function useFileOperations({
  effectivePreviewMode,
  checkCLIStatus,
  getErrorMessage,
  openSettings,
  setCLIStatus,
}: UseFileOperationsOptions) {
  const { t } = useTranslation()
  const {
    template,
    currentFilePath,
    setCurrentFilePath,
    markClean,
  } = useTemplateStore()
  const { triggerRefresh } = usePreviewStore()

  const handleNew = () => {
    useTabStore.getState().createNewTemplateTab()
  }

  const handleOpen = async () => {
    let keepTrying = true
    while (keepTrying) {
      const result = await window.electronAPI.openFile()
      if (!result) {
        break
      }
      try {
        const loadedTemplate = JSON.parse(result.content)
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

        const validation = await window.electronAPI.validateTemplate(result.path)
        if (!validation.valid) {
          if (validation.errorCode !== 'CLI_NOT_INSTALLED' && validation.errorCode !== 'JAVA_NOT_INSTALLED') {
            keepTrying = confirm(`${t.validation.invalidTemplate}\n\n${t.validation.templateValidationFailed}\n\n${t.validation.selectAnotherFile}`)
            continue
          }
        }

        const tabTitle = result.convertedFromJasper
          ? 'Converted Template'
          : result.path.split(/[/\\]/).pop() || loadedTemplate.metadata?.name || 'Opened Template'

        if (!result.convertedFromJasper && result.path) {
          useRecentFilesStore.getState().addRecentFile(result.path, tabTitle)
        }

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
        const resolvedName = currentFilePath.split(/[/\\]/).pop() || 'template.json'
        useRecentFilesStore.getState().addRecentFile(currentFilePath, resolvedName)
        useTabStore.getState().updateActiveTab({
          path: currentFilePath,
          name: resolvedName,
          isDirty: false,
        })
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
      const resolvedName = result.split(/[/\\]/).pop() || fileName
      useRecentFilesStore.getState().addRecentFile(result, resolvedName)
      useTabStore.getState().updateActiveTab({
        path: result,
        name: resolvedName,
        isDirty: false,
      })
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
        openSettings()
        return
      }

      const templateJson = JSON.stringify(template)
      const { testData } = useTemplateStore.getState()
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

      const result = await window.electronAPI.generatePDF(templateJson, dataJson)

      if (result.success) {
        const openConfirm = confirm(t.pdf.generated)
        if (openConfirm && result.outputPath) {
          await window.electronAPI.openPDF(result.outputPath)
        }
      } else {
        if (result.cliNotInstalled) {
          await checkCLIStatus()
          openSettings()
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

  return {
    handleNew,
    handleOpen,
    handleSave,
    handleSaveAs,
    handleExport,
    handleGeneratePDF,
  }
}
