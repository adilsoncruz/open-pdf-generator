# Rendimiento

Guía de optimización para la generación de PDFs de alto rendimiento.

## Vista General

La librería PDF Generator fue diseñada para ser ligera y rápida:

| Métrica | Valor |
|--------|-------|
| **Tamaño del JAR** | 5.1 MB (standalone) |
| **Arranque en frío** | ~500ms |
| **Arranque en caliente** | ~50ms |
| **Generación simple** | ~100ms |
| **Tabla de 1000 filas** | ~500ms |

---

## Benchmarks

### PDF Simple (1 página, texto + imagen)

```
Primera ejecución:  ~600ms (arranque en frío)
Ejecuciones siguientes: ~80ms (en caliente)
```

### PDF con Tabla (100 filas)

```
Primera ejecución:  ~700ms
Ejecuciones siguientes: ~150ms
```

### PDF con Tabla Grande (1000 filas, ~20 páginas)

```
Primera ejecución:  ~1200ms
Ejecuciones siguientes: ~500ms
```

---

## Caché de Imágenes

### Cómo Funciona

Las imágenes se cachean automáticamente en memoria:

```kotlin
// Primera vez: carga desde URL/archivo
// Siguientes veces: usa la caché

val generator = PDFGenerator()
generator.generate(template1, data1, file1) // Carga logo.png
generator.generate(template2, data2, file2) // Usa la caché
generator.generate(template3, data3, file3) // Usa la caché
```

### Gestión de la Caché

```kotlin
import com.pdfgenerator.renderer.ImageRenderer

// Verificar el tamaño de la caché
val cacheSize = ImageRenderer.cacheSize()
println("Cached images: $cacheSize")

// Limpiar la caché por completo
ImageRenderer.clearCache()

// Invalidar una imagen específica
ImageRenderer.invalidateCache("https://example.com/logo.png")

// Configurar el tamaño máximo
ImageRenderer.setMaxCacheSize(200) // predeterminado: 100
```

### Cuándo Limpiar la Caché

- ✅ Después de procesar un lote grande de PDFs
- ✅ Si las imágenes fueron actualizadas
- ✅ En entornos con memoria limitada
- ✅ Periódicamente en servicios de larga ejecución

---

## Caché de Fuentes

Las fuentes se cachean automáticamente por OpenPDF:

```kotlin
// Las fuentes predeterminadas se cargan una sola vez
// Helvetica, Times, Courier
```

**Consejo:** Usa las fuentes predeterminadas para un mejor rendimiento:
- `Helvetica` (sans-serif)
- `Times` (serif)
- `Courier` (monospace)

---

## Optimización de Plantillas

### ✅ Buenas Prácticas

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

### ❌ Evitar

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

**¿Por qué?** Las transformaciones encadenadas complejas se procesan para cada celda/elemento.

---

## Optimización de Datos

### ✅ Preprocesar en el Backend

```kotlin
// BIEN: Procesa los datos antes de enviarlos a la plantilla
val processedData = data.map { item ->
    item.copy(
        formattedValue = formatCurrency(item.value),
        formattedDate = formatDate(item.date)
    )
}

generator.generate(template, processedData, file)
```

### ❌ Evitar Transformaciones Pesadas en la Plantilla

```json
{
  "dataBinding": "value | complex_calculation"
}
```

---

## Optimización de Tablas

### Límite de Filas

```kotlin
// Recomendado: máximo 500-1000 filas por PDF
// Para más datos: pagina en el backend

val chunks = data.chunked(500)
chunks.forEachIndexed { index, chunk ->
    generator.generate(template, chunk, File("part_$index.pdf"))
}
```

### Columnas Eficientes

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

**Evitar:**
- Demasiadas columnas (> 10)
- Transformaciones complejas en cada celda
- Imágenes dentro de las tablas

---

## Optimización de Imágenes

### Tamaño Recomendado

| Uso | Tamaño Máximo | Formato |
|-----|--------------|--------|
| Logotipo | 200 KB | PNG |
| Foto de producto | 500 KB | JPEG (calidad 80%) |
| Fondo | 300 KB | JPEG |
| Código QR | Generado | - |

### Preprocesar Imágenes

