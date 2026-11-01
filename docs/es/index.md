---
layout: home

hero:
  name: Open PDF Generator
  text: Genera PDFs a partir de Plantillas JSON
  tagline: Un potente toolkit open source para crear PDFs dinámicos con Kotlin/Java
  image:
    src: /icon.png
    alt: Open PDF Generator
  actions:
    - theme: brand
      text: Empezar
      link: /es/lib/guide/getting-started
    - theme: alt
      text: ⚡ Benchmark 2.5x vs Jasper
      link: /lib/benchmark
    - theme: alt
      text: 🚀 Guía Go & Node
      link: /es/cli/examples
    - theme: alt
      text: GitHub
      link: https://github.com/adilsoncruz/open-pdf-generator

features:
  - icon:
      src: /icons/library.svg
    title: Librería de Generación de PDF
    details: Librería Kotlin/Java de alto rendimiento para generar PDFs a partir de plantillas JSON con data binding y contenido dinámico.
    link: /es/lib/
    linkText: Explorar la Librería

  - icon:
      src: /icons/editor.svg
    title: Editor Visual de Plantillas
    details: Aplicación desktop con el design system Studio Slate, múltiples pestañas, canvas con drag-and-drop y previsualización de PDF en tiempo real.
    link: /editor/index.html
    linkText: Explorar el Editor

  - icon:
      src: /icons/terminal.svg
    title: CLI Políglota (Cero Dependencia de Java)
    details: Binario nativo autónomo GraalVM para Linux, macOS y Windows. Integración perfecta con Go, Node.js, Python o Docker con latencia de sub-milisegundo.
    link: /es/cli/examples
    linkText: Guía Go & Node

  - icon:
      src: /icons/speed.svg
    title: 2.5x Más Rápido que JasperReports
    details: 8.650 docs/seg en contenedores, arranque en frío de 195ms (4.3x más rápido) y una huella de solo 4,0MB. Cero bloqueos por GC bajo estrés de 100k documentos.
    link: /lib/benchmark
    linkText: Ver el Reporte de Benchmark

  - icon:
      src: /icons/code.svg
    title: Data Binding y Condiciones
    details: Usa sintaxis mustache y pipes para formatear datos, además de condiciones booleanas para mostrar u ocultar elementos y grupos dinámicamente.

  - icon:
      src: /icons/grid.svg
    title: Elementos y Layouts Ricos
    details: Contenedores, tablas, texto, loops, saltos de página, formas, códigos de barra, marcas de agua y páginas de resumen con estilización completa.
---

## Ejemplo Rápido

Crea un PDF de factura simple con solo unas pocas líneas de código:

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

```go [Go (Native Serve)]
// ¡Sin necesidad de Java! Usa binario nativo autónomo con ~0.60ms de latencia (9.6x más rápido que Maroto)
package main

import (
    "os/exec"
    "log"
)

func main() {
    cmd := exec.Command("pdf-generator", "generate", "invoice.json", "-d", "data.json", "-o", "invoice.pdf")
    if err := cmd.Run(); err != nil {
        log.Fatal(err)
    }
}
```

```javascript [Node.js (Native Serve)]
// ¡Sin necesidad de Java! Usa binario nativo autónomo con ~0.57ms de latencia (12.2x más rápido que pdfmake)
import { execFileSync } from 'node:child_process';

execFileSync('pdf-generator', [
  'generate', 'invoice.json',
  '-d', 'data.json',
  '-o', 'invoice.pdf'
]);
```

:::

## Rendimiento entre Ecosistemas

Compara Open PDF Generator con las principales herramientas en **Java**, **Go** y **Node.js**:

<UnifiedBenchmarkChart />

## Instalación

Agrega a tu proyecto vía Gradle, Maven o descarga el binario nativo autónomo directamente:

::: code-group

```bash [CLI Nativa (Go / Node / Python)]
# Linux (amd64) — Sin necesidad de Java
curl -sSL -o /usr/local/bin/pdf-generator https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-linux-amd64 && chmod +x /usr/local/bin/pdf-generator

# macOS (Apple Silicon arm64) — Sin necesidad de Java
curl -sSL -o /usr/local/bin/pdf-generator https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-darwin-arm64 && chmod +x /usr/local/bin/pdf-generator

# Docker (Ejecución en comando único)
docker run --rm -v $(pwd):/work -w /work open-pdf-generator:native generate template.json -d data.json -o out.pdf
```

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

## ¿Qué Sigue?

<div class="vp-doc">

| Camino | Descripción |
|--------|-------------|
| [⚡ Benchmark (vs JasperReports)](/lib/benchmark) | Prueba de estrés con 100k facturas, latencia, throughput, memoria y ahorro en FinOps |
| [⚡ Benchmark (vs Go y Node.js)](/lib/benchmark-multilang) | Latencia de sub-milisegundo vs Maroto (Go) y pdfmake (Node.js) |
| [Guía Políglota (Go, Node, Python)](/es/cli/examples) | Código cliente listo para entornos fuera de la JVM |
| [Documentación del Motor](/es/lib/) | Aprende a usar la librería de generación de PDF |
| [Documentación del Editor](/editor/index.html) | Crea plantillas visualmente con la aplicación desktop |
| [Ejemplos](/lib/examples/) | Ejemplos de plantillas del mundo real |

</div>

## Soporte y Patrocinio

Open PDF Generator es completamente gratuito y open source. Si este proyecto te ayuda a ti o a tu equipo a crear mejores documentos, considera patrocinar el desarrollo continuo:

<div style="margin: 20px 0; display: flex; gap: 12px; flex-wrap: wrap;">
  <a 
    href="https://github.com/sponsors/adilsoncruz" 
    target="_blank"
    rel="noopener noreferrer"
    style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: linear-gradient(135deg, #ec4899, #db2777); color: white; border-radius: 10px; font-weight: 600; text-decoration: none; box-shadow: 0 4px 14px rgba(219, 39, 119, 0.35);"
  >
    💖 Patrocinar en GitHub
  </a>
  <a 
    href="https://buymeacoffee.com/adilsoncruz" 
    target="_blank"
    rel="noopener noreferrer"
    style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: linear-gradient(135deg, #FFDD00, #FBBF24); color: #000000; border-radius: 10px; font-weight: 600; text-decoration: none; box-shadow: 0 4px 14px rgba(251, 191, 36, 0.35);"
  >
    ☕ Cómprame un Café
  </a>
</div>
