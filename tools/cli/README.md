# PDF Generator CLI

Command-line interface for generating PDFs from JSON templates.

## Installation

### From JitPack

```bash
# Download the latest release
curl -L https://jitpack.io/com/github/user/open-pdf-generator/cli/1.0.0/cli-1.0.0.jar -o pdf-generator-cli.jar

# Make it executable (optional)
alias pdf-generator="java -jar pdf-generator-cli.jar"
```

### From Source

```bash
cd tools/cli
../gradlew shadowJar
java -jar build/libs/pdf-generator-cli-1.0.0.jar
```

## Usage

### Generate PDF

```bash
# Basic usage
pdf-generator generate template.json

# With data file
pdf-generator generate template.json -d data.json

# Specify output file
pdf-generator generate template.json -d data.json -o invoice.pdf
```

### Validate Template

```bash
pdf-generator validate template.json
```

### Convert Jasper (JRXML -> JSON)

```bash
# Save converted template to file
pdf-generator convert invoice.jrxml -o invoice-template.json

# Print converted template to stdout
pdf-generator convert invoice.jrxml --stdout
```

### Version

```bash
pdf-generator version
```

## Examples

### Invoice Generation

```bash
pdf-generator generate examples/invoice-template.json \
  -d examples/invoice-data.json \
  -o invoice.pdf
```

### Report with Multiple Pages

```bash
pdf-generator generate examples/report-template.json \
  -d examples/report-data.json \
  -o report.pdf
```

## Exit Codes

- `0` - Success
- `1` - Error (invalid template, missing file, etc.)

## Development

```bash
# Run in development
../gradlew run --args="generate template.json"

# Run tests
../gradlew test

# Build fat JAR
../gradlew shadowJar
```

## License

LGPL-3.0


