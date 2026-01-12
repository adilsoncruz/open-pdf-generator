# PDF Generator CLI

Command-line interface for generating PDFs from JSON templates.

## Overview

The CLI allows you to generate PDFs directly from the terminal, perfect for:

- **Automation** - Integrate PDF generation into scripts and workflows
- **CI/CD** - Generate documents as part of your build pipeline
- **Batch Processing** - Process multiple templates at once
- **Testing** - Quickly validate templates without writing code

## Quick Start

```bash
# Generate a PDF
pdf-generator generate template.json -d data.json -o output.pdf

# Validate a template
pdf-generator validate template.json

# Show version
pdf-generator version
```

## Features

| Feature | Description |
|---------|-------------|
| **Generate** | Create PDFs from templates and data |
| **Validate** | Check templates for errors |
| **Batch** | Process multiple files |
| **Formats** | Support for JSON templates |

## Requirements

- **Java 17+** - The CLI runs on the JVM
- **~6 MB** - Standalone JAR file

## Next Steps

- [Installation](./installation.md) - How to install the CLI
- [Commands](./commands.md) - Available commands and options
- [Examples](./examples.md) - Real-world usage examples



