import { Menu, BrowserWindow, MenuItemConstructorOptions } from 'electron'
import {
  currentAppLanguage,
  setAppLanguage,
  getMenuStrings,
} from './translations'
import { createFileMenu } from './fileMenu'
import { createEditMenu, createViewMenu, createWindowMenu } from './editViewMenu'
import { createHelpMenu } from './helpMenu'
import { createMacAppMenu, createLanguageMenu } from './appMenu'

export function buildMenuTemplate(
  getMainWindow: () => BrowserWindow | null,
  lang: string = currentAppLanguage,
  onLanguageChange: (newLang: string) => void = (newLang) => {
    setAppLanguage(newLang)
    createMenu(getMainWindow, newLang)
  }
): MenuItemConstructorOptions[] {
  const isMac = process.platform === 'darwin'
  const strings = getMenuStrings(lang)

  return [
    ...(isMac ? [createMacAppMenu()] : []),
    createFileMenu(getMainWindow, strings, isMac),
    createEditMenu(getMainWindow, strings),
    createViewMenu(strings),
    createLanguageMenu(getMainWindow, lang, strings, onLanguageChange),
    createWindowMenu(strings),
    createHelpMenu(getMainWindow, strings),
  ]
}

export function createMenu(
  getMainWindow: () => BrowserWindow | null,
  lang: string = currentAppLanguage
): Menu {
  const template = buildMenuTemplate(getMainWindow, lang)
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
  return menu
}
