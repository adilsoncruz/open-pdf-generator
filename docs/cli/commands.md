# Commands

## generate

Generate a PDF from a template and optional data file.

```bash
pdf-generator generate <template> [options]
```

### Arguments

| Argument | Description |
|----------|-------------|
| `template` | Path to the JSON template file (required) |

### Output Options

| Option | Short | Description |
|--------|-------|-------------|
| `--data` | `-d` | Path to JSON data file, or `-` to read from stdin |
| `--output` | `-o` | Output PDF path (default: `output.pdf`), or `-` to stream to stdout |

### Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `--font-dir` | Directory containing custom fonts | - |
| `--default-font` | Default font to use | `Helvetica` |
| `--resources-dir` | Base directory for resources (images, fonts) | - |

### Cache Options

| Option | Description | Default |
|--------|-------------|---------|
| `--no-image-cache` | Disable image caching | `false` |
| `--image-cache-size` | Maximum number of images to cache | `100` |
| `--clear-cache` | Clear all caches before generating | `false` |

### Mode Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--strict` | | Enable strict mode (fail on errors) | `true` |
| `--no-strict` | | Disable strict mode (continue on errors) | - |
| `--verbose` | `-v` | Enable verbose output | `false` |

### Examples

```bash
# Basic usage
pdf-generator generate invoice.json

# With data file
pdf-generator generate invoice.json -d customer-data.json

# Specify output file
pdf-generator generate invoice.json -d data.json -o invoices/invoice-001.pdf

# Pipe JSON in and PDF out (any host language / Docker)
cat data.json | pdf-generator generate invoice.json -d - -o - > invoice.pdf

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

## serve

Generate PDFs over a warm NDJSON loop on stdin/stdout. One line in, one line out — a
request is still a single PDF, but the process stays alive, so there is no start-up,
template parsing or font initialisation per document.

```bash
pdf-generator serve [options]
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--font-dir` | Directory containing custom fonts | - |
| `--default-font` | Default font to use | `Helvetica` |
| `--resources-dir` | Base directory for resources (images, fonts) | - |
| `--image-cache-size` | Maximum number of images to cache | `100` |
| `--no-image-cache` | Disable image caching | `false` |
| `--strict` / `--no-strict` | Fail or continue on errors | `true` |
| `--preload` | Template to parse before serving (repeatable) | - |
| `--max-request-bytes` | Reject request lines larger than this | `16777216` |
| `--verbose` | Log each request and its timing to stderr | `false` |

### Protocol

Requests are processed sequentially; a failing request returns an error line and never
stops the server. `serve: ready` is written to **stderr**, so stdout carries only responses.

**Request**

```json
{"id":1,"template":"/templates/invoice.json","data":{"invoiceNumber":"INV-001"},"outputPath":"/tmp/inv.pdf"}
```

| Field | Required | Description |
|-------|----------|-------------|
| `id` | no | Echoed back in the response (any JSON scalar) |
| `template` | yes | Path to the JSON template |
| `data` | no | JSON object with the bindings (default: `{}`) |
| `outputPath` | no | Write the PDF to this file and omit `pdf` from the response |

**Response**

```json
{"id":1,"ok":true,"bytes":2537,"ms":0.41,"pdf":"JVBERi0xLjQK..."}
{"id":1,"ok":false,"error":"Template not found: '/templates/nope.json'"}
```

Templates are cached per path and reloaded automatically when the file changes, so a
long-lived server picks up edited templates without a restart.

### Examples

```bash
# Interactive: one request per line
printf '%s\n' '{"id":1,"template":"invoice.json","data":{}}' | pdf-generator serve

# Docker sidecar (started once, called per request)
docker run --rm -i -v "$PWD/templates:/templates:ro" \
  open-pdf-generator:native serve --preload /templates/invoice.json
