import { app, BrowserWindow, ipcMain, dialog, Menu, shell } from 'electron'
import * as path from 'path'
import * as fs from 'fs/promises'
import * as fsSync from 'fs'
import { spawn, execSync } from 'child_process'
import * as os from 'os'
import * as https from 'https'
import * as http from 'http'
import { initAutoUpdater, checkForUpdates } from './autoUpdater'

let mainWindow: BrowserWindow | null = null

// ============ CLI Management ============

function resolveProjectRootDir(): string {
  const candidates = [
    process.cwd(),
    path.join(__dirname, '..', '..', '..'),
    path.join(__dirname, '..', '..', '..', '..'),
    path.join(__dirname, '..', '..', '..', '..', '..'),
  ]

  for (const candidate of candidates) {
    if (
      fsSync.existsSync(path.join(candidate, 'core', 'build.gradle.kts')) &&
      fsSync.existsSync(path.join(candidate, 'tools', 'cli', 'build.gradle.kts'))
    ) {
      return candidate
    }
  }

  return process.cwd()
}

const PROJECT_ROOT_DIR = resolveProjectRootDir()
const DEFAULT_CLI_VERSION = '1.0.0'

function readGradleVersionSync(gradleFilePath: string): string | null {
  try {
    const content = fsSync.readFileSync(gradleFilePath, 'utf-8')
    const match = content.match(/version\s*=\s*\"([^\"]+)\"/)
    return match?.[1] || null
  } catch {
    return null
  }
}

const CLI_VERSION =
  readGradleVersionSync(path.join(PROJECT_ROOT_DIR, 'tools', 'cli', 'build.gradle.kts')) || DEFAULT_CLI_VERSION
const CLI_DIR = path.join(os.homedir(), '.pdf-generator')
const CLI_JAR_PATH = path.join(CLI_DIR, 'pdf-generator.jar')
const CLI_VERSION_FILE = path.join(CLI_DIR, 'version.txt')

const CLI_DOWNLOAD_URL = `https://github.com/adilsoncruz/open-pdf-generator/releases/download/v${CLI_VERSION}/open-pdf-generator-${CLI_VERSION}.jar`

interface CLIStatus {
  installed: boolean
  version: string | null
  jarPath: string
  needsUpdate: boolean
  javaInstalled: boolean
  javaVersion: string | null
  javaPath: string | null
}

interface VersionInfo {
  editor: string
  core: string | null
  cli: string | null
}


async function findLatestLocalCliJar(): Promise<string | null> {
  const cliBuildDir = path.join(PROJECT_ROOT_DIR, 'tools', 'cli', 'build', 'libs')

  try {
    const files = await fs.readdir(cliBuildDir)
    const jarCandidates = files
      .filter(file => file.endsWith('.jar'))
      .filter(file => !file.includes('sources') && !file.includes('javadoc'))
      .filter(file =>
        file.startsWith('pdf-generator-cli-') ||
        file.startsWith('open-pdf-generator-'),
      )

    if (jarCandidates.length === 0) return null

    jarCandidates.sort((a, b) =>
      b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }),
    )

    return path.join(cliBuildDir, jarCandidates[0])
  } catch {
    return null
  }
}

interface OpenFileResult {
  path: string
  content: string
  convertedFromJasper?: boolean
}

/**
 * Caminhos comuns do Java no macOS
 */
const JAVA_PATHS = [
  '/usr/bin/java',
  '/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home/bin/java',
  '/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home/bin/java',
  '/Library/Java/JavaVirtualMachines/openjdk-17.jdk/Contents/Home/bin/java',
  '/Library/Java/JavaVirtualMachines/openjdk-21.jdk/Contents/Home/bin/java',
  '/opt/homebrew/opt/openjdk/bin/java',
  '/opt/homebrew/opt/openjdk@17/bin/java',
  '/opt/homebrew/opt/openjdk@21/bin/java',
  '/usr/local/opt/openjdk/bin/java',
  '/usr/local/opt/openjdk@17/bin/java',
  '/usr/local/opt/openjdk@21/bin/java',
]

let cachedJavaPath: string | null = null

