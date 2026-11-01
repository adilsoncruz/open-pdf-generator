# Benchmark: Open PDF Generator CLI vs Maroto (Go) vs pdfmake (Node.js)

Reproducible comparison of the **Open PDF Generator CLI running in Docker** against the two most popular PDF libraries used by Go and Node.js services, under identical data volumes, container limits and trial counts.

## Method

- **Generation models are intentionally different and labeled**: the CLI is measured in three flavors — `openpdf-cli` (JVM: one `java -jar` per document inside the container, JVM boot included), `openpdf-native` (GraalVM native binary: one process per document, **no JVM**) and `openpdf-serve` (the same binary running as a resident `serve` process, one NDJSON request per document — no process start-up at all). Maroto and pdfmake run **in-process** in their native runtimes.
- Data is generated per trial with the same formulas in all three languages (`BenchmarkDataFactory`): invoice (10 items), listing (100 and 1000 rows), complex (QR + barcode + conditionals).
- Metrics: p50/p95/mean latency, throughput (docs/s), average PDF size and peak memory (JVM child-process RSS for the CLI; runtime-sampled RSS/heap for Maroto and pdfmake).
- Container limits: **2 CPUs | 1g RAM**. Trial scale: 1.0 (full) unless noted.

## Engines

| Engine | Language / runtime | Generation model |
|---|---|---|
| Open PDF Generator CLI (JVM, exec) | `kotlin/jvm (CLI)` | `exec-per-document (docker)` |
| Open PDF Generator CLI (native binary) | `GraalVM native-image (Kotlin)` | `exec-per-document (native binary)` |
| Open PDF Generator CLI (native, resident `serve`) | `GraalVM native-image (Kotlin)` | `resident NDJSON process` |
| Maroto (Go, in-process) | `go1.27.3` | `in-process` |
| Go -> pdf-generator (native, exec) | `go1.27.3` | `exec-per-document (from Go)` |
| Go -> pdf-generator (native, serve) | `go1.27.3` | `resident serve via NDJSON (from Go)` |
| pdfmake (Node.js, in-process) | `node v22.23.4` | `in-process` |
| Node.js -> pdf-generator (native, exec) | `node v22.23.4` | `exec-per-document (from Node)` |
| Node.js -> pdf-generator (native, serve) | `node v22.23.4` | `resident serve via NDJSON (from Node)` |

## Reproduce

```bash
# Full run (2 CPUs / 1g per container)
bash benchmark/multi-lang/scripts/run-multi-lang-benchmark.sh

# Quick run (20% of trials) or a single engine
bash benchmark/multi-lang/scripts/run-multi-lang-benchmark.sh all 2 1g 0.2
bash benchmark/multi-lang/scripts/run-multi-lang-benchmark.sh go
bash benchmark/multi-lang/scripts/run-multi-lang-benchmark.sh openpdf-native
bash benchmark/multi-lang/scripts/run-multi-lang-benchmark.sh openpdf-serve
```

## Integration guidance

- Use **`serve`** for per-request PDF APIs: one long-lived container, one NDJSON request per document, no process start-up and no re-parsing of templates.
- Use the **native binary** when the integration model is one short-lived process per document (`docker run` per call); it still removes the JVM but pays ~10–20 ms of fixed start-up.
- Use the **JVM CLI** when you need the JAR itself (plugins, custom JVM options) and can keep a warm worker.
- Native host-language libraries (Maroto, pdfmake) are competitive in-process, but you re-implement layout in each language and lose template portability.
- Embedding the `core` JAR in a JVM service remains an option (see the [Jasper comparison](/lib/benchmark)).

## Scenario: `invoice`

| Engine | Trials | p50 (ms) | p95 (ms) | Mean (ms) | Throughput (docs/s) | Avg PDF (KB) | Peak mem (MB) |
|---|---|---|---|---|---|---|---|
| Open PDF Generator CLI (JVM, exec) | 300 | 263.34 | 292.88 | 265.24 | 3.8 | 2.5 | 75.8 |
| Open PDF Generator CLI (native binary) | 300 | 12.13 | 13.82 | 12.34 | 80.0 | 2.5 | 46.0 |
| Open PDF Generator CLI (native, resident `serve`) | 30 | 0.71 | 0.91 | 0.86 | 1098.3 | 2.5 | 84.1 |
| Maroto (Go, in-process) | 30 | 5.74 | 5.97 | 5.72 | 172.2 | 12.5 | 12.8 |
| Go -> pdf-generator (native, exec) | 30 | 9.88 | 10.51 | 9.96 | 100.3 | 2.5 | 12.0 |
| Go -> pdf-generator (native, serve) | 30 | 0.60 | 1.95 | 0.77 | 1283.4 | 2.5 | 12.0 |
| pdfmake (Node.js, in-process) | 30 | 6.95 | 10.09 | 7.43 | 134.1 | 17.7 | 96.8 |
| Node.js -> pdf-generator (native, exec) | 30 | 10.44 | 11.12 | 10.47 | 95.4 | 2.5 | 69.0 |
| Node.js -> pdf-generator (native, serve) | 30 | 0.57 | 0.86 | 0.69 | 1415.3 | 2.5 | 67.7 |

