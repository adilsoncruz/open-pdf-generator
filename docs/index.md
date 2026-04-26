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
      text: View on GitHub
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
    details: Desktop application for creating PDF templates visually with drag-and-drop, real-time preview, and data binding.
    link: /editor/index.html
    linkText: Explore Editor

  - icon:
      src: /icons/terminal.svg
    title: Command Line Interface
    details: Generate PDFs from the command line for automation, CI/CD pipelines, and scripting workflows.
    link: /cli/
    linkText: Learn CLI

  - icon:
      src: /icons/code.svg
    title: Data Binding
    details: Use mustache syntax to bind template elements to dynamic data from JSON with loops and conditionals.

  - icon:
      src: /icons/grid.svg
    title: Rich Elements
    details: Text, images, tables, rectangles, lines, barcodes, lists, check lists, and more with customizable properties.

  - icon:
      src: /icons/plug.svg
    title: Easy Integration
    details: Simple API for Java, Kotlin, Spring Boot, and any JVM application. Available on JitPack.
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
| [Engine Documentation](/lib/) | Learn how to use the PDF Generator library |
| [Editor Documentation](/editor/index.html) | Create templates visually with the desktop app |
| [Examples](/lib/examples/) | Real-world template examples |

</div>
