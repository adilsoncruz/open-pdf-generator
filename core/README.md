# PDF Generator Library

[![](https://jitpack.io/v/adilsoncruz/open-pdf-generator.svg)](https://jitpack.io/#adilsoncruz/open-pdf-generator)
[![License: LGPL v3](https://img.shields.io/badge/License-LGPL_v3-blue.svg)](https://www.gnu.org/licenses/lgpl-3.0)
[![Kotlin](https://img.shields.io/badge/Kotlin-1.9.21-blue.svg)](https://kotlinlang.org)
[![JDK](https://img.shields.io/badge/JDK-21-orange.svg)](https://openjdk.org/)

A Kotlin/Java library for PDF generation from JSON templates using OpenPDF.

## 🚀 Why use this library?

### Comparison with JasperReports

| Library | Core JAR | Fat JAR (standalone) | Factor |
|---------|----------|----------------------|--------|
| **PDF Generator** | **258 KB** | **5.1 MB** ✨ | 1x |
| **JasperReports** | ~5.5 MB | ~46 MB+ | **~9x larger** |

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                    Size Comparison                                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  PDF Generator (core):       ▓ 258 KB                                               │
│  JasperReports (core):       ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ~5.5 MB                         │
│                                                    (~20x larger)                    │
│                                                                                     │
│  PDF Generator (standalone): ▓▓▓▓▓ 5.1 MB                                           │
│  JasperReports (full):       ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 46+ MB │
│                                                                       (~9x larger)  │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Advantages

| Metric | PDF Generator | JasperReports |
|--------|---------------|---------------|
| **Core Size** | 258 KB | ~5.5 MB (**~20x larger**) |
| **Fat JAR (standalone)** | 5.1 MB | ~46 MB+ (**~9x larger**) |
| **Template Format** | JSON (simple) | JRXML (complex XML) |
| **Learning Curve** | Low | High |
| **Cold Start** | ⚡ Very fast | 🐢 Slow |
| **Font Cache** | ✅ Yes | Partial |
| **Template Cache** | ✅ Yes (thread-safe) | Manual |
| **Ideal for** | Microservices, Serverless, APIs | Complex corporate reports |

### Build Optimizations

The Fat JAR was optimized from **12 MB to 5.1 MB** (reduction of **57%**):

| Optimization | Savings |
|--------------|---------|
| Removed `kotlin-reflect` (unused) | ~8.3 MB |
| Removed `json-schema-validator` (unused) | ~6 MB |
| Excluded transitive dependencies (Jackson, SnakeYAML) | ~6 MB |
| Excluded CJK fonts from OpenPDF | ~1.8 MB |
| Replaced Logback with slf4j-simple | ~1.4 MB |
| Excluded unnecessary metadata | ~200 KB |

### Performance Optimizations

| Optimization | Impact |
|--------------|--------|
| **Font Cache** | Avoids ~1500 `BaseFont.createFont()` calls per document |
| **Color Cache** | Avoids repetitive hex color parsing |
| **Template Cache** | Templates parsed once (thread-safe) |
| **Image Cache** | Images loaded once |
| **Optimized ByteArray** | Estimated initial size avoids reallocations |

### When to use each?

| Scenario | Recommendation |
|----------|----------------|
| Simple/medium PDFs with JSON | ✅ **PDF Generator** |
| Visual templates (drag-and-drop editor) | ✅ **PDF Generator** |
| Microservices / Serverless / Lambda | ✅ **PDF Generator** (fast cold start) |
| Applications with limited resources | ✅ **PDF Generator** |
| AWS Lambda / GCP Functions | ✅ **PDF Generator** (5.1 MB < limit) |
| Very complex corporate reports | ⚠️ JasperReports |
| Multiple output formats (Excel, Word) | ⚠️ JasperReports |
| Already invested in JRXML templates | ⚠️ JasperReports |

---

## Table of Contents

- [Why use this library?](#-why-use-this-library)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Template Structure](#template-structure)
- [Elements](#elements)
  - [Text](#1-text---text-element)
  - [Image](#2-image---image-element)
  - [Table](#3-table---table-element)
  - [Rectangle](#4-rectangle---rectangle-element)
  - [Line](#5-line---line-element)
  - [Barcode/QR Code](#6-barcode---barcode-qr-code)
  - [Conditional](#7-conditional---conditional-element)
  - [Loop](#8-loop---loop-element)
- [Header and Footer](#header-and-footer)
- [Body Background](#body-background)
- [Data Binding](#data-binding)
- [Transformations (Pipes)](#transformations-pipes)
- [Print Conditions (printCondition)](#print-conditions-printcondition)
- [Element Groups](#element-groups)
- [Main API](#main-api)

---

## Installation

### Via JitPack

Add the JitPack repository to your build:

#### Gradle (Kotlin DSL)

```kotlin
repositories {
    maven { url = uri("https://jitpack.io") }
}

dependencies {
    implementation("com.github.adilsoncruz:open-pdf-generator:1.0.0")
}
```

#### Gradle (Groovy)

```groovy
repositories {
    maven { url 'https://jitpack.io' }
}

dependencies {
    implementation 'com.github.adilsoncruz:open-pdf-generator:1.0.0'
}
```

#### Maven

```xml
<repositories>
    <repository>
        <id>jitpack.io</id>
        <url>https://jitpack.io</url>
    </repository>
</repositories>

<dependencies>
    <dependency>
        <groupId>com.github.adilsoncruz</groupId>
        <artifactId>open-pdf-generator</artifactId>
        <version>1.0.0</version>
    </dependency>
</dependencies>
```

> **Note**: Replace `1.0.0` with the desired version. See all available versions at [JitPack](https://jitpack.io/#adilsoncruz/open-pdf-generator).

---

## Quick Start

### Kotlin

```kotlin
import com.pdfgenerator.PDFGenerator
import com.pdfgenerator.template.Template
import java.io.File

fun main() {
    val template = Template.fromFile(File("templates/invoice.json"))
    
    val data = mapOf(
        "company" to mapOf(
            "name" to "ACME Corp",
            "address" to "123 Business St"
        ),
        "invoice" to mapOf(
            "number" to "INV-001",
            "date" to "2025-11-20",
            "total" to 6000.0
        )
    )
    
    val generator = PDFGenerator()
    generator.generate(template, data, File("output/invoice.pdf"))
}
```

### Java

```java
import com.pdfgenerator.PDFGenerator;
import com.pdfgenerator.template.Template;
import java.io.File;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Template template = Template.fromFile(new File("templates/invoice.json"));
        
        Map<String, Object> data = Map.of(
            "company", Map.of("name", "ACME Corp"),
            "invoice", Map.of("number", "INV-001", "total", 6000.0)
        );
        
        PDFGenerator generator = new PDFGenerator();
        generator.generate(template, data, new File("output/invoice.pdf"));
    }
}
```

---

## Template Structure

A PDF template is defined as a JSON file with the following structure:

```json
{
  "version": "1.0",
  "metadata": {
    "name": "Template Name",
    "description": "Template description",
    "author": "Author",
    "tags": ["tag1", "tag2"]
  },
  "pageSettings": {
    "size": "A4",
    "orientation": "portrait",
    "margins": {
      "top": 30,
      "right": 30,
      "bottom": 30,
      "left": 30
    },
    "header": { ... },
    "footer": { ... },
    "bodyBackground": { ... }
  },
  "elements": [ ... ]
}
```

### Page Sizes (`size`)

| Size | Dimensions (pt) | Dimensions (mm) | Common Use |
|------|-----------------|-----------------|------------|
| `A4` | 595 x 842 | 210 x 297 | Standard documents, reports, invoices (international standard) |
| `A3` | 842 x 1191 | 297 x 420 | Posters, large diagrams, blueprints |
| `A5` | 420 x 595 | 148 x 210 | Brochures, notebooks, invitations |
| `LETTER` | 612 x 792 | 216 x 279 | USA, Canada, Mexico standard |
| `LEGAL` | 612 x 1008 | 216 x 356 | Legal documents (USA) |
| `CUSTOM` | Defined in `customSize` | - | Custom sizes |

**Custom size example:**

```json
{
  "pageSettings": {
    "size": "CUSTOM",
    "customSize": {
      "width": 400,
      "height": 600
    }
    }
}
```

### Page Orientation (`orientation`)

| Value | Description | Recommended Use |
|-------|-------------|-----------------|
| `portrait` | Portrait (vertical) | Text documents, reports, invoices, contracts |
| `landscape` | Landscape (horizontal) | Wide tables, charts, presentations, certificates |

---

## Elements

### 1. Text - Text Element

Renders static or dynamic text with custom formatting.

![Text Element](docs/images/text-element.png)

```json
{
  "type": "text",
  "id": "document-title",
  "x": 50,
  "y": 100,
  "width": 200,
  "height": 30,
  "value": "Static Text",
  "style": {
    "fontSize": 14,
    "fontFamily": "Helvetica",
    "fontWeight": "bold",
    "fontStyle": "normal",
    "color": "#000000",
    "backgroundColor": "#f0f0f0",
    "alignment": "left",
    "verticalAlignment": "center",
    "lineHeight": 1.5,
    "multiline": false,
    "firstLineIndent": 20,
    "paddingTop": 5,
    "paddingRight": 5,
    "paddingBottom": 5,
    "paddingLeft": 5
  },
  "printCondition": "showTitle == true"
}
```

**With Data Binding:**

```json
{
  "type": "text",
  "id": "customer-name",
  "x": 50,
  "y": 150,
  "width": 300,
  "dataBinding": "customer.name | upperCase",
  "style": {
    "fontSize": 12,
    "color": "#333333"
  }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `type` | string | Always `"text"` |
| `id` | string | Unique identifier |
| `x`, `y` | number | Position in points |
| `width`, `height` | number | Dimensions (optional) |
| `value` | string | Static text |
| `dataBinding` | string | Path to dynamic data |
| `printCondition` | string | Condition to render |

**Available Styles:**

| Style | Values | Default |
|-------|--------|---------|
| `fontSize` | number (pt) | 12 |
| `fontFamily` | `Helvetica`, `Times`, `Courier` | Helvetica |
| `fontWeight` | `normal`, `bold` | normal |
| `fontStyle` | `normal`, `italic` | normal |
| `color` | hex (#RRGGBB) | #000000 |
| `alignment` | `left`, `center`, `right`, `justify` | left |
| `verticalAlignment` | `top`, `center`, `bottom` | center |

**Font Family (`fontFamily`):**

| Font | Description | Recommended Use |
|------|-------------|-----------------|
| `Helvetica` | Clean and modern sans-serif | General text, interfaces, corporate documents |
| `Times` | Classic and elegant serif | Formal documents, contracts, long texts |
| `Courier` | Monospaced | Code, aligned numbers, tabular data |

**Font Weight (`fontWeight`):**

| Value | Description |
|-------|-------------|
| `normal` | Regular/normal font weight (400) |
| `bold` | Bold, emphasizes text (700) |

**Font Style (`fontStyle`):**

| Value | Description |
|-------|-------------|
| `normal` | Standard vertical text |
| `italic` | Italic text, slightly slanted |

**Horizontal Alignment (`alignment`):**

| Value | Description | Recommended Use |
|-------|-------------|-----------------|
| `left` | Left-aligned | General text, paragraphs (default) |
| `center` | Centers text | Titles, headers, labels |
| `right` | Right-aligned | Numeric values, dates, totals |
| `justify` | Justified (uniform spacing) | Long texts, formal paragraphs |

**Vertical Alignment (`verticalAlignment`):**

| Value | Description | Recommended Use |
|-------|-------------|-----------------|
| `top` | Aligned to container top | Multiline text |
| `center` | Vertically centered | Labels, short texts (default) |
| `bottom` | Aligned to container bottom | Footers, notes |

---

### 2. Image - Image Element

Renders images from URLs, local files, or base64.

![Image Element](docs/images/image-element.png)

```json
{
  "type": "image",
  "id": "company-logo",
  "x": 50,
  "y": 30,
  "width": 120,
  "height": 60,
  "source": "https://example.com/logo.png",
  "fit": "contain",
  "alignment": "center",
  "printCondition": "showLogo == true"
}
```

**With Data Binding (base64 or dynamic URL):**

```json
{
  "type": "image",
  "id": "product-photo",
  "x": 50,
  "y": 200,
  "width": 150,
  "height": 150,
  "dataBinding": "product.image",
  "fit": "cover"
}
```

| Property | Type | Description |
|----------|------|-------------|
| `source` | string | URL or file path |
| `dataBinding` | string | URL or base64 from data |
| `fit` | string | How to fit the image |
| `alignment` | string | Alignment within container |

**Fit Modes (`fit`):**

| Mode | Description | Behavior |
|------|-------------|----------|
| `contain` | Fits entirely | Resizes maintaining aspect ratio so the entire image fits within the container. May have empty spaces on sides or top/bottom. **Ideal for logos and icons.** |
| `cover` | Fills everything | Resizes maintaining aspect ratio to fill the entire container. Parts of the image may be cropped. **Ideal for backgrounds and photos.** |
| `fill` | Stretches | Stretches the image to exactly fill the container, ignoring proportions. Image may appear distorted. **Use with caution.** |
| `scale-down` | Reduces only | Similar to `contain`, but never enlarges the image beyond its original size. If the image is smaller than the container, maintains original size. **Ideal for preserving quality.** |

**Image Alignment (`alignment`):**

| Value | Description |
|-------|-------------|
| `left` | Aligned to container left |
| `center` | Horizontally centered (default) |
| `right` | Aligned to container right |
| `top` | Aligned to container top |
| `bottom` | Aligned to container bottom |

---

### 3. Table - Table Element

Renders data tables with automatic pagination.

![Table Element](docs/images/table-element.png)

```json
{
  "type": "table",
  "id": "items-table",
  "x": 30,
  "y": 200,
  "width": 535,
  "dataBinding": "order.items",
  "paginated": true,
  "columns": [
    {
      "header": "Code",
      "field": "code",
      "width": 80,
      "alignment": "center"
    },
    {
      "header": "Description",
      "field": "description",
      "width": 250,
      "alignment": "left"
    },
    {
      "header": "Quantity",
      "field": "quantity",
      "width": 70,
      "alignment": "center",
      "format": "number"
    },
    {
      "header": "Unit Price",
      "field": "unitPrice",
      "width": 70,
      "alignment": "right",
      "format": "currency"
    },
    {
      "header": "Total",
      "field": "total",
      "width": 65,
      "alignment": "right",
      "format": "currency"
    }
  ],
  "style": {
    "headerBackground": "#2563eb",
    "headerColor": "#ffffff",
    "headerFontSize": 10,
    "headerFontWeight": "bold",
    "fontSize": 9,
    "cellColor": "#374151",
    "cellBackground": "#ffffff",
    "alternateRowBackground": "#f3f4f6",
    "borderColor": "#d1d5db",
    "borderWidth": 0.5,
    "cellPadding": 6
  },
  "printCondition": "order.items.length > 0"
}
```

| Property | Type | Description |
|----------|------|-------------|
| `dataBinding` | string | Data array |
| `columns` | array | Column definitions |
| `paginated` | boolean | Enables automatic pagination |
| `width` | number/string | Width (can be "100%") |

**Pagination (`paginated`):**

| Value | Behavior |
|-------|----------|
| `true` | Table continues on new pages automatically, repeating the header |
| `false` | Table is cut at page end (not recommended for large tables) |
| `null`/absent | Automatic behavior (default: `true`) |

**Table Style (`style`):**

```json
{
  "style": {
    "headerBackground": "#2563eb",
    "headerColor": "#ffffff",
    "headerFontSize": 10,
    "headerFontFamily": "Helvetica",
    "headerFontWeight": "bold",
    "headerBorderType": "row",
    "headerPaddingTop": 8,
    "headerPaddingBottom": 8,
    
    "fontSize": 9,
    "fontFamily": "Helvetica",
    "cellColor": "#374151",
    "cellBackground": "#ffffff",
    "alternateRowBackground": "#f3f4f6",
    "cellBorderType": "cells",
    
    "borderColor": "#d1d5db",
    "borderWidth": 0.5,
    "cellPadding": 6
  }
}
```

**Header Border Type (`headerBorderType`):**

| Value | Description |
|-------|-------------|
| `row` | Single border around entire header row |
| `columns` | Individual border on each header cell |

**Cell Border Type (`cellBorderType`):**

| Value | Description |
|-------|-------------|
| `row` | Border only on rows (horizontal) |
| `cells` | Border on each cell individually (complete grid) |

**Column Formats (`format`):**

| Format | Description | Input | Output |
|--------|-------------|-------|--------|
| `text` | Simple text, no formatting | `"Product ABC"` | "Product ABC" |
| `number` | Number with thousands separator (pt-BR locale) | `1234.5` | "1,234.5" |
| `currency` | Brazilian currency (R$) with 2 decimals | `1234.56` | "R$ 1,234.56" |
| `date` | Date in Brazilian format | `"2025-11-20"` | "20/11/2025" |
| `datetime` | Date and time in Brazilian format | `"2025-11-20T14:30:00"` | "20/11/2025 14:30" |

**Column Alignment (`alignment`):**

| Value | Description | Recommended Use |
|-------|-------------|-----------------|
| `left` | Left-aligned | Text, descriptions, names |
| `center` | Centered | Codes, quantities, status |
| `right` | Right-aligned | Monetary values, numbers, totals |

**Column Vertical Alignment (`verticalAlignment`):**

| Value | Description |
|-------|-------------|
| `top` | Aligned to cell top |
| `center` | Vertically centered (default) |
| `bottom` | Aligned to cell bottom |

---

### 4. Rectangle - Rectangle Element

Draws rectangles for backgrounds, borders, and decorations.

![Rectangle Element](docs/images/rectangle-element.png)

```json
{
  "type": "rectangle",
  "id": "header-background",
  "x": 0,
  "y": 0,
  "width": 595,
  "height": 100,
  "style": {
    "fillColor": "#2563eb",
    "borderColor": "#1d4ed8",
    "borderWidth": 2,
    "cornerRadius": 0
  }
}
```

**With percentage width:**

```json
{
  "type": "rectangle",
  "id": "sidebar",
  "x": 0,
  "y": 0,
  "width": "100%",
  "height": "100%",
  "style": {
    "fillColor": "#f3f4f6"
  }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `width` | number/string | Width in pt or "100%" |
| `height` | number/string | Height in pt or "100%" |
| `fillColor` | hex | Fill color |
| `borderColor` | hex | Border color |
| `borderWidth` | number | Border thickness |
| `cornerRadius` | number | Corner radius |

**Dimensions (`width`, `height`):**

| Format | Example | Description |
|--------|---------|-------------|
| Absolute number | `200` | Fixed value in points (pt) |
| Percentage | `"100%"` | Percentage of container (header/body/footer) |
| Partial percentage | `"50%"` | Half the container width/height |

**Colors (`fillColor`, `borderColor`):**

| Format | Example | Description |
|--------|---------|-------------|
| Hexadecimal | `"#2563eb"` | RGB color in hex format (6 digits) |
| Transparent | `null` | No fill/border |

**Rounded Corners (`cornerRadius`):**

| Value | Result |
|-------|--------|
| `0` | Square corners (default) |
| `5` | Slightly rounded corners |
| `10` | Moderately rounded corners |
| `20+` | Well-rounded corners (pill shape if width/height are equal) |

---

### 5. Line - Line Element

Draws horizontal, vertical, or diagonal lines.

![Line Element](docs/images/line-element.png)

**Horizontal line:**

```json
{
  "type": "line",
  "id": "section-divider",
  "x": 50,
  "y": 300,
  "width": 545,
  "height": 300,
  "style": {
    "color": "#d1d5db",
    "width": 1
  }
}
```

**Dashed line:**

```json
{
  "type": "line",
  "id": "dashed-line",
  "x": 50,
  "y": 400,
  "width": 545,
  "height": 400,
  "style": {
    "color": "#9ca3af",
    "width": 1,
    "dashPattern": [5, 3]
  }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `x`, `y` | number | Start point |
| `width`, `height` | number | End point |
| `color` | hex | Line color |
| `width` | number | Thickness |
| `dashPattern` | array | Dash pattern [dash, gap] |

**Line Thickness (`width`):**

| Value | Result |
|-------|--------|
| `0.5` | Thin line (hairline) |
| `1` | Normal line (default) |
| `2` | Medium line |
| `3+` | Thick line |

**Dash Pattern (`dashPattern`):**

The `dashPattern` is an array that defines the pattern of dashes and gaps in the line.

| Pattern | Result | Use |
|---------|--------|-----|
| `null` or absent | Solid continuous line | Dividers, borders |
| `[5, 3]` | 5pt dash, 3pt gap | Standard dashed line |
| `[10, 5]` | Long 10pt dash, 5pt gap | Cut lines |
| `[2, 2]` | Short equal dashes | Dotted line |
| `[1, 3]` | Dots with gaps | Dot line |
| `[10, 3, 2, 3]` | Dash-dot | Technical lines |

**Visual examples:**

```
Solid:           ────────────────────
[5, 3]:          ─── ─── ─── ─── ───
[10, 5]:         ────── ────── ──────
[2, 2]:          ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
[1, 3]:          · · · · · · · · · ·
[10, 3, 2, 3]:   ────── ─ ────── ─ ──
```

---

### 6. Barcode - Barcode / QR Code

Generates barcodes and QR Codes dynamically.

![Barcode Element](docs/images/barcode-element.png)

**QR Code:**

```json
{
  "type": "barcode",
  "id": "qrcode-link",
  "x": 50,
  "y": 650,
  "width": 100,
  "height": 100,
  "barcodeType": "qrcode",
  "dataBinding": "order.paymentLink",
  "style": {
    "errorCorrection": "M"
  }
}
```

**Barcode:**

```json
{
  "type": "barcode",
  "id": "barcode",
  "x": 200,
  "y": 700,
  "width": 200,
  "height": 60,
  "barcodeType": "barcode",
  "dataBinding": "order.barcode"
}
```

| Property | Type | Description |
|----------|------|-------------|
| `barcodeType` | string | `"qrcode"` or `"barcode"` |
| `dataBinding` | string | Data to be encoded |
| `errorCorrection` | string | Correction level (L, M, Q, H) |

**Code Type (`barcodeType`):**

| Type | Description | Recommended Use |
|------|-------------|-----------------|
| `qrcode` | 2D QR Code | URLs, complex data, payments (PIX), links |
| `barcode` | 1D Barcode (Code 128) | Products, SKUs, simple identifiers |

**Error Correction Levels - QR Code (`errorCorrection`):**

| Level | Correction | Description | Recommended Use |
|-------|------------|-------------|-----------------|
| `L` | ~7% | Low correction, smaller and denser QR code | Clean environments, digital screens, high-quality printing |
| `M` | ~15% | Medium correction (default) | General use, common printing, documents |
| `Q` | ~25% | High correction | Exposed labels, environments with light dust |
| `H` | ~30% | Maximum correction, larger QR code | Adverse environments, industrial labels, irregular surfaces |

> **Note:** The higher the correction level, the larger the generated QR Code, but more resistant to damage and dirt.

---

### 7. Conditional - Conditional Element

Renders elements only when a condition is true.

```json
{
  "type": "conditional",
  "id": "discount-section",
  "condition": "order.discount > 0",
  "elements": [
    {
      "type": "rectangle",
      "id": "discount-bg",
      "x": 350,
      "y": 500,
      "width": 200,
      "height": 40,
      "style": {
        "fillColor": "#dcfce7",
        "borderColor": "#22c55e",
        "borderWidth": 1
      }
    },
    {
      "type": "text",
      "id": "discount-label",
      "x": 360,
      "y": 510,
      "value": "🎉 Discount applied!",
      "style": {
        "fontSize": 12,
        "color": "#15803d",
        "fontWeight": "bold"
      }
    },
    {
      "type": "text",
      "id": "discount-value",
      "x": 360,
      "y": 525,
      "dataBinding": "order.discount | currency:'BRL'",
      "style": {
        "fontSize": 11,
        "color": "#166534"
      }
    }
  ]
}
```

---

### 8. Loop - Loop Element

Repeats elements for each item in a list.

```json
{
  "type": "loop",
  "id": "installments-list",
  "dataBinding": "payment.installments",
  "startY": 400,
  "itemSpacing": 25,
  "elements": [
    {
      "type": "text",
      "id": "installment-number",
      "x": 50,
      "y": 0,
      "dataBinding": "$index | prefix:'Installment '",
      "style": {
        "fontSize": 10,
        "fontWeight": "bold"
      }
    },
    {
      "type": "text",
      "id": "installment-value",
      "x": 150,
      "y": 0,
      "dataBinding": "$item.value | currency:'BRL'",
      "style": {
        "fontSize": 10
      }
    },
    {
      "type": "text",
      "id": "installment-duedate",
      "x": 300,
      "y": 0,
      "dataBinding": "$item.dueDate | date:'dd/MM/yyyy'",
      "style": {
        "fontSize": 10
      }
    }
  ]
}
```

| Property | Type | Description |
|----------|------|-------------|
| `dataBinding` | string | Array to iterate |
| `startY` | number | Initial Y position |
| `itemSpacing` | number | Space between items |
| `elements` | array | Elements to repeat |

**Special variables in loop:**

| Variable | Description |
|----------|-------------|
| `$item` | Current iteration item |
| `$index` | Current index (0-based) |
| `$item.property` | Access item property |

---

## Header and Footer

Headers and footers are automatically rendered on all pages.

```json
{
  "pageSettings": {
    "size": "A4",
    "orientation": "portrait",
    "margins": {
      "top": 100,
      "right": 30,
      "bottom": 80,
      "left": 30
    },
    "header": {
      "height": 80,
      "printCondition": "showHeader == true",
      "elements": [
        {
          "type": "rectangle",
          "id": "header-bg",
          "x": 0,
          "y": 0,
          "width": "100%",
          "height": "100%",
          "style": {
            "fillColor": "#1e40af"
          }
        },
        {
          "type": "text",
          "id": "header-title",
          "x": 30,
          "y": 30,
          "value": "MONTHLY REPORT",
          "style": {
            "fontSize": 18,
            "fontWeight": "bold",
            "color": "#ffffff"
          }
        },
        {
          "type": "text",
          "id": "header-date",
          "x": 480,
          "y": 30,
          "dataBinding": "report.date | date:'MMMM/yyyy'",
          "style": {
            "fontSize": 12,
            "color": "#ffffff",
            "alignment": "right"
          }
        }
      ]
    },
    "footer": {
      "height": 60,
      "elements": [
        {
          "type": "line",
          "id": "footer-line",
          "x": 30,
          "y": 10,
          "width": 565,
          "height": 10,
          "style": {
            "color": "#d1d5db",
            "width": 1
          }
        },
        {
          "type": "text",
          "id": "footer-company",
          "x": 30,
          "y": 25,
          "dataBinding": "company.name",
          "style": {
            "fontSize": 9,
            "color": "#6b7280"
          }
        },
        {
          "type": "text",
          "id": "footer-page",
          "x": 540,
          "y": 25,
          "value": "Page",
          "style": {
            "fontSize": 9,
            "color": "#6b7280",
            "alignment": "right"
          }
        }
      ]
    }
  }
}
```

---

## Body Background

Elements that appear behind the main content on all pages.

```json
{
  "pageSettings": {
    "bodyBackground": {
      "printCondition": "showWatermark == true",
      "elements": [
        {
          "type": "text",
          "id": "watermark",
          "x": 150,
          "y": 400,
          "value": "CONFIDENTIAL",
          "style": {
            "fontSize": 72,
            "color": "#f3f4f6",
            "fontWeight": "bold"
          }
        },
        {
          "type": "rectangle",
          "id": "page-border",
          "x": 20,
          "y": 20,
          "width": 555,
          "height": 802,
          "style": {
            "borderColor": "#e5e7eb",
            "borderWidth": 1,
            "fillColor": null
          }
        }
      ]
    }
  }
}
```

---

## Data Binding

Data binding allows you to bind dynamic data to elements.

### Basic Syntax

```json
{
  "dataBinding": "path.to.property"
}
```

### Examples

**Data:**

```json
{
  "customer": {
    "name": "John Smith",
    "email": "john@email.com",
    "address": {
      "city": "New York",
      "state": "NY"
    }
  },
  "items": [
    { "name": "Product A", "price": 100.0 },
    { "name": "Product B", "price": 200.0 }
  ]
}
```

| Data Binding | Result |
|--------------|--------|
| `customer.name` | "John Smith" |
| `customer.address.city` | "New York" |
| `items.length` | 2 |
| `items.0.name` | "Product A" |

### Inside Loops

| Data Binding | Description |
|--------------|-------------|
| `$item` | Current item |
| `$item.name` | Item property |
| `$index` | Index (0-based) |

---

## Transformations (Pipes)

Transformations are applied using the pipe `|` syntax.

```json
{
  "dataBinding": "value | transformation:'argument'"
}
```

### Text Transformations

| Transformation | Description | Example | Result |
|----------------|-------------|---------|--------|
| `upperCase` | Uppercase | `name \| upperCase` | "JOHN SMITH" |
| `lowerCase` | Lowercase | `name \| lowerCase` | "john smith" |
| `capitalize` | Capitalizes | `name \| capitalize` | "John Smith" |
| `trim` | Removes whitespace | `text \| trim` | "text" |
| `truncate:N` | Limits characters | `text \| truncate:10` | "text m..." |
| `padLeft:N:'char'` | Pads left | `code \| padLeft:5:'0'` | "00123" |
| `padRight:N:'char'` | Pads right | `text \| padRight:10:'-'` | "text-----" |
| `replace:'old':'new'` | Replaces text | `text \| replace:'-':' '` | "new text" |
| `prefix:'text'` | Adds prefix | `value \| prefix:'$ '` | "$ 100" |
| `suffix:'text'` | Adds suffix | `value \| suffix:' units'` | "100 units" |
| `reverse` | Reverses text | `abc \| reverse` | "cba" |

### Numeric Transformations

| Transformation | Description | Example | Result |
|----------------|-------------|---------|--------|
| `format:'pattern'` | Formats number | `value \| format:'#,##0.00'` | "1,234.56" |
| `currency:'CODE'` | Formats currency | `value \| currency:'BRL'` | "R$ 1,234.56" |
| `numberFormat:'locale'` | Regional format | `value \| numberFormat:'en-US'` | "1,234.56" |

**Supported Currencies (`currency`):**

| Code | Currency | Format | Example |
|------|----------|--------|---------|
| `BRL` | Brazilian Real | R$ 0.000,00 | R$ 1.234,56 |
| `USD` | US Dollar | $0,000.00 | $1,234.56 |
| `EUR` | Euro | €0.000,00 | €1.234,56 |
| `ARS` | Argentine Peso | $ 0.000,00 | $ 1.234,56 |
| `MXN` | Mexican Peso | $0,000.00 | $1,234.56 |

**Number Format Locales (`numberFormat`):**

| Code | Locale | Separators | Example |
|------|--------|------------|---------|
| `pt-BR` | Portuguese (Brazil) | Thousands: `.` Decimal: `,` | 1.234,56 |
| `en-US` | English (USA) | Thousands: `,` Decimal: `.` | 1,234.56 |
| `es-AR` | Spanish (Argentina) | Thousands: `.` Decimal: `,` | 1.234,56 |
| `es-MX` | Spanish (Mexico) | Thousands: `,` Decimal: `.` | 1,234.56 |

**Format Patterns (`format`):**

| Pattern | Description | Example (1234.5) |
|---------|-------------|------------------|
| `#,##0` | Integer with thousands | 1,235 |
| `#,##0.00` | 2 decimals | 1,234.50 |
| `#,##0.000` | 3 decimals | 1,234.500 |
| `0000` | Zero-padding | 1235 |
| `#.##` | No thousands, up to 2 decimals | 1234.5 |
| `abs` | Absolute value | `value \| abs` | 100 |
| `round:N` | Rounds | `value \| round:2` | 123.46 |
| `floor` | Rounds down | `value \| floor` | 123 |
| `ceil` | Rounds up | `value \| ceil` | 124 |

### Date Transformations

| Transformation | Description | Example | Result |
|----------------|-------------|---------|--------|
| `date:'pattern'` | Formats date with pattern | `date \| date:'dd/MM/yyyy'` | "20/11/2025" |

**Date Patterns (for output):**

| Pattern | Description | Example |
|---------|-------------|---------|
| `dd/MM/yyyy` | Brazilian date | 20/11/2025 |
| `MM/dd/yyyy` | American date | 11/20/2025 |
| `yyyy-MM-dd` | ISO date | 2025-11-20 |
| `dd/MM/yy` | Short date | 20/11/25 |
| `d 'of' MMMM 'of' yyyy` | Full date | 20 of November of 2025 |
| `EEEE, dd/MM/yyyy` | With weekday | Thursday, 20/11/2025 |
| `dd MMM yyyy` | Abbreviated date | 20 Nov 2025 |
| `MMMM/yyyy` | Month and year | November/2025 |
| `HH:mm` | Time (24h) | 14:30 |
| `hh:mm a` | Time (12h) | 02:30 PM |
| `dd/MM/yyyy HH:mm` | Date and time | 20/11/2025 14:30 |
| `dd/MM/yyyy HH:mm:ss` | Full date and time | 20/11/2025 14:30:45 |

**Formatting Symbols:**

| Symbol | Description | Example |
|--------|-------------|---------|
| `d` | Day of month (1-31) | 5 |
| `dd` | Day of month (01-31) | 05 |
| `M` | Month (1-12) | 3 |
| `MM` | Month (01-12) | 03 |
| `MMM` | Abbreviated month | Nov |
| `MMMM` | Full month | November |
| `yy` | Year (2 digits) | 25 |
| `yyyy` | Year (4 digits) | 2025 |
| `E` | Weekday abbrev. | Thu |
| `EEEE` | Weekday | Thursday |
| `H` | Hour (0-23) | 9 |
| `HH` | Hour (00-23) | 09 |
| `h` | Hour (1-12) | 2 |
| `hh` | Hour (01-12) | 02 |
| `m` | Minute (0-59) | 5 |
| `mm` | Minute (00-59) | 05 |
| `s` | Second (0-59) | 8 |
| `ss` | Second (00-59) | 08 |
| `a` | AM/PM | PM |

**Accepted input date formats:**

| Format | Example |
|--------|---------|
| `yyyy-MM-dd'T'HH:mm:ss.SSS'Z'` | 2025-11-20T14:30:45.123Z |
| `yyyy-MM-dd'T'HH:mm:ss` | 2025-11-20T14:30:45 |
| `yyyy-MM-dd HH:mm:ss` | 2025-11-20 14:30:45 |
| `yyyy-MM-dd` | 2025-11-20 |
| `dd/MM/yyyy HH:mm:ss` | 20/11/2025 14:30:45 |
| `dd/MM/yyyy` | 20/11/2025 |

### List Transformations

| Transformation | Description | Example | Result |
|----------------|-------------|---------|--------|
| `join:', '` | Joins items | `tags \| join:', '` | "a, b, c" |
| `first` | First item | `items \| first` | {first} |
| `last` | Last item | `items \| last` | {last} |
| `length` | Length | `items \| length` | 5 |

### Other Transformations

| Transformation | Description | Example | Result |
|----------------|-------------|---------|--------|
| `default:'value'` | Default value | `field \| default:'N/A'` | "N/A" (if empty) |
| `template:'...'` | Template string | `obj \| template:'${name} - ${id}'` | "John - 123" |
| `concat:' - ':'text'` | Concatenates | `a \| concat:' - ':b` | "a - b" |

### Chaining Transformations

```json
{
  "dataBinding": "name | upperCase | truncate:20 | suffix:'...'"
}
```

---

## Print Conditions (printCondition)

The `printCondition` property allows controlling whether an element should be rendered.

### Supported Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `==` | Equals | `status == 'active'` |
| `!=` | Not equals | `type != 'cancelled'` |
| `>` | Greater than | `total > 1000` |
| `<` | Less than | `quantity < 10` |
| `>=` | Greater or equal | `age >= 18` |
| `<=` | Less or equal | `stock <= 5` |
| `in` | Contained in list | `status in ['active', 'pending']` |

### Condition Examples

#### Numeric Comparison

```json
{
  "type": "text",
  "id": "low-stock-alert",
  "value": "⚠️ Low stock!",
  "printCondition": "product.stock < 10"
}
```

#### String Comparison

```json
{
  "type": "rectangle",
  "id": "vip-badge",
  "printCondition": "customer.type == 'VIP'"
}
```

#### Array Verification

```json
{
  "type": "table",
  "id": "items-table",
  "printCondition": "order.items.length > 0"
}
```

#### IN Operator

```json
{
  "type": "text",
  "id": "payment-status",
  "printCondition": "payment.status in ['approved', 'confirmed']"
}
```

#### Simple Boolean

```json
{
  "type": "image",
  "id": "logo",
  "printCondition": "showLogo"
}
```

```json
{
  "type": "text",
  "id": "confidential-text",
  "printCondition": "document.confidential == true"
}
```

#### Accessing Nested Properties

```json
{
  "type": "text",
  "id": "special-discount",
  "printCondition": "customer.plan.level >= 3"
}
```

#### Accessing Array Index

```json
{
  "type": "text",
  "id": "first-item",
  "printCondition": "items.0.quantity > 0"
}
```

### Supported Literal Values

| Type | Examples |
|------|----------|
| String | `'text'`, `"text"` |
| Number | `100`, `3.14`, `-50` |
| Boolean | `true`, `false` |
| Null | `null` |
| List | `['a', 'b', 'c']`, `[1, 2, 3]` |

### Special Behavior

- **Empty or null condition:** Element always rendered
- **Evaluation error:** Element rendered (fail-safe)
- **String comparison:** Case-insensitive
- **Numbers:** Automatic numeric comparison

---

## Element Groups

Groups allow applying conditions to multiple elements at once.

```json
{
  "pageSettings": {
    "header": {
      "height": 100,
      "groups": [
        {
          "id": "logo-group",
          "name": "Logo and Title",
          "elementIds": ["logo", "title", "subtitle"],
          "printCondition": "showHeader == true"
        },
        {
          "id": "contact-group",
          "name": "Contact Information",
          "elementIds": ["phone", "email", "website"],
          "printCondition": "customer.type == 'VIP'"
        }
      ],
      "elements": [
        { "type": "image", "id": "logo", ... },
        { "type": "text", "id": "title", ... },
        { "type": "text", "id": "subtitle", ... },
        { "type": "text", "id": "phone", ... },
        { "type": "text", "id": "email", ... },
        { "type": "text", "id": "website", ... }
      ]
    }
  }
}
```

---

## Main API

### PDFGenerator

```kotlin
class PDFGenerator {
    // Generates PDF and saves to file
    fun generate(template: Template, data: Map<String, Any?>, outputFile: File)
    
    // Generates PDF and returns bytes
    fun generate(template: Template, data: Map<String, Any?>): ByteArray
    
    // Generates PDF to an OutputStream
    fun generateToStream(template: Template, data: Map<String, Any?>, output: OutputStream)
}
```

### Template

```kotlin
class Template {
    companion object {
        fun fromFile(file: File): Template
        fun fromString(json: String): Template
        fun fromInputStream(input: InputStream): Template
    }
    
    fun validate(): ValidationResult
    fun toJson(): String
}
```

### TemplateBuilder

```kotlin
val template = TemplateBuilder()
    .version("1.0")
    .pageSize(PageSize.A4)
    .orientation(Orientation.PORTRAIT)
    .margins(top = 30f, right = 30f, bottom = 30f, left = 30f)
    .addText {
        id = "title"
        x = 50f
        y = 50f
        dataBinding = "document.title"
        fontSize = 24f
        fontWeight = FontWeight.BOLD
    }
    .addTable {
        id = "items"
        x = 50f
        y = 150f
        dataBinding = "document.items"
        column("Name", "name", width = 200f)
        column("Value", "value", width = 100f, format = Format.CURRENCY)
    }
    .addBarcode {
        id = "qr"
        x = 50f
        y = 400f
        width = 100f
        height = 100f
        barcodeType = "qrcode"
        dataBinding = "document.link"
    }
    .build()
```

---

## Requirements

- JDK 21+
- Kotlin 1.9+ (optional, compatible with pure Java)

## Contributing

Contributions are welcome! Please:

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/MyFeature`)
3. Commit your changes (`git commit -m 'Add MyFeature'`)
4. Push to the branch (`git push origin feature/MyFeature`)
5. Open a Pull Request

## License

This project is licensed under the GNU Lesser General Public License v3.0 (LGPLv3).

**What this means:**
- ✅ You can use this library in commercial projects
- ✅ You can modify the library
- ✅ If you **only use** the library (linking), your code can have any license
- ⚠️ If you **modify** the library, you must share the modifications under LGPLv3

See the [LICENSE](LICENSE) file for more details.

## Authors

- **Adi Cruz** - [GitHub](https://github.com/adilsoncruz)

## Links

- [JitPack](https://jitpack.io/#adilsoncruz/open-pdf-generator)
- [Full Documentation](https://github.com/adilsoncruz/open-pdf-generator/blob/main/README.md)
- [Issues](https://github.com/adilsoncruz/open-pdf-generator/issues)
- [Pull Requests](https://github.com/adilsoncruz/open-pdf-generator/pulls)