**Relative to the CLI exec model (p50, lower is faster):**

- Open PDF Generator CLI (native binary): **21.7x faster** than the CLI container model.
- Open PDF Generator CLI (native, resident `serve`): **370.9x faster** than the CLI container model.
- Maroto (Go, in-process): **45.9x faster** than the CLI container model.
- Go -> pdf-generator (native, exec): **26.7x faster** than the CLI container model.
- Go -> pdf-generator (native, serve): **438.9x faster** than the CLI container model.
- pdfmake (Node.js, in-process): **37.9x faster** than the CLI container model.
- Node.js -> pdf-generator (native, exec): **25.2x faster** than the CLI container model.
- Node.js -> pdf-generator (native, serve): **462.0x faster** than the CLI container model.

**Go ecosystem (Maroto vs Open PDF Generator):**

- Go -> pdf-generator (exec): **1.7x slower** than Maroto in-process (p50: 9.88 ms vs 5.74 ms).
- Go -> pdf-generator (serve): **9.6x faster** than Maroto in-process (p50: 0.60 ms vs 5.74 ms).

**Node.js ecosystem (pdfmake vs Open PDF Generator):**

- Node.js -> pdf-generator (exec): **1.5x slower** than pdfmake in-process (p50: 10.44 ms vs 6.95 ms).
- Node.js -> pdf-generator (serve): **12.2x faster** than pdfmake in-process (p50: 0.57 ms vs 6.95 ms).

## Scenario: `listing_100`

| Engine | Trials | p50 (ms) | p95 (ms) | Mean (ms) | Throughput (docs/s) | Avg PDF (KB) | Peak mem (MB) |
|---|---|---|---|---|---|---|---|
| Open PDF Generator CLI (JVM, exec) | 150 | 285.21 | 293.24 | 284.93 | 3.5 | 15.5 | 84.9 |
| Open PDF Generator CLI (native binary) | 150 | 17.95 | 19.56 | 18.09 | 53.9 | 15.5 | 58.6 |
| Open PDF Generator CLI (native, resident `serve`) | 15 | 3.48 | 7.58 | 4.22 | 221.2 | 15.5 | 110.0 |
| Maroto (Go, in-process) | 15 | 64.55 | 65.60 | 64.61 | 15.4 | 125.3 | 12.8 |
| Go -> pdf-generator (native, exec) | 15 | 15.32 | 15.85 | 15.32 | 65.1 | 15.5 | 16.5 |
| Go -> pdf-generator (native, serve) | 15 | 3.55 | 6.23 | 3.90 | 254.3 | 15.5 | 12.6 |
| pdfmake (Node.js, in-process) | 15 | 15.67 | 24.79 | 18.09 | 55.2 | 30.4 | 108.8 |
| Node.js -> pdf-generator (native, exec) | 15 | 15.63 | 16.46 | 15.67 | 63.7 | 15.5 | 71.2 |
| Node.js -> pdf-generator (native, serve) | 15 | 3.33 | 5.86 | 3.64 | 273.8 | 15.5 | 69.6 |

**Relative to the CLI exec model (p50, lower is faster):**

- Open PDF Generator CLI (native binary): **15.9x faster** than the CLI container model.
- Open PDF Generator CLI (native, resident `serve`): **82.0x faster** than the CLI container model.
- Maroto (Go, in-process): **4.4x faster** than the CLI container model.
- Go -> pdf-generator (native, exec): **18.6x faster** than the CLI container model.
- Go -> pdf-generator (native, serve): **80.3x faster** than the CLI container model.
- pdfmake (Node.js, in-process): **18.2x faster** than the CLI container model.
- Node.js -> pdf-generator (native, exec): **18.2x faster** than the CLI container model.
- Node.js -> pdf-generator (native, serve): **85.6x faster** than the CLI container model.

**Go ecosystem (Maroto vs Open PDF Generator):**

