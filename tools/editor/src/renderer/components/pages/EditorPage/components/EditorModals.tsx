import { DataPanel, SchemaPanel, HelpModal } from '../../../organisms'

interface EditorModalsProps {
  showDataPanel: boolean
  onCloseDataPanel: () => void
  showSchemaPanel: boolean
  onCloseSchemaPanel: () => void
  showHelpModal: boolean
  onCloseHelpModal: () => void
  helpModalInitialTab: 'text' | 'conditions'
}

export function EditorModals({
  showDataPanel,
  onCloseDataPanel,
  showSchemaPanel,
  onCloseSchemaPanel,
  showHelpModal,
  onCloseHelpModal,
  helpModalInitialTab,
}: EditorModalsProps) {
  return (
    <>
      {showDataPanel && <DataPanel onClose={onCloseDataPanel} />}
      {showSchemaPanel && <SchemaPanel onClose={onCloseSchemaPanel} />}
      <HelpModal
        isOpen={showHelpModal}
        onClose={onCloseHelpModal}
        initialTab={helpModalInitialTab}
      />
    </>
  )
}
