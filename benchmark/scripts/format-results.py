#!/usr/bin/env python3
import json
import os
import sys

def format_number(val, decimals=2):
    return f"{val:.{decimals}f}"

def main():
    json_path = sys.argv[1] if len(sys.argv) > 1 else "benchmark/build/reports/benchmark/benchmark-summary.json"
    if not os.path.exists(json_path):
        print(f"File not found: {json_path}")
        sys.exit(1)

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    env = data.get("environment", {})
    cold = data.get("coldStart", {})
    deps = data.get("dependencySize", {})
    scenarios = data.get("scenarios", [])

    md = []
    md.append("# Performance Benchmark: Open PDF Generator vs JasperReports\n")
    md.append("Comprehensive, reproducible performance benchmark comparing **Open PDF Generator** against **JasperReports 6.21.4** under identical workloads and JVM environment.\n")

    md.append("## Executive Summary\n")
    md.append(f"- **Cold Start:** Open PDF Generator starts **{format_number(cold.get('ratio', 1.0), 1)}x faster** ({format_number(cold.get('openPdfColdStartMs', 0))} ms vs {format_number(cold.get('jasperColdStartMs', 0))} ms), making it vastly superior for Serverless, AWS Lambda, and Kubernetes autoscaling.")
    md.append(f"- **Standard Invoices (1-page):** Open PDF Generator achieves **{format_number(scenarios[0]['speedupFactor'], 1)}x lower latency** and generates **{format_number(scenarios[0]['openPdfThroughputDocsPerSec'], 0)} docs/sec** (compared to {format_number(scenarios[0]['jasperThroughputDocsPerSec'], 0)} docs/sec on Jasper).")
    md.append(f"- **Dependency Footprint:** Open PDF Generator is **{format_number(deps.get('ratio', 1.0), 1)}x lighter** ({format_number(deps.get('openPdfSizeMb', 0), 1)} MB vs {format_number(deps.get('jasperSizeMb', 0), 1)} MB), eliminating bulky legacy dependencies like Apache Commons Digester/Collections and Eclipse ECJ compiler.\n")

    md.append("## Benchmark Environment\n")
    md.append("| Property | Value |")
    md.append("|---|---|")
    md.append(f"| **OS** | {env.get('os', 'Unknown')} |")
    md.append(f"| **Java Runtime** | Java {env.get('javaVersion', '')} ({env.get('javaVendor', '')}) |")
    md.append(f"| **Processors** | {env.get('availableProcessors', '')} Cores |")
    md.append(f"| **Max Heap** | {env.get('maxHeapMb', '')} MB |")
    md.append(f"| **JasperReports Version** | 6.21.4 |\n")

    md.append("## Throughput & Latency Comparison\n")
    md.append("| Scenario | Engine | p50 Latency (ms) | p95 Latency (ms) | Throughput (docs/s) | Speedup |")
    md.append("|---|---|---|---|---|---|")
    for s in scenarios:
        name = s["scenario"]
        speedup = f"**{format_number(s['speedupFactor'], 2)}x**" if s['speedupFactor'] >= 1.0 else f"{format_number(s['speedupFactor'], 2)}x"
        md.append(f"| **{name}** | **Open PDF Generator** | **{format_number(s['openPdfLatencyP50Ms'], 2)} ms** | {format_number(s['openPdfLatencyP95Ms'], 2)} ms | **{format_number(s['openPdfThroughputDocsPerSec'], 1)}** | {speedup} |")
        md.append(f"| | JasperReports | {format_number(s['jasperLatencyP50Ms'], 2)} ms | {format_number(s['jasperLatencyP95Ms'], 2)} ms | {format_number(s['jasperThroughputDocsPerSec'], 1)} | baseline |\n")

    md.append("## Memory Allocation & Document Size\n")
    md.append("| Scenario | Engine | Allocated / Doc | Output PDF Size |")
    md.append("|---|---|---|---|")
    for s in scenarios:
        name = s["scenario"]
        op_mem = f"{format_number(s['openPdfAllocatedMemoryKb'] / 1024.0, 2)} MB" if s['openPdfAllocatedMemoryKb'] > 1024 else f"{format_number(s['openPdfAllocatedMemoryKb'], 1)} KB"
        jr_mem = f"{format_number(s['jasperAllocatedMemoryKb'] / 1024.0, 2)} MB" if s['jasperAllocatedMemoryKb'] > 1024 else f"{format_number(s['jasperAllocatedMemoryKb'], 1)} KB"
        md.append(f"| **{name}** | **Open PDF Generator** | **{op_mem}** | {s['openPdfOutputSizeBytes']:,} bytes |")
        md.append(f"| | JasperReports | {jr_mem} | {s['jasperOutputSizeBytes']:,} bytes |\n")

    md.append("## Footprint & Cold Start\n")
    md.append("| Metric | Open PDF Generator | JasperReports 6.21.4 | Advantage |")
    md.append("|---|---|---|---|")
    md.append(f"| **Cold Start (1st Doc Render)** | **{format_number(cold.get('openPdfColdStartMs', 0), 1)} ms** | {format_number(cold.get('jasperColdStartMs', 0), 1)} ms | **{format_number(cold.get('ratio', 1.0), 1)}x faster** |")
    md.append(f"| **Distribution Size (JARs)** | **{format_number(deps.get('openPdfSizeMb', 0), 1)} MB** | {format_number(deps.get('jasperSizeMb', 0), 1)} MB | **{format_number(deps.get('ratio', 1.0), 1)}x smaller** |")
    md.append("| **Template Format** | Human-readable JSON | Verbose XML (JRXML) | Native JSON / web-first |")
    md.append("| **Template Compilation** | Instant (no compiler) | Requires Java/Groovy/ECJ compiler | No compile phase required |\n")

    md.append("## Reproducing Locally\n")
    md.append("You can run this exact benchmark suite locally:\n")
    md.append("```bash")
    md.append("./benchmark/scripts/run-benchmark.sh")
    md.append("```\n")

    output_path = sys.argv[2] if len(sys.argv) > 2 else "docs/lib/benchmark.md"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(md))

    print(f"Markdown generated at: {output_path}")

if __name__ == "__main__":
    main()
