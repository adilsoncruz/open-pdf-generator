import { useEffect } from 'react'
import { convertJrxmlToTemplate } from '../utils/jrxmlImporter'
import { useTabStore } from '../store/tabStore'
import { useRecentFilesStore } from '../store/recentFilesStore'
import { useI18nStore, AVAILABLE_LANGUAGES } from '../i18n'

/**
 * Parses and loads template content (JSON or JRXML) into a new tab in tabStore.
 */
export function openTemplateFromContent(filePath: string, content: string): boolean {
  try {
    let loadedTemplate: any
    const isJrxml =
      filePath.toLowerCase().endsWith('.jrxml') ||
      content.trim().startsWith('<?xml') ||
      content.includes('<jasperReport')

    if (isJrxml && !content.trim().startsWith('{')) {
      loadedTemplate = convertJrxmlToTemplate(content)
    } else {
      loadedTemplate = JSON.parse(content)
    }

    const fileName = filePath.split(/[/\\]/).pop() || 'Opened Template'
    if (!isJrxml) {
      useRecentFilesStore.getState().addRecentFile(filePath, fileName)
    }

    useTabStore.getState().addTab({
      name: isJrxml ? fileName.replace(/\.jrxml$/i, '.json') : fileName,
      path: isJrxml ? null : filePath,
      isDirty: isJrxml,
      stateSnapshot: {
        template: loadedTemplate,
        currentFilePath: isJrxml ? null : filePath,
        isDirty: isJrxml,
        history: [loadedTemplate],
        historyIndex: 0,
        selectedElementIds: [],
        selectedElementLocation: 'body',
        selectedGroupId: null,
        currentSection: 'body',
      },
    })
    return true
  } catch {
    window.alert('Não foi possível abrir este template. Verifique se o arquivo é um JSON ou JRXML válido.')
    return false
  }
}

/**
 * Prompts user to pick a Jasper report (.jrxml) and loads it into a new tab.
 */
export async function handleImportJasper(): Promise<boolean> {
  try {
    if (!window.electronAPI) return false

    const result = window.electronAPI.openJasperFile
      ? await window.electronAPI.openJasperFile()
      : await window.electronAPI.openFile()
    if (!result) return false

    let loadedTemplate: any
    if (result.content.trim().startsWith('{')) {
      loadedTemplate = JSON.parse(result.content)
    } else {
      loadedTemplate = convertJrxmlToTemplate(result.content)
    }

    const tabTitle = (result.path.split(/[/\\]/).pop() || 'jasper-template.jrxml').replace(/\.jrxml$/i, '.json')
    useTabStore.getState().addTab({
      name: tabTitle,
      path: null,
      isDirty: true,
      stateSnapshot: {
        template: loadedTemplate,
        currentFilePath: null,
        isDirty: true,
        history: [loadedTemplate],
        historyIndex: 0,
        selectedElementIds: [],
        selectedElementLocation: 'body',
        selectedGroupId: null,
        currentSection: 'body',
      },
    })
    return true
  } catch (err: unknown) {
    window.alert(`Falha ao converter JRXML: ${err instanceof Error ? err.message : String(err)}`)
    return false
  }
}

/**
 * Saves template content to disk via Electron dialog / FS bridge.
 */
export async function saveCurrentTemplate(content: string, defaultPath?: string): Promise<string | null> {
  if (typeof window === 'undefined' || !window.electronAPI) return null
  return await window.electronAPI.saveFile(content, defaultPath)
}

/**
 * Exports generated PDF via Electron CLI service bridge.
 */
export async function exportCurrentTemplate(
  templateJson: string,
  dataJson: string,
  outputPath?: string
) {
  if (typeof window === 'undefined' || !window.electronAPI) {
    return { success: false, error: 'electronAPI unavailable' }
  }
  return await window.electronAPI.generatePDF(templateJson, dataJson, outputPath)
}

/**
 * Sets up global IPC bridge listeners (e.g., native application menu language changes).
 */
export function setupIpcBridgeListeners(): () => void {
  if (typeof window === 'undefined' || !window.electronAPI) {
    return () => {}
  }

  if (window.electronAPI.onMenuSetLanguage) {
    window.electronAPI.onMenuSetLanguage((lang) => {
      if (lang in AVAILABLE_LANGUAGES) {
        useI18nStore.getState().setLanguage(lang as any)
      }
    })
  }

  return () => {}
}

/**
 * React hook to register global IPC event listeners on mount.
 */
export function useIpcBridgeListeners(): void {
  useEffect(() => {
    const cleanup = setupIpcBridgeListeners()
    return cleanup
  }, [])
}

