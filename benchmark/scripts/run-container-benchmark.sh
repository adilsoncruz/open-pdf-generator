#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

TARGET="${1:-all}"
CPUS="${2:-2}"
MEMORY="${3:-1g}"
REQUESTS="${4:-500}"
CONCURRENCY="${5:-4}"

echo "================================================================="
echo "🐳 Running Container Benchmark (Open PDF vs Jasper 6 & 7)"
echo "   Target: $TARGET | Limits: $CPUS CPUs, $MEMORY RAM | Workload: $REQUESTS docs ($CONCURRENCY threads)"
echo "================================================================="

mkdir -p "$PROJECT_ROOT/benchmark/build/reports/benchmark"

run_benchmark() {
  local version="$1"
  echo ""
  echo "📦 Building Benchmark Shadow JAR for $version..."
  "$PROJECT_ROOT/benchmark/gradlew" ":$version:shadowJar" -p "$PROJECT_ROOT/benchmark"

  echo "🔨 Building Docker Image for $version..."
  docker build \
    --build-arg "JAR_FILE=$version/build/libs/open-pdf-benchmark-$version.jar" \
    -t "open-pdf-benchmark:$version" \
    -f "$PROJECT_ROOT/benchmark/Dockerfile" \
    "$PROJECT_ROOT/benchmark"

  echo "🚀 Executing Benchmark for $version inside container ($CPUS CPUs, $MEMORY RAM)..."
  docker run --rm \
    --cpus="$CPUS" \
    --memory="$MEMORY" \
    -v "$PROJECT_ROOT/benchmark/build/reports/benchmark:/app/build/reports/benchmark" \
    "open-pdf-benchmark:$version" all "$REQUESTS" "$CONCURRENCY"

  cp "$PROJECT_ROOT/benchmark/build/reports/benchmark/container-benchmark-summary.json" \
     "$PROJECT_ROOT/benchmark/build/reports/benchmark/container-benchmark-$version-summary.json"
}

if [ "$TARGET" = "jasper6" ]; then
  run_benchmark "jasper6"
elif [ "$TARGET" = "jasper7" ]; then
  run_benchmark "jasper7"
else
  run_benchmark "jasper6"
  echo "Cooling down between runs..."
  sleep 3
  run_benchmark "jasper7"
fi

echo ""
echo "✅ All container benchmarks completed successfully!"
