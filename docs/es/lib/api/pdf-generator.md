# PDFGenerator

Clase principal para generar PDFs a partir de plantillas.

## Import

```kotlin
import com.pdfgenerator.PDFGenerator
import com.pdfgenerator.PDFGeneratorConfig
```

```java
import com.pdfgenerator.PDFGenerator;
import com.pdfgenerator.PDFGeneratorConfig;
```

---

## Constructores

### PDFGenerator()

Crea una instancia con la configuración predeterminada.

```kotlin
val generator = PDFGenerator()
```

### PDFGenerator(config)

Crea una instancia con una configuración personalizada.

```kotlin
val config = PDFGeneratorConfig(
    strictMode = true,
    debug = false
)
val generator = PDFGenerator(config)
```

---

## Métodos

### generate()

Genera un PDF a partir de una plantilla y los datos.

#### Firmas

```kotlin
// To file
fun generate(
    template: Template,
    data: Map<String, Any?>,
    outputFile: File
)

// To OutputStream
fun generate(
    template: Template,
    data: Map<String, Any?>,
    outputStream: OutputStream
)

// To ByteArray
fun generateToBytes(
    template: Template,
    data: Map<String, Any?>
): ByteArray
```

#### Parámetros

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `template` | Template | Plantilla cargada |
| `data` | Map<String, Any?> | Datos para el data binding |
| `outputFile` | File | Archivo de salida |
| `outputStream` | OutputStream | Stream de salida |

#### Ejemplo - Archivo

```kotlin
val template = Template.fromFile(File("template.json"))
val data = mapOf(
    "customer" to mapOf(
        "name" to "John Smith",
        "email" to "john@email.com"
    ),
    "items" to listOf(
        mapOf("name" to "Product A", "value" to 100.0),
        mapOf("name" to "Product B", "value" to 200.0)
    )
)

val generator = PDFGenerator()
generator.generate(template, data, File("output.pdf"))
```

#### Ejemplo - OutputStream

```kotlin
val outputStream = FileOutputStream("output.pdf")
generator.generate(template, data, outputStream)
outputStream.close()
```

#### Ejemplo - ByteArray

```kotlin
val pdfBytes = generator.generateToBytes(template, data)
// Usa los bytes (ej.: enviar vía HTTP, guardar en la base de datos, etc.)
```

---

## Ejemplos de uso

### Kotlin básico

```kotlin
import com.pdfgenerator.PDFGenerator
import com.pdfgenerator.template.Template
import java.io.File

fun main() {
    val template = Template.fromFile(File("invoice.json"))
    
    val data = mapOf(
        "number" to 12345,
        "customer" to "John Smith",
        "total" to 1500.00
    )
    
    val generator = PDFGenerator()
    generator.generate(template, data, File("invoice.pdf"))
    
    println("PDF generated successfully!")
}
```

### Java básico

```java
import com.pdfgenerator.PDFGenerator;
import com.pdfgenerator.template.Template;
import java.io.File;
import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Template template = Template.fromFile(new File("invoice.json"));
        
        Map<String, Object> data = new HashMap<>();
        data.put("number", 12345);
        data.put("customer", "John Smith");
        data.put("total", 1500.00);
        
        PDFGenerator generator = new PDFGenerator();
        generator.generate(template, data, new File("invoice.pdf"));
        
        System.out.println("PDF generated successfully!");
    }
}
```

### Con configuración

```kotlin
val config = PDFGeneratorConfig(
    strictMode = true,      // Detiene la ejecución ante errores
    debug = true,           // Logs detallados
    defaultFontSize = 10f   // Fuente predeterminada
)

val generator = PDFGenerator(config)
generator.generate(template, data, outputFile)
```

### Procesamiento en lote

```kotlin
val generator = PDFGenerator()
val template = Template.fromFile(File("template.json"))

orders.forEach { order ->
    val data = mapOf(
        "number" to order.number,
        "customer" to order.customer,
        "items" to order.items
    )
    
    generator.generate(
        template, 
        data, 
        File("orders/order_${order.number}.pdf")
    )
}
```

