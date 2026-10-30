# Desempenho

Guia de otimização para geração de PDFs de alta performance.

## Visão Geral

A PDF Generator Library foi projetada para ser leve e rápida:

| Métrica | Valor |
|--------|-------|
| **Tamanho do JAR** | 5.1 MB (standalone) |
| **Cold Start** | ~500ms |
| **Warm Start** | ~50ms |
| **Geração simples** | ~100ms |
| **Tabela de 1000 linhas** | ~500ms |

---

## Benchmarks

### PDF Simples (1 página, texto + imagem)

```
First execution:  ~600ms (cold start)
Following executions: ~80ms (warm)
```

### PDF com Tabela (100 linhas)

```
First execution:  ~700ms
Following executions: ~150ms
```

### PDF com Tabela Grande (1000 linhas, ~20 páginas)

```
First execution:  ~1200ms
Following executions: ~500ms
```

---

## Cache de Imagens

### Como Funciona

As imagens são armazenadas em cache automaticamente na memória:

```kotlin
// First time: loads from URL/file
// Next times: uses cache

val generator = PDFGenerator()
generator.generate(template1, data1, file1) // Loads logo.png
generator.generate(template2, data2, file2) // Uses cache
generator.generate(template3, data3, file3) // Uses cache
```

### Gerenciamento do Cache

```kotlin
import com.pdfgenerator.renderer.ImageRenderer

// Check cache size
val cacheSize = ImageRenderer.cacheSize()
println("Cached images: $cacheSize")

// Clear complete cache
ImageRenderer.clearCache()

// Invalidate specific image
ImageRenderer.invalidateCache("https://example.com/logo.png")

// Configure maximum size
ImageRenderer.setMaxCacheSize(200) // default: 100
```

### Quando Limpar o Cache

- ✅ Após processar um grande lote de PDFs
- ✅ Se as imagens foram atualizadas
- ✅ Em ambientes com memória limitada
- ✅ Periodicamente em serviços de longa execução

---

## Cache de Fontes

As fontes são armazenadas em cache automaticamente pelo OpenPDF:

```kotlin
// Default fonts are loaded once
// Helvetica, Times, Courier
```

**Dica:** Use fontes padrão para melhor desempenho:
- `Helvetica` (sans-serif)
- `Times` (serif)
- `Courier` (monospace)

---

## Otimização de Templates

### ✅ Boas Práticas

```json
{
  "elements": [
    {
      "type": "text",
      "dataBinding": "name"
    }
  ]
}
```

### ❌ Evite

```json
{
  "elements": [
    {
      "type": "text",
      "dataBinding": "list | join:', ' | upperCase | truncate:1000 | replace:'A':'B'"
    }
  ]
}
```

**Por quê?** Transformações complexas encadeadas são processadas para cada célula/elemento.

---

## Otimização de Dados

### ✅ Pré-processe no Backend

```kotlin
// GOOD: Process data before sending to template
val processedData = data.map { item ->
    item.copy(
        formattedValue = formatCurrency(item.value),
        formattedDate = formatDate(item.date)
    )
}

generator.generate(template, processedData, file)
```

### ❌ Evite Transformações Pesadas no Template

```json
{
  "dataBinding": "value | complex_calculation"
}
```

---

## Otimização de Tabelas

### Limite de Linhas

```kotlin
// Recommended: maximum 500-1000 rows per PDF
// For more data: paginate in backend

val chunks = data.chunked(500)
chunks.forEachIndexed { index, chunk ->
    generator.generate(template, chunk, File("part_$index.pdf"))
}
```

### Colunas Eficientes

```json
{
  "columns": [
    {
      "header": "Name",
      "field": "$item.name"
    },
    {
      "header": "Value",
      "field": "$item.formattedValue"
    }
  ]
}
```

**Evite:**
- Muitas colunas (> 10)
- Transformações complexas em cada célula
- Imagens dentro de tabelas

---

## Otimização de Imagens

### Tamanho Recomendado

| Uso | Tamanho Máximo | Formato |
|-----|--------------|--------|
| Logo | 200 KB | PNG |
| Foto de produto | 500 KB | JPEG (qualidade 80%) |
| Background | 300 KB | JPEG |
| QR Code | Gerado | - |

### Pré-processe as Imagens

```kotlin
// Resize images BEFORE using in template
// Don't send 5MB image for 100x50px logo
```

### Base64 vs URL

```kotlin
// URL: Better for repeated images (cache works)
"source": "https://cdn.example.com/logo.png"

// Base64: Better for unique images per document
"dataBinding": "signature.base64"
```

