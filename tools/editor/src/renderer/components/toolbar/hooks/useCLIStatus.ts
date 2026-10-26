import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from '../../../i18n'
import type { CLIStatus, AppVersions } from '../types'

export function useCLIStatus() {
  const { t } = useTranslation()
  const [cliStatus, setCLIStatus] = useState<CLIStatus | null>(null)
  const [appVersions, setAppVersions] = useState<AppVersions | null>(null)
  const [isInstallingCLI, setIsInstallingCLI] = useState(false)
  const [installError, setInstallError] = useState<string | null>(null)

  const checkCLIStatus = useCallback(async () => {
    if (!window.electronAPI?.getCLIStatus) return
    try {
      const status = await window.electronAPI.getCLIStatus()
      setCLIStatus(status)
      return status
    } catch (error) {
      console.error('Error checking CLI:', error)
      return null
    }
  }, [])

  useEffect(() => {
    checkCLIStatus()
  }, [checkCLIStatus])

  useEffect(() => {
    const loadVersions = async () => {
      if (!window.electronAPI?.getAppVersions) return
      try {
        const versions = await window.electronAPI.getAppVersions()
        setAppVersions(versions)
      } catch (error) {
        console.error('Error loading app versions:', error)
      }
    }

    loadVersions()
  }, [])

  const getErrorMessage = useCallback((errorCode?: string): string => {
    switch (errorCode) {
      case 'JAVA_NOT_INSTALLED':
        return t.errors.javaNotInstalled
      case 'CLI_NOT_INSTALLED':
        return t.errors.cliNotInstalled
      case 'ERROR_GENERATING_PDF':
        return t.errors.errorGeneratingPdf
      case 'ERROR_EXECUTING_JAVA':
        return t.errors.errorExecutingJava
      case 'MAIN_WINDOW_NOT_FOUND':
        return t.errors.mainWindowNotFound
      case 'OPERATION_CANCELLED':
        return t.errors.operationCancelled
      default:
        return t.errors.unknownError
    }
  }, [t])

  const handleInstallCLI = async (onSuccess?: () => void) => {
    setIsInstallingCLI(true)
    setInstallError(null)

    try {
      const result = await window.electronAPI.installCLI()
      if (result.success) {
        await checkCLIStatus()
        onSuccess?.()
      } else {
        setInstallError(getErrorMessage(result.errorCode))
      }
    } catch {
      setInstallError(t.errors.unknownError)
    } finally {
      setIsInstallingCLI(false)
    }
  }

  const handleInstallCLIFromFile = async (onSuccess?: () => void) => {
    setIsInstallingCLI(true)
    setInstallError(null)

    try {
      const result = await window.electronAPI.installCLIFromFile()
      if (result.success) {
        await checkCLIStatus()
        onSuccess?.()
      } else if (result.errorCode !== 'OPERATION_CANCELLED') {
        setInstallError(getErrorMessage(result.errorCode))
      }
    } catch {
      setInstallError(t.errors.unknownError)
    } finally {
      setIsInstallingCLI(false)
    }
  }

  return {
    cliStatus,
    setCLIStatus,
    appVersions,
    isInstallingCLI,
    installError,
    checkCLIStatus,
    getErrorMessage,
    handleInstallCLI,
    handleInstallCLIFromFile,
  }
}
