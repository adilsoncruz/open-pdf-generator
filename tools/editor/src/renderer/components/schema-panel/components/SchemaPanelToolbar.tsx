import { Button, Icon } from '../../atoms'

interface SchemaPanelToolbarProps {
  onFormat: () => void
  onInferFromData: () => void
  onGenerateTestData: () => void
  onLoadSample: () => void
  onOpenSearch: () => void
  onClear: () => void
  onSave: () => void
  isJsonValid: boolean
  isSchemaEmpty: boolean
  hasSchemaError: boolean
  hasActiveSchema: boolean
  isSaved: boolean
  dataGeneratedNotice: boolean
}

export function SchemaPanelToolbar({
  onFormat,
  onInferFromData,
  onGenerateTestData,
  onLoadSample,
  onOpenSearch,
  onClear,
  onSave,
  isJsonValid,
  isSchemaEmpty,
  hasSchemaError,
  hasActiveSchema,
  isSaved,
  dataGeneratedNotice,
}: SchemaPanelToolbarProps) {
  return (
    <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/20 flex items-center justify-between gap-2 flex-wrap">
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          onClick={onFormat}
          disabled={!isJsonValid || isSchemaEmpty}
          variant="secondary"
          size="sm"
        >
          <Icon name="settings" size="sm" />
          Formatar
        </Button>
        <Button
          onClick={onInferFromData}
          variant="secondary"
          size="sm"
          title="Gera um JSON Schema baseado nos dados de teste atuais"
        >
          <span className="font-mono text-xs">⚡</span>
          Inferir dos Dados
        </Button>
        <Button
          onClick={onGenerateTestData}
          disabled={!isJsonValid || isSchemaEmpty || hasSchemaError}
          variant="secondary"
          size="sm"
          title="Gera dados de teste compatíveis com este Schema e atualiza o Test Data"
        >
          <span className="font-mono text-xs">⚡</span>
          Gerar Dados de Teste
        </Button>
        {dataGeneratedNotice && (
          <span className="text-xs text-emerald-400 font-medium px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
            ✓ Dados gerados!
          </span>
        )}
        <Button
          onClick={onLoadSample}
          variant="secondary"
          size="sm"
          title="Carrega exemplo de JSON Schema"
        >
          Exemplo
        </Button>
        <Button
          onClick={onOpenSearch}
          variant="secondary"
          size="sm"
        >
          <Icon name="search" size="sm" />
          Buscar (Ctrl+F)
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {hasActiveSchema && (
          <Button
            onClick={onClear}
            variant="danger"
            size="sm"
          >
            Remover Schema
          </Button>
        )}
        <Button
          onClick={onSave}
          disabled={!isJsonValid || hasSchemaError}
          variant="primary"
          size="sm"
          className={isSaved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}
        >
          {isSaved ? '✓ Salvo no Template!' : 'Salvar no Template'}
        </Button>
      </div>
    </div>
  )
}
