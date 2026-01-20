import { clsx } from 'clsx'
import type { EditorLayoutProps } from './EditorLayout.types'

export function EditorLayout({
  toolbar,
  sidebar,
  canvas,
  propertiesPanel,
  dataPanel,
  preview,
  showDataPanel = false,
  showPreview = false,
  previewMode = 'tab',
}: EditorLayoutProps) {
  return (
    <div className="h-screen flex flex-col theme-bg overflow-hidden">
      {/* Toolbar */}
      <header className="flex-shrink-0">{toolbar}</header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="flex-shrink-0">{sidebar}</aside>

        {/* Canvas Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Canvas or Split View */}
          {showPreview && previewMode === 'split' ? (
            <div className="flex-1 flex">
              <div className="flex-1 overflow-hidden">{canvas}</div>
              <div className="flex-1 overflow-hidden border-l theme-border">{preview}</div>
            </div>
          ) : showPreview && previewMode === 'tab' ? (
            <div className="flex-1 overflow-hidden">{preview}</div>
          ) : (
            <div className="flex-1 overflow-hidden">{canvas}</div>
          )}
        </div>

        {/* Properties Panel */}
        <aside className="flex-shrink-0">{propertiesPanel}</aside>

        {/* Data Panel (Overlay) */}
        {showDataPanel && dataPanel && (
          <aside className="flex-shrink-0">{dataPanel}</aside>
        )}
      </main>
    </div>
  )
}
