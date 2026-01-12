# Configuration

Complete guide to PDFGenerator configuration options.

## PDFGeneratorConfig

The `PDFGeneratorConfig` class allows you to customize the behavior of the PDF generator.

### Import

::: code-group

```kotlin [Kotlin]
import com.pdfgenerator.PDFGeneratorConfig
import com.pdfgenerator.ImageCacheConfig
import com.pdfgenerator.HttpTimeoutConfig
import com.pdfgenerator.TemplateCacheConfig
```

```java [Java]
import com.pdfgenerator.PDFGeneratorConfig;
```

:::

---

## Properties Overview

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `strictMode` | Boolean | `false` | Controls error handling behavior |
| `debug` | Boolean | `false` | Enables detailed logging |
| `defaultFontSize` | Float | `12f` | Default font size in points |
| `defaultFontFamily` | String | `"Helvetica"` | Default font family |
| `defaultColor` | String | `"#000000"` | Default text color |
| `templateCache` | TemplateCacheConfig | enabled | Template parsing cache |
| `imageCache` | ImageCacheConfig | enabled | Image download cache |
| `httpTimeout` | HttpTimeoutConfig | 5s/10s | HTTP request timeouts |

---

## strictMode

Controls how the library handles errors during PDF generation.

### When to use `strictMode = true`

- **Development/Testing**: Fail fast to catch template errors early
- **Critical documents**: Ensure all data bindings are correct
- **Validation pipelines**: Verify templates before production

### When to use `strictMode = false`

- **Production with fallbacks**: Continue even if some data is missing
- **User-generated templates**: Be tolerant to minor issues
- **Batch processing**: Don't stop the entire batch for one error

### Behavior

| Scenario | `strictMode = true` | `strictMode = false` |
|----------|---------------------|----------------------|
| Missing data binding <code v-pre>{{user.name}}</code> | Throws `DataBindingException` | Renders empty string `""` |
| Invalid image URL | Throws `ImageLoadException` | Skips the image |
| Invalid date format | Throws `TransformException` | Shows raw value |
| Missing font | Throws `FontException` | Uses default font |

### Example

```kotlin
// Development - fail on any error
val devConfig = PDFGeneratorConfig(strictMode = true)

// Production - be tolerant
val prodConfig = PDFGeneratorConfig(strictMode = false)
```

**Default:** `false`

---

## debug

Enables detailed logging of the PDF generation process. Useful for troubleshooting template issues, understanding rendering flow, and measuring performance.

### What gets logged

- Template loading and parsing time
- Each element being rendered with its type
- Data binding resolutions
- Table pagination details
- Image loading (local/remote)
- Total generation time

### Example output

```text
[PDFGenerator] Loading template: invoice.json
[PDFGenerator] Template parsed in 12ms
[PDFGenerator] Rendering page 1
[PDFGenerator] Rendering element: company_logo (ImageElement)
[PDFGenerator] Loading image: /assets/logo.png (local)
[PDFGenerator] Rendering element: title (TextElement)
[PDFGenerator] Data binding: {⁣{invoice.number}⁣} -> "INV-2024-001"
[PDFGenerator] Rendering element: items_table (TableElement)
[PDFGenerator] Table: 45 rows, generating 3 pages
[PDFGenerator] PDF generated: 3 pages in 234ms
```

### Usage

```kotlin
val config = PDFGeneratorConfig(debug = true)
```

::: warning
Disable debug mode in production to avoid performance overhead and excessive logging.
:::

**Default:** `false`

---

## defaultFontSize

Default font size (in points) used when elements don't specify a `fontSize` property.

### Common use cases

- Set a global base font size for consistency
- Smaller fonts (10pt) for dense documents like invoices
- Larger fonts (14pt) for accessibility

### Example

```kotlin
// Compact documents
val config = PDFGeneratorConfig(defaultFontSize = 10f)

// Accessible documents
val config = PDFGeneratorConfig(defaultFontSize = 14f)
```

**Default:** `12f`

---

## defaultFontFamily

Default font family used when elements don't specify a `fontFamily` property.

