---
layout: home

hero:
  name: Open PDF Generator
  text: Gere PDFs a partir de Templates JSON
  tagline: Um poderoso toolkit open-source para criar PDFs dinâmicos com Kotlin/Java
  image:
    src: /icon.png
    alt: Open PDF Generator
  actions:
    - theme: brand
      text: Começar Agora
      link: /pt/lib/guide/getting-started
    - theme: alt
      text: ⚡ Benchmark 2.5x vs Jasper
      link: /lib/benchmark
    - theme: alt
      text: GitHub
      link: https://github.com/adilsoncruz/open-pdf-generator

features:
  - icon:
      src: /icons/library.svg
    title: Biblioteca Geradora de PDF
    details: Biblioteca Kotlin/Java de alta performance para gerar PDFs a partir de templates JSON, com data binding e conteúdo dinâmico.
    link: /pt/lib/
    linkText: Explorar a Biblioteca

  - icon:
      src: /icons/editor.svg
    title: Editor Visual de Templates
    details: Aplicação desktop com o design system Studio Slate, multi-abas, canvas com arrastar e soltar e pré-visualização de PDF em tempo real.
    link: /editor/index.html
    linkText: Explorar o Editor

  - icon:
      src: /icons/terminal.svg
    title: Interface de Linha de Comando
    details: Gere PDFs direto do terminal para automação, pipelines de CI/CD e workflows de scripting.
    link: /pt/cli/
    linkText: Conhecer a CLI

  - icon:
      src: /icons/speed.svg
    title: 2.5x Mais Rápido que JasperReports
    details: 8.650 docs/seg em containers, cold-start de 195ms (4.3x mais rápido) e footprint de 4.0MB. Zero travamentos de GC sob estresse de 100 mil documentos.
    link: /lib/benchmark
    linkText: Ver Relatório de Benchmark

  - icon:
      src: /icons/code.svg
    title: Data Binding & Condições
    details: Use sintaxe mustache e pipes para formatar dados, além de condições booleanas para exibir ou ocultar elementos e grupos dinamicamente.

  - icon:
      src: /icons/grid.svg
    title: Elementos & Layouts Ricos
    details: Containers, tabelas, textos, loops, quebras de página, formas, códigos de barra, marcas d'água e páginas de resumo com estilização completa.
---

## Exemplo Rápido

Crie um PDF de fatura simples com apenas algumas linhas de código:

::: code-group

```kotlin [Kotlin]
val template = """
{
  "page": { "format": "A4" },
  "body": {
    "elements": [
      { "type": "text", "x": 10, "y": 10, "text": "Invoice #{{invoiceNumber}}" },
      { "type": "text", "x": 10, "y": 25, "text": "Customer: {{customer.name}}" }
    ]
  }
}
"""

val data = mapOf(
  "invoiceNumber" to "INV-001",
  "customer" to mapOf("name" to "John Doe")
)

val pdf = PDFGenerator().generate(template, data)
File("invoice.pdf").writeBytes(pdf)
```

```java [Java]
String template = """
{
  "page": { "format": "A4" },
  "body": {
    "elements": [
      { "type": "text", "x": 10, "y": 10, "text": "Invoice #{{invoiceNumber}}" },
      { "type": "text", "x": 10, "y": 25, "text": "Customer: {{customer.name}}" }
    ]
  }
}
""";

Map<String, Object> data = Map.of(
  "invoiceNumber", "INV-001",
  "customer", Map.of("name", "John Doe")
);

byte[] pdf = new PDFGenerator().generate(template, data);
Files.write(Path.of("invoice.pdf"), pdf);
```

:::

## Instalação

Adicione ao seu projeto com Gradle ou Maven:

::: code-group

```kotlin [Gradle (Kotlin)]
repositories {
    maven { url = uri("https://jitpack.io") }
}

dependencies {
    implementation("com.github.adilsoncruz:open-pdf-generator:1.0.0")
}
```

```groovy [Gradle (Groovy)]
repositories {
    maven { url 'https://jitpack.io' }
}

dependencies {
    implementation 'com.github.adilsoncruz:open-pdf-generator:1.0.0'
}
```

```xml [Maven]
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

:::

## Próximos Passos

<div class="vp-doc">

| Caminho | Descrição |
|---------|-----------|
| [⚡ Benchmark (vs JasperReports)](/lib/benchmark) | Teste de estresse com 100 mil faturas, latência, throughput, memória e economia FinOps |
| [Documentação da Engine](/pt/lib/) | Aprenda a usar a biblioteca PDF Generator |
| [Documentação do Editor](/editor/index.html) | Crie templates visualmente com o aplicativo desktop |
| [Exemplos](/lib/examples/) | Exemplos de templates do mundo real |

</div>

## Apoie o Projeto

O Open PDF Generator é totalmente gratuito e de código aberto. Se este projeto ajuda você ou sua equipe a criar documentos melhores, considere patrocinar o desenvolvimento contínuo:

<div style="margin: 20px 0; display: flex; gap: 12px; flex-wrap: wrap;">
  <a 
    href="https://github.com/sponsors/adilsoncruz" 
    target="_blank"
    rel="noopener noreferrer"
    style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: linear-gradient(135deg, #ec4899, #db2777); color: white; border-radius: 10px; font-weight: 600; text-decoration: none; box-shadow: 0 4px 14px rgba(219, 39, 119, 0.35);"
  >
    💖 Patrocinar no GitHub
  </a>
  <a 
    href="https://buymeacoffee.com/adilsoncruz" 
    target="_blank"
    rel="noopener noreferrer"
    style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: linear-gradient(135deg, #FFDD00, #FBBF24); color: #000000; border-radius: 10px; font-weight: 600; text-decoration: none; box-shadow: 0 4px 14px rgba(251, 191, 36, 0.35);"
  >
    ☕ Buy Me a Coffee
  </a>
</div>
