# PDFGenerator

Main class for generating PDFs from templates.

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

## Constructors

### PDFGenerator()

Creates instance with default configuration.

```kotlin
val generator = PDFGenerator()
```

### PDFGenerator(config)

Creates instance with custom configuration.

```kotlin
val config = PDFGeneratorConfig(
    strictMode = true,
    debug = false
)
val generator = PDFGenerator(config)
```

---

## Methods

### generate()

Generates PDF from template and data.

#### Signatures

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

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `template` | Template | Loaded template |
| `data` | Map<String, Any?> | Data for data binding |
| `outputFile` | File | Output file |
| `outputStream` | OutputStream | Output stream |

#### Example - File

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

#### Example - OutputStream

```kotlin
val outputStream = FileOutputStream("output.pdf")
generator.generate(template, data, outputStream)
outputStream.close()
```

#### Example - ByteArray

```kotlin
val pdfBytes = generator.generateToBytes(template, data)
// Use bytes (e.g.: send via HTTP, save to database, etc.)
```

---

## Usage Examples

### Basic Kotlin

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

### Basic Java

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

### With Configuration

```kotlin
val config = PDFGeneratorConfig(
    strictMode = true,      // Stops on errors
    debug = true,           // Detailed logs
    defaultFontSize = 10f   // Default font
)

val generator = PDFGenerator(config)
generator.generate(template, data, outputFile)
```

### Batch Processing

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

### REST API (Spring Boot)

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

## Cache Management

The `PDFGenerator` class provides static methods to manage the template cache. The cache is **thread-safe** and **shared across all instances**.

### clearCache()

Clears all cached templates. Use this when you need to free memory or force templates to be re-parsed.

```kotlin
// Clear all cached templates
PDFGenerator.clearCache()
```

### invalidateCache(templatePath)

Removes a specific template from the cache. Use this when a single template file has been modified.

```kotlin
// Remove specific template
PDFGenerator.invalidateCache("/templates/invoice.json")

// After this, the next call with this template will re-parse it
```

### cacheSize()

Returns the number of templates currently in cache. Useful for monitoring and debugging.

```kotlin
val count = PDFGenerator.cacheSize()
println("Templates in cache: $count")
```

### When to clear cache

| Scenario | Action |
|----------|--------|
| Template file updated in production | `invalidateCache(path)` |
| Deploying new template versions | `clearCache()` |
| Memory pressure | `clearCache()` |
| Development (seeing changes) | Disable cache in config |

### Example: Hot reload in development

```kotlin
fun watchTemplates(directory: File) {
    // Using Java WatchService or similar
    directory.watchForChanges { changedFile ->
        PDFGenerator.invalidateCache(changedFile.absolutePath)
        println("Template cache invalidated: ${changedFile.name}")
    }
}
```

---

## Thread Safety

`PDFGenerator` is **thread-safe**. A single instance can be shared between threads:

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

## Exceptions

| Exception | Cause |
|-----------|-------|
| `TemplateValidationException` | Invalid template |
| `DataBindingException` | Data binding error |
| `RenderException` | Rendering error |
| `IOException` | File I/O error |

### Error Handling

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

## Next Steps

- [Template](/lib/api/template) - Load and validate templates
- [Configuration](/lib/api/configuration) - All configuration options
- [Examples](/lib/examples/) - Complete use cases

