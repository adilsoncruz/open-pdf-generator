import { describe, it, expect, beforeEach } from 'vitest'
import { useTemplateStore } from '../../../templateStore'
import {
  DEFAULT_WATERMARK_CONFIG,
  createPageSettingsSlice,
} from './index'

describe('pageSettings modular slice', () => {
  beforeEach(() => {
    useTemplateStore.setState({
      template: {
        version: '1.0',
        metadata: { name: 'Test Template', description: 'Testing' },
        pageSettings: {
          size: 'A4',
          orientation: 'portrait',
          margins: { top: 30, right: 30, bottom: 30, left: 30 },
        },
        page: [],
      },
      selectedElementIds: [],
      selectedElementLocation: 'body',
      currentSection: 'body',
      isDirty: false,
    })
  })

  describe('marginSettings', () => {
    it('sets a new template and resets selection and dirty state', () => {
      const { setTemplate } = useTemplateStore.getState()
      setTemplate({
        version: '1.0',
        metadata: { name: 'New Loaded Template', description: 'Loaded' },
        pageSettings: {
          size: 'LETTER',
          orientation: 'landscape',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
        },
        page: [],
      })

      const state = useTemplateStore.getState()
      expect(state.template.metadata.name).toBe('New Loaded Template')
      expect(state.template.pageSettings.size).toBe('LETTER')
      expect(state.isDirty).toBe(false)
      expect(state.selectedElementIds).toEqual([])
    })

    it('updates template top-level properties', () => {
      const { updateTemplate } = useTemplateStore.getState()
      updateTemplate({ version: '2.0' })

      const state = useTemplateStore.getState()
      expect(state.template.version).toBe('2.0')
      expect(state.isDirty).toBe(true)
    })

    it('updates page settings including size, orientation, and margins', () => {
      const { updatePageSettings } = useTemplateStore.getState()
      updatePageSettings({
        size: 'A3',
        orientation: 'landscape',
        margins: { top: 40, right: 40, bottom: 40, left: 40 },
      })

      const state = useTemplateStore.getState()
      expect(state.template.pageSettings.size).toBe('A3')
      expect(state.template.pageSettings.orientation).toBe('landscape')
      expect(state.template.pageSettings.margins.top).toBe(40)
      expect(state.isDirty).toBe(true)
    })

    it('updates metadata', () => {
      const { updateMetadata } = useTemplateStore.getState()
      updateMetadata({ author: 'Alice', name: 'Updated Document' })

      const state = useTemplateStore.getState()
      expect(state.template.metadata.author).toBe('Alice')
      expect(state.template.metadata.name).toBe('Updated Document')
      expect(state.isDirty).toBe(true)
    })
  })

  describe('watermarkSettings', () => {
    it('creates a watermark with default values if none exists', () => {
      const { updateWatermark } = useTemplateStore.getState()
      updateWatermark({ text: 'CONFIDENTIAL' })

      const state = useTemplateStore.getState()
      const watermark = state.template.pageSettings.watermark
      expect(watermark).toBeDefined()
      expect(watermark?.text).toBe('CONFIDENTIAL')
      expect(watermark?.fontSize).toBe(DEFAULT_WATERMARK_CONFIG.fontSize)
      expect(watermark?.rotation).toBe(DEFAULT_WATERMARK_CONFIG.rotation)
      expect(watermark?.opacity).toBe(DEFAULT_WATERMARK_CONFIG.opacity)
      expect(state.isDirty).toBe(true)
    })

    it('updates watermark properties for rotation, opacity, and tiling', () => {
      const { updateWatermark } = useTemplateStore.getState()
      updateWatermark({
        type: 'text',
        text: 'INTERNAL ONLY',
        rotation: 30,
        opacity: 0.15,
        repeat: true,
        spacingX: 120,
        spacingY: 100,
      })

      const watermark = useTemplateStore.getState().template.pageSettings.watermark
      expect(watermark?.text).toBe('INTERNAL ONLY')
      expect(watermark?.rotation).toBe(30)
      expect(watermark?.opacity).toBe(0.15)
      expect(watermark?.repeat).toBe(true)
      expect(watermark?.spacingX).toBe(120)
      expect(watermark?.spacingY).toBe(100)
    })

    it('removes watermark from pageSettings', () => {
      const { updateWatermark, removeWatermark } = useTemplateStore.getState()
      updateWatermark({ text: 'SAMPLE' })
      expect(useTemplateStore.getState().template.pageSettings.watermark).toBeDefined()

      removeWatermark()
      expect(useTemplateStore.getState().template.pageSettings.watermark).toBeUndefined()
      expect(useTemplateStore.getState().isDirty).toBe(true)
    })
  })

  describe('backgroundSettings', () => {
    it('adds, updates, and removes header with selection reset', () => {
      const { addHeader, updateHeader, removeHeader } = useTemplateStore.getState()
      addHeader()

      let state = useTemplateStore.getState()
      expect(state.template.pageSettings.header).toBeDefined()
      expect(state.template.pageSettings.header?.height).toBe(100)
      expect(state.currentSection).toBe('header')
      expect(state.isDirty).toBe(true)

      updateHeader({ height: 120, printCondition: '!isLastPage' })
      state = useTemplateStore.getState()
      expect(state.template.pageSettings.header?.height).toBe(120)
      expect(state.template.pageSettings.header?.printCondition).toBe('!isLastPage')

      // Set selection in header
      useTemplateStore.setState({
        selectedElementLocation: 'header',
        selectedElementIds: ['h1'],
      })

      removeHeader()
      state = useTemplateStore.getState()
      expect(state.template.pageSettings.header).toBeUndefined()
      expect(state.selectedElementIds).toEqual([])
    })

    it('adds, updates, and removes footer', () => {
      const { addFooter, updateFooter, removeFooter } = useTemplateStore.getState()
      addFooter()

      let state = useTemplateStore.getState()
      expect(state.template.pageSettings.footer).toBeDefined()
      expect(state.template.pageSettings.footer?.height).toBe(80)
      expect(state.currentSection).toBe('footer')

      updateFooter({ height: 90 })
      state = useTemplateStore.getState()
      expect(state.template.pageSettings.footer?.height).toBe(90)

      removeFooter()
      state = useTemplateStore.getState()
      expect(state.template.pageSettings.footer).toBeUndefined()
    })

    it('adds, updates, and removes bodyBackground', () => {
      const { addBodyBackground, updateBodyBackground, removeBodyBackground } =
        useTemplateStore.getState()
      addBodyBackground()

      let state = useTemplateStore.getState()
      expect(state.template.pageSettings.bodyBackground).toBeDefined()
      expect(state.currentSection).toBe('bodyBackground')

      updateBodyBackground({ printCondition: 'pageNumber === 1' })
      state = useTemplateStore.getState()
      expect(state.template.pageSettings.bodyBackground?.printCondition).toBe(
        'pageNumber === 1'
      )

      removeBodyBackground()
      state = useTemplateStore.getState()
      expect(state.template.pageSettings.bodyBackground).toBeUndefined()
    })

    it('adds, updates, and removes summaryPage', () => {
      const { addSummaryPage, updateSummaryPage, removeSummaryPage } =
        useTemplateStore.getState()
      addSummaryPage()

      let state = useTemplateStore.getState()
      expect(state.template.summaryPage).toBeDefined()
      expect(state.currentSection).toBe('summary')

      updateSummaryPage({ printCondition: 'showSummary' })
      state = useTemplateStore.getState()
      expect(state.template.summaryPage?.printCondition).toBe('showSummary')

      removeSummaryPage()
      state = useTemplateStore.getState()
      expect(state.template.summaryPage).toBeUndefined()
    })
  })

  describe('createPageSettingsSlice orchestrator', () => {
    it('composes all slice methods into a unified slice', () => {
      const mockSet = () => {}
      const mockGet = () => ({} as any)
      const slice = createPageSettingsSlice(mockSet, mockGet)

      expect(typeof slice.setTemplate).toBe('function')
      expect(typeof slice.updateTemplate).toBe('function')
      expect(typeof slice.updatePageSettings).toBe('function')
      expect(typeof slice.updateMetadata).toBe('function')
      expect(typeof slice.updateWatermark).toBe('function')
      expect(typeof slice.removeWatermark).toBe('function')
      expect(typeof slice.addHeader).toBe('function')
      expect(typeof slice.addFooter).toBe('function')
      expect(typeof slice.removeHeader).toBe('function')
      expect(typeof slice.removeFooter).toBe('function')
      expect(typeof slice.addBodyBackground).toBe('function')
      expect(typeof slice.removeBodyBackground).toBe('function')
      expect(typeof slice.addSummaryPage).toBe('function')
      expect(typeof slice.removeSummaryPage).toBe('function')
      expect(typeof slice.updateSummaryPage).toBe('function')
      expect(typeof slice.updateHeader).toBe('function')
      expect(typeof slice.updateFooter).toBe('function')
      expect(typeof slice.updateBodyBackground).toBe('function')
    })
  })
})
