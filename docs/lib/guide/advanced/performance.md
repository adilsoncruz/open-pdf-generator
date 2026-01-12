# Performance

Optimization guide for high-performance PDF generation.

## Overview

The PDF Generator Library was designed to be lightweight and fast:

| Metric | Value |
|--------|-------|
| **JAR Size** | 5.1 MB (standalone) |
| **Cold Start** | ~500ms |
| **Warm Start** | ~50ms |
| **Simple generation** | ~100ms |
| **1000 row table** | ~500ms |

---

## Benchmarks

### Simple PDF (1 page, text + image)

```
First execution:  ~600ms (cold start)
Following executions: ~80ms (warm)
```

### PDF with Table (100 rows)

```
First execution:  ~700ms
Following executions: ~150ms
```

### PDF with Large Table (1000 rows, ~20 pages)

```
First execution:  ~1200ms
Following executions: ~500ms
```

---

## Image Cache

### How It Works

Images are automatically cached in memory:

```kotlin
// First time: loads from URL/file
// Next times: uses cache

val generator = PDFGenerator()
generator.generate(template1, data1, file1) // Loads logo.png
generator.generate(template2, data2, file2) // Uses cache
generator.generate(template3, data3, file3) // Uses cache
```

### Cache Management

```kotlin
import com.pdfgenerator.renderer.ImageRenderer

// Check cache size
val cacheSize = ImageRenderer.cacheSize()
println("Cached images: $cacheSize")

// Clear complete cache
ImageRenderer.clearCache()

// Invalidate specific image
ImageRenderer.invalidateCache("https://example.com/logo.png")

// Configure maximum size
ImageRenderer.setMaxCacheSize(200) // default: 100
```

### When to Clear Cache

- ✅ After processing large batch of PDFs
- ✅ If images were updated
- ✅ In memory-limited environments
- ✅ Periodically in long-running services

---

## Font Cache

Fonts are automatically cached by OpenPDF:

```kotlin
// Default fonts are loaded once
// Helvetica, Times, Courier
```

**Tip:** Use default fonts for better performance:
- `Helvetica` (sans-serif)
- `Times` (serif)
- `Courier` (monospace)

---

## Template Optimization

### ✅ Good Practices

```json
{
  "elements": [
    {
      "type": "text",
      "dataBinding": "name"
    }
  ]
}
```

### ❌ Avoid

```json
{
  "elements": [
    {
      "type": "text",
      "dataBinding": "list | join:', ' | upperCase | truncate:1000 | replace:'A':'B'"
    }
  ]
}
```

**Why?** Complex chained transformations are processed for each cell/element.

---

## Data Optimization

### ✅ Pre-process in Backend

```kotlin
// GOOD: Process data before sending to template
val processedData = data.map { item ->
    item.copy(
        formattedValue = formatCurrency(item.value),
        formattedDate = formatDate(item.date)
    )
}

generator.generate(template, processedData, file)
```

### ❌ Avoid Heavy Transformations in Template

```json
{
  "dataBinding": "value | complex_calculation"
}
```

---

## Table Optimization

### Row Limit

```kotlin
// Recommended: maximum 500-1000 rows per PDF
// For more data: paginate in backend

val chunks = data.chunked(500)
chunks.forEachIndexed { index, chunk ->
    generator.generate(template, chunk, File("part_$index.pdf"))
}
```

### Efficient Columns

```json
{
  "columns": [
    {
      "header": "Name",
      "field": "$item.name"
    },
    {
      "header": "Value",
      "field": "$item.formattedValue"
    }
  ]
}
```

**Avoid:**
- Many columns (> 10)
- Complex transformations in each cell
- Images inside tables

---

## Image Optimization

### Recommended Size

| Use | Maximum Size | Format |
|-----|--------------|--------|
| Logo | 200 KB | PNG |
| Product photo | 500 KB | JPEG (80% quality) |
| Background | 300 KB | JPEG |
| QR Code | Generated | - |

### Pre-process Images

```kotlin
// Resize images BEFORE using in template
// Don't send 5MB image for 100x50px logo
```

### Base64 vs URL

```kotlin
// URL: Better for repeated images (cache works)
"source": "https://cdn.example.com/logo.png"

// Base64: Better for unique images per document
"dataBinding": "signature.base64"
```

