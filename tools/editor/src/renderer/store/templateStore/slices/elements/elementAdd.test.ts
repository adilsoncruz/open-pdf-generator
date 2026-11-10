import { describe, it, expect, vi } from 'vitest'
import { useTemplateStore, type Element } from '../../../../store/templateStore'

describe('elementAddSlice', () => {
  it('adds container and spacer with automatic normalization and page breaks', () => {
    const store = useTemplateStore.getState()
    
    // Add first container
    store.addElement({
      type: 'container',
      id: 'cont-norm-1',
      x: 0,
      y: 0,
      height: 100,
      elements: [],
    }, 'body')

    // Add spacer
    store.addElement({
      type: 'spacer',
      id: 'sp-norm-1',
      height: 40,
    }, 'body')

    // Add container with pageBreakBefore
    store.addElement({
      type: 'container',
      id: 'cont-pagebreak-1',
      pageBreakBefore: true,
      elements: [],
    }, 'body')

    const bodyElems = useTemplateStore.getState().template.page
    const pbCont = bodyElems.find((e: Element) => e.id === 'cont-pagebreak-1')
    expect(pbCont).toBeDefined()
    expect(pbCont?.width).toBe('100%')
  })

  it('inserts element into target loop when loop is selected or specified', () => {
    const store = useTemplateStore.getState()
    const loopEl: Element = {
      type: 'loop',
      id: 'target-loop-test',
      elements: [
        { type: 'text', id: 'loop-child-exist', x: 10, y: 10, height: 20, positionMode: 'RELATIVE' },
      ],
    }

    store.addElement(loopEl, 'body')
    store.selectElement('target-loop-test', 'body')

    // Add child into loop
    store.addElement({
      type: 'text',
      id: 'new-child-in-loop',
      value: 'In Loop',
    }, 'body')

    const currentLoop = useTemplateStore
      .getState()
      .template.page.flatMap((e: Element) => [e, ...(e.elements || [])])
      .find((e: Element) => e.id === 'target-loop-test')
    expect(currentLoop?.elements?.some((c) => c.id === 'new-child-in-loop')).toBe(true)
  })

  it('inserts into auto-created container when section has no container', () => {
    // Reset to empty section
    useTemplateStore.setState({
      template: {
        ...useTemplateStore.getState().template,
        pageSettings: {
          ...useTemplateStore.getState().template.pageSettings,
          header: { height: 50, elements: [] },
        },
      },
      selectedElementIds: [],
      selectedContainerChildId: null,
      selectedLoopChildId: null,
    })

    useTemplateStore.getState().addElement(
      { type: 'text', id: 'standalone-text', value: 'Auto Container Test' },
      'header'
    )

    const header = useTemplateStore.getState().template.pageSettings.header
    expect(header?.elements?.length).toBeGreaterThan(0)
    const cont = header?.elements?.[0]
    expect(cont?.type).toBe('container')
    expect(cont?.elements?.some((c) => c.id === 'standalone-text')).toBe(true)
  })

  it('handles container overflow alerts and page limits', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    // 1. Fixed container overflow
    useTemplateStore.setState({
      template: {
        ...useTemplateStore.getState().template,
        page: [
          {
            type: 'container',
            id: 'cont-fixed-limit',
            x: 0,
            y: 0,
            width: '100%',
            height: 50,
            heightMode: 'fixed',
            autoHeight: false,
            elements: [{ type: 'text', id: 'c1', x: 0, y: 0, height: 40 }],
          },
        ],
      },
      selectedElementIds: ['cont-fixed-limit'],
    })

    useTemplateStore.getState().addElement(
      { type: 'text', id: 'overflow-fixed-child', height: 40 },
      'body'
    )
    expect(alertSpy).toHaveBeenCalled()

    // 2. Auto-height container exceeding section height
    // A4 height is 842 - 20 - 20 = 802 pt
    useTemplateStore.setState({
      template: {
        ...useTemplateStore.getState().template,
        pageSettings: {
          size: 'A4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
        },
        page: [
          {
            type: 'container',
            id: 'cont-auto-limit',
            x: 0,
            y: 790, // maxH is 802 - 790 = 12 pt -> min 30 pt
            width: '100%',
            height: 20,
            heightMode: 'auto',
            autoHeight: true,
            elements: [],
          },
        ],
      },
      selectedElementIds: ['cont-auto-limit'],
    })

    useTemplateStore.getState().addElement(
      { type: 'text', id: 'overflow-page-child', height: 200 }, // 200 > 30 (maxH)
      'body'
    )
    expect(alertSpy).toHaveBeenCalled()

    // 3. Delta H pushing following containers over page limit
    useTemplateStore.setState({
      template: {
        ...useTemplateStore.getState().template,
        pageSettings: {
          size: 'A4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
        },
        page: [
          {
            type: 'container',
            id: 'cont-grow',
            x: 0,
            y: 500,
            width: '100%',
            height: 50,
            heightMode: 'auto',
            autoHeight: true,
            elements: [],
          },
          {
            type: 'container',
            id: 'cont-pushed',
            x: 0,
            y: 700,
            width: '100%',
            height: 80, // itemBottom = 700 + deltaH(100) + 80 = 880 > 802 (pageLimit)
            elements: [],
          },
        ],
      },
      selectedElementIds: ['cont-grow'],
    })

    useTemplateStore.getState().addElement(
      { type: 'text', id: 'pusher-child', height: 150 }, // deltaH = 150 - 50 = 100
      'body'
    )
    expect(alertSpy).toHaveBeenCalled()

    alertSpy.mockRestore()
  })

  it('inherits RELATIVE position from last child and finds target container by parent or child selection', () => {
    // Container with a RELATIVE child
    useTemplateStore.setState({
      template: {
        ...useTemplateStore.getState().template,
        page: [
          {
            type: 'container',
            id: 'cont-rel-parent',
            x: 0,
            y: 0,
            width: '100%',
            height: 200,
            elements: [
              {
                type: 'text',
                id: 'child-rel-1',
                x: 10,
                y: 10,
                width: 150,
                height: 20,
                positionMode: 'RELATIVE',
              },
            ],
          },
        ],
      },
      selectedElementIds: ['child-rel-1'], // Child selected
      selectedContainerParentId: 'cont-rel-parent',
    })

    useTemplateStore.getState().addElement(
      { type: 'text', id: 'child-rel-2', height: 25 },
      'body'
    )

    const cont = useTemplateStore
      .getState()
      .template.page.find((e: Element) => e.id === 'cont-rel-parent')
    const addedChild = cont?.elements?.find((c) => c.id === 'child-rel-2')
    expect(addedChild).toBeDefined()
    expect(addedChild?.positionMode).toBe('RELATIVE')
    expect(addedChild?.width).toBe(150)
  })

  it('normalizes container with custom initial y on empty section and adds to nested loop in container', () => {
    // 1. Container with custom y on empty summary section
    useTemplateStore.setState({
      template: {
        pageSettings: { size: 'A4', orientation: 'portrait', margins: { top: 0, right: 0, bottom: 0, left: 0 } },
        summaryPage: { elements: [] },
        page: [],
      } as any,
      selectedElementIds: [],
    })

    useTemplateStore.getState().addElement(
      { type: 'container', id: 'cont-custom-y', y: 60, height: 80, elements: [] },
      'summary'
    )

    const firstCont = useTemplateStore.getState().template.summaryPage?.elements[0]
    expect(firstCont?.y).toBe(60)

    // 2. Nested loop inside a container
    const containerWithLoop: Element = {
      type: 'container',
      id: 'cont-wrapper',
      x: 0,
      y: 0,
      width: '100%',
      height: 300,
      elements: [
        {
          type: 'loop',
          id: 'nested-loop-id',
          elements: [{ type: 'text', id: 'existing-nested-loop-child', x: 0, y: 0, height: 20 }],
        },
      ],
    }

    useTemplateStore.setState({
      template: {
        pageSettings: { size: 'A4', orientation: 'portrait', margins: { top: 0, right: 0, bottom: 0, left: 0 } },
        page: [containerWithLoop],
      } as any,
      selectedElementIds: [],
      selectedLoopParentId: 'nested-loop-id',
    })

    useTemplateStore.getState().addElement(
      { type: 'text', id: 'child-for-nested-loop', value: 'Nested Loop Child' },
      'body'
    )

    const updatedCont = useTemplateStore.getState().template.page[0]
    const updatedLoop = updatedCont.elements?.find((e: any) => e.id === 'nested-loop-id')
    expect(updatedLoop?.elements?.some((c: any) => c.id === 'child-for-nested-loop')).toBe(true)
  })
})
