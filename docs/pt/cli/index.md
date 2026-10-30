# CLI do PDF Generator

Interface de linha de comando para gerar PDFs a partir de templates JSON.

## Visão Geral

A CLI permite gerar PDFs diretamente do terminal, ideal para:

- **Automação** - Integre a geração de PDFs em scripts e workflows
- **CI/CD** - Gere documentos como parte do seu pipeline de build
- **Processamento em Lote** - Processe múltiplos templates de uma vez
- **Testes** - Valide templates rapidamente sem escrever código

## Início Rápido

```bash
# Generate a PDF
pdf-generator generate template.json -d data.json -o output.pdf

# Validate a template
pdf-generator validate template.json

# Show version
pdf-generator version
```

## Funcionalidades

| Funcionalidade | Descrição |
|----------------|-----------|
| **Generate** | Crie PDFs a partir de templates e dados |
| **Validate** | Verifique templates em busca de erros |
| **Batch** | Processe múltiplos arquivos |
| **Formats** | Suporte a templates JSON |

## Requisitos

- **Java 17+** - A CLI roda na JVM
- **~6 MB** - Arquivo JAR standalone

## Próximos Passos

- [Instalação](./installation.md) - Como instalar a CLI
- [Comandos](/cli/commands) - Comandos e opções disponíveis
- [Exemplos](/cli/examples) - Exemplos de uso no mundo real
