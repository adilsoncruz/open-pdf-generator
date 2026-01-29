# PDF Template Editor - Desktop App

Desktop application for creating and editing PDF templates visually.

## 🚀 Technologies

- **Electron** - Cross-platform desktop framework
- **React 18** - User interface
- **TypeScript** - Static typing
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling
- **Zustand** - State management

## 📦 Installation

### Prerequisites

- **Java 11+** - Required to generate PDFs
  ```bash
  # macOS (via Homebrew)
  brew install openjdk@17
  
  # Ubuntu/Debian
  sudo apt install openjdk-17-jdk
  
  # Windows
  # Download from https://adoptium.net/
  ```

- **Node.js 18+** - For development
  ```bash
  brew install node  # macOS
  ```

### Install dependencies

```bash
# From the project root
make install

# Or directly in the editor folder
cd tools/editor && npm install
```

### Install PDF Generator CLI (for development)

```bash
# Build and install CLI locally
make cli-install
```

This installs the CLI to `~/.pdf-generator/pdf-generator.jar`.

## 🛠️ Development

```bash
# Start app in development mode
npm run dev

# Build for production
npm run build

# Package application
npm run package
```

## 🎯 Features

### Visual Editor
- ✅ Add elements (text, image, table, rectangle, line)
- ✅ Drag and position elements
- ✅ Edit properties in real-time
- ✅ Template preview on canvas
- ✅ Alignment grid

### Template Management
- ✅ Create new template
- ✅ Open existing template
- ✅ Save template
- ✅ Save as (new file)
- ✅ Export template

### Data Binding
- ✅ Test data editor (JSON)
- ✅ Load examples
- ✅ JSON validation
- ✅ Preview with real data

### Properties Panel
- ✅ Edit position (X, Y)
- ✅ Edit dimensions (width, height)
- ✅ Type-specific properties
- ✅ Colors and styles
- ✅ Data bindings

### Layers
- ✅ Elements list
- ✅ Element selection
- ✅ Delete elements
- ✅ Visual selection indicator

## 🎨 Interface

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Toolbar (New, Open, Save, Test Data, Export)                │
├──────────┬──────────────────────────────────┬───────────────┤
│          │                                  │               │
│ Sidebar  │          Canvas                  │  Properties   │
│          │                                  │     Panel     │
│ - Text   │    ┌──────────────────┐          │               │
│ - Image  │    │                  │          │  - Position   │
│ - Table  │    │   Page Preview   │          │  - Dimensions │
│ - Rect   │    │                  │          │  - Styles     │
│ - Line   │    │                  │          │  - Bindings   │
│          │    └──────────────────┘          │               │
│ Layers   │                                  │               │
│          │                                  │               │
└──────────┴──────────────────────────────────┴───────────────┘
```

### Keyboard Shortcuts

- `Cmd/Ctrl + N` - New template
- `Cmd/Ctrl + O` - Open template
- `Cmd/Ctrl + S` - Save
- `Cmd/Ctrl + Shift + S` - Save as
- `Delete` - Delete selected element
- `Cmd/Ctrl + Z` - Undo
- `Cmd/Ctrl + Y` - Redo
- `Cmd/Ctrl + Shift + P` - Toggle PDF preview

## 🔌 Library Integration

The app integrates with the Kotlin/Java library (PDF Generator CLI) to generate PDFs.

### Architecture

The CLI is installed **separately** from the app, in `~/.pdf-generator/`:

```
~/.pdf-generator/
├── pdf-generator.jar    ← CLI installed here
└── version.txt          ← Installed version
```

### Benefits of this architecture:
- ✅ Lighter app (doesn't include 6 MB JAR)
- ✅ CLI can be updated independently from the app
- ✅ Multiple app versions share the same CLI

### First Run

The first time you try to generate a PDF:
1. The app checks if the CLI is installed
2. If not, it shows a modal for installation
3. You can install automatically or select a JAR manually

### Available APIs

```typescript
// Check CLI status
const status = await window.electronAPI.getCLIStatus()

// Install CLI
await window.electronAPI.installCLI()

// Generate PDF
const result = await window.electronAPI.generatePDF(
  JSON.stringify(template),
  JSON.stringify(testData)
)
```

Communication is done via Electron IPC (Inter-Process Communication), which calls the CLI via `child_process`.

For more details, see [JAR_INTEGRATION.md](./JAR_INTEGRATION.md).

## 📁 File Structure

```
editor/
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.ts       # Entry point
│   │   └── preload.ts     # Secure bridge
│   │
│   └── renderer/          # React interface
│       ├── components/    # React components
│       │   ├── Toolbar.tsx
│       │   ├── Sidebar.tsx
│       │   ├── Canvas.tsx
│       │   ├── PropertiesPanel.tsx
│       │   └── DataPanel.tsx
│       ├── store/         # Global state
│       │   └── templateStore.ts
│       ├── App.tsx        # Main app
│       ├── main.tsx       # React entry point
│       └── index.css      # Global styles
│
├── dist/                  # Build output
├── release/               # Packaged applications
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🎯 Roadmap

### Current Version (v1.0)
- [x] Basic visual editor
- [x] Editable properties
- [x] Save/load templates
- [x] Test data
- [x] Copy/Paste elements
- [x] Themes (light/dark)
- [x] Canvas zoom
- [x] Snap to grid/margins
- [x] Element grouping
- [x] Layers with drag-and-drop
- [x] Barcode/QR Code
- [x] Loop Element
- [x] Relative positioning
- [x] CLI decoupled from app
- [x] PDF Preview

### Future Improvements
- [ ] Guides and rulers
- [ ] Template library
- [ ] Export to PNG/SVG
- [ ] Real-time validation
- [ ] Auto-save
- [ ] Version history

## 🐛 Debug

For debugging, the app opens DevTools automatically in development mode. Use:

```javascript
console.log('Debug info:', data)
```

## 📝 Contributing

1. Fork the project
2. Create a branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE for details
