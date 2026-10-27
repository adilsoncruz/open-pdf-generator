import { app, dialog, shell, BrowserWindow, MenuItemConstructorOptions } from 'electron'
import type { MenuTranslations } from './translations'

export function createHelpMenu(
  getMainWindow: () => BrowserWindow | null,
  strings: MenuTranslations
): MenuItemConstructorOptions {
  return {
    label: strings.help,
    submenu: [
      {
        label: strings.documentation,
        click: () => {
          shell.openExternal('https://adilsoncruz.github.io/open-pdf-generator/')
        },
      },
      { type: 'separator' },
      {
        label: strings.reportIssue,
        click: () => {
          shell.openExternal('https://github.com/adilsoncruz/open-pdf-generator/issues')
        },
      },
      { type: 'separator' },
      {
        label: strings.checkForUpdates,
        click: () => {
          getMainWindow()?.webContents.send('menu:check-updates')
        },
      },
      { type: 'separator' },
      {
        label: strings.about,
        click: () => {
          const win = getMainWindow()
          if (win) {
            dialog.showMessageBox(win, {
              type: 'info',
              title: `${strings.about} PDF Template Editor`,
              message: 'PDF Template Editor',
              detail: `Version ${app.getVersion()}\n\n${strings.aboutDetail}\n\n© 2024`,
            })
          }
        },
      },
    ],
  }
}
