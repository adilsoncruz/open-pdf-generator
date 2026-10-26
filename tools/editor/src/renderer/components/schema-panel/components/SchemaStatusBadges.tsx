import type { ErrorObject } from 'ajv'

interface SchemaStatusBadgesProps {
  isSchemaEmpty: boolean
  isJsonValid: boolean
  schemaError: string | null
  dataErrors: ErrorObject[]
}

export function SchemaStatusBadges({
  isSchemaEmpty,
  isJsonValid,
  schemaError,
  dataErrors,
}: SchemaStatusBadgesProps) {
  return (
    <div className="flex items-center gap-3 text-xs flex-wrap">
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-medium ${
          isSchemaEmpty
            ? 'bg-slate-800/60 border-slate-700 text-slate-400'
            : isJsonValid && !schemaError
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isSchemaEmpty
              ? 'bg-slate-400'
              : isJsonValid && !schemaError
                ? 'bg-emerald-400'
                : 'bg-red-400'
          }`}
        />
        {isSchemaEmpty
          ? 'Nenhum schema definido (opcional)'
          : isJsonValid && !schemaError
            ? 'Schema Sintaticamente Válido'
            : 'Erro no Schema'}
      </div>

      {!isSchemaEmpty && isJsonValid && !schemaError && (
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-medium ${
            dataErrors.length === 0
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              dataErrors.length === 0 ? 'bg-emerald-400' : 'bg-amber-400'
            }`}
          />
          {dataErrors.length === 0
            ? 'Dados de Teste: Válidos contra o Schema'
            : `Dados de Teste: ${dataErrors.length} violação(ões)`}
        </div>
      )}
    </div>
  )
}
