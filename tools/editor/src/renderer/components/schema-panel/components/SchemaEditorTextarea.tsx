import { type KeyboardEvent, type RefObject } from 'react'
import type { ErrorObject } from 'ajv'

interface SchemaEditorTextareaProps {
  lineNumbersRef: RefObject<HTMLDivElement | null>
  textareaRef: RefObject<HTMLTextAreaElement | null>
  jsonInput: string
  onJsonInputChange: (value: string) => void
  onScroll: () => void
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void
  lineCount: number
  errorLine: number | null
  isJsonValid: boolean
  jsonError: string | null
  schemaError: string | null
  dataErrors: ErrorObject[]
}

export function SchemaEditorTextarea({
  lineNumbersRef,
  textareaRef,
  jsonInput,
  onJsonInputChange,
  onScroll,
  onKeyDown,
  lineCount,
  errorLine,
  isJsonValid,
  jsonError,
  schemaError,
  dataErrors,
}: SchemaEditorTextareaProps) {
  return (
    <>
      <div
        className={`relative flex flex-1 min-h-[220px] rounded-lg border overflow-hidden bg-slate-950 font-mono text-xs ${
          !isJsonValid || schemaError
            ? 'border-red-500/60 ring-1 ring-red-500/30'
            : 'border-slate-800 focus-within:border-indigo-500/80'
        }`}
      >
        {/* Line numbers */}
        <div
          ref={lineNumbersRef}
          className="flex-shrink-0 bg-slate-900/80 border-r border-slate-800 text-slate-500 text-right select-none py-2 px-2.5 overflow-hidden"
          style={{ minWidth: '3.2rem' }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div
              key={i + 1}
              className={`leading-5 ${errorLine === i + 1 ? 'text-red-400 font-bold bg-red-500/20 px-1 rounded' : ''}`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={jsonInput}
          onChange={(e) => onJsonInputChange(e.target.value)}
          onScroll={onScroll}
          onKeyDown={onKeyDown}
          placeholder="Cole ou edite seu JSON Schema aqui (ex: { &quot;type&quot;: &quot;object&quot;, ... })"
          className="flex-1 bg-transparent text-slate-200 p-2 leading-5 resize-none focus:outline-none whitespace-pre overflow-auto font-mono selection:bg-indigo-500/30"
          spellCheck={false}
        />
      </div>

      {/* Erro de sintaxe JSON */}
      {jsonError && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-300 flex items-start gap-2 shrink-0">
          <span className="font-bold">JSON Inválido:</span>
          <span className="font-mono">{jsonError}</span>
          {errorLine && <span className="text-red-400 font-semibold">(Linha {errorLine})</span>}
        </div>
      )}

      {/* Erro de validação da especificação do Schema */}
      {schemaError && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-300 flex items-start gap-2 shrink-0">
          <span className="font-bold">Erro no Schema:</span>
          <span className="font-mono">{schemaError}</span>
        </div>
      )}

      {/* Lista de Erros de Validação dos Dados de Teste contra o Schema */}
      {dataErrors.length > 0 && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-200 flex flex-col gap-1.5 max-h-36 overflow-auto shrink-0">
          <div className="font-semibold text-amber-300 flex items-center gap-1.5">
            <span>⚠️ Os dados de teste violam este Schema:</span>
          </div>
          <ul className="space-y-1 pl-4 list-disc text-amber-200/90 font-mono">
            {dataErrors.map((err, idx) => (
              <li key={idx}>
                <span className="text-amber-400 font-semibold">
                  {err.instancePath ? `$${err.instancePath}` : '$'}:
                </span>{' '}
                <span>{err.message}</span>{' '}
                <span className="text-slate-400 text-[11px]">({err.keyword})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
