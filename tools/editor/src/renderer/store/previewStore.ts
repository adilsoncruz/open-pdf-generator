import { create } from 'zustand'

export type PreviewMode = 'hidden' | 'tab' | 'split'

interface PreviewState {
  mode: PreviewMode
  pdfData: string | null  // base64 encoded PDF
  isLoading: boolean
  error: string | null
  lastGeneratedAt: Date | null
  refreshTrigger: number  // Incrementado quando deve atualizar o preview
  
  // Actions
  setMode: (mode: PreviewMode) => void
  setPdfData: (data: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  triggerRefresh: () => void  // Chamado ao salvar template/dados
  clearPreview: () => void
}

export const usePreviewStore = create<PreviewState>((set) => ({
  mode: 'hidden',
  pdfData: null,
  isLoading: false,
  error: null,
  lastGeneratedAt: null,
  refreshTrigger: 0,
  
  setMode: (mode) => set({ mode }),
  
  setPdfData: (data) => set({ 
    pdfData: data, 
    lastGeneratedAt: data ? new Date() : null,
    error: null 
  }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error, isLoading: false }),
  
  triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
  
  clearPreview: () => set({ 
    pdfData: null, 
    error: null, 
    lastGeneratedAt: null 
  }),
}))

