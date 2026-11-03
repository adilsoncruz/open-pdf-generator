# Motor de Generación de PDF

El Motor de Generación de PDF es una librería Kotlin/Java de alto rendimiento para generar PDFs a partir de plantillas JSON.

## Características

- **Plantillas JSON** - Define el layout de tu PDF en JSON
- **Data Binding** - Usa la sintaxis mustache para vincular datos dinámicos
- **Elementos Ricos** - Texto, imágenes, tablas, códigos de barra y más
- **Múltiples Páginas** - Paginación automática con encabezados y pies de página
- **Alto Rendimiento** - Optimizado para velocidad y eficiencia de memoria

## Ejemplo Rápido

```kotlin
val template = """
{
  "page": { "format": "A4" },
  "body": {
    "elements": [
      { "type": "text", "x": 10, "y": 10, "text": "Hello, {{name}}!" }
    ]
  }
}
"""

val data = mapOf("name" to "World")
val pdf = PDFGenerator().generate(template, data)
```

## Primeros Pasos

1. [Instalación](/es/lib/guide/installation) - Agrega la librería a tu proyecto
2. [Primeros Pasos](/es/lib/guide/first-steps) - Crea tu primer PDF
3. [Plantillas](/es/lib/guide/templates) - Aprende el formato de plantillas
4. [Data Binding](/lib/guide/data-binding) - Conecta datos a tus plantillas

## Instalación

### Gradle (Kotlin DSL)

```kotlin
repositories {
    maven { url = uri("https://jitpack.io") }
}

dependencies {
    implementation("io.github.adilsoncruz:open-pdf-generator:1.0.0")
}
```

### Maven

```xml
<repositories>
    <repository>
        <id>jitpack.io</id>
        <url>https://jitpack.io</url>
    </repository>
</repositories>

<dependency>
    <groupId>io.github.adilsoncruz</groupId>
    <artifactId>open-pdf-generator</artifactId>
    <version>1.0.0</version>
</dependency>
```

## Elementos Soportados

| Elemento | Descripción |
|----------|-------------|
| [Texto](/lib/guide/elements/text) | Texto estático o dinámico con formato |
| [Imagen](/lib/guide/elements/image) | Imágenes rasterizadas (PNG, JPG) o vectoriales (SVG) |
| [Tabla](/lib/guide/elements/table) | Tablas de datos con encabezados y filas dinámicas |
| [Rectángulo](/lib/guide/elements/rectangle) | Formas con bordes y colores de relleno |
| [Línea](/lib/guide/elements/line) | Líneas horizontales, verticales o diagonales |
| [Código de Barra](/lib/guide/elements/barcode) | Códigos QR y varios formatos de código de barra |
| [Loop](/lib/guide/elements/loop) | Repite elementos para cada ítem de un array |
| [Condicional](/lib/guide/elements/conditional) | Muestra/oculta elementos según condiciones |
