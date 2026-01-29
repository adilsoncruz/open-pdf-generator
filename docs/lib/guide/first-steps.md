# First Steps

Learn to generate your first PDF in 5 minutes.

## 1. Create the Template

Create a file `my-template.json`:

```json
{
  "version": "1.0",
  "pageSettings": {
    "size": "A4",
    "orientation": "portrait",
    "margins": {
      "top": 30,
      "right": 30,
      "bottom": 30,
      "left": 30
    }
  },
  "pageElements": [
    {
      "type": "text",
      "id": "title",
      "x": 50,
      "y": 50,
      "value": "My First PDF",
      "style": {
        "fontSize": 24,
        "fontWeight": "bold",
        "color": "#2563eb"
      }
    },
    {
      "type": "text",
      "id": "message",
      "x": 50,
      "y": 100,
      "value": "Hello, {{name}}! This PDF was generated automatically.",
      "style": {
        "fontSize": 14,
        "color": "#374151"
      }
    },
    {
      "type": "text",
      "id": "date",
      "x": 50,
      "y": 140,
      "dataBinding": "currentDate | date:'MM/dd/yyyy HH:mm'",
      "style": {
        "fontSize": 10,
        "color": "#6b7280"
      }
    }
  ]
}
```

---

## 2. Prepare the Data

```kotlin
val data = mapOf(
    "name" to "John Smith",
    "currentDate" to java.util.Date()
)
```

Or via JSON:

```json
{
  "name": "John Smith",
  "currentDate": "2025-12-02T10:30:00"
}
```

---

## 3. Generate the PDF

### Kotlin

```kotlin
import com.pdfgenerator.PDFGenerator
import com.pdfgenerator.template.Template
import java.io.File

fun main() {
    // Load template
    val templateFile = File("my-template.json")
    val template = Template.fromFile(templateFile)
    
    // Prepare data
    val data = mapOf(
        "name" to "John Smith",
        "currentDate" to java.util.Date()
    )
    
    // Generate PDF
    val generator = PDFGenerator()
    val outputFile = File("output/my-first.pdf")
    outputFile.parentFile?.mkdirs()
    
    generator.generate(template, data, outputFile)
    
    println("✅ PDF generated: ${outputFile.absolutePath}")
}
```

### Java

```java
import com.pdfgenerator.PDFGenerator;
import com.pdfgenerator.template.Template;
import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.util.Date;

public class Main {
    public static void main(String[] args) {
        // Load template
        File templateFile = new File("my-template.json");
        Template template = Template.fromFile(templateFile);
        
        // Prepare data
        Map<String, Object> data = new HashMap<>();
        data.put("name", "John Smith");
        data.put("currentDate", new Date());
        
        // Generate PDF
        PDFGenerator generator = new PDFGenerator();
        File outputFile = new File("output/my-first.pdf");
        outputFile.getParentFile().mkdirs();
        
        generator.generate(template, data, outputFile);
        
        System.out.println("✅ PDF generated: " + outputFile.getAbsolutePath());
    }
}
```

---

## 4. Result

The generated PDF will have:

