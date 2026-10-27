import { app, BrowserWindow, MenuItemConstructorOptions } from 'electron'
import type { MenuTranslations } from './translations'

export function createMacAppMenu(): MenuItemConstructorOptions {
  return {
    label: app.name,
    submenu: [
      { role: 'about' as const },
      { type: 'separator' as const },
      { role: 'services' as const },
      { type: 'separator' as const },
      { role: 'hide' as const },
      { role: 'hideOthers' as const },
      { role: 'unhide' as const },
      { type: 'separator' as const },
      { role: 'quit' as const },
    ],
  }
}

export function createLanguageMenu(
  getMainWindow: () => BrowserWindow | null,
  currentLang: string,
  strings: MenuTranslations,
  onLanguageSelect: (lang: string) => void
): MenuItemConstructorOptions {
  return {
    label: strings.language,
    submenu: [
      {
        label: 'English',
        type: 'radio',
        checked: currentLang === 'en',
        click: () => {
          onLanguageSelect('en')
          getMainWindow()?.webContents.send('menu:set-language', 'en')
        },
      },
      {
        label: 'Português',
        type: 'radio',
        checked: currentLang === 'pt',
        click: () => {
          onLanguageSelect('pt')
          getMainWindow()?.webContents.send('menu:set-language', 'pt')
        },
      },
      {
        label: 'Español',
        type: 'radio',
        checked: currentLang === 'es',
        click: () => {
          onLanguageSelect('es')
          getMainWindow()?.webContents.send('menu:set-language', 'es')
        },
      },
    ],
  }
}
