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
    title: Command Line Interface
    details: Generate PDFs from the command line for automation, CI/CD pipelines, and scripting workflows.
    link: /cli/
    linkText: Learn CLI

  - icon:
      src: /icons/speed.svg
    title: 2.5x Faster vs JasperReports
    details: 8,310 docs/sec in containers, 273ms cold-start (4.3x faster), and 4.0MB footprint. Zero GC lockups under 100k document stress.
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

## ⚡ Enterprise Performance at Scale

Tested in Linux container cgroups (2 vCPU, 1 GB RAM) generating **100,000 unique invoices** with dynamic data against JasperReports 6.21.4:

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px; margin: 24px 0 24px 0;">
  <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.28); border-radius: 12px; padding: 18px; text-align: center;">
    <div style="font-size: 2.3rem; font-weight: 800; color: #818cf8; line-height: 1.1;">8,310</div>
    <div style="font-size: 0.95rem; font-weight: 600; margin-top: 6px; color: var(--vp-c-text-1);">Docs / Second</div>
    <div style="font-size: 0.8rem; color: var(--vp-c-text-2); margin-top: 4px;">2.5x higher throughput vs Jasper (3,338 docs/s)</div>
  </div>
  <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.28); border-radius: 12px; padding: 18px; text-align: center;">
    <div style="font-size: 2.3rem; font-weight: 800; color: #34d399; line-height: 1.1;">273 ms</div>
    <div style="font-size: 0.95rem; font-weight: 600; margin-top: 6px; color: var(--vp-c-text-1);">Cold Start</div>
    <div style="font-size: 0.8rem; color: var(--vp-c-text-2); margin-top: 4px;">4.3x faster first doc (Jasper: 1,166 ms)</div>
  </div>
  <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.28); border-radius: 12px; padding: 18px; text-align: center;">
    <div style="font-size: 2.3rem; font-weight: 800; color: #fbbf24; line-height: 1.1;">128 MB</div>
    <div style="font-size: 0.95rem; font-weight: 600; margin-top: 6px; color: var(--vp-c-text-1);">Peak Container RSS</div>
    <div style="font-size: 0.8rem; color: var(--vp-c-text-2); margin-top: 4px;">Stable memory, zero GC stalls</div>
  </div>
  <div style="background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.28); border-radius: 12px; padding: 18px; text-align: center;">
    <div style="font-size: 2.3rem; font-weight: 800; color: #c084fc; line-height: 1.1;">4.0 MB</div>
    <div style="font-size: 0.95rem; font-weight: 600; margin-top: 6px; color: var(--vp-c-text-1);">Library Footprint</div>
    <div style="font-size: 0.8rem; color: var(--vp-c-text-2); margin-top: 4px;">3.4x lighter than Jasper (13.6 MB)</div>
  </div>
</div>

<div style="text-align: center; margin-bottom: 36px;">
  <a href="./lib/benchmark" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 22px; background: rgba(99, 102, 241, 0.14); border: 1px solid rgba(99, 102, 241, 0.35); border-radius: 8px; color: #818cf8; font-weight: 600; text-decoration: none;">
    <span>📊 Explore Full 100,000 Documents Benchmark Case Study & FinOps Analysis →</span>
  </a>
</div>

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

:::

## Installation

Add to your project with Gradle or Maven:

::: code-group

```kotlin [Gradle (Kotlin)]
repositories {
    maven { url = uri("https://jitpack.io") }
}

dependencies {
    implementation("com.github.adilsoncruz:open-pdf-generator:1.0.0")
}
```

```groovy [Gradle (Groovy)]
repositories {
    maven { url 'https://jitpack.io' }
}

dependencies {
    implementation 'com.github.adilsoncruz:open-pdf-generator:1.0.0'
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
    <groupId>com.github.adilsoncruz</groupId>
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

