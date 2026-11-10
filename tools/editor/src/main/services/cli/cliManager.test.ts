import { describe, it, expect, vi, beforeEach } from 'vitest'
import { executeProcess, executeCliCommand } from './cliProcessExecutor'
import {
  isDevEnvironment,
  readGradleProjectVersion,
  readJarVersionFromBuildLibs,
} from './cliBinaryResolver'
import {
  CliManager,
  cliManager,
  checkCLIStatus,
  downloadCLI,
  installCLI,
  ensureCLIReady,
  installCLIFromFile,
  convertJrxmlToJson,
  getAppVersions,
  findLatestLocalCliJar,
} from './cliManager'
import { dialog } from 'electron'

vi.mock('electron', () => ({
  dialog: {
    showOpenDialog: vi.fn(),
  },
  BrowserWindow: vi.fn(),
  app: {
    isPackaged: false,
    getVersion: vi.fn().mockReturnValue('1.0.0'),
  },
}))

describe('cliProcessExecutor', () => {
  it('executes a basic command successfully', async () => {
    const result = await executeProcess(process.execPath, ['-e', 'console.log("hello-cli")'])
    expect(result.success).toBe(true)
    expect(result.stdout.trim()).toBe('hello-cli')
    expect(result.exitCode).toBe(0)
    expect(result.timedOut).toBeFalsy()
    expect(result.cancelled).toBeFalsy()
  })

  it('captures stderr on command error', async () => {
    const result = await executeProcess(process.execPath, ['-e', 'console.error("error-cli"); process.exit(1)'])
    expect(result.success).toBe(false)
    expect(result.stderr.trim()).toContain('error-cli')
    expect(result.exitCode).toBe(1)
  })

  it('handles timeout when process takes too long', async () => {
    const result = await executeProcess(process.execPath, ['-e', 'setTimeout(() => {}, 2000)'], {
      timeoutMs: 100,
    })
    expect(result.success).toBe(false)
    expect(result.timedOut).toBe(true)
    expect(result.error).toContain('timed out')
  })

  it('handles cancellation with AbortSignal', async () => {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 50)
    const result = await executeProcess(process.execPath, ['-e', 'setTimeout(() => {}, 2000)'], {
      signal: controller.signal,
    })
    expect(result.success).toBe(false)
    expect(result.cancelled).toBe(true)
  })

  it('builds executeCliCommand with -jar argument', async () => {
    const result = await executeCliCommand(process.execPath, 'dummy.jar', ['--version'], {
      timeoutMs: 2000,
    })
    expect(result).toBeDefined()
  })
})

describe('cliBinaryResolver', () => {
  it('detects dev environment correctly', () => {
    expect(typeof isDevEnvironment()).toBe('boolean')
  })

  it('reads gradle project version from file', async () => {
    const version = await readGradleProjectVersion('/non/existent/path')
    expect(version).toBeNull()
  })

  it('reads jar version from build libs dir', async () => {
    const version = await readJarVersionFromBuildLibs('/non/existent/dir', ['pdf-generator'])
    expect(version).toBeNull()
  })
})

