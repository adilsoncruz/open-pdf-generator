import { useState, useEffect, useCallback, type KeyboardEvent, type RefObject } from 'react'
import { useTemplateStore } from '../../../store/templateStore'
import { usePreviewStore } from '../../../store/previewStore'
import { useTranslation } from '../../../i18n'
import { generateSampleFromSchema } from '../../../utils/schemaGenerator'
import { validateJson } from '../utils/validateJson'

interface UseJsonEditorProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>
  lineNumbersRef: RefObject<HTMLDivElement | null>
  onClose: () => void
}

export function useJsonEditor({
  textareaRef,
  lineNumbersRef,
  onClose,
}: UseJsonEditorProps) {
  const { t } = useTranslation()
  const { testData, setTestData, template } = useTemplateStore()
  const { mode: previewMode, triggerRefresh } = usePreviewStore()

  const [jsonInput, setJsonInput] = useState(() => JSON.stringify(testData, null, 2))
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(true)
  const [errorLine, setErrorLine] = useState<number | null>(null)

  useEffect(() => {
    const result = validateJson(jsonInput)
    setIsValid(result.valid)
    setErrorLine(result.errorLine)
    if (!result.valid) {
      setError(result.error)
    } else {
      setError(null)
    }
  }, [jsonInput])

  const handleScroll = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }, [textareaRef, lineNumbersRef])

  const handleApply = () => {
    try {
      const parsed = JSON.parse(jsonInput)
      setTestData(parsed)
      setError(null)
      if (previewMode !== 'hidden') {
        triggerRefresh()
      }
      onClose()
    } catch (e) {
      setError(`${t.dataPanel.invalidJson}: ${(e as Error).message}`)
    }
  }

  const handleEditorKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current
    if (!textarea) return

    if (e.key === 'Tab') {
      e.preventDefault()
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const value = textarea.value

      if (e.shiftKey) {
        const beforeCursor = value.substring(0, start)
        const lastNewLine = beforeCursor.lastIndexOf('\n')
        const lineStart = lastNewLine + 1
        const lineContent = value.substring(lineStart, start)
        const spacesMatch = lineContent.match(/^( {1,2}|\t)/)
        if (spacesMatch) {
          const spacesToRemove = spacesMatch[0].length
          const newValue = value.substring(0, lineStart) + value.substring(lineStart + spacesToRemove)
          setJsonInput(newValue)
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = Math.max(start - spacesToRemove, lineStart)
          }, 0)
        }
      } else {
        const newValue = value.substring(0, start) + '  ' + value.substring(end)
        setJsonInput(newValue)
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2
        }, 0)
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      const start = textarea.selectionStart
      const value = textarea.value

      const beforeCursor = value.substring(0, start)
      const lastNewLine = beforeCursor.lastIndexOf('\n')
      const currentLine = beforeCursor.substring(lastNewLine + 1)
      const indentMatch = currentLine.match(/^(\s*)/)
      let indent = indentMatch ? indentMatch[1] : ''

      const charBefore = value[start - 1]
      const charAfter = value[start]
      const addIndent = charBefore === '{' || charBefore === '['
      const closingBracket = (charBefore === '{' && charAfter === '}') || (charBefore === '[' && charAfter === ']')

      if (addIndent) {
        indent += '  '
      }

      let newValue: string
      let newCursorPos: number

      if (closingBracket) {
        const baseIndent = indentMatch ? indentMatch[1] : ''
        newValue = value.substring(0, start) + '\n' + indent + '\n' + baseIndent + value.substring(start)
        newCursorPos = start + 1 + indent.length
      } else {
        newValue = value.substring(0, start) + '\n' + indent + value.substring(start)
        newCursorPos = start + 1 + indent.length
      }

      setJsonInput(newValue)
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = newCursorPos
      }, 0)
    }

    if ((e.ctrlKey || e.metaKey) && e.key === ']') {
      e.preventDefault()
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const value = textarea.value

      const beforeCursor = value.substring(0, start)
      const lastNewLine = beforeCursor.lastIndexOf('\n')
      const lineStart = lastNewLine + 1

      const newValue = value.substring(0, lineStart) + '  ' + value.substring(lineStart)
      setJsonInput(newValue)
      setTimeout(() => {
        textarea.selectionStart = start + 2
        textarea.selectionEnd = end + 2
      }, 0)
    }

    if ((e.ctrlKey || e.metaKey) && e.key === '[') {
      e.preventDefault()
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const value = textarea.value

      const beforeCursor = value.substring(0, start)
      const lastNewLine = beforeCursor.lastIndexOf('\n')
      const lineStart = lastNewLine + 1
      const lineContent = value.substring(lineStart)

      const spacesMatch = lineContent.match(/^( {1,2}|\t)/)
      if (spacesMatch) {
        const spacesToRemove = spacesMatch[0].length
        const newValue = value.substring(0, lineStart) + value.substring(lineStart + spacesToRemove)
        setJsonInput(newValue)
        setTimeout(() => {
          textarea.selectionStart = Math.max(start - spacesToRemove, lineStart)
          textarea.selectionEnd = Math.max(end - spacesToRemove, lineStart)
        }, 0)
      }
    }
  }

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonInput)
      setJsonInput(JSON.stringify(parsed, null, 2))
      setError(null)
    } catch {
      setError(t.dataPanel.cannotFormat)
    }
  }

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(jsonInput)
      setJsonInput(JSON.stringify(parsed))
      setError(null)
    } catch {
      setError(t.dataPanel.cannotMinify)
    }
  }

  const handleLoadFromFile = async () => {
    try {
      const result = await window.electronAPI.openDataFile()
      if (result) {
        setJsonInput(result.content)
        setError(null)
      }
    } catch (e) {
      setError(`${t.dataPanel.errorLoading}: ${(e as Error).message}`)
    }
  }

  const handleGenerateFromSchema = () => {
    if (!template.schema) return
    if (jsonInput.trim() && jsonInput.trim() !== '{}') {
      if (!confirm('Deseja substituir os dados de teste atuais pelos dados gerados a partir do Schema?')) {
        return
      }
    }
    const sample = generateSampleFromSchema(template.schema)
    setJsonInput(JSON.stringify(sample, null, 2))
    setError(null)
  }

  return {
    jsonInput,
    setJsonInput,
    error,
    isValid,
    errorLine,
    lineCount: jsonInput.split('\n').length,
    handleScroll,
    handleEditorKeyDown,
    handleApply,
    handleFormat,
    handleMinify,
    handleLoadFromFile,
    handleGenerateFromSchema,
    hasSchema: !!template.schema,
  }
}
