# 📚 Integration Guide - PDF Generator Library

## 🎯 Overview

This guide shows how to integrate the PDF Generator library into your project to generate PDFs from JSON templates.

---

## 📦 1. Add the Dependency

### Gradle (Kotlin DSL)
```kotlin
dependencies {
    implementation(files("libs/open-pdf-generator-1.0.0-standalone.jar"))
}
```

### Gradle (Groovy)
```groovy
dependencies {
    implementation files('libs/open-pdf-generator-1.0.0-standalone.jar')
}
```

### Maven
```xml
<dependency>
    <groupId>com.pdfgenerator</groupId>
    <artifactId>pdf-generator</artifactId>
    <version>1.0.0</version>
    <scope>system</scope>
    <systemPath>${project.basedir}/libs/open-pdf-generator-1.0.0-standalone.jar</systemPath>
</dependency>
```

---

## 📁 2. Project Structure

```
your-project/
├── src/
│   ├── main/
│   │   ├── kotlin/
│   │   │   └── com/yourcompany/
│   │   │       └── InvoiceService.kt
│   │   └── resources/
│   │       └── templates/
│   │           ├── invoice.json        # Template created in Editor
│   │           └── logos/
│   │               └── logo.png        # Images used in template
│   └── test/
│       └── resources/
│           └── data/
│               └── sample_data.json    # Test data
├── libs/
│   └── open-pdf-generator-1.0.0-standalone.jar
└── build.gradle.kts
```

---

## 🎨 3. Create the Template

Use the **PDF Template Editor** (desktop app) to create your template visually, or edit the JSON directly.

### Template Example (`resources/templates/invoice.json`):
```json
{
  "version": "1.0",
  "pageSettings": {
    "size": "A4",
    "orientation": "portrait",
    "margins": { "top": 30, "right": 30, "bottom": 30, "left": 30 }
  },
  "pageElements": [
    {
      "type": "text",
      "id": "company-name",
      "x": 50,
      "y": 50,
      "width": 200,
      "height": 30,
      "dataBinding": "company.name",
      "style": { "fontSize": 18, "fontWeight": "bold" }
    },
    {
      "type": "text",
      "id": "invoice-number",
      "x": 400,
      "y": 50,
      "width": 150,
      "height": 20,
      "dataBinding": "invoiceNumber",
      "style": { "fontSize": 12, "alignment": "right" }
    },
    {
      "type": "table",
      "id": "items-table",
      "x": 0,
      "y": 100,
      "width": "100%",
      "dataBinding": "items",
      "columns": [
        { "header": "Description", "field": "description", "width": 300 },
        { "header": "Qty", "field": "quantity", "width": 80, "alignment": "center" },
        { "header": "Price", "field": "price | currency:'USD'", "width": 100, "alignment": "right" },
        { "header": "Total", "field": "total | currency:'USD'", "width": 100, "alignment": "right" }
      ]
    }
  ]
}
```

---

## 💻 4. Use in Code

### Kotlin
```kotlin
import com.pdfgenerator.PDFGenerator
import com.pdfgenerator.PDFGeneratorConfig
import com.pdfgenerator.template.Template
import java.io.File

class InvoiceService {
    
    private val generator = PDFGenerator(
        PDFGeneratorConfig(
            resourcesDirectory = File("src/main/resources")
        )
    )
    
    // Template cache (load once, use many times)
    private val invoiceTemplate: Template by lazy {
        Template.fromResource("/templates/invoice.json")
    }
    
    /**
     * Generate invoice PDF from data
     */
    fun generateInvoice(invoiceData: InvoiceData): ByteArray {
        val data = mapOf(
            "company" to mapOf(
                "name" to invoiceData.companyName,
                "taxId" to invoiceData.companyTaxId
            ),
            "invoiceNumber" to invoiceData.number,
            "issueDate" to invoiceData.date,
            "items" to invoiceData.items.map { item ->
                mapOf(
                    "description" to item.description,
                    "quantity" to item.quantity,
                    "price" to item.price,
                    "total" to item.quantity * item.price
                )
            },
            "total" to invoiceData.items.sumOf { it.quantity * it.price }
        )
        
        return generator.generate(invoiceTemplate, data)
    }
    
    /**
     * Generate and save PDF to file
     */
    fun generateAndSave(invoiceData: InvoiceData, outputPath: String) {
        val pdfBytes = generateInvoice(invoiceData)
        File(outputPath).writeBytes(pdfBytes)
    }
}

// Data classes
data class InvoiceData(
    val companyName: String,
    val companyTaxId: String,
    val number: String,
    val date: String,
    val items: List<InvoiceItem>
)

data class InvoiceItem(
    val description: String,
    val quantity: Int,
    val price: Double
)
```

