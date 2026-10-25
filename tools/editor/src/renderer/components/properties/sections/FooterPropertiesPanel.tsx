import { useTemplateStore } from '../../../store/templateStore'
import { Icon, TextArea } from '../../atoms'
import { NumberField } from '../../molecules'
import { PanelHeader } from '../PanelHeader'
import { useTranslation } from '../../../i18n'

export function FooterPropertiesPanel() {
  const { t } = useTranslation()
  const { template, updateFooter } = useTemplateStore()
  
  if (!template.pageSettings.footer) {
    return (
      <div className="w-[360px] theme-bg-secondary border-l theme-border flex flex-col h-full">
        <PanelHeader title={t.properties.footerProperties} />
        <div className="p-4">
        <p className="text-sm theme-text-muted">{t.properties.footerNotExist}</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="w-[360px] theme-bg-secondary border-l theme-border flex flex-col h-full">
      <PanelHeader title={t.properties.footerProperties} subtitle={t.properties.footerBottomPage} />
      
      <div className="flex-1 overflow-y-auto p-4">
      {/* Info */}
      <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg">
        <div className="flex items-center">
          <Icon name="section" size="sm" className="mr-2 text-orange-600 dark:text-orange-400" />
          <span className="text-xs font-semibold text-orange-800 dark:text-orange-300">
            Footer
          </span>
        </div>
        <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
          {t.properties.footerBottomPage}
        </p>
      </div>
      
      {/* Altura */}
      <div className="mb-4">
        <NumberField
          label={t.properties.heightPt}
          value={template.pageSettings.footer.height}
          onValueChange={(value) => updateFooter({ height: value || 0 })}
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
          value={template.pageSettings.footer.printCondition || ''}
          onChange={(e) => updateFooter({ printCondition: e.target.value || undefined })}
          placeholder="Ex: pageNumber > 1"
          rows={3}
          className="font-mono"
        />
        <p className="text-xs theme-text-muted mt-1">
          {t.properties.printConditionHelp}
        </p>
        <ul className="text-xs theme-text-muted mt-1 ml-4 list-disc">
          <li><code>pageNumber &gt; 1</code></li>
          <li><code>invoice.showFooter === true</code></li>
        </ul>
      </div>
      </div>
    </div>
  )
}

