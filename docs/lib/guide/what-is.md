# What is Open PDF Generator?

**Open PDF Generator** is a modern, high-throughput Kotlin/Java engine for rendering enterprise-grade PDF documents from declarative JSON templates.

Designed as a cloud-native replacement for legacy reporting engines like JasperReports, it combines a lightweight runtime, millisecond cold starts, streaming byte pipelines, and a desktop visual designer.

## Overview

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────────────┐
│  JSON Template  │  +   │    JSON Data    │  →   │  High-Speed PDF Engine  │  →  PDF File / Stream
└─────────────────┘      └─────────────────┘      └─────────────────────────┘
```

You define document structure, geometry, and styling in a clean JSON format and inject dynamic data at runtime. The engine evaluates expressions, binds fields, handles dynamic pagination, and streams vector PDFs with minimal memory overhead.

---

## Why Open PDF Generator?

### 🚀 Ultra-Lightweight & Cloud Native
- **4.0 MB total dependency footprint** (3.4x lighter than JasperReports).
- **195 ms cold start** on standard JVM containers — instant execution on AWS Lambda, Google Cloud Run, and Kubernetes.
- Zero external runtime compiler or heavy dynamic bytecode generation dependencies.

### ⚡ Extreme Throughput (8,650 docs/sec)
- Fully non-blocking, multi-core scalable generation pipeline.
- Generates **100,000 invoices in ~12 seconds** inside a 2-vCPU / 1 GB RAM container.
- Zero-copy streaming (`generateToStream`) direct to network sockets and HTTP response bodies.

### 📄 Declarative JSON Templates
- No XML compilation cycles or proprietary binary `.jasper` artifacts.
- Templates are pure JSON: easily version-controlled in Git, generated dynamically, or stored in databases.
- Native JSON Schema (Draft-07) validation built-in.

### 🔗 Powerful Data Binding & Expressions
- Mustache interpolation (<code v-pre>{{customer.name}}</code>) and data-binding paths.
- **30+ transformation pipes** (currencies, dates, numbers, string operations).
- Boolean conditional rendering (`printCondition`) and iteration loops (`loop`).

### 🎨 Visual Desktop Studio
- **Open PDF Studio** built on the Studio Slate design system.
- Drag-and-drop canvas, multi-tab editing, real-time live preview, and direct JSON export.

---

## Head-to-Head Comparison: Open PDF Generator vs JasperReports

| Metric / Feature | Open PDF Generator | JasperReports 6.21.4 | JasperReports 7.0.3 | Open PDF Advantage |
|:---|:---:|:---:|:---:|:---:|
| **Throughput (2 vCPU container)** | **8,650 docs/sec** | 3,338 docs/sec | 3,539 docs/sec | **2.4x - 2.6x faster** |
| **Cold Start (1st doc latency)** | **195 ms** | 1,166 ms | 742 ms | **3.8x - 4.3x faster** |
| **Container RSS Memory (100k docs)** | **128 MB** *(Zero GC stalls)* | 164 MB *(Heavy GC pauses)* | 171 MB *(High baseline)* | **25% lower memory** |
| **Runtime Dependency Footprint** | **4.0 MB** | 13.6 MB+ (up to 50MB) | 25.2 MB (modular + JDT) | **6.3x lighter** |
| **Template Format** | Declarative **JSON** | Complex **JRXML / XML** | Stricter **Jackson XML** | Git-friendly, no compilation |
| **Visual Designer** | ✅ Open PDF Studio | ✅ Jaspersoft Studio | ✅ Jaspersoft Studio | Modern Electron/React UI |
| **Streaming API** | ✅ Direct `OutputStream` | ⚠️ In-memory buffer required | ⚠️ In-memory buffer required | Zero-copy byte stream |
| **License** | **AGPL-3.0** *(Free, Copyleft)* | LGPL-3.0 / Commercial | LGPL-3.0 / Commercial | Copyleft protection |

> 📊 **Explore Full Evidence:** See JMH benchmarks, cgroup container stress results, and FinOps cloud cost analysis in our [Benchmark Report](/lib/benchmark).

---

## Supported Elements

| Element | Description |
|:---|:---|
| **Text** | Typography with font families, sizing, alignment, word wrapping, and dynamic bindings |
| **Table** | Grid layouts, multi-column definitions, automatic page-breaking, and repeated headers |
| **Image** | Embedding via URL, local file, or Base64 with aspect ratio preservation |
| **Container** | Layout grouping box with borders, paddings, and background fills |
| **Watermark** | Multi-page text or image background watermarks with configurable opacity and rotation |
| **Barcode & QR** | Barcodes (Code 128, EAN, 39) and QR codes rendered directly as vector graphics |
| **Page Break** | Explicit programmatic pagination control |
| **Rectangle & Line** | Geometric accents, dividers, and decorative shapes |
| **Loop** | Repeating sections over dynamic JSON arrays |
| **Conditional** | Contextual rendering based on boolean business rules |
| **Summary Page** | Dedicated closing/appendix page for totals, terms, and signatures |

---

## Architecture

```
┌────────────────────────────────────────────────────────┐
│            Your Application / Microservice             │
│        (Spring Boot, Quarkus, Micronaut, Ktor)         │
└────────────────────────────────────────────────────────┘
                           │
       generate(template, data) / generateToStream(...)
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│               Open PDF Generator Engine                │
│  ┌──────────────────────────────────────────────────┐  │
│  │   Template Parser & JSON Schema Draft-07         │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │   Expression Evaluator & Data-Binding Pipeline   │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │   Layout Planner & Dynamic Pagination Engine     │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │   High-Efficiency Vector Renderer (OpenPDF 2.x)  │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│        Vector PDF Output (Memory or Stream)            │
└────────────────────────────────────────────────────────┘
```

---

## Common Use Cases

### High-Volume Invoicing & Billing
- E-invoices, utility bills, receipts, and order confirmations.
- Automatic page-breaking across multi-page product tables, subtotals, and fiscal QR codes.

### Financial Statements & Reports
- Portfolio summaries, account statements, and tabular transaction histories.
- Headers and footers with dynamic page numbering (<code v-pre>Page {{page}} of {{pages}}</code>).

### Shipping Labels & Logistics
- Pallet slips, packing manifests, and dispatch notes with Code 128 barcodes.

### Contracts & Certificates
- Formal agreements with justified paragraphs, custom watermarks, and signature blocks.

---

## Requirements

- **Java 11+** or **Kotlin 1.8+**
- **Gradle** or **Maven**
- Runs natively on Linux, macOS, and Windows containers (Alpine, Distroless, Debian).

---

## Next Steps

- [Installation Guide](/lib/guide/installation) - Add the dependency to Gradle/Maven
- [First Steps Tutorial](/lib/guide/first-steps) - Generate your first invoice in 5 minutes
- [Template Specification](/lib/guide/templates) - Explore the JSON template format
- [⚡ Benchmark Case Study](/lib/benchmark) - See detailed performance and container metrics



