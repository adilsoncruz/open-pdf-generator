# Open PDF Generator

> 🚀 Open source toolkit for generating PDFs from JSON templates

[![License: LGPL v3](https://img.shields.io/badge/License-LGPL%20v3-blue.svg)](https://www.gnu.org/licenses/lgpl-3.0)
[![JitPack](https://jitpack.io/v/adilsoncruz/open-pdf-generator.svg)](https://jitpack.io/#adilsoncruz/open-pdf-generator)

## 📋 Overview

Open PDF Generator is a complete ecosystem for creating and generating PDFs from JSON templates:

| Component | Description |
|-----------|-------------|
| **[Core Engine](./core/)** | Kotlin/Java library for PDF generation with OpenPDF |
| **[Template Editor](./tools/editor/)** | Desktop app (Electron) for visual template editing |
| **[CLI](./tools/cli/)** | Command-line interface for automation |
| **[Documentation](./docs/)** | VitePress documentation site |

## 🏗️ Project Structure

```
open-pdf-generator/
│
├── core/                       # PDF Generator Engine (Kotlin/Java)
│   ├── src/
│   │   ├── main/kotlin/
│   │   └── test/kotlin/
│   └── build.gradle.kts
│
├── tools/
│   ├── cli/                    # Command Line Interface
│   │   ├── src/
│   │   └── build.gradle.kts
│   │
│   └── editor/                 # Desktop Template Editor (Electron + React)
│       ├── src/
│       │   ├── main/           # Electron main process
│       │   └── renderer/       # React interface
│       └── package.json
│
├── docs/                       # VitePress Documentation
│   ├── engine/                 # Engine documentation
│   ├── editor/                 # Editor documentation
│   └── .vitepress/
│
├── Makefile                    # Build automation
├── gradlew                     # Gradle wrapper
├── settings.gradle.kts         # Multi-project config
├── README.md
├── CONTRIBUTING.md
└── LICENSE
```

## 🚀 Quick Start

### Using the Library

Add to your project:

```kotlin
// build.gradle.kts
repositories {
    maven { url = uri("https://jitpack.io") }
}

dependencies {
    implementation("com.github.adilsoncruz:open-pdf-generator:1.0.0")
}
```

Generate a PDF:

```kotlin
val template = """
{
  "page": { "format": "A4" },
  "body": {
    "elements": [
      { "type": "text", "x": 10, "y": 10, "text": "Hello, {{name}}!" }
    ]
  }
}
"""

val data = mapOf("name" to "World")
val pdf = PDFGenerator().generate(template, data)
File("hello.pdf").writeBytes(pdf)
```

### Using the CLI

```bash
# Generate a PDF
pdf-generator generate template.json -d data.json -o output.pdf

# Validate a template
pdf-generator validate template.json
```

### Using the Editor

Download the [latest release](https://github.com/adilsoncruz/open-pdf-generator/releases) or build from source:

```bash
cd tools/editor
npm install
npm run dev
```

## 🎯 Template Format

Templates are JSON files with page settings, header/footer, and body elements:

```json
{
  "page": {
    "format": "A4",
    "orientation": "portrait",
    "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20 }
  },
  "header": {
    "height": 30,
    "elements": [
      { "type": "text", "x": 10, "y": 10, "text": "Company Name" }
    ]
  },
  "body": {
    "elements": [
      { "type": "text", "x": 10, "y": 10, "text": "Invoice #{{invoiceNumber}}" },
      { "type": "table", "x": 10, "y": 30, "dataSource": "items", ... }
    ]
  },
  "footer": {
    "height": 20,
    "elements": [
      { "type": "text", "x": 10, "y": 5, "text": "Page {{pageNumber}} of {{totalPages}}" }
    ]
  }
}
```

> Coordinate system note: `pageElements` (body) start **below** the top margin + header area.  
> This means body element/container/loop `y` values are relative to the body content area, not the physical top of the page.  
> Example: with `header.height = 100` and `margins.top = 15`, use `y: 0` to start right after the header (do **not** add `115` again).

## ✨ Features

### Core Engine
- 📄 Generate PDFs from JSON templates
- 🔗 Data binding with mustache syntax (`{{variable}}`)
- 🔄 Loops and conditional elements
- 📊 Tables with dynamic data
- 📷 Images (PNG, JPG, SVG, Base64)
- 📏 Barcodes and QR codes
- 📑 Headers, footers, and pagination
- 🎨 Styling (fonts, colors, borders)
- ⚡ High performance

### Template Editor
- 🖱️ Drag-and-drop interface
- 👁️ Real-time preview
- 📝 Test data configuration
- 💾 Save/load templates
- ⌨️ Keyboard shortcuts
- 🎨 Dark/light themes

### CLI
- 🖥️ Generate PDFs from command line
- ✅ Template validation
- 📦 CI/CD integration ready

## ⚡ Performance Benchmark (vs JasperReports)

Under identical JVM environments, **Open PDF Generator** substantially outperforms **JasperReports 6.21.4** across speed, memory allocation, and cold start:

| Metric / Scenario | Open PDF Generator | JasperReports 6.21.4 | Advantage |
|---|---|---|---|
| **Cold Start (1st Doc Render)** | **273.6 ms** | 1166.0 ms | **4.3x faster** (Ideal for Serverless & Lambda) |
| **Invoice (Single-thread)** | **0.50 ms** (1,874 docs/s) | 2.24 ms (424 docs/s) | **4.4x faster** latency |
| **Concurrency (8 Parallel Threads)** | **23,860 docs/s** | 5,300 docs/s | **4.5x higher** parallel throughput |
| **Direct Stream (`OutputStream`)** | **0.12 ms** (zero-copy) | 0.73 ms | **5.9x faster** streaming |
| **Distribution Size (JARs)** | **4.0 MB** | 13.6 MB | **3.4x smaller** dependencies |
| **Template Compilation** | Instant (Native JSON) | Required (JRXML -> .jasper) | Zero build-time compilation |

👉 Full details in the [Benchmark Documentation](https://adilsoncruz.github.io/open-pdf-generator/lib/benchmark).

## 📦 Development

### Prerequisites

- **JDK 21+** - For core and CLI
- **Node.js 18+** - For editor and docs
- **npm** - Package manager
- **Make** - Build automation (optional but recommended)

### Using Make (Recommended)

The project includes a `Makefile` for easy build automation:

```bash
# Show all available commands
make help

# Install all dependencies
make install

# Build core library and CLI
make build

# Build everything (core, cli, editor, docs)
make all

# Run tests
make test

# Start editor in dev mode
make editor-dev

# Start docs in dev mode
make docs-dev

# Clean all build artifacts
make clean
```

### Manual Building

```bash
# Build core library
cd core && ./gradlew build

# Build CLI
./gradlew :tools:cli:shadowJar

# Build editor
cd tools/editor && npm install && npm run build

# Build docs
cd docs && npm install && npm run build
```

### Running Tests

```bash
# Using Make
make test

# Or manually
cd core && ./gradlew test
```

## 📚 Documentation

Visit the [documentation site](https://adilsoncruz.github.io/open-pdf-generator/) or run locally:

```bash
make docs-dev

# Or manually
cd docs && npm install && npm run dev
```

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenPDF](https://github.com/LibrePDF/OpenPDF) - PDF generation library
- [Electron](https://www.electronjs.org/) - Desktop framework
- [React](https://react.dev/) - UI library
- [VitePress](https://vitepress.dev/) - Documentation framework
