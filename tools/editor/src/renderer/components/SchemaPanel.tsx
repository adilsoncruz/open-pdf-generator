import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react'
import Ajv, { type ErrorObject } from 'ajv'
import { useTemplateStore } from '../store/templateStore'
import { usePreviewStore } from '../store/previewStore'
import { Button, Icon } from './atoms'
import { generateSampleFromSchema } from '../utils/schemaGenerator'

interface SchemaPanelProps {
  onClose: () => void
}

const ajv = new Ajv({ allErrors: true, strict: false })

function validateJson(value: string): { valid: boolean; error: string | null; errorLine: number | null } {
  if (!value.trim()) {
    return { valid: true, error: null, errorLine: null }
  }
  try {
    JSON.parse(value)
    return { valid: true, error: null, errorLine: null }
  } catch (e) {
    const errorMessage = (e as Error).message
    const lineMatch = errorMessage.match(/position (\d+)/)
    let errorLine: number | null = null
    if (lineMatch) {
      const position = parseInt(lineMatch[1], 10)
      const beforeError = value.substring(0, position)
      errorLine = (beforeError.match(/\n/g) || []).length + 1
    }
    return { valid: false, error: errorMessage, errorLine }
  }
}

function inferSchemaFromData(data: unknown): Record<string, any> {
  if (data === null || data === undefined) {
    return { type: 'null' }
  }
  if (Array.isArray(data)) {
    return {
      type: 'array',
      items: data.length > 0 ? inferSchemaFromData(data[0]) : { type: 'object' },
    }
  }
  if (typeof data === 'object') {
    const properties: Record<string, any> = {}
    const required: string[] = []
    for (const [key, val] of Object.entries(data)) {
      properties[key] = inferSchemaFromData(val)
      required.push(key)
    }
    return {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties,
      required,
    }
  }
  if (typeof data === 'number') {
    return Number.isInteger(data) ? { type: 'integer' } : { type: 'number' }
  }
  if (typeof data === 'boolean') {
    return { type: 'boolean' }
  }
  return { type: 'string' }
}

