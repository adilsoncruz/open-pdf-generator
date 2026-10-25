import { useTemplateStore } from '../../../store/templateStore'
import { TextArea } from '../../atoms'
import { NumberField } from '../../molecules'
import { PanelHeader } from '../PanelHeader'
import { useTranslation } from '../../../i18n'

export function HeaderPropertiesPanel() {
  const { t } = useTranslation()
  const { template, updateHeader } = useTemplateStore()
  
  if (!template.pageSettings.header) {
    return (
      <div className="w-[360px] theme-bg-secondary border-l theme-border flex flex-col h-full">
        <PanelHeader title={t.properties.headerProperties} />
        <div className="p-4">
        <p className="text-sm theme-text-muted">{t.properties.headerNotExist}</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="w-[360px] theme-bg-secondary border-l theme-border flex flex-col h-full">
      <PanelHeader title={t.properties.headerProperties} subtitle={t.properties.headerTopPage} />
      
      <div className="flex-1 overflow-y-auto p-4">
      {/* Info */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-center">
          <svg 
            className="w-4 h-4 mr-2 text-blue-600" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
          </svg>
          <span className="text-xs font-semibold text-blue-800">
            Header
          </span>
        </div>
        <p className="text-xs text-blue-700 mt-1">
          {t.properties.headerTopPage}
        </p>
      </div>
      
      {/* Altura */}
      <div className="mb-4">
        <NumberField
          label={t.properties.heightPt}
          value={template.pageSettings.header.height}
          onValueChange={(value) => updateHeader({ height: value || 0 })}
          min={0}
          step={1}
        />
      </div>
      
      {/* Print Condition */}
      <div className="mb-4">
        <label className="block text-xs font-semibold theme-text mb-2">
          {t.properties.printCondition}
        </label>
        <TextArea
          value={template.pageSettings.header.printCondition || ''}
          onChange={(e) => updateHeader({ printCondition: e.target.value || undefined })}
          placeholder="Ex: pageNumber > 1"
          rows={3}
          className="font-mono"
        />
        <p className="text-xs theme-text-muted mt-1">
          {t.properties.printConditionHelp}
        </p>
        <ul className="text-xs theme-text-muted mt-1 ml-4 list-disc">
          <li><code>pageNumber &gt; 1</code></li>
          <li><code>invoice.showHeader === true</code></li>
        </ul>
      </div>
      </div>
    </div>
  )
}

/**
 * Component to display and edit footer properties
 */