### Built-in fonts (always available)

| Font | Style | Best for |
|------|-------|----------|
| `Helvetica` | Sans-serif | Modern documents, UI |
| `Times-Roman` | Serif | Formal documents, articles |
| `Courier` | Monospace | Code, technical data |

### Custom fonts

You can register custom fonts via the font directory configuration. See [Custom Fonts](/lib/guide/advanced/fonts) for details.

### Example

```kotlin
// Technical documents
val config = PDFGeneratorConfig(defaultFontFamily = "Courier")

// Formal documents
val config = PDFGeneratorConfig(defaultFontFamily = "Times-Roman")
```

**Default:** `"Helvetica"`

---

## defaultColor

Default text color (hex format) used when elements don't specify a `color` property.

### Format

- Hex with `#`: `"#FF5500"` or `"#F50"`
- Case insensitive: `"#ff5500"` works too

### Example

```kotlin
// Dark gray for softer appearance
val config = PDFGeneratorConfig(defaultColor = "#333333")

// Brand color
val config = PDFGeneratorConfig(defaultColor = "#8B5CF6")
```

**Default:** `"#000000"` (black)

---

## templateCache

Controls caching of parsed templates. When enabled, templates are parsed once and reused for subsequent PDF generations with the same template.

### Why use template cache

- **Performance**: Parsing JSON templates is CPU-intensive. Cache avoids re-parsing.
- **Throughput**: Essential for high-volume PDF generation (APIs, batch jobs).
- **Thread-safe**: The cache is thread-safe and shared across all `PDFGenerator` instances.

### When to disable

- **Development**: See template changes immediately without restart
- **Dynamic templates**: When templates are generated/modified at runtime
- **Memory constraints**: Each cached template uses memory

### Configuration options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enabled` | Boolean | `true` | Enable/disable caching |
| `maxSize` | Int | `100` | Maximum templates in cache (LRU eviction) |

### Example

```kotlin
val config = PDFGeneratorConfig(
    templateCache = TemplateCacheConfig(
        enabled = true,
        maxSize = 50  // Keep up to 50 templates
    )
)
```

### Cache management

```kotlin
// Clear all cached templates
PDFGenerator.clearCache()

// Remove specific template from cache
PDFGenerator.invalidateCache("/templates/invoice.json")

// Check cache size
val count = PDFGenerator.cacheSize()
println("Templates in cache: $count")
```

### Performance impact

| Scenario | Without cache | With cache |
|----------|---------------|------------|
| First render | 50ms | 50ms |
| Subsequent renders | 50ms | 5ms |
| 1000 PDFs with same template | ~50 seconds | ~5 seconds |

**Default:** Enabled with max 100 templates

---

## imageCache

Controls caching of downloaded images. When templates reference external images (HTTP/HTTPS URLs), the library downloads and caches them to avoid redundant network requests.

### Why use image cache

- **Performance**: Network requests are slow. Cache avoids re-downloading.
- **Bandwidth**: Reduces network usage for repeated image references.
- **Reliability**: Cached images work even if the server is temporarily unavailable.

### When to disable

- **Development**: See image changes immediately
- **Dynamic images**: When images change frequently (e.g., charts, avatars)
- **Memory constraints**: Large images consume memory

### Configuration options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enabled` | Boolean | `true` | Enable/disable caching |
| `maxSize` | Int | `50` | Maximum images in cache (LRU eviction) |
| `ttlMinutes` | Int | `30` | Time-to-live before cache expiration |

### Example

```kotlin
val config = PDFGeneratorConfig(
    imageCache = ImageCacheConfig(
        enabled = true,
        maxSize = 100,       // Cache up to 100 images
        ttlMinutes = 60      // Keep for 1 hour
    )
)
```

### Cache behavior

1. First request: Download image, store in cache
2. Subsequent requests (within TTL): Use cached image
3. After TTL expires: Re-download and update cache
4. When max size reached: Evict least recently used (LRU)

### Local images

Local images (file paths) are **not cached** - they're read directly from disk each time. Only remote images (HTTP/HTTPS) use the cache.

