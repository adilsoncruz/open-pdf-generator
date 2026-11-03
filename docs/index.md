---
layout: home

hero:
  name: Open PDF Generator
  text: Generate PDFs from JSON Templates
  tagline: A powerful open-source toolkit for creating dynamic PDFs with Kotlin/Java
  image:
    src: /icon.png
    alt: Open PDF Generator
  actions:
    - theme: brand
      text: Get Started
      link: /lib/guide/getting-started
    - theme: alt
      text: ⚡ 2.5x vs Jasper Benchmark
      link: /lib/benchmark
    - theme: alt
      text: 🚀 Go & Node Guide
      link: /cli/examples
    - theme: alt
      text: GitHub
      link: https://github.com/adilsoncruz/open-pdf-generator

features:
  - icon:
      src: /icons/library.svg
    title: PDF Generator Library
    details: High-performance Kotlin/Java library for generating PDFs from JSON templates with data binding and dynamic content.
    link: /lib/
    linkText: Explore Library

  - icon:
      src: /icons/editor.svg
    title: Visual Template Editor
    details: Desktop application with the Studio Slate design system, multi-tabs, drag-and-drop canvas, and real-time PDF preview.
    link: /editor/index.html
    linkText: Explore Editor

  - icon:
      src: /icons/terminal.svg
    title: Polyglot CLI (Zero Java Required)
    details: Standalone GraalVM native binary for Linux, macOS and Windows. Seamlessly integrate with Go, Node.js, Python, or Docker at sub-millisecond speeds.
    link: /cli/examples
    linkText: Go & Node Guide

  - icon:
      src: /icons/speed.svg
    title: 2.5x Faster vs JasperReports
    details: 8,650 docs/sec in containers, 195ms cold-start (4.3x faster), and 4.0MB footprint. Zero GC lockups under 100k document stress.
    link: /lib/benchmark
    linkText: View Benchmark Report

  - icon:
      src: /icons/code.svg
    title: Data Binding & Conditions
    details: Use mustache syntax and pipes to format data, plus boolean conditions to dynamically show or hide elements and groups.

  - icon:
      src: /icons/grid.svg
    title: Rich Elements & Layouts
    details: Containers, tables, text, loops, page breaks, shapes, barcodes, watermarks, and summary pages with full styling.
---

## Quick Example

Create a simple invoice PDF with just a few lines of code:

::: code-group

```kotlin [Kotlin]
val template = """
{
  "page": { "format": "A4" },
  "body": {
    "elements": [
      { "type": "text", "x": 10, "y": 10, "text": "Invoice #{{invoiceNumber}}" },
      { "type": "text", "x": 10, "y": 25, "text": "Customer: {{customer.name}}" }
    ]
  }
}
"""

val data = mapOf(
  "invoiceNumber" to "INV-001",
  "customer" to mapOf("name" to "John Doe")
)

val pdf = PDFGenerator().generate(template, data)
File("invoice.pdf").writeBytes(pdf)
```

```java [Java]
String template = """
{
  "page": { "format": "A4" },
  "body": {
    "elements": [
      { "type": "text", "x": 10, "y": 10, "text": "Invoice #{{invoiceNumber}}" },
      { "type": "text", "x": 10, "y": 25, "text": "Customer: {{customer.name}}" }
    ]
  }
}
""";

Map<String, Object> data = Map.of(
  "invoiceNumber", "INV-001",
  "customer", Map.of("name", "John Doe")
);

byte[] pdf = new PDFGenerator().generate(template, data);
Files.write(Path.of("invoice.pdf"), pdf);
```

```go [Go (Native Serve)]
// No Java needed! Uses standalone binary with ~0.60ms latency (9.6x faster than Maroto)
package main

import (
    "os/exec"
    "log"
)

func main() {
    cmd := exec.Command("pdf-generator", "generate", "invoice.json", "-d", "data.json", "-o", "invoice.pdf")
    if err := cmd.Run(); err != nil {
        log.Fatal(err)
    }
}
```

```javascript [Node.js (Native Serve)]
// No Java needed! Uses standalone binary with ~0.57ms latency (12.2x faster than pdfmake)
import { execFileSync } from 'node:child_process';

execFileSync('pdf-generator', [
  'generate', 'invoice.json',
  '-d', 'data.json',
  '-o', 'invoice.pdf'
]);
```

:::

## Performance Across Ecosystems

Compare Open PDF Generator against the standard reporting and PDF tools across **Java**, **Go**, and **Node.js**:

<UnifiedBenchmarkChart />

## Installation

Add to your project with Gradle, Maven, or download the standalone native binary directly:

::: code-group

```bash [Native CLI (Go / Node / Python)]
# Linux (amd64) — No Java required
curl -sSL -o /usr/local/bin/pdf-generator https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-linux-amd64 && chmod +x /usr/local/bin/pdf-generator

# macOS (Apple Silicon arm64) — No Java required
curl -sSL -o /usr/local/bin/pdf-generator https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-darwin-arm64 && chmod +x /usr/local/bin/pdf-generator

# Docker (Single command execution)
docker run --rm -v $(pwd):/work -w /work open-pdf-generator:native generate template.json -d data.json -o out.pdf
```

```kotlin [Gradle (Kotlin)]
repositories {
    maven { url = uri("https://jitpack.io") }
}

dependencies {
    implementation("io.github.adilsoncruz:open-pdf-generator:1.0.0")
}
```

```groovy [Gradle (Groovy)]
repositories {
    maven { url 'https://jitpack.io' }
}

dependencies {
    implementation 'io.github.adilsoncruz:open-pdf-generator:1.0.0'
}
```

```xml [Maven]
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

:::

## What's Next?

<div class="vp-doc">

| Path | Description |
|------|-------------|
| [⚡ Benchmark (vs JasperReports)](/lib/benchmark) | 100k invoices stress test, latency, throughput, memory & FinOps savings |
| [⚡ Benchmark (vs Go & Node.js)](/lib/benchmark-multilang) | Sub-millisecond latency vs Maroto (Go) and pdfmake (Node.js) |
| [Polyglot Guide (Go, Node, Python)](/cli/examples) | Ready-to-use client code for non-JVM environments |
| [Engine Documentation](/lib/) | Learn how to use the PDF Generator library |
| [Editor Documentation](/editor/index.html) | Create templates visually with the desktop app |
| [Examples](/lib/examples/) | Real-world template examples |

</div>

## Support & Sponsor

Open PDF Generator is completely free and open source. If this project helps you or your team build better documents, consider sponsoring continuous development:

<div style="margin: 20px 0; display: flex; gap: 12px; flex-wrap: wrap;">
  <a 
    href="https://github.com/sponsors/adilsoncruz" 
    target="_blank"
    rel="noopener noreferrer"
    style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: linear-gradient(135deg, #ec4899, #db2777); color: white; border-radius: 10px; font-weight: 600; text-decoration: none; box-shadow: 0 4px 14px rgba(219, 39, 119, 0.35);"
  >
    💖 Sponsor on GitHub
  </a>
  <a 
    href="https://buymeacoffee.com/adilsoncruz" 
    target="_blank"
    rel="noopener noreferrer"
    style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: linear-gradient(135deg, #FFDD00, #FBBF24); color: #000000; border-radius: 10px; font-weight: 600; text-decoration: none; box-shadow: 0 4px 14px rgba(251, 191, 36, 0.35);"
  >
    ☕ Buy Me a Coffee
  </a>
</div>

