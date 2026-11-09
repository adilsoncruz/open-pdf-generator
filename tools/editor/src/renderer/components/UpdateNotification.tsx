import { useEffect, useState, useCallback } from 'react'
import { ArrowPathIcon, ArrowDownTrayIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import type { UpdateStatus } from '../../shared/types'

export function UpdateNotification() {
  const [status, setStatus] = useState<UpdateStatus | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const handleCheckUpdates = useCallback(async () => {
    setDismissed(false)
    await window.electronAPI?.checkForUpdates?.()
  }, [])

  useEffect(() => {
    // Obter status inicial
    window.electronAPI?.getUpdateStatus?.().then(setStatus)

    
    window.electronAPI?.onUpdateStatus?.((newStatus: UpdateStatus) => {
      setStatus(newStatus)
      
      if (newStatus.available && !newStatus.downloading && !newStatus.downloaded) {
        setDismissed(false)
      }
    })

    // Listen for "Check for Updates" menu event
    window.electronAPI?.onMenuCheckUpdates?.(() => {
      handleCheckUpdates()
    })
  }, [handleCheckUpdates])

  const handleDownload = async () => {
    await window.electronAPI?.downloadUpdate?.()
  }

  const handleInstall = () => {
    window.electronAPI?.installUpdate?.()
  }

  const handleDismiss = () => {
    setDismissed(true)
  }

  
  if (dismissed && !status?.downloading && !status?.downloaded) {
    return null
  }

  // Verificando atualizações
  if (status?.checking) {
    return (
      <div className="fixed bottom-9 right-4 z-50 flex items-center gap-2.5 px-3.5 py-2 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 text-slate-300 rounded-xl shadow-2xl text-xs">
        <ArrowPathIcon className="w-3.5 h-3.5 animate-spin text-indigo-400" />
        <span>Verificando atualizações...</span>
      </div>
    )
  }

  // Baixando atualização
  if (status?.downloading) {
    return (
      <div className="fixed bottom-9 right-4 z-50 flex items-center gap-3 px-4 py-2.5 bg-slate-900/95 backdrop-blur-md border border-indigo-500/40 text-slate-200 rounded-xl shadow-2xl text-xs">
        <ArrowDownTrayIcon className="w-4 h-4 text-indigo-400 animate-bounce" />
        <span>Baixando {status.version}...</span>
        <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${status.progress}%` }}
          />
        </div>
        <span className="text-[11px] text-slate-400 font-mono">{status.progress.toFixed(0)}%</span>
      </div>
    )
  }

  // Atualização baixada e pronta
  if (status?.downloaded) {
    return (
      <div className="fixed bottom-9 right-4 z-50 flex items-center gap-3 px-4 py-2.5 bg-slate-900/95 backdrop-blur-md border border-emerald-500/40 text-slate-200 rounded-xl shadow-2xl text-xs">
        <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Versão {status.version} pronta!</span>
        <button
          onClick={handleInstall}
          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors text-xs font-medium shadow-sm"
        >
          Reiniciar e Atualizar
        </button>
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
          title="Dispensar"
        >
          <XMarkIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  // Nova versão disponível
  if (status?.available && status.version) {
    return (
      <div className="fixed bottom-9 right-4 z-50 flex flex-col gap-2 p-3 bg-slate-900/95 backdrop-blur-md border border-indigo-500/40 text-slate-200 rounded-xl shadow-2xl text-xs max-w-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ArrowDownTrayIcon className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="font-semibold text-slate-100">Nova versão {status.version} disponível</span>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
            title="Dispensar"
          >
            <XMarkIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          {status.releaseNotes ? (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline"
            >
              {showDetails ? 'Ocultar notas' : 'Ver notas'}
            </button>
          ) : <span />}
          <button
            onClick={handleDownload}
            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors text-xs font-medium shadow-sm"
          >
            Baixar atualização
          </button>
        </div>

        {/* Modal de detalhes */}
        {showDetails && status.releaseNotes && (
          <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-[11px] text-slate-300 whitespace-pre-wrap max-h-36 overflow-y-auto">
            {status.releaseNotes}
            {status.releaseDate && (
              <p className="text-[10px] text-slate-500 mt-2">
                Lançado em: {new Date(status.releaseDate).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }

  // Erro ao verificar
  if (status?.error) {
    return (
      <div className="fixed bottom-9 right-4 z-50 flex flex-col gap-2 p-3 bg-slate-900/95 backdrop-blur-md border border-red-500/40 text-slate-200 rounded-xl shadow-2xl text-xs max-w-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-red-400 font-medium">
            <XMarkIcon className="w-4 h-4 shrink-0" />
            <span>Erro ao verificar atualizações</span>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
            title="Dispensar"
          >
            <XMarkIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-2 bg-slate-950/80 border border-slate-800 rounded-lg text-[11px] text-slate-400 whitespace-pre-wrap max-h-24 overflow-y-auto font-mono">
          {status.error}
        </div>

        <div className="flex justify-end gap-2 mt-0.5">
          <button
            onClick={handleCheckUpdates}
            className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors text-xs font-medium shadow-sm"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  
  return null
}

// Componente menor para uso no menu ou toolbar
export function UpdateBadge() {
  const [status, setStatus] = useState<UpdateStatus | null>(null)

  useEffect(() => {
    window.electronAPI?.getUpdateStatus?.().then(setStatus)
    window.electronAPI?.onUpdateStatus?.(setStatus)
  }, [])

  if (status?.available || status?.downloaded) {
    return (
      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
    )
  }

  return null
}

