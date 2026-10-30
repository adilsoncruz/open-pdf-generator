# Configuração

Guia completo das opções de configuração do PDFGenerator.

## PDFGeneratorConfig

A classe `PDFGeneratorConfig` permite personalizar o comportamento do gerador de PDF.

### Import

::: code-group

```kotlin [Kotlin]
import com.pdfgenerator.PDFGeneratorConfig
import com.pdfgenerator.ImageCacheConfig
import com.pdfgenerator.HttpTimeoutConfig
import com.pdfgenerator.TemplateCacheConfig
```

```java [Java]
import com.pdfgenerator.PDFGeneratorConfig;
```

:::

---

## Visão Geral das Propriedades

| Propriedade | Tipo | Padrão | Descrição |
|----------|------|---------|-------------|
| `strictMode` | Boolean | `false` | Controla o comportamento de tratamento de erros |
| `debug` | Boolean | `false` | Ativa logs detalhados |
| `defaultFontSize` | Float | `12f` | Tamanho padrão da fonte em pontos |
| `defaultFontFamily` | String | `"Helvetica"` | Família de fonte padrão |
| `defaultColor` | String | `"#000000"` | Cor padrão do texto |
| `templateCache` | TemplateCacheConfig | habilitado | Cache de processamento de templates |
| `imageCache` | ImageCacheConfig | habilitado | Cache de download de imagens |
| `httpTimeout` | HttpTimeoutConfig | 5s/10s | Timeouts de requisições HTTP |

---

## strictMode

Controla como a biblioteca lida com erros durante a geração do PDF.

### Quando usar `strictMode = true`

- **Desenvolvimento/Testes**: falhe rápido para capturar erros de template cedo
- **Documentos críticos**: garanta que todos os data bindings estejam corretos
- **Pipelines de validação**: verifique os templates antes da produção

### Quando usar `strictMode = false`

- **Produção com fallbacks**: continue mesmo se alguns dados estiverem faltando
- **Templates gerados por usuários**: seja tolerante a pequenos problemas
- **Processamento em lote**: não interrompa todo o lote por causa de um erro

### Comportamento

| Cenário | `strictMode = true` | `strictMode = false` |
|----------|---------------------|----------------------|
| Data binding ausente <code v-pre>{{user.name}}</code> | Lança `DataBindingException` | Renderiza string vazia `""` |
| URL de imagem inválida | Lança `ImageLoadException` | Ignora a imagem |
| Formato de data inválido | Lança `TransformException` | Exibe o valor bruto |
| Fonte ausente | Lança `FontException` | Usa a fonte padrão |

### Exemplo

```kotlin
// Development - fail on any error
val devConfig = PDFGeneratorConfig(strictMode = true)

// Production - be tolerant
val prodConfig = PDFGeneratorConfig(strictMode = false)
```

**Padrão:** `false`

---

## debug

Ativa o registro detalhado (log) do processo de geração do PDF. Útil para depurar problemas de template, entender o fluxo de renderização e medir performance.

### O que é registrado

- Tempo de carregamento e processamento do template
- Cada elemento renderizado com seu tipo
- Resoluções de data binding
- Detalhes de paginação de tabelas
- Carregamento de imagens (locais/remotas)
- Tempo total de geração

### Exemplo de saída

```text
[PDFGenerator] Loading template: invoice.json
[PDFGenerator] Template parsed in 12ms
[PDFGenerator] Rendering page 1
[PDFGenerator] Rendering element: company_logo (ImageElement)
[PDFGenerator] Loading image: /assets/logo.png (local)
[PDFGenerator] Rendering element: title (TextElement)
[PDFGenerator] Data binding: {⁣{invoice.number}⁣} -> "INV-2024-001"
[PDFGenerator] Rendering element: items_table (TableElement)
[PDFGenerator] Table: 45 rows, generating 3 pages
[PDFGenerator] PDF generated: 3 pages in 234ms
```

### Uso

```kotlin
val config = PDFGeneratorConfig(debug = true)
```

::: warning
Desative o modo debug em produção para evitar sobrecarga de performance e logs excessivos.
:::

**Padrão:** `false`

---

## defaultFontSize

Tamanho padrão da fonte (em pontos) usado quando os elementos não especificam a propriedade `fontSize`.

### Casos de uso comuns

- Definir um tamanho base global de fonte para consistência
- Fontes menores (10pt) para documentos densos como faturas
- Fontes maiores (14pt) para acessibilidade

### Exemplo

```kotlin
// Compact documents
val config = PDFGeneratorConfig(defaultFontSize = 10f)

// Accessible documents
val config = PDFGeneratorConfig(defaultFontSize = 14f)
```

