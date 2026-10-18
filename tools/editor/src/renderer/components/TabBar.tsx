import React, { useEffect } from 'react'
import { useTabStore } from '../store/tabStore'
import { useTemplateStore } from '../store/templateStore'

export const TabBar: React.FC = () => {
  const { tabs, activeTabId, switchTab, closeTab, addTab, createNewTemplateTab } = useTabStore()
  const currentFilePath = useTemplateStore((state) => state.currentFilePath)
  const isDirty = useTemplateStore((state) => state.isDirty)
  const templateName = useTemplateStore((state) => state.template?.metadata?.name)

  // Initialize first tab with current template store state if tabs array is empty
  useEffect(() => {
    if (tabs.length === 0) {
      const currentState = useTemplateStore.getState()
      addTab({
        name: currentState.currentFilePath
          ? currentState.currentFilePath.split(/[/\\]/).pop() || 'template.json'
          : currentState.template?.metadata?.name || 'New Template',
        path: currentState.currentFilePath,
        isDirty: currentState.isDirty,
        stateSnapshot: {
          template: currentState.template,
          currentFilePath: currentState.currentFilePath,
          isDirty: currentState.isDirty,
          history: currentState.history,
          historyIndex: currentState.historyIndex,
          selectedElementIds: currentState.selectedElementIds,
          selectedElementLocation: currentState.selectedElementLocation,
          selectedGroupId: currentState.selectedGroupId,
          currentSection: currentState.currentSection,
        },
      })
    }
  }, [tabs.length, addTab])

  if (tabs.length === 0) return null

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto h-full scrollbar-none py-0.5 max-w-full">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId
        const displayIsDirty = isActive ? isDirty : tab.isDirty
        const displayName = isActive
          ? (currentFilePath ? currentFilePath.split(/[/\\]/).pop() : templateName || 'New Template')
          : (tab.path ? tab.path.split(/[/\\]/).pop() : tab.name || 'New Template')

        return (
          <div
            key={tab.id}
            onClick={() => switchTab(tab.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                switchTab(tab.id)
              }
            }}
            className={`
              group flex items-center h-7 px-2.5 text-xs rounded-md cursor-pointer select-none transition-all border max-w-[190px] min-w-[110px]
              ${
                isActive
                  ? 'bg-slate-800 text-slate-100 border-slate-700 shadow-sm font-medium ring-1 ring-cyan-500/20'
                  : 'bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border-slate-800/80'
              }
            `}
            title={tab.path || displayName}
          >
            {/* File Icon */}
            <svg
              className={`w-3.5 h-3.5 mr-1.5 flex-shrink-0 ${
                isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-400'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>

            {/* Tab Label */}
            <span className="truncate flex-1 font-mono text-[11px]">{displayName}</span>

            {/* Unsaved indicator */}
            {displayIsDirty && (
              <span
                className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-1.5 mr-1 flex-shrink-0 animate-pulse"
                title="Alterações não salvas"
              />
            )}

            {/* Close Tab Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                closeTab(tab.id)
              }}
              className={`p-0.5 rounded text-slate-400 hover:text-rose-300 hover:bg-rose-500/20 ml-1 transition-opacity ${
                isActive ? 'opacity-80 hover:opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
              title="Fechar aba"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )
      })}

      {/* New Tab Button */}
      <button
        type="button"
        onClick={createNewTemplateTab}
        className="flex items-center justify-center w-6 h-6 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80 transition cursor-pointer flex-shrink-0"
        title="Novo template (Ctrl+N)"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  )
}
export default TabBar
