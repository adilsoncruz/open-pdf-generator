import React, { useEffect } from 'react'
import { useTabStore } from '../store/tabStore'
import { useTemplateStore } from '../store/templateStore'


export const TabBar: React.FC = () => {
  const { tabs, activeTabId, switchTab, closeTab, addTab } = useTabStore()
  const currentFilePath = useTemplateStore(state => state.currentFilePath)
  const isDirty = useTemplateStore(state => state.isDirty)
  const templateName = useTemplateStore(state => state.template.metadata.name)

  // Initialize first tab if empty
  useEffect(() => {
    if (tabs.length === 0) {
      addTab({
        name: 'New Template',
        path: null,
        isDirty: false,
        stateSnapshot: useTemplateStore.getState()
      })
    }
  }, [tabs.length, addTab])

  if (tabs.length === 0) return null

  return (
    <div className="flex items-center space-x-1 overflow-x-auto h-full px-2 flex-1 scrollbar-hide">
      {tabs.map(tab => {
        const isActive = tab.id === activeTabId
        // Always read latest state for active tab
        const displayIsDirty = isActive ? isDirty : tab.isDirty
        let displayName = isActive 
          ? (currentFilePath ? currentFilePath.split(/[/\\]/).pop() : templateName || 'New Template')
          : (tab.path ? tab.path.split(/[/\\]/).pop() : tab.stateSnapshot?.template?.metadata?.name || 'New Template')

        return (
          <div
            key={tab.id}
            onClick={() => switchTab(tab.id)}
            className={`
              group flex items-center h-8 px-3 text-xs font-medium rounded-md cursor-pointer max-w-[160px] min-w-[100px] select-none transition-colors border
              ${isActive 
                ? 'bg-primary-50 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-500/30 shadow-sm' 
                : 'bg-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 border-transparent hover:border-gray-200 dark:hover:border-gray-700'
              }
            `}
          >
            <span className="truncate flex-1 mr-2">{displayName}</span>
            {displayIsDirty && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 flex-shrink-0"></span>}
            <button
              onClick={(e) => {
                e.stopPropagation()
                closeTab(tab.id)
              }}
              className={`p-0.5 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 opacity-0 group-hover:opacity-100 ${isActive ? 'opacity-100' : ''}`}
            >
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        )
      })}
    </div>
  )
}
