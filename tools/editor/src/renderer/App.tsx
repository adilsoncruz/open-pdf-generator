import React, { useEffect, useState } from 'react'
import { EditorPage, HomePage, LoadingPage } from './components/pages'
import { AiImportModal } from './components/AiImportModal'
import { useTabStore } from './store/tabStore'
import { useRecentFilesStore } from './store/recentFilesStore'
import { openTemplateFromContent, handleImportJasper } from './bootstrap'

export function App() {
  const [screen, setScreen] = useState<'loading' | 'home' | 'editor'>('loading')
  const [showAiModal, setShowAiModal] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setScreen('home'), 2200)
    return () => window.clearTimeout(timer)
  }, [])

  const handleOpenFromContent = (filePath: string, content: string) => {
    const success = openTemplateFromContent(filePath, content)
    if (success) {
      setScreen('editor')
    }
  }

  const handleJasperImport = async () => {
    const success = await handleImportJasper()
    if (success) {
      setScreen('editor')
    }
  }

  if (screen === 'loading') return <LoadingPage />

  if (screen === 'home') {
    return (
      <>
        <HomePage
          onNewTemplate={() => {
            useTabStore.getState().createNewTemplateTab()
            setScreen('editor')
          }}
          onOpenFile={async () => {
            const result = await window.electronAPI.openFile()
            if (!result) return
            handleOpenFromContent(result.path, result.content)
          }}
          onImportJasper={handleJasperImport}
          onImportAI={() => setShowAiModal(true)}
          onOpenRecentFile={async (filePath: string) => {
            const result = await window.electronAPI.readFile(filePath)
            if (result.success && result.content) {
              handleOpenFromContent(filePath, result.content)
            } else {
              window.alert('Não foi possível abrir o arquivo recente. Ele pode ter sido movido ou excluído.')
              useRecentFilesStore.getState().removeRecentFile(filePath)
            }
          }}
        />
        <AiImportModal
          isOpen={showAiModal}
          onClose={() => setShowAiModal(false)}
          onSuccess={() => setScreen('editor')}
        />
      </>
    )
  }

  return <EditorPage />
}
