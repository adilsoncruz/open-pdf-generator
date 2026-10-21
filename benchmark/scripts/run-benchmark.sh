#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "📦 1. Building Core Library..."
"$PROJECT_ROOT/core/gradlew" jar -p "$PROJECT_ROOT/core"

echo "🚀 2. Running Benchmark Suite..."
"$PROJECT_ROOT/benchmark/gradlew" run -p "$PROJECT_ROOT/benchmark"

echo "📝 3. Formatting Results to Markdown..."
python3 "$PROJECT_ROOT/benchmark/scripts/format-results.py" \
  "$PROJECT_ROOT/benchmark/build/reports/benchmark/benchmark-summary.json" \
  "$PROJECT_ROOT/docs/lib/benchmark.md"

echo "✅ All done! Benchmark results updated in docs/lib/benchmark.md"
