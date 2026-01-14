import { autoUpdater, UpdateInfo, ProgressInfo } from 'electron-updater'
import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import * as log from 'electron-log'

// Configure logging
autoUpdater.logger = log
log.transports.file.level = 'info'

// Disable auto-download (let user decide)
autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = true

interface UpdateStatus {
  checking: boolean
  available: boolean
  downloaded: boolean
  downloading: boolean
  error: string | null
  progress: number
  version: string | null
  releaseNotes: string | null
  releaseDate: string | null
}

let mainWindow: BrowserWindow | null = null
let handlersRegistered = false
let updateStatus: UpdateStatus = {
  checking: false,
  available: false,
  downloaded: false,
  downloading: false,
  error: null,
  progress: 0,
  version: null,
  releaseNotes: null,
  releaseDate: null
}

export function initAutoUpdater(window: BrowserWindow) {
  mainWindow = window

  // Event: Checking for updates
  autoUpdater.on('checking-for-update', () => {
    log.info('Checking for updates...')
    updateStatus = {
      ...updateStatus,
      checking: true,
      error: null
    }
    sendStatusToRenderer()
  })

  // Event: Update available
  autoUpdater.on('update-available', (info: UpdateInfo) => {
    log.info('Update available:', info.version)
    updateStatus = {
      ...updateStatus,
      checking: false,
      available: true,
      version: info.version,
      releaseNotes: typeof info.releaseNotes === 'string' 
        ? info.releaseNotes 
        : Array.isArray(info.releaseNotes) 
          ? info.releaseNotes.map(n => n.note).join('\n')
          : null,
      releaseDate: info.releaseDate || null
    }
    sendStatusToRenderer()
    
    // Notify user
    notifyUpdateAvailable(info)
  })

  // Event: No update available
  autoUpdater.on('update-not-available', () => {
    log.info('No update available')
    updateStatus = {
      ...updateStatus,
      checking: false,
      available: false
    }
    sendStatusToRenderer()
  })

  // Event: Error
  autoUpdater.on('error', (error: Error) => {
    log.error('Auto-updater error:', error)
    updateStatus = {
      ...updateStatus,
      checking: false,
      downloading: false,
      error: error.message
    }
    sendStatusToRenderer()
  })

  // Event: Download progress
  autoUpdater.on('download-progress', (progress: ProgressInfo) => {
    log.info(`Download: ${progress.percent.toFixed(1)}%`)
    updateStatus = {
      ...updateStatus,
      downloading: true,
      progress: progress.percent
    }
    sendStatusToRenderer()
  })

  // Event: Download complete
  autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
    log.info('Update downloaded:', info.version)
    updateStatus = {
      ...updateStatus,
      downloading: false,
      downloaded: true,
      progress: 100
    }
    sendStatusToRenderer()
    
    // Ask if user wants to restart
    notifyUpdateReady(info)
  })

  // Register IPC handlers
  registerIpcHandlers()
}

function sendStatusToRenderer() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update:status', updateStatus)
  }
}

async function notifyUpdateAvailable(info: UpdateInfo) {
  if (!mainWindow) return

  const result = await dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Update Available',
    message: 'A new version is available!',
    detail: `Version ${info.version} is available for download.\n\nCurrent version: ${app.getVersion()}\n\nWould you like to download now?`,
    buttons: ['Download Now', 'Later'],
    defaultId: 0,
    cancelId: 1
  })

  if (result.response === 0) {
    downloadUpdate()
  }
}

async function notifyUpdateReady(info: UpdateInfo) {
  if (!mainWindow) return

  const result = await dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Update Ready',
    message: 'Update ready to install!',
    detail: `Version ${info.version} has been downloaded and is ready to install.\n\nThe application will restart to complete the update.`,
    buttons: ['Restart Now', 'Later'],
    defaultId: 0,
    cancelId: 1
  })

  if (result.response === 0) {
    autoUpdater.quitAndInstall(false, true)
  }
}

function registerIpcHandlers() {
  // Prevent duplicate registration
  if (handlersRegistered) {
    return
  }
  handlersRegistered = true

  // Check for updates manually
  ipcMain.handle('update:check', async () => {
    try {
      const result = await autoUpdater.checkForUpdates()
      return { 
        success: true, 
        updateAvailable: result?.updateInfo?.version !== app.getVersion(),
        version: result?.updateInfo?.version 
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  })

  // Download update
  ipcMain.handle('update:download', async () => {
    try {
      await downloadUpdate()
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  })

  // Install update (restart app)
  ipcMain.handle('update:install', () => {
    autoUpdater.quitAndInstall(false, true)
  })

  // Get current status
  ipcMain.handle('update:getStatus', () => {
    return updateStatus
  })

  // Get current version
  ipcMain.handle('update:getCurrentVersion', () => {
    return app.getVersion()
  })
}

async function downloadUpdate() {
  updateStatus = {
    ...updateStatus,
    downloading: true,
    progress: 0
  }
  sendStatusToRenderer()
  
  await autoUpdater.downloadUpdate()
}

export function checkForUpdates() {
  // Only check in production
  if (!app.isPackaged) {
    log.info('Auto-update disabled in development')
    return
  }
  
  // Check for updates after 3 seconds of app start
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((error) => {
      log.error('Error checking for updates:', error)
    })
  }, 3000)
}
