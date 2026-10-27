import { app, BrowserWindow } from 'electron'
import * as path from 'path'
import { initAutoUpdater, checkForUpdates } from '../autoUpdater'
import { createMenu, setAppLanguage } from './menu'

let mainWindow: BrowserWindow | null = null

export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}

export function createWindow(): BrowserWindow {
  const isDev = !app.isPackaged || process.env.NODE_ENV === 'development'
  const resourcesPath = isDev
    ? path.join(__dirname, '..', '..', 'resources')
    : process.resourcesPath

  const iconPath =
    process.platform === 'darwin'
      ? path.join(resourcesPath, 'icon.icns')
      : process.platform === 'win32'
      ? path.join(resourcesPath, 'icon.ico')
      : path.join(resourcesPath, 'icon.png')

  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1200,
    minHeight: 800,
    icon: iconPath,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '..', 'preload.js'),
    },
    backgroundColor: '#0b0f19',
    title: 'Open PDF Template Studio',
  })

  const systemLocale = (app.getLocale() || '').toLowerCase()
  let initialLanguage = 'en'
  if (systemLocale.startsWith('pt')) {
    initialLanguage = 'pt'
  } else if (systemLocale.startsWith('es')) {
    initialLanguage = 'es'
  }
  setAppLanguage(initialLanguage)
  createMenu(getMainWindow, initialLanguage)

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
    mainWindow?.maximize()
    mainWindow?.focus()

    if (mainWindow) {
      initAutoUpdater(mainWindow)
      checkForUpdates()
    }
  })

  if (isDev) {
    const devPort = process.env.VITE_PORT || '5173'
    mainWindow.loadURL(`http://localhost:${devPort}`)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  return mainWindow
}
