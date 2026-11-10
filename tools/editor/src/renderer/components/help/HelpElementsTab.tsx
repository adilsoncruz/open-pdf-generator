interface ElementCategory {
  title: string
  icon: string
  elements: {
    name: string
    type: string
    description: string
    usage: string
  }[]
}

const ELEMENT_CATEGORIES: ElementCategory[] = [
  {
    title: 'Text & Typography',
    icon: '📝',
    elements: [
      { name: 'Text', type: 'text', description: 'Dynamic text with expression binding and transformation filters.', usage: '${user.name | upperCase}' },
      { name: 'Static Text', type: 'static_text', description: 'Fixed label or heading that does not change between records.', usage: 'Invoice #' },
      { name: 'Rich Text', type: 'rich_text', description: 'Supports Markdown formatting (bold, italic, lists).', usage: '**Bold** and *Italic*' },
      { name: 'Hyperlink', type: 'link', description: 'Clickable URL or external web reference.', usage: 'https://openpdf.dev' },
    ],
  },
  {
    title: 'Layout & Flow',
    icon: '📦',
    elements: [
      { name: 'Container', type: 'container', description: 'Boxes and groups elements together with background and border.', usage: 'Cards, headers, panels' },
      { name: 'Loop', type: 'loop', description: 'Iterates through an array and repeats child elements vertically.', usage: 'dataBinding="invoice.items"' },
      { name: 'Spacer', type: 'spacer', description: 'Adds fixed vertical whitespace between sections.', usage: 'height: 24' },
    ],
  },
  {
    title: 'Media & Shapes',
    icon: '🎨',
    elements: [
      { name: 'Image', type: 'image', description: 'Displays local or remote images with fit modes (contain/cover).', usage: 'Base64, URL, or local path' },
      { name: 'Table', type: 'table', description: 'Multi-column grid with dynamic row binding and styled headers.', usage: 'dataBinding="order.lines"' },
      { name: 'Shape', type: 'rectangle', description: 'Rectangle with customizable fill color, border, and radius.', usage: 'Badges, cards, dividers' },
      { name: 'Line', type: 'line', description: 'Horizontal dividing rule with configurable stroke width.', usage: 'Section separators' },
    ],
  },
  {
    title: 'Barcodes & Identifiers',
    icon: '📊',
    elements: [
      { name: 'QR Code', type: 'barcode (qrcode)', description: '2D matrix barcode with configurable error correction.', usage: 'URLs, payment links, PIX' },
      { name: 'Barcode 1D', type: 'barcode (code128)', description: 'Standard linear barcode for SKU, tracking, or document numbers.', usage: 'Code128, EAN13' },
    ],
  },
]

export default function HelpElementsTab() {
  return (
    <div className="space-y-6">
      {/* Property reference banner */}
      <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 rounded-lg text-xs space-y-1 text-purple-900 dark:text-purple-200">
        <p className="font-semibold text-purple-800 dark:text-purple-300">💡 Common Properties</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
          <div><code className="text-purple-700 dark:text-purple-300">x, y, width, height</code>: Position &amp; size</div>
          <div><code className="text-purple-700 dark:text-purple-300">dataBinding</code>: Dynamic JSON field path</div>
          <div><code className="text-purple-700 dark:text-purple-300">printCondition</code>: Conditional visibility</div>
        </div>
      </div>

      {/* Categories */}
      {ELEMENT_CATEGORIES.map((cat) => (
        <div key={cat.title} className="space-y-3">
          <h4 className="text-sm font-semibold theme-text flex items-center gap-2">
            <span>{cat.icon}</span>
            {cat.title}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cat.elements.map((el) => (
              <div
                key={el.name}
                className="theme-bg-tertiary border theme-border rounded-lg p-3 hover:border-gray-300 dark:hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm theme-text">{el.name}</span>
                  <code className="text-[10px] font-mono bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded theme-text-muted">
                    {el.type}
                  </code>
                </div>
                <p className="text-xs theme-text-secondary mb-2">{el.description}</p>
                <div className="text-[11px] font-mono bg-white dark:bg-slate-900 border theme-border px-2 py-1 rounded theme-text-muted truncate">
                  <span className="text-purple-600 dark:text-purple-400">ex:</span> {el.usage}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
