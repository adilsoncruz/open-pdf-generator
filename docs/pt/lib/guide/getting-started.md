# Início rápido

Bem-vindo à PDF Generator Library! Este guia vai ajudar você a criar seu primeiro PDF em poucos minutos.

## Instalação

Adicione o repositório JitPack e a dependência ao seu projeto:

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

## Seu Primeiro PDF

Vamos criar um PDF simples com um título:

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

## Próximos Passos

Agora que você criou seu primeiro PDF, continue aprendendo:

- [Templates JSON](/pt/lib/guide/templates) - Entenda a estrutura de templates
- [Data Binding](/lib/guide/data-binding) - Aprenda a vincular dados dinâmicos
- [Elementos](/lib/guide/elements/text) - Explore todos os elementos disponíveis
- [Exemplos](/lib/examples/) - Veja exemplos práticos
