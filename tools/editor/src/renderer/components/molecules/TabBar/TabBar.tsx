import { clsx } from 'clsx'
import type { TabBarProps } from './TabBar.types'

export function TabBar({ tabs, activeTab, onTabChange, className }: TabBarProps) {
  return (
    <div className={clsx('flex gap-1 p-1 theme-bg-tertiary rounded-lg', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition',
            activeTab === tab.id
              ? 'bg-primary-500 text-white shadow-sm'
              : 'theme-text-muted hover:theme-bg-secondary'
          )}
          title={tab.label}
        >
          {tab.icon}
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