async function findJavaPath(): Promise<string | null> {
  if (cachedJavaPath) return cachedJavaPath
  
  const javaHome = process.env.JAVA_HOME
  if (javaHome) {
    const javaPath = path.join(javaHome, 'bin', 'java')
    try {
      await fs.access(javaPath)
      cachedJavaPath = javaPath
      return javaPath
    } catch {
      // JAVA_HOME is not valid, continue searching
    }
  }
  
  for (const javaPath of JAVA_PATHS) {
    try {
      await fs.access(javaPath)
      cachedJavaPath = javaPath
      return javaPath
    } catch {
      // Continua procurando
    }
  }
  
  try {
    const javaHomePath = execSync('/usr/libexec/java_home 2>/dev/null', { encoding: 'utf-8' }).trim()
    if (javaHomePath) {
      const javaPath = path.join(javaHomePath, 'bin', 'java')
      try {
        await fs.access(javaPath)
        cachedJavaPath = javaPath
        return javaPath
      } catch {
        // java_home returned invalid path
      }
    }
  } catch {
    // java_home not available
  }
  
  // Last attempt: use 'java' directly (works in dev)
  try {
    execSync('java -version 2>&1', { encoding: 'utf-8' })
    cachedJavaPath = 'java'
    return 'java'
  } catch {
    // Java not found
  }
  
  return null
}

/**
 * Checks if Java is installed and returns the version
 */
async function checkJavaInstalled(): Promise<{ installed: boolean; version: string | null; javaPath: string | null }> {
  const javaPath = await findJavaPath()
  
  if (!javaPath) {
    return { installed: false, version: null, javaPath: null }
  }
  
  try {
    const output = execSync(`"${javaPath}" -version 2>&1`, { encoding: 'utf-8' })
    const match = output.match(/version "([^"]+)"/) || output.match(/version (\S+)/)
    return {
      installed: true,
      version: match ? match[1] : 'unknown',
      javaPath
    }
  } catch {
    return { installed: false, version: null, javaPath: null }
  }
}

/**
 * Verifica o status do CLI
 */
async function checkCLIStatus(): Promise<CLIStatus> {
  const javaCheck = await checkJavaInstalled()
  
  try {
    await fs.access(CLI_JAR_PATH)
    
    let installedVersion: string | null = null
    try {
      installedVersion = (await fs.readFile(CLI_VERSION_FILE, 'utf-8')).trim()
    } catch {
      installedVersion = 'unknown'
    }
    
    return {
      installed: true,
      version: installedVersion,
      jarPath: CLI_JAR_PATH,
      needsUpdate: installedVersion !== CLI_VERSION,
      javaInstalled: javaCheck.installed,
      javaVersion: javaCheck.version,
      javaPath: javaCheck.javaPath
    }
  } catch {
    return {
      installed: false,
      version: null,
      jarPath: CLI_JAR_PATH,
      needsUpdate: false,
      javaInstalled: javaCheck.installed,
      javaVersion: javaCheck.version,
      javaPath: javaCheck.javaPath
    }
  }
}

/**
 * Instala o CLI a partir de uma fonte local ou URL
 */
async function installCLI(source?: string): Promise<{ success: boolean; error?: string; errorCode?: string }> {
  try {
    // Create directory if it doesn't exist
    await fs.mkdir(CLI_DIR, { recursive: true })
    let selectedJarPath: string | null = source || null

    if (source) {
      // Copiar de um arquivo local
      await fs.copyFile(source, CLI_JAR_PATH)
    } else {
      // Try to find the JAR in the app resources directory (fallback for dev)
      const isDev = !app.isPackaged || process.env.NODE_ENV === 'development'
      let fallbackJar: string | null = null
      
      if (isDev) {
        const resourcesJar = path.join(__dirname, '..', '..', 'resources', 'pdf-generator.jar')
        fallbackJar = await findLatestLocalCliJar()

        if (!fallbackJar) {
          try {
            await fs.access(resourcesJar)
            fallbackJar = resourcesJar
          } catch {
            // Nenhum JAR encontrado localmente
          }
        }
      }
      
      if (fallbackJar) {
        console.log(`📦 Instalando CLI de: ${fallbackJar}`)
        await fs.copyFile(fallbackJar, CLI_JAR_PATH)
        selectedJarPath = fallbackJar
      } else {
        // Tentar baixar da URL
        return await downloadCLI(CLI_DOWNLOAD_URL)
      }
    }
    
    // Save version
    const installedVersionFromJarPath = selectedJarPath?.match(/(?:pdf-generator-cli|open-pdf-generator)-(.+)\.jar$/)?.[1]
    await fs.writeFile(CLI_VERSION_FILE, installedVersionFromJarPath || CLI_VERSION)
    
    console.log(`✅ CLI instalado com sucesso em: ${CLI_JAR_PATH}`)
    return { success: true }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error(`❌ Erro ao instalar CLI: ${errorMsg}`)
    return { success: false, error: errorMsg }
  }
}

