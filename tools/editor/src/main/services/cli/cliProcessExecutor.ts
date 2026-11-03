import { spawn, SpawnOptionsWithoutStdio } from 'child_process'
import * as path from 'path'
import * as fs from 'fs/promises'
import * as os from 'os'
import { ErrorCodes } from '../../types'

export interface ProcessExecutionOptions {
  cwd?: string
  env?: NodeJS.ProcessEnv
  timeoutMs?: number
  signal?: AbortSignal
  onStdout?: (chunk: string) => void
  onStderr?: (chunk: string) => void
}

export interface ProcessExecutionResult {
  success: boolean
  stdout: string
  stderr: string
  exitCode: number | null
  error?: string
  timedOut?: boolean
  cancelled?: boolean
}

export function executeProcess(
  command: string,
  args: string[],
  options: ProcessExecutionOptions = {}
): Promise<ProcessExecutionResult> {
  return new Promise((resolve) => {
    const { timeoutMs, signal, onStdout, onStderr, cwd, env } = options

    let stdout = ''
    let stderr = ''
    let timedOut = false
    let cancelled = false
    let timeoutId: NodeJS.Timeout | null = null

    if (signal?.aborted) {
      resolve({
        success: false,
        stdout: '',
        stderr: 'Operation aborted',
        exitCode: null,
        error: 'Operation aborted',
        cancelled: true,
      })
      return
    }

    const spawnOptions: SpawnOptionsWithoutStdio = {}
    if (cwd) spawnOptions.cwd = cwd
    if (env) spawnOptions.env = env

    const child = spawn(command, args, spawnOptions)

    const onAbort = () => {
      cancelled = true
      child.kill('SIGTERM')
    }

    if (signal) {
      signal.addEventListener('abort', onAbort, { once: true })
    }

    if (timeoutMs && timeoutMs > 0) {
      timeoutId = setTimeout(() => {
        timedOut = true
        child.kill('SIGTERM')
      }, timeoutMs)
    }

    child.stdout.on('data', (data: Buffer | string) => {
      const text = data.toString()
      stdout += text
      onStdout?.(text)
    })

    child.stderr.on('data', (data: Buffer | string) => {
      const text = data.toString()
      stderr += text
      onStderr?.(text)
    })

    child.on('error', (err: Error) => {
      if (timeoutId) clearTimeout(timeoutId)
      if (signal) signal.removeEventListener('abort', onAbort)
      resolve({
        success: false,
        stdout,
        stderr,
        exitCode: null,
        error: err.message,
        timedOut,
        cancelled,
      })
    })

    child.on('close', (code: number | null) => {
      if (timeoutId) clearTimeout(timeoutId)
      if (signal) signal.removeEventListener('abort', onAbort)

      const success = code === 0 && !timedOut && !cancelled
      let error: string | undefined

      if (timedOut) {
        error = `Process timed out after ${timeoutMs}ms`
      } else if (cancelled) {
        error = 'Process cancelled'
      } else if (code !== 0) {
        error = stderr.trim() || `Process exited with code ${code}`
      }

      resolve({
        success,
        stdout,
        stderr,
        exitCode: code,
        error,
        timedOut,
        cancelled,
      })
    })
  })
}

export async function executeCliCommand(
  execPath: string,
  jarPath: string,
  cliArgs: string[],
  options: ProcessExecutionOptions = {}
): Promise<ProcessExecutionResult> {
  const args = jarPath ? ['-jar', jarPath, ...cliArgs] : cliArgs
  return executeProcess(execPath, args, options)
}

export async function convertJrxmlWithCli(
  javaPath: string,
  jarPath: string,
  filePath: string
): Promise<{ success: boolean; content?: string; error?: string; errorCode?: string }> {
  console.log(`convert ${filePath}`)

  const stdoutResult = await executeCliCommand(javaPath, jarPath, ['convert', filePath, '--stdout'])
  if (stdoutResult.success) {
    return { success: true, content: stdoutResult.stdout }
  }

  let tmpDir: string | null = null
  try {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'jrxml-convert-'))
    const outputPath = path.join(tmpDir, `${path.basename(filePath, path.extname(filePath))}.json`)

    const fileResult = await executeCliCommand(javaPath, jarPath, ['convert', filePath, '--stdout'])
    if (!fileResult.success) {
      const fallbackError = (fileResult.error || `${fileResult.stderr}\n${fileResult.stdout}`).trim()
      const stdoutError = (stdoutResult.error || `${stdoutResult.stderr}\n${stdoutResult.stdout}`).trim()
      return {
        success: false,
        error: fallbackError || stdoutError,
        errorCode:
          fileResult.error || stdoutResult.error
            ? ErrorCodes.ERROR_EXECUTING_JAVA
            : ErrorCodes.UNKNOWN_ERROR,
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
