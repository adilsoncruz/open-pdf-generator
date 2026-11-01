# Multi-language Benchmark (Docker)

Compares **Open PDF Generator CLI** (containerized, exec-per-document model) against the most
popular native PDF libraries for the host languages it is meant to serve:

| Engine | Language | Library | Generation model |
|---|---|---|---|
| `openpdf-cli` | JVM (Kotlin CLI) | Open PDF Generator | `docker` exec per document |
| `openpdf-native` | Native (GraalVM) | Open PDF Generator | one binary process per document, no JVM |
| `openpdf-serve` | Native (GraalVM) | Open PDF Generator | resident process, one NDJSON request per document |
| `maroto` | Go | [Maroto v2](https://maroto.tech) | in-process |
| `pdfmake` | Node.js | [pdfmake](https://pdfmake.github.io) | in-process |

Every runner receives identical input volumes — an `invoice` (10 line items), a `listing`
(100 and 1000 rows), and a `complex` invoice (QR + barcode + conditionals) — and produces a
uniform `results.json` contract (p50/p95 latency, throughput, average PDF size, peak memory)
plus one sample PDF per scenario for visual comparison.

## Run

```bash
bash benchmark/multi-lang/scripts/run-multi-lang-benchmark.sh            # all engines, 2 CPUs / 1g
bash benchmark/multi-lang/scripts/run-multi-lang-benchmark.sh openpdf-native
bash benchmark/multi-lang/scripts/run-multi-lang-benchmark.sh openpdf-serve
bash benchmark/multi-lang/scripts/run-multi-lang-benchmark.sh go
bash benchmark/multi-lang/scripts/run-multi-lang-benchmark.sh all 2 1g 0.2  # scale trials 20%
```

Results land in `benchmark/build/reports/benchmark/multilang/<engine>/` and the aggregated
Markdown report is written to `docs/lib/benchmark-multilang.md`.

> Docker builds of the Go and Node images download dependencies (Go modules / npm) — the
> first build needs network access.

## Interpreting results

- `openpdf-cli` measures the **exec model** a Go/Node/Spring service actually pays when it
  shells out to the CLI: one JVM boot per document. In-process embedding of the `core` JAR
  (see `benchmark/jasper6` / `run-benchmark.sh`) is dramatically faster per document.
- `openpdf-native` measures the **same exec model with the GraalVM binary** (built by
  `tools/cli/Dockerfile.native`): still one process per document, but no JVM boot.
- `openpdf-serve` starts the binary once and drives it over NDJSON (`pdf-generator serve`),
  so it measures **pure per-request latency** with no start-up; requests are sequential.
- `maroto` and `pdfmake` measure **in-process** generation in compiled Go / warmed Node.
- Trial counts are identical across engines (scaled by `BENCH_TRIALS_SCALE`); data is
  regenerated per trial with the same formulas (`BenchmarkDataFactory`) in each language.

## Layout

```
benchmark/multi-lang/
├── go/        Go runner (Maroto v2)
├── node/      Node runner (pdfmake)
├── openpdf/   CLI benchmark runners (JVM `Dockerfile`, `Dockerfile.native`, `Dockerfile.serve`)
└── scripts/   Orchestration + aggregation
```
