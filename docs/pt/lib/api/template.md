# Template

Classe que representa um template de PDF carregado e validado.

## Import

```kotlin
import com.pdfgenerator.template.Template
```

```java
import com.pdfgenerator.template.Template;
```

---

## Métodos Estáticos (Factory)

### fromFile()

Carrega o template a partir de um arquivo JSON.

```kotlin
val template = Template.fromFile(File("template.json"))
```

```java
Template template = Template.fromFile(new File("template.json"));
```

### fromString()

Carrega o template a partir de uma string JSON.

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

Carrega o template a partir de um recurso no classpath.

```kotlin
val template = Template.fromResource("/templates/invoice.json")
```

**Estrutura esperada:**
```
src/main/resources/
└── templates/
    └── invoice.json
```

### fromInputStream()

Carrega o template a partir de um InputStream.

```kotlin
val inputStream = FileInputStream("template.json")
val template = Template.fromInputStream(inputStream)
```

---

## Propriedades

### version

Versão do formato do template.

```kotlin
val version = template.version // "1.0"
```

### pageSettings

Configurações de página.

```kotlin
val page = template.pageSettings

println(page.size)        // "A4"
println(page.orientation) // "portrait"
println(page.margins)     // Margins(top=30, right=30, bottom=30, left=30)
```

### elements

Lista de elementos do corpo do documento.

```kotlin
val elements = template.elements
elements.forEach { element ->
    println("${element.type}: ${element.id}")
}
```

### fixedHeader

Cabeçalho fixo (opcional).

```kotlin
template.fixedHeader?.let { header ->
    println("Altura do cabeçalho: ${header.height}")
    println("Elementos do cabeçalho: ${header.elements.size}")
}
```

### fixedFooter

Rodapé fixo (opcional).

```kotlin
template.fixedFooter?.let { footer ->
    println("Altura do rodapé: ${footer.height}")
    println("Elementos do rodapé: ${footer.elements.size}")
}
```

---

## Métodos

### validate()

Valida o template e retorna uma lista de erros.

```kotlin
val errors = template.validate()

if (errors.isEmpty()) {
    println("Template válido!")
} else {
    errors.forEach { error ->
        println("Erro em ${error.elementId}: ${error.message}")
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

Converte o template de volta para JSON.

```kotlin
val json = template.toJson()
File("backup.json").writeText(json)
```

### copy()

Cria uma cópia do template (permite modificações).

```kotlin
val copy = template.copy(
    pageSettings = template.pageSettings.copy(
        orientation = "landscape"
    )
)
```

---

## Estrutura JSON

### Estrutura Mínima

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

### Estrutura Completa

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

### Propriedades

| Propriedade | Tipo | Valores | Padrão |
|----------|------|--------|---------|
| `size` | string | `A4`, `Letter`, `Legal` | `A4` |
| `orientation` | string | `portrait`, `landscape` | `portrait` |
| `margins` | Margins | objeto | `{top:30, right:30, bottom:30, left:30}` |

### Tamanhos de Página

| Tamanho | Largura | Altura | Uso |
|------|-------|--------|-------|
| `A4` | 595pt | 842pt | Padrão internacional |
| `Letter` | 612pt | 792pt | Padrão dos EUA |
| `Legal` | 612pt | 1008pt | Documentos jurídicos dos EUA |

### Exemplo

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

## Exemplos

### Carregar e Validar

```kotlin
val template = Template.fromFile(File("template.json"))

val errors = template.validate()
if (errors.isNotEmpty()) {
    throw IllegalArgumentException(
        "Invalid template: ${errors.joinToString { it.message }}"
    )
}
```

### Cache de Templates

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

### Modificar Template em Tempo de Execução

```kotlin
val baseTemplate = Template.fromFile(File("base.json"))

// Cria versão em modo paisagem
val landscapeTemplate = baseTemplate.copy(
    pageSettings = baseTemplate.pageSettings.copy(
        orientation = "landscape"
    )
)
```

---

## Exceções

| Exceção | Causa |
|-----------|-------|
| `JsonParseException` | JSON inválido |
| `FileNotFoundException` | Arquivo não encontrado |
| `TemplateValidationException` | Estrutura inválida |

---

## Próximos Passos

- [TemplateBuilder](/pt/lib/api/template-builder) - Criar templates programaticamente
- [Elementos](/pt/lib/api/elements) - Tipos de elementos
- [PDFGenerator](/pt/lib/api/pdf-generator) - Gerar PDF