async function ensureCLIReady(): Promise<{ ok: true; status: CLIStatus } | { ok: false; error: { success: false; errorCode: string; cliNotInstalled?: boolean; javaNotInstalled?: boolean } }> {
  let cliStatus = await checkCLIStatus()

  if (!cliStatus.javaInstalled) {
    return {
      ok: false,
      error: {
        success: false,
        errorCode: 'JAVA_NOT_INSTALLED',
        javaNotInstalled: true,
      },
    }
  }

  if (!cliStatus.installed || cliStatus.needsUpdate) {
    const wasInstalledBeforeUpdate = cliStatus.installed
    const installResult = await installCLI()
    if (!installResult.success) {
      if (wasInstalledBeforeUpdate) {
        console.warn('⚠️ CLI update failed, continuing with currently installed CLI.')
        return { ok: true, status: cliStatus }
      }

      return {
        ok: false,
        error: {
          success: false,
          errorCode: 'CLI_NOT_INSTALLED',
          cliNotInstalled: true,
        },
      }
    }

    cliStatus = await checkCLIStatus()
  }

  if (!cliStatus.installed) {
    return {
      ok: false,
      error: {
        success: false,
        errorCode: 'CLI_NOT_INSTALLED',
        cliNotInstalled: true,
      },
    }
  }

  return { ok: true, status: cliStatus }
}

/**
 * Baixa o CLI de uma URL
 */
async function downloadCLI(url: string): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    console.log(`📥 Baixando CLI de: ${url}`)
    
    const protocol = url.startsWith('https') ? https : http
    
    const request = protocol.get(url, (response) => {
      // Seguir redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location
        if (redirectUrl) {
          downloadCLI(redirectUrl).then(resolve)
          return
        }
      }
      
      if (response.statusCode !== 200) {
        resolve({ 
          success: false, 
          error: `Erro ao baixar CLI: HTTP ${response.statusCode}` 
        })
        return
      }
      
      const chunks: Buffer[] = []
      response.on('data', (chunk) => chunks.push(chunk))
      response.on('end', async () => {
        try {
          const data = Buffer.concat(chunks)
          await fs.writeFile(CLI_JAR_PATH, data)
          await fs.writeFile(CLI_VERSION_FILE, CLI_VERSION)
          console.log(`✅ CLI baixado com sucesso: ${CLI_JAR_PATH}`)
          resolve({ success: true })
        } catch (error) {
          resolve({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Erro ao salvar arquivo' 
          })
        }
      })
    })
    
    request.on('error', (error) => {
      resolve({ 
        success: false, 
        error: `Erro de rede: ${error.message}` 
      })
    })
    
    request.setTimeout(30000, () => {
      request.destroy()
      resolve({ success: false, error: 'Timeout ao baixar CLI' })
    })
  })
}

/**
 * Install CLI from a file selected by the user
 */
async function installCLIFromFile(): Promise<{ success: boolean; error?: string; errorCode?: string }> {
  if (!mainWindow) {
    return { success: false, errorCode: ErrorCodes.MAIN_WINDOW_NOT_FOUND }
  }
  
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select PDF Generator CLI JAR',
    properties: ['openFile'],
    filters: [
      { name: 'JAR Files', extensions: ['jar'] }
    ]
  })
  
  if (result.canceled || result.filePaths.length === 0) {
    return { success: false, errorCode: ErrorCodes.OPERATION_CANCELLED }
  }
  
  return await installCLI(result.filePaths[0])
}