**Padrão:** `12f`

---

## defaultFontFamily

Família de fonte padrão usada quando os elementos não especificam a propriedade `fontFamily`.

### Fontes embutidas (sempre disponíveis)

| Fonte | Estilo | Melhor para |
|------|-------|----------|
| `Helvetica` | Sans-serif | Documentos modernos, UI |
| `Times-Roman` | Serif | Documentos formais, artigos |
| `Courier` | Monospace | Código, dados técnicos |

### Fontes personalizadas

Você pode registrar fontes personalizadas via configuração do diretório de fontes.

### Exemplo

```kotlin
// Technical documents
val config = PDFGeneratorConfig(defaultFontFamily = "Courier")

// Formal documents
val config = PDFGeneratorConfig(defaultFontFamily = "Times-Roman")
```

**Padrão:** `"Helvetica"`

---

## defaultColor

Cor padrão do texto (formato hex) usada quando os elementos não especificam a propriedade `color`.

### Formato

- Hex com `#`: `"#FF5500"` ou `"#F50"`
- Case insensitive: `"#ff5500"` também funciona

### Exemplo

```kotlin
// Dark gray for softer appearance
val config = PDFGeneratorConfig(defaultColor = "#333333")

// Brand color
val config = PDFGeneratorConfig(defaultColor = "#8B5CF6")
```

**Padrão:** `"#000000"` (preto)

---

## templateCache

Controla o cache de templates processados. Quando habilitado, os templates são processados uma única vez e reutilizados nas gerações subsequentes de PDF com o mesmo template.

### Por que usar cache de templates

- **Performance**: processar templates JSON pesa na CPU. O cache evita o re-processamento.
- **Throughput**: essencial para geração de PDFs em alto volume (APIs, jobs em lote).
- **Thread-safe**: o cache é thread-safe e compartilhado entre todas as instâncias de `PDFGenerator`.

### Quando desabilitar

- **Desenvolvimento**: veja as mudanças nos templates imediatamente, sem reiniciar
- **Templates dinâmicos**: quando templates são gerados/modificados em tempo de execução
- **Restrições de memória**: cada template em cache consome memória

### Opções de configuração

| Propriedade | Tipo | Padrão | Descrição |
|----------|------|---------|-------------|
| `enabled` | Boolean | `true` | Habilita/desabilita o cache |
| `maxSize` | Int | `100` | Número máximo de templates em cache (evicção LRU) |

### Exemplo

```kotlin
val config = PDFGeneratorConfig(
    templateCache = TemplateCacheConfig(
        enabled = true,
        maxSize = 50  // Keep up to 50 templates
    )
)
```

### Gerenciamento do cache

```kotlin
// Clear all cached templates
PDFGenerator.clearCache()

// Remove specific template from cache
PDFGenerator.invalidateCache("/templates/invoice.json")

// Check cache size
val count = PDFGenerator.cacheSize()
println("Templates in cache: $count")
```

### Impacto na performance

| Cenário | Sem cache | Com cache |
|----------|---------------|------------|
| Primeira renderização | 50ms | 50ms |
| Renderizações subsequentes | 50ms | 5ms |
| 1000 PDFs com o mesmo template | ~50 segundos | ~5 segundos |

**Padrão:** Habilitado com no máximo 100 templates

---

## imageCache

Controla o cache de imagens baixadas. Quando os templates referenciam imagens externas (URLs HTTP/HTTPS), a biblioteca as baixa e as guarda em cache para evitar requisições de rede redundantes.

### Por que usar cache de imagens

- **Performance**: requisições de rede são lentas. O cache evita downloads repetidos.
- **Banda**: reduz o uso de rede para referências repetidas à mesma imagem.
- **Confiabilidade**: imagens em cache funcionam mesmo que o servidor esteja temporariamente indisponível.

### Quando desabilitar

- **Desenvolvimento**: veja as mudanças nas imagens imediatamente
- **Imagens dinâmicas**: quando as imagens mudam com frequência (ex.: gráficos, avatares)
- **Restrições de memória**: imagens grandes consomem memória

### Opções de configuração

| Propriedade | Tipo | Padrão | Descrição |
|----------|------|---------|-------------|
| `enabled` | Boolean | `true` | Habilita/desabilita o cache |
| `maxSize` | Int | `50` | Número máximo de imagens em cache (evicção LRU) |
| `ttlMinutes` | Int | `30` | Tempo de vida até a expiração do cache |

### Exemplo

```kotlin
val config = PDFGeneratorConfig(
    imageCache = ImageCacheConfig(
        enabled = true,
        maxSize = 100,       // Cache up to 100 images
        ttlMinutes = 60      // Keep for 1 hour
    )
)
```

