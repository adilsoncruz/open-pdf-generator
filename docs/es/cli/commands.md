# Comandos

## generate

Genera un PDF a partir de una plantilla y un archivo de datos opcional.

```bash
pdf-generator generate <template> [options]
```

### Argumentos

| Argumento | Descripción |
|----------|-------------|
| `template` | Ruta del archivo de plantilla JSON (requerido) |

### Opciones de salida

| Opción | Corta | Descripción |
|--------|-------|-------------|
| `--data` | `-d` | Ruta del archivo de datos JSON |
| `--output` | `-o` | Ruta del PDF de salida (predeterminado: `output.pdf`) |

### Opciones de configuración

| Opción | Descripción | Predeterminado |
|--------|-------------|---------|
| `--font-dir` | Directorio que contiene las fuentes personalizadas | - |
| `--default-font` | Fuente predeterminada a usar | `Helvetica` |
| `--resources-dir` | Directorio base para los recursos (imágenes, fuentes) | - |

### Opciones de caché

| Opción | Descripción | Predeterminado |
|--------|-------------|---------|
| `--no-image-cache` | Desactiva el caching de imágenes | `false` |
| `--image-cache-size` | Cantidad máxima de imágenes a cachear | `100` |
| `--clear-cache` | Limpia todas las cachés antes de generar | `false` |

### Opciones de modo

| Opción | Corta | Descripción | Predeterminado |
|--------|-------|-------------|---------|
| `--strict` | | Habilita el modo estricto (falla ante errores) | `true` |
| `--no-strict` | | Desactiva el modo estricto (continúa ante errores) | - |
| `--verbose` | `-v` | Habilita la salida detallada | `false` |

### Ejemplos

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

Valida un archivo de plantilla en busca de errores.

```bash
pdf-generator validate <template> [options]
```

### Argumentos

| Argumento | Descripción |
|----------|-------------|
| `template` | Ruta del archivo de plantilla JSON (requerido) |

### Opciones

| Opción | Corta | Descripción |
|--------|-------|-------------|
| `--verbose` | `-v` | Muestra los detalles de la plantilla |

### Ejemplos

```bash
# Validate a template
pdf-generator validate invoice.json

# Validate with details
pdf-generator validate invoice.json -v
```

### Salida

En caso de éxito:
```
Validating template: invoice.json
✓ Template is valid
```

Con verbose:
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

En caso de error:
```
Validating template: broken.json
✗ Template validation failed: Unknown element type "textt" at line 15
```

## convert

Convierte una plantilla JasperReports JRXML (**versión 6.x**) al formato JSON de Open PDF Generator.

::: tip Compatibilidad de Versión de JasperReports
El conversor soporta plantillas creadas para **JasperReports 6.x** (sintaxis tradicional con namespace `http://jasperreports.sourceforge.net/jasperreports`, elementos `<staticText>`, `<textField>`, `<reportElement>` y bandas `<band>`). Las plantillas de **JasperReports 7.x** (que migraron a la nueva sintaxis `<element kind="...">`) no son soportadas directamente por este conversor.
:::

```bash
pdf-generator convert <input.jrxml> [options]
```

### Argumentos

| Argumento | Descripción |
|----------|-------------|
| `input` | Ruta del archivo `.jrxml` de entrada (requerido, formato JasperReports 6.x) |

### Opciones

| Opción | Descripción | Predeterminado |
|--------|-------------|---------|
| `--output` | Ruta del archivo de plantilla JSON de destino | - |
| `--stdout` | Imprime el JSON convertido en la salida estándar | `false` |
| `--fail-on-unsupported` | Falla la conversión si se encuentra un elemento de Jasper no soportado | `false` |
| `--items-binding` | Nombre de la propiedad de data binding para tablas o bucles inferidos | `items` |
| `--disable-table-inference` | Desactiva la inferencia automática de `TableElement` y fuerza `LoopElement` para bandas detail | `false` |

### Ejemplos

```bash
# Convierte JRXML (Jasper 6.x) a archivo de plantilla JSON
pdf-generator convert report.jrxml --output template.json

# Convierte e imprime directamente en stdout o redirecciona mediante pipe
pdf-generator convert report.jrxml --stdout > template.json

# Conversión estricta fallando ante etiquetas desconocidas
pdf-generator convert report.jrxml --output template.json --fail-on-unsupported

# Personaliza el nombre de la lista inferida para la tabla
pdf-generator convert report.jrxml --output template.json --items-binding orders

# Fuerza el contenedor LoopElement en lugar de TableElement para la banda detail
pdf-generator convert report.jrxml --output template.json --disable-table-inference
```

Salida:
```
✓ Template converted successfully: /path/to/template.json
```

## cache

Gestiona las cachés de plantillas e imágenes.

### cache clear

Limpia las cachés para liberar memoria o forzar una recarga.

```bash
pdf-generator cache clear [options]
```

| Opción | Corta | Descripción |
|--------|-------|-------------|
| `--templates` | `-t` | Limpia solo la caché de plantillas |
| `--images` | `-i` | Limpia solo la caché de imágenes |

```bash
# Clear all caches
pdf-generator cache clear

# Clear only template cache
pdf-generator cache clear -t

# Clear only image cache
pdf-generator cache clear -i
```

### cache stats

Muestra estadísticas de la caché.

```bash
pdf-generator cache stats
```

Salida:
```
Cache Statistics
================
Templates cached: 5
Images cached: 23
```

## version

Muestra información de la versión.

```bash
pdf-generator version
```

### Salida

```
PDF Generator CLI v1.0.0
Core Library v1.0.0

Java: 17.0.5
OS: Mac OS X 14.0
```

## help

Muestra información de ayuda.

```bash
pdf-generator --help
pdf-generator generate --help
pdf-generator cache --help
```

## Códigos de salida

| Código | Descripción |
|------|-------------|
| `0` | Éxito |
| `1` | Error (plantilla inválida, archivo inexistente, etc.) |

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `JAVA_HOME` | Ruta de la instalación de Java |
| `PDF_GENERATOR_HOME` | Directorio de instalación personalizado |
| `PDF_GENERATOR_FONT_DIR` | Directorio de fuentes predeterminado |
| `PDF_GENERATOR_RESOURCES_DIR` | Directorio de recursos predeterminado |