async function readGradleProjectVersion(gradleFilePath: string): Promise<string | null> {
  try {
    const content = await fs.readFile(gradleFilePath, 'utf-8')
    const match = content.match(/version\s*=\s*\"([^\"]+)\"/)
    return match?.[1] || null
  } catch {
    return null
  }
}

async function readJarVersionFromBuildLibs(
  libsDir: string,
  prefixes: string[],
): Promise<string | null> {
  try {
    const files = await fs.readdir(libsDir)
    const candidates =
      files
        .map(file => {
          const matchedPrefix = prefixes.find(prefix => file.startsWith(`${prefix}-`) && file.endsWith('.jar'))
          if (!matchedPrefix) return null

          const match = file.match(new RegExp(`^${matchedPrefix}-(.+)\\.jar$`))
          return match ? { file, version: match[1] } : null
        })
        .filter((item): item is { file: string; version: string } => item !== null)
        .filter(item => !item.file.includes('sources') && !item.file.includes('javadoc'))

    if (candidates.length === 0) {
      return null
    }

    candidates.sort((a, b) =>
      b.version.localeCompare(a.version, undefined, { numeric: true, sensitivity: 'base' }),
    )

    return candidates[0].version
  } catch {
    return null
  }
}

function createMenu() {
  const isMac = process.platform === 'darwin'
  
  const template: Electron.MenuItemConstructorOptions[] = [
    // App menu (macOS only)
    ...(isMac ? [{
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
        { role: 'quit' as const }
      ]
    }] : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow?.webContents.send('menu:new')
          }
        },
        {
          label: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow?.webContents.send('menu:open')
          }
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow?.webContents.send('menu:save')
          }
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            mainWindow?.webContents.send('menu:save-as')
          }
        },
        { type: 'separator' },
        {
          label: 'Export PDF...',
          click: () => {
            mainWindow?.webContents.send('menu:export')
          }
        },
        { type: 'separator' },
        ...(isMac ? [] : [{
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          role: 'quit' as const
        }])
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          click: () => {
            mainWindow?.webContents.send('menu:undo')
          }
        },
        {
          label: 'Redo',
          accelerator: 'CmdOrCtrl+Y',
          click: () => {
            mainWindow?.webContents.send('menu:redo')
          }
        },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Copy Element',
          click: () => {
            mainWindow?.webContents.send('menu:copy')
          }
        },
        {
          label: 'Paste Element',
          click: () => {
            mainWindow?.webContents.send('menu:paste')
          }
        },
        { type: 'separator' },
        {
          label: 'Delete Element',
          accelerator: 'Delete',
          click: () => {
            mainWindow?.webContents.send('menu:delete')
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        // Dev tools only in development
        ...((!app.isPackaged || process.env.NODE_ENV === 'development') ? [
          { role: 'reload' as const },
          { role: 'forceReload' as const },
          { role: 'toggleDevTools' as const },
          { type: 'separator' as const },
        ] : []),
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: () => {
            shell.openExternal('https://adilsoncruz.github.io/open-pdf-generator/')
          }
        },
        { type: 'separator' },
        {
          label: 'Report Issue',
          click: () => {
            shell.openExternal('https://github.com/adilsoncruz/open-pdf-generator/issues')
          }
        },
        { type: 'separator' },
        {
          label: 'About',
          click: () => {
            if (mainWindow) {
              dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'About PDF Template Editor',
                message: 'PDF Template Editor',
                detail: `Version ${app.getVersion()}\n\nVisual editor for PDF template generation.\n\n© 2024`
              })
            }
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function createWindow() {
  // Determine icon path based on platform
  const isDev = !app.isPackaged || process.env.NODE_ENV === 'development'
  const resourcesPath = isDev
    ? path.join(__dirname, '..', '..', 'resources') // Em dev: dist/main -> desktop-app/resources
    : process.resourcesPath // Em prod: app.asar/resources
  
  const iconPath = process.platform === 'darwin'
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
    show: false, // Don't show until ready
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    backgroundColor: '#0b0f19',
    title: 'Open PDF Template Studio',
  })
  
  createMenu()

  // Quando a janela estiver pronta para mostrar
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
    mainWindow?.maximize()
    mainWindow?.focus()
    
    // Inicializar auto-updater
    if (mainWindow) {
      initAutoUpdater(mainWindow)
      checkForUpdates()
    }
  })

  // Em desenvolvimento, carrega do Vite dev server
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    // DevTools starts closed in dev, can be opened via View menu (Cmd+Option+I)
  } else {
    // In production, load from build
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  // Set dock icon on macOS
  if (process.platform === 'darwin') {
    const isDev = !app.isPackaged || process.env.NODE_ENV === 'development'
    const dockIcon = isDev
      ? path.join(__dirname, '..', '..', 'resources', 'icon.png') // Em dev: dist/main -> desktop-app/resources
      : path.join(process.resourcesPath, 'icon.png') // Em prod: app.asar/resources
    
    try {
      app.dock?.setIcon(dockIcon)
    } catch (error) {
      console.warn('Could not load dock icon:', error)
    }
  }
  
  // Criar janela principal (em background)
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

// IPC Handlers

// Abrir arquivo
ipcMain.handle('dialog:openFile', async () => {
  if (!mainWindow) return null
  console.log("dialog:openFile")
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'JSON Templates', extensions: ['json'] },
      { name: 'Jasper Templates', extensions: ['jrxml'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  })
  console.log("dialog:openFile: result")
  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  const filePath = result.filePaths[0]
  const extension = path.extname(filePath).toLowerCase()
  console.log(`dialog:openFile: extension ${extension}`)

  if (extension === '.jrxml') {
    const conversion = await convertJrxmlToJson(filePath)
    console.log(`dialog:openFile:conversion - ${conversion.content}`)
    console.log(`dialog:openfile: conversion success ${conversion.success}`)
    if (!conversion.success || !conversion.content) {
      throw new Error(conversion.error || 'Failed to convert JRXML template')
    }
    console.log(`dialog:openFile:conversion success`)
    fs.writeFile(filePath.replace("jrxml", "json"), conversion.content)
    const openResult: OpenFileResult = {
      path: filePath.replace("jrxml", "json"),
      content: conversion.content,
      convertedFromJasper: true,
    }
    return openResult
  }
  console.log(`dialog:openFile:read file ${filePath}`)
  const content = await fs.readFile(filePath, 'utf-8')
 console.log(`dialog:openFile:read file success`)
  return {
    path: filePath,
    content,
  } as OpenFileResult
})

