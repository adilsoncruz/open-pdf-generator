import { useState, useEffect } from 'react'
import { useTranslation } from '../../i18n'
import HelpExpressionsTab from './HelpExpressionsTab'
import HelpShortcutsTab from './HelpShortcutsTab'
import HelpElementsTab from './HelpElementsTab'
import type { ExpressionCategory } from './expressionsData'

export type MainHelpTab = 'expressions' | 'shortcuts' | 'elements'
export type HelpTabId = MainHelpTab | ExpressionCategory
export type TabId = HelpTabId

export interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: HelpTabId
}

const EXPRESSION_CATEGORIES: ExpressionCategory[] = [
  'text', 'numbers', 'dates', 'lists', 'template', 'conditions', 'utils',
]

export default function HelpModal({ isOpen, onClose, initialTab = 'expressions' }: HelpModalProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<MainHelpTab>('expressions')
  const [expressionCategory, setExpressionCategory] = useState<ExpressionCategory>('text')

  useEffect(() => {
    if (!isOpen) return
    if (EXPRESSION_CATEGORIES.includes(initialTab as ExpressionCategory)) {
      setActiveTab('expressions')
      setExpressionCategory(initialTab as ExpressionCategory)
    } else if (initialTab === 'shortcuts' || initialTab === 'elements') {
      setActiveTab(initialTab)
    } else {
      setActiveTab('expressions')
    }
  }, [isOpen, initialTab])

  if (!isOpen) return null

  const tabs: { id: MainHelpTab; label: string; icon: string }[] = [
    { id: 'expressions', label: 'Expressions & Conditions', icon: '🧩' },
    { id: 'shortcuts', label: 'Shortcuts', icon: '⌨️' },
    { id: 'elements', label: 'Elements Guide', icon: '🧱' },
  ]

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="theme-surface border theme-border rounded-xl shadow-2xl w-[920px] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b theme-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center text-xl">
              📚
            </div>
            <div>
              <h2 className="text-xl font-bold theme-text">{t.help.title}</h2>
              <p className="text-sm theme-text-muted">{t.help.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:theme-bg-tertiary rounded-lg transition-colors theme-text-muted hover:theme-text"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main Tabs */}
        <div className="flex border-b theme-border px-6 gap-2 bg-black/[0.02] dark:bg-white/[0.02]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent theme-text-muted hover:theme-text hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'expressions' && <HelpExpressionsTab initialCategory={expressionCategory} />}
          {activeTab === 'shortcuts' && <HelpShortcutsTab />}
          {activeTab === 'elements' && <HelpElementsTab />}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t theme-border theme-bg-tertiary rounded-b-xl flex items-center justify-between">
          <a
            href="https://adilsoncruz.github.io/open-pdf-generator/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            {t.help.fullDocumentation}
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 dark:bg-slate-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </div>
  )
}
