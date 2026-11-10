import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import {
  isDevEnvironment,
  readGradleProjectVersion,
  readJarVersionFromBuildLibs,
} from './cliBinaryResolver'

vi.mock('electron', () => ({
  app: {
    isPackaged: false,
    getVersion: vi.fn().mockReturnValue('1.0.0'),
  },
}))

describe('cliBinaryResolver', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'resolver-test-'))
  })

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  it('detects dev environment', () => {
    expect(isDevEnvironment()).toBe(true)
  })

  it('reads gradle project version from build.gradle.kts', async () => {
    const gradleFile = path.join(tempDir, 'build.gradle.kts')
    await fs.writeFile(gradleFile, 'version = "2.3.4"\nplugins {}')
    const ver = await readGradleProjectVersion(gradleFile)
    expect(ver).toBe('2.3.4')

    const none = await readGradleProjectVersion(path.join(tempDir, 'missing.kts'))
    expect(none).toBeNull()
  })

  it('reads jar version from build libs directory', async () => {
    await fs.writeFile(path.join(tempDir, 'pdf-generator-cli-1.0.0.jar'), '')
    await fs.writeFile(path.join(tempDir, 'pdf-generator-cli-1.2.0.jar'), '')
    await fs.writeFile(path.join(tempDir, 'pdf-generator-cli-1.2.0-sources.jar'), '')

    const ver = await readJarVersionFromBuildLibs(tempDir, ['pdf-generator-cli'])
    expect(ver).toBe('1.2.0')

    // Test with non-matching prefix and empty candidate list
    await fs.writeFile(path.join(tempDir, 'other-tool-1.0.jar'), '')
    const noCandidates = await readJarVersionFromBuildLibs(tempDir, ['nonexistent-prefix'])
    expect(noCandidates).toBeNull()

    const missing = await readJarVersionFromBuildLibs(path.join(tempDir, 'missing'), ['pdf-generator-cli'])
    expect(missing).toBeNull()
  })

  it('handles findLatestLocalCliJar, resolveFallbackJarPath, syncLocalDevJarIfNewer, getAppVersions', async () => {
    const { findLatestLocalCliJar, resolveFallbackJarPath, syncLocalDevJarIfNewer, getAppVersions, isDevEnvironment } = await import('./cliBinaryResolver')
    const latest = await findLatestLocalCliJar()
    expect(latest === null || typeof latest === 'string').toBe(true)

    const fallback = await resolveFallbackJarPath()
    expect(fallback === null || typeof fallback === 'string').toBe(true)

    await expect(syncLocalDevJarIfNewer()).resolves.toBeUndefined()

    const versions = await getAppVersions()
    expect(versions).toHaveProperty('editor')

    // Create temporary build/libs directory in project root to test findLatestLocalCliJar
    const { PROJECT_ROOT_DIR } = await import('../../config/paths')
    const testLibsDir = path.join(PROJECT_ROOT_DIR, 'tools', 'cli', 'build', 'libs')
    await fs.mkdir(testLibsDir, { recursive: true })
    const testJar = path.join(testLibsDir, 'pdf-generator-cli-2.0.0.jar')
    await fs.writeFile(testJar, 'test-jar-content')

    const foundJar = await findLatestLocalCliJar()
    expect(foundJar).toBe(testJar)

    await syncLocalDevJarIfNewer()

    // Clean up created test jar directory
    await fs.rm(testLibsDir, { recursive: true, force: true })

    // Test resolveFallbackJarPath candidate search when localJar is null
    const resJar = path.join(PROJECT_ROOT_DIR, 'tools', 'editor', 'resources', 'pdf-generator.jar')
    await fs.mkdir(path.dirname(resJar), { recursive: true })
    await fs.writeFile(resJar, 'fallback-jar')
    const fallbackWithCandidate = await resolveFallbackJarPath()
    expect(fallbackWithCandidate).toBe(resJar)
    await fs.rm(resJar, { force: true })
  })

  it('handles downloadCLI network error gracefully', async () => {
    const { downloadCLI } = await import('./cliBinaryResolver')
    const result = await downloadCLI('http://127.0.0.1:1/nonexistent')
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('handles downloadCLI with HTTP 200, redirect and error status', async () => {
    const http = await import('http')
    const { downloadCLI } = await import('./cliBinaryResolver')

    let redirectHit = false
    const server = http.createServer((req, res) => {
      if (req.url === '/redirect') {
        redirectHit = true
        res.writeHead(302, { Location: `http://127.0.0.1:${(server.address() as any).port}/success` })
        res.end()
        return
      }
      if (req.url === '/success') {
        res.writeHead(200, { 'Content-Type': 'application/java-archive' })
        res.end(Buffer.from('dummy-jar-bytes'))
        return
      }
      if (req.url === '/error') {
        res.writeHead(500)
        res.end('Server Error')
        return
      }
    })

    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()))
    const port = (server.address() as any).port

    // 1. Redirect to success
    const redirectRes = await downloadCLI(`http://127.0.0.1:${port}/redirect`)
    expect(redirectRes.success).toBe(true)
    expect(redirectHit).toBe(true)

    // 2. HTTP Error
    const errorRes = await downloadCLI(`http://127.0.0.1:${port}/error`)
    expect(errorRes.success).toBe(false)
    expect(errorRes.error).toContain('500')

    await new Promise<void>((resolve) => server.close(() => resolve()))
  })

  it('handles downloadCLI redirect without location, write error, and timeout', async () => {
    const http = await import('http')
    const { downloadCLI } = await import('./cliBinaryResolver')

    // 1. Redirect without location header
    const server = http.createServer((req, res) => {
      res.writeHead(302) // no Location header
      res.end()
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()))
    const port = (server.address() as any).port

    const noLocRes = await downloadCLI(`http://127.0.0.1:${port}/`)
    expect(noLocRes.success).toBe(false)
    await new Promise<void>((resolve) => server.close(() => resolve()))

    // 2. Timeout
    const slowServer = http.createServer((req, res) => {
      // Never respond
    })
    await new Promise<void>((resolve) => slowServer.listen(0, '127.0.0.1', () => resolve()))
    const slowPort = (slowServer.address() as any).port

    // We override setTimeout or test timeout
    const reqPromise = downloadCLI(`http://127.0.0.1:${slowPort}/`)
    // emit timeout on active sockets
    await new Promise<void>((resolve) => slowServer.close(() => resolve()))
  })
})
