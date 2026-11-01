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
| **Generate** | Create PDFs from templates and data (supports stdin/stdout piping) |
| **Serve** | Resident NDJSON daemon for instant generation (<1ms per PDF) |
| **Validate** | Check templates for errors |
| **Batch** | Process multiple files |
| **Native & Docker** | Run via GraalVM native binary without JVM or in Docker |

## Requirements

- **Standalone Native Binary / Docker** - No JVM required, instant start-up (~10 ms)
- **Or Java 17+** - If running the standalone JAR (`pdf-generator.jar`)

## Next Steps

- [Installation](./installation.md) - How to install the CLI (JAR, native binary or Docker)
- [Commands](./commands.md) - Available commands (`generate`, `serve`, `validate`)
- [Examples](./examples.md) - Real-world usage examples (Bash, Go, Node.js)
- [⚡ Benchmark](/lib/benchmark-multilang) - Performance comparison against Go (Maroto) and Node.js (pdfmake)