### API REST (Spring Boot)

```kotlin
@RestController
class PdfController(private val generator: PDFGenerator) {
    
    @PostMapping("/pdf/invoice")
    fun generateInvoice(@RequestBody data: InvoiceDTO): ResponseEntity<ByteArray> {
        val template = Template.fromResource("/templates/invoice.json")
        val dataMap = data.toMap()
        
        val pdfBytes = generator.generateToBytes(template, dataMap)
        
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .header("Content-Disposition", "attachment; filename=invoice.pdf")
            .body(pdfBytes)
    }
}
```

### AWS Lambda

```kotlin
class PdfHandler : RequestHandler<Map<String, Any>, ByteArray> {
    
    private val generator = PDFGenerator()
    private val template = Template.fromResource("/template.json")
    
    override fun handleRequest(
        input: Map<String, Any>, 
        context: Context
    ): ByteArray {
        return generator.generateToBytes(template, input)
    }
}
```

---

## Gestión de caché

La clase `PDFGenerator` ofrece métodos estáticos para gestionar la caché de plantillas. La caché es **thread-safe** y **compartida entre todas las instancias**.

### clearCache()

Limpia todas las plantillas en caché. Úsalo cuando necesites liberar memoria o forzar que las plantillas se vuelvan a parsear.

```kotlin
// Limpia todas las plantillas en caché
PDFGenerator.clearCache()
```

### invalidateCache(templatePath)

Elimina una plantilla específica de la caché. Úsalo cuando se haya modificado un único archivo de plantilla.

```kotlin
// Elimina una plantilla específica
PDFGenerator.invalidateCache("/templates/invoice.json")

// Después de esto, la próxima llamada con esta plantilla la volverá a parsear
```

### cacheSize()

Devuelve la cantidad de plantillas actualmente en caché. Útil para monitoreo y depuración.

```kotlin
val count = PDFGenerator.cacheSize()
println("Templates in cache: $count")
```

### Cuándo limpiar la caché

| Escenario | Acción |
|----------|--------|
| Archivo de plantilla actualizado en producción | `invalidateCache(path)` |
| Despliegue de nuevas versiones de plantillas | `clearCache()` |
| Presión de memoria | `clearCache()` |
| Desarrollo (ver cambios) | Desactivar la caché en la configuración |

### Ejemplo: Hot reload en desarrollo

```kotlin
fun watchTemplates(directory: File) {
    // Usando Java WatchService o similar
    directory.watchForChanges { changedFile ->
        PDFGenerator.invalidateCache(changedFile.absolutePath)
        println("Template cache invalidated: ${changedFile.name}")
    }
}
```

---

## Thread Safety

`PDFGenerator` es **thread-safe**. Una única instancia puede compartirse entre varios hilos:

```kotlin
// Singleton OK
object PdfService {
    private val generator = PDFGenerator()
    
    fun generate(template: Template, data: Map<String, Any?>): ByteArray {
        return generator.generateToBytes(template, data)
    }
}
```

---

## Excepciones

| Excepción | Causa |
|-----------|-------|
| `TemplateValidationException` | Plantilla inválida |
| `DataBindingException` | Error de data binding |
| `RenderException` | Error de renderizado |
| `IOException` | Error de I/O en archivos |

### Manejo de errores

```kotlin
try {
    generator.generate(template, data, outputFile)
} catch (e: TemplateValidationException) {
    println("Invalid template: ${e.message}")
} catch (e: DataBindingException) {
    println("Data binding error: ${e.message}")
} catch (e: Exception) {
    println("General error: ${e.message}")
}
```

---

## Próximos pasos

- [Template](/es/lib/api/template) - Cargar y validar plantillas
- [Configuración](/es/lib/api/configuration) - Todas las opciones de configuración
- [Ejemplos](/es/lib/examples/) - Casos de uso completos