**Default:** Enabled with 50 images and 30 minutes TTL

---

## httpTimeout

Controls timeout values for HTTP requests when downloading external images.

### Why configure timeouts

- **Reliability**: Prevent hanging on slow/unresponsive servers
- **User experience**: Fail fast instead of waiting indefinitely
- **Resource management**: Release connections for other requests

### Configuration options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `connectTimeout` | Int | `5000` | Max time to establish connection (ms) |
| `readTimeout` | Int | `10000` | Max time to read response data (ms) |

### Example

```kotlin
// Fast-fail for production APIs
val config = PDFGeneratorConfig(
    httpTimeout = HttpTimeoutConfig(
        connectTimeout = 3000,  // 3 seconds
        readTimeout = 5000      // 5 seconds
    )
)

// Tolerant for slow image servers
val config = PDFGeneratorConfig(
    httpTimeout = HttpTimeoutConfig(
        connectTimeout = 10000,  // 10 seconds
        readTimeout = 30000      // 30 seconds
    )
)
```

### Timeout behavior

When a timeout occurs:
- `strictMode = true`: Throws `ImageLoadException`
- `strictMode = false`: Skips the image, logs warning

::: tip
For large images (> 1MB), increase `readTimeout` accordingly.
:::

**Default:** Connect 5s, Read 10s

---

## Complete Examples

### Production Configuration

Optimized for reliability and performance in production environments.

```kotlin
val productionConfig = PDFGeneratorConfig(
    strictMode = false,           // Tolerant to minor errors
    debug = false,                // No debug overhead
    defaultFontSize = 10f,
    defaultFontFamily = "Helvetica",
    defaultColor = "#000000",
    templateCache = TemplateCacheConfig(
        enabled = true,
        maxSize = 200             // Large cache for many templates
    ),
    imageCache = ImageCacheConfig(
        enabled = true,
        maxSize = 100,
        ttlMinutes = 120          // 2 hour cache
    ),
    httpTimeout = HttpTimeoutConfig(
        connectTimeout = 3000,
        readTimeout = 8000
    )
)

val generator = PDFGenerator(productionConfig)
```

### Development Configuration

Optimized for debugging and seeing changes immediately.

```kotlin
val devConfig = PDFGeneratorConfig(
    strictMode = true,            // Fail fast on errors
    debug = true,                 // Detailed logging
    defaultFontSize = 12f,
    templateCache = TemplateCacheConfig(
        enabled = false           // See template changes immediately
    ),
    imageCache = ImageCacheConfig(
        enabled = false           // See image changes immediately
    )
)

val generator = PDFGenerator(devConfig)
```

### Test Configuration

Optimized for fast, deterministic tests.

```kotlin
val testConfig = PDFGeneratorConfig(
    strictMode = true,            // Catch all errors
    debug = false,                // Clean test output
    templateCache = TemplateCacheConfig(enabled = false),
    imageCache = ImageCacheConfig(enabled = false),
    httpTimeout = HttpTimeoutConfig(
        connectTimeout = 1000,
        readTimeout = 2000        // Fast timeout for tests
    )
)
```

### High-Volume API Configuration

Optimized for high-throughput PDF generation APIs.

```kotlin
val apiConfig = PDFGeneratorConfig(
    strictMode = false,
    debug = false,
    templateCache = TemplateCacheConfig(
        enabled = true,
        maxSize = 500             // Many templates
    ),
    imageCache = ImageCacheConfig(
        enabled = true,
        maxSize = 200,            // Many images
        ttlMinutes = 240          // 4 hour cache
    ),
    httpTimeout = HttpTimeoutConfig(
        connectTimeout = 2000,
        readTimeout = 5000        // Fast-fail
    )
)
```

---

## Java Usage

```java
PDFGeneratorConfig config = new PDFGeneratorConfig.Builder()
    .strictMode(true)
    .debug(true)
    .defaultFontSize(10f)
    .defaultFontFamily("Helvetica")
    .defaultColor("#000000")
    .templateCacheEnabled(true)
    .templateCacheMaxSize(100)
    .imageCacheEnabled(true)
    .imageCacheMaxSize(100)
    .imageCacheTtlMinutes(60)
    .httpConnectTimeout(5000)
    .httpReadTimeout(10000)
    .build();

PDFGenerator generator = new PDFGenerator(config);
```