---

## Generator Configuration

### Strict Mode

```kotlin
val config = PDFGeneratorConfig(
    strictMode = false  // Continues even with minor errors
)
```

- `strictMode = true`: Stops on first failure (development)
- `strictMode = false`: Continues if possible (production)

### Debug Mode

```kotlin
val config = PDFGeneratorConfig(
    debug = false  // Disables debug logs
)
```

**Production:** Always `debug = false`

---

## Batch Processing

### Sequential (Simple)

```kotlin
val generator = PDFGenerator()

orders.forEach { order ->
    val data = prepareData(order)
    generator.generate(template, data, File("order_${order.id}.pdf"))
}
```

### Parallel (High Performance)

```kotlin
import kotlinx.coroutines.*

val generator = PDFGenerator()

runBlocking {
    orders.map { order ->
        async(Dispatchers.IO) {
            val data = prepareData(order)
            generator.generate(template, data, File("order_${order.id}.pdf"))
        }
    }.awaitAll()
}
```

::: warning Attention
`PDFGenerator` is thread-safe, but each `generate()` creates its own document. For maximum performance, use a limited thread pool.
:::

---

## Monitoring

### Important Metrics

```kotlin
import kotlin.system.measureTimeMillis

val time = measureTimeMillis {
    generator.generate(template, data, file)
}
println("PDF generated in ${time}ms")
```

### Logging

```xml
<!-- logback.xml -->
<logger name="com.pdfgenerator" level="INFO"/>

<!-- For performance debug -->
<logger name="com.pdfgenerator" level="DEBUG"/>
```

---

## Comparison: Usage Modes

| Scenario | Expected Time | Tips |
|----------|---------------|------|
| Simple single PDF | 50-150ms | - |
| PDF with medium table | 100-300ms | Use `paginated: true` |
| PDF with images | 150-400ms | Optimize image sizes |
| Batch of 100 PDFs | 5-15s | Process in parallel |
| Batch of 1000 PDFs | 50-150s | Use workers/queues |

---

## Serverless Environment

### AWS Lambda / GCP Cloud Functions

```kotlin
// Recommendations:
// - Memory: 512MB+ 
// - Timeout: 30s+
// - Cold start: ~2-3s (first execution)

// Optimization: Keep instance warm
val generator = PDFGenerator() // Reuse between invocations
```

### Reducing Cold Start

1. Use provisioned concurrency (AWS)
2. Keep instance warm with ping
3. Load template in init (outside handler)

```kotlin
// Lambda Handler
class Handler {
    // Loads once in init
    private val template = Template.fromResource("/templates/invoice.json")
    private val generator = PDFGenerator()
    
    fun handleRequest(input: Map<String, Any>): ByteArray {
        val output = ByteArrayOutputStream()
        generator.generate(template, input, output)
        return output.toByteArray()
    }
}
```

---

## Troubleshooting

### Slow PDF

1. ✅ Check image sizes
2. ✅ Reduce template transformations
3. ✅ Limit table rows
4. ✅ Verify cache is working
5. ✅ Use `debug: false` in production

### OutOfMemoryError

1. ✅ Increase heap: `-Xmx512m`
2. ✅ Limit image cache: `setMaxCacheSize(50)`
3. ✅ Process in smaller batches
4. ✅ Clear cache periodically

### Timeout in Serverless

1. ✅ Increase Lambda timeout
2. ✅ Reduce template complexity
3. ✅ Use provisioned concurrency
4. ✅ Pre-warm the function

---

## Best Practices Summary

| Area | Recommendation |
|------|----------------|
| **Images** | < 500KB, appropriate format |
| **Tables** | < 1000 rows per PDF |
| **Transformations** | Pre-process in backend |
| **Cache** | Keep enabled, clear periodically |
| **Batches** | Process in parallel |
| **Logging** | `INFO` in production |
| **Fonts** | Use defaults (Helvetica, Times, Courier) |

---

## Next Steps

- [Installation](/guide/installation) - Initial setup
- [Header & Footer](/guide/advanced/header-footer) - Optimize headers
- [Examples](/examples/) - Optimized templates

