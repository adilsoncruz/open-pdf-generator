import { registerDialogIpc } from './dialogIpc'
import { registerCliIpc } from './cliIpc'
import { registerPdfIpc } from './pdfIpc'
import { registerSkillIpc } from './skillIpc'

export function registerIpcHandlers(): void {
  registerDialogIpc()
  registerCliIpc()
  registerPdfIpc()
  registerSkillIpc()
}
