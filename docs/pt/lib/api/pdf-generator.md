# PDFGenerator

Classe principal para geração de PDFs a partir de templates.

## Import

```kotlin
import com.pdfgenerator.PDFGenerator
import com.pdfgenerator.PDFGeneratorConfig
```

```java
import com.pdfgenerator.PDFGenerator;
import com.pdfgenerator.PDFGeneratorConfig;
```

---

## Construtores

### PDFGenerator()

Cria uma instância com a configuração padrão.

```kotlin
val generator = PDFGenerator()
```

### PDFGenerator(config)

Cria uma instância com configuração personalizada.

```kotlin
val config = PDFGeneratorConfig(
    strictMode = true,
    debug = false
)
val generator = PDFGenerator(config)
```

---

## Métodos

### generate()

Gera um PDF a partir de um template e dos dados.

#### Assinaturas

```kotlin
// Para arquivo
fun generate(
    template: Template,
    data: Map<String, Any?>,
    outputFile: File
)

// Para OutputStream
fun generate(
    template: Template,
    data: Map<String, Any?>,
    outputStream: OutputStream
)

// Para ByteArray
fun generateToBytes(
    template: Template,
    data: Map<String, Any?>
): ByteArray
```

#### Parâmetros

| Parâmetro | Tipo | Descrição |
|-----------|------|-------------|
| `template` | Template | Template carregado |
| `data` | Map<String, Any?> | Dados para o data binding |
| `outputFile` | File | Arquivo de saída |
| `outputStream` | OutputStream | Stream de saída |

#### Exemplo - Arquivo

```kotlin
val template = Template.fromFile(File("template.json"))
val data = mapOf(
    "customer" to mapOf(
        "name" to "John Smith",
        "email" to "john@email.com"
    ),
    "items" to listOf(
        mapOf("name" to "Product A", "value" to 100.0),
        mapOf("name" to "Product B", "value" to 200.0)
    )
)

val generator = PDFGenerator()
generator.generate(template, data, File("output.pdf"))
```

#### Exemplo - OutputStream

```kotlin
val outputStream = FileOutputStream("output.pdf")
generator.generate(template, data, outputStream)
outputStream.close()
```

#### Exemplo - ByteArray

```kotlin
val pdfBytes = generator.generateToBytes(template, data)
// Use os bytes (ex.: enviar via HTTP, salvar no banco de dados, etc.)
```

---

## Exemplos de Uso

### Básico em Kotlin

```kotlin
import com.pdfgenerator.PDFGenerator
import com.pdfgenerator.template.Template
import java.io.File

fun main() {
    val template = Template.fromFile(File("invoice.json"))
    
    val data = mapOf(
        "number" to 12345,
        "customer" to "John Smith",
        "total" to 1500.00
    )
    
    val generator = PDFGenerator()
    generator.generate(template, data, File("invoice.pdf"))
    
    println("PDF gerado com sucesso!")
}
```

### Básico em Java

```java
import com.pdfgenerator.PDFGenerator;
import com.pdfgenerator.template.Template;
import java.io.File;
import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Template template = Template.fromFile(new File("invoice.json"));
        
        Map<String, Object> data = new HashMap<>();
        data.put("number", 12345);
        data.put("customer", "John Smith");
        data.put("total", 1500.00);
        
        PDFGenerator generator = new PDFGenerator();
        generator.generate(template, data, new File("invoice.pdf"));
        
        System.out.println("PDF gerado com sucesso!");
    }
}
```

### Com Configuração

```kotlin
val config = PDFGeneratorConfig(
    strictMode = true,      // Para em caso de erros
    debug = true,           // Logs detalhados
    defaultFontSize = 10f   // Fonte padrão
)

val generator = PDFGenerator(config)
generator.generate(template, data, outputFile)
```

### Processamento em Lote