---

## Configuração do Gerador

### Modo Estrito

```kotlin
val config = PDFGeneratorConfig(
    strictMode = false  // Continues even with minor errors
)
```

- `strictMode = true`: Para na primeira falha (desenvolvimento)
- `strictMode = false`: Continua quando possível (produção)

### Modo Debug

```kotlin
val config = PDFGeneratorConfig(
    debug = false  // Disables debug logs
)
```

**Produção:** Sempre `debug = false`

---

## Processamento em Lote

### Sequencial (Simples)

```kotlin
val generator = PDFGenerator()

orders.forEach { order ->
    val data = prepareData(order)
    generator.generate(template, data, File("order_${order.id}.pdf"))
}
```

### Paralelo (Alta Performance)

```kotlin
import kotlinx.coroutines.*

val generator = PDFGenerator()

runBlocking {
    orders.map { order ->
        async(Dispatchers.IO) {
            val data = prepareData(order)
            generator.generate(template, data, File("order_${order.id}.pdf"))
        }
    }.awaitAll()
}
```

::: warning Atenção
`PDFGenerator` é thread-safe, mas cada `generate()` cria seu próprio documento. Para máxima performance, use um pool de threads limitado.
:::

---

## Monitoramento

### Métricas Importantes

```kotlin
import kotlin.system.measureTimeMillis

val time = measureTimeMillis {
    generator.generate(template, data, file)
}
println("PDF generated in ${time}ms")
```

### Logging

```xml
<!-- logback.xml -->
<logger name="com.pdfgenerator" level="INFO"/>

<!-- For performance debug -->
<logger name="com.pdfgenerator" level="DEBUG"/>
```

---

## Comparação: Modos de Uso

| Cenário | Tempo Esperado | Dicas |
|----------|---------------|------|
| PDF único simples | 50-150ms | - |
| PDF com tabela média | 100-300ms | Use `paginated: true` |
| PDF com imagens | 150-400ms | Otimize os tamanhos das imagens |
| Lote de 100 PDFs | 5-15s | Processe em paralelo |
| Lote de 1000 PDFs | 50-150s | Use workers/filas |

---

## Ambiente Serverless

### AWS Lambda / GCP Cloud Functions

```kotlin
// Recommendations:
// - Memory: 512MB+ 
// - Timeout: 30s+
// - Cold start: ~2-3s (first execution)

// Optimization: Keep instance warm
val generator = PDFGenerator() // Reuse between invocations
```

### Reduzindo o Cold Start

1. Use provisão de concorrência (AWS)
2. Mantenha a instância aquecida com ping
3. Carregue o template no init (fora do handler)

```kotlin
// Lambda Handler
class Handler {
    // Loads once in init
    private val template = Template.fromResource("/templates/invoice.json")
    private val generator = PDFGenerator()
    
    fun handleRequest(input: Map<String, Any>): ByteArray {
        val output = ByteArrayOutputStream()
        generator.generate(template, input, output)
        return output.toByteArray()
    }
}
```

---

## Solução de Problemas

### PDF Lento

1. ✅ Verifique os tamanhos das imagens
2. ✅ Reduza as transformações do template
3. ✅ Limite as linhas da tabela
4. ✅ Verifique se o cache está funcionando
5. ✅ Use `debug: false` em produção

### OutOfMemoryError

1. ✅ Aumente o heap: `-Xmx512m`
2. ✅ Limite o cache de imagens: `setMaxCacheSize(50)`
3. ✅ Processe em lotes menores
4. ✅ Limpe o cache periodicamente

### Timeout em Serverless

1. ✅ Aumente o timeout da Lambda
2. ✅ Reduza a complexidade do template
3. ✅ Use provisão de concorrência
4. ✅ Pré-aqueça a função

---

## Resumo das Boas Práticas

| Área | Recomendação |
|------|----------------|
| **Imagens** | < 500KB, formato adequado |
| **Tabelas** | < 1000 linhas por PDF |
| **Transformações** | Pré-processe no backend |
| **Cache** | Mantenha habilitado, limpe periodicamente |
| **Lotes** | Processe em paralelo |
| **Logging** | `INFO` em produção |
| **Fontes** | Use as padrão (Helvetica, Times, Courier) |

---

## Próximos Passos

- [Instalação](/pt/lib/guide/installation) - Configuração inicial
- [Cabeçalho e Rodapé](/pt/lib/guide/advanced/header-footer) - Otimize os cabeçalhos
- [Exemplos](/pt/lib/examples/) - Templates otimizados
