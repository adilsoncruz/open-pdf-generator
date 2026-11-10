import { describe, it, expect, beforeEach } from 'vitest'
import { useTemplateStore, type Element } from '../../../../store/templateStore'

describe('elementUpdateSlice', () => {
  beforeEach(() => {
    useTemplateStore.setState({
      template: {
        version: '1.0',
        metadata: { name: 'Test' },
        pageSettings: {
          size: 'A4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
          header: {
            height: 60,
            elements: [
              { id: 'h-el-1', type: 'text', value: 'Header Text' },
            ],
            groups: [{ id: 'g-h', name: 'HG', elementIds: ['h-el-1'] }],
          },
          footer: {
            height: 50,
            elements: [
              { id: 'f-el-1', type: 'text', value: 'Footer Text' },
            ],
            groups: [{ id: 'g-f', name: 'FG', elementIds: ['f-el-1'] }],
          },
          bodyBackground: {
            elements: [
              { id: 'bg-el-1', type: 'text', value: 'BG Text' },
            ],
            groups: [{ id: 'g-bg', name: 'BG', elementIds: ['bg-el-1'] }],
          },
        },
        summaryPage: {
          elements: [
            { id: 's-el-1', type: 'text', value: 'Summary Text' },
          ],
          groups: [{ id: 'g-s', name: 'SG', elementIds: ['s-el-1'] }],
        },
        page: [
          {
            id: 'c-main',
            type: 'container',
            x: 0,
            y: 0,
            width: '100%',
            height: 100,
            elements: [
              { id: 'child-1', type: 'text', value: 'Child Text' },
            ],
          },
        ],
        groups: [{ id: 'g-page', name: 'PG', elementIds: ['c-main'] }],
      } as any,
      selectedElementIds: ['child-1'],
      selectedElementLocation: 'body',
    })
  })

  it('updates element in header, footer, bodyBackground and summary sections', () => {
    const store = useTemplateStore.getState()

    // 1. Header
    store.updateElement('h-el-1', { id: 'h-el-renamed', value: 'Updated Header' }, 'header')
    expect(useTemplateStore.getState().template.pageSettings.header?.elements[0].id).toBe('h-el-renamed')
    expect(useTemplateStore.getState().template.pageSettings.header?.groups?.[0]?.elementIds).toContain('h-el-renamed')

    // 2. Footer
    store.updateElement('f-el-1', { value: 'Updated Footer' }, 'footer')
    expect(useTemplateStore.getState().template.pageSettings.footer?.elements[0].value).toBe('Updated Footer')

    // 3. BodyBackground
    store.updateElement('bg-el-1', { value: 'Updated BG' }, 'bodyBackground')
    expect(useTemplateStore.getState().template.pageSettings.bodyBackground?.elements[0].value).toBe('Updated BG')

    // 4. Summary
    store.updateElement('s-el-1', { value: 'Updated Summary' }, 'summary')
    expect(useTemplateStore.getState().template.summaryPage?.elements[0].value).toBe('Updated Summary')
  })

  it('updates container element and enforces x=0, width=100% and height bounds', () => {
    const store = useTemplateStore.getState()
    store.updateElement('c-main', { height: 1000 }, 'body')

    const updatedCont = useTemplateStore.getState().template.page.find((e: Element) => e.id === 'c-main')
    expect(updatedCont?.x).toBe(0)
    expect(updatedCont?.width).toBe('100%')
    expect(updatedCont?.height).toBeLessThanOrEqual(1000)
  })

  it('updates selected elements and toggles visibility of nested children', () => {
    const store = useTemplateStore.getState()

    // updateSelectedElements
    store.updateSelectedElements({ value: 'Bulk Updated' })
    const child = useTemplateStore.getState().template.page[0].elements?.[0]
    expect(child?.value).toBe('Bulk Updated')

    // toggleElementVisibility
    store.toggleElementVisibility('child-1', 'body')
    const hiddenChild = useTemplateStore.getState().template.page[0].elements?.[0]
    expect(hiddenChild?.hidden).toBe(true)

    store.toggleElementVisibility('child-1', 'body')
    const visibleChild = useTemplateStore.getState().template.page[0].elements?.[0]
    expect(visibleChild?.hidden).toBe(false)
  })
})
