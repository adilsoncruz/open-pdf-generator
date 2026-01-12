import { useEffect, useState, useCallback } from 'react'
import { ArrowPathIcon, ArrowDownTrayIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface UpdateStatus {
  checking: boolean
  available: boolean
  downloaded: boolean
  downloading: boolean
  error: string | null
  progress: number
  version: string | null
  releaseNotes: string | null
  releaseDate: string | null
}

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

  
  if (status?.checking) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm">
        <ArrowPathIcon className="w-4 h-4 animate-spin" />
        <span>Checking for updates...</span>
      </div>
    )
  }

  
  if (status?.downloading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm">
        <ArrowDownTrayIcon className="w-4 h-4" />
        <span>Baixando {status.version}...</span>
        <div className="w-20 h-2 bg-blue-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${status.progress}%` }}
          />
        </div>
        <span className="text-xs">{status.progress.toFixed(0)}%</span>
      </div>
    )
  }

  
  if (status?.downloaded) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm">
        <CheckCircleIcon className="w-4 h-4" />
        <span>Version {status.version} ready!</span>
        <button
          onClick={handleInstall}
          className="px-2 py-0.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs font-medium"
        >
          Reiniciar e Atualizar
        </button>
      </div>
    )
  }

  
  if (status?.available && status.version) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm relative">
        <ArrowDownTrayIcon className="w-4 h-4" />
        <span>New version {status.version} available!</span>
        <button
          onClick={handleDownload}
          className="px-2 py-0.5 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors text-xs font-medium"
        >
          Baixar
        </button>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-amber-600 hover:text-amber-800 underline"
        >
          {showDetails ? 'Ocultar' : 'Detalhes'}
        </button>
        <button
          onClick={handleDismiss}
          className="p-0.5 hover:bg-amber-200 rounded transition-colors"
          title="Dispensar"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>

        {/* Modal de detalhes */}
        {showDetails && status.releaseNotes && (
          <div className="absolute top-full left-0 mt-2 w-80 p-3 bg-white rounded-lg shadow-lg border border-amber-200 z-50">
            <h4 className="font-medium text-gray-900 mb-2">What's new in version {status.version}</h4>
            <div className="text-xs text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
              {status.releaseNotes}
            </div>
            {status.releaseDate && (
              <p className="text-xs text-gray-400 mt-2">
                Released: {new Date(status.releaseDate).toLocaleDateString('en-US')}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }

  // Erro
  if (status?.error) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm">
        <XMarkIcon className="w-4 h-4" />
        <span className="truncate max-w-xs" title={status.error}>
          Error checking for updates
        </span>
        <button
          onClick={handleCheckUpdates}
          className="px-2 py-0.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-medium"
        >
          Tentar Novamente
        </button>
        <button
          onClick={handleDismiss}
          className="p-0.5 hover:bg-red-200 rounded transition-colors"
          title="Dispensar"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
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

