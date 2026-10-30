# Validación de Esquema

Open PDF Generator incorpora **validación de JSON Schema** para garantizar que los datos pasados a tus plantillas cumplan los contratos estructurales antes de que ocurra cualquier renderización.

---

## ¿Por Qué Validar los Datos?

Las plantillas dependen de modelos de datos específicos (por ejemplo, objetos anidados, cadenas obligatorias, listas de elementos). Sin validación, las propiedades faltantes o los tipos incorrectos pueden provocar bloques de texto vacíos, cálculos rotos o distorsiones inesperadas en el layout.

Con la validación de esquema:
- La estructura de los datos se verifica por adelantado, antes de comenzar el layout del documento.
- Los errores de validación detallados señalan las rutas exactas (por ejemplo, `#/customer/email`).
- Los payloads inválidos se rechazan desde el principio con una descriptiva `PDFSchemaValidationException`.

---

## Especificaciones Soportadas

El motor de validación soporta las especificaciones estándar de JSON Schema:
- **Draft-07** (predeterminado)
- **Draft 2020-12**

Puedes declarar explícitamente tu dialecto usando la palabra clave `$schema` en la definición de tu esquema:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": { ... }
}
```

---

## Definir un Esquema en una Plantilla

Añade una propiedad `"schema"` en el nivel superior del JSON de tu plantilla:

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

## Generación y Manejo de Errores

Al llamar a `PDFGenerator.generate(...)`, si la plantilla contiene un `schema`, los datos de entrada se validan automáticamente. Si la validación falla, se lanza una `PDFSchemaValidationException`:

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

### Estructura de SchemaValidationError

Cada error en `e.errors` contiene:

| Propiedad | Tipo | Descripción |
|---|---|---|
| `path` | `String` | Puntero JSON / ubicación de la instancia del campo problemático (por ejemplo, `#/customer/email` o `$.customer.email`) |
| `message` | `String` | Explicación legible de la falla de validación |
| `keyword` | `String?` | Palabra clave de la restricción del esquema que falló (por ejemplo, `required`, `pattern`, `minimum`) |

---

## Validación Independiente

También puedes usar `SchemaValidator` de forma independiente a la generación de documentos:

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

Para validar que un esquema cumpla con el meta-esquema:

```kotlin
// Throws IllegalArgumentException if the schema definition is invalid
SchemaValidator.validateSchema(schema)
```

---

## Soporte en el Editor de Plantillas

El **Editor Visual de Plantillas PDF** ofrece soporte de primer nivel para esquemas:

1. **Modal del Editor de Esquemas (`{ }`)**:
   - Haz clic en el icono `{ }` de la barra de herramientas superior para ver y editar el JSON Schema.
   - Incluye resaltado de sintaxis integrado, números de línea, diagnóstico de errores y embellecedor de JSON.
2. **Validación de Datos en Vivo**:
   - El editor valida continuamente el payload de Datos de Prueba actual contra el esquema activo, marcando las violaciones con resaltados de error a nivel de línea.
3. **Inferir Esquema desde los Datos de Prueba**:
   - ¿Trabajas a la inversa? Haz clic en **Infer from Test Data** para generar automáticamente un esquema válido a partir de un JSON de ejemplo existente.
4. **Generar Datos Mock**:
   - Haz clic en **Generate Mock Data** para sintetizar valores mock aleatorios y realistas que coincidan con los tipos, formatos, patrones regex y límites anidados de tu esquema, con un solo clic.
