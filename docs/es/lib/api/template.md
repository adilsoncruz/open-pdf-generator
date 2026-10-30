# Template

Clase que representa una plantilla PDF cargada y validada.

## Import

```kotlin
import com.pdfgenerator.template.Template
```

```java
import com.pdfgenerator.template.Template;
```

---

## Métodos estáticos (factory)

### fromFile()

Carga una plantilla desde un archivo JSON.

```kotlin
val template = Template.fromFile(File("template.json"))
```

```java
Template template = Template.fromFile(new File("template.json"));
```

### fromString()

Carga una plantilla desde un string JSON.

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

Carga una plantilla desde un recurso del classpath.

```kotlin
val template = Template.fromResource("/templates/invoice.json")
```

**Estructura esperada:**
```
src/main/resources/
└── templates/
    └── invoice.json
```

### fromInputStream()

Carga una plantilla desde un InputStream.

```kotlin
val inputStream = FileInputStream("template.json")
val template = Template.fromInputStream(inputStream)
```

---

## Propiedades

### version

Versión del formato de la plantilla.

```kotlin
val version = template.version // "1.0"
```

### pageSettings

Configuración de la página.

```kotlin
val page = template.pageSettings

println(page.size)        // "A4"
println(page.orientation) // "portrait"
println(page.margins)     // Margins(top=30, right=30, bottom=30, left=30)
```

### elements

Lista de elementos del cuerpo del documento.

```kotlin
val elements = template.elements
elements.forEach { element ->
    println("${element.type}: ${element.id}")
}
```

### fixedHeader

Encabezado fijo (opcional).

```kotlin
template.fixedHeader?.let { header ->
    println("Header height: ${header.height}")
    println("Header elements: ${header.elements.size}")
}
```

### fixedFooter

Pie de página fijo (opcional).

```kotlin
template.fixedFooter?.let { footer ->
    println("Footer height: ${footer.height}")
    println("Footer elements: ${footer.elements.size}")
}
```

---

## Métodos

### validate()

Valida la plantilla y devuelve una lista de errores.

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

Convierte la plantilla de vuelta a JSON.

```kotlin
val json = template.toJson()
File("backup.json").writeText(json)
```

### copy()

Crea una copia de la plantilla (permite modificaciones).

```kotlin
val copy = template.copy(
    pageSettings = template.pageSettings.copy(
        orientation = "landscape"
    )
)
```

---

## Estructura JSON

### Estructura mínima

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

### Estructura completa

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

### Propiedades

| Propiedad | Tipo | Valores | Predeterminado |
|----------|------|--------|---------|
| `size` | string | `A4`, `Letter`, `Legal` | `A4` |
| `orientation` | string | `portrait`, `landscape` | `portrait` |
| `margins` | Margins | objeto | `{top:30, right:30, bottom:30, left:30}` |

### Tamaños de página

| Tamaño | Ancho | Alto | Uso |
|------|-------|--------|-------|
| `A4` | 595pt | 842pt | Estándar internacional |
| `Letter` | 612pt | 792pt | Estándar de EE. UU. |
| `Legal` | 612pt | 1008pt | Documentos legales de EE. UU. |

### Ejemplo

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

## Ejemplos

### Cargar y validar

```kotlin
val template = Template.fromFile(File("template.json"))

val errors = template.validate()
if (errors.isNotEmpty()) {
    throw IllegalArgumentException(
        "Invalid template: ${errors.joinToString { it.message }}"
    )
}
```

### Caché de plantillas

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

// Uso
val template = TemplateCache.get("invoice")
```

### Modificar la plantilla en runtime

```kotlin
val baseTemplate = Template.fromFile(File("base.json"))

// Crear versión horizontal
val landscapeTemplate = baseTemplate.copy(
    pageSettings = baseTemplate.pageSettings.copy(
        orientation = "landscape"
    )
)
```

---

## Excepciones

| Excepción | Causa |
|-----------|-------|
| `JsonParseException` | JSON inválido |
| `FileNotFoundException` | Archivo no encontrado |
| `TemplateValidationException` | Estructura inválida |

---

## Próximos pasos

- [TemplateBuilder](/es/lib/api/template-builder) - Crear plantillas programáticamente
- [Elements](/es/lib/api/elements) - Tipos de elementos
- [PDFGenerator](/es/lib/api/pdf-generator) - Generar PDF