### Java
```java
import com.pdfgenerator.PDFGenerator;
import com.pdfgenerator.PDFGeneratorConfig;
import com.pdfgenerator.template.Template;
import java.io.File;
import java.util.*;

public class InvoiceService {
    
    private final PDFGenerator generator;
    private final Template invoiceTemplate;
    
    public InvoiceService() {
        PDFGeneratorConfig config = new PDFGeneratorConfig(
            null,  // fontDirectory
            "Helvetica",  // defaultFont
            false,  // strictMode
            new File("src/main/resources")  // resourcesDirectory
        );
        
        this.generator = new PDFGenerator(config);
        this.invoiceTemplate = Template.Companion.fromResource("/templates/invoice.json");
    }
    
    public byte[] generateInvoice(Map<String, Object> data) {
        return generator.generate(invoiceTemplate, data);
    }
}
```

---

## 🧪 5. Test Template via CLI

During development, you can test template changes without restarting your application:

### Create test data file (`test/resources/data/test_invoice.json`):
```json
{
  "company": {
    "name": "My Company Ltd",
    "taxId": "12-3456789"
  },
  "invoiceNumber": "INV-2024-001",
  "issueDate": "2024-12-01",
  "items": [
    { "description": "Product A", "quantity": 2, "price": 100.00, "total": 200.00 },
    { "description": "Product B", "quantity": 1, "price": 150.00, "total": 150.00 }
  ],
  "total": 350.00
}
```

### Generate test PDF:
```bash
# Option 1: Via JAR
java -jar libs/open-pdf-generator-1.0.0-standalone.jar \
  generate src/main/resources/templates/invoice.json \
  -d src/test/resources/data/test_invoice.json \
  -o build/test_invoice.pdf

# Option 2: Add task to your build.gradle.kts
```

### Gradle task for your project:
```kotlin
// build.gradle.kts
tasks.register<JavaExec>("testPdf") {
    group = "pdf"
    description = "Test PDF generation with template and sample data"
    
    mainClass.set("io.pdfgenerator.cli.MainKt")
    classpath = files("libs/open-pdf-generator-1.0.0-standalone.jar")
    
    args = listOf(
        "generate",
        "src/main/resources/templates/invoice.json",
        "-d", "src/test/resources/data/test_invoice.json",
        "-o", "build/test_invoice.pdf"
    )
    
    doLast {
        // Open PDF automatically (macOS)
        exec { commandLine("open", "build/test_invoice.pdf") }
    }
}
```

Usage:
```bash
./gradlew testPdf
```

---

## 🔄 6. Recommended Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│  1. DESIGN                                                       │
│     └─ Use PDF Template Editor to create/edit template          │
│        └─ Save as: src/main/resources/templates/invoice.json    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. QUICK TEST                                                   │
│     └─ ./gradlew testPdf                                         │
│        └─ Preview generated PDF                                  │
│        └─ Adjust template if needed                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. INTEGRATION                                                  │
│     └─ Use PDFGenerator in your code                             │
│     └─ Pass real data from your application                      │
│     └─ Return PDF as byte[] or save to file                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. PRODUCTION                                                   │
│     └─ Cache Template for performance                            │
│     └─ Stream to HTTP response if needed                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🌐 7. Spring Boot Example

```kotlin
@RestController
@RequestMapping("/api/invoices")
class InvoiceController(
    private val invoiceService: InvoiceService
) {
    
    @GetMapping("/{id}/pdf")
    fun downloadPdf(@PathVariable id: Long): ResponseEntity<ByteArray> {
        val invoice = invoiceService.findById(id)
        val pdfBytes = invoiceService.generatePdf(invoice)
        
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice-$id.pdf")
            .contentType(MediaType.APPLICATION_PDF)
            .body(pdfBytes)
    }
}

@Service
class InvoiceService(
    private val invoiceRepository: InvoiceRepository
) {
    private val pdfGenerator = PDFGenerator()
    private val template = Template.fromResource("/templates/invoice.json")
    
    fun generatePdf(invoice: Invoice): ByteArray {
        val data = invoice.toTemplateData()
        return pdfGenerator.generate(template, data)
    }
}
```

---

## 📝 Tips

1. **Cache the Template**: Load once and reuse
2. **Test with CLI**: Use terminal command to iterate quickly on design
3. **Relative Resources**: Place images in `resources/templates/` and use relative paths
4. **Data Binding**: Use expressions like `field | currency:'USD'` for automatic formatting

---

## 🆘 Troubleshooting

### PDF can't find images
- Verify that `resourcesDirectory` is configured correctly
- Use paths relative to `resourcesDirectory`

### Font not found
- Use standard fonts: `Helvetica`, `Times`, `Courier`
- Or configure `fontDirectory` with custom fonts

### Invalid template
- Use PDF Template Editor to validate JSON
- Verify all required fields are present
