import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  currentAppLanguage,
  getAppLanguage,
  setAppLanguage,
  getMenuStrings,
  MENU_TRANSLATIONS,
} from './translations'
import { createFileMenu } from './fileMenu'
import { createEditMenu, createViewMenu, createWindowMenu } from './editViewMenu'
import { createHelpMenu } from './helpMenu'
import { createMacAppMenu, createLanguageMenu } from './appMenu'
import { buildMenuTemplate, createMenu } from './menu'
import * as legacyMenu from '../menu'

vi.mock('electron', () => {
  const sendMock = vi.fn()
  const mockWindow = {
    webContents: {
      send: sendMock,
    },
  }
  return {
    app: {
      name: 'Open PDF Template Studio',
      getVersion: () => '1.0.0',
      isPackaged: false,
    },
    shell: {
      openExternal: vi.fn(),
    },
    dialog: {
      showMessageBox: vi.fn(),
    },
    Menu: {
      buildFromTemplate: vi.fn((template) => ({ template })),
      setApplicationMenu: vi.fn(),
    },
    BrowserWindow: vi.fn(),
  }
})

describe('menu translations', () => {
  beforeEach(() => {
    setAppLanguage('en')
  })

  it('manages app language state', () => {
    expect(getAppLanguage()).toBe('en')
    setAppLanguage('pt')
    expect(getAppLanguage()).toBe('pt')
    setAppLanguage('es')
    expect(getAppLanguage()).toBe('es')
  })

  it('returns strings for supported languages and falls back to en', () => {
    expect(getMenuStrings('en').file).toBe('File')
    expect(getMenuStrings('pt').file).toBe('Arquivo')
    expect(getMenuStrings('es').file).toBe('Archivo')
    expect(getMenuStrings('unknown').file).toBe('File')
  })

  it('contains required action translations in all supported languages', () => {
    for (const lang of ['en', 'pt', 'es']) {
      const strings = MENU_TRANSLATIONS[lang]
      expect(strings.file).toBeDefined()
      expect(strings.new).toBeDefined()
      expect(strings.open).toBeDefined()
      expect(strings.save).toBeDefined()
      expect(strings.saveAs).toBeDefined()
      expect(strings.export).toBeDefined()
      expect(strings.importJasper).toBeDefined()
      expect(strings.importAi).toBeDefined()
      expect(strings.checkForUpdates).toBeDefined()
      expect(strings.undo).toBeDefined()
      expect(strings.redo).toBeDefined()
      expect(strings.about).toBeDefined()
    }
  })
})

describe('fileMenu', () => {
  it('creates file menu items and dispatches ipc messages on click', () => {
    const send = vi.fn()
    const getWin = () => ({ webContents: { send } } as any)
    const strings = getMenuStrings('en')

    const fileMenu = createFileMenu(getWin, strings, false)
    expect(fileMenu.label).toBe('File')
    const submenu = fileMenu.submenu as Electron.MenuItemConstructorOptions[]
    expect(submenu).toBeDefined()

    const newBtn = submenu.find((item) => item.label === strings.new)
    newBtn?.click?.({} as any, {} as any, {} as any)
    expect(send).toHaveBeenCalledWith('menu:new')

    const openBtn = submenu.find((item) => item.label === strings.open)
    openBtn?.click?.({} as any, {} as any, {} as any)
    expect(send).toHaveBeenCalledWith('menu:open')

    const saveBtn = submenu.find((item) => item.label === strings.save)
    saveBtn?.click?.({} as any, {} as any, {} as any)
    expect(send).toHaveBeenCalledWith('menu:save')

    const saveAsBtn = submenu.find((item) => item.label === strings.saveAs)
    saveAsBtn?.click?.({} as any, {} as any, {} as any)
    expect(send).toHaveBeenCalledWith('menu:save-as')

    const exportBtn = submenu.find((item) => item.label === strings.export)
    exportBtn?.click?.({} as any, {} as any, {} as any)
    expect(send).toHaveBeenCalledWith('menu:export')

    const jasperBtn = submenu.find((item) => item.label === strings.importJasper)
    jasperBtn?.click?.({} as any, {} as any, {} as any)
    expect(send).toHaveBeenCalledWith('menu:import-jasper')

    const aiBtn = submenu.find((item) => item.label === strings.importAi)
    aiBtn?.click?.({} as any, {} as any, {} as any)
    expect(send).toHaveBeenCalledWith('menu:import-ai')

    const exitBtn = submenu.find((item) => item.label === strings.exit)
    expect(exitBtn).toBeDefined()
    expect(exitBtn?.role).toBe('quit')
  })

  it('omits exit button on macOS', () => {
    const getWin = () => null
    const strings = getMenuStrings('en')
    const fileMenu = createFileMenu(getWin, strings, true)
    const submenu = fileMenu.submenu as Electron.MenuItemConstructorOptions[]
    const exitBtn = submenu.find((item) => item.label === strings.exit)
    expect(exitBtn).toBeUndefined()
  })
})

