import type { TemplateStore } from '../types'

export type SetTemplateStore = (
  partial:
    | TemplateStore
    | Partial<TemplateStore>
    | ((state: TemplateStore) => TemplateStore | Partial<TemplateStore>),
  replace?: boolean
) => void

export type GetTemplateStore = () => TemplateStore