### Comportamento do cache

1. Primeira requisição: baixa a imagem e a armazena no cache
2. Requisições subsequentes (dentro do TTL): usa a imagem em cache
3. Após a expiração do TTL: baixa novamente e atualiza o cache
4. Ao atingir o tamanho máximo: remove a entrada usada há mais tempo (LRU)

### Imagens locais

Imagens locais (caminhos de arquivo) **não são cacheadas** — elas são lidas diretamente do disco a cada vez. Apenas imagens remotas (HTTP/HTTPS) usam o cache.

**Padrão:** Habilitado com 50 imagens e TTL de 30 minutos

---

## httpTimeout

Controla os valores de timeout para requisições HTTP ao baixar imagens externas.

### Por que configurar timeouts

- **Confiabilidade**: evita travamentos em servidores lentos/inativos
- **Experiência do usuário**: falhe rápido em vez de esperar indefinidamente
- **Gerenciamento de recursos**: libera conexões para outras requisições

### Opções de configuração

| Propriedade | Tipo | Padrão | Descrição |
|----------|------|---------|-------------|
| `connectTimeout` | Int | `5000` | Tempo máximo para estabelecer a conexão (ms) |
| `readTimeout` | Int | `10000` | Tempo máximo para ler os dados da resposta (ms) |

### Exemplo

```kotlin
// Fast-fail for production APIs
val config = PDFGeneratorConfig(
    httpTimeout = HttpTimeoutConfig(
        connectTimeout = 3000,  // 3 seconds
        readTimeout = 5000      // 5 seconds
    )
)

// Tolerant for slow image servers
val config = PDFGeneratorConfig(
    httpTimeout = HttpTimeoutConfig(
        connectTimeout = 10000,  // 10 seconds
        readTimeout = 30000      // 30 seconds
    )
)
```

### Comportamento em caso de timeout

Quando ocorre um timeout:
- `strictMode = true`: lança `ImageLoadException`
- `strictMode = false`: ignora a imagem e registra um aviso

::: tip
Para imagens grandes (> 1MB), aumente o `readTimeout` proporcionalmente.
:::

**Padrão:** Conexão 5s, Leitura 10s

---

## Exemplos Completos

### Configuração de Produção

Otimizada para confiabilidade e performance em ambientes de produção.

```kotlin
val productionConfig = PDFGeneratorConfig(
    strictMode = false,           // Tolerant to minor errors
    debug = false,                // No debug overhead
    defaultFontSize = 10f,
    defaultFontFamily = "Helvetica",
    defaultColor = "#000000",
    templateCache = TemplateCacheConfig(
        enabled = true,
        maxSize = 200             // Large cache for many templates
    ),
    imageCache = ImageCacheConfig(
        enabled = true,
        maxSize = 100,
        ttlMinutes = 120          // 2 hour cache
    ),
    httpTimeout = HttpTimeoutConfig(
        connectTimeout = 3000,
        readTimeout = 8000
    )
)

val generator = PDFGenerator(productionConfig)
```

### Configuração de Desenvolvimento

Otimizada para depuração e para ver as mudanças imediatamente.

```kotlin
val devConfig = PDFGeneratorConfig(
    strictMode = true,            // Fail fast on errors
    debug = true,                 // Detailed logging
    defaultFontSize = 12f,
    templateCache = TemplateCacheConfig(
        enabled = false           // See template changes immediately
    ),
    imageCache = ImageCacheConfig(
        enabled = false           // See image changes immediately
    )
)

val generator = PDFGenerator(devConfig)
```

### Configuração de Teste

Otimizada para testes rápidos e determinísticos.

```kotlin
val testConfig = PDFGeneratorConfig(
    strictMode = true,            // Catch all errors
    debug = false,                // Clean test output
    templateCache = TemplateCacheConfig(enabled = false),
    imageCache = ImageCacheConfig(enabled = false),
    httpTimeout = HttpTimeoutConfig(
        connectTimeout = 1000,
        readTimeout = 2000        // Fast timeout for tests
    )
)
```

### Configuração para APIs de Alto Volume

Otimizada para APIs de geração de PDF de alto throughput.

```kotlin
val apiConfig = PDFGeneratorConfig(
    strictMode = false,
    debug = false,
    templateCache = TemplateCacheConfig(
        enabled = true,
        maxSize = 500             // Many templates
    ),
    imageCache = ImageCacheConfig(
        enabled = true,
        maxSize = 200,            // Many images
        ttlMinutes = 240          // 4 hour cache
    ),
    httpTimeout = HttpTimeoutConfig(
        connectTimeout = 2000,
        readTimeout = 5000        // Fast-fail
    )
)
```

