# Configuración

Guía completa de las opciones de configuración de PDFGenerator.

## PDFGeneratorConfig

La clase `PDFGeneratorConfig` permite personalizar el comportamiento del generador de PDFs.

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

## Resumen de propiedades

| Propiedad | Tipo | Predeterminado | Descripción |
|----------|------|---------|-------------|
| `strictMode` | Boolean | `false` | Controla el comportamiento ante errores |
| `debug` | Boolean | `false` | Habilita el logging detallado |
| `defaultFontSize` | Float | `12f` | Tamaño de fuente predeterminado en puntos |
| `defaultFontFamily` | String | `"Helvetica"` | Familia de fuente predeterminada |
| `defaultColor` | String | `"#000000"` | Color de texto predeterminado |
| `templateCache` | TemplateCacheConfig | habilitada | Caché de parseo de plantillas |
| `imageCache` | ImageCacheConfig | habilitada | Caché de descarga de imágenes |
| `httpTimeout` | HttpTimeoutConfig | 5s/10s | Timeouts de las peticiones HTTP |

---

## strictMode

Controla cómo la biblioteca maneja los errores durante la generación de PDFs.

### Cuándo usar `strictMode = true`

- **Desarrollo/Testing**: Fallar rápido para detectar errores de plantilla temprano
- **Documentos críticos**: Garantizar que todos los data bindings sean correctos
- **Pipelines de validación**: Verificar plantillas antes de producción

### Cuándo usar `strictMode = false`

- **Producción con fallbacks**: Continuar aunque falten algunos datos
- **Plantillas generadas por usuarios**: Ser tolerante ante problemas menores
- **Procesamiento en lote**: No detener todo el lote por un error

### Comportamiento

| Escenario | `strictMode = true` | `strictMode = false` |
|----------|---------------------|----------------------|
| Data binding inexistente <code v-pre>{{user.name}}</code> | Lanza `DataBindingException` | Renderiza un string vacío `""` |
| URL de imagen inválida | Lanza `ImageLoadException` | Omite la imagen |
| Formato de fecha inválido | Lanza `TransformException` | Muestra el valor crudo |
| Fuente inexistente | Lanza `FontException` | Usa la fuente predeterminada |

### Ejemplo

```kotlin
// Development - fail on any error
val devConfig = PDFGeneratorConfig(strictMode = true)

// Production - be tolerant
val prodConfig = PDFGeneratorConfig(strictMode = false)
```

**Predeterminado:** `false`

---

## debug

Habilita el logging detallado del proceso de generación de PDFs. Útil para depurar problemas de plantillas, entender el flujo de renderizado y medir el rendimiento.

### Qué se registra

- Tiempo de carga y parseo de la plantilla
- Cada elemento renderizado con su tipo
- Resoluciones de data binding
- Detalles de la paginación de tablas
- Carga de imágenes (locales/remotas)
- Tiempo total de generación

### Ejemplo de salida

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

### Uso

```kotlin
val config = PDFGeneratorConfig(debug = true)
```

::: warning
Desactiva el modo debug en producción para evitar sobrecarga de rendimiento y un logging excesivo.
:::

**Predeterminado:** `false`

---

## defaultFontSize

Tamaño de fuente predeterminado (en puntos) que se usa cuando los elementos no especifican la propiedad `fontSize`.

### Casos de uso comunes

- Definir un tamaño de fuente base global para mantener consistencia
- Fuentes más pequeñas (10pt) para documentos densos como facturas
- Fuentes más grandes (14pt) para accesibilidad

### Ejemplo

```kotlin
// Compact documents
val config = PDFGeneratorConfig(defaultFontSize = 10f)

// Accessible documents
val config = PDFGeneratorConfig(defaultFontSize = 14f)
```

**Predeterminado:** `12f`

---

## defaultFontFamily

Familia de fuente predeterminada que se usa cuando los elementos no especifican la propiedad `fontFamily`.

### Fuentes integradas (siempre disponibles)

| Fuente | Estilo | Ideal para |
|------|-------|----------|
| `Helvetica` | Sans-serif | Documentos modernos, UI |
| `Times-Roman` | Serif | Documentos formales, artículos |
| `Courier` | Monospace | Código, datos técnicos |

### Fuentes personalizadas

Puedes registrar fuentes personalizadas mediante la configuración del directorio de fuentes.

### Ejemplo

```kotlin
// Technical documents
val config = PDFGeneratorConfig(defaultFontFamily = "Courier")

// Formal documents
val config = PDFGeneratorConfig(defaultFontFamily = "Times-Roman")
```

**Predeterminado:** `"Helvetica"`

---

## defaultColor

Color de texto predeterminado (formato hex) que se usa cuando los elementos no especifican la propiedad `color`.

### Formato

- Hex con `#`: `"#FF5500"` o `"#F50"`
- Insensible a mayúsculas: `"#ff5500"` también funciona

### Ejemplo

```kotlin
// Dark gray for softer appearance
val config = PDFGeneratorConfig(defaultColor = "#333333")

// Brand color
val config = PDFGeneratorConfig(defaultColor = "#8B5CF6")
```

**Predeterminado:** `"#000000"` (negro)

---

## templateCache

Controla el caching de plantillas parseadas. Cuando está habilitada, las plantillas se parsean una vez y se reutilizan en las siguientes generaciones de PDF con la misma plantilla.

### Por qué usar la caché de plantillas

- **Rendimiento**: Parsear plantillas JSON consume mucha CPU. La caché evita re-parsear.
- **Throughput**: Esencial para la generación de PDFs en grandes volúmenes (APIs, trabajos por lotes).
- **Thread-safe**: La caché es thread-safe y se comparte entre todas las instancias de `PDFGenerator`.

### Cuándo desactivarla

