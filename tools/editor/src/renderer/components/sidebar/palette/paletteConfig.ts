import type { ComponentType } from 'react'
import type { Element } from '../../../store/templateStore/types'
import {
  TextIcon,
  StaticTextIcon,
  RichTextIcon,
  HyperlinkIcon,
  ContainerIcon,
  LoopIcon,
  SpacerIcon,
  ImageIcon,
  TableIcon,
  ShapeIcon,
  LineIcon,
  QrCodeIcon,
  BarcodeIcon,
  ListPaletteIcon,
  CheckListPaletteIcon,
} from './paletteIcons'

export interface PaletteItemConfig {
  id: string
  type: string
  label: string
  title: string
  keywords?: string[]
  icon: ComponentType<{ className?: string }>
  createElement: () => Element
}

export interface PaletteCategory {
  id: string
  name: string
  items: PaletteItemConfig[]
}

const makeElement = (type: string, idPrefix: string, props: Partial<Element>): Element => ({
  type,
  id: `${idPrefix}-${Date.now()}`,
  x: 0,
  y: 0,
  ...props,
})

export const PALETTE_CATEGORIES: PaletteCategory[] = [
  {
    id: 'standard',
    name: 'Standard',
    items: [
      {
        id: 'text',
        type: 'text',
        label: 'Text',
        title: 'Texto Dinâmico / Expressão',
        keywords: ['text', 'texto', 'string', 'dinamico', 'expression'],
        icon: TextIcon,
        createElement: () =>
          makeElement('text', 'text', {
            value: 'Novo Texto', x: 40, y: 40, width: 200, height: 25,
            style: { fontSize: 12, fontFamily: 'Helvetica', color: '#000000' },
          }),
      },
      {
        id: 'static_text',
        type: 'static_text',
        label: 'Static Text',
        title: 'Texto Estático / Rótulo',
        keywords: ['static', 'estatico', 'label', 'rotulo', 'titulo'],
        icon: StaticTextIcon,
        createElement: () =>
          makeElement('static_text', 'static_text', {
            value: 'Texto Fixo', x: 40, y: 40, width: 200, height: 25,
            style: { fontSize: 12, fontFamily: 'Helvetica', color: '#000000' },
          }),
      },
      {
        id: 'rich_text',
        type: 'rich_text',
        label: 'Rich Text',
        title: 'Rich Text',
        keywords: ['rich', 'markdown', 'formatado', 'estilizado'],
        icon: RichTextIcon,
        createElement: () =>
          makeElement('rich_text', 'rich_text', {
            value: '**Texto** em *Markdown*', x: 40, y: 40, width: 200, height: 30,
            style: { fontSize: 12, fontFamily: 'Helvetica', color: '#000000' },
          }),
      },
      {
        id: 'link',
        type: 'link',
        label: 'Hyperlink',
        title: 'Hyperlink',
        keywords: ['link', 'hyperlink', 'url', 'ancora', 'web'],
        icon: HyperlinkIcon,
        createElement: () =>
          makeElement('link', 'link', {
            value: 'Clique aqui', url: 'https://exemplo.com', x: 40, y: 40, width: 140, height: 25,
            style: { fontSize: 12, fontFamily: 'Helvetica', color: '#3b82f6' },
          }),
      },
      {
        id: 'list',
        type: 'list',
        label: 'List',
        title: 'Lista com Marcadores',
        keywords: ['list', 'lista', 'bullet', 'bulleted', 'numbered', 'numerada'],
        icon: ListPaletteIcon,
        createElement: () =>
          makeElement('list', 'list', {
            x: 40, y: 40, width: 300, height: 60, dataBinding: 'items',
            listStyle: 'BULLETED', itemSpacing: 10,
            style: { fontSize: 12, fontFamily: 'Helvetica', color: '#000000' },
          }),
      },
      {
        id: 'check_list',
        type: 'check_list',
        label: 'Checklist',
        title: 'Lista de Verificação (Checklist)',
        keywords: ['check', 'checklist', 'tarefas', 'checkbox', 'tasks'],
        icon: CheckListPaletteIcon,
        createElement: () =>
          makeElement('check_list', 'check_list', {
            x: 40, y: 40, width: 300, height: 60, dataBinding: 'tasks',
            checkStyle: 'RECTANGLE', itemSpacing: 0,
            style: { fontSize: 12, fontFamily: 'Helvetica', color: '#000000' },
          }),
      },
    ],
  },
  {
    id: 'layout',
    name: 'Layout',
    items: [
      {
        id: 'container',
        type: 'container',
        label: 'Container',
        title: 'Container',
        keywords: ['container', 'box', 'caixa', 'div', 'agrupar'],
        icon: ContainerIcon,
        createElement: () =>
          makeElement('container', 'container', {
            name: 'Container', x: 0, y: 0, width: '100%', height: 120, elements: [],
          }),
      },
      {
        id: 'loop',
        type: 'loop',
        label: 'Loop',
        title: 'Loop Repetidor de Dados',
        keywords: ['loop', 'repetidor', 'repeat', 'each', 'lista', 'array'],
        icon: LoopIcon,
        createElement: () =>
          makeElement('loop', 'loop', {
            width: 400, height: 120, dataBinding: '', itemSpacing: 10, elements: [],
            style: { borderColor: '#8b5cf6', borderWidth: 1, borderStyle: 'dashed' },
          }),
      },
      {
        id: 'spacer',
        type: 'spacer',
        label: 'Spacer',
        title: 'Spacer',
        keywords: ['spacer', 'espaco', 'espacador', 'padding', 'margin'],
        icon: SpacerIcon,
        createElement: () => makeElement('spacer', 'spacer', { x: 0, y: 0, width: '100%', height: 40 }),
      },
    ],
  },
  {
    id: 'media_shapes',
    name: 'Media & Shapes',
    items: [
      {
        id: 'image',
        type: 'image',
        label: 'Image',
        title: 'Image',
        keywords: ['image', 'imagem', 'foto', 'picture', 'logo'],
        icon: ImageIcon,
        createElement: () =>
          makeElement('image', 'image', { x: 40, y: 40, width: 120, height: 80, source: '', fit: 'contain' }),
      },
      {
        id: 'table',
        type: 'table',
        label: 'Table',
        title: 'Table',
        keywords: ['table', 'tabela', 'grid', 'colunas', 'grade'],
        icon: TableIcon,
        createElement: () =>
          makeElement('table', 'table', {
            x: 40, y: 40, width: 400, dataBinding: '',
            columns: [{ header: 'Coluna 1', field: 'item', width: 200 }],
            style: { headerBackground: '#f3f4f6', headerColor: '#000000', borderWidth: 1 },
          }),
      },
      {
        id: 'rectangle',
        type: 'rectangle',
        label: 'Shape',
        title: 'Shape (Retângulo)',
        keywords: ['shape', 'retangulo', 'rectangle', 'quadrado', 'forma'],
        icon: ShapeIcon,
        createElement: () =>
          makeElement('rectangle', 'rect', {
            x: 40, y: 40, width: 100, height: 60,
            style: { fillColor: '#e2e8f0', borderColor: '#94a3b8', borderWidth: 1 },
          }),
      },
      {
        id: 'line',
        type: 'line',
        label: 'Line',
        title: 'Linha Divisória',
        keywords: ['line', 'linha', 'divisor', 'hr', 'separador'],
        icon: LineIcon,
        createElement: () =>
          makeElement('line', 'line', {
            x: 40, y: 40, width: 200, height: 0,
            style: { strokeColor: '#000000', strokeWidth: 1 },
          }),
      },
    ],
  },
  {
    id: 'barcodes',
    name: 'Barcodes',
    items: [
      {
        id: 'qr_code',
        type: 'barcode',
        label: 'QR Code',
        title: 'Barcodes / QR',
        keywords: ['qr', 'qrcode', 'codigo', 'barcode', '2d'],
        icon: QrCodeIcon,
        createElement: () =>
          makeElement('barcode', 'barcode', {
            x: 40, y: 40, width: 100, height: 100, barcodeType: 'qrcode',
            value: 'https://openpdf.dev', dataBinding: 'https://openpdf.dev',
            style: { errorCorrection: 'M' },
          }),
      },
      {
        id: 'barcode_1d',
        type: 'barcode',
        label: 'Barcode',
        title: 'Código de Barras 1D',
        keywords: ['barcode', 'code128', 'barras', 'codigo de barras', '1d'],
        icon: BarcodeIcon,
        createElement: () =>
          makeElement('barcode', 'barcode', {
            x: 40, y: 40, width: 140, height: 50, barcodeType: 'code128',
            value: '123456789012', dataBinding: '123456789012',
            style: { errorCorrection: 'M' },
          }),
      },
    ],
  },
]
