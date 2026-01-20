import type { ReactNode } from 'react'

export type ModalProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  titleIcon?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}