// Abrir arquivo de dados JSON
ipcMain.handle('dialog:openDataFile', async () => {
  if (!mainWindow) return null

  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'JSON Data Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] },
    ],
    title: 'Selecionar Arquivo de Dados JSON',
  })

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  const filePath = result.filePaths[0]
  const content = await fs.readFile(filePath, 'utf-8')

  return {
    path: filePath,
    content,
  }
})

// Salvar arquivo
ipcMain.handle('dialog:saveFile', async (_, content: string, defaultPath?: string) => {
  if (!mainWindow) return null

  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath,
    filters: [
      { name: 'JSON Templates', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  })

  if (result.canceled || !result.filePath) {
    return null
  }

  await fs.writeFile(result.filePath, content, 'utf-8')

  return result.filePath
})

// Ler arquivo
ipcMain.handle('fs:readFile', async (_, filePath: string) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return { success: true, content }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

// Escrever arquivo
ipcMain.handle('fs:writeFile', async (_, filePath: string, content: string) => {
  try {
    await fs.writeFile(filePath, content, 'utf-8')
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

// ============ CLI IPC Handlers ============

// Verificar status do CLI
ipcMain.handle('cli:status', async () => {
  return await checkCLIStatus()
})

// Instalar CLI automaticamente
ipcMain.handle('cli:install', async () => {
  return await installCLI()
})

// Instalar CLI a partir de arquivo selecionado
ipcMain.handle('cli:installFromFile', async () => {
  return await installCLIFromFile()
})

// Get installation directory path
ipcMain.handle('cli:getInstallPath', () => {
  return CLI_DIR
})

ipcMain.handle('app:getVersions', async (): Promise<VersionInfo> => {
  const editorVersion = app.getVersion()
  const coreVersionFromJar = await readJarVersionFromBuildLibs(
    path.join(PROJECT_ROOT_DIR, 'core', 'build', 'libs'),
    ['open-pdf-generator'],
  )
  const cliVersionFromJar = await readJarVersionFromBuildLibs(
    path.join(PROJECT_ROOT_DIR, 'tools', 'cli', 'build', 'libs'),
    ['pdf-generator-cli', 'open-pdf-generator'],
  )

  const coreVersion =
    coreVersionFromJar ||
    (await readGradleProjectVersion(path.join(PROJECT_ROOT_DIR, 'core', 'build.gradle.kts')))
  const cliVersion =
    cliVersionFromJar ||
    (await readGradleProjectVersion(path.join(PROJECT_ROOT_DIR, 'tools', 'cli', 'build.gradle.kts')))

  return {
    editor: editorVersion,
    core: coreVersion,
    cli: cliVersion,
  }
})

// Gerar PDF e retornar como base64 (para preview)
// Error codes for i18n translation in renderer
const ErrorCodes = {
  JAVA_NOT_INSTALLED: 'JAVA_NOT_INSTALLED',
  CLI_NOT_INSTALLED: 'CLI_NOT_INSTALLED',
  ERROR_READING_PDF: 'ERROR_READING_PDF',
  ERROR_GENERATING_PDF: 'ERROR_GENERATING_PDF',
  ERROR_EXECUTING_JAVA: 'ERROR_EXECUTING_JAVA',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  MAIN_WINDOW_NOT_FOUND: 'MAIN_WINDOW_NOT_FOUND',
  OPERATION_CANCELLED: 'OPERATION_CANCELLED',
} as const

async function convertJrxmlToJson(filePath: string): Promise<{ success: boolean; content?: string; error?: string; errorCode?: string }> {
  const cliStatus = await checkCLIStatus()

  console.log(cliStatus)

  if (!cliStatus.javaInstalled) {
    return { success: false, errorCode: ErrorCodes.JAVA_NOT_INSTALLED, error: 'Java not installed' }
  }

  if (!cliStatus.installed) {
    return { success: false, errorCode: ErrorCodes.CLI_NOT_INSTALLED, error: 'CLI not installed' }
  }

  const javaPath = cliStatus.javaPath || 'java'

  const runConvertCommand = (filePath: string) =>
    new Promise<{ success: boolean; stdout: string; stderr: string; spawnError?: string }>((resolve) => {
      const java = spawn(javaPath, [
                    '-jar',
                    CLI_JAR_PATH,
                    'convert',
                    filePath,
                    '--stdout',
                  ])
      let stdout = ''
      let stderr = ''

      java.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      java.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      java.on('close', (code) => {
        resolve({ success: code === 0, stdout, stderr })
      })

      java.on('error', (error) => {
          console.log(`error: ${error.message}`)
        resolve({ success: false, stdout, stderr, spawnError: error.message })
      })
    })

  // Fluxo principal para CLIs mais novos.
  console.log(`convert ${filePath}`)
  const stdoutResult = await runConvertCommand(filePath)
  console.log(`CLI convert error ${stdoutResult.spawnError}`)
  console.log(`CLI convert error ${stdoutResult.stderr}`)
  console.log(`CLI convert result ${stdoutResult.stdout}`)
  if (stdoutResult.success) {
    return { success: true, content: stdoutResult.stdout }
  }

  // Fallback para CLIs antigos (sem --stdout) ou variantes de opções.
  let tmpDir: string | null = null
  try {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'jrxml-convert-'))
    const outputPath = path.join(tmpDir, `${path.basename(filePath, path.extname(filePath))}.json`)

    let fileResult = await runConvertCommand(filePath)
    console.log(`CLI convert fileResult error ${fileResult.spawnError}`)
      console.log(`CLI convert fileResult error ${fileResult.stderr}`)
    if (!fileResult.success) {
      const fallbackError = (fileResult.spawnError || `${fileResult.stderr}\n${fileResult.stdout}`).trim()
      const stdoutError = (stdoutResult.spawnError || `${stdoutResult.stderr}\n${stdoutResult.stdout}`).trim()
      return {
        success: false,
        error: fallbackError || stdoutError,
        errorCode: fileResult.spawnError || stdoutResult.spawnError ? ErrorCodes.ERROR_EXECUTING_JAVA : ErrorCodes.UNKNOWN_ERROR,
      }
    }

    const content = await fs.readFile(outputPath, 'utf-8')
    return { success: true, content }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to convert JRXML template',
      errorCode: ErrorCodes.UNKNOWN_ERROR,
    }
  } finally {
    if (tmpDir) {
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => undefined)
    }
  }
}

