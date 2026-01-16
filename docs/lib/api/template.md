# Template

Class representing a loaded and validated PDF template.

## Import

```kotlin
import com.pdfgenerator.template.Template
```

```java
import com.pdfgenerator.template.Template;
```

---

## Static Methods (Factory)

### fromFile()

Loads template from a JSON file.

```kotlin
val template = Template.fromFile(File("template.json"))
```

```java
Template template = Template.fromFile(new File("template.json"));
```

### fromString()

Loads template from a JSON string.

```kotlin
val json = """
{
  "version": "1.0",
  "pageSettings": { ... },
  "pageElements": [ ... ]
}
"""
val template = Template.fromString(json)
```

### fromResource()

Loads template from a classpath resource.

```kotlin
val template = Template.fromResource("/templates/invoice.json")
```

**Expected structure:**
```
src/main/resources/
└── templates/
    └── invoice.json
```

### fromInputStream()

Loads template from an InputStream.

```kotlin
val inputStream = FileInputStream("template.json")
val template = Template.fromInputStream(inputStream)
```

---

## Properties

### version

Template format version.

```kotlin
val version = template.version // "1.0"
```

### pageSettings

Page settings.

```kotlin
val page = template.pageSettings

println(page.size)        // "A4"
println(page.orientation) // "portrait"
println(page.margins)     // Margins(top=30, right=30, bottom=30, left=30)
```

### elements

List of document body elements.

```kotlin
val elements = template.elements
elements.forEach { element ->
    println("${element.type}: ${element.id}")
}
```

### fixedHeader

Fixed header (optional).

```kotlin
template.fixedHeader?.let { header ->
    println("Header height: ${header.height}")
    println("Header elements: ${header.elements.size}")
}
```

### fixedFooter

Fixed footer (optional).

```kotlin
template.fixedFooter?.let { footer ->
    println("Footer height: ${footer.height}")
    println("Footer elements: ${footer.elements.size}")
}
```

---

## Methods

### validate()

Validates the template and returns a list of errors.

```kotlin
val errors = template.validate()

if (errors.isEmpty()) {
    println("Valid template!")
} else {
    errors.forEach { error ->
        println("Error in ${error.elementId}: ${error.message}")
    }
}
```

#### ValidationError

```kotlin
data class ValidationError(
    val elementId: String,
    val message: String
)
```

### toJson()

Converts template back to JSON.

```kotlin
val json = template.toJson()
File("backup.json").writeText(json)
```

### copy()

Creates a copy of the template (allows modifications).

```kotlin
val copy = template.copy(
    pageSettings = template.pageSettings.copy(
        orientation = "landscape"
    )
)
```

---

## JSON Structure

### Minimum Structure

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
  "pageElements": []
}
```

### Complete Structure

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
  "fixedHeader": {
    "height": 80,
    "elements": [...]
  },
  "fixedFooter": {
    "height": 50,
    "elements": [...]
  },
  "pageElements": [...]
}
```

---

## PageSettings

### Properties

| Property | Type | Values | Default |
|----------|------|--------|---------|
| `size` | string | `A4`, `Letter`, `Legal` | `A4` |
| `orientation` | string | `portrait`, `landscape` | `portrait` |
| `margins` | Margins | object | `{top:30, right:30, bottom:30, left:30}` |

### Page Sizes

| Size | Width | Height | Usage |
|------|-------|--------|-------|
| `A4` | 595pt | 842pt | International standard |
| `Letter` | 612pt | 792pt | US standard |
| `Legal` | 612pt | 1008pt | US legal documents |

### Example

```json
{
  "pageSettings": {
    "size": "A4",
    "orientation": "landscape",
    "margins": {
      "top": 20,
      "right": 40,
      "bottom": 20,
      "left": 40
    }
  }
}
```

---

## Examples

### Load and Validate

```kotlin
val template = Template.fromFile(File("template.json"))

val errors = template.validate()
if (errors.isNotEmpty()) {
    throw IllegalArgumentException(
        "Invalid template: ${errors.joinToString { it.message }}"
    )
}
```

### Template Cache

```kotlin
object TemplateCache {
    private val cache = mutableMapOf<String, Template>()
    
    fun get(name: String): Template {
        return cache.getOrPut(name) {
            Template.fromResource("/templates/$name.json")
        }
    }
    
    fun clear() = cache.clear()
}

// Usage
val template = TemplateCache.get("invoice")
```

### Modify Template at Runtime

```kotlin
val baseTemplate = Template.fromFile(File("base.json"))

// Create landscape version
val landscapeTemplate = baseTemplate.copy(
    pageSettings = baseTemplate.pageSettings.copy(
        orientation = "landscape"
    )
)
```

---

## Exceptions

| Exception | Cause |
|-----------|-------|
| `JsonParseException` | Invalid JSON |
| `FileNotFoundException` | File not found |
| `TemplateValidationException` | Invalid structure |

---

## Next Steps

- [TemplateBuilder](/lib/api/template-builder) - Create templates programmatically
- [Elements](/lib/api/elements) - Element types
- [PDFGenerator](/lib/api/pdf-generator) - Generate PDF