---

## Uso em Java

```java
PDFGeneratorConfig config = new PDFGeneratorConfig.Builder()
    .strictMode(true)
    .debug(true)
    .defaultFontSize(10f)
    .defaultFontFamily("Helvetica")
    .defaultColor("#000000")
    .templateCacheEnabled(true)
    .templateCacheMaxSize(100)
    .imageCacheEnabled(true)
    .imageCacheMaxSize(100)
    .imageCacheTtlMinutes(60)
    .httpConnectTimeout(5000)
    .httpReadTimeout(10000)
    .build();

PDFGenerator generator = new PDFGenerator(config);
```

---

## Configuração via Arquivo

Carregue a configuração a partir de um arquivo JSON:

### config.json

```json
{
  "strictMode": false,
  "debug": false,
  "defaultFontSize": 10,
  "defaultFontFamily": "Helvetica",
  "defaultColor": "#000000",
  "templateCache": {
    "enabled": true,
    "maxSize": 100
  },
  "imageCache": {
    "enabled": true,
    "maxSize": 100,
    "ttlMinutes": 60
  },
  "httpTimeout": {
    "connectTimeout": 5000,
    "readTimeout": 10000
  }
}
```

### Carregamento

```kotlin
val config = PDFGeneratorConfig.fromFile(File("config.json"))
val generator = PDFGenerator(config)
```

---

## Integração com Spring Boot

### application.yml

```yaml
pdf-generator:
  strict-mode: false
  debug: false
  default-font-size: 10
  default-font-family: Helvetica
  default-color: "#000000"
  template-cache:
    enabled: true
    max-size: 100
  image-cache:
    enabled: true
    max-size: 100
    ttl-minutes: 60
  http-timeout:
    connect: 5000
    read: 10000
```

### Classe de Configuração

```kotlin
@Configuration
class PdfConfig {
    
    @Bean
    fun pdfGeneratorConfig(
        @Value("\${pdf-generator.strict-mode:false}") strictMode: Boolean,
        @Value("\${pdf-generator.debug:false}") debug: Boolean,
        @Value("\${pdf-generator.default-font-size:12}") fontSize: Float,
        @Value("\${pdf-generator.template-cache.enabled:true}") templateCacheEnabled: Boolean,
        @Value("\${pdf-generator.template-cache.max-size:100}") templateCacheMaxSize: Int,
        @Value("\${pdf-generator.image-cache.enabled:true}") imageCacheEnabled: Boolean,
        @Value("\${pdf-generator.image-cache.max-size:100}") imageCacheMaxSize: Int,
        @Value("\${pdf-generator.image-cache.ttl-minutes:60}") imageCacheTtl: Int
    ): PDFGeneratorConfig {
        return PDFGeneratorConfig(
            strictMode = strictMode,
            debug = debug,
            defaultFontSize = fontSize,
            templateCache = TemplateCacheConfig(
                enabled = templateCacheEnabled,
                maxSize = templateCacheMaxSize
            ),
            imageCache = ImageCacheConfig(
                enabled = imageCacheEnabled,
                maxSize = imageCacheMaxSize,
                ttlMinutes = imageCacheTtl
            )
        )
    }
    
    @Bean
    fun pdfGenerator(config: PDFGeneratorConfig): PDFGenerator {
        return PDFGenerator(config)
    }
}
```

---

## Configuração Baseada em Ambiente

```kotlin
fun createConfig(): PDFGeneratorConfig {
    val env = System.getenv("APP_ENV") ?: "development"
    
    return when (env) {
        "production" -> PDFGeneratorConfig(
            strictMode = false,
            debug = false,
            templateCache = TemplateCacheConfig(enabled = true, maxSize = 200),
            imageCache = ImageCacheConfig(enabled = true, maxSize = 100, ttlMinutes = 120)
        )
        "test" -> PDFGeneratorConfig(
            strictMode = true,
            debug = false,
            templateCache = TemplateCacheConfig(enabled = false),
            imageCache = ImageCacheConfig(enabled = false)
        )
        else -> PDFGeneratorConfig(
            strictMode = true,
            debug = true,
            templateCache = TemplateCacheConfig(enabled = false),
            imageCache = ImageCacheConfig(enabled = false)
        )
    }
}
```

---

## Próximos Passos

- [API do PDFGenerator](/pt/lib/api/pdf-generator) - Métodos da classe principal
- [Formato de Template](/pt/lib/api/template) - Estrutura do template
- [Guia de Performance](/pt/lib/guide/advanced/performance) - Dicas de otimização
- [Exemplos](/pt/lib/examples/) - Casos de uso do mundo real
