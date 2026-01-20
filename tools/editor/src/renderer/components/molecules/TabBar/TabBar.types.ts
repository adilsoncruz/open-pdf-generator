import type { ReactNode } from 'react'

export type Tab = {
  id: string
  label: string
  icon?: ReactNode
}

export type TabBarProps = {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}
