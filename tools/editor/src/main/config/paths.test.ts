import { describe, it, expect, vi } from 'vitest'
import * as fsSync from 'fs'
import * as path from 'path'
import * as os from 'os'
import {
  resolveProjectRootDir,
  readGradleVersionSync,
  resolveBundledNativeBinary,
  PROJECT_ROOT_DIR,
  CLI_VERSION,
  JAVA_PATHS,
  CLI_DIR,
} from './paths'

describe('config/paths', () => {
  it('resolves project root directory and constants', () => {
    expect(PROJECT_ROOT_DIR).toBeDefined()
    expect(typeof PROJECT_ROOT_DIR).toBe('string')
    expect(CLI_VERSION).toBeDefined()
    expect(Array.isArray(JAVA_PATHS)).toBe(true)
    expect(JAVA_PATHS.length).toBeGreaterThan(0)
  })

  it('reads gradle version synchronously', () => {
    const tmpFile = path.join(os.tmpdir(), `build-${Date.now()}.gradle.kts`)
    fsSync.writeFileSync(tmpFile, 'version = "2.5.1"')
    try {
      expect(readGradleVersionSync(tmpFile)).toBe('2.5.1')

      // No version string
      fsSync.writeFileSync(tmpFile, 'no version here')
      expect(readGradleVersionSync(tmpFile)).toBeNull()

      // Non-existent file
      expect(readGradleVersionSync('/nonexistent/path/build.gradle.kts')).toBeNull()
    } finally {
      if (fsSync.existsSync(tmpFile)) fsSync.unlinkSync(tmpFile)
    }
  })

  it('resolves bundled native binary from resourcesPath and fallback candidates', () => {
    const binName = process.platform === 'win32' ? 'pdf-generator.exe' : 'pdf-generator'
    const originalResources = (process as any).resourcesPath

    try {
      // 1. Packaged resourcesPath
      const tmpDir = fsSync.mkdtempSync(path.join(os.tmpdir(), 'res-test-'))
      const binDir = path.join(tmpDir, 'bin')
      fsSync.mkdirSync(binDir, { recursive: true })
      const fakeBin = path.join(binDir, binName)
      fsSync.writeFileSync(fakeBin, 'binary')

      ;(process as any).resourcesPath = tmpDir
      expect(resolveBundledNativeBinary()).toBe(fakeBin)

      // 2. Without resourcesPath, candidate in CLI_DIR exists
      delete (process as any).resourcesPath
      const cliBin = path.join(CLI_DIR, binName)
      fsSync.mkdirSync(CLI_DIR, { recursive: true })
      const existedBefore = fsSync.existsSync(cliBin)
      if (!existedBefore) fsSync.writeFileSync(cliBin, 'bin-content')

      expect(resolveBundledNativeBinary()).toBe(cliBin)

      if (!existedBefore && fsSync.existsSync(cliBin)) {
        fsSync.unlinkSync(cliBin)
      }

      fsSync.rmSync(tmpDir, { recursive: true, force: true })
    } finally {
      if (originalResources !== undefined) {
        ;(process as any).resourcesPath = originalResources
      } else {
        delete (process as any).resourcesPath
      }
    }
  })
})