- **Desarrollo**: Ver los cambios de plantillas inmediatamente, sin reiniciar
- **Plantillas dinámicas**: Cuando las plantillas se generan/modifican en runtime
- **Restricciones de memoria**: Cada plantilla en caché consume memoria

### Opciones de configuración

| Propiedad | Tipo | Predeterminado | Descripción |
|----------|------|---------|-------------|
| `enabled` | Boolean | `true` | Habilita/deshabilita el caching |
| `maxSize` | Int | `100` | Cantidad máxima de plantillas en caché (evicción LRU) |

### Ejemplo

```kotlin
val config = PDFGeneratorConfig(
    templateCache = TemplateCacheConfig(
        enabled = true,
        maxSize = 50  // Keep up to 50 templates
    )
)
```

### Gestión de la caché

```kotlin
// Clear all cached templates
PDFGenerator.clearCache()

// Remove specific template from cache
PDFGenerator.invalidateCache("/templates/invoice.json")

// Check cache size
val count = PDFGenerator.cacheSize()
println("Templates in cache: $count")
```

### Impacto en el rendimiento

| Escenario | Sin caché | Con caché |
|----------|---------------|------------|
| Primer render | 50ms | 50ms |
| Renders siguientes | 50ms | 5ms |
| 1000 PDFs con la misma plantilla | ~50 segundos | ~5 segundos |

**Predeterminado:** Habilitada con un máximo de 100 plantillas

---

## imageCache

Controla el caching de imágenes descargadas. Cuando las plantillas referencian imágenes externas (URLs HTTP/HTTPS), la biblioteca las descarga y las guarda en caché para evitar peticiones de red redundantes.

### Por qué usar la caché de imágenes

- **Rendimiento**: Las peticiones de red son lentas. La caché evita volver a descargar.
- **Ancho de banda**: Reduce el uso de red para referencias de imagen repetidas.
- **Fiabilidad**: Las imágenes en caché funcionan incluso si el servidor queda temporalmente indisponible.

### Cuándo desactivarla

- **Desarrollo**: Ver los cambios de imágenes inmediatamente
- **Imágenes dinámicas**: Cuando las imágenes cambian con frecuencia (ej.: gráficos, avatares)
- **Restricciones de memoria**: Las imágenes grandes consumen memoria

### Opciones de configuración

| Propiedad | Tipo | Predeterminado | Descripción |
|----------|------|---------|-------------|
| `enabled` | Boolean | `true` | Habilita/deshabilita el caching |
| `maxSize` | Int | `50` | Cantidad máxima de imágenes en caché (evicción LRU) |
| `ttlMinutes` | Int | `30` | Tiempo de vida antes de que expire la caché |

### Ejemplo

```kotlin
val config = PDFGeneratorConfig(
    imageCache = ImageCacheConfig(
        enabled = true,
        maxSize = 100,       // Cache up to 100 images
        ttlMinutes = 60      // Keep for 1 hour
    )
)
```

### Comportamiento de la caché

1. Primera petición: descarga la imagen y la guarda en caché
2. Peticiones siguientes (dentro del TTL): usa la imagen en caché
3. Después de que expira el TTL: vuelve a descargar y actualiza la caché
4. Al alcanzar el tamaño máximo: evacúa la menos usada recientemente (LRU)

### Imágenes locales

Las imágenes locales (rutas de archivo) **no se cachean**: se leen directamente del disco cada vez. Solo las imágenes remotas (HTTP/HTTPS) usan la caché.

**Predeterminado:** Habilitada con 50 imágenes y TTL de 30 minutos

---

## httpTimeout

Controla los valores de timeout para las peticiones HTTP al descargar imágenes externas.

### Por qué configurar los timeouts

- **Fiabilidad**: Evita bloqueos con servidores lentos o que no responden
- **Experiencia de usuario**: Falla rápido en lugar de esperar indefinidamente
- **Gestión de recursos**: Libera conexiones para otras peticiones

### Opciones de configuración

| Propiedad | Tipo | Predeterminado | Descripción |
|----------|------|---------|-------------|
| `connectTimeout` | Int | `5000` | Tiempo máximo para establecer la conexión (ms) |
| `readTimeout` | Int | `10000` | Tiempo máximo para leer los datos de la respuesta (ms) |

### Ejemplo

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

### Comportamiento ante timeout

Cuando ocurre un timeout:
- `strictMode = true`: Lanza `ImageLoadException`
- `strictMode = false`: Omite la imagen y registra una advertencia

::: tip
Para imágenes grandes (> 1MB), incrementa `readTimeout` en proporción.
:::

**Predeterminado:** Conexión 5s, Lectura 10s

---

## Ejemplos completos

### Configuración de producción

Optimizada para fiabilidad y rendimiento en entornos de producción.

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

### Configuración de desarrollo

Optimizada para depuración y para ver los cambios inmediatamente.

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

### Configuración de pruebas

Optimizada para tests rápidos y deterministas.

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

### Configuración para APIs de alto volumen

Optimizada para APIs de generación de PDFs de alto throughput.

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

## Uso en Java

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

## Configuración vía archivo

Carga la configuración desde un archivo JSON:

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

### Cargar

```kotlin
val config = PDFGeneratorConfig.fromFile(File("config.json"))
val generator = PDFGenerator(config)
```

---

## Integración con Spring Boot

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

### Clase de configuración

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

## Configuración según el entorno

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

## Próximos pasos

- [API de PDFGenerator](/es/lib/api/pdf-generator) - Métodos de la clase principal
- [Formato de Plantilla](/es/lib/api/template) - Estructura de la plantilla
- [Guía de Rendimiento](/es/lib/guide/advanced/performance) - Consejos de optimización
- [Ejemplos](/es/lib/examples/) - Casos de uso reales
