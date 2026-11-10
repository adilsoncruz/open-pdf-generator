import { useTemplateStore, type Element } from '../store/templateStore'
import { Icon, type IconName } from './atoms'
import { useTranslation } from '../i18n'

const ELEMENT_TYPES: { type: string; label: string; icon: IconName }[] = [
  { type: 'text', label: 'Text', icon: 'text' },
  { type: 'static_text', label: 'Static Text', icon: 'static-text' },
  { type: 'image', label: 'Image', icon: 'image' },
  { type: 'table', label: 'Table', icon: 'table' },
  { type: 'rectangle', label: 'Rectangle', icon: 'rectangle' },
  { type: 'line', label: 'Line', icon: 'line' },
  { type: 'barcode', label: 'Barcode/QR', icon: 'barcode' },
  { type: 'loop', label: 'Loop', icon: 'loop' },
  { type: 'page_break', label: 'Page Break', icon: 'page-break' },
  { type: 'spacer', label: 'Spacer', icon: 'spacer' },
  { type: 'rich_text', label: 'Rich Text', icon: 'markdown' },
  { type: 'link', label: 'Link', icon: 'link' },
  { type: 'list', label: 'List', icon: 'list' },
  { type: 'check_list', label: 'Checklist', icon: 'check-square' },
]

