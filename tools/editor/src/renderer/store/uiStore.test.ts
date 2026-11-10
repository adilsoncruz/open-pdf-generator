import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from './uiStore'

describe('uiStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      theme: 'dark',
      zoom: 100,
      snapToGuides: true,
      sidebarTab: 'elements',
      contextMenu: null,
    })
  })

  it('handles theme toggling and setting', () => {
    const { setTheme, toggleTheme } = useUIStore.getState()
    setTheme('light')
    expect(useUIStore.getState().theme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    toggleTheme()
    expect(useUIStore.getState().theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    toggleTheme()
    expect(useUIStore.getState().theme).toBe('light')
  })

  it('handles zoom with bounds', () => {
    const { setZoom } = useUIStore.getState()
    setZoom(150)
    expect(useUIStore.getState().zoom).toBe(150)

    setZoom(10) // below min 25
    expect(useUIStore.getState().zoom).toBe(25)

    setZoom(500) // above max 300
    expect(useUIStore.getState().zoom).toBe(300)
  })

  it('handles sidebar tab and snap guides toggling', () => {
    const { setSidebarTab, toggleSnapToGuides } = useUIStore.getState()
    setSidebarTab('document')
    expect(useUIStore.getState().sidebarTab).toBe('document')

    toggleSnapToGuides()
    expect(useUIStore.getState().snapToGuides).toBe(false)
    toggleSnapToGuides()
    expect(useUIStore.getState().snapToGuides).toBe(true)
  })

  it('handles context menu opening and closing', () => {
    const { openContextMenu, closeContextMenu } = useUIStore.getState()
    openContextMenu({
      x: 100,
      y: 200,
      targetType: 'element',
      elementId: 'el-1',
    })
    expect(useUIStore.getState().contextMenu).toEqual({
      x: 100,
      y: 200,
      targetType: 'element',
      elementId: 'el-1',
    })

    closeContextMenu()
    expect(useUIStore.getState().contextMenu).toBeNull()
  })
})
