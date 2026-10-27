import { app, BrowserWindow } from 'electron'
import { createWindow } from './window/mainWindow'
import { registerIpcHandlers } from './ipc/registerIpcHandlers'

// Initialize app lifecycle and IPC handlers
app.whenReady().then(() => {
  createWindow()
  registerIpcHandlers()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
