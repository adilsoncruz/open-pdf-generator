import { describe, it, expect, beforeEach } from 'vitest'
import { useRecentFilesStore } from './recentFilesStore'

describe('recentFilesStore', () => {
  beforeEach(() => {
    useRecentFilesStore.setState({ recentFiles: [] })
  })

  it('adds, removes and clears recent files', () => {
    const { addRecentFile, removeRecentFile, clearRecentFiles } = useRecentFilesStore.getState()

    // Empty path is a no-op
    addRecentFile('')
    expect(useRecentFilesStore.getState().recentFiles.length).toBe(0)

    addRecentFile('/docs/invoice.json')
    expect(useRecentFilesStore.getState().recentFiles[0].name).toBe('invoice.json')

    addRecentFile('/docs/report.json', 'Custom Report')
    expect(useRecentFilesStore.getState().recentFiles[0].name).toBe('Custom Report')
    expect(useRecentFilesStore.getState().recentFiles.length).toBe(2)

    // Re-adding moves to top
    addRecentFile('/docs/invoice.json')
    expect(useRecentFilesStore.getState().recentFiles[0].path).toBe('/docs/invoice.json')
    expect(useRecentFilesStore.getState().recentFiles.length).toBe(2)

    removeRecentFile('/docs/invoice.json')
    expect(useRecentFilesStore.getState().recentFiles.length).toBe(1)

    clearRecentFiles()
    expect(useRecentFilesStore.getState().recentFiles.length).toBe(0)
  })
})