```kotlin
// Redimensiona las imágenes ANTES de usarlas en la plantilla
// No envíes una imagen de 5MB para un logo de 100x50px
```

### Base64 vs URL

```kotlin
// URL: Mejor para imágenes repetidas (la caché funciona)
"source": "https://cdn.example.com/logo.png"

// Base64: Mejor para imágenes únicas por documento
"dataBinding": "signature.base64"
```

---

## Configuración del Generador

### Modo Estricto

```kotlin
val config = PDFGeneratorConfig(
    strictMode = false  // Continúa incluso con errores menores
)
```

- `strictMode = true`: Se detiene en la primera falla (desarrollo)
- `strictMode = false`: Continúa si es posible (producción)

### Modo Debug

```kotlin
val config = PDFGeneratorConfig(
    debug = false  // Desactiva los logs de debug
)
```

**Producción:** Siempre `debug = false`

---

## Procesamiento por Lotes

### Secuencial (Simple)

```kotlin
val generator = PDFGenerator()

orders.forEach { order ->
    val data = prepareData(order)
    generator.generate(template, data, File("order_${order.id}.pdf"))
}
```

### Paralelo (Alto Rendimiento)

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

::: warning Atención
`PDFGenerator` es thread-safe, pero cada `generate()` crea su propio documento. Para máximo rendimiento, usa un pool de hilos limitado.
:::

---

## Monitoreo

### Métricas Importantes

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

<!-- Para debug de rendimiento -->
<logger name="com.pdfgenerator" level="DEBUG"/>
```

---

## Comparación: Modos de Uso

| Escenario | Tiempo Esperado | Consejos |
|----------|---------------|------|
| PDF simple único | 50-150ms | - |
| PDF con tabla mediana | 100-300ms | Usa `paginated: true` |
| PDF con imágenes | 150-400ms | Optimiza los tamaños de imagen |
| Lote de 100 PDFs | 5-15s | Procesa en paralelo |
| Lote de 1000 PDFs | 50-150s | Usa workers/colas |

---

## Entorno Serverless

### AWS Lambda / GCP Cloud Functions

```kotlin
// Recomendaciones:
// - Memoria: 512MB+ 
// - Timeout: 30s+
// - Arranque en frío: ~2-3s (primera ejecución)

// Optimización: Mantén la instancia caliente
val generator = PDFGenerator() // Reutiliza entre invocaciones
```

### Reducir el Arranque en Frío

1. Usa concurrencia aprovisionada (AWS)
2. Mantén la instancia caliente con un ping
3. Carga la plantilla en el init (fuera del handler)

```kotlin
// Lambda Handler
class Handler {
    // Se carga una vez en el init
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

## Solución de Problemas

### PDF Lento

1. ✅ Verifica los tamaños de las imágenes
2. ✅ Reduce las transformaciones de la plantilla
3. ✅ Limita las filas de las tablas
4. ✅ Comprueba que la caché esté funcionando
5. ✅ Usa `debug: false` en producción

### OutOfMemoryError

1. ✅ Aumenta el heap: `-Xmx512m`
2. ✅ Limita la caché de imágenes: `setMaxCacheSize(50)`
3. ✅ Procesa en lotes más pequeños
4. ✅ Limpia la caché periódicamente

### Timeout en Serverless

1. ✅ Aumenta el timeout de la Lambda
2. ✅ Reduce la complejidad de la plantilla
3. ✅ Usa concurrencia aprovisionada
4. ✅ Pre-calienta la función

---

## Resumen de Buenas Prácticas

| Área | Recomendación |
|------|----------------|
| **Imágenes** | < 500KB, formato adecuado |
| **Tablas** | < 1000 filas por PDF |
| **Transformaciones** | Preprocesar en el backend |
| **Caché** | Mantener habilitada, limpiar periódicamente |
| **Lotes** | Procesar en paralelo |
| **Logging** | `INFO` en producción |
| **Fuentes** | Usar las predeterminadas (Helvetica, Times, Courier) |

---

## Próximos Pasos

- [Instalación](/es/lib/guide/installation) - Configuración inicial
- [Encabezado y Pie de Página](/es/lib/guide/advanced/header-footer) - Optimiza los encabezados
- [Ejemplos](/es/lib/examples/) - Plantillas optimizadas
