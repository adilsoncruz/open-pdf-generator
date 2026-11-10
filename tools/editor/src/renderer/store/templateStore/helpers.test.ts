import { describe, it, expect } from 'vitest'
import {
  createDefaultContainer,
  defaultTemplate,
  ensureContainersInSection,
  normalizeBodyContainers,
  restackBodyContainers,
  saveToHistory,
  flattenElements,
  findParentContainer,
  findParentLoop,
} from './helpers'
import type { Element, Template, TemplateStore } from './types'

describe('templateStore helpers', () => {
  it('creates default container and default template', () => {
    const c = createDefaultContainer('test', 150, 'Custom')
    expect(c.id).toBe('container-test')
    expect(c.height).toBe(150)
    expect(defaultTemplate.version).toBe('1.0')
  })

  it('handles ensureContainersInSection with empty, no-container, and loose elements', () => {
    const emptyResult = ensureContainersInSection([], 'Body')
    expect(emptyResult[0].type).toBe('container')

    const looseText: Element = { type: 'text', id: 't1' }
    const wrappedResult = ensureContainersInSection([looseText], 'Header')
    expect(wrappedResult[0].type).toBe('container')
    expect(wrappedResult[0].elements).toContain(looseText)

    const cont: Element = { type: 'container', id: 'c1', elements: [] }
    const attached = ensureContainersInSection([cont, looseText], 'Body')
    expect(attached[0].elements).toContain(looseText)
  })

  it('normalizes template body and sections', () => {
    const t: Template = {
      ...defaultTemplate,
      pageSettings: {
        ...defaultTemplate.pageSettings,
        header: { height: 60, elements: [] },
        footer: { height: 40, elements: [] },
        bodyBackground: { elements: [] },
      },
      summaryPage: { elements: [] },
    }
    const norm = normalizeBodyContainers(t)
    expect(norm.page.length).toBeGreaterThan(0)
    expect(norm.pageSettings.header?.elements.length).toBeGreaterThan(0)
    expect(norm.pageSettings.footer?.elements.length).toBeGreaterThan(0)
    expect(norm.pageSettings.bodyBackground?.elements.length).toBeGreaterThan(0)
    expect(norm.summaryPage?.elements.length).toBeGreaterThan(0)
  })

  it('restacks containers and handles page breaks', () => {
    const elements: Element[] = [
      { type: 'container', id: 'c1', height: 100 },
      { type: 'spacer', id: 'sp1', height: 50 },
      { type: 'container', id: 'c2', height: 100, pageBreakBefore: true },
    ]
    const restacked = restackBodyContainers(elements, defaultTemplate)
    expect(restacked[0].y).toBe(0)
    expect(restacked[1].y).toBe(100)
    expect(restacked[2].y).toBeGreaterThan(150)
  })

  it('finds parent container and parent loop (including nested loops)', () => {
    const child: Element = { type: 'text', id: 'gc1' }
    const nestedLoop: Element = { type: 'loop', id: 'l1', elements: [child] }
    const cont: Element = { type: 'container', id: 'c1', elements: [nestedLoop] }
    const directLoop: Element = { type: 'loop', id: 'l2', elements: [{ type: 'text', id: 'direct-c' }] }

    const t: Template = {
      ...defaultTemplate,
      page: [cont, directLoop],
    }

    expect(findParentContainer(t, 'l1')?.id).toBe('c1')
    expect(findParentLoop(t, 'gc1')?.id).toBe('l1')
    expect(findParentLoop(t, 'direct-c')?.id).toBe('l2')
    expect(findParentContainer(t, 'nonexistent')).toBeNull()
    expect(findParentLoop(t, 'nonexistent')).toBeNull()
  })

  it('saves to history and shifts oldest when history > 50', () => {
    const history = Array.from({ length: 52 }, (_, i) => ({
      ...defaultTemplate,
      metadata: { ...defaultTemplate.metadata, name: `v${i}` },
    }))

    const state = {
      history,
      historyIndex: 51,
    } as unknown as TemplateStore

    const next = saveToHistory(state, defaultTemplate)
    expect(next.history.length).toBe(52)
  })

  it('flattens elements safely with empty or invalid input', () => {
    expect(flattenElements(undefined)).toEqual([])
    expect(flattenElements([])).toEqual([])
  })
})
