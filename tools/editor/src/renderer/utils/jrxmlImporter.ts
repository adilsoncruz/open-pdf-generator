import type { Template, Element as TemplateElement, PageSettings, WatermarkConfig } from '../store/templateStore'

export interface JrxmlImportOptions {
  author?: string
  detectTableFromDetail?: boolean
}

/**
 * Maps JasperReports expressions into Open PDF Generator dataBinding / value.
 * Examples:
 * - $P{customerName} -> { dataBinding: 'customerName' }
 * - $F{total} -> { dataBinding: 'total' }
 * - "Number: " + $P{invoiceNumber} -> { dataBinding: "invoiceNumber | prefix:'Number: '" }
 * - $P{companyName}.toUpperCase() -> { dataBinding: "companyName | uppercase" }
 * - "ACME INC" -> { value: "ACME INC" }
 */
export function mapJasperExpression(rawExpr?: string | null): { value?: string; dataBinding?: string } {
  if (!rawExpr) return {}

  let expr = rawExpr
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]\]>/g, '')
    .trim()

  if (!expr) return {}

  // 1. Literal quoted string: "Hello World"
  const quotedMatch = expr.match(/^"([^"]*)"$/)
  if (quotedMatch) {
    return { value: quotedMatch[1] }
  }

  // 2. Pure Parameter or Field: $P{field} or $F{field}
  const pureFieldMatch = expr.match(/^\$[PF]\{([A-Za-z0-9_.]+)\}$/)
  if (pureFieldMatch) {
    return { dataBinding: pureFieldMatch[1] }
  }

  // 3. String prefix: "Prefix: " + $P{field}
  const prefixMatch = expr.match(/^"([^"]+)"\s*\+\s*\$[PF]\{([A-Za-z0-9_.]+)\}$/)
  if (prefixMatch) {
    return { dataBinding: `${prefixMatch[2]} | prefix:'${prefixMatch[1]}'` }
  }

  // 4. String suffix: $P{field} + " Suffix"
  const suffixMatch = expr.match(/^\$[PF]\{([A-Za-z0-9_.]+)\}\s*\+\s*"([^"]+)"$/)
  if (suffixMatch) {
    return { dataBinding: `${suffixMatch[1]} | suffix:'${suffixMatch[2]}'` }
  }

  // 5. uppercase: $P{field}.toUpperCase()
  const upperMatch = expr.match(/^\$[PF]\{([A-Za-z0-9_.]+)\}\.toUpperCase\(\)$/)
  if (upperMatch) {
    return { dataBinding: `${upperMatch[1]} | uppercase` }
  }

  // 6. Generic replace for $F{...} and $P{...}
  const cleaned = expr.replace(/\$[PF]\{([A-Za-z0-9_.]+)\}/g, '$1')
  return { dataBinding: cleaned }
}

function parseHexColor(colorStr?: string | null): string | undefined {
  if (!colorStr) return undefined
  const trimmed = colorStr.trim()
  if (trimmed.startsWith('#')) return trimmed.toLowerCase()
  if (/^[0-9A-Fa-f]{6}$/.test(trimmed)) return `#${trimmed.toLowerCase()}`
  return trimmed
}

