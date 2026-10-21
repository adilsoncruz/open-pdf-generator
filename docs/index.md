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

<div class="benchmark-card">
  <div class="benchmark-header">
    <div class="benchmark-badge-row">
      <span class="benchmark-pill">⚡ Benchmark Case Study</span>
      <span style="font-size: 12px; color: var(--vp-c-text-3);">Tested on Linux Container Cgroups (2 vCPU, 1 GB RAM)</span>
    </div>
    <h3>Engineered for High-Density Microservices & Cloud Run</h3>
    <p class="benchmark-subtitle">
      Stress test generating <strong>100,000 unique dynamic invoices</strong> against JasperReports 6.21.4 with zero template caching.
    </p>
  </div>

  <div class="benchmark-grid">
    <div class="benchmark-stat-item">
      <span class="benchmark-stat-label">Throughput</span>
      <div class="benchmark-stat-val">
        8,310 <span class="unit">docs/s</span>
      </div>
      <span class="benchmark-stat-delta">▲ 2.5x faster</span>
      <span class="benchmark-stat-desc">Jasper achieved 3,338 docs/s under identical quotas</span>
    </div>

    <div class="benchmark-stat-item">
      <span class="benchmark-stat-label">Cold Start</span>
      <div class="benchmark-stat-val">
        273 <span class="unit">ms</span>
      </div>
      <span class="benchmark-stat-delta">▲ 4.3x faster</span>
      <span class="benchmark-stat-desc">Jasper takes 1,166 ms to compile and render doc #1</span>
    </div>

    <div class="benchmark-stat-item">
      <span class="benchmark-stat-label">Peak RSS RAM</span>
      <div class="benchmark-stat-val">
        128 <span class="unit">MB</span>
      </div>
      <span class="benchmark-stat-delta">▲ 22% lower</span>
      <span class="benchmark-stat-desc">Zero GC stalls; Jasper required 165 MB with pauses</span>
    </div>

    <div class="benchmark-stat-item">
      <span class="benchmark-stat-label">Footprint</span>
      <div class="benchmark-stat-val">
        4.0 <span class="unit">MB</span>
      </div>
      <span class="benchmark-stat-delta">▲ 3.4x smaller</span>
      <span class="benchmark-stat-desc">No heavy compilation deps (Jasper: 13.6 MB JAR tree)</span>
    </div>
  </div>

  <div class="benchmark-footer">
    <span style="font-size: 13px; color: var(--vp-c-text-2);">
      Looking to cut cloud infrastructure costs or replace legacy Jasper?
    </span>
    <a href="./lib/benchmark">
      <span>Read Full Technical Benchmark & FinOps Analysis →</span>
    </a>
  </div>
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

