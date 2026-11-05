import { useState, useEffect, useCallback } from 'react'
import { useTabStore } from '../../store/tabStore'
import type { Template } from '../../store/templateStore'
import type { AiProvider, PdfFileInfo } from './types'

interface UseAiByokOptions {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

// In-memory session cache: apiKey is never written to persistent cleartext storage
let sessionApiKey = ''

export const useAiByok = ({ isOpen, onClose, onSuccess }: UseAiByokOptions) => {
  const [provider, setProvider] = useState<AiProvider>('gemini')
  const [apiKey, setApiKey] = useState(sessionApiKey)
  const [model, setModel] = useState('gemini-2.5-flash')
  const [endpoint, setEndpoint] = useState('http://localhost:11434')
  const [inferBindings, setInferBindings] = useState(true)
  const [selectedFile, setSelectedFile] = useState<PdfFileInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const updateApiKey = useCallback((key: string) => {
    sessionApiKey = key
    setApiKey(key)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    // Clean up any legacy cleartext storage of sensitive data
    if (localStorage.getItem('open_pdf_ai_key')) {
      localStorage.removeItem('open_pdf_ai_key')
    }

    const savedProvider = localStorage.getItem('open_pdf_ai_provider') as AiProvider | null
    const savedModel = localStorage.getItem('open_pdf_ai_model')

    if (savedProvider) setProvider(savedProvider)
    if (savedModel) setModel(savedModel)
    if (sessionApiKey) setApiKey(sessionApiKey)
  }, [isOpen])

  const handleSaveSettings = useCallback(() => {
    localStorage.setItem('open_pdf_ai_provider', provider)
    localStorage.setItem('open_pdf_ai_model', model)
  }, [provider, model])

  const handleSelectPDF = useCallback(async () => {
    setErrorMessage(null)
    if (!window.electronAPI?.openPdfFile) {
      setErrorMessage('API de seleção de PDF não disponível.')
      return
    }
    const result = await window.electronAPI.openPdfFile()
    if (result) {
      setSelectedFile(result)
    }
  }, [])

  const handleConvertDirect = useCallback(async () => {
    if (!selectedFile) {
      setErrorMessage('Por favor, selecione um arquivo PDF primeiro.')
      return
    }
    if (provider !== 'ollama' && !apiKey.trim()) {
      setErrorMessage('Por favor, informe a chave de API do provedor.')
      return
    }

    handleSaveSettings()
    setIsLoading(true)
    setErrorMessage(null)
    setStatusMessage('Enviando documento para análise visual com IA...')

    const promptInstructions = `Você é um compilador de templates visuais para o Open PDF Generator.
Analise a página do PDF fornecido e gere um template JSON compatível com o engine Open PDF Generator.

REGRAS:
1. Dimensões: "size": "A4", "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 }.
2. ${
      inferBindings
        ? 'Separe títulos fixos de valores variáveis. Inferir variáveis: ex: Nome: Fulano -> staticText "Nome: " e textField com dataBinding: "cliente.nome". Se houver grade ou itens em lista, gere elemento do tipo "table" com dataBinding e array columns.'
        : 'Crie elementos estáticos type: "text", "line", "rectangle" preservando as posições exatas.'
    }
3. Formato JSON estrito:
{
  "version": "1.0",
  "metadata": { "name": "${selectedFile.name.replace(/\.pdf$/i, '')}", "description": "Importado via IA" },
  "pageSettings": {
    "size": "A4",
    "orientation": "portrait",
    "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 }
  },
  "page": [
    { "type": "text", "id": "t1", "x": 0, "y": 0, "value": "Exemplo", "style": { "fontSize": 14, "bold": true } }
  ]
}
Retorne APENAS o JSON válido sem blocos markdown ao redor.`

    try {
      let jsonResponseText = ''

      if (provider === 'gemini') {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: promptInstructions },
                  {
                    inlineData: {
                      mimeType: 'application/pdf',
                      data: selectedFile.base64,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
            },
          }),
        })

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          throw new Error(errData.error?.message || `Erro da API Gemini HTTP ${response.status}`)
        }

        const data = await response.json()
        jsonResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      } else {
        throw new Error(`Provedor ${provider} requer endpoint customizado ou gateway. Recomendamos o Gemini 2.5 Flash.`)
      }

      setStatusMessage('Processando layout retornado...')
      const cleaned = jsonResponseText.replace(/^```json/g, '').replace(/```$/g, '').trim()
      const templateObj: Template = JSON.parse(cleaned)

      if (!templateObj.version || !templateObj.pageSettings || !Array.isArray(templateObj.page)) {
        throw new Error('A IA não gerou uma estrutura válida de Template Open PDF Generator.')
      }

      useTabStore.getState().addTab({
        name: `${selectedFile.name.replace(/\.pdf$/i, '')}-ai.json`,
        path: null,
        isDirty: true,
        stateSnapshot: {
          template: templateObj,
          currentFilePath: null,
          isDirty: true,
          history: [templateObj],
          historyIndex: 0,
          selectedElementIds: [],
          selectedElementLocation: 'body',
          selectedGroupId: null,
          currentSection: 'body',
        },
      })

      setIsLoading(false)
      onSuccess?.()
      onClose()
    } catch (err: unknown) {
      setIsLoading(false)
      setStatusMessage(null)
      setErrorMessage(err instanceof Error ? err.message : String(err))
    }
  }, [selectedFile, provider, apiKey, handleSaveSettings, inferBindings, model, onSuccess, onClose])

  return {
    provider,
    setProvider,
    apiKey,
    setApiKey: updateApiKey,
    model,
    setModel,
    endpoint,
    setEndpoint,
    inferBindings,
    setInferBindings,
    selectedFile,
    isLoading,
    statusMessage,
    errorMessage,
    handleSelectPDF,
    handleConvertDirect,
  }
}
