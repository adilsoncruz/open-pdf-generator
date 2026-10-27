import { app, BrowserWindow } from 'electron'
import * as path from 'path'
import { createWindow } from './window/mainWindow'
import { registerIpcHandlers } from './ipc/registerIpcHandlers'

// Register all IPC handlers
registerIpcHandlers()

app.whenReady().then(() => {
  // Set dock icon on macOS
  if (process.platform === 'darwin') {
    const isDev = !app.isPackaged || process.env.NODE_ENV === 'development'
    const dockIcon = isDev
      ? path.join(__dirname, '..', '..', 'resources', 'icon.png')
      : path.join(process.resourcesPath, 'icon.png')

    try {
      app.dock?.setIcon(dockIcon)
    } catch (error) {
      console.warn('Could not load dock icon:', error)
    }
  }

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
