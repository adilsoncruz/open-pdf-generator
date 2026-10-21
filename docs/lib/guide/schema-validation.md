# Schema Validation

Open PDF Generator provides built-in **JSON Schema validation** to guarantee that data passed to your templates satisfies structural contracts before any rendering occurs.

---

## Why Validate Data?

Templates rely on specific data models (e.g. nested objects, required strings, lists of items). Without validation, missing properties or incorrect types can cause empty text blocks, broken math, or unexpected layout distortions.

With schema validation:
- Data structure is verified upfront before document layout begins.
- Detailed validation errors pinpoint exact paths (e.g. `#/customer/email`).
- Invalid payloads are rejected early with a descriptive `PDFSchemaValidationException`.

---

## Supported Specifications

The validation engine supports standard JSON Schema specifications:
- **Draft-07** (default)
- **Draft 2020-12**

You can explicitly declare your dialect using the `$schema` keyword in your schema definition:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": { ... }
}
```

---

## Defining a Schema in a Template

Add a top-level `"schema"` property to your template JSON:

```json
{
  "version": "1.0",
  "metadata": {
    "name": "Invoice Template"
  },
  "pageSettings": {
    "size": "A4",
    "orientation": "portrait"
  },
  "schema": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "required": ["invoiceNumber", "customer", "items"],
    "properties": {
      "invoiceNumber": {
        "type": "string",
        "pattern": "^INV-[0-9]{4,}$"
      },
      "issueDate": {
        "type": "string",
        "format": "date"
      },
      "customer": {
        "type": "object",
        "required": ["name", "email"],
        "properties": {
          "name": { "type": "string", "minLength": 1 },
          "email": { "type": "string", "format": "email" }
        }
      },
      "items": {
        "type": "array",
        "minItems": 1,
        "items": {
          "type": "object",
          "required": ["description", "quantity", "unitPrice"],
          "properties": {
            "description": { "type": "string" },
            "quantity": { "type": "integer", "minimum": 1 },
            "unitPrice": { "type": "number", "minimum": 0 }
          }
        }
      }
    }
  },
  "page": [
    {
      "type": "text",
      "id": "invoice-title",
      "text": "Invoice #{{invoiceNumber}}",
      "style": { "fontSize": 18, "bold": true }
    }
  ]
}
```

---

## Generation & Error Handling

When calling `PDFGenerator.generate(...)`, if the template contains a `schema`, the input data is automatically validated. If validation fails, a `PDFSchemaValidationException` is thrown:

```kotlin
import com.pdfgenerator.api.PDFGenerator
import com.pdfgenerator.api.PDFSchemaValidationException
import com.pdfgenerator.model.Template
import java.io.File

val template = Template.fromFile(File("invoice-template.json"))
val invalidData = mapOf("invoiceNumber" to "123") // Missing required customer and items

try {
    val pdfBytes = PDFGenerator.generate(template, invalidData)
} catch (e: PDFSchemaValidationException) {
    println("Schema validation failed with ${e.errors.size} error(s):")
    e.errors.forEach { err ->
        println(" - [${err.keyword}] at ${err.path}: ${err.message}")
    }
}
```

### SchemaValidationError Structure

Each error in `e.errors` contains:

| Property | Type | Description |
|---|---|---|
| `path` | `String` | JSON pointer / instance location of the offending field (e.g. `#/customer/email` or `$.customer.email`) |
| `message` | `String` | Human-readable explanation of the validation failure |
| `keyword` | `String?` | The schema constraint keyword that failed (e.g. `required`, `pattern`, `minimum`) |

---

## Standalone Validation

You can also use `SchemaValidator` independently from document generation:

```kotlin
import com.pdfgenerator.validator.SchemaValidator

val schema = mapOf(
    "type" to "object",
    "required" to listOf("name"),
    "properties" to mapOf(
        "name" to mapOf("type" to "string")
    )
)

val data = mapOf<String, Any>()

val errors = SchemaValidator.validate(schema, data)
if (errors.isNotEmpty()) {
    println("Invalid payload: ${errors.first().message}")
}
```

To validate that a schema itself conforms to the meta-schema:

```kotlin
// Throws IllegalArgumentException if the schema definition is invalid
SchemaValidator.validateSchema(schema)
```

---

## Template Editor Support

The visual **PDF Template Editor** provides first-class support for schemas:

1. **Schema Editor Modal (`{ }`)**:
   - Click the `{ }` icon in the top toolbar to view and edit the JSON Schema.
   - Built-in syntax highlighting, line numbers, error diagnostics, and JSON prettifier.
2. **Live Data Validation**:
   - The editor continuously validates your current Test Data payload against the active schema, flagging violations with line-level error highlights.
3. **Infer Schema from Test Data**:
   - Working backwards? Click **Infer from Test Data** to automatically generate a compliant schema from existing sample JSON.
4. **Generate Mock Data**:
   - Click **Generate Mock Data** to synthesize random, realistic mock values matching your schema types, formats, regex patterns, and nested bounds with a single click.