describe('editViewMenu', () => {
  it('creates edit menu with undo, redo, copy, paste and element handlers', () => {
    const send = vi.fn()
    const getWin = () => ({ webContents: { send } } as any)
    const strings = getMenuStrings('en')

    const editMenu = createEditMenu(getWin, strings)
    expect(editMenu.label).toBe('Edit')
    const submenu = editMenu.submenu as Electron.MenuItemConstructorOptions[]

    const undoBtn = submenu.find((item) => item.label === strings.undo)
    undoBtn?.click?.({} as any, {} as any, {} as any)
    expect(send).toHaveBeenCalledWith('menu:undo')

    const redoBtn = submenu.find((item) => item.label === strings.redo)
    redoBtn?.click?.({} as any, {} as any, {} as any)
    expect(send).toHaveBeenCalledWith('menu:redo')

    const copyElemBtn = submenu.find((item) => item.label === strings.copyElement)
    copyElemBtn?.click?.({} as any, {} as any, {} as any)
    expect(send).toHaveBeenCalledWith('menu:copy')

    const pasteElemBtn = submenu.find((item) => item.label === strings.pasteElement)
    pasteElemBtn?.click?.({} as any, {} as any, {} as any)
    expect(send).toHaveBeenCalledWith('menu:paste')

    const deleteElemBtn = submenu.find((item) => item.label === strings.deleteElement)
    deleteElemBtn?.click?.({} as any, {} as any, {} as any)
    expect(send).toHaveBeenCalledWith('menu:delete')
  })

  it('creates view menu with devtools and zoom', () => {
    const strings = getMenuStrings('en')
    const viewMenu = createViewMenu(strings)
    expect(viewMenu.label).toBe('View')
    const submenu = viewMenu.submenu as Electron.MenuItemConstructorOptions[]
    expect(submenu.some((item) => item.role === 'resetZoom')).toBe(true)
    expect(submenu.some((item) => item.role === 'zoomIn')).toBe(true)
    expect(submenu.some((item) => item.role === 'zoomOut')).toBe(true)
    expect(submenu.some((item) => item.role === 'togglefullscreen')).toBe(true)
  })

  it('creates window menu with standard window controls', () => {
    const strings = getMenuStrings('en')
    const winMenu = createWindowMenu(strings)
    expect(winMenu.label).toBe('Window')
    const submenu = winMenu.submenu as Electron.MenuItemConstructorOptions[]
    expect(submenu.some((item) => item.role === 'minimize')).toBe(true)
    expect(submenu.some((item) => item.role === 'close')).toBe(true)
  })
})

describe('helpMenu', () => {
  it('handles documentation, issue report, check updates and about', async () => {
    const { shell, dialog } = await import('electron')
    const send = vi.fn()
    const getWin = () => ({ webContents: { send } } as any)
    const strings = getMenuStrings('en')

    const helpMenu = createHelpMenu(getWin, strings)
    expect(helpMenu.label).toBe('Help')
    const submenu = helpMenu.submenu as Electron.MenuItemConstructorOptions[]

    const docBtn = submenu.find((item) => item.label === strings.documentation)
    docBtn?.click?.({} as any, {} as any, {} as any)
    expect(shell.openExternal).toHaveBeenCalledWith('https://adilsoncruz.github.io/open-pdf-generator/')

    const issueBtn = submenu.find((item) => item.label === strings.reportIssue)
    issueBtn?.click?.({} as any, {} as any, {} as any)
    expect(shell.openExternal).toHaveBeenCalledWith('https://github.com/adilsoncruz/open-pdf-generator/issues')

    const updateBtn = submenu.find((item) => item.label === strings.checkForUpdates)
    updateBtn?.click?.({} as any, {} as any, {} as any)
    expect(send).toHaveBeenCalledWith('menu:check-updates')

    const aboutBtn = submenu.find((item) => item.label === strings.about)
    aboutBtn?.click?.({} as any, {} as any, {} as any)
    expect(dialog.showMessageBox).toHaveBeenCalled()
  })
})

describe('appMenu and languageMenu', () => {
  it('creates mac app menu with about and quit roles', () => {
    const macMenu = createMacAppMenu()
    expect(macMenu.label).toBe('Open PDF Template Studio')
    const submenu = macMenu.submenu as Electron.MenuItemConstructorOptions[]
    expect(submenu.some((item) => item.role === 'quit')).toBe(true)
  })

  it('creates language menu with options and triggers callback and ipc', () => {
    const send = vi.fn()
    const getWin = () => ({ webContents: { send } } as any)
    const onSelect = vi.fn()
    const strings = getMenuStrings('en')

    const langMenu = createLanguageMenu(getWin, 'en', strings, onSelect)
    expect(langMenu.label).toBe('Language')
    const submenu = langMenu.submenu as Electron.MenuItemConstructorOptions[]

    const ptOption = submenu.find((item) => item.label === 'Português')
    ptOption?.click?.({} as any, {} as any, {} as any)
    expect(onSelect).toHaveBeenCalledWith('pt')
    expect(send).toHaveBeenCalledWith('menu:set-language', 'pt')
  })
})

describe('menu orchestrator and legacy export', () => {
  it('builds full menu template and creates electron application menu', async () => {
    const { Menu } = await import('electron')
    const getWin = () => null

    const template = buildMenuTemplate(getWin, 'en')
    expect(template.length).toBeGreaterThanOrEqual(6)

    const menu = createMenu(getWin, 'en')
    expect(Menu.buildFromTemplate).toHaveBeenCalled()
    expect(Menu.setApplicationMenu).toHaveBeenCalledWith(menu)
  })

  it('re-exports functions from legacy menu.ts for 100% backward compatibility', () => {
    expect(legacyMenu.createMenu).toBeDefined()
    expect(legacyMenu.getAppLanguage).toBeDefined()
    expect(legacyMenu.setAppLanguage).toBeDefined()
    expect(legacyMenu.MENU_TRANSLATIONS).toBeDefined()
    expect(legacyMenu.createFileMenu).toBeDefined()
    expect(legacyMenu.createEditMenu).toBeDefined()
    expect(legacyMenu.createHelpMenu).toBeDefined()
  })
})
