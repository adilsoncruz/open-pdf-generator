# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-12

### ✨ Added

#### Main Features
- 🎨 PDF generation from JSON templates
- 📝 Element support: Text, Image, Table, Rectangle, Line, Barcode/QR Code
- 🔄 Conditional elements and loops
- 📊 Tables with automatic pagination
- 🎯 Fixed Header and Footer on all pages
- 🎨 Customizable Body Background
- 🔗 Dynamic data binding with nested property support
- 🔀 Transformations (pipes): upperCase, lowerCase, currency, date, etc.
- ✅ Print conditions (printCondition)
- 👥 Element groups

#### Optimizations
- ⚡ Font cache (avoids ~1500 calls per document)
- ⚡ Hex color cache
- ⚡ Template cache (thread-safe)
- ⚡ Image cache
- 📦 Optimized fat JAR: 5.1 MB (57% reduction)

#### Supported Elements
- **Text**: Static or dynamic text with full formatting
- **Image**: URLs, local files, or base64
- **Table**: Paginated tables with multiple formats (text, number, currency, date)
- **Rectangle**: Backgrounds and decorations with rounded corners
- **Line**: Solid or dashed lines
- **Barcode**: QR Code and Code 128
- **Conditional**: Conditional element rendering
- **Loop**: Element repetition for lists

#### API
- `PDFGenerator`: Main class for generation
- `Template`: JSON template parser and validator
- `TemplateBuilder`: Fluent builder for programmatic creation

#### Supported Formats
- **Currencies**: BRL, USD, EUR, ARS, MXN
- **Dates**: Multiple Brazilian and international formats
- **Numbers**: Brazilian and international formats

### 🔧 Configuration
- JDK 21 support
- JitPack publishing
- LGPLv3 License
- Complete Markdown documentation

### 📚 Documentation
- README.md with examples and complete reference
- PUBLISHING.md with publishing guide
- BUGFIX_TEXT_RENDERING.md with bug fixes
- FEATURE_TABLE_WIDTH.md with automatic width feature

### 📊 Comparisons
- ~20x smaller than JasperReports Core
- ~9x smaller than JasperReports Fat JAR
- Much faster cold start
- Ideal for microservices and serverless

---

## [Unreleased]

### Planned for Future Versions

#### v1.1.0
- [ ] Custom font support (TTF/OTF)
- [ ] Chart element (graphs)
- [ ] SVG support
- [ ] Nested templates (includes)
- [ ] Customizable pagination

#### v1.2.0
- [ ] Digital PDF signing
- [ ] PDF encryption
- [ ] Interactive forms
- [ ] Annotations and comments

#### v2.0.0 (Breaking Changes)
- [ ] Kotlin DSL for templates
- [ ] Multiple backend support (iText, PDFBox)
- [ ] Asynchronous generation
- [ ] Large PDF streaming

---

## Types of Changes

- `Added` for new features
- `Changed` for changes to existing features
- `Deprecated` for features to be removed
- `Removed` for removed features
- `Fixed` for bug fixes
- `Security` for vulnerabilities

---

[1.0.0]: https://github.com/adilsoncruz/open-pdf-generator/releases/tag/v1.0.0
[Unreleased]: https://github.com/adilsoncruz/open-pdf-generator/compare/v1.0.0...HEAD
