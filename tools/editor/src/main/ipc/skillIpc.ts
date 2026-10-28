import { ipcMain } from 'electron'
import * as path from 'path'
import * as fs from 'fs/promises'
import * as fsSync from 'fs'
import * as os from 'os'
import { PROJECT_ROOT_DIR } from '../config/paths'

export function registerSkillIpc(): void {
  ipcMain.handle('skill:getContent', async () => {
    try {
      let skillPath = path.join(PROJECT_ROOT_DIR, 'skills', 'ai-pdf-template-importer', 'SKILL.md')
      if (!fsSync.existsSync(skillPath)) {
        skillPath = path.join(PROJECT_ROOT_DIR, '.agents', 'skills', 'ai-pdf-template-importer', 'SKILL.md')
      }
      if (fsSync.existsSync(skillPath)) {
        const content = await fs.readFile(skillPath, 'utf-8')
        return { success: true, content }
      }
      return { success: false, error: 'Skill file not found' }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('skill:install', async (_, target: string, customPath?: string) => {
    try {
      const homedir = os.homedir()
      let skillPath = path.join(PROJECT_ROOT_DIR, 'skills', 'ai-pdf-template-importer', 'SKILL.md')
      if (!fsSync.existsSync(skillPath)) {
        skillPath = path.join(PROJECT_ROOT_DIR, '.agents', 'skills', 'ai-pdf-template-importer', 'SKILL.md')
      }

      let skillContent = ''
      if (fsSync.existsSync(skillPath)) {
        skillContent = await fs.readFile(skillPath, 'utf-8')
      } else {
        skillContent = `# ai-pdf-template-importer\nConverte PDFs em templates JSON do Open PDF Generator.`
      }

      let destDir = ''
      let destFile = ''

      if (target === 'antigravity') {
        destDir = path.join(homedir, '.gemini', 'antigravity-cli', 'skills', 'ai-pdf-template-importer')
        destFile = path.join(destDir, 'SKILL.md')
      } else if (target === 'claude') {
        destDir = path.join(homedir, '.claude', 'skills', 'ai-pdf-template-importer')
        destFile = path.join(destDir, 'SKILL.md')
      } else if (target === 'cursor') {
        destDir = path.join(homedir, '.cursor', 'rules')
        destFile = path.join(destDir, 'ai-pdf-template-importer.mdc')
      } else if (target === 'custom' && customPath) {
        destDir = customPath
        destFile = path.join(destDir, 'SKILL.md')
      } else {
        throw new Error(`Target desconhecido: ${target}`)
      }

      await fs.mkdir(destDir, { recursive: true })
      await fs.writeFile(destFile, skillContent, 'utf-8')

      return { success: true, path: destFile }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })
}
