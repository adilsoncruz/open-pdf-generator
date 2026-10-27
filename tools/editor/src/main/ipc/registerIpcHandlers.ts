import { registerDialogIpc } from './dialogIpc'
import { registerCliIpc } from './cliIpc'
import { registerPdfIpc } from './pdfIpc'

export function registerIpcHandlers(): void {
  registerDialogIpc()
  registerCliIpc()
  registerPdfIpc()
}
