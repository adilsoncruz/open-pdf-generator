import type { Template, Element as TemplateElement, WatermarkConfig } from '../../store/templateStore'
import { parseBand, parseWatermarkFromBand } from './jrxmlBandParser'

type PageSettings = Template['pageSettings']

export interface JrxmlImportOptions {
  author?: string
  detectTableFromDetail?: boolean
}

export function determinePageSize(pageWidth: number, pageHeight: number): string {
  if ((pageWidth === 595 && pageHeight === 842) || (pageWidth === 842 && pageHeight === 595)) return 'A4'
  if ((pageWidth === 612 && pageHeight === 792) || (pageWidth === 792 && pageHeight === 612)) return 'LETTER'
  if ((pageWidth === 420 && pageHeight === 595) || (pageWidth === 595 && pageHeight === 420)) return 'A5'
  return 'CUSTOM'
}

/**
 * Converte conteúdo XML JRXML (JasperReports) para o formato Template do Open PDF Generator.
 */
export function convertJrxmlToTemplate(jrxmlContent: string, options: JrxmlImportOptions = {}): Template {
  const parser = new DOMParser()
  const doc = parser.parseFromString(jrxmlContent, 'text/xml')
  const parserError = doc.querySelector('parsererror')
  if (parserError) throw new Error(`Erro ao analisar XML Jasper: ${parserError.textContent || 'XML inválido'}`)

  const root = doc.documentElement
  if (!root || root.nodeName !== 'jasperReport') {
    throw new Error('Arquivo JRXML inválido: tag raiz <jasperReport> não encontrada')
  }

  const name = root.getAttribute('name') || 'Converted Jasper Template'
  const pageWidth = parseInt(root.getAttribute('pageWidth') || '595', 10)
  const pageHeight = parseInt(root.getAttribute('pageHeight') || '842', 10)
  const orientation = (root.getAttribute('orientation') || 'portrait').toLowerCase()

  const pageSettings: PageSettings = {
    size: determinePageSize(pageWidth, pageHeight),
    orientation: orientation === 'landscape' ? 'landscape' : 'portrait',
    margins: {
      top: parseInt(root.getAttribute('topMargin') || '20', 10),
      right: parseInt(root.getAttribute('rightMargin') || '20', 10),
      bottom: parseInt(root.getAttribute('bottomMargin') || '20', 10),
      left: parseInt(root.getAttribute('leftMargin') || '20', 10),
    },
  }

  let watermark: WatermarkConfig | undefined
  const pageElements: TemplateElement[] = []
  let summaryElements: TemplateElement[] | undefined
  let currentYOffset = 0

  const sections = ['background', 'title', 'pageHeader', 'columnHeader', 'detail', 'columnFooter', 'pageFooter', 'summary']

  for (const sectionName of sections) {
    const sectionNodes = root.querySelectorAll(`:scope > ${sectionName}`)
    if (!sectionNodes || sectionNodes.length === 0) continue

    for (let s = 0; s < sectionNodes.length; s++) {
      const bandNodes = sectionNodes[s].querySelectorAll(':scope > band')

      for (let b = 0; b < bandNodes.length; b++) {
        const band = bandNodes[b]
        const bandHeight = parseInt(band.getAttribute('height') || '0', 10)

        if (sectionName === 'background') {
          const wm = parseWatermarkFromBand(band)
          if (wm) watermark = wm
          continue
        }

        if (sectionName === 'pageHeader') {
          const headerElements = parseBand(band, 0)
          if (headerElements.length > 0) {
            pageSettings.header = { height: bandHeight, elements: headerElements }
          }
          continue
        }

        if (sectionName === 'pageFooter') {
          const footerElements = parseBand(band, 0)
          if (footerElements.length > 0) {
            pageSettings.footer = { height: bandHeight, elements: footerElements }
          }
          continue
        }

        if (sectionName === 'summary' && root.getAttribute('isSummaryNewPage') === 'true') {
          const sumElements = parseBand(band, 0)
          if (sumElements.length > 0) summaryElements = sumElements
          continue
        }

        // Seções de corpo: title, columnHeader, detail, columnFooter, summary (quando inline)
        const bodyElements = parseBand(band, currentYOffset)
        pageElements.push(...bodyElements)
        currentYOffset += bandHeight
      }
    }
  }

  if (watermark) pageSettings.watermark = watermark

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
