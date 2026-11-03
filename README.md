# Open PDF Generator

> 🚀 Open source toolkit for generating PDFs from JSON templates

[![CI](https://github.com/adilsoncruz/open-pdf-generator/actions/workflows/ci.yml/badge.svg)](https://github.com/adilsoncruz/open-pdf-generator/actions/workflows/ci.yml)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL_3.0-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![JitPack](https://jitpack.io/v/adilsoncruz/open-pdf-generator.svg)](https://jitpack.io/#adilsoncruz/open-pdf-generator)
[![Web Playground](https://img.shields.io/badge/🎮%20Playground-Try%20Online-6366f1.svg)](https://adilsoncruz.github.io/open-pdf-generator/playground/)
[![GitHub Stars](https://img.shields.io/github/stars/adilsoncruz/open-pdf-generator?style=social)](https://github.com/adilsoncruz/open-pdf-generator)
[![Sponsor](https://img.shields.io/badge/Sponsor-GitHub%20Sponsors-ff69b4?logo=github)](https://github.com/sponsors/adilsoncruz)

> ⚡ **2.5x to 9.8x Faster than JasperReports** | **8,650 docs/sec** in containers | **195ms Cold Start** | **4.0MB footprint**  
> Modern, lightweight, declarative JSON alternative to legacy JasperReports and proprietary iText engines. Read the [Benchmark Case Study](https://adilsoncruz.github.io/open-pdf-generator/lib/benchmark).

## 📋 Overview

Open PDF Generator is a complete ecosystem for creating and generating PDFs from JSON templates:

| Component | Description |
|-----------|-------------|
| **[Core Engine](./core/)** | Kotlin/Java library for high-throughput PDF generation with OpenPDF |
| **[Template Editor](./tools/editor/)** | Desktop app (Electron) & [Interactive Web Playground](https://adilsoncruz.github.io/open-pdf-generator/playground/) |
| **[CLI](./tools/cli/)** | Native binary (GraalVM) & Docker container for CLI automation |
| **[Documentation](https://adilsoncruz.github.io/open-pdf-generator/)** | Interactive VitePress documentation site with guides and API specs |

## ⚡ Performance: Open PDF Generator vs JasperReports

Stress test executed inside an isolated Linux container with cgroup quotas (**2 vCPU, 1 GB RAM**):

| Metric | Open PDF Generator | JasperReports 7.0.3 | JasperReports 6.21.4 | Open PDF Advantage |
|:---|:---:|:---:|:---:|:---:|
| **Throughput (100k docs)** | **8,650 docs/sec** | 3,539 docs/sec | 3,338 docs/sec | **+144% capacity (2.5x faster)** |
| **Complex Doc (Barcode + QR)** | **1.22 ms** | 11.88 ms | 10.58 ms | **9.8x faster (9.9x less RAM)** |
| **Cold Start (1st doc)** | **195 ms** | 742 ms | 1,166 ms | **3.8x - 4.3x faster boot** |
| **Container RAM (Peak RSS)** | **128 MB** | 171 MB | 164 MB | **25% less RAM (Zero GC pauses)** |
| **Runtime Footprint** | **4.0 MB** | 25.2 MB | 13.6 MB | **6.3x lighter JAR** |

👉 Read the full [Interactive Benchmark Dashboard & Case Study](https://adilsoncruz.github.io/open-pdf-generator/lib/benchmark).

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
│   ├── lib/                    # Core library guide & API reference
│   ├── cli/                    # CLI commands & documentation
│   ├── editor/                 # Editor guide & downloads
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
import com.pdfgenerator.api.PDFGenerator
import com.pdfgenerator.model.Template
import java.io.File

val templateJson = """
{
  "version": "1.0",
  "pageSettings": {
    "size": "A4",
    "orientation": "portrait",
    "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 }
  },
  "page": [
    {
      "type": "text",
      "id": "title",
      "x": 36,
      "y": 36,
      "value": "Hello, ${'$'}{name}!",
      "style": { "fontSize": 18, "fontWeight": "bold", "color": "#1e293b" }
    }
  ]
}
"""

val data = mapOf("name" to "World")
val generator = PDFGenerator()
val pdfBytes = generator.generate(Template.fromString(templateJson), data)
File("hello.pdf").writeBytes(pdfBytes)
```

### Using the CLI

```bash
# Generate a PDF
pdf-generator generate template.json -d data.json -o output.pdf

# Validate a template
pdf-generator validate template.json

# Convert a JasperReports JRXML template to JSON
pdf-generator convert report.jrxml --output template.json
```

### Using the Editor

Try the [Interactive Web Playground](https://adilsoncruz.github.io/open-pdf-generator/playground/) directly in your browser, or download the desktop app [latest release](https://github.com/adilsoncruz/open-pdf-generator/releases):

```bash
cd tools/editor
npm install
npm run dev
```

## 🎯 Template Format

Templates are declarative JSON documents defining page dimensions, margins, headers/footers, and visual elements:

```json
{
  "version": "1.0",
  "metadata": {
    "name": "Invoice Template",
    "description": "Standard business invoice"
  },
  "pageSettings": {
    "size": "A4",
    "orientation": "portrait",
    "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 },
    "header": {
      "height": 30,
      "elements": [
        { "type": "text", "id": "hdr-title", "x": 0, "y": 5, "value": "Acme Corp", "style": { "fontWeight": "bold" } }
      ]
    },
    "footer": {
      "height": 20,
      "elements": [
        { "type": "text", "id": "ftr-page", "x": 0, "y": 5, "dataBinding": "pageNumber | prefix:'Page '" }
      ]
    }
  },
  "page": [
    {
      "type": "text",
      "id": "inv-title",
      "x": 0,
      "y": 10,
      "value": "Invoice #${fatura.numero}",
      "style": { "fontSize": 14, "fontWeight": "bold", "color": "#4f46e5" }
    },
    {
      "type": "table",
      "id": "items-table",
      "x": 0,
      "y": 40,
      "dataBinding": "items",
      "columns": [
        { "header": "Item", "field": "name", "width": 250 },
        { "header": "Qty", "field": "qty", "width": 60, "alignment": "center" },
        { "header": "Total", "field": "amount", "width": 100, "alignment": "right" }
      ]
    }
  ]
}
```

> Coordinate system note: `pageElements` (body) start **below** the top margin + header area.  
> This means body element/container/loop `y` values are relative to the body content area, not the physical top of the page.  
> Example: with `header.height = 100` and `margins.top = 15`, use `y: 0` to start right after the header (do **not** add `115` again).

## ✨ Features

### Core Engine
- 📄 Generate PDFs from declarative JSON templates
- 🔗 Data binding with expressions (`${variable}`) and pipe transformations
- 🔄 Loops and conditional rendering
- 📦 Containers for nested modular layouts with auto-height
- 📝 Rich Text with Markdown formatting (`**bold**`, `*italic*`) and clickable Links
- 📊 Tables with dynamic paging and auto column widths
- 📷 Images (PNG, JPG, SVG, Base64) with caching
- 📏 Barcodes and 2D QR codes
- 📑 Headers, footers, watermarks, and auto-pagination
- 🎨 Complete styling (fonts, colors, borders, margins)
- ⚡ High performance (up to 8,650 docs/sec in containers)

### Template Editor
- 🎨 **Studio Slate Design System**: Modern dark & light modes with high contrast
- 🔄 **JasperReports Importer**: Convert `.jrxml` templates directly into JSON
- 🤖 **AI-Powered PDF Importer**: Generate JSON templates from existing PDFs with AI
- 💻 **Cross-Platform Support**: Installers for macOS (`.dmg`), Windows (`.exe`), and Linux (`.AppImage`, `.deb`)
- 📑 **Multi-Tab Workspace**: Edit and compare multiple templates concurrently
- 🖱️ **Visual Canvas**: Drag-and-drop, rulers, draggable guidelines, and snapping
- 👁️ **Live PDF Preview**: Real-time rendering with hot-reload and page navigation
- 📝 **Schema & Mock Generator**: JSON Schema editor with one-click test data generation
- 🌐 **Multi-Language Support**: English, Portuguese (pt-BR), and Spanish (es)
- 🔒 **100% Offline**: No cloud dependency for local compilation and editing

### CLI
- 🖥️ Generate PDFs directly from the terminal or scripts
- 🔄 Convert JasperReports (`.jrxml`) templates to JSON (`convert`)
- ✅ Validate JSON template structure and required properties (`validate`)
- 🧹 Template and image cache management (`cache clear`, `cache stats`)
- 📦 CI/CD and container-ready automation

## ⚡ Performance Benchmark (vs JasperReports)

Under identical JVM environments, **Open PDF Generator** substantially outperforms **JasperReports 6.21.4** across speed, memory allocation, and cold start:

| Metric / Scenario | Open PDF Generator | JasperReports 6.21.4 | Advantage |
|---|---|---|---|
| **Cold Start (1st Doc Render)** | **273.6 ms** | 1166.0 ms | **4.3x faster** (Ideal for Serverless & Lambda) |
| **Invoice (Single-thread)** | **0.50 ms** (1,874 docs/s) | 2.24 ms (424 docs/s) | **4.4x faster** latency |
| **100,000 Invoices Stress Test** | **12.0 s** (8,310 docs/s) | 29.9 s (3,338 docs/s) | **2.5x faster** total completion |
| **Concurrency (8 Parallel Threads)** | **23,860 docs/s** | 5,300 docs/s | **4.5x higher** parallel throughput |
| **Container Peak RSS (cgroups)** | **75.2 MB** | 128.8 MB | **41.6% less RAM** (Safer from OOMKilled) |
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

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) and our [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) for guidelines.

For security concerns, please refer to our [Security Policy](./SECURITY.md).

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🌟 Star & Sponsor

If Open PDF Generator makes your stack faster or saves cloud infrastructure costs:
- ⭐ **Star this repo** on [GitHub](https://github.com/adilsoncruz/open-pdf-generator) to help more developers find it.
- ☕ **Sponsor development** on [GitHub Sponsors](https://github.com/sponsors/adilsoncruz) to support continuous benchmarks and documentation.

## 📄 License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0) - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenPDF](https://github.com/LibrePDF/OpenPDF) - PDF generation library
- [Electron](https://www.electronjs.org/) - Desktop framework
- [React](https://react.dev/) - UI library
- [VitePress](https://vitepress.dev/) - Documentation framework
