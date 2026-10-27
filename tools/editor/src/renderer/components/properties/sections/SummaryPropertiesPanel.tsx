import { useTemplateStore } from '../../../store/templateStore'
import { useTranslation } from '../../../i18n'

export function SummaryPropertiesPanel() {
  const { t } = useTranslation()
  const { template, updateSummaryPage } = useTemplateStore()
  
  if (!template.summaryPage) {
    return (
      <div className="w-[360px] theme-bg-secondary border-l theme-border p-4">
        <p className="text-sm theme-text-muted">{t.properties.summaryNotExist}</p>
      </div>
    )
  }
  
  return (
    <div className="w-[360px] theme-bg-secondary border-l theme-border p-4 overflow-y-auto">
      <h2 className="text-sm font-semibold theme-text border-b pb-3 mb-3">
        {t.properties.summaryProperties}
      </h2>
      
      {/* Info */}
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center">
          <svg 
            className="w-4 h-4 mr-2 text-green-600" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-xs font-semibold text-green-800">
            {t.properties.summaryProperties}
          </span>
        </div>
        <p className="text-xs text-green-700 mt-1">
          {t.properties.summaryDescription}
        </p>
      </div>
      
      {/* Print Condition */}
      <div className="mb-4">
        <label className="block text-xs font-semibold theme-text mb-2">
          {t.properties.printCondition}
        </label>
        <textarea
          value={template.summaryPage.printCondition || ''}
          onChange={(e) => updateSummaryPage({ printCondition: e.target.value || undefined })}
          className="w-full px-3 py-2 text-xs border theme-border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono"
          placeholder="Ex: invoice.showSummary === true"
          rows={3}
        />
        <p className="text-xs theme-text-muted mt-1">
          {t.properties.printConditionHelp}
        </p>
        <ul className="text-xs theme-text-muted mt-1 ml-4 list-disc">
          <li><code>invoice.showSummary === true</code></li>
          <li><code>items.length &gt; 10</code></li>
          <li><code>invoice.total &gt; 1000</code></li>
        </ul>
      </div>
    </div>
  )
}

/**
 * Component to display and edit header properties
 */

