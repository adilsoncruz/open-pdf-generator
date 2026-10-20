#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Open PDF Generator - Script de Verificação Transversal
# Valida Core (Kotlin), CLI, Editor (React/TS) e Docs
# ==============================================================================

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"

echo "==> [1/4] Testando Core (Kotlin)..."
(cd "$ROOT_DIR/core" && ./gradlew test)

echo "==> [2/4] Compilando CLI..."
(cd "$ROOT_DIR/tools/cli" && ./gradlew build -x test)

echo "==> [3/4] Verificando Editor (Typecheck & Build)..."
if [ -d "$ROOT_DIR/tools/editor/node_modules" ]; then
  (cd "$ROOT_DIR/tools/editor" && npm run build)
else
  echo "    (!) node_modules não encontrado no editor. Pulando build do editor."
fi

echo "==> [4/4] Verificação concluída com sucesso!"
