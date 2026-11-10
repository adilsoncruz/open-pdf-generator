import React, { useEffect, useState, useMemo } from 'react'
import { EditorPage, HomePage, LoadingPage, MobileViewerPage } from './components/pages'
import { AiImportModal } from './components/AiImportModal'
import { UpdateNotification } from './components/UpdateNotification'
import { useTabStore } from './store/tabStore'
import { useTemplateStore } from './store/templateStore'
import { useRecentFilesStore } from './store/recentFilesStore'
import { openTemplateFromContent, handleImportJasper } from './bootstrap'

export function App() {
  const [screen, setScreen] = useState<'loading' | 'home' | 'editor' | 'mobile-viewer'>('loading')
  const [selectedTemplateTitle, setSelectedTemplateTitle] = useState<string>('')
  const [showAiModal, setShowAiModal] = useState(false)
  const [forceDesktop, setForceDesktop] = useState(false)

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < 768
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => setScreen('home'), 2200)
    return () => window.clearTimeout(timer)
  }, [])

  const navigateToTemplate = (title?: string) => {
    if (title) setSelectedTemplateTitle(title)
    if (isMobile && !forceDesktop) {
      setScreen('mobile-viewer')
    } else {
      setScreen('editor')
    }
  }

  const handleOpenFromContent = (filePath: string, content: string) => {
    const success = openTemplateFromContent(filePath, content)
    if (success) {
      navigateToTemplate(filePath.split('/').pop())
    }
  }

  const handleJasperImport = async () => {
    const success = await handleImportJasper()
    if (success) {
      navigateToTemplate('Jasper Import')
    }
  }

  return (
    <>
      {screen === 'loading' && <LoadingPage />}

      {screen === 'mobile-viewer' && (
        <MobileViewerPage
          templateTitle={selectedTemplateTitle}
          onBack={() => setScreen('home')}
          onOpenDesktopEditor={() => {
            setForceDesktop(true)
            setScreen('editor')
          }}
        />
      )}

      {screen === 'home' && (
        <>
          <HomePage
            onNewTemplate={() => {
              useTabStore.getState().createNewTemplateTab()
              navigateToTemplate('Novo Template')
            }}
            onOpenFile={async () => {
              const result = await window.electronAPI.openFile()
              if (!result) return
              handleOpenFromContent(result.path, result.content)
            }}
            onImportJasper={handleJasperImport}
            onSelectGalleryTemplate={(item) => {
              const success = openTemplateFromContent(`${item.id}.json`, JSON.stringify(item.template))
              if (success) {
                useTemplateStore.getState().setTestData(item.data)
                navigateToTemplate(item.title)
              }
            }}
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
      )}

      {screen === 'editor' && <EditorPage />}

      <UpdateNotification />
    </>
  )
}
