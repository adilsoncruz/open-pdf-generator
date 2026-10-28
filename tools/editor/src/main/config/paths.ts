import * as path from 'path'
import * as fsSync from 'fs'
import * as os from 'os'

export function resolveProjectRootDir(): string {
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

export function readGradleVersionSync(gradleFilePath: string): string | null {
  try {
    const content = fsSync.readFileSync(gradleFilePath, 'utf-8')
    const match = content.match(/version\s*=\s*\"([^\"]+)\"/)
    return match?.[1] || null
  } catch {
    return null
  }
}

export const PROJECT_ROOT_DIR = resolveProjectRootDir()
export const DEFAULT_CLI_VERSION = '1.0.0'

export const CLI_VERSION =
  readGradleVersionSync(path.join(PROJECT_ROOT_DIR, 'tools', 'cli', 'build.gradle.kts')) || DEFAULT_CLI_VERSION

export const CLI_DIR = path.join(os.homedir(), '.pdf-generator')
export const CLI_JAR_PATH = path.join(CLI_DIR, 'pdf-generator.jar')
export const CLI_VERSION_FILE = path.join(CLI_DIR, 'version.txt')
export const CLI_DOWNLOAD_URL = `https://github.com/adilsoncruz/open-pdf-generator/releases/download/v${CLI_VERSION}/open-pdf-generator-${CLI_VERSION}.jar`

export const JAVA_PATHS = [
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
