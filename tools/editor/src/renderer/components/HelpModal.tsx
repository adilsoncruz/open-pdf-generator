import { useState, useEffect } from 'react'
import { useTranslation } from '../i18n'

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: TabId
}

type TabId = 'text' | 'numbers' | 'dates' | 'lists' | 'template' | 'conditions' | 'utils'

interface ExpressionExample {
  expression: string
  input: string
  output: string
  description?: string
}

interface TabContent {
  title: string
  icon: string
  description: string
  examples: ExpressionExample[]
}

const tabsContent: Record<TabId, TabContent> = {
  text: {
    title: 'Text',
    icon: '📝',
    description: 'Transformations to manipulate strings and text.',
    examples: [
      { expression: 'name | upperCase', input: '"John Doe"', output: '"JOHN DOE"', description: 'Convert to uppercase' },
      { expression: 'name | lowerCase', input: '"John Doe"', output: '"john doe"', description: 'Convert to lowercase' },
      { expression: 'name | capitalize', input: '"JOHN DOE"', output: '"John Doe"', description: 'Capitalize each word' },
      { expression: 'text | trim', input: '"  Hello  "', output: '"Hello"', description: 'Remove leading/trailing spaces' },
      { expression: 'description | truncate:20', input: '"Very long description..."', output: '"Very long descrip..."', description: 'Truncate to N characters' },
      { expression: 'description | truncate:15:"→"', input: '"Very long text here"', output: '"Very long text→"', description: 'Truncate with custom suffix' },
      { expression: 'code | replace:".":""', input: '"123.456.789"', output: '"123456789"', description: 'Replace text' },
      { expression: 'code | padLeft:10:"0"', input: '"123"', output: '"0000000123"', description: 'Pad left' },
      { expression: 'code | padRight:10:"."', input: '"ABC"', output: '"ABC......."', description: 'Pad right' },
      { expression: 'value | prefix:"$ "', input: '"100.00"', output: '"$ 100.00"', description: 'Add prefix' },
      { expression: 'value | suffix:" USD"', input: '"100"', output: '"100 USD"', description: 'Add suffix' },
      { expression: 'text | reverse', input: '"ABC"', output: '"CBA"', description: 'Reverse string' },
    ]
  },
  numbers: {
    title: 'Numbers',
    icon: '🔢',
    description: 'Formatting and operations with numbers.',
    examples: [
      { expression: "total | format:'#,##0.00'", input: '1234.5', output: '"1,234.50"', description: 'Format number with pattern' },
      { expression: "price | currency:'USD'", input: '1234.56', output: '"$1,234.56"', description: 'Format as USD currency' },
      { expression: "price | currency:'EUR'", input: '1234.56', output: '"€1,234.56"', description: 'Format as EUR currency' },
      { expression: "price | currency:'BRL'", input: '1234.56', output: '"R$ 1.234,56"', description: 'Format as BRL currency' },
      { expression: "value | numberFormat:'en-US'", input: '1234567.89', output: '"1,234,567.89"', description: 'Format by locale' },
      { expression: 'balance | abs', input: '-150.50', output: '150.50', description: 'Absolute value' },
      { expression: 'average | round:2', input: '3.14159', output: '3.14', description: 'Round to N decimals' },
      { expression: 'value | floor', input: '3.9', output: '3', description: 'Round down' },
      { expression: 'value | ceil', input: '3.1', output: '4', description: 'Round up' },
    ]
  },
  dates: {
    title: 'Dates',
    icon: '📅',
    description: 'Date and timestamp formatting.',
    examples: [
      { expression: "date | date:'MM/dd/yyyy'", input: '"2024-11-26"', output: '"11/26/2024"', description: 'US format' },
      { expression: "date | date:'dd/MM/yyyy'", input: '"2024-11-26"', output: '"26/11/2024"', description: 'EU format' },
      { expression: "date | date:'yyyy-MM-dd'", input: '"11/26/2024"', output: '"2024-11-26"', description: 'ISO format' },
      { expression: "date | date:'dd/MM/yy'", input: '"2024-11-26"', output: '"26/11/24"', description: 'Short year' },
      { expression: "timestamp | date:'MM/dd/yyyy HH:mm'", input: '"2024-11-26T14:30:00"', output: '"11/26/2024 14:30"', description: 'Date and time' },
      { expression: "timestamp | date:'HH:mm:ss'", input: '"2024-11-26T14:30:45"', output: '"14:30:45"', description: 'Time only' },
    ]
  },
  lists: {
    title: 'Lists',
    icon: '📋',
    description: 'Operations with arrays and lists.',
    examples: [
      { expression: "tags | join:', '", input: '["A", "B", "C"]', output: '"A, B, C"', description: 'Join with separator' },
      { expression: "items | join:' - '", input: '["Item 1", "Item 2"]', output: '"Item 1 - Item 2"', description: 'Join with dash' },
      { expression: "emails | join:'; '", input: '["a@x.com", "b@y.com"]', output: '"a@x.com; b@y.com"', description: 'Join with semicolon' },
      { expression: 'items | first', input: '["A", "B", "C"]', output: '"A"', description: 'First element' },
      { expression: 'items | last', input: '["A", "B", "C"]', output: '"C"', description: 'Last element' },
      { expression: 'items | length', input: '["A", "B", "C"]', output: '3', description: 'Number of elements' },
    ]
  },
  template: {
    title: 'Template',
    icon: '🧩',
    description: 'Combine multiple properties of an object into a custom format.',
    examples: [
      { 
        expression: "phone | template:'(${code}) ${number}'", 
        input: '{ code: "11", number: "555-1234" }', 
        output: '"(11) 555-1234"',
        description: 'Format phone number'
      },
      { 
        expression: "address | template:'${street}, ${number}'", 
        input: '{ street: "Main St", number: "1234" }', 
        output: '"Main St, 1234"',
        description: 'Format address'
      },
      { 
        expression: "person | template:'${firstName} ${lastName}'", 
        input: '{ firstName: "John", lastName: "Doe" }', 
        output: '"John Doe"',
        description: 'Full name'
      },
      { 
        expression: "person | template:'${firstName | upperCase} ${lastName}'", 
        input: '{ firstName: "John", lastName: "Doe" }', 
        output: '"JOHN Doe"',
        description: 'With nested expression'
      },
      { 
        expression: "invoice | template:'Total: ${total | currency:\"USD\"}'", 
        input: '{ total: 1234.56 }', 
        output: '"Total: $1,234.56"',
        description: 'With currency formatting'
      },
      { 
        expression: "doc | template:'${type}: ${number | padLeft:10:\"0\"}'", 
        input: '{ type: "INV", number: "123" }', 
        output: '"INV: 0000000123"',
        description: 'Combining expressions'
      },
    ]
  },
  conditions: {
    title: 'Print Conditions',
    icon: '🔍',
    description: 'Boolean expressions to control when elements, groups, or sections are printed.',
    examples: [
      // Basic comparisons
      { expression: 'invoice.total > 0', input: '{ total: 1500 }', output: 'true', description: 'Greater than' },
      { expression: 'invoice.total >= 1000', input: '{ total: 1000 }', output: 'true', description: 'Greater or equal' },
      { expression: 'invoice.total < 500', input: '{ total: 300 }', output: 'true', description: 'Less than' },
      { expression: 'invoice.total <= 100', input: '{ total: 100 }', output: 'true', description: 'Less or equal' },
      { expression: 'invoice.status == "paid"', input: '{ status: "paid" }', output: 'true', description: 'Equal (text)' },
      { expression: 'invoice.status != "cancelled"', input: '{ status: "pending" }', output: 'true', description: 'Not equal' },
      
      // Logical operators
      { expression: 'invoice.total > 0 && invoice.status == "paid"', input: '{ total: 100, status: "paid" }', output: 'true', description: 'Logical AND' },
      { expression: 'invoice.urgent || invoice.priority == "high"', input: '{ urgent: false, priority: "high" }', output: 'true', description: 'Logical OR' },
      { expression: '!invoice.cancelled', input: '{ cancelled: false }', output: 'true', description: 'Negation (NOT)' },
      
      // Arrays and lists
      { expression: 'invoice.items.length > 0', input: '{ items: [{}, {}] }', output: 'true', description: 'Non-empty array' },
      { expression: 'invoice.items.length >= 5', input: '{ items: [1,2,3,4,5] }', output: 'true', description: 'Array with minimum items' },
      { expression: 'invoice.taxes.length > 1', input: '{ taxes: [{}, {}] }', output: 'true', description: 'Multiple taxes' },
      
      // Existence check
      { expression: 'invoice.discount != null', input: '{ discount: 10 }', output: 'true', description: 'Field exists and not null' },
      { expression: 'invoice.notes != ""', input: '{ notes: "Note..." }', output: 'true', description: 'Field is not empty' },
      
      // Boolean values
      { expression: 'invoice.paid', input: '{ paid: true }', output: 'true', description: 'Boolean field true' },
      { expression: 'invoice.hasDiscount', input: '{ hasDiscount: true }', output: 'true', description: 'Flag active' },
      { expression: '!invoice.draft', input: '{ draft: false }', output: 'true', description: 'Flag inactive (negated)' },
      
      // Compound conditions
      { expression: '(invoice.type == "A" || invoice.type == "B") && invoice.total > 0', input: '{ type: "A", total: 100 }', output: 'true', description: 'Condition with parentheses' },
      { expression: 'invoice.items.length > 0 && invoice.status != "cancelled"', input: '{ items: [{}], status: "active" }', output: 'true', description: 'Multiple conditions' },
    ]
  },
  utils: {
    title: 'Utilities',
    icon: '🛠️',
    description: 'Helper functions and default values.',
    examples: [
      { expression: "name | default:'Not provided'", input: '""', output: '"Not provided"', description: 'Default if empty' },
      { expression: "name | default:'N/A'", input: 'null', output: '"N/A"', description: 'Default if null' },
      { expression: 'text | length', input: '"Hello world"', output: '11', description: 'String length' },
    ]
  }
}

