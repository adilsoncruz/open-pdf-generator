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
| `--data` | `-d` | Path to JSON data file |
| `--output` | `-o` | Output PDF path (default: `output.pdf`) |

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

Convert JasperReports JRXML template to Open PDF Generator JSON format.

```bash
pdf-generator convert <input.jrxml> [options]
```

### Arguments

| Argument | Description |
|----------|-------------|
| `input` | Path to the input `.jrxml` file (required) |

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--output` | Path to destination JSON template file | - |
| `--stdout` | Print converted JSON to standard output | `false` |
| `--fail-on-unsupported` | Fail conversion if an unsupported Jasper element is found | `false` |

### Examples

```bash
# Convert JRXML to template file
pdf-generator convert report.jrxml --output template.json

# Convert and output directly to stdout or pipe
pdf-generator convert report.jrxml --stdout > template.json

# Strict conversion failing on unknown tags
pdf-generator convert report.jrxml --output template.json --fail-on-unsupported
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