export default function SchemaPanel({ onClose }: SchemaPanelProps) {
  const { template, setSchema, testData } = useTemplateStore()
  const { triggerRefresh } = usePreviewStore()

  const initialJson = template.schema
    ? JSON.stringify(template.schema, null, 2)
    : ''

  const [jsonInput, setJsonInput] = useState(initialJson)
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [isJsonValid, setIsJsonValid] = useState(true)
  const [errorLine, setErrorLine] = useState<number | null>(null)

  const [schemaError, setSchemaError] = useState<string | null>(null)
  const [dataErrors, setDataErrors] = useState<ErrorObject[]>([])
  const [isSaved, setIsSaved] = useState(false)
  const [dataGeneratedNotice, setDataGeneratedNotice] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchMatches, setSearchMatches] = useState<number[]>([])
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const [caseSensitive, setCaseSensitive] = useState(false)

  // Validate JSON & Schema in real time
  useEffect(() => {
    const jsonRes = validateJson(jsonInput)
    setIsJsonValid(jsonRes.valid)
    setErrorLine(jsonRes.errorLine)
    setJsonError(jsonRes.error)

    if (!jsonRes.valid || !jsonInput.trim()) {
      setSchemaError(null)
      setDataErrors([])
      return
    }

    try {
      const parsedSchema = JSON.parse(jsonInput)
      const validate = ajv.compile(parsedSchema)
      setSchemaError(null)

      // Test data against schema
      const valid = validate(testData || {})
      if (!valid && validate.errors) {
        setDataErrors(validate.errors)
      } else {
        setDataErrors([])
      }
    } catch (e) {
      setSchemaError((e as Error).message)
      setDataErrors([])
    }
  }, [jsonInput, testData])

  // Search logic
  useEffect(() => {
    if (!searchTerm) {
      setSearchMatches([])
      setCurrentMatchIndex(0)
      return
    }

    const matches: number[] = []
    const searchText = caseSensitive ? jsonInput : jsonInput.toLowerCase()
    const term = caseSensitive ? searchTerm : searchTerm.toLowerCase()

    let index = searchText.indexOf(term)
    while (index !== -1) {
      matches.push(index)
      index = searchText.indexOf(term, index + 1)
    }

    setSearchMatches(matches)
    setCurrentMatchIndex((prev) => {
      if (matches.length === 0) return 0
      if (prev >= matches.length) return 0
      return prev
    })
  }, [searchTerm, jsonInput, caseSensitive])

  const scrollToMatch = useCallback((pos: number) => {
    if (!textareaRef.current) return
    const textarea = textareaRef.current
    textarea.focus()
    textarea.setSelectionRange(pos, pos + searchTerm.length)

    const textBefore = jsonInput.substring(0, pos)
    const lineIndex = (textBefore.match(/\n/g) || []).length
    const lineHeight = 20
    const targetScroll = Math.max(0, lineIndex * lineHeight - 100)
    textarea.scrollTop = targetScroll
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = targetScroll
    }
  }, [jsonInput, searchTerm])

  const goToNextMatch = useCallback(() => {
    if (searchMatches.length === 0) return
    const nextIndex = (currentMatchIndex + 1) % searchMatches.length
    setCurrentMatchIndex(nextIndex)
    scrollToMatch(searchMatches[nextIndex])
  }, [currentMatchIndex, searchMatches, scrollToMatch])

  const goToPrevMatch = useCallback(() => {
    if (searchMatches.length === 0) return
    const prevIndex = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length
    setCurrentMatchIndex(prevIndex)
    scrollToMatch(searchMatches[prevIndex])
  }, [currentMatchIndex, searchMatches, scrollToMatch])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault()
      setShowSearch(true)
      setTimeout(() => searchInputRef.current?.focus(), 50)
      return
    }

    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = textareaRef.current
      if (!textarea) return
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = jsonInput.substring(0, start) + '  ' + jsonInput.substring(end)
      setJsonInput(newValue)
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      }, 0)
    }
  }

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }

  const handleSave = () => {
    if (!jsonInput.trim()) {
      setSchema(null)
      setIsSaved(true)
      triggerRefresh()
      setTimeout(() => setIsSaved(false), 2000)
      return
    }
    const jsonRes = validateJson(jsonInput)
    if (!jsonRes.valid) return

    try {
      const parsed = JSON.parse(jsonInput)
      ajv.compile(parsed)
      setSchema(parsed)
      setIsSaved(true)
      triggerRefresh()
      setTimeout(() => setIsSaved(false), 2000)
    } catch (e) {
      setSchemaError((e as Error).message)
    }
  }

  const handleClear = () => {
    if (confirm('Deseja remover a validação de schema do template?')) {
      setJsonInput('')
      setSchema(null)
      triggerRefresh()
    }
  }

  const handleFormat = () => {
    if (!jsonInput.trim()) return
    try {
      const parsed = JSON.parse(jsonInput)
      setJsonInput(JSON.stringify(parsed, null, 2))
    } catch {
      // Ignora se inválido
    }
  }

  const handleInferFromData = () => {
    const inferred = inferSchemaFromData(testData || {})
    setJsonInput(JSON.stringify(inferred, null, 2))
  }

  const handleGenerateTestData = () => {
    if (!jsonInput.trim()) return
    try {
      const parsed = JSON.parse(jsonInput)
      if (testData && Object.keys(testData).length > 0) {
        if (!confirm('Deseja substituir os dados de teste atuais pelos dados gerados a partir deste Schema?')) {
          return
        }
      }
      const sample = generateSampleFromSchema(parsed)
      useTemplateStore.getState().setTestData(sample)
      setDataGeneratedNotice(true)
      triggerRefresh()
      setTimeout(() => setDataGeneratedNotice(false), 2500)
    } catch (e) {
      setSchemaError((e as Error).message)
    }
  }

  const handleLoadSample = () => {
    const sample = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        customerName: { type: 'string', minLength: 2 },
        totalAmount: { type: 'number', minimum: 0 },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              description: { type: 'string' },
              quantity: { type: 'integer', minimum: 1 },
              price: { type: 'number', minimum: 0 }
            },
            required: ['description', 'quantity', 'price']
          }
        }
      },
      required: ['customerName', 'totalAmount']
    }
    setJsonInput(JSON.stringify(sample, null, 2))
  }

  const lineCount = Math.max(jsonInput.split('\n').length, 18)
  const isSchemaEmpty = !jsonInput.trim()
  const hasErrors = !isJsonValid || !!schemaError || dataErrors.length > 0

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col text-slate-200 overflow-hidden"
        onKeyDown={(e) => {
          if (e.key === 'Escape' && !showSearch) {
            onClose()
          }
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono text-xs font-bold">
              {`{ }`}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-100">Schema Validation</h2>
                <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  JSON Schema
                </span>
                {template.schema && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Ativo no Template
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Define o contrato de dados do PDF. Não obrigatório no template.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            title="Fechar (Esc)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Toolbar de Ações */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/20 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={handleFormat}
              disabled={!isJsonValid || isSchemaEmpty}
              variant="secondary"
              size="sm"
            >
              <Icon name="settings" size="sm" />
              Formatar
            </Button>
            <Button
              onClick={handleInferFromData}
              variant="secondary"
              size="sm"
              title="Gera um JSON Schema baseado nos dados de teste atuais"
            >
              <span className="font-mono text-xs">⚡</span>
              Inferir dos Dados
            </Button>
            <Button
              onClick={handleGenerateTestData}
              disabled={!isJsonValid || isSchemaEmpty || !!schemaError}
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
              onClick={handleLoadSample}
              variant="secondary"
              size="sm"
              title="Carrega exemplo de JSON Schema"
            >
              Exemplo
            </Button>
            <Button
              onClick={() => {
                setShowSearch(true)
                setTimeout(() => searchInputRef.current?.focus(), 50)
              }}
              variant="secondary"
              size="sm"
            >
              <Icon name="search" size="sm" />
              Buscar (Ctrl+F)
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {template.schema && (
              <Button
                onClick={handleClear}
                variant="danger"
                size="sm"
              >
                Remover Schema
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={!isJsonValid || !!schemaError}
              variant="primary"
              size="sm"
              className={isSaved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}
            >
              {isSaved ? '✓ Salvo no Template!' : 'Salvar no Template'}
            </Button>
          </div>
        </div>

        {/* Editor Body */}
        <div className="p-6 flex-1 flex flex-col min-h-0 overflow-hidden gap-4">
          {/* Status Badges */}
          <div className="flex items-center gap-3 text-xs flex-wrap">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-medium ${
              isSchemaEmpty
                ? 'bg-slate-800/60 border-slate-700 text-slate-400'
                : isJsonValid && !schemaError
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                isSchemaEmpty
                  ? 'bg-slate-400'
                  : isJsonValid && !schemaError
                    ? 'bg-emerald-400'
                    : 'bg-red-400'
              }`} />
              {isSchemaEmpty
                ? 'Nenhum schema definido (opcional)'
                : isJsonValid && !schemaError
                  ? 'Schema Sintaticamente Válido'
                  : 'Erro no Schema'}
            </div>

            {!isSchemaEmpty && isJsonValid && !schemaError && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-medium ${
                dataErrors.length === 0
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  dataErrors.length === 0 ? 'bg-emerald-400' : 'bg-amber-400'
                }`} />
                {dataErrors.length === 0
                  ? 'Dados de Teste: Válidos contra o Schema'
                  : `Dados de Teste: ${dataErrors.length} violação(ões)`}
              </div>
            )}
          </div>

          {/* Search bar */}
          {showSearch && (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg shrink-0">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setShowSearch(false)
                    textareaRef.current?.focus()
                  } else if (e.key === 'Enter') {
                    e.preventDefault()
                    if (e.shiftKey) goToPrevMatch()
                    else goToNextMatch()
                  }
                }}
                className="flex-1 px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-indigo-500"
                placeholder="Buscar no schema..."
              />
              <span className="text-xs text-slate-400 min-w-[50px] text-center">
                {searchTerm ? (searchMatches.length > 0 ? `${currentMatchIndex + 1}/${searchMatches.length}` : '0') : ''}
              </span>
              <button
                onClick={goToPrevMatch}
                disabled={searchMatches.length === 0}
                className="p-1 hover:bg-slate-800 rounded text-slate-300 disabled:opacity-30"
                title="Anterior (Shift+Enter)"
              >
                ▲
              </button>
              <button
                onClick={goToNextMatch}
                disabled={searchMatches.length === 0}
                className="p-1 hover:bg-slate-800 rounded text-slate-300 disabled:opacity-30"
                title="Próxima (Enter)"
              >
                ▼
              </button>
              <button
                onClick={() => setCaseSensitive(!caseSensitive)}
                className={`px-1.5 py-0.5 text-xs rounded border ${
                  caseSensitive
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                    : 'border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                Aa
              </button>
              <button
                onClick={() => setShowSearch(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}

          {/* Code Editor */}
          <div className={`relative flex flex-1 min-h-[220px] rounded-lg border overflow-hidden bg-slate-950 font-mono text-xs ${
            !isJsonValid || schemaError
              ? 'border-red-500/60 ring-1 ring-red-500/30'
              : 'border-slate-800 focus-within:border-indigo-500/80'
          }`}>
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
              onChange={(e) => setJsonInput(e.target.value)}
              onScroll={handleScroll}
              onKeyDown={handleKeyDown}
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
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between text-xs text-slate-400">
          <div>
            Dica: Ao gerar PDF ou Preview, os dados serão validados contra este schema.
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  )
}
