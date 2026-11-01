#!/usr/bin/env python3
"""Aggregate multi-language benchmark results into docs/lib/benchmark-multilang.md."""

import json
import os
import sys
from datetime import date

ENGINES = [
    ("openpdf-cli", "Open PDF Generator CLI (JVM, exec)"),
    ("openpdf-native", "Open PDF Generator CLI (native binary)"),
    ("openpdf-serve", "Open PDF Generator CLI (native, resident `serve`)"),
    ("go", "Maroto (Go, in-process)"),
    ("go-pdfgen-exec", "Go -> pdf-generator (native, exec)"),
    ("go-pdfgen-serve", "Go -> pdf-generator (native, serve)"),
    ("node", "pdfmake (Node.js, in-process)"),
    ("node-pdfgen-exec", "Node.js -> pdf-generator (native, exec)"),
    ("node-pdfgen-serve", "Node.js -> pdf-generator (native, serve)"),
]

SCENARIO_ORDER = ["invoice", "listing_100", "complex", "massive_1000"]


def fmt(value, decimals=2):
    return f"{value:.{decimals}f}"


def load_results(report_base):
    results = {}
    for engine_id, _label in ENGINES:
        path = os.path.join(report_base, engine_id, "results.json")
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as fh:
                results[engine_id] = json.load(fh)
    return results


def scenario_map(engine_data):
    return {scenario["name"]: scenario for scenario in engine_data.get("scenarios", [])}


