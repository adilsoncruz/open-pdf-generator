# Comandos

## generate

Gera um PDF a partir de um template e de um arquivo de dados opcional.

```bash
pdf-generator generate <template> [options]
```

### Argumentos

| Argumento | Descrição |
|----------|-------------|
| `template` | Caminho para o arquivo JSON de template (obrigatório) |

### Opções de Saída

| Opção | Curta | Descrição |
|--------|-------|-------------|
| `--data` | `-d` | Caminho para o arquivo JSON de dados |
| `--output` | `-o` | Caminho do PDF de saída (padrão: `output.pdf`) |

### Opções de Configuração

| Opção | Descrição | Padrão |
|--------|-------------|---------|
| `--font-dir` | Diretório com fontes personalizadas | - |
| `--default-font` | Fonte padrão a ser usada | `Helvetica` |
| `--resources-dir` | Diretório base para recursos (imagens, fontes) | - |

### Opções de Cache

| Opção | Descrição | Padrão |
|--------|-------------|---------|
| `--no-image-cache` | Desabilita o cache de imagens | `false` |
| `--image-cache-size` | Número máximo de imagens a cachear | `100` |
| `--clear-cache` | Limpa todos os caches antes de gerar | `false` |

### Opções de Modo

| Opção | Curta | Descrição | Padrão |
|--------|-------|-------------|---------|
| `--strict` | | Habilita o modo estrito (falha em caso de erros) | `true` |
| `--no-strict` | | Desabilita o modo estrito (continua em caso de erros) | - |
| `--verbose` | `-v` | Habilita a saída detalhada | `false` |

### Exemplos

```bash
# Basic usage
pdf-generator generate invoice.json

# With data file
pdf-generator generate invoice.json -d customer-data.json

# Specify output file
pdf-generator generate invoice.json -d data.json -o invoices/invoice-001.pdf

# With custom fonts and verbose output
pdf-generator generate invoice.json \
  --font-dir ./fonts \
  --default-font "Open Sans" \
  -v

# Disable image cache for large batches
pdf-generator generate report.json \
  --no-image-cache \
  -o report.pdf

# Clear cache and use custom resources directory
pdf-generator generate invoice.json \
  --clear-cache \
  --resources-dir ./assets \
  -o invoice.pdf

# Non-strict mode (continue on errors)
pdf-generator generate template.json \
  --no-strict \
  -v
```

## validate

Valida um arquivo de template em busca de erros.

```bash
pdf-generator validate <template> [options]
```

### Argumentos

| Argumento | Descrição |
|----------|-------------|
| `template` | Caminho para o arquivo JSON de template (obrigatório) |

### Opções

| Opção | Curta | Descrição |
|--------|-------|-------------|
| `--verbose` | `-v` | Mostra detalhes do template |

### Exemplos

```bash
# Validate a template
pdf-generator validate invoice.json

# Validate with details
pdf-generator validate invoice.json -v
```

### Saída

Em caso de sucesso:
```
Validating template: invoice.json
✓ Template is valid
```

Com verbose:
```
Validating template: invoice.json

Template details:
  Page format: A4
  Page orientation: portrait
  Header elements: 2
  Body elements: 5
  Footer elements: 1
✓ Template is valid
```

Em caso de erro:
```
Validating template: broken.json
✗ Template validation failed: Unknown element type "textt" at line 15
```

## convert

Converte um template JasperReports JRXML para o formato JSON do Open PDF Generator.

```bash
pdf-generator convert <input.jrxml> [options]
```

### Argumentos

| Argumento | Descrição |
|----------|-------------|
| `input` | Caminho para o arquivo `.jrxml` de entrada (obrigatório) |

### Opções

| Opção | Descrição | Padrão |
|--------|-------------|---------|
| `--output` | Caminho para o arquivo JSON de template de destino | - |
| `--stdout` | Imprime o JSON convertido na saída padrão | `false` |
| `--fail-on-unsupported` | Falha a conversão se um elemento Jasper não suportado for encontrado | `false` |

### Exemplos

```bash
# Convert JRXML to template file
pdf-generator convert report.jrxml --output template.json

# Convert and output directly to stdout or pipe
pdf-generator convert report.jrxml --stdout > template.json

# Strict conversion failing on unknown tags
pdf-generator convert report.jrxml --output template.json --fail-on-unsupported
```

Saída:
```
✓ Template converted successfully: /path/to/template.json
```

## cache

Gerencia os caches de templates e imagens.

### cache clear

Limpa os caches para liberar memória ou forçar recarga.

```bash
pdf-generator cache clear [options]
```

| Opção | Curta | Descrição |
|--------|-------|-------------|
| `--templates` | `-t` | Limpa apenas o cache de templates |
| `--images` | `-i` | Limpa apenas o cache de imagens |

```bash
# Clear all caches
pdf-generator cache clear

# Clear only template cache
pdf-generator cache clear -t

# Clear only image cache
pdf-generator cache clear -i
```

### cache stats

Mostra estatísticas do cache.

```bash
pdf-generator cache stats
```

Saída:
```
Cache Statistics
================
Templates cached: 5
Images cached: 23
```

## version

Exibe informações de versão.

```bash
pdf-generator version
```

### Saída

```
PDF Generator CLI v1.0.0
Core Library v1.0.0

Java: 17.0.5
OS: Mac OS X 14.0
```

## help

Exibe informações de ajuda.

```bash
pdf-generator --help
pdf-generator generate --help
pdf-generator cache --help
```

## Códigos de Saída (Exit Codes)

| Código | Descrição |
|------|-------------|
| `0` | Sucesso |
| `1` | Erro (template inválido, arquivo ausente etc.) |

## Variáveis de Ambiente

| Variável | Descrição |
|----------|-------------|
| `JAVA_HOME` | Caminho da instalação do Java |
| `PDF_GENERATOR_HOME` | Diretório de instalação personalizado |
| `PDF_GENERATOR_FONT_DIR` | Diretório padrão de fontes |
| `PDF_GENERATOR_RESOURCES_DIR` | Diretório padrão de recursos |
