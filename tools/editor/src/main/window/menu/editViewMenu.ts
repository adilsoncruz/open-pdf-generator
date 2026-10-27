import { app, BrowserWindow, MenuItemConstructorOptions } from 'electron'
import type { MenuTranslations } from './translations'

export function createEditMenu(
  getMainWindow: () => BrowserWindow | null,
  strings: MenuTranslations
): MenuItemConstructorOptions {
  return {
    label: strings.edit,
    submenu: [
      {
        label: strings.undo,
        accelerator: 'CmdOrCtrl+Z',
        click: () => {
          getMainWindow()?.webContents.send('menu:undo')
        },
      },
      {
        label: strings.redo,
        accelerator: 'CmdOrCtrl+Y',
        click: () => {
          getMainWindow()?.webContents.send('menu:redo')
        },
      },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectAll' },
      { type: 'separator' },
      {
        label: strings.copyElement,
        click: () => {
          getMainWindow()?.webContents.send('menu:copy')
        },
      },
      {
        label: strings.pasteElement,
        click: () => {
          getMainWindow()?.webContents.send('menu:paste')
        },
      },
      { type: 'separator' },
      {
        label: strings.deleteElement,
        accelerator: 'Delete',
        click: () => {
          getMainWindow()?.webContents.send('menu:delete')
        },
      },
    ],
  }
}

export function createViewMenu(strings: MenuTranslations): MenuItemConstructorOptions {
  return {
    label: strings.view,
    submenu: [
      ...((!app.isPackaged || process.env.NODE_ENV === 'development')
        ? [
            { role: 'reload' as const },
            { role: 'forceReload' as const },
            { role: 'toggleDevTools' as const },
            { type: 'separator' as const },
          ]
        : []),
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
    ],
  }
}

export function createWindowMenu(strings: MenuTranslations): MenuItemConstructorOptions {
  return {
    label: strings.window,
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'close' },
    ],
  }
}