```

```go
// Go: see complete runnable example in docs/cli/examples.md
reqBytes, _ := json.Marshal(map[string]any{"id": 1, "template": "/templates/invoice.json", "data": data})
stdin.Write(append(reqBytes, '\n'))
scanner.Scan()
var resp struct { OK bool; PDF string }
json.Unmarshal(scanner.Bytes(), &resp)
pdfBytes, _ := base64.StdEncoding.DecodeString(resp.PDF)
```

```javascript
// Node.js: see complete runnable example in docs/cli/examples.md
child.stdin.write(JSON.stringify({ id: 1, template: "/templates/invoice.json", data }) + "\n");
const response = JSON.parse(await nextLine(child.stdout));
const pdfBuffer = Buffer.from(response.pdf, "base64");
```

> 💡 For full copy-and-paste runnable scripts with connection management and error handling, see [Examples](./examples.md#go-integration).

## validate

Validate a template file for errors.

```bash
pdf-generator validate <template> [options]
```

### Arguments

| Argument | Description |
|----------|-------------|
| `template` | Path to the JSON template file (required) |

### Options

| Option | Short | Description |
|--------|-------|-------------|
| `--verbose` | `-v` | Show template details |

### Examples

```bash
# Validate a template
pdf-generator validate invoice.json

# Validate with details
pdf-generator validate invoice.json -v
```

### Output

On success:
```
Validating template: invoice.json
✓ Template is valid
```

With verbose:
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

On error:
```
Validating template: broken.json
✗ Template validation failed: Unknown element type "textt" at line 15
```

## convert

Convert JasperReports JRXML template (**version 6.x**) to Open PDF Generator JSON format.

::: tip JasperReports Version Compatibility
The converter supports templates created for **JasperReports 6.x** (traditional schema using namespace `http://jasperreports.sourceforge.net/jasperreports`, `<staticText>`, `<textField>`, `<reportElement>`, and `<band>` elements). **JasperReports 7.x** templates (which migrated to the redesigned `<element kind="...">` syntax) are not directly supported by this converter.
:::

```bash
pdf-generator convert <input.jrxml> [options]
```

### Arguments

| Argument | Description |
|----------|-------------|
| `input` | Path to the input `.jrxml` file (required, JasperReports 6.x format) |

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--output` | Path to destination JSON template file | - |
| `--stdout` | Print converted JSON to standard output | `false` |
| `--fail-on-unsupported` | Fail conversion if an unsupported Jasper element is found | `false` |
| `--items-binding` | Data binding property name for inferred tables or loops | `items` |
| `--disable-table-inference` | Disable automatic TableElement inference and force LoopElement for detail bands | `false` |

### Examples

```bash
# Convert JRXML (Jasper 6.x) to template file
pdf-generator convert report.jrxml --output template.json

# Convert and output directly to stdout or pipe
pdf-generator convert report.jrxml --stdout > template.json

# Strict conversion failing on unknown tags
pdf-generator convert report.jrxml --output template.json --fail-on-unsupported

# Customize items data binding list name for inferred tables
pdf-generator convert report.jrxml --output template.json --items-binding orders

# Force LoopElement container instead of TableElement for detail bands
pdf-generator convert report.jrxml --output template.json --disable-table-inference
```

Output:
```
✓ Template converted successfully: /path/to/template.json
```

## cache

Manage template and image caches.

### cache clear

Clear caches to free memory or force reload.

```bash
pdf-generator cache clear [options]
```

| Option | Short | Description |
|--------|-------|-------------|
| `--templates` | `-t` | Clear only template cache |
| `--images` | `-i` | Clear only image cache |

```bash
# Clear all caches
pdf-generator cache clear

# Clear only template cache
pdf-generator cache clear -t

# Clear only image cache
pdf-generator cache clear -i
```

### cache stats

Show cache statistics.

```bash
pdf-generator cache stats
```

Output:
```
Cache Statistics
================
Templates cached: 5
Images cached: 23
```

## version

Display version information.

```bash
pdf-generator version
```

### Output

```
PDF Generator CLI v1.0.0
Core Library v1.0.0

Java: 17.0.5
OS: Mac OS X 14.0
```

## help

Display help information.

```bash
pdf-generator --help
pdf-generator generate --help
pdf-generator cache --help
```

## Exit Codes

| Code | Description |
|------|-------------|
| `0` | Success |
| `1` | Error (invalid template, missing file, etc.) |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `JAVA_HOME` | Path to Java installation |
| `PDF_GENERATOR_HOME` | Custom installation directory |
| `PDF_GENERATOR_FONT_DIR` | Default font directory |
| `PDF_GENERATOR_RESOURCES_DIR` | Default resources directory |
