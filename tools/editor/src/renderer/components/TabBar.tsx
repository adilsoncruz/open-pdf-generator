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
    <div className="flex items-center bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto h-9 min-h-[36px] flex-shrink-0">
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
              group flex items-center h-full px-3 text-sm border-r border-gray-200 dark:border-gray-700 cursor-pointer min-w-[120px] max-w-[200px] select-none
              ${isActive 
                ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 border-b-2 border-b-blue-600' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }
            `}
          >
            <span className="truncate flex-1 mr-2">{displayName}</span>
            {displayIsDirty && <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 flex-shrink-0"></span>}
            <button
              onClick={(e) => {
                e.stopPropagation()
                closeTab(tab.id)
              }}
              className={`p-0.5 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 opacity-0 group-hover:opacity-100 ${isActive ? 'opacity-100' : ''}`}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        )
      })}
    </div>
  )
}
