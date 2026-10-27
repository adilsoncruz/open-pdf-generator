import React, { useEffect, type ReactNode } from 'react'
import { useUIStore } from '../store/uiStore'
import { useIpcBridgeListeners } from './ipcBridgeListeners'

export interface AppProvidersProps {
  children: ReactNode
}

/**
 * Global AppProviders component managing UI theme sync, global IPC bridge listeners,
 * and context wrappers.
 */
export function AppProviders({ children }: AppProvidersProps) {
  const theme = useUIStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useIpcBridgeListeners()

  return <>{children}</>
}
