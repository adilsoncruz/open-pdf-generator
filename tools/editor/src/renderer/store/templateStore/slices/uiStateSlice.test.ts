import { describe, it, expect, beforeEach } from 'vitest'
import { useTemplateStore } from '../../templateStore'
import { defaultTemplate } from '../helpers'

describe('uiStateSlice', () => {
  beforeEach(() => {
    useTemplateStore.setState({
      template: JSON.parse(JSON.stringify(defaultTemplate)),
      history: [defaultTemplate],
      historyIndex: 0,
      selectedElementIds: ['test-el'],
      currentFilePath: null,
      isDirty: false,
      testData: {},
      currentSection: 'body',
      isSidebarPinned: false,
      isSidebarMinimized: false,
    })
  })

  it('sets current file path', () => {
    useTemplateStore.getState().setCurrentFilePath('/path/to/template.json')
    expect(useTemplateStore.getState().currentFilePath).toBe('/path/to/template.json')
    useTemplateStore.getState().setCurrentFilePath(null)
    expect(useTemplateStore.getState().currentFilePath).toBeNull()
  })

  it('sets test data', () => {
    useTemplateStore.getState().setTestData({ user: 'John', age: 30 })
    expect(useTemplateStore.getState().testData).toEqual({ user: 'John', age: 30 })
  })

  it('sets schema and clears schema', () => {
    useTemplateStore.getState().setSchema({ type: 'object', properties: { name: { type: 'string' } } })
    expect(useTemplateStore.getState().template.schema).toEqual({
      type: 'object',
      properties: { name: { type: 'string' } },
    })
    expect(useTemplateStore.getState().isDirty).toBe(true)

    // Clear schema
    useTemplateStore.getState().setSchema(null)
    expect(useTemplateStore.getState().template.schema).toBeUndefined()

    // Empty schema object also deletes
    useTemplateStore.getState().setSchema({})
    expect(useTemplateStore.getState().template.schema).toBeUndefined()
  })

  it('marks clean', () => {
    useTemplateStore.setState({ isDirty: true })
    expect(useTemplateStore.getState().isDirty).toBe(true)
    useTemplateStore.getState().markClean()
    expect(useTemplateStore.getState().isDirty).toBe(false)
  })

  it('sets current section and resets selection', () => {
    useTemplateStore.setState({ selectedElementIds: ['el-1'], selectedGroupId: 'grp-1' })
    useTemplateStore.getState().setCurrentSection('header')
    expect(useTemplateStore.getState().currentSection).toBe('header')
    expect(useTemplateStore.getState().selectedElementIds).toEqual([])
    expect(useTemplateStore.getState().selectedGroupId).toBeNull()
  })

  it('toggles sidebar pinned state', () => {
    expect(useTemplateStore.getState().isSidebarPinned).toBe(false)
    useTemplateStore.getState().toggleSidebarPinned()
    expect(useTemplateStore.getState().isSidebarPinned).toBe(true)
    useTemplateStore.getState().toggleSidebarPinned()
    expect(useTemplateStore.getState().isSidebarPinned).toBe(false)
  })

  it('toggles sidebar minimized state and sets sidebar minimized explicitly', () => {
    expect(useTemplateStore.getState().isSidebarMinimized).toBe(false)
    useTemplateStore.getState().toggleSidebarMinimized()
    expect(useTemplateStore.getState().isSidebarMinimized).toBe(true)
    useTemplateStore.getState().toggleSidebarMinimized()
    expect(useTemplateStore.getState().isSidebarMinimized).toBe(false)

    useTemplateStore.getState().setSidebarMinimized(true)
    expect(useTemplateStore.getState().isSidebarMinimized).toBe(true)
    useTemplateStore.getState().setSidebarMinimized(false)
    expect(useTemplateStore.getState().isSidebarMinimized).toBe(false)
  })
})
