import { useTemplateStore } from '../../../store/templateStore'
import { useTranslation } from '../../../i18n'

export function BackgroundPropertiesPanel() {
  const { t } = useTranslation()
  const { template, updateBodyBackground } = useTemplateStore()
  
  if (!template.pageSettings.bodyBackground) {
    return (
      <div className="w-[360px] theme-bg-secondary border-l theme-border p-4">
        <p className="text-sm theme-text-muted">{t.properties.backgroundNotExist}</p>
      </div>
    )
  }
  
  return (
    <div className="w-[360px] theme-bg-secondary border-l theme-border p-4 overflow-y-auto">
      <h2 className="text-sm font-semibold theme-text border-b pb-3 mb-3">
        {t.properties.backgroundProperties}
      </h2>
      
      {/* Info */}
      <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex items-center">
          <svg 
            className="w-4 h-4 mr-2 text-purple-600" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 3l18 18" />
          </svg>
          <span className="text-xs font-semibold text-purple-800">
            {t.properties.backgroundProperties}
          </span>
        </div>
        <p className="text-xs text-purple-700 mt-1">
          {t.properties.backgroundDescription}
        </p>
      </div>
      
      {/* Print Condition */}
      <div className="mb-4">
        <label className="block text-xs font-semibold theme-text mb-2">
          {t.properties.printCondition}
        </label>
        <textarea
          value={template.pageSettings.bodyBackground.printCondition || ''}
          onChange={(e) => updateBodyBackground({ printCondition: e.target.value || undefined })}
          className="w-full px-3 py-2 text-xs border theme-border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono"
          placeholder="Ex: invoice.showBackground === true"
          rows={3}
        />
        <p className="text-xs theme-text-muted mt-1">
          {t.properties.printConditionHelp}
        </p>
        <ul className="text-xs theme-text-muted mt-1 ml-4 list-disc">
          <li><code>invoice.showBackground === true</code></li>
          <li><code>pageNumber === 1</code></li>
        </ul>
      </div>
    </div>
  )
}


