import { useTemplateStore } from '../store/templateStore'

// Minimalist SVG icons
const Icons = {
  text: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h16M9 20v-13M15 20v-13" />
    </svg>
  ),
  static_text: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h16M9 20v-13M15 20v-13" />
      <circle cx="18" cy="18" r="4" fill="currentColor" stroke="none" />
    </svg>
  ),
  image: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  ),
  table: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M3 15h18M12 3v18" />
    </svg>
  ),
  rectangle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  ),
  line: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 19l14-14" />
    </svg>
  ),
  barcode: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M6 6h2v12H6zM10 6h1v12h-1zM13 6h1v12h-1zM16 6h2v12h-2z" />
    </svg>
  ),
  loop: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 2l4 4-4 4" />
      <path d="M3 11v-1a4 4 0 014-4h14" />
      <path d="M7 22l-4-4 4-4" />
      <path d="M21 13v1a4 4 0 01-4 4H3" />
    </svg>
  ),
}

const ELEMENT_TYPES = [
  { type: 'text', label: 'Text', icon: Icons.text },
  { type: 'static_text', label: 'Static Text', icon: Icons.static_text },
  { type: 'image', label: 'Image', icon: Icons.image },
  { type: 'table', label: 'Table', icon: Icons.table },
  { type: 'rectangle', label: 'Rectangle', icon: Icons.rectangle },
  { type: 'line', label: 'Line', icon: Icons.line },
  { type: 'barcode', label: 'Barcode/QR', icon: Icons.barcode },
  { type: 'loop', label: 'Loop', icon: Icons.loop },
]

export default function ElementsToolbar() {
  const { currentSection, addElement, template } = useTemplateStore()

  const handleAddElement = (type: string) => {
    const id = `${type}-${Date.now()}`
    
    const baseElement = {
      type,
      id,
      x: 50,
      y: 50,
    }

    let element
    switch (type) {
      case 'text':
        element = {
          ...baseElement,
          value: 'New Text',
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
          width: 100,
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
          x2: 250,
          y2: 50,
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
          barcodeType: 'qrcode', // 'qrcode' ou 'barcode'
          dataBinding: '', 
          style: {
            errorCorrection: 'M', // L, M, Q, H (para QR Code)
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
          title={elem.label}
        >
          <div className={`w-6 h-6 ${isDisabled ? 'theme-text-muted' : 'theme-text-secondary group-hover:text-primary-400'}`}>
            {elem.icon}
          </div>
          
          {/* Tooltip */}
          <div className="absolute right-full mr-2 px-2 py-1 theme-surface border theme-border theme-text text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
            {elem.label}
          </div>
        </button>
      ))}
    </div>
  )
}
