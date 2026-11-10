import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs/promises'
import * as child_process from 'child_process'

vi.mock('fs/promises', () => ({
  access: vi.fn(),
}))

vi.mock('child_process', () => ({
  execSync: vi.fn(),
}))

describe('javaDetector', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('detects Java from valid JAVA_HOME', async () => {
    process.env.JAVA_HOME = '/custom/java/home'
    vi.mocked(fs.access).mockResolvedValue(undefined)
    vi.mocked(child_process.execSync).mockReturnValue('openjdk version "21.0.2" 2024-01-16')

    const { findJavaPath, checkJavaInstalled } = await import('./javaDetector')
    const javaPath = await findJavaPath()
    expect(javaPath).toContain('/custom/java/home/bin/java')

    const status = await checkJavaInstalled()
    expect(status.installed).toBe(true)
    expect(status.version).toBe('21.0.2')
  })

  it('falls back to JAVA_PATHS when JAVA_HOME is invalid', async () => {
    delete process.env.JAVA_HOME
    vi.mocked(fs.access).mockResolvedValue(undefined)
    vi.mocked(child_process.execSync).mockReturnValue('java version 17.0.1')

    const { findJavaPath, checkJavaInstalled } = await import('./javaDetector')
    const javaPath = await findJavaPath()
    expect(javaPath).toBeDefined()

    const status = await checkJavaInstalled()
    expect(status.installed).toBe(true)
    expect(status.version).toBe('17.0.1')
  })

  it('falls back to /usr/libexec/java_home when JAVA_PATHS fail', async () => {
    delete process.env.JAVA_HOME
    vi.mocked(fs.access).mockImplementation(async (p) => {
      if (String(p).includes('/opt/java/bin/java')) {
        return undefined
      }
      throw new Error('File not found')
    })

    vi.mocked(child_process.execSync).mockImplementation((cmd) => {
      if (String(cmd).includes('/usr/libexec/java_home')) {
        return '/opt/java\n'
      }
      return 'java version "11.0.12"'
    })

    const { findJavaPath, checkJavaInstalled } = await import('./javaDetector')
    const javaPath = await findJavaPath()
    expect(javaPath).toBe('/opt/java/bin/java')

    const status = await checkJavaInstalled()
    expect(status.installed).toBe(true)
    expect(status.version).toBe('11.0.12')
  })

  it('falls back to PATH "java" when java_home is unavailable', async () => {
    delete process.env.JAVA_HOME
    vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'))
    vi.mocked(child_process.execSync).mockImplementation((cmd) => {
      if (String(cmd).includes('/usr/libexec/java_home')) {
        throw new Error('command not found')
      }
      return 'openjdk 17-ea'
    })

    const { findJavaPath, checkJavaInstalled } = await import('./javaDetector')
    const javaPath = await findJavaPath()
    expect(javaPath).toBe('java')

    const status = await checkJavaInstalled()
    expect(status.installed).toBe(true)
    expect(status.version).toBe('unknown')
  })

  it('returns not installed when all detection methods fail', async () => {
    delete process.env.JAVA_HOME
    vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'))
    vi.mocked(child_process.execSync).mockImplementation(() => {
      throw new Error('command not found')
    })

    const { findJavaPath, checkJavaInstalled } = await import('./javaDetector')
    const javaPath = await findJavaPath()
    expect(javaPath).toBeNull()

    const status = await checkJavaInstalled()
    expect(status.installed).toBe(false)
    expect(status.version).toBeNull()
    expect(status.javaPath).toBeNull()
  })

  it('handles execution error during checkJavaInstalled', async () => {
    process.env.JAVA_HOME = '/dummy/home'
    vi.mocked(fs.access).mockResolvedValue(undefined)
    vi.mocked(child_process.execSync).mockImplementation((cmd) => {
      if (String(cmd).includes('-version')) {
        throw new Error('Execution failed')
      }
      return ''
    })

    const { checkJavaInstalled } = await import('./javaDetector')
    const status = await checkJavaInstalled()
    expect(status.installed).toBe(false)
  })
})
