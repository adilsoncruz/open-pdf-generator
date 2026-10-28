import { useState, type KeyboardEvent, type RefObject } from 'react'
import Ajv from 'ajv'
import { useTemplateStore } from '../../../store/templateStore'
import { usePreviewStore } from '../../../store/previewStore'
import { generateSampleFromSchema } from '../../../utils/schemaGenerator'
import { validateJson } from '../utils/validateJson'
import { inferSchemaFromData } from '../utils/schemaInference'

const ajv = new Ajv({ allErrors: true, strict: false })

interface UseSchemaActionsProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>
  lineNumbersRef: RefObject<HTMLDivElement | null>
  jsonInput: string
  setJsonInput: (value: string) => void
  setSchemaError: (error: string | null) => void
}

export function useSchemaActions({
  textareaRef,
  lineNumbersRef,
  jsonInput,
  setJsonInput,
  setSchemaError,
}: UseSchemaActionsProps) {
  const { setSchema, testData } = useTemplateStore()
  const { triggerRefresh } = usePreviewStore()

  const [isSaved, setIsSaved] = useState(false)
  const [dataGeneratedNotice, setDataGeneratedNotice] = useState(false)

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
              price: { type: 'number', minimum: 0 },
            },
            required: ['description', 'quantity', 'price'],
          },
        },
      },
      required: ['customerName', 'totalAmount'],
    }
    setJsonInput(JSON.stringify(sample, null, 2))
  }

  const handleTabIndent = (e: KeyboardEvent<HTMLTextAreaElement>) => {
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

  return {
    isSaved,
    dataGeneratedNotice,
    handleScroll,
    handleSave,
    handleClear,
    handleFormat,
    handleInferFromData,
    handleGenerateTestData,
    handleLoadSample,
    handleTabIndent,
  }
}
