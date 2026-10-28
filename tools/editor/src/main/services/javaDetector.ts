import * as path from 'path'
import * as fs from 'fs/promises'
import { execSync } from 'child_process'
import { JAVA_PATHS } from '../config/paths'

let cachedJavaPath: string | null = null

export async function findJavaPath(): Promise<string | null> {
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
      // Continue searching
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

  try {
    execSync('java -version 2>&1', { encoding: 'utf-8' })
    cachedJavaPath = 'java'
    return 'java'
  } catch {
    // Java not found
  }

  return null
}

export async function checkJavaInstalled(): Promise<{ installed: boolean; version: string | null; javaPath: string | null }> {
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
      javaPath,
    }
  } catch {
    return { installed: false, version: null, javaPath: null }
  }
}