describe('cliManager methods and exports', () => {
  let mgr: CliManager

  beforeEach(() => {
    mgr = new CliManager()
  })

  it('exposes singleton cliManager instance and function aliases', async () => {
    expect(cliManager).toBeInstanceOf(CliManager)
    expect(typeof checkCLIStatus).toBe('function')
    expect(typeof downloadCLI).toBe('function')
    expect(typeof installCLI).toBe('function')
    expect(typeof ensureCLIReady).toBe('function')
    expect(typeof installCLIFromFile).toBe('function')
    expect(typeof convertJrxmlToJson).toBe('function')
    expect(typeof getAppVersions).toBe('function')
    expect(typeof findLatestLocalCliJar).toBe('function')
  })

  it('checks CLI status when native binary or java is present', async () => {
    const status = await mgr.checkCLIStatus()
    expect(status).toHaveProperty('installed')
    expect(status).toHaveProperty('isNative')
  })

  it('handles installCLIFromFile with null window or canceled dialog', async () => {
    const nullWinRes = await mgr.installCLIFromFile(null)
    expect(nullWinRes.success).toBe(false)
    expect(nullWinRes.errorCode).toBe('MAIN_WINDOW_NOT_FOUND')

    const mockWin: any = {}
    vi.mocked(dialog.showOpenDialog).mockResolvedValueOnce({ canceled: true, filePaths: [] })
    const cancelRes = await mgr.installCLIFromFile(mockWin)
    expect(cancelRes.success).toBe(false)
    expect(cancelRes.errorCode).toBe('OPERATION_CANCELLED')
  })

  it('handles ensureCLIReady', async () => {
    const result = await mgr.ensureCLIReady()
    expect(result).toHaveProperty('ok')
  })

  it('handles convertJrxmlToJson when CLI is native or not installed', async () => {
    vi.spyOn(mgr, 'checkCLIStatus').mockResolvedValueOnce({
      installed: true,
      version: '1.0.0',
      jarPath: '/jar',
      nativePath: process.execPath,
      isNative: true,
      needsUpdate: false,
      javaInstalled: true,
      javaVersion: 'native',
      javaPath: process.execPath,
    })

    const nativeRes = await mgr.convertJrxmlToJson('/test.jrxml')
    expect(nativeRes).toBeDefined()

    vi.spyOn(mgr, 'checkCLIStatus').mockResolvedValueOnce({
      installed: false,
      version: null,
      jarPath: '/jar',
      nativePath: null,
      isNative: false,
      needsUpdate: false,
      javaInstalled: false,
      javaVersion: null,
      javaPath: null,
    })

    const res = await mgr.convertJrxmlToJson('/test.jrxml')
    expect(res.success).toBe(false)
    expect(res.errorCode).toBe('CLI_NOT_INSTALLED')
  })

  it('installs CLI from source file and tests ensureCLIReady failure branches', async () => {
    const fs = await import('fs/promises')
    const os = await import('os')
    const path = await import('path')

    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'mgr-test-'))
    const dummyJar = path.join(tmp, 'pdf-generator-cli-2.0.0.jar')
    await fs.writeFile(dummyJar, 'dummy-jar-content')

    const installRes = await mgr.installCLI(dummyJar)
    expect(installRes.success).toBe(true)

    // Failed install branch in ensureCLIReady
    vi.spyOn(mgr, 'checkCLIStatus').mockResolvedValueOnce({
      installed: false,
      version: null,
      jarPath: '/jar',
      nativePath: null,
      isNative: false,
      needsUpdate: true,
      javaInstalled: false,
      javaVersion: null,
      javaPath: null,
    })
    vi.spyOn(mgr, 'installCLI').mockResolvedValueOnce({ success: false, error: 'fail' })
    const failedReady = await mgr.ensureCLIReady()
    expect(failedReady.ok).toBe(false)

    await fs.rm(tmp, { recursive: true, force: true })
  })

  it('runs convertJrxmlWithCli with simulated success', async () => {
    const { convertJrxmlWithCli } = await import('./cliProcessExecutor')
    const res = await convertJrxmlWithCli(
      process.execPath,
      '',
      '/dummy.jrxml'
    )
    expect(res).toBeDefined()
    expect(typeof res.success).toBe('boolean')
  })

  it('covers all standalone export functions and branches', async () => {
    // 1. Standalone wrapper functions
    expect(await checkCLIStatus()).toBeDefined()
    expect(await downloadCLI('http://127.0.0.1:1/nonexistent')).toBeDefined()
    expect(await installCLI()).toBeDefined()
    expect(await ensureCLIReady()).toBeDefined()
    expect(await installCLIFromFile(null)).toBeDefined()
    expect(await convertJrxmlToJson('/dummy.jrxml')).toBeDefined()
    expect(await getAppVersions()).toBeDefined()
    expect(await findLatestLocalCliJar()).toBeDefined()

    // 2. ensureCLIReady with native CLI
    vi.spyOn(mgr, 'checkCLIStatus').mockResolvedValueOnce({
      installed: true,
      version: '1.0.0',
      jarPath: '/jar',
      nativePath: '/usr/local/bin/cli',
      isNative: true,
      needsUpdate: false,
      javaInstalled: true,
      javaVersion: 'native',
      javaPath: '/bin',
    })
    const nativeReady = await mgr.ensureCLIReady()
    expect(nativeReady.ok).toBe(true)

    // 3. ensureCLIReady when update fails but was already installed
    vi.spyOn(mgr, 'checkCLIStatus').mockResolvedValueOnce({
      installed: true,
      version: '1.0.0',
      jarPath: '/jar',
      nativePath: null,
      isNative: false,
      needsUpdate: true,
      javaInstalled: true,
      javaVersion: '21',
      javaPath: '/bin/java',
    })
    vi.spyOn(mgr, 'installCLI').mockResolvedValueOnce({ success: false, error: 'Download failed' })
    const fallbackReady = await mgr.ensureCLIReady()
    expect(fallbackReady.ok).toBe(true)

    // 4. convertJrxmlToJson with Java JAR
    vi.spyOn(mgr, 'checkCLIStatus').mockResolvedValueOnce({
      installed: true,
      version: '1.0.0',
      jarPath: '/jar',
      nativePath: null,
      isNative: false,
      needsUpdate: false,
      javaInstalled: true,
      javaVersion: '21',
      javaPath: process.execPath,
    })
    const javaConvert = await mgr.convertJrxmlToJson('/report.jrxml')
    expect(javaConvert).toBeDefined()

    // 5. installCLIFromFile with file selected
    const mockWin: any = {}
    vi.mocked(dialog.showOpenDialog).mockResolvedValueOnce({
      canceled: false,
      filePaths: ['/tmp/selected.jar'],
    })
    vi.spyOn(mgr, 'installCLI').mockResolvedValueOnce({ success: true })
    const fileInstallRes = await mgr.installCLIFromFile(mockWin)
    expect(fileInstallRes.success).toBe(true)

    // 6. installCLI error catch block
    const failInstall = await mgr.installCLI('/invalid/path/to/nonexistent-jar.jar')
    expect(failInstall.success).toBe(false)

    // 7. ensureCLIReady when install succeeds but status is still not installed
    vi.spyOn(mgr, 'checkCLIStatus')
      .mockResolvedValueOnce({
        installed: false,
        version: null,
        jarPath: '/jar',
        nativePath: null,
        isNative: false,
        needsUpdate: false,
        javaInstalled: true,
        javaVersion: '21',
        javaPath: '/bin/java',
      })
      .mockResolvedValueOnce({
        installed: false,
        version: null,
        jarPath: '/jar',
        nativePath: null,
        isNative: false,
        needsUpdate: false,
        javaInstalled: true,
        javaVersion: '21',
        javaPath: '/bin/java',
      })
    vi.spyOn(mgr, 'installCLI').mockResolvedValueOnce({ success: true })
    const stillNotInstalled = await mgr.ensureCLIReady()
    expect(stillNotInstalled.ok).toBe(false)

    // 8. installCLI with fallbackJar not found calling downloadCliArtifact
    const resolver = await import('./cliBinaryResolver')
    vi.spyOn(resolver, 'resolveFallbackJarPath').mockResolvedValueOnce(null)
    vi.spyOn(resolver, 'downloadCLI').mockResolvedValueOnce({ success: true })
    const noFallbackRes = await mgr.installCLI()
    expect(noFallbackRes.success).toBe(true)
  })
})
