import { describe, it, expect, vi } from 'vitest'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import {
  executeProcess,
  executeCliCommand,
  convertJrxmlWithCli,
} from './cliProcessExecutor'

describe('cliProcessExecutor', () => {
  it('executes a basic command successfully with onStdout', async () => {
    let captured = ''
    const res = await executeProcess(process.execPath, ['-e', 'console.log("hello world")'], {
      onStdout: (chunk) => {
        captured += chunk
      },
    })
    expect(res.success).toBe(true)
    expect(res.stdout).toContain('hello world')
    expect(captured).toContain('hello world')
    expect(res.exitCode).toBe(0)
  })

  it('supports custom cwd and env options', async () => {
    const res = await executeProcess(
      process.execPath,
      ['-e', 'console.log(process.cwd(), process.env.TEST_FOO)'],
      {
        cwd: os.tmpdir(),
        env: { ...process.env, TEST_FOO: 'BAR_ENV_123' },
      }
    )
    expect(res.success).toBe(true)
    expect(res.stdout).toContain('BAR_ENV_123')
  })

  it('captures stderr on command error with onStderr', async () => {
    let capturedErr = ''
    const res = await executeProcess(process.execPath, ['-e', 'console.error("error message"); process.exit(1)'], {
      onStderr: (chunk) => {
        capturedErr += chunk
      },
    })
    expect(res.success).toBe(false)
    expect(res.stderr).toContain('error message')
    expect(capturedErr).toContain('error message')
    expect(res.exitCode).toBe(1)
  })

  it('handles process exit with non-zero exit code and empty stderr', async () => {
    const res = await executeProcess(process.execPath, ['-e', 'process.exit(42)'])
    expect(res.success).toBe(false)
    expect(res.exitCode).toBe(42)
    expect(res.error).toBe('Process exited with code 42')
  })

  it('handles immediately aborted signal', async () => {
    const controller = new AbortController()
    controller.abort()

    const res = await executeProcess(process.execPath, ['-e', 'console.log("no")'], {
      signal: controller.signal,
    })
    expect(res.success).toBe(false)
    expect(res.cancelled).toBe(true)
  })

  it('handles abort signal during execution', async () => {
    const controller = new AbortController()
    const promise = executeProcess(process.execPath, ['-e', 'setTimeout(() => {}, 5000)'], {
      signal: controller.signal,
    })

    setTimeout(() => {
      controller.abort()
    }, 50)

    const res = await promise
    expect(res.success).toBe(false)
    expect(res.cancelled).toBe(true)
  })

  it('handles timeout during execution', async () => {
    const res = await executeProcess(process.execPath, ['-e', 'setTimeout(() => {}, 5000)'], {
      timeoutMs: 100,
    })
    expect(res.success).toBe(false)
    expect(res.timedOut).toBe(true)
  })

  it('handles spawn error for non-existent binary', async () => {
    const res = await executeProcess('/nonexistent/binary/path/12345', [])
    expect(res.success).toBe(false)
    expect(res.error).toBeDefined()
  })

  it('executes cli command with jarPath and without jarPath', async () => {
    const resWithJar = await executeCliCommand(
      process.execPath,
      'dummy.jar',
      ['-v']
    )
    expect(resWithJar).toBeDefined()

    const resWithoutJar = await executeCliCommand(
      process.execPath,
      '',
      ['-e', 'console.log("direct")']
    )
    expect(resWithoutJar.success).toBe(true)
  })

  it('handles convertJrxmlWithCli success on stdout', async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-cli-'))
    const scriptPath = path.join(tmpDir, 'mock-cli.js')
    await fs.writeFile(
      scriptPath,
      'if (process.argv.includes("--stdout")) { console.log(JSON.stringify({ template: true })); process.exit(0); }'
    )

    try {
      // First arg to convertJrxmlWithCli is javaPath (process.execPath)
      // Second arg is jarPath. If we pass scriptPath as jarPath?
      // Wait: if jarPath is set, args are: ['-jar', jarPath, 'convert', filePath, '--stdout']
      // Node doesn't accept '-jar'. But if javaPath is a shell script wrapper:
      const wrapperPath = path.join(tmpDir, 'wrapper.sh')
      await fs.writeFile(
        wrapperPath,
        `#!/bin/sh\necho '{"template":true}'\nexit 0\n`
      )
      await fs.chmod(wrapperPath, 0o755)

      const successRes = await convertJrxmlWithCli(
        wrapperPath,
        '',
        'template.jrxml'
      )
      expect(successRes.success).toBe(true)
      expect(successRes.content).toContain('{"template":true}')
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => undefined)
    }
  })

  it('handles convertJrxmlWithCli failure when process fails', async () => {
    const failRes = await convertJrxmlWithCli(
      '/nonexistent/java',
      'cli.jar',
      'template.jrxml'
    )
    expect(failRes.success).toBe(false)
    expect(failRes.errorCode).toBeDefined()
  })
})
