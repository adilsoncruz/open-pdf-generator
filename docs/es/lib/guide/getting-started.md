# Inicio Rápido

¡Bienvenido a la PDF Generator Library! Esta guía te ayudará a crear tu primer PDF en minutos.

## Instalación

Agrega el repositorio de JitPack y la dependencia a tu proyecto:

::: code-group

```kotlin [Gradle (Kotlin DSL)]
repositories {
    mavenCentral()
    maven { url = uri("https://jitpack.io") }
}

dependencies {
    implementation("io.github.adilsoncruz:open-pdf-generator:1.0.0")
}
```

```groovy [Gradle (Groovy)]
repositories {
    mavenCentral()
    maven { url 'https://jitpack.io' }
}

dependencies {
    implementation 'io.github.adilsoncruz:open-pdf-generator:1.0.0'
}
```

```xml [Maven]
<repositories>
    <repository>
        <id>jitpack.io</id>
        <url>https://jitpack.io</url>
    </repository>
</repositories>

<dependencies>
    <dependency>
        <groupId>io.github.adilsoncruz</groupId>
        <artifactId>open-pdf-generator</artifactId>
        <version>1.0.0</version>
    </dependency>
</dependencies>
```

:::

## Tu Primer PDF

Creemos un PDF simple con un título:

```kotlin
import com.pdfgenerator.PDFGenerator
import com.pdfgenerator.template.Template
import java.io.File

fun main() {
    // 1. Definir la plantilla
    val templateJson = """
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
          "type": "text",
          "id": "title",
          "x": 50,
          "y": 50,
          "value": "My First PDF!",
          "style": {
            "fontSize": 24,
            "fontWeight": "bold",
            "color": "#2563eb"
          }
        }
      ]
    }
    """
    
    // 2. Cargar la plantilla
    val template = Template.fromString(templateJson)
    
    // 3. Generar el PDF
    val generator = PDFGenerator()
    generator.generate(template, emptyMap(), File("my-first.pdf"))
    
    println("✅ PDF generated successfully!")
}
```

## Próximos Pasos

Ahora que creaste tu primer PDF, continúa aprendiendo:

- [Plantillas JSON](/es/lib/guide/templates) - Entiende la estructura de las plantillas
- [Data Binding](/lib/guide/data-binding) - Aprende a vincular datos dinámicos
- [Elementos](/lib/guide/elements/text) - Explora todos los elementos disponibles
- [Ejemplos](/lib/examples/) - Ve ejemplos prácticos