function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`
}

export function convertJrxmlToTemplate(
  jrxmlContent: string,
  options: JrxmlImportOptions = {}
): Template {
  const parser = new DOMParser()
  const doc = parser.parseFromString(jrxmlContent, 'text/xml')

  const parserError = doc.querySelector('parsererror')
  if (parserError) {
    throw new Error(`Erro ao analisar XML Jasper: ${parserError.textContent || 'XML inválido'}`)
  }

  const root = doc.documentElement
  if (!root || root.nodeName !== 'jasperReport') {
    throw new Error('Arquivo JRXML inválido: tag raiz <jasperReport> não encontrada')
  }

  const name = root.getAttribute('name') || 'Converted Jasper Template'
  const pageWidth = parseInt(root.getAttribute('pageWidth') || '595', 10)
  const pageHeight = parseInt(root.getAttribute('pageHeight') || '842', 10)
  const orientation = (root.getAttribute('orientation') || 'portrait').toLowerCase()

  const leftMargin = parseInt(root.getAttribute('leftMargin') || '20', 10)
  const rightMargin = parseInt(root.getAttribute('rightMargin') || '20', 10)
  const topMargin = parseInt(root.getAttribute('topMargin') || '20', 10)
  const bottomMargin = parseInt(root.getAttribute('bottomMargin') || '20', 10)

  // Standard paper sizes
  let pageSize = 'CUSTOM'
  if ((pageWidth === 595 && pageHeight === 842) || (pageWidth === 842 && pageHeight === 595)) {
    pageSize = 'A4'
  } else if ((pageWidth === 612 && pageHeight === 792) || (pageWidth === 792 && pageHeight === 612)) {
    pageSize = 'LETTER'
  } else if ((pageWidth === 420 && pageHeight === 595) || (pageWidth === 595 && pageHeight === 420)) {
    pageSize = 'A5'
  }

  const pageSettings: PageSettings = {
    size: pageSize,
    orientation: orientation === 'landscape' ? 'landscape' : 'portrait',
    margins: {
      top: topMargin,
      right: rightMargin,
      bottom: bottomMargin,
      left: leftMargin,
    },
  }

  let watermark: WatermarkConfig | undefined
  const pageElements: TemplateElement[] = []
  let summaryElements: TemplateElement[] | undefined
  let currentYOffset = 0

  // Helper to extract reportElement attributes
  function parseReportElement(elem: Element | null): {
    x: number
    y: number
    width: number
    height: number
    forecolor?: string
    backcolor?: string
  } {
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

  // Helper to extract text styles
  function parseTextStyle(node: Element, baseColor?: string): Record<string, unknown> {
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

  // Parse elements in a band node
  function parseBand(
    bandNode: Element,
    yBaseOffset: number
  ): TemplateElement[] {
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
          // Barcode or QR Code
          const qrNode = child.querySelector('QRCode, [nodeName$="QRCode"]')
          if (qrNode) {
            const qrExpr = qrNode.textContent || ''
            const mappedQr = mapJasperExpression(qrExpr)
            elements.push({
              type: 'qrcode',
              id: generateId('qr'),
              x: bounds.x,
              y: absY,
              width: bounds.width,
              height: bounds.height,
              value: mappedQr.value,
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
              value: mappedCode.value,
              dataBinding: mappedCode.dataBinding,
            })
            break
          }
          break
        }

        case 'frame': {
          // Recursive sub-elements inside frame
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

  // Iterate top-level Jasper sections
  const sections = ['background', 'title', 'pageHeader', 'columnHeader', 'detail', 'columnFooter', 'pageFooter', 'summary']

  for (const sectionName of sections) {
    const sectionNodes = root.querySelectorAll(`:scope > ${sectionName}`)
    if (!sectionNodes || sectionNodes.length === 0) continue

    for (let s = 0; s < sectionNodes.length; s++) {
      const sectionNode = sectionNodes[s]
      const bandNodes = sectionNode.querySelectorAll(':scope > band')

      for (let b = 0; b < bandNodes.length; b++) {
        const band = bandNodes[b]
        const bandHeight = parseInt(band.getAttribute('height') || '0', 10)

        if (sectionName === 'background') {
          // Check for large watermark text
          const staticTexts = band.querySelectorAll(':scope > staticText')
          if (staticTexts.length > 0) {
            const firstTextNode = staticTexts[0]
            const textVal = firstTextNode.querySelector('text')?.textContent?.trim()
            const fontNode = firstTextNode.querySelector('font')
            const reportNode = firstTextNode.querySelector('reportElement')
            const color = reportNode ? parseHexColor(reportNode.getAttribute('forecolor')) : '#e0e7ff'
            const fontSize = fontNode ? parseInt(fontNode.getAttribute('size') || '48', 10) : 48

            watermark = {
              type: 'text',
              text: textVal || 'WATERMARK',
              color: color || '#e0e7ff',
              opacity: 0.8,
              fontSize: isNaN(fontSize) ? 48 : fontSize,
              rotation: 0,
            }
          }
          continue
        }

        if (sectionName === 'pageHeader') {
          const headerElements = parseBand(band, 0)
          if (headerElements.length > 0) {
            pageSettings.header = {
              height: bandHeight,
              elements: headerElements,
            }
          }
          continue
        }

        if (sectionName === 'pageFooter') {
          const footerElements = parseBand(band, 0)
          if (footerElements.length > 0) {
            pageSettings.footer = {
              height: bandHeight,
              elements: footerElements,
            }
          }
          continue
        }

        if (sectionName === 'summary') {
          const sumElements = parseBand(band, 0)
          if (sumElements.length > 0) {
            summaryElements = sumElements
          }
          continue
        }

        // Body sections: title, columnHeader, detail, columnFooter
        const bodyElements = parseBand(band, currentYOffset)
        pageElements.push(...bodyElements)
        currentYOffset += bandHeight
      }
    }
  }

  if (watermark) {
    pageSettings.watermark = watermark
  }

  return {
    version: '1.0',
    metadata: {
      name,
      description: 'Convertido a partir de modelo JasperReports (JRXML)',
      author: options.author || 'Jasper Importer',
      created: new Date().toISOString().split('T')[0],
      tags: ['jasper', 'jrxml', 'imported'],
    },
    pageSettings,
    page: pageElements,
    ...(summaryElements ? { summaryPage: { elements: summaryElements } } : {}),
  }
}
