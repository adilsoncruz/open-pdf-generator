import { BrowserWindow, MenuItemConstructorOptions } from 'electron'
import type { MenuTranslations } from './translations'

export function createFileMenu(
  getMainWindow: () => BrowserWindow | null,
  strings: MenuTranslations,
  isMac: boolean = process.platform === 'darwin'
): MenuItemConstructorOptions {
  return {
    label: strings.file,
    submenu: [
      {
        label: strings.new,
        accelerator: 'CmdOrCtrl+N',
        click: () => {
          getMainWindow()?.webContents.send('menu:new')
        },
      },
      {
        label: strings.open,
        accelerator: 'CmdOrCtrl+O',
        click: () => {
          getMainWindow()?.webContents.send('menu:open')
        },
      },
      { type: 'separator' },
      {
        label: strings.save,
        accelerator: 'CmdOrCtrl+S',
        click: () => {
          getMainWindow()?.webContents.send('menu:save')
        },
      },
      {
        label: strings.saveAs,
        accelerator: 'CmdOrCtrl+Shift+S',
        click: () => {
          getMainWindow()?.webContents.send('menu:save-as')
        },
      },
      { type: 'separator' },
      {
        label: strings.export,
        click: () => {
          getMainWindow()?.webContents.send('menu:export')
        },
      },

      ...(isMac
        ? []
        : [
            { type: 'separator' as const },
            {
              label: strings.exit,
              accelerator: 'CmdOrCtrl+Q',
              role: 'quit' as const,
            },
          ]),
    ],
  }
}
