import { useTranslation } from '../../../i18n'
import { Button, Icon } from '../../atoms'

interface DataPanelToolbarProps {
  onLoadFromFile: () => void
  onGenerateFromSchema: () => void
  onFormat: () => void
  onMinify: () => void
  isValid: boolean
  hasSchema: boolean
}

export function DataPanelToolbar({
  onLoadFromFile,
  onGenerateFromSchema,
  onFormat,
  onMinify,
  isValid,
  hasSchema,
}: DataPanelToolbarProps) {
  const { t } = useTranslation()

  return (
    <div className="flex gap-2 mb-4 flex-wrap flex-shrink-0">
      <Button
        onClick={onLoadFromFile}
        variant="primary"
        size="sm"
        className="bg-green-600 hover:bg-green-700"
      >
        <Icon name="folder" size="sm" />
        {t.dataPanel.loadFile}
      </Button>

      {hasSchema && (
        <Button
          onClick={onGenerateFromSchema}
          variant="secondary"
          size="sm"
          title="Gera dados de teste compatíveis com o Schema do template"
        >
          <span className="font-mono text-xs">⚡</span>
          Gerar do Schema
        </Button>
      )}

      <Button
        onClick={onFormat}
        disabled={!isValid}
        variant="secondary"
        size="sm"
      >
        <Icon name="settings" size="sm" />
        {t.dataPanel.format}
      </Button>

      <Button
        onClick={onMinify}
        disabled={!isValid}
        variant="secondary"
        size="sm"
      >
        <Icon name="code" size="sm" />
        {t.dataPanel.minify}
      </Button>
    </div>
  )
}
