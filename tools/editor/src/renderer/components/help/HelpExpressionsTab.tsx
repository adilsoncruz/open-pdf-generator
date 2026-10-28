import { useState, useEffect } from 'react'
import { useTranslation } from '../../i18n'
import {
  EXPRESSIONS_CONTENT,
  type ExpressionCategory,
} from './expressionsData'

interface HelpExpressionsTabProps {
  initialCategory?: ExpressionCategory
}

export default function HelpExpressionsTab({ initialCategory = 'text' }: HelpExpressionsTabProps) {
  const { t } = useTranslation()
  const [activeCategory, setActiveCategory] = useState<ExpressionCategory>(initialCategory)
  const [copiedExpression, setCopiedExpression] = useState<string | null>(null)

  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory)
    }
  }, [initialCategory])

  const copyToClipboard = async (expression: string) => {
    try {
      await navigator.clipboard.writeText(expression)
      setCopiedExpression(expression)
      setTimeout(() => setCopiedExpression(null), 2000)
    } catch (err) {
      console.error('Error copying:', err)
    }
  }

  const categories: { id: ExpressionCategory; label: string; icon: string }[] = [
    { id: 'text', label: t.help.tabs.text, icon: '📝' },
    { id: 'numbers', label: t.help.tabs.numbers, icon: '🔢' },
    { id: 'dates', label: t.help.tabs.dates, icon: '📅' },
    { id: 'lists', label: t.help.tabs.lists, icon: '📋' },
    { id: 'template', label: t.help.tabs.template, icon: '🧩' },
    { id: 'conditions', label: t.help.tabs.conditions, icon: '🔍' },
    { id: 'utils', label: t.help.tabs.utils, icon: '🛠️' },
  ]

  const currentCategory = EXPRESSIONS_CONTENT[activeCategory]

  return (
    <div className="space-y-4">
      {/* Intro info box */}
      <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-lg space-y-1.5 text-xs text-blue-800 dark:text-blue-200">
        <p>
          <strong>Data Binding:</strong> Use <code className="bg-blue-100 dark:bg-blue-900/50 px-1 py-0.5 rounded font-mono text-blue-900 dark:text-blue-200">field | expression</code> to transform data. Chain: <code className="bg-blue-100 dark:bg-blue-900/50 px-1 py-0.5 rounded font-mono text-blue-900 dark:text-blue-200">name | upperCase | truncate:20</code>
        </p>
        <p>
          <strong>Conditions:</strong> Use boolean expressions to control printing: <code className="bg-blue-100 dark:bg-blue-900/50 px-1 py-0.5 rounded font-mono text-blue-900 dark:text-blue-200">invoice.total &gt; 0 &amp;&amp; items.length &gt; 1</code>
        </p>
      </div>

      {/* Subtabs */}
      <div className="flex border-b theme-border overflow-x-auto gap-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeCategory === cat.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent theme-text-muted hover:theme-text hover:border-gray-300'
            }`}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Category description */}
      <div>
        <h4 className="text-sm font-semibold theme-text flex items-center gap-2">
          <span>{currentCategory.icon}</span>
          {currentCategory.title}
        </h4>
        <p className="text-xs theme-text-secondary mt-0.5">{currentCategory.description}</p>
      </div>

      {/* Examples list */}
      <div className="space-y-2.5">
        {currentCategory.examples.map((example, index) => (
          <div
            key={index}
            className="theme-bg-tertiary rounded-lg p-3 border theme-border hover:border-gray-300 dark:hover:border-slate-600 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono bg-gray-800 text-green-400 px-2.5 py-1 rounded flex-1 select-all">
                    {example.expression}
                  </code>
                  <button
                    onClick={() => copyToClipboard(example.expression)}
                    className={`p-1 rounded transition-colors ${
                      copiedExpression === example.expression
                        ? 'bg-green-100 text-green-600 dark:bg-green-950/60 dark:text-green-400'
                        : 'bg-gray-200 dark:bg-slate-700 theme-text-secondary hover:bg-gray-300 dark:hover:bg-slate-600'
                    }`}
                    title={t.help.copyExpression}
                  >
                    {copiedExpression === example.expression ? (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
                {example.description && (
                  <p className="text-xs theme-text-secondary mt-1">{example.description}</p>
                )}
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="text-gray-400">{t.help.input}:</span>
              <code className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border theme-border font-mono theme-text text-[11px]">
                {example.input}
              </code>
              <svg className="w-3 h-3 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="text-gray-400">{t.help.output}:</span>
              <code className="bg-green-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-green-200 dark:border-emerald-800/60 font-mono text-green-700 dark:text-emerald-400 text-[11px]">
                {example.output}
              </code>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
