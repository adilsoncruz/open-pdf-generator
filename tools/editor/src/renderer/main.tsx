import React from 'react'
import ReactDOM from 'react-dom/client'
import { initBrowserFallback, setupIpcBridgeListeners, AppProviders } from './bootstrap'
import { App } from './App'
import './index.css'

// Initialize fallback mock when running outside Electron
initBrowserFallback()

// Register global IPC bridge listeners
setupIpcBridgeListeners()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
)