- Go -> pdf-generator (exec): **4.2x faster** than Maroto in-process (p50: 15.32 ms vs 64.55 ms).
- Go -> pdf-generator (serve): **18.2x faster** than Maroto in-process (p50: 3.55 ms vs 64.55 ms).

**Node.js ecosystem (pdfmake vs Open PDF Generator):**

- Node.js -> pdf-generator (exec): **1.0x faster** than pdfmake in-process (p50: 15.63 ms vs 15.67 ms).
- Node.js -> pdf-generator (serve): **4.7x faster** than pdfmake in-process (p50: 3.33 ms vs 15.67 ms).

## Scenario: `complex`

| Engine | Trials | p50 (ms) | p95 (ms) | Mean (ms) | Throughput (docs/s) | Avg PDF (KB) | Peak mem (MB) |
|---|---|---|---|---|---|---|---|
| Open PDF Generator CLI (JVM, exec) | 150 | 278.45 | 311.28 | 283.27 | 3.5 | 3.5 | 84.9 |
| Open PDF Generator CLI (native binary) | 150 | 14.40 | 15.90 | 14.52 | 67.8 | 3.5 | 58.6 |
| Open PDF Generator CLI (native, resident `serve`) | 15 | 0.72 | 0.85 | 0.73 | 1241.5 | 3.5 | 110.6 |
| Maroto (Go, in-process) | 15 | 6.95 | 7.33 | 6.99 | 142.3 | 14.7 | 12.8 |
| Go -> pdf-generator (native, exec) | 15 | 12.52 | 12.96 | 12.49 | 79.9 | 3.5 | 16.8 |
| Go -> pdf-generator (native, serve) | 15 | 0.65 | 1.26 | 0.72 | 1346.8 | 3.5 | 12.6 |
| pdfmake (Node.js, in-process) | 15 | 6.47 | 10.30 | 6.95 | 143.5 | 17.4 | 112.2 |
| Node.js -> pdf-generator (native, exec) | 15 | 13.14 | 13.83 | 13.08 | 76.3 | 3.5 | 71.2 |
| Node.js -> pdf-generator (native, serve) | 15 | 0.71 | 1.14 | 0.77 | 1287.4 | 3.5 | 69.6 |

**Relative to the CLI exec model (p50, lower is faster):**

- Open PDF Generator CLI (native binary): **19.3x faster** than the CLI container model.
- Open PDF Generator CLI (native, resident `serve`): **386.7x faster** than the CLI container model.
- Maroto (Go, in-process): **40.1x faster** than the CLI container model.
- Go -> pdf-generator (native, exec): **22.2x faster** than the CLI container model.
- Go -> pdf-generator (native, serve): **428.4x faster** than the CLI container model.
- pdfmake (Node.js, in-process): **43.0x faster** than the CLI container model.
- Node.js -> pdf-generator (native, exec): **21.2x faster** than the CLI container model.
- Node.js -> pdf-generator (native, serve): **392.2x faster** than the CLI container model.

**Go ecosystem (Maroto vs Open PDF Generator):**

- Go -> pdf-generator (exec): **1.8x slower** than Maroto in-process (p50: 12.52 ms vs 6.95 ms).
- Go -> pdf-generator (serve): **10.7x faster** than Maroto in-process (p50: 0.65 ms vs 6.95 ms).

**Node.js ecosystem (pdfmake vs Open PDF Generator):**

- Node.js -> pdf-generator (exec): **2.0x slower** than pdfmake in-process (p50: 13.14 ms vs 6.47 ms).
- Node.js -> pdf-generator (serve): **9.1x faster** than pdfmake in-process (p50: 0.71 ms vs 6.47 ms).

## Scenario: `massive_1000`

| Engine | Trials | p50 (ms) | p95 (ms) | Mean (ms) | Throughput (docs/s) | Avg PDF (KB) | Peak mem (MB) |
|---|---|---|---|---|---|---|---|
| Open PDF Generator CLI (JVM, exec) | 12 | 395.32 | 415.24 | 395.87 | 2.3 | 148.8 | 95.2 |
| Open PDF Generator CLI (native binary) | 12 | 65.73 | 68.61 | 65.73 | 13.4 | 148.8 | 99.8 |
| Open PDF Generator CLI (native, resident `serve`) | 3 | 40.04 | 40.52 | 38.91 | 19.0 | 148.8 | 127.7 |
| Maroto (Go, in-process) | 3 | 655.99 | 662.84 | 653.08 | 1.5 | 1230.9 | 20.9 |
| Go -> pdf-generator (native, exec) | 3 | 59.30 | 61.35 | 59.89 | 16.6 | 148.8 | 16.9 |
| Go -> pdf-generator (native, serve) | 3 | 42.54 | 45.51 | 42.91 | 23.2 | 148.8 | 12.6 |
| pdfmake (Node.js, in-process) | 3 | 117.69 | 118.34 | 116.78 | 8.6 | 198.0 | 136.5 |
| Node.js -> pdf-generator (native, exec) | 3 | 59.19 | 63.53 | 60.63 | 16.5 | 148.8 | 72.6 |
| Node.js -> pdf-generator (native, serve) | 3 | 38.60 | 41.57 | 38.93 | 25.7 | 148.8 | 72.3 |

