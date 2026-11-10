import type { Element, Template, TemplateStore } from './types'

export const createDefaultContainer = (
  idSuffix: string = '1',
  height: number = 200,
  name: string = 'Container 1'
): Element => ({
  type: 'container',
  id: `container-${idSuffix}`,
  name,
  x: 0,
  y: 0,
  width: '100%',
  height,
  heightMode: 'auto',
  autoHeight: true,
  elements: [],
})

export const defaultTemplate: Template = {
  version: '1.0',
  metadata: {
    name: 'New Template',
    description: '',
    author: '',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    tags: [],
  },
  pageSettings: {
    size: 'A4',
    orientation: 'portrait',
    margins: {
      top: 30,
      right: 30,
      bottom: 30,
      left: 30,
    },
  },
  page: [createDefaultContainer('body-1', 200, 'Container 1')],
}

export const ensureContainersInSection = (
  elements: Element[] | undefined,
  defaultName: string,
  defaultHeight: number = 100
): Element[] => {
  if (!elements || elements.length === 0) {
    return [
      {
        type: 'container',
        id: `container-${defaultName.toLowerCase()}-${Date.now()}`,
        name: `${defaultName} Container`,
        x: 0,
        y: 0,
        width: '100%',
        height: defaultHeight,
        heightMode: 'auto',
        autoHeight: true,
        elements: [],
      },
    ]
  }

  const hasContainer = elements.some((el) => el.type === 'container')
  if (!hasContainer) {
    return [
      {
        type: 'container',
        id: `container-${defaultName.toLowerCase()}-${Date.now()}`,
        name: `${defaultName} Container`,
        x: 0,
        y: 0,
        width: '100%',
        height: defaultHeight,
        heightMode: 'auto',
        autoHeight: true,
        elements: elements,
      },
    ]
  }

  const looseElements = elements.filter(
    (el) => el.type !== 'container' && el.type !== 'spacer'
  )
  if (looseElements.length > 0) {
    const topElements = elements.filter(
      (el) => el.type === 'container' || el.type === 'spacer'
    )
    let attached = false
    return topElements.map((c) => {
      if (!attached && c.type === 'container') {
        attached = true
        return { ...c, elements: [...(c.elements || []), ...looseElements], x: 0, width: '100%' }
      }
      return { ...c, x: 0, width: '100%' }
    })
  }

  return elements.map((el) =>
    el.type === 'container' || el.type === 'spacer'
      ? { ...el, x: 0, width: '100%' }
      : el
  )
}

export const normalizeBodyContainers = (template: Template): Template => ({
  ...template,
  page: ensureContainersInSection(template.page, 'Body', 200),
  pageSettings: {
    ...template.pageSettings,
    header: template.pageSettings.header
      ? {
          ...template.pageSettings.header,
          elements: ensureContainersInSection(
            template.pageSettings.header.elements,
            'Header',
            template.pageSettings.header.height || 100
          ),
        }
      : undefined,
    footer: template.pageSettings.footer
      ? {
          ...template.pageSettings.footer,
          elements: ensureContainersInSection(
            template.pageSettings.footer.elements,
            'Footer',
            template.pageSettings.footer.height || 80
          ),
        }
      : undefined,
    bodyBackground: template.pageSettings.bodyBackground
      ? {
          ...template.pageSettings.bodyBackground,
          elements: ensureContainersInSection(
            template.pageSettings.bodyBackground.elements,
            'Background',
            200
          ),
        }
      : undefined,
    watermark: template.pageSettings.watermark,
  },
  summaryPage: template.summaryPage
    ? {
        ...template.summaryPage,
        elements: ensureContainersInSection(template.summaryPage.elements, 'Summary', 200),
      }
    : undefined,
})

export const restackBodyContainers = (elements: Element[], template?: Template): Element[] => {
  let currentY = 0
  let usableHeight = 842

  if (template) {
    const size = template.pageSettings?.size || 'A4'
    const pageSize = size === 'Letter' ? { width: 612, height: 792 } : { width: 595, height: 842 }
    const margins = template.pageSettings?.margins || { top: 30, bottom: 30, left: 30, right: 30 }
    const headerHeight = template.pageSettings?.header?.height || 0
    const footerHeight = template.pageSettings?.footer?.height || 0
    usableHeight =
      pageSize.height - (margins.top || 0) - (margins.bottom || 0) - headerHeight - footerHeight
  }

  return elements.map((el) => {
    if (el.type !== 'container' && el.type !== 'spacer') return el

    if (el.type === 'container' && el.pageBreakBefore && currentY > 0) {
      const currentPageIndex = Math.floor((currentY - 0.1) / usableHeight)
      currentY = (currentPageIndex + 1) * usableHeight
    }

    const next = {
      ...el,
      x: 0,
      y: currentY,
      width: '100%',
    }

    const h =
      typeof el.height === 'number'
        ? el.height
        : el.type === 'spacer'
        ? 50
        : 150

    currentY += h

    return next
  })
}

export const saveToHistory = (state: TemplateStore, newTemplate: Template) => {
  const newHistory = state.history.slice(0, state.historyIndex + 1)
  newHistory.push(JSON.parse(JSON.stringify(newTemplate))) // Deep clone

  if (newHistory.length > 50) {
    newHistory.shift()
  } else {
    return {
      history: newHistory,
      historyIndex: newHistory.length - 1,
    }
  }

  return {
    history: newHistory,
    historyIndex: newHistory.length - 1,
  }
}

export function flattenElements(elements?: Element[]): Element[] {
  if (!elements || !Array.isArray(elements)) return []
  const result: Element[] = []
  for (const el of elements) {
    if (!el) continue
    result.push(el)
    if (el.elements && el.elements.length > 0) {
      result.push(...flattenElements(el.elements))
    }
  }
  return result
}

export function findParentContainer(template: Template, elementId: string): Element | null {
  const sections: (Element[] | undefined)[] = [
    template.page,
    template.pageSettings.header?.elements,
    template.pageSettings.footer?.elements,
    template.pageSettings.bodyBackground?.elements,
    template.summaryPage?.elements,
  ]
  for (const list of sections) {
    if (!list) continue
    for (const el of list) {
      if (el.type === 'container' && el.elements?.some((child) => child.id === elementId)) {
        return el
      }
    }
  }
  return null
}

export function findParentLoop(template: Template, elementId: string): Element | null {
  const sections: (Element[] | undefined)[] = [
    template.page,
    template.pageSettings.header?.elements,
    template.pageSettings.footer?.elements,
    template.pageSettings.bodyBackground?.elements,
    template.summaryPage?.elements,
  ]
  for (const list of sections) {
    if (!list) continue
    for (const el of list) {
      if (el.type === 'loop' && el.elements?.some((child) => child.id === elementId)) {
        return el
      }
      if (el.type === 'container' && el.elements) {
        for (const child of el.elements) {
          if (child.type === 'loop' && child.elements?.some((gc) => gc.id === elementId)) {
            return child
          }
        }
      }
    }
  }
  return null
}