---

## Configuration via File

Load configuration from a JSON file:

### config.json

```json
{
  "strictMode": false,
  "debug": false,
  "defaultFontSize": 10,
  "defaultFontFamily": "Helvetica",
  "defaultColor": "#000000",
  "templateCache": {
    "enabled": true,
    "maxSize": 100
  },
  "imageCache": {
    "enabled": true,
    "maxSize": 100,
    "ttlMinutes": 60
  },
  "httpTimeout": {
    "connectTimeout": 5000,
    "readTimeout": 10000
  }
}
```

### Load

```kotlin
val config = PDFGeneratorConfig.fromFile(File("config.json"))
val generator = PDFGenerator(config)
```

---

## Spring Boot Integration

### application.yml

```yaml
pdf-generator:
  strict-mode: false
  debug: false
  default-font-size: 10
  default-font-family: Helvetica
  default-color: "#000000"
  template-cache:
    enabled: true
    max-size: 100
  image-cache:
    enabled: true
    max-size: 100
    ttl-minutes: 60
  http-timeout:
    connect: 5000
    read: 10000
```

### Configuration Class

```kotlin
@Configuration
class PdfConfig {
    
    @Bean
    fun pdfGeneratorConfig(
        @Value("\${pdf-generator.strict-mode:false}") strictMode: Boolean,
        @Value("\${pdf-generator.debug:false}") debug: Boolean,
        @Value("\${pdf-generator.default-font-size:12}") fontSize: Float,
        @Value("\${pdf-generator.template-cache.enabled:true}") templateCacheEnabled: Boolean,
        @Value("\${pdf-generator.template-cache.max-size:100}") templateCacheMaxSize: Int,
        @Value("\${pdf-generator.image-cache.enabled:true}") imageCacheEnabled: Boolean,
        @Value("\${pdf-generator.image-cache.max-size:100}") imageCacheMaxSize: Int,
        @Value("\${pdf-generator.image-cache.ttl-minutes:60}") imageCacheTtl: Int
    ): PDFGeneratorConfig {
        return PDFGeneratorConfig(
            strictMode = strictMode,
            debug = debug,
            defaultFontSize = fontSize,
            templateCache = TemplateCacheConfig(
                enabled = templateCacheEnabled,
                maxSize = templateCacheMaxSize
            ),
            imageCache = ImageCacheConfig(
                enabled = imageCacheEnabled,
                maxSize = imageCacheMaxSize,
                ttlMinutes = imageCacheTtl
            )
        )
    }
    
    @Bean
    fun pdfGenerator(config: PDFGeneratorConfig): PDFGenerator {
        return PDFGenerator(config)
    }
}
```

---

## Environment-based Configuration

```kotlin
fun createConfig(): PDFGeneratorConfig {
    val env = System.getenv("APP_ENV") ?: "development"
    
    return when (env) {
        "production" -> PDFGeneratorConfig(
            strictMode = false,
            debug = false,
            templateCache = TemplateCacheConfig(enabled = true, maxSize = 200),
            imageCache = ImageCacheConfig(enabled = true, maxSize = 100, ttlMinutes = 120)
        )
        "test" -> PDFGeneratorConfig(
            strictMode = true,
            debug = false,
            templateCache = TemplateCacheConfig(enabled = false),
            imageCache = ImageCacheConfig(enabled = false)
        )
        else -> PDFGeneratorConfig(
            strictMode = true,
            debug = true,
            templateCache = TemplateCacheConfig(enabled = false),
            imageCache = ImageCacheConfig(enabled = false)
        )
    }
}
```

---

## Next Steps

- [PDFGenerator API](/lib/api/pdf-generator) - Main class methods
- [Template Format](/lib/api/template) - Template structure
- [Performance Guide](/lib/guide/advanced/performance) - Optimization tips
- [Examples](/lib/examples/) - Real-world use cases