def main():
    report_base = sys.argv[1] if len(sys.argv) > 1 else "benchmark/build/reports/benchmark/multilang"
    output_path = sys.argv[2] if len(sys.argv) > 2 else "docs/lib/benchmark-multilang.md"
    limits = sys.argv[3] if len(sys.argv) > 3 else "default"

    results = load_results(report_base)
    if not results:
        print(f"No results.json found under {report_base}")
        sys.exit(1)

    merged = {
        "generated": date.today().isoformat(),
        "limits": limits,
        "engines": {engine: data for engine, data in results.items()},
    }
    os.makedirs(report_base, exist_ok=True)
    with open(os.path.join(report_base, "merged-results.json"), "w", encoding="utf-8") as fh:
        json.dump(merged, fh, indent=2, ensure_ascii=False)

    engine_scenarios = {engine: scenario_map(data) for engine, data in results.items()}
    scenario_names = [
        name
        for name in SCENARIO_ORDER
        if any(name in scenarios for scenarios in engine_scenarios.values())
    ]

    md = []
    md.append("# Benchmark: Open PDF Generator CLI vs Maroto (Go) vs pdfmake (Node.js)\n")
    md.append(
        "Reproducible comparison of the **Open PDF Generator CLI running in Docker** against the two most "
        "popular PDF libraries used by Go and Node.js services, under identical data volumes, "
        "container limits and trial counts.\n"
    )

    md.append("## Method\n")
    md.append(
        "- **Generation models are intentionally different and labeled**: the CLI is measured in three "
        "flavors — `openpdf-cli` (JVM: one `java -jar` per document inside the container, JVM boot "
        "included), `openpdf-native` (GraalVM native binary: one process per document, **no JVM**) and "
        "`openpdf-serve` (the same binary running as a resident `serve` process, one NDJSON request per "
        "document — no process start-up at all). Maroto and pdfmake run **in-process** in their native "
        "runtimes.\n"
        "- Data is generated per trial with the same formulas in all three languages "
        "(`BenchmarkDataFactory`): invoice (10 items), listing (100 and 1000 rows), complex "
        "(QR + barcode + conditionals).\n"
        "- Metrics: p50/p95/mean latency, throughput (docs/s), average PDF size and peak memory "
        "(JVM child-process RSS for the CLI; runtime-sampled RSS/heap for Maroto and pdfmake).\n"
        f"- Container limits: **{limits}**. Trial scale: 1.0 (full) unless noted.\n"
    )

    md.append("## Engines\n")
    md.append("| Engine | Language / runtime | Generation model |")
    md.append("|---|---|---|")
    for engine_id, label in ENGINES:
        if engine_id in results:
            data = results[engine_id]
            md.append(f"| {label} | `{data.get('language', '-')}` | `{data.get('model', '-')}` |")
    md.append("")

    md.append("## Reproduce\n")
    md.append("```bash\n# Full run (2 CPUs / 1g per container)\nbash benchmark/multi-lang/scripts/run-multi-lang-benchmark.sh\n\n# Quick run (20% of trials) or a single engine\nbash benchmark/multi-lang/scripts/run-multi-lang-benchmark.sh all 2 1g 0.2\nbash benchmark/multi-lang/scripts/run-multi-lang-benchmark.sh go\nbash benchmark/multi-lang/scripts/run-multi-lang-benchmark.sh openpdf-native\nbash benchmark/multi-lang/scripts/run-multi-lang-benchmark.sh openpdf-serve\n```\n")

    md.append("## Integration guidance\n")
    md.append(
        "- Use **`serve`** for per-request PDF APIs: one long-lived container, one NDJSON request per "
        "document, no process start-up and no re-parsing of templates.\n"
        "- Use the **native binary** when the integration model is one short-lived process per document "
        "(`docker run` per call); it still removes the JVM but pays ~10–20 ms of fixed start-up.\n"
        "- Use the **JVM CLI** when you need the JAR itself (plugins, custom JVM options) and can keep a "
        "warm worker.\n"
        "- Native host-language libraries (Maroto, pdfmake) are competitive in-process, but you "
        "re-implement layout in each language and lose template portability.\n"
        "- Embedding the `core` JAR in a JVM service remains an option (see the "
        "[Jasper comparison](/lib/benchmark)).\n"
    )

    for name in scenario_names:
        md.append(f"## Scenario: `{name}`\n")
        md.append("| Engine | Trials | p50 (ms) | p95 (ms) | Mean (ms) | Throughput (docs/s) | Avg PDF (KB) | Peak mem (MB) |")
        md.append("|---|---|---|---|---|---|---|---|")
        for engine_id, label in ENGINES:
            scenario = engine_scenarios.get(engine_id, {}).get(name)
            if not scenario:
                continue
            md.append(
                f"| {label} | {scenario.get('trials', 0)} | {fmt(scenario['p50Ms'])} | "
                f"{fmt(scenario['p95Ms'])} | {fmt(scenario['meanMs'])} | "
                f"{fmt(scenario['throughputDocsPerSec'], 1)} | {fmt(scenario['avgPdfSizeKb'], 1)} | "
                f"{fmt(scenario['peakMemoryMb'], 1)} |"
            )
        md.append("")

        baseline = engine_scenarios.get("openpdf-cli", {}).get(name)
        if baseline and baseline["p50Ms"] > 0:
            md.append("**Relative to the CLI exec model (p50, lower is faster):**\n")
            for engine_id, label in ENGINES:
                if engine_id == "openpdf-cli":
                    continue
                scenario = engine_scenarios.get(engine_id, {}).get(name)
                if not scenario:
                    continue
                ratio = scenario["p50Ms"] / baseline["p50Ms"]
                if ratio < 1:
                    md.append(f"- {label}: **{fmt(1 / ratio, 1)}x faster** than the CLI container model.")
                else:
                    md.append(f"- {label}: **{fmt(ratio, 1)}x slower** than the CLI container model.")
            md.append("")

        go_maroto = engine_scenarios.get("go", {}).get(name)
        go_exec = engine_scenarios.get("go-pdfgen-exec", {}).get(name)
        go_serve = engine_scenarios.get("go-pdfgen-serve", {}).get(name)
        if go_maroto and (go_exec or go_serve):
            md.append("**Go ecosystem (Maroto vs Open PDF Generator):**\n")
            if go_exec:
                r_exec = go_exec["p50Ms"] / go_maroto["p50Ms"]
                if r_exec < 1:
                    md.append(f"- Go -> pdf-generator (exec): **{fmt(1 / r_exec, 1)}x faster** than Maroto in-process (p50: {fmt(go_exec['p50Ms'])} ms vs {fmt(go_maroto['p50Ms'])} ms).")
                else:
                    md.append(f"- Go -> pdf-generator (exec): **{fmt(r_exec, 1)}x slower** than Maroto in-process (p50: {fmt(go_exec['p50Ms'])} ms vs {fmt(go_maroto['p50Ms'])} ms).")
            if go_serve:
                r_serve = go_serve["p50Ms"] / go_maroto["p50Ms"]
                if r_serve < 1:
                    md.append(f"- Go -> pdf-generator (serve): **{fmt(1 / r_serve, 1)}x faster** than Maroto in-process (p50: {fmt(go_serve['p50Ms'])} ms vs {fmt(go_maroto['p50Ms'])} ms).")
                else:
                    md.append(f"- Go -> pdf-generator (serve): **{fmt(r_serve, 1)}x slower** than Maroto in-process (p50: {fmt(go_serve['p50Ms'])} ms vs {fmt(go_maroto['p50Ms'])} ms).")
            md.append("")

        node_pm = engine_scenarios.get("node", {}).get(name)
        node_exec = engine_scenarios.get("node-pdfgen-exec", {}).get(name)
        node_serve = engine_scenarios.get("node-pdfgen-serve", {}).get(name)
        if node_pm and (node_exec or node_serve):
            md.append("**Node.js ecosystem (pdfmake vs Open PDF Generator):**\n")
            if node_exec:
                r_exec = node_exec["p50Ms"] / node_pm["p50Ms"]
                if r_exec < 1:
                    md.append(f"- Node.js -> pdf-generator (exec): **{fmt(1 / r_exec, 1)}x faster** than pdfmake in-process (p50: {fmt(node_exec['p50Ms'])} ms vs {fmt(node_pm['p50Ms'])} ms).")
                else:
                    md.append(f"- Node.js -> pdf-generator (exec): **{fmt(r_exec, 1)}x slower** than pdfmake in-process (p50: {fmt(node_exec['p50Ms'])} ms vs {fmt(node_pm['p50Ms'])} ms).")
            if node_serve:
                r_serve = node_serve["p50Ms"] / node_pm["p50Ms"]
                if r_serve < 1:
                    md.append(f"- Node.js -> pdf-generator (serve): **{fmt(1 / r_serve, 1)}x faster** than pdfmake in-process (p50: {fmt(node_serve['p50Ms'])} ms vs {fmt(node_pm['p50Ms'])} ms).")
                else:
                    md.append(f"- Node.js -> pdf-generator (serve): **{fmt(r_serve, 1)}x slower** than pdfmake in-process (p50: {fmt(node_serve['p50Ms'])} ms vs {fmt(node_pm['p50Ms'])} ms).")
            md.append("")

    md.append("## Visual comparison\n")
    md.append(
        "Sample PDFs generated by each engine for the first trial of every scenario are saved alongside "
        "the results:\n"
    )
    for engine_id, label in ENGINES:
        if engine_id in results:
            md.append(f"- **{label}**: `benchmark/build/reports/benchmark/multilang/{engine_id}/samples/`")
    md.append(
        "\nRenderings are functionally equivalent but not pixel-identical: each engine applies its own "
        "layout defaults (fonts, spacing, table borders).\n"
    )

    md.append("## Caveats\n")
    md.append(
        "- The `openpdf-cli` (JVM) figure includes one JVM start per document (~200–400 ms); "
        "`openpdf-native` removes the JVM entirely at ~10–20 ms per document, still one process per "
        "document; `openpdf-serve` removes the process start too, leaving only generation.\n"
        "- `openpdf-serve` is measured over a single resident process with one in-flight request at a "
        "time (sequential NDJSON), which is the latency a client sees per call.\n"
        "- Maroto and pdfmake are in-process libraries; they are the right comparison for latency per "
        "document once a runtime is already warm.\n"
        "- Memory for the CLI is the peak RSS of its child JVM; pdfmake/Node reports process RSS; "
        "Maroto reports runtime-reserved memory. Read them as orders of magnitude, not exact parity.\n"
        "- Docker pulls (Go modules, npm packages) happen at image build time and are not measured.\n"
        "- pdfmake has no native barcode node; the complex scenario renders the EAN value as text, while "
        "the CLI and Maroto produce a real barcode.\n"
    )

    with open(output_path, "w", encoding="utf-8") as fh:
        fh.write("\n".join(md))
    print(f"Report written to {output_path}")


if __name__ == "__main__":
    main()