```
┌─────────────────────────────────────────┐
│                                         │
│  My First PDF                           │
│                                         │
│  Hello, John Smith! This PDF was        │
│  generated automatically.               │
│                                         │
│  12/02/2025 10:30                       │
│                                         │
│                                         │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

---

## Complete Example: Simple Invoice

### Template (`simple-invoice.json`)

```json
{
  "version": "1.0",
  "pageSettings": {
    "size": "A4",
    "orientation": "portrait",
    "margins": {
      "top": 30,
      "right": 30,
      "bottom": 30,
      "left": 30
    }
  },
  "elements": [
    {
      "type": "rectangle",
      "id": "header-bg",
      "x": 0,
      "y": 0,
      "width": 595,
      "height": 80,
      "style": {
        "fillColor": "#1e40af"
      }
    },
    {
      "type": "text",
      "id": "company",
      "x": 30,
      "y": 30,
      "value": "MY COMPANY LLC",
      "style": {
        "fontSize": 18,
        "fontWeight": "bold",
        "color": "#ffffff"
      }
    },
    {
      "type": "text",
      "id": "title",
      "x": 30,
      "y": 110,
      "value": "SERVICE INVOICE",
      "style": {
        "fontSize": 16,
        "fontWeight": "bold"
      }
    },
    {
      "type": "text",
      "id": "number",
      "x": 400,
      "y": 110,
      "dataBinding": "invoice.number | padLeft:6:'0' | prefix:'# '",
      "style": {
        "fontSize": 14,
        "fontWeight": "bold",
        "color": "#1e40af"
      }
    },
    {
      "type": "line",
      "id": "divider1",
      "x": 30,
      "y": 140,
      "width": 565,
      "height": 140,
      "style": {
        "color": "#e5e7eb",
        "width": 1
      }
    },
    {
      "type": "text",
      "id": "customer-label",
      "x": 30,
      "y": 160,
      "value": "CUSTOMER",
      "style": {
        "fontSize": 10,
        "fontWeight": "bold",
        "color": "#6b7280"
      }
    },
    {
      "type": "text",
      "id": "customer-name",
      "x": 30,
      "y": 180,
      "dataBinding": "customer.name | upperCase",
      "style": {
        "fontSize": 14
      }
    },
    {
      "type": "text",
      "id": "customer-doc",
      "x": 30,
      "y": 200,
      "dataBinding": "customer.document",
      "style": {
        "fontSize": 10,
        "color": "#6b7280"
      }
    },
    {
      "type": "line",
      "id": "divider2",
      "x": 30,
      "y": 230,
      "width": 565,
      "height": 230,
      "style": {
        "color": "#e5e7eb",
        "width": 1
      }
    },
    {
      "type": "table",
      "id": "items",
      "x": 30,
      "y": 250,
      "width": 535,
      "dataBinding": "invoice.items",
      "columns": [
        {
          "header": "Description",
          "field": "$item.description",
          "width": 300,
          "alignment": "left"
        },
        {
          "header": "Qty",
          "field": "$item.quantity",
          "width": 80,
          "alignment": "center"
        },
        {
          "header": "Amount",
          "field": "$item.amount | currency:'USD'",
          "width": 155,
          "alignment": "right"
        }
      ],
      "style": {
        "headerBackground": "#f3f4f6",
        "headerFontWeight": "bold",
        "alternateRowBackground": "#fafafa"
      }
    },
    {
      "type": "text",
      "id": "total-label",
      "x": 350,
      "y": 450,
      "value": "TOTAL:",
      "style": {
        "fontSize": 14,
        "fontWeight": "bold"
      }
    },
    {
      "type": "text",
      "id": "total-amount",
      "x": 450,
      "y": 450,
      "dataBinding": "invoice.total | currency:'USD'",
      "style": {
        "fontSize": 16,
        "fontWeight": "bold",
        "color": "#059669"
      }
    }
  ]
}
```

### Data

```json
{
  "invoice": {
    "number": 123,
    "items": [
      {
        "description": "IT Consulting",
        "quantity": 10,
        "amount": 150.00
      },
      {
        "description": "Software Development",
        "quantity": 40,
        "amount": 200.00
      },
      {
        "description": "Technical Support",
        "quantity": 5,
        "amount": 100.00
      }
    ],
    "total": 10000.00
  },
  "customer": {
    "name": "ABC Company LLC",
    "document": "12-3456789"
  }
}
```

### Code

```kotlin
val template = Template.fromFile(File("simple-invoice.json"))
val data = // load JSON or create Map

val generator = PDFGenerator()
generator.generate(template, data, File("output/invoice.pdf"))
```

---

## Using the CLI

The library also offers a command-line interface:

```bash
# Generate PDF
java -jar pdf-generator.jar \
  --template simple-invoice.json \
  --data data.json \
  --output invoice.pdf

# Or via Gradle
./gradlew generatePdf \
  -Ptemplate=simple-invoice.json \
  -Pdata=data.json \
  -Poutput=invoice.pdf
```

---

## Tips

### 1. Organize Your Templates

```
resources/
└── templates/
    ├── invoices/
    │   ├── simple-invoice.json
    │   └── complete-invoice.json
    └── reports/
        ├── sales.json
        └── inventory.json
```

### 2. Validate the Template

```kotlin
val template = Template.fromFile(file)
val errors = template.validate()
if (errors.isNotEmpty()) {
    errors.forEach { println("⚠️ ${it.message}") }
}
```

### 3. Configure the Generator

```kotlin
val config = PDFGeneratorConfig(
    strictMode = true,        // Errors stop execution
    defaultFontSize = 10f,    // Default font
    debug = false             // Debug logs
)
val generator = PDFGenerator(config)
```

### 4. Use the Visual Editor

For complex templates, use the **PDF Template Editor** (desktop app):

1. Create the layout visually
2. Export as JSON
3. Use in your application

---

## Next Steps

- [Templates](/lib/guide/templates) - Complete JSON structure
- [Data Binding](/lib/guide/data-binding) - Bind dynamic data
- [Transformations](/lib/guide/transformations) - Format data
- [Elements](/lib/guide/elements/text) - All available elements
- [Examples](/lib/examples/) - More advanced examples

