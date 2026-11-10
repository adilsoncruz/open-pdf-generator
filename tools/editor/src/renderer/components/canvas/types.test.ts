import { describe, it, expect } from 'vitest'
import {
  getHeaderBorderValues,
  getCellBorderValues,
  getFontFamily,
} from './types'

describe('canvas types border and font utilities', () => {
  it('computes header border values for each border type', () => {
    expect(getHeaderBorderValues({ headerBorderType: 'none' })).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    })
    expect(getHeaderBorderValues({ headerBorderType: 'row', headerBorderWidth: 2 })).toEqual({
      top: 2,
      right: 0,
      bottom: 2,
      left: 0,
    })
    expect(getHeaderBorderValues({ headerBorderType: 'columns', borderWidth: 3 })).toEqual({
      top: 3,
      right: 3,
      bottom: 3,
      left: 3,
    })
    expect(getHeaderBorderValues({ headerBorderType: 'top-bottom', headerBorderWidth: 1 })).toEqual({
      top: 1,
      right: 0,
      bottom: 1,
      left: 0,
    })
    expect(getHeaderBorderValues({ headerBorderType: 'left-right', headerBorderWidth: 2 })).toEqual({
      top: 0,
      right: 2,
      bottom: 0,
      left: 2,
    })
    expect(getHeaderBorderValues(undefined)).toEqual({
      top: 1,
      right: 1,
      bottom: 1,
      left: 1,
    })
  })

  it('computes cell border values for each border type', () => {
    expect(getCellBorderValues({ cellBorderType: 'none' })).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    })
    expect(getCellBorderValues({ cellBorderType: 'row', borderWidth: 2 })).toEqual({
      top: 2,
      right: 0,
      bottom: 2,
      left: 0,
    })
    expect(getCellBorderValues({ cellBorderType: 'columns', borderWidth: 2 })).toEqual({
      top: 0,
      right: 2,
      bottom: 0,
      left: 2,
    })
    expect(getCellBorderValues({ cellBorderType: 'cells', borderWidth: 2 })).toEqual({
      top: 2,
      right: 2,
      bottom: 2,
      left: 2,
    })
    expect(getCellBorderValues({ cellBorderType: 'top-bottom', borderWidth: 2 })).toEqual({
      top: 2,
      right: 0,
      bottom: 2,
      left: 0,
    })
    expect(getCellBorderValues({ cellBorderType: 'left-right', borderWidth: 2 })).toEqual({
      top: 0,
      right: 2,
      bottom: 0,
      left: 2,
    })
    expect(getCellBorderValues(undefined)).toEqual({
      top: 1,
      right: 1,
      bottom: 1,
      left: 1,
    })
  })

  it('resolves CSS font family from PDF font name', () => {
    expect(getFontFamily()).toBe('Arial, sans-serif')
    expect(getFontFamily('Helvetica')).toBe('Arial, Helvetica, sans-serif')
    expect(getFontFamily('Helvetica-Bold')).toBe('Arial, Helvetica, sans-serif')
    expect(getFontFamily('Times-Roman')).toBe('"Times New Roman", Times, serif')
    expect(getFontFamily('Times-Bold')).toBe('"Times New Roman", Times, serif')
    expect(getFontFamily('Courier')).toBe('"Courier New", Courier, monospace')
    expect(getFontFamily('Courier-Bold')).toBe('"Courier New", Courier, monospace')
    expect(getFontFamily('CustomFont')).toBe('Arial, sans-serif')
  })
})
