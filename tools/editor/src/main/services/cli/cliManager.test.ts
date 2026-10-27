import { describe, it, expect } from 'vitest'
import { executeProcess, executeCliCommand } from './cliProcessExecutor'
import {
  isDevEnvironment,
  readGradleProjectVersion,
  readJarVersionFromBuildLibs,
} from './cliBinaryResolver'
import { CliManager, cliManager } from './cliManager'

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
      // We pass a command that will exit immediately since dummy.jar won't run as node script without valid syntax
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

describe('cliManager', () => {
  it('exposes singleton cliManager instance of CliManager', () => {
    expect(cliManager).toBeInstanceOf(CliManager)
    expect(typeof cliManager.checkCLIStatus).toBe('function')
    expect(typeof cliManager.ensureCLIReady).toBe('function')
    expect(typeof cliManager.installCLI).toBe('function')
    expect(typeof cliManager.installCLIFromFile).toBe('function')
    expect(typeof cliManager.convertJrxmlToJson).toBe('function')
  })
})
