#!/usr/bin/env bash
# Multi-language benchmark: Open PDF Generator CLI (Docker) vs Maroto (Go) vs pdfmake (Node.js)
#
# Usage:
#   run-multi-lang-benchmark.sh [target] [cpus] [memory] [trials_scale]
#     target        all | openpdf-cli | openpdf-native | openpdf-serve | go | node   (default: all)
#     cpus          container CPU quota            (default: 2)
#     memory        container memory quota         (default: 1g)
#     trials_scale  fraction of default trials      (default: 1.0, e.g. 0.2)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MULTILANG_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_ROOT="$(cd "$MULTILANG_DIR/../.." && pwd)"

TARGET="${1:-all}"
CPUS="${2:-2}"
MEMORY="${3:-1g}"
SCALE="${4:-1.0}"

REPORT_BASE="$PROJECT_ROOT/benchmark/build/reports/benchmark/multilang"

if ! command -v docker >/dev/null 2>&1; then
  echo "❌ docker is required for the multi-language benchmark" >&2
  exit 1
fi

mkdir -p "$REPORT_BASE"

echo "=================================================================="
echo "🌍 Multi-language benchmark: Open PDF CLI vs Maroto (Go) vs pdfmake (Node)"
echo "   Target: $TARGET | Limits: $CPUS CPUs / $MEMORY RAM | Trial scale: $SCALE"
echo "=================================================================="

run_engine() {
  local engine="$1"
  local image="${2:-open-pdf-bench:$engine}"
  local engine_env="${3:-$engine}"
  echo ""
  echo "🚀 Running engine: $engine"
  docker run --rm \
    --cpus="$CPUS" \
    --memory="$MEMORY" \
    -e "BENCH_TRIALS_SCALE=$SCALE" \
    -e "ENGINE=$engine_env" \
    -v "$REPORT_BASE/$engine:/app/reports" \
    "$image"
}

run_go() {
  run_engine "go" "open-pdf-bench:go" "maroto"
  run_engine "go-pdfgen-exec" "open-pdf-bench:go" "go-pdfgen-exec"
  run_engine "go-pdfgen-serve" "open-pdf-bench:go" "go-pdfgen-serve"
}

run_node() {
  run_engine "node" "open-pdf-bench:node" "pdfmake"
  run_engine "node-pdfgen-exec" "open-pdf-bench:node" "node-pdfgen-exec"
  run_engine "node-pdfgen-serve" "open-pdf-bench:node" "node-pdfgen-serve"
}

build_cli() {
  echo "📦 Building core + CLI shadow JAR..."
  "$PROJECT_ROOT/core/gradlew" -p "$PROJECT_ROOT/core" jar -q
  "$PROJECT_ROOT/tools/cli/gradlew" -p "$PROJECT_ROOT/tools/cli" shadowJar -q
}

build_openpdf_runner() {
  local jar
  jar="$(ls "$PROJECT_ROOT"/tools/cli/build/libs/pdf-generator-cli-*.jar | head -n 1)"
  echo "🔨 Building Open PDF CLI benchmark image..."
  docker build \
    --build-arg "JAR_FILE=${jar#"$PROJECT_ROOT"/}" \
    -t "open-pdf-bench:openpdf-cli" \
    -f "$MULTILANG_DIR/openpdf/Dockerfile" \
    "$PROJECT_ROOT"
}

build_go_runner() {
  echo "🔨 Building Go benchmark image (Maroto + Go-invoked pdf-generator)..."
  docker build -f "$MULTILANG_DIR/go/Dockerfile" -t "open-pdf-bench:go" "$PROJECT_ROOT"
}

build_node_runner() {
  echo "🔨 Building Node.js benchmark image (pdfmake + Node-invoked pdf-generator)..."
  docker build -f "$MULTILANG_DIR/node/Dockerfile" -t "open-pdf-bench:node" "$PROJECT_ROOT"
}

build_native_runner() {
  echo "🔨 Building GraalVM native binary image (slow: native-image compilation)..."
  docker build \
    -f "$PROJECT_ROOT/tools/cli/Dockerfile.native" \
    -t "open-pdf-generator:native" \
    "$PROJECT_ROOT"
  docker build \
    -f "$MULTILANG_DIR/openpdf/Dockerfile.native" \
    -t "open-pdf-bench:openpdf-native" \
    "$PROJECT_ROOT"
}

build_serve_runner() {
  echo "🔨 Building resident serve image (native binary + NDJSON driver)..."
  docker build \
    -f "$PROJECT_ROOT/tools/cli/Dockerfile.native" \
    -t "open-pdf-generator:native" \
    "$PROJECT_ROOT"
  docker build \
    -f "$MULTILANG_DIR/openpdf/Dockerfile.serve" \
    -t "open-pdf-bench:openpdf-serve" \
    "$PROJECT_ROOT"
}

case "$TARGET" in
  all)
    build_cli
    build_openpdf_runner
    build_native_runner
    build_serve_runner
    build_go_runner
    build_node_runner
    run_engine openpdf-cli
    run_engine openpdf-native
    run_engine openpdf-serve
    run_go
    run_node
    ;;
  openpdf-cli)
    build_cli
    build_openpdf_runner
    run_engine openpdf-cli
    ;;
  openpdf-native)
    build_native_runner
    run_engine openpdf-native
    ;;
  openpdf-serve)
    build_serve_runner
    run_engine openpdf-serve
    ;;
  go)
    build_go_runner
    run_go
    ;;
  node)
    build_node_runner
    run_node
    ;;
  go-maroto)
    build_go_runner
    run_engine "go" "open-pdf-bench:go" "maroto"
    ;;
  go-pdfgen-exec)
    build_go_runner
    run_engine "go-pdfgen-exec" "open-pdf-bench:go" "go-pdfgen-exec"
    ;;
  go-pdfgen-serve)
    build_go_runner
    run_engine "go-pdfgen-serve" "open-pdf-bench:go" "go-pdfgen-serve"
    ;;
  node-pdfmake)
    build_node_runner
    run_engine "node" "open-pdf-bench:node" "pdfmake"
    ;;
  node-pdfgen-exec)
    build_node_runner
    run_engine "node-pdfgen-exec" "open-pdf-bench:node" "node-pdfgen-exec"
    ;;
  node-pdfgen-serve)
    build_node_runner
    run_engine "node-pdfgen-serve" "open-pdf-bench:node" "node-pdfgen-serve"
    ;;
  *)
    echo "❌ Unknown target: $TARGET (use all | openpdf-cli | openpdf-native | openpdf-serve | go | node | go-maroto | go-pdfgen-exec | go-pdfgen-serve | node-pdfmake | node-pdfgen-exec | node-pdfgen-serve)" >&2
    exit 1
    ;;
esac

echo ""
echo "📝 Aggregating results..."
python3 "$SCRIPT_DIR/aggregate-results.py" \
  "$REPORT_BASE" \
  "$PROJECT_ROOT/docs/lib/benchmark-multilang.md" \
  "$CPUS CPUs | $MEMORY RAM"

echo "✅ Multi-language benchmark done. Report: docs/lib/benchmark-multilang.md"