```kotlin
val generator = PDFGenerator()
val template = Template.fromFile(File("template.json"))

orders.forEach { order ->
    val data = mapOf(
        "number" to order.number,
        "customer" to order.customer,
        "items" to order.items
    )
    
    generator.generate(
        template, 
        data, 
        File("orders/order_${order.number}.pdf")
    )
}
```

### API REST (Spring Boot)

```kotlin
@RestController
class PdfController(private val generator: PDFGenerator) {
    
    @PostMapping("/pdf/invoice")
    fun generateInvoice(@RequestBody data: InvoiceDTO): ResponseEntity<ByteArray> {
        val template = Template.fromResource("/templates/invoice.json")
        val dataMap = data.toMap()
        
        val pdfBytes = generator.generateToBytes(template, dataMap)
        
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .header("Content-Disposition", "attachment; filename=invoice.pdf")
            .body(pdfBytes)
    }
}
```

### AWS Lambda

```kotlin
class PdfHandler : RequestHandler<Map<String, Any>, ByteArray> {
    
    private val generator = PDFGenerator()
    private val template = Template.fromResource("/template.json")
    
    override fun handleRequest(
        input: Map<String, Any>, 
        context: Context
    ): ByteArray {
        return generator.generateToBytes(template, input)
    }
}
```

---

## Gerenciamento de Cache

A classe `PDFGenerator` oferece métodos estáticos para gerenciar o cache de templates. O cache é **thread-safe** e **compartilhado entre todas as instâncias**.

### clearCache()

Limpa todos os templates armazenados em cache. Use quando precisar liberar memória ou forçar o re-processamento dos templates.

```kotlin
// Limpa todos os templates em cache
PDFGenerator.clearCache()
```

### invalidateCache(templatePath)

Remove um template específico do cache. Use quando um único arquivo de template foi modificado.

```kotlin
// Remove um template específico
PDFGenerator.invalidateCache("/templates/invoice.json")

// Depois disso, a próxima chamada com esse template o processará novamente
```

### cacheSize()

Retorna o número de templates atualmente em cache. Útil para monitoramento e depuração.

```kotlin
val count = PDFGenerator.cacheSize()
println("Templates em cache: $count")
```

### Quando limpar o cache

| Cenário | Ação |
|----------|--------|
| Arquivo de template atualizado em produção | `invalidateCache(path)` |
| Implantando novas versões de templates | `clearCache()` |
| Pressão de memória | `clearCache()` |
| Desenvolvimento (ver alterações) | Desative o cache na configuração |

### Exemplo: Hot reload em desenvolvimento

```kotlin
fun watchTemplates(directory: File) {
    // Usando Java WatchService ou similar
    directory.watchForChanges { changedFile ->
        PDFGenerator.invalidateCache(changedFile.absolutePath)
        println("Cache de template invalidado: ${changedFile.name}")
    }
}
```

---

## Segurança entre Threads (Thread Safety)

O `PDFGenerator` é **thread-safe**. Uma única instância pode ser compartilhada entre threads:

```kotlin
// Singleton OK
object PdfService {
    private val generator = PDFGenerator()
    
    fun generate(template: Template, data: Map<String, Any?>): ByteArray {
        return generator.generateToBytes(template, data)
    }
}
```

---

## Exceções

| Exceção | Causa |
|-----------|-------|
| `TemplateValidationException` | Template inválido |
| `DataBindingException` | Erro de data binding |
| `RenderException` | Erro de renderização |
| `IOException` | Erro de I/O em arquivo |

### Tratamento de Erros

```kotlin
try {
    generator.generate(template, data, outputFile)
} catch (e: TemplateValidationException) {
    println("Template inválido: ${e.message}")
} catch (e: DataBindingException) {
    println("Erro de data binding: ${e.message}")
} catch (e: Exception) {
    println("Erro geral: ${e.message}")
}
```

---

## Próximos Passos

- [Template](/pt/lib/api/template) - Carregar e validar templates
- [Configuração](/pt/lib/api/configuration) - Todas as opções de configuração
- [Exemplos](/pt/lib/examples/) - Casos de uso completos