**Relative to the CLI exec model (p50, lower is faster):**

- Open PDF Generator CLI (native binary): **6.0x faster** than the CLI container model.
- Open PDF Generator CLI (native, resident `serve`): **9.9x faster** than the CLI container model.
- Maroto (Go, in-process): **1.7x slower** than the CLI container model.
- Go -> pdf-generator (native, exec): **6.7x faster** than the CLI container model.
- Go -> pdf-generator (native, serve): **9.3x faster** than the CLI container model.
- pdfmake (Node.js, in-process): **3.4x faster** than the CLI container model.
- Node.js -> pdf-generator (native, exec): **6.7x faster** than the CLI container model.
- Node.js -> pdf-generator (native, serve): **10.2x faster** than the CLI container model.

**Go ecosystem (Maroto vs Open PDF Generator):**

- Go -> pdf-generator (exec): **11.1x faster** than Maroto in-process (p50: 59.30 ms vs 655.99 ms).
- Go -> pdf-generator (serve): **15.4x faster** than Maroto in-process (p50: 42.54 ms vs 655.99 ms).

**Node.js ecosystem (pdfmake vs Open PDF Generator):**

- Node.js -> pdf-generator (exec): **2.0x faster** than pdfmake in-process (p50: 59.19 ms vs 117.69 ms).
- Node.js -> pdf-generator (serve): **3.0x faster** than pdfmake in-process (p50: 38.60 ms vs 117.69 ms).

## Visual comparison

Sample PDFs generated by each engine for the first trial of every scenario are saved alongside the results:

- **Open PDF Generator CLI (JVM, exec)**: `benchmark/build/reports/benchmark/multilang/openpdf-cli/samples/`
- **Open PDF Generator CLI (native binary)**: `benchmark/build/reports/benchmark/multilang/openpdf-native/samples/`
- **Open PDF Generator CLI (native, resident `serve`)**: `benchmark/build/reports/benchmark/multilang/openpdf-serve/samples/`
- **Maroto (Go, in-process)**: `benchmark/build/reports/benchmark/multilang/go/samples/`
- **Go -> pdf-generator (native, exec)**: `benchmark/build/reports/benchmark/multilang/go-pdfgen-exec/samples/`
- **Go -> pdf-generator (native, serve)**: `benchmark/build/reports/benchmark/multilang/go-pdfgen-serve/samples/`
- **pdfmake (Node.js, in-process)**: `benchmark/build/reports/benchmark/multilang/node/samples/`
- **Node.js -> pdf-generator (native, exec)**: `benchmark/build/reports/benchmark/multilang/node-pdfgen-exec/samples/`
- **Node.js -> pdf-generator (native, serve)**: `benchmark/build/reports/benchmark/multilang/node-pdfgen-serve/samples/`

Renderings are functionally equivalent but not pixel-identical: each engine applies its own layout defaults (fonts, spacing, table borders).

## Caveats

- The `openpdf-cli` (JVM) figure includes one JVM start per document (~200–400 ms); `openpdf-native` removes the JVM entirely at ~10–20 ms per document, still one process per document; `openpdf-serve` removes the process start too, leaving only generation.
- `openpdf-serve` is measured over a single resident process with one in-flight request at a time (sequential NDJSON), which is the latency a client sees per call.
- Maroto and pdfmake are in-process libraries; they are the right comparison for latency per document once a runtime is already warm.
- Memory for the CLI is the peak RSS of its child JVM; pdfmake/Node reports process RSS; Maroto reports runtime-reserved memory. Read them as orders of magnitude, not exact parity.
- Docker pulls (Go modules, npm packages) happen at image build time and are not measured.
- pdfmake has no native barcode node; the complex scenario renders the EAN value as text, while the CLI and Maroto produce a real barcode.
