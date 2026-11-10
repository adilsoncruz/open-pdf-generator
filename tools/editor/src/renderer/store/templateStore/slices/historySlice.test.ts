import { describe, it, expect, beforeEach } from 'vitest'
import { useTemplateStore } from '../../templateStore'
import { defaultTemplate } from '../helpers'

describe('historySlice', () => {
  beforeEach(() => {
    useTemplateStore.setState({
      template: JSON.parse(JSON.stringify(defaultTemplate)),
      history: [defaultTemplate],
      historyIndex: 0,
      selectedElementIds: [],
    })
  })

  it('handles undo and redo with boundaries', () => {
    const { canUndo, canRedo, addElement } = useTemplateStore.getState()

    expect(canUndo()).toBe(false)
    expect(canRedo()).toBe(false)

    // Add element (creates history snapshot)
    addElement({
      type: 'text',
      id: 'text-1',
      x: 10,
      y: 10,
      width: 100,
      height: 20,
      value: 'Hello',
    })

    expect(useTemplateStore.getState().canUndo()).toBe(true)
    expect(useTemplateStore.getState().canRedo()).toBe(false)

    // Undo
    useTemplateStore.getState().undo()
    expect(useTemplateStore.getState().historyIndex).toBe(0)
    expect(useTemplateStore.getState().canRedo()).toBe(true)

    // Redo
    useTemplateStore.getState().redo()
    expect(useTemplateStore.getState().historyIndex).toBe(1)

    // Jump to index
    useTemplateStore.getState().jumpToHistoryIndex(0)
    expect(useTemplateStore.getState().historyIndex).toBe(0)

    // Jump out of bounds does nothing
    useTemplateStore.getState().jumpToHistoryIndex(999)
    expect(useTemplateStore.getState().historyIndex).toBe(0)

    // Save snapshot when template changed vs unchanged
    useTemplateStore.getState().saveSnapshot()
    expect(useTemplateStore.getState().history.length).toBe(2)
  })
})
