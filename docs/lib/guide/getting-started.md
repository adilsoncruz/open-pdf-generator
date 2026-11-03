# Getting Started

Welcome to PDF Generator Library! This guide will help you create your first PDF in minutes.

## Installation

Add the JitPack repository and dependency to your project:

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

## Your First PDF

Let's create a simple PDF with a title:

```kotlin
import com.pdfgenerator.PDFGenerator
import com.pdfgenerator.template.Template
import java.io.File

fun main() {
    // 1. Define the template
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
    
    // 2. Load the template
    val template = Template.fromString(templateJson)
    
    // 3. Generate the PDF
    val generator = PDFGenerator()
    generator.generate(template, emptyMap(), File("my-first.pdf"))
    
    println("✅ PDF generated successfully!")
}
```

## Next Steps

Now that you've created your first PDF, continue learning:

- [JSON Templates](/lib/guide/templates) - Understand template structure
- [Data Binding](/lib/guide/data-binding) - Learn to bind dynamic data
- [Elements](/lib/guide/elements/text) - Explore all available elements
- [Examples](/lib/examples/) - See practical examples