export default function ElementsToolbar() {
  const { t } = useTranslation()
  const { currentSection, addElement, template } = useTemplateStore()

  const elementLabels: Record<string, string> = {
    text: t.elements.text,
    static_text: t.elements.staticText,
    image: t.elements.image,
    table: t.elements.table,
    rectangle: t.elements.rectangle,
    line: t.elements.line,
    barcode: t.elements.barcode,
    loop: t.elements.loop,
    page_break: t.elements.pageBreak,
    spacer: t.elements.spacer,
    rich_text: t.elements.richText,
    link: t.elements.link,
    container: t.elements.container,
    list: t.elements.list,
    check_list: t.elements.checkList,
  }

  const handleAddElement = (type: string) => {
    const id = `${type}-${Date.now()}`
    
    const baseElement = {
      type,
      id,
      x: 50,
      y: 50,
    }

    let element: Element
    switch (type) {
      case 'text':
        element = {
          ...baseElement,
          dataBinding: 'field',
          width: 200,
          height: 30,
          style: {
            fontSize: 12,
            fontFamily: 'Helvetica',
            fontWeight: 'normal',
            color: '#000000',
            alignment: 'left',
          },
        }
        break
      case 'static_text':
        element = {
          ...baseElement,
          value: 'Static Text',
          width: 200,
          height: 30,
          style: {
            fontSize: 12,
            fontFamily: 'Helvetica',
            fontWeight: 'normal',
            color: '#000000',
            alignment: 'left',
          },
        }
        break
      case 'image':
        element = {
          ...baseElement,
          width: '100%',
          height: 100,
          source: '',
          fit: 'contain',
        }
        break
      case 'table':
        element = {
          ...baseElement,
          width: 400,
          dataBinding: '',
          columns: [
            { header: 'Column 1', field: 'field1', width: 200 },
          ],
          style: {
            headerBackground: '#f0f0f0',
            headerColor: '#000000',
            headerFontSize: 12,
            borderColor: '#cccccc',
            borderWidth: 1,
          },
        }
        break
      case 'rectangle':
        element = {
          ...baseElement,
          width: 200,
          height: 100,
          style: {
            fillColor: '#4a90e2',
            borderColor: null,
            borderWidth: 1,
            cornerRadius: 0,
          },
        }
        break
      case 'line':
        element = {
          ...baseElement,
          width: 200,
          height: 0,
          style: {
            strokeColor: '#000000',
            strokeWidth: 1,
          },
        }
        break
      case 'barcode':
        element = {
          ...baseElement,
          width: 100,
          height: 100,
          barcodeType: 'qrcode',
          value: 'https://openpdf.dev',
          dataBinding: 'https://openpdf.dev',
          style: {
            errorCorrection: 'M',
          },
        }
        break
      case 'loop':
        element = {
          ...baseElement,
          width: 400,
          height: 150,
          dataBinding: '', // Ex: items ou invoice.items - caminho para a lista
          itemSpacing: 20, 
          elements: [], 
          style: {
            borderColor: '#8b5cf6',
            borderWidth: 1,
            borderStyle: 'dashed',
          },
        }
        break
      case 'page_break':
        element = {
          ...baseElement,
          x: 0,
          width: '100%',
          height: 20,
          positionMode: 'RELATIVE',
          relativeOffsetY: 0
        }
        break
      case 'spacer':
        element = {
          ...baseElement,
          x: 0,
          width: '100%',
          height: 50,
          positionMode: 'RELATIVE',
          relativeOffsetY: 0
        }
        break
      case 'rich_text':
        element = {
          ...baseElement,
          value: '**Rich** *Text*',
          width: 200,
          height: 30,
          style: {
            fontSize: 12,
            fontFamily: 'Helvetica',
            color: '#000000',
            alignment: 'left',
          },
        }
        break
      case 'link':
        element = {
          ...baseElement,
          value: 'Click here',
          url: 'https://example.com',
          width: 150,
          height: 30,
          style: {
            fontSize: 12,
            fontFamily: 'Helvetica',
            color: '#0000FF',
            alignment: 'left',
          },
        }
        break
      case 'container':
        element = {
          ...baseElement,
          x: 0,
          width: 400,
          height: 150,
          heightMode: 'auto',
          autoHeight: true,
          positionMode: 'RELATIVE',
          relativeOffsetY: 0,
          elements: [],
          style: {
            borderColor: '#0ea5e9',
            borderWidth: 1,
            borderStyle: 'dashed',
          },
        }
        break
      case 'list':
        element = {
          ...baseElement,
          width: 300,
          height: 60,
          dataBinding: 'items',
          listStyle: 'BULLETED',
          itemSpacing: 10,
          style: {
            fontSize: 12,
            fontFamily: 'Helvetica',
            color: '#000000',
          },
        }
        break
      case 'check_list':
        element = {
          ...baseElement,
          width: 300,
          height: 60,
          dataBinding: 'tasks',
          checkStyle: 'RECTANGLE',
          itemSpacing: 0,
          style: {
            fontSize: 12,
            fontFamily: 'Helvetica',
            color: '#000000',
          },
        }
        break
      default:
        return
    }

    addElement(element, currentSection)
  }

  const isDisabled = 
    (currentSection === 'header' && !template.pageSettings.header) ||
    (currentSection === 'footer' && !template.pageSettings.footer) ||
    (currentSection === 'bodyBackground' && !template.pageSettings.bodyBackground)

  return (
    <div className="w-16 theme-bg-tertiary border-l theme-border flex flex-col items-center pt-2 pb-4 space-y-2">
      {ELEMENT_TYPES.map((elem) => (
        <button
          key={elem.type}
          onClick={() => !isDisabled && handleAddElement(elem.type)}
          disabled={isDisabled}
          className={`w-12 h-12 rounded-xl transition-all flex items-center justify-center group relative ${
            isDisabled
              ? 'theme-surface opacity-40 cursor-not-allowed'
              : 'theme-surface border theme-border hover:border-primary-500 hover:shadow-glow-sm'
          }`}
          title={elementLabels[elem.type] || elem.label}
        >
          <Icon 
            name={elem.icon} 
            size="lg" 
            className={isDisabled ? 'theme-text-muted' : 'theme-text-secondary group-hover:text-primary-400'}
          />
          
          {/* Tooltip */}
          <div className="absolute right-full mr-2 px-2 py-1 theme-surface border theme-border theme-text text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
            {elementLabels[elem.type] || elem.label}
          </div>
        </button>
      ))}
    </div>
  )
}
