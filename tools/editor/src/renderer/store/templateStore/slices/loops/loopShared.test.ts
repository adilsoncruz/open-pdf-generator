import { describe, it, expect } from 'vitest'
import {
  updateSectionLoopElements,
  getSectionLoopElements,
  isLoopContainer,
} from './loopShared'
import type { Template, Element } from '../../types'

describe('loopShared', () => {
  const baseTemplate: Template = {
    version: '1.0',
    metadata: { name: 'Test' },
    pageSettings: {
      size: 'A4',
      orientation: 'portrait',
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
      header: {
        height: 40,
        elements: [{ id: 'h1', type: 'text' }],
      },
      footer: {
        height: 30,
        elements: [{ id: 'f1', type: 'text' }],
      },
      bodyBackground: {
        elements: [{ id: 'bg1', type: 'rectangle' }],
      },
    },
    summaryPage: {
      elements: [{ id: 's1', type: 'text' }],
    },
    page: [{ id: 'b1', type: 'text' }],
  }

  describe('updateSectionLoopElements', () => {
    it('updates elements in header', () => {
      const updated = updateSectionLoopElements(baseTemplate, 'header', (elements) => [
        ...elements,
        { id: 'h2', type: 'text' },
      ])
      expect(updated.pageSettings.header?.elements).toHaveLength(2)
      expect(updated.pageSettings.header?.elements[1].id).toBe('h2')
    })

    it('updates elements in footer', () => {
      const updated = updateSectionLoopElements(baseTemplate, 'footer', (elements) => [
        ...elements,
        { id: 'f2', type: 'text' },
      ])
      expect(updated.pageSettings.footer?.elements).toHaveLength(2)
      expect(updated.pageSettings.footer?.elements[1].id).toBe('f2')
    })

    it('updates elements in bodyBackground', () => {
      const updated = updateSectionLoopElements(baseTemplate, 'bodyBackground', (elements) => [
        ...elements,
        { id: 'bg2', type: 'circle' },
      ])
      expect(updated.pageSettings.bodyBackground?.elements).toHaveLength(2)
      expect(updated.pageSettings.bodyBackground?.elements[1].id).toBe('bg2')
    })

    it('updates elements in summary', () => {
      const updated = updateSectionLoopElements(baseTemplate, 'summary', (elements) => [
        ...elements,
        { id: 's2', type: 'text' },
      ])
      expect(updated.summaryPage?.elements).toHaveLength(2)
      expect(updated.summaryPage?.elements[1].id).toBe('s2')
    })

    it('updates elements in body page by default', () => {
      const updated = updateSectionLoopElements(baseTemplate, 'body', (elements) => [
        ...elements,
        { id: 'b2', type: 'text' },
      ])
      expect(updated.page).toHaveLength(2)
      expect(updated.page[1].id).toBe('b2')
    })

    it('falls back safely if target section is undefined', () => {
      const emptyTemplate: Template = {
        version: '1.0',
        metadata: { name: 'Test' },
        pageSettings: {
          size: 'A4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
        },
        page: [{ id: 'b1', type: 'text' }],
      }

      const updatedHeader = updateSectionLoopElements(emptyTemplate, 'header', (elements) => [
        ...elements,
        { id: 'h2', type: 'text' },
      ])
      expect(updatedHeader.page).toHaveLength(2)

      const updatedFooter = updateSectionLoopElements(emptyTemplate, 'footer', (elements) => [
        ...elements,
        { id: 'f2', type: 'text' },
      ])
      expect(updatedFooter.page).toHaveLength(2)

      const updatedBg = updateSectionLoopElements(emptyTemplate, 'bodyBackground', (elements) => [
        ...elements,
        { id: 'bg2', type: 'text' },
      ])
      expect(updatedBg.page).toHaveLength(2)

      const updatedSummary = updateSectionLoopElements(emptyTemplate, 'summary', (elements) => [
        ...elements,
        { id: 's2', type: 'text' },
      ])
      expect(updatedSummary.page).toHaveLength(2)
    })
  })

  describe('getSectionLoopElements', () => {
    it('returns elements for each section', () => {
      expect(getSectionLoopElements(baseTemplate, 'header')).toEqual([{ id: 'h1', type: 'text' }])
      expect(getSectionLoopElements(baseTemplate, 'footer')).toEqual([{ id: 'f1', type: 'text' }])
      expect(getSectionLoopElements(baseTemplate, 'bodyBackground')).toEqual([{ id: 'bg1', type: 'rectangle' }])
      expect(getSectionLoopElements(baseTemplate, 'summary')).toEqual([{ id: 's1', type: 'text' }])
      expect(getSectionLoopElements(baseTemplate, 'body')).toEqual([{ id: 'b1', type: 'text' }])
    })

    it('returns empty array when section is undefined', () => {
      const emptyTemplate: Template = {
        version: '1.0',
        metadata: { name: 'Test' },
        pageSettings: {
          size: 'A4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
        },
        page: [],
      }
      expect(getSectionLoopElements(emptyTemplate, 'header')).toEqual([])
      expect(getSectionLoopElements(emptyTemplate, 'footer')).toEqual([])
      expect(getSectionLoopElements(emptyTemplate, 'bodyBackground')).toEqual([])
      expect(getSectionLoopElements(emptyTemplate, 'summary')).toEqual([])
    })
  })

  describe('isLoopContainer', () => {
    it('returns true for loop and container elements, false otherwise', () => {
      expect(isLoopContainer({ id: '1', type: 'loop' } as Element)).toBe(true)
      expect(isLoopContainer({ id: '2', type: 'container' } as Element)).toBe(true)
      expect(isLoopContainer({ id: '3', type: 'text' } as Element)).toBe(false)
      expect(isLoopContainer({ id: '4', type: 'table' } as Element)).toBe(false)
    })
  })
})
