import type { Element as TemplateElement, WatermarkConfig } from '../../store/templateStore'
import { mapJasperExpression } from './jrxmlExpressionConverter'

export function parseHexColor(colorStr?: string | null): string | undefined {
  if (!colorStr) return undefined
  const trimmed = colorStr.trim()
  if (trimmed.startsWith('#')) return trimmed.toLowerCase()
  if (/^[0-9A-Fa-f]{6}$/.test(trimmed)) return `#${trimmed.toLowerCase()}`
  return trimmed
}

export function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`
}

export interface ReportElementBounds {
  x: number
  y: number
  width: number
  height: number
  forecolor?: string
  backcolor?: string
}

export function parseReportElement(elem: Element | null): ReportElementBounds {
  if (!elem) return { x: 0, y: 0, width: 100, height: 20 }
  return {
    x: parseInt(elem.getAttribute('x') || '0', 10),
    y: parseInt(elem.getAttribute('y') || '0', 10),
    width: parseInt(elem.getAttribute('width') || '100', 10),
    height: parseInt(elem.getAttribute('height') || '20', 10),
    forecolor: parseHexColor(elem.getAttribute('forecolor')),
    backcolor: parseHexColor(elem.getAttribute('backcolor')),
  }
}

export function parseTextStyle(node: Element, baseColor?: string): Record<string, unknown> {
  const textElem = node.querySelector('textElement')
  const fontElem = node.querySelector('font')
  const style: Record<string, unknown> = {}
  if (baseColor) style.color = baseColor

  if (fontElem) {
    const size = parseInt(fontElem.getAttribute('size') || '', 10)
    if (!isNaN(size)) style.fontSize = size
    if (fontElem.getAttribute('isBold') === 'true') style.bold = true
    if (fontElem.getAttribute('isItalic') === 'true') style.italic = true
    if (fontElem.getAttribute('isUnderline') === 'true') style.underline = true
    const fontName = fontElem.getAttribute('fontName')
    if (fontName) style.fontFamily = fontName
  }

  if (textElem) {
    const align = textElem.getAttribute('textAlignment')
    if (align) {
      const lower = align.toLowerCase()
      if (lower === 'right') style.alignment = 'right'
      else if (lower === 'center') style.alignment = 'center'
      else if (lower === 'justify' || lower === 'justified') style.alignment = 'justify'
      else style.alignment = 'left'
    }

    const vAlign = textElem.getAttribute('verticalAlignment')
    if (vAlign) {
      const lower = vAlign.toLowerCase()
      if (lower === 'middle' || lower === 'center') style.verticalAlignment = 'middle'
      else if (lower === 'bottom') style.verticalAlignment = 'bottom'
      else style.verticalAlignment = 'top'
    }
  }

  return style
}

export function parseWatermarkFromBand(band: Element): WatermarkConfig | undefined {
  const staticTexts = band.querySelectorAll(':scope > staticText')
  if (staticTexts.length === 0) return undefined

  const firstTextNode = staticTexts[0]
  const textVal = firstTextNode.querySelector('text')?.textContent?.trim()
  const fontNode = firstTextNode.querySelector('font')
  const reportNode = firstTextNode.querySelector('reportElement')
  const color = reportNode ? parseHexColor(reportNode.getAttribute('forecolor')) : '#e0e7ff'
  const fontSize = fontNode ? parseInt(fontNode.getAttribute('size') || '48', 10) : 48

  return {
    type: 'text',
    text: textVal || 'WATERMARK',
    color: color || '#e0e7ff',
    opacity: 0.8,
    fontSize: isNaN(fontSize) ? 48 : fontSize,
    rotation: 0,
  }
}

export function parseBand(bandNode: Element, yBaseOffset: number): TemplateElement[] {
  const elements: TemplateElement[] = []

  for (let i = 0; i < bandNode.children.length; i++) {
    const child = bandNode.children[i]
    const tagName = child.nodeName
    const reportElemNode = child.querySelector(':scope > reportElement')
    const bounds = parseReportElement(reportElemNode)
    const absY = yBaseOffset + bounds.y

    switch (tagName) {
      case 'staticText': {
        const textNode = child.querySelector(':scope > text')
        const value = textNode?.textContent?.trim() || ''
        const style = parseTextStyle(child, bounds.forecolor)
        elements.push({
          type: 'text',
          id: generateId('txt-static'),
          x: bounds.x,
          y: absY,
          width: bounds.width,
          height: bounds.height,
          value,
          style,
        })
        break
      }
      case 'textField': {
        const exprNode = child.querySelector(':scope > textFieldExpression')
        const exprRaw = exprNode?.textContent || ''
        const mapped = mapJasperExpression(exprRaw)
        const style = parseTextStyle(child, bounds.forecolor)
        elements.push({
          type: 'text',
          id: generateId('txt-field'),
          x: bounds.x,
          y: absY,
          width: bounds.width,
          height: bounds.height,
          value: mapped.value,
          dataBinding: mapped.dataBinding,
          style,
        })
        break
      }
      case 'line': {
        elements.push({
          type: 'line',
          id: generateId('line'),
          x: bounds.x,
          y: absY,
          width: bounds.width,
          height: bounds.height || 1,
          style: {
            color: bounds.forecolor || '#cbd5e1',
            width: bounds.height > 1 ? bounds.height : 1,
          },
        })
        break
      }
      case 'rectangle': {
        elements.push({
          type: 'rectangle',
          id: generateId('rect'),
          x: bounds.x,
          y: absY,
          width: bounds.width,
          height: bounds.height,
          style: {
            fillColor: bounds.backcolor || bounds.forecolor || '#f1f5f9',
            strokeColor: bounds.forecolor || '#94a3b8',
          },
        })
        break
      }
      case 'image': {
        const imgExpr = child.querySelector(':scope > imageExpression')?.textContent || ''
        const mappedImg = mapJasperExpression(imgExpr)
        elements.push({
          type: 'image',
          id: generateId('img'),
          x: bounds.x,
          y: absY,
          width: bounds.width,
          height: bounds.height,
          value: mappedImg.value || mappedImg.dataBinding,
          dataBinding: mappedImg.dataBinding,
        })
        break
      }
      case 'componentElement': {
        const qrNode = child.querySelector('QRCode, [nodeName$="QRCode"]')
        if (qrNode) {
          const qrExpr = qrNode.textContent || ''
          const mappedQr = mapJasperExpression(qrExpr)
          elements.push({
            type: 'barcode',
            barcodeType: 'qrcode',
            id: generateId('qr'),
            x: bounds.x,
            y: absY,
            width: bounds.width,
            height: bounds.height,
            value: mappedQr.value || 'https://openpdf.dev',
            dataBinding: mappedQr.dataBinding,
          })
          break
        }
        const barcodeNode = child.querySelector('Code128, barbecue, [nodeName$="Code128"]')
        if (barcodeNode) {
          const codeExpr = barcodeNode.textContent || ''
          const mappedCode = mapJasperExpression(codeExpr)
          elements.push({
            type: 'barcode',
            id: generateId('barcode'),
            barcodeType: 'code128',
            x: bounds.x,
            y: absY,
            width: bounds.width,
            height: bounds.height,
            value: mappedCode.value || '123456789012',
            dataBinding: mappedCode.dataBinding,
          })
          break
        }
        break
      }
      case 'frame': {
        const frameElements = parseBand(child, absY)
        for (const fe of frameElements) {
          fe.x += bounds.x
          elements.push(fe)
        }
        break
      }
    }
  }

  return elements
}
