#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Open PDF Generator - Script de Teste e Validação de Template via CLI
# Uso: run-template-test.sh [caminho-template.json] [caminho-dados.json] [saida.pdf]
# ==============================================================================

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
CLI_DIR="$ROOT_DIR/tools/cli"

TEMPLATE="${1:-$CLI_DIR/teste-simple.json}"
DATA="${2:-}"
OUTPUT="${3:-$CLI_DIR/output.pdf}"

if [ ! -f "$TEMPLATE" ]; then
  echo "Erro: Template '$TEMPLATE' não encontrado."
  exit 1
fi

echo "==> [1/3] Garantindo build da CLI..."
(cd "$CLI_DIR" && ./gradlew build -x test --quiet)

JAR_FILE=$(find "$CLI_DIR/build/libs" -name "cli-*.jar" ! -name "*-plain.jar" | head -n 1)
if [ -z "$JAR_FILE" ]; then
  echo "Erro: JAR da CLI não foi localizado em build/libs."
  exit 1
fi

echo "==> [2/3] Validando template JSON..."
java -jar "$JAR_FILE" validate "$TEMPLATE"

echo "==> [3/3] Gerando PDF de teste..."
if [ -n "$DATA" ] && [ -f "$DATA" ]; then
  java -jar "$JAR_FILE" generate "$TEMPLATE" -d "$DATA" -o "$OUTPUT"
else
  java -jar "$JAR_FILE" generate "$TEMPLATE" -o "$OUTPUT"
fi

echo "==> Sucesso! PDF gerado em: $OUTPUT"
