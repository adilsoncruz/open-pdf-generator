# PDF Generator Engine

The PDF Generator Engine is a high-performance Kotlin/Java library for generating PDFs from JSON templates.

## Features

- **JSON Templates** - Define your PDF layout in JSON
- **Data Binding** - Use mustache syntax to bind dynamic data
- **Rich Elements** - Text, images, tables, barcodes, and more
- **Multipage** - Automatic pagination with headers and footers
- **High Performance** - Optimized for speed and memory efficiency

## Quick Example

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
```

## Getting Started

1. [Installation](./guide/installation.md) - Add the library to your project
2. [First Steps](./guide/first-steps.md) - Create your first PDF
3. [Templates](./guide/templates.md) - Learn the template format
4. [Data Binding](./guide/data-binding.md) - Connect data to your templates

## Installation

### Gradle (Kotlin DSL)

```kotlin
repositories {
    maven { url = uri("https://jitpack.io") }
}

dependencies {
    implementation("io.github.adilsoncruz:open-pdf-generator:1.0.0")
}
```

### Maven

```xml
<repositories>
    <repository>
        <id>jitpack.io</id>
        <url>https://jitpack.io</url>
    </repository>
</repositories>

<dependency>
    <groupId>io.github.adilsoncruz</groupId>
    <artifactId>open-pdf-generator</artifactId>
    <version>1.0.0</version>
</dependency>
```

## Supported Elements

| Element | Description |
|---------|-------------|
| [Text](./guide/elements/text.md) | Static or dynamic text with formatting |
| [Image](./guide/elements/image.md) | Raster (PNG, JPG) or vector (SVG) images |
| [Table](./guide/elements/table.md) | Data tables with headers and dynamic rows |
| [Rectangle](./guide/elements/rectangle.md) | Shapes with borders and fill colors |
| [Line](./guide/elements/line.md) | Horizontal, vertical, or diagonal lines |
| [Barcode](./guide/elements/barcode.md) | QR codes and various barcode formats |
| [Loop](./guide/elements/loop.md) | Repeat elements for each item in an array |
| [Conditional](./guide/elements/conditional.md) | Show/hide elements based on conditions |
