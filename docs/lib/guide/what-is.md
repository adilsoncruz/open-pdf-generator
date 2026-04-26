# What is it?

**PDF Generator Library** is a Kotlin/Java library for generating PDF documents from JSON templates.

## Overview

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  JSON Template  │  +   │    JSON Data    │  →   │  Generated PDF  │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

You define the visual structure in a JSON file (template) and provide dynamic data. The library combines both and generates the final PDF.

---

## Why use it?

### 🚀 Ultra Lightweight

- **5.1 MB** Fat JAR (standalone)
- **Fast cold start** (~500ms)
- Ideal for **serverless** and **microservices**

### ⚡ High Performance

- Fast PDF generation
- Image and font caching
- Optimized for high volumes

### 📄 Declarative Templates

- Define layouts in simple **JSON**
- No Java/Kotlin code for layout
- Easy to maintain and version

### 🔗 Powerful Data Binding

- Bind data dynamically
- **30+ transformations** (pipes)
- Conditional rendering

### 🎨 Visual Editor

- **PDF Template Editor** (desktop app)
- Create templates visually
- Direct export to JSON

---

## Comparison

| Aspect | PDF Generator | JasperReports | iText |
|--------|---------------|---------------|-------|
| **Size** | 5.1 MB | 50+ MB | 10+ MB |
| **Templates** | JSON | JRXML/XML | Code |
| **Learning Curve** | Low | High | Medium |
| **Visual Editor** | ✅ Yes | ✅ Yes | ❌ No |
| **License** | LGPLv3 | LGPLv3 | AGPL/Commercial |
| **Cold Start** | ~500ms | ~3-5s | ~1s |

---

## Supported Elements

| Element | Description |
|---------|-------------|
| **Text** | Static or dynamic text with styles |
| **Image** | Images from URL, file, or base64 |
| **Table** | Tables with automatic pagination |
| **Rectangle** | Rectangles for backgrounds and borders |
| **Line** | Horizontal, vertical, or diagonal lines |
| **Barcode** | QR Codes and barcodes |
| **List** | Bulleted and numbered lists from arrays |
| **Check List** | Checkbox lists from object/map values |
| **Conditional** | Conditional rendering |
| **Loop** | Element repetition |

---

## Features

### Data Binding

```json
{
  "dataBinding": "customer.name | upperCase"
}
```

Bind fields from your data and apply transformations.

### Transformations (Pipes)

```json
{
  "dataBinding": "price | currency:'USD'"
}
```

30+ transformations: formatting, dates, numbers, text.

### Conditions

```json
{
  "printCondition": "total > 1000"
}
```

Render elements conditionally.

### Fixed Headers and Footers

```json
{
  "fixedHeader": {
    "height": 100,
    "elements": [...]
  }
}
```

Headers and footers that repeat on all pages.

### Automatic Pagination

Tables automatically break between pages with repeated headers.

---

## Architecture

```
┌────────────────────────────────────────────────┐
│              Your Application                  │
└────────────────────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────┐
│            PDF Generator Library               │
│  ┌──────────────────────────────────────────┐  │
│  │         Template Parser (JSON)           │  │
│  └──────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────┐  │
│  │     Data Binding & Transformations       │  │
│  └──────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────┐  │
│  │          Element Renderers               │  │
│  └──────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────┐  │
│  │            OpenPDF (LibrePDF)            │  │
│  └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────┐
│                   PDF File                     │
└────────────────────────────────────────────────┘
```

---

## Use Cases

### Electronic Invoice

- Headers/footers with company data
- Product table with pagination
- QR Code for validation
- Dynamic order data

### Reports

- Charts and tables
- Section headers
- Totals
- Conditional filters

### Certificates

- Rich visual layout
- Participant data
- Validation QR Code
- Digital signature

### Contracts

- Justified multiline text
- Signature fields
- Party data
- Page numbering

---

## Requirements

- **Java 11+** or **Kotlin 1.8+**
- **Gradle** or **Maven**

---

## License

**LGPLv3** (GNU Lesser General Public License v3.0)

- ✅ Commercial use allowed
- ✅ Modifications allowed
- ✅ Distribution allowed
- ⚠️ Library modifications must be open source

---

## Next Steps

- [Installation](/lib/guide/installation) - Add to your project
- [First Steps](/lib/guide/first-steps) - Create your first PDF
- [Templates](/lib/guide/templates) - Understand the structure