ipcMain.handle('pdf:generatePreview', async (_, templateJson: string, dataJson: string) => {
  console.log('📄 [Preview] Starting PDF preview generation...')
  
  try {
    const cliReady = await ensureCLIReady()
    if (!cliReady.ok) return cliReady.error
    const cliStatus = cliReady.status
    console.log('📄 [Preview] CLI Status:', {
      installed: cliStatus.installed,
      javaInstalled: cliStatus.javaInstalled,
      version: cliStatus.version,
      javaVersion: cliStatus.javaVersion
    })

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdf-preview-'))
    const templateFile = path.join(tmpDir, 'template.json')
    const dataFile = path.join(tmpDir, 'data.json')
    const pdfFile = path.join(tmpDir, 'preview.pdf')

    console.log('📄 [Preview] Temp files:', { templateFile, dataFile, pdfFile })

    await fs.writeFile(templateFile, templateJson)
    await fs.writeFile(dataFile, dataJson)
    
    // Log template summary
    try {
      const template = JSON.parse(templateJson)
      console.log('📄 [Preview] Template:', {
        version: template.version,
        name: template.metadata?.name,
        pageElementsCount: template.pageElements?.length || 0,
        hasHeader: !!template.pageSettings?.header,
        hasFooter: !!template.pageSettings?.footer
      })
    } catch {
      console.log('📄 [Preview] Could not parse template for logging')
    }

    const javaPath = cliStatus.javaPath || 'java'
    console.log('📄 [Preview] Executing:', javaPath, '-jar', CLI_JAR_PATH, 'generate', templateFile, '-d', dataFile, '--output', pdfFile)
    
    return new Promise((resolve) => {
      const java = spawn(javaPath, [
        '-jar',
        CLI_JAR_PATH,
        'generate',
        templateFile,
        '-d',
        dataFile,
        '--output',
        pdfFile,
      ])

      let stdout = ''
      let stderr = ''

      java.stdout.on('data', (data) => {
        const text = data.toString()
        stdout += text
        console.log('[CLI STDOUT]', text.trim())
      })

      java.stderr.on('data', (data) => {
        const text = data.toString()
        stderr += text
        console.error('[CLI STDERR]', text.trim())
      })

      java.on('close', async (code) => {
        console.log('📄 [Preview] CLI exited with code:', code)
        
        await fs.unlink(templateFile).catch(() => {})
        await fs.unlink(dataFile).catch(() => {})

        if (code === 0) {
          try {
            const pdfBuffer = await fs.readFile(pdfFile)
            const base64 = pdfBuffer.toString('base64')
            
            console.log('✅ [Preview] PDF generated successfully, size:', pdfBuffer.length, 'bytes')
            
            await fs.unlink(pdfFile).catch(() => {})
            await fs.rmdir(tmpDir).catch(() => {})
            
            resolve({
              success: true,
              pdfBase64: base64,
            })
          } catch (readError) {
            console.error('❌ [Preview] Error reading PDF file:', readError)
            resolve({
              success: false,
              errorCode: ErrorCodes.ERROR_READING_PDF,
            })
          }
        } else {
          console.error('❌ [Preview] CLI failed with code:', code)
          console.error('❌ [Preview] STDOUT:', stdout)
          console.error('❌ [Preview] STDERR:', stderr)

          await fs.unlink(pdfFile).catch(() => {})
          await fs.rmdir(tmpDir).catch(() => {})

          resolve({
            success: false,
            errorCode: ErrorCodes.ERROR_GENERATING_PDF,
            code,
            // Include CLI output for debugging
            cliError: stderr.trim() || stdout.trim(),
          })
        }
      })

      java.on('error', async (error) => {
        console.error('❌ [Preview] Java spawn error:', error)
        
        await fs.unlink(templateFile).catch(() => {})
        await fs.unlink(dataFile).catch(() => {})
        await fs.unlink(pdfFile).catch(() => {})
        await fs.rmdir(tmpDir).catch(() => {})
        
        resolve({
          success: false,
          errorCode: ErrorCodes.ERROR_EXECUTING_JAVA,
        })
      })
    })
  } catch (error) {
    console.error('❌ [Preview] Unexpected error:', error)
    return {
      success: false,
      errorCode: ErrorCodes.UNKNOWN_ERROR,
    }
  }
})

