# Engine PDF Generator

A Engine PDF Generator é uma biblioteca Kotlin/Java de alta performance para gerar PDFs a partir de templates JSON.

## Funcionalidades

- **Templates JSON** - Defina o layout do seu PDF em JSON
- **Data Binding** - Use sintaxe mustache para vincular dados dinâmicos
- **Elementos Ricos** - Texto, imagens, tabelas, códigos de barra e mais
- **Múltiplas Páginas** - Paginação automática com headers e footers
- **Alta Performance** - Otimizado para velocidade e eficiência de memória

## Exemplo Rápido

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

## Primeiros Passos

1. [Instalação](./guide/installation.md) - Adicione a biblioteca ao seu projeto
2. [Primeiros Passos](./guide/first-steps.md) - Crie seu primeiro PDF
3. [Templates](./guide/templates.md) - Aprenda o formato de templates
4. [Data Binding](/lib/guide/data-binding) - Conecte dados aos seus templates

## Instalação

### Gradle (Kotlin DSL)

```kotlin
repositories {
    maven { url = uri("https://jitpack.io") }
}

dependencies {
    implementation("com.github.adilsoncruz:open-pdf-generator:1.0.0")
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
    <groupId>com.github.adilsoncruz</groupId>
    <artifactId>open-pdf-generator</artifactId>
    <version>1.0.0</version>
</dependency>
```

## Elementos Suportados

| Elemento | Descrição |
|----------|-----------|
| [Text](/lib/guide/elements/text) | Texto estático ou dinâmico com formatação |
| [Image](/lib/guide/elements/image) | Imagens raster (PNG, JPG) ou vetoriais (SVG) |
| [Table](/lib/guide/elements/table) | Tabelas de dados com headers e linhas dinâmicas |
| [Rectangle](/lib/guide/elements/rectangle) | Formas com bordas e cores de preenchimento |
| [Line](/lib/guide/elements/line) | Linhas horizontais, verticais ou diagonais |
| [Barcode](/lib/guide/elements/barcode) | QR Codes e vários formatos de código de barra |
| [Loop](/lib/guide/elements/loop) | Repetição de elementos para cada item de um array |
| [Conditional](/lib/guide/elements/conditional) | Exibir/ocultar elementos com base em condições |

## Próximos Passos

- [Guia de Início Rápido](./guide/getting-started.md)
- [Referência da API](/lib/api/pdf-generator)
- [Exemplos](/lib/examples/)
