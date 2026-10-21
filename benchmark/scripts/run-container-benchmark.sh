#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

CPUS="${1:-2}"
MEMORY="${2:-1g}"
REQUESTS="${3:-500}"
CONCURRENCY="${4:-4}"

echo "================================================================="
echo "🐳 Running Container Benchmark (Open PDF vs Jasper)"
echo "   Limits: $CPUS CPUs, $MEMORY RAM | Workload: $REQUESTS docs ($CONCURRENCY threads)"
echo "================================================================="

echo "📦 1. Building Benchmark Shadow JAR..."
"$PROJECT_ROOT/benchmark/gradlew" shadowJar -p "$PROJECT_ROOT/benchmark"

echo "🔨 2. Building Docker Image..."
docker build -t open-pdf-benchmark -f "$PROJECT_ROOT/benchmark/Dockerfile" "$PROJECT_ROOT/benchmark"

echo "🚀 3. Executing Benchmark inside Container with cgroup limits..."
mkdir -p "$PROJECT_ROOT/benchmark/build/reports/benchmark"
docker run --rm \
  --cpus="$CPUS" \
  --memory="$MEMORY" \
  -v "$PROJECT_ROOT/benchmark/build/reports/benchmark:/app/build/reports/benchmark" \
  open-pdf-benchmark all "$REQUESTS" "$CONCURRENCY"

echo "📝 4. Updating Documentation..."
python3 "$PROJECT_ROOT/benchmark/scripts/format-results.py" \
  "$PROJECT_ROOT/benchmark/build/reports/benchmark/benchmark-summary.json" \
  "$PROJECT_ROOT/docs/lib/benchmark.md" \
  "$PROJECT_ROOT/benchmark/build/reports/benchmark/container-benchmark-summary.json"

echo "✅ Container benchmark completed successfully!"