// Generate PDF (calls Java library via child process)
ipcMain.handle('pdf:generate', async (_, templateJson: string, dataJson: string, outputPath?: string) => {
  try {
    const cliReady = await ensureCLIReady()
    if (!cliReady.ok) return cliReady.error
    const cliStatus = cliReady.status

    console.log('🔍 PDF Generation Debug Info:')
    console.log('  CLI Version:', cliStatus.version)
    console.log('  JAR Path:', CLI_JAR_PATH)
    console.log('  Java Version:', cliStatus.javaVersion)

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdf-gen-'))
    const templateFile = path.join(tmpDir, 'template.json')
    const dataFile = path.join(tmpDir, 'data.json')
    const pdfFile = outputPath || path.join(tmpDir, 'output.pdf')

    await fs.writeFile(templateFile, templateJson)
    await fs.writeFile(dataFile, dataJson)

    const javaPath = cliStatus.javaPath || 'java'
    console.log('  Java Path:', javaPath)
    console.log('  Command:', javaPath, '-jar', CLI_JAR_PATH, 'generate', templateFile, '-d', dataFile, '--output', pdfFile)

    return new Promise((resolve) => {
      const java = spawn(javaPath, [
        '-jar',
        CLI_JAR_PATH,
        'generate',
        templateFile,
        '-d',
        dataFile,
        '--output',
        pdfFile,
      ])

      let stdout = ''

      java.stdout.on('data', (data) => {
        const text = data.toString()
        stdout += text
        console.log('[JAR STDOUT]', text)
      })

      java.stderr.on('data', (data) => {
        console.error('[JAR STDERR]', data.toString())
      })

      java.on('close', async (code) => {
        await fs.unlink(templateFile).catch(() => {})
        await fs.unlink(dataFile).catch(() => {})

        if (code === 0) {
          resolve({
            success: true,
            outputPath: pdfFile,
            stdout,
          })
        } else {
          await fs.unlink(pdfFile).catch(() => {})
          
          resolve({
            success: false,
            errorCode: ErrorCodes.ERROR_GENERATING_PDF,
            code,
          })
        }
      })

      java.on('error', async () => {
        await fs.unlink(templateFile).catch(() => {})
        await fs.unlink(dataFile).catch(() => {})
        await fs.unlink(pdfFile).catch(() => {})
        
        resolve({
          success: false,
          errorCode: ErrorCodes.ERROR_EXECUTING_JAVA,
        })
      })
    })
  } catch {
    return {
      success: false,
      errorCode: ErrorCodes.UNKNOWN_ERROR,
    }
  }
})

