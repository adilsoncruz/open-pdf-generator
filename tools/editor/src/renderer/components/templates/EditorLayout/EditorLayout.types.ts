import type { ReactNode } from 'react'

export type EditorLayoutProps = {
  toolbar: ReactNode
  sidebar: ReactNode
  canvas: ReactNode
  propertiesPanel: ReactNode
  dataPanel?: ReactNode
  preview?: ReactNode
  showDataPanel?: boolean
  showPreview?: boolean
  previewMode?: 'tab' | 'split'
}
