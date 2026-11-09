import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  openTemplateFromContent,
  handleImportJasper,
  saveCurrentTemplate,
  exportCurrentTemplate,
  setupIpcBridgeListeners,
} from './ipcBridgeListeners'
import { useTabStore } from '../store/tabStore'
import { useRecentFilesStore } from '../store/recentFilesStore'

describe('ipcBridgeListeners', () => {
  beforeEach(() => {
    useTabStore.setState({ tabs: [], activeTabId: null })
    useRecentFilesStore.setState({ recentFiles: [] })
    vi.clearAllMocks()
  })

  describe('openTemplateFromContent', () => {
    it('successfully loads a JSON template and registers in recent files', () => {
      const template = {
        metadata: { name: 'Invoice' },
        elements: [],
      }
      const success = openTemplateFromContent('/path/to/invoice.json', JSON.stringify(template))

      expect(success).toBe(true)
      const tabs = useTabStore.getState().tabs
      expect(tabs).toHaveLength(1)
      expect(tabs[0].name).toBe('invoice.json')
      expect(tabs[0].path).toBe('/path/to/invoice.json')
      expect(tabs[0].isDirty).toBe(false)

      const recentFiles = useRecentFilesStore.getState().recentFiles
      expect(recentFiles).toHaveLength(1)
      expect(recentFiles[0].path).toBe('/path/to/invoice.json')
    })

    it('loads a converted JRXML template, marks tab as dirty without saving to recentFiles', () => {
      const convertedJson = JSON.stringify({
        version: '1.0',
        pageSettings: { size: 'A4' },
        page: [{ type: 'static_text', id: 't1', value: 'Hello Jasper' }],
      })

      const success = openTemplateFromContent('report.jrxml', convertedJson)
      expect(success).toBe(true)

      const tabs = useTabStore.getState().tabs
      expect(tabs).toHaveLength(1)
      expect(tabs[0].name).toBe('report.json')
      expect(tabs[0].path).toBeNull()
      expect(tabs[0].isDirty).toBe(true)

      const recentFiles = useRecentFilesStore.getState().recentFiles
      expect(recentFiles).toHaveLength(0)
    })

    it('rejects raw XML without CLI conversion in openTemplateFromContent', () => {
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
      const jrxml = `<jasperReport name="Raw"><detail><band height="50"/></detail></jasperReport>`
      const success = openTemplateFromContent('raw.jrxml', jrxml)
      expect(success).toBe(false)
      expect(alertMock).toHaveBeenCalled()
      alertMock.mockRestore()
    })

    it('handles invalid template content with an alert and returns false', () => {
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
      const success = openTemplateFromContent('invalid.json', '{ invalid: JSON')

      expect(success).toBe(false)
      expect(alertMock).toHaveBeenCalled()
      expect(useTabStore.getState().tabs).toHaveLength(0)
      alertMock.mockRestore()
    })
  })

  describe('handleImportJasper', () => {
    it('imports JRXML via openJasperFile bridge', async () => {
      const convertedJson = JSON.stringify({
        version: '1.0',
        pageSettings: { size: 'A4' },
        page: [],
      })

      window.electronAPI = {
        ...window.electronAPI,
        openJasperFile: vi.fn().mockResolvedValue({ path: '/reports/imported.jrxml', content: convertedJson, convertedFromJasper: true }),
      } as any

      const success = await handleImportJasper()
      expect(success).toBe(true)

      const tabs = useTabStore.getState().tabs
      expect(tabs).toHaveLength(1)
      expect(tabs[0].name).toBe('imported.json')
    })

    it('returns false when dialog is canceled', async () => {
      window.electronAPI = {
        ...window.electronAPI,
        openJasperFile: vi.fn().mockResolvedValue(null),
      } as any

      const success = await handleImportJasper()
      expect(success).toBe(false)
      expect(useTabStore.getState().tabs).toHaveLength(0)
    })
  })

  describe('saveCurrentTemplate & exportCurrentTemplate', () => {
    it('calls saveFile on electronAPI', async () => {
      const saveMock = vi.fn().mockResolvedValue('saved.json')
      window.electronAPI = {
        ...window.electronAPI,
        saveFile: saveMock,
      } as any

      const result = await saveCurrentTemplate('{}', 'test.json')
      expect(result).toBe('saved.json')
      expect(saveMock).toHaveBeenCalledWith('{}', 'test.json')
    })

    it('calls generatePDF on electronAPI for export', async () => {
      const exportMock = vi.fn().mockResolvedValue({ success: true, outputPath: '/out.pdf' })
      window.electronAPI = {
        ...window.electronAPI,
        generatePDF: exportMock,
      } as any

      const result = await exportCurrentTemplate('{}', '{}', '/out.pdf')
      expect(result).toEqual({ success: true, outputPath: '/out.pdf' })
      expect(exportMock).toHaveBeenCalledWith('{}', '{}', '/out.pdf')
    })
  })

  describe('setupIpcBridgeListeners', () => {
    it('subscribes to onMenuSetLanguage if present', () => {
      const onMenuSetLanguageMock = vi.fn()
      window.electronAPI = {
        ...window.electronAPI,
        onMenuSetLanguage: onMenuSetLanguageMock,
      } as any

      setupIpcBridgeListeners()
      expect(onMenuSetLanguageMock).toHaveBeenCalled()
    })
  })
})