// Open generated PDF
ipcMain.handle('pdf:open', async (_, pdfPath: string) => {
  try {
    await shell.openPath(pdfPath)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    }
  }
})
ipcMain.handle('pdf:openBase64', async (_, base64: string, openInViewer?: boolean) => {
  try {
    const tmpDir = path.join(app.getPath('temp'), 'opg-external-preview')
    await fs.mkdir(tmpDir, { recursive: true })
    const pdfFile = path.join(tmpDir, 'preview.pdf')
    await fs.writeFile(pdfFile, Buffer.from(base64, 'base64'))
    if (openInViewer !== false) {
      await shell.openPath(pdfFile)
    }
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
})


// Validate template using CLI
ipcMain.handle('template:validate', async (_, templatePath: string) => {
  console.log('🔍 [Validate] Validating template:', templatePath)
  
  try {
    let cliStatus = await checkCLIStatus()
    
    if (!cliStatus.javaInstalled) {
      return {
        valid: false,
        errorCode: ErrorCodes.JAVA_NOT_INSTALLED,
      }
    }
    
    if (!cliStatus.installed || cliStatus.needsUpdate) {
      const installResult = await installCLI()
      if (!installResult.success) {
        return {
          valid: false,
          errorCode: ErrorCodes.CLI_NOT_INSTALLED,
        }
      }
      cliStatus = await checkCLIStatus()
    }

    const javaPath = cliStatus.javaPath || 'java'
    
    return new Promise((resolve) => {
      const java = spawn(javaPath, [
        '-jar',
        CLI_JAR_PATH,
        'validate',
        templatePath,
      ])

      let stdout = ''
      let stderr = ''

      java.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      java.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      java.on('close', (code) => {
        console.log('🔍 [Validate] CLI exited with code:', code)
        
        if (code === 0) {
          resolve({
            valid: true,
            message: stdout.trim(),
          })
        } else {
          // Parse CLI error output to provide user-friendly message
          const errorOutput = stderr || stdout
          resolve({
            valid: false,
            errorCode: 'INVALID_TEMPLATE',
            cliError: errorOutput.trim(),
          })
        }
      })

      java.on('error', (error) => {
        console.error('❌ [Validate] Java spawn error:', error)
        resolve({
          valid: false,
          errorCode: ErrorCodes.ERROR_EXECUTING_JAVA,
        })
      })
    })
  } catch (error) {
    console.error('❌ [Validate] Unexpected error:', error)
    return {
      valid: false,
      errorCode: ErrorCodes.UNKNOWN_ERROR,
    }
  }
})
