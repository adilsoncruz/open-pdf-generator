# CLI de PDF Generator

Interfaz de línea de comandos para generar PDFs a partir de plantillas JSON.

## Visión General

La CLI te permite generar PDFs directamente desde la terminal, perfecto para:

- **Automatización** - Integra la generación de PDFs en scripts y flujos de trabajo
- **CI/CD** - Genera documentos como parte de tu pipeline de build
- **Procesamiento por Lotes** - Procesa múltiples plantillas a la vez
- **Testing** - Valida plantillas rápidamente sin escribir código

## Inicio Rápido

```bash
# Generar un PDF
pdf-generator generate template.json -d data.json -o output.pdf

# Validar una plantilla
pdf-generator validate template.json

# Mostrar la versión
pdf-generator version
```

## Características

| Característica | Descripción |
|----------------|-------------|
| **Generate** | Crea PDFs a partir de plantillas y datos |
| **Validate** | Verifica plantillas en busca de errores |
| **Batch** | Procesa múltiples archivos |
| **Formats** | Soporte para plantillas JSON |

## Requisitos

- **Java 17+** - La CLI se ejecuta sobre la JVM
- **~6 MB** - Archivo JAR standalone

## Próximos Pasos

- [Instalación](/es/cli/installation) - Cómo instalar la CLI
- [Comandos](/cli/commands) - Comandos y opciones disponibles
- [Ejemplos](/cli/examples) - Ejemplos de uso del mundo real