export default function HelpModal({ isOpen, onClose, initialTab = 'text' }: HelpModalProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabId>(initialTab)
  const [copiedExpression, setCopiedExpression] = useState<string | null>(null)

  
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
    }
  }, [isOpen, initialTab])

  // Copy expression to clipboard
  const copyToClipboard = async (expression: string) => {
    try {
      await navigator.clipboard.writeText(expression)
      setCopiedExpression(expression)
      setTimeout(() => setCopiedExpression(null), 2000)
    } catch (err) {
      console.error('Error copying:', err)
    }
  }

  if (!isOpen) return null

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'text', label: t.help.tabs.text, icon: '📝' },
    { id: 'numbers', label: t.help.tabs.numbers, icon: '🔢' },
    { id: 'dates', label: t.help.tabs.dates, icon: '📅' },
    { id: 'lists', label: t.help.tabs.lists, icon: '📋' },
    { id: 'template', label: t.help.tabs.template, icon: '🧩' },
    { id: 'conditions', label: t.help.tabs.conditions, icon: '🔍' },
    { id: 'utils', label: t.help.tabs.utils, icon: '🛠️' },
  ]

  const currentTab = tabsContent[activeTab]

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="theme-surface border theme-border rounded-xl shadow-2xl w-[900px] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b theme-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">📚</span>
            </div>
            <div>
              <h2 className="text-xl font-bold theme-text">{t.help.title}</h2>
              <p className="text-sm theme-text-muted">{t.help.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:theme-bg-tertiary rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Intro */}
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
          <div className="space-y-2">
            <p className="text-sm text-blue-800">
              <strong>Data Binding:</strong> Use <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono text-blue-900">field | expression</code> to 
              transform data. Chain expressions: 
              <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono text-blue-900 ml-1">name | upperCase | truncate:20</code>
            </p>
            <p className="text-sm text-blue-800">
              <strong>Conditions:</strong> Use boolean expressions to control printing: 
              <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono text-blue-900 ml-1">invoice.total {'>'} 0 && items.length {'>'} 1</code>
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b theme-border px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent theme-text-muted hover:theme-text hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold theme-text flex items-center gap-2">
              <span>{currentTab.icon}</span>
              {currentTab.title}
            </h3>
            <p className="text-sm theme-text-secondary mt-1">{currentTab.description}</p>
          </div>

          <div className="space-y-3">
            {currentTab.examples.map((example, index) => (
              <div
                key={index}
                className="theme-bg-tertiary rounded-lg p-4 border theme-border hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-gray-800 text-green-400 px-3 py-1.5 rounded flex-1 select-all">
                        {example.expression}
                      </code>
                      <button
                        onClick={() => copyToClipboard(example.expression)}
                        className={`p-1.5 rounded transition-colors ${
                          copiedExpression === example.expression
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-200 theme-text-secondary hover:bg-gray-300'
                        }`}
                        title={t.help.copyExpression}
                      >
                        {copiedExpression === example.expression ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {example.description && (
                      <p className="text-sm theme-text-secondary mt-2">{example.description}</p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">{t.help.input}:</span>
                    <code className="bg-white px-2 py-1 rounded border theme-border font-mono theme-text">
                      {example.input}
                    </code>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">{t.help.output}:</span>
                    <code className="bg-green-50 px-2 py-1 rounded border border-green-200 font-mono text-green-700">
                      {example.output}
                    </code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t theme-border theme-bg-tertiary rounded-b-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="text-xs theme-text-muted">
                💡 {t.help.tip}
              </p>
              <a
                href="https://adilsoncruz.github.io/open-pdf-generator/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {t.help.fullDocumentation}
              </a>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              {t.common.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

