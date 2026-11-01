#!/usr/bin/env python3
"""Open PDF Generator CLI runner — exec-per-document (container) model.

Measures what a Go/Node/etc. application actually pays when it integrates the
CLI through Docker: one JVM boot + generation per document.

Writes the same results.json contract as the Go (Maroto) and Node (pdfmake)
runners so aggregate-results.py can compare them.
"""

import json
import math
import os
import resource
import statistics
import subprocess
import sys
import tempfile
import time

CLI_JAR = os.environ.get("CLI_JAR", "/app/pdf-generator-cli.jar")
CLI_BIN = os.environ.get("CLI_BIN")  # native binary (no JVM) when set
TEMPLATES = os.environ.get("TEMPLATES_DIR", "/app/templates")
ENGINE = os.environ.get("ENGINE", "openpdf-cli")
ENGINE_LANGUAGE = os.environ.get("ENGINE_LANGUAGE", "kotlin/jvm (CLI)")
ENGINE_MODEL = os.environ.get("ENGINE_MODEL", "exec-per-document (docker)")
SERVE = os.environ.get("SERVE") == "1"  # resident NDJSON process instead of exec-per-doc
REPORTS = sys.argv[1] if len(sys.argv) > 1 else "/app/reports"
SCALE = float(os.environ.get("BENCH_TRIALS_SCALE", "1") or "1")

SCENARIOS = [
    ("invoice", "invoice.json", 300, 1),
    ("listing_100", "listing.json", 150, 100),
    ("complex", "complex.json", 150, 1),
    ("massive_1000", "listing.json", 12, 1000),
]


# ---------------------------------------------------------------------------
# Data factory (identical formulas to BenchmarkDataFactory)
# ---------------------------------------------------------------------------

def create_invoice_data(seq=1):
    items = []
    subtotal = 0.0
    for i in range(1, 11):
        qty = ((seq + i) % 5) + 1
        price = 15.0 * i + (seq % 10)
        total = qty * price
        subtotal += total
        items.append(
            {
                "description": f"Item #{i} - Enterprise Module Pack (Batch #{seq})",
                "quantity": qty,
                "unitPrice": price,
                "total": total,
            }
        )
    tax = subtotal * 0.1
    return {
        "invoiceNumber": f"INV-2026-{seq:06d}",
        "date": "2026-10-21",
        "customer": {
            "name": f"Customer #{seq} Global Industries",
            "email": f"client-{seq}@globalcorp.internal",
            "address": f"{seq} Enterprise Way, Suite 400, Austin, TX",
        },
        "items": items,
        "subtotal": subtotal,
        "tax": tax,
        "total": subtotal + tax,
        "isDraft": False,
    }


def create_listing_data(count):
    items = []
    for i in range(1, count + 1):
        items.append(
            {
                "id": i,
                "code": f"SKU-{i:05d}",
                "name": f"Product Inventory Unit #{i}",
                "category": "Hardware" if i % 2 == 0 else "Software",
                "stock": (i * 7) % 500,
                "price": 10.0 + (i % 100) * 1.5,
                "status": "IN_STOCK" if i % 3 == 0 else "BACKORDER",
            }
        )
    return {
        "reportTitle": f"Consolidated Inventory Catalog ({count} items)",
        "generatedAt": "2026-10-21 15:00:00",
        "totalCount": count,
        "items": items,
    }


def create_complex_data():
    data = create_invoice_data(1)
    data.update(
        {
            "companyName": "Apex Cloud Solutions",
            "qrCodePayload": "https://apexcloud.internal/verify/INV-2026-9042",
            "barcodeValue": "7891234567890",
            "showLegalNotice": True,
            "notes": "Payment due within 30 days. Contact support@apexcloud.internal for questions.",
        }
    )
    return data


def build_data(kind, seq, rows):
    if kind == "invoice":
        return create_invoice_data(seq)
    if kind == "complex":
        return create_complex_data()
    return create_listing_data(rows)


# ---------------------------------------------------------------------------
# CLI execution
# ---------------------------------------------------------------------------

def run_cli(template, data, output):
    if CLI_BIN:
        cmd = [CLI_BIN]
    else:
        cmd = ["java", "-jar", CLI_JAR]
    cmd += [
        "generate",
        os.path.join(TEMPLATES, template),
        "-d",
        data,
        "-o",
        output,
    ]
    proc = subprocess.run(cmd, capture_output=True)
    if proc.returncode != 0:
        raise RuntimeError(
            f"CLI failed ({proc.returncode}): {proc.stderr.decode('utf-8', 'replace')[-2000:]}"
        )


class ServeClient:
    """Resident `pdf-generator serve` process speaking NDJSON.

    One request still produces one PDF; the process is started once, so document
    latency excludes process start-up, template parsing and font initialisation.
    """

    def __init__(self):
        if not CLI_BIN:
            raise RuntimeError("SERVE=1 requires CLI_BIN (the native binary)")
        cmd = [CLI_BIN, "serve"]
        for template in sorted({scenario[1] for scenario in SCENARIOS}):
            cmd += ["--preload", os.path.join(TEMPLATES, template)]
        self.proc = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            text=True,
            bufsize=1,
        )
        self.next_id = 0

    def render(self, template_path, data, output):
        self.next_id += 1
        request = {
            "id": self.next_id,
            "template": template_path,
            "data": data,
            "outputPath": output,
        }
        start = time.perf_counter()
        self.proc.stdin.write(json.dumps(request) + "\n")
        self.proc.stdin.flush()
        line = self.proc.stdout.readline()
        elapsed = (time.perf_counter() - start) * 1000.0
        if not line:
            raise RuntimeError("serve process exited unexpectedly")
        response = json.loads(line)
        if not response.get("ok"):
            raise RuntimeError(f"serve error: {response.get('error')}")
        return elapsed

    def peak_memory_mb(self):
        try:
            with open(f"/proc/{self.proc.pid}/status", encoding="utf-8") as fh:
                for row in fh:
                    if row.startswith("VmHWM:"):
                        return int(row.split()[1]) / 1024.0
        except OSError:
            pass
        return peak_children_rss_mb()

    def close(self):
        try:
            self.proc.stdin.close()
        except OSError:
            pass
        self.proc.wait(timeout=30)


def percentile(sorted_values, p):
    if not sorted_values:
        return 0.0
    idx = min(len(sorted_values) - 1, max(0, math.ceil(p / 100.0 * len(sorted_values)) - 1))
    return sorted_values[idx]


def peak_children_rss_mb():
    """Peak RSS among all already-finished child processes (monotonic max)."""
    raw = resource.getrusage(resource.RUSAGE_CHILDREN).ru_maxrss
    if sys.platform == "darwin":
        return raw / (1024.0 * 1024.0)  # macOS reports bytes
    return raw / 1024.0  # Linux reports kilobytes


def run_scenario(name, template, base_trials, rows, serve_client=None):
    trials = max(3, round(base_trials * SCALE))
    warmup = min(10, max(3, trials // 10))
    samples_dir = os.path.join(REPORTS, "samples")
    os.makedirs(samples_dir, exist_ok=True)
    template_path = os.path.join(TEMPLATES, template)
    kind = "listing" if rows > 1 else template.split(".")[0]

    with tempfile.TemporaryDirectory() as tmp:
        data_path = os.path.join(tmp, "data.json")
        out_path = os.path.join(tmp, "output.pdf")

        def render(seq, target):
            data = build_data(kind, seq, rows)
            if serve_client is not None:
                return serve_client.render(template_path, data, target)
            with open(data_path, "w", encoding="utf-8") as fh:
                json.dump(data, fh)
            start = time.perf_counter()
            run_cli(template, data_path, target)
            return (time.perf_counter() - start) * 1000.0

        cold_start_ms = None
        for seq in range(1, warmup + 1):
            elapsed = render(seq, out_path)
            if cold_start_ms is None:
                cold_start_ms = elapsed

        durations = []
        sizes = []
        started_all = time.perf_counter()
        for seq in range(1, trials + 1):
            durations.append(render(seq, out_path))
            sizes.append(os.path.getsize(out_path) / 1024.0)
            if seq == 1:
                render(seq, os.path.join(samples_dir, f"{name}.pdf"))
        wall = time.perf_counter() - started_all

    ordered = sorted(durations)
    peak_memory = (
        serve_client.peak_memory_mb() if serve_client is not None else peak_children_rss_mb()
    )
    result = {
        "name": name,
        "kind": kind,
        "trials": trials,
        "warmup": warmup,
        "coldStartMs": round(cold_start_ms, 2),
        "p50Ms": round(percentile(ordered, 50), 2),
        "p95Ms": round(percentile(ordered, 95), 2),
        "meanMs": round(statistics.fmean(durations), 2),
        "minMs": round(ordered[0], 2),
        "maxMs": round(ordered[-1], 2),
        "throughputDocsPerSec": round(trials / wall, 2),
        "avgPdfSizeKb": round(statistics.fmean(sizes), 2),
        "peakMemoryMb": round(peak_memory, 2),
    }
    print(
        f"[{ENGINE}] {name}: p50={result['p50Ms']}ms p95={result['p95Ms']}ms "
        f"throughput={result['throughputDocsPerSec']} docs/s"
    )
    return result


def main():
    os.makedirs(REPORTS, exist_ok=True)
    serve_client = ServeClient() if SERVE else None
    try:
        scenarios = [
            run_scenario(name, tmpl, trials, rows, serve_client)
            for name, tmpl, trials, rows in SCENARIOS
        ]
    finally:
        if serve_client is not None:
            serve_client.close()
    if CLI_BIN:
        runtime = subprocess.run([CLI_BIN, "version"], capture_output=True, text=True)
        runtime_line = (runtime.stdout or runtime.stderr).splitlines()[0]
    else:
        runtime_line = subprocess.run(
            ["java", "-version"], capture_output=True, text=True
        ).stderr.splitlines()[0]

    report = {
        "engine": ENGINE,
        "language": ENGINE_LANGUAGE,
        "model": ENGINE_MODEL,
        "environment": {
            "cliJar": CLI_JAR if not CLI_BIN else None,
            "cliBin": CLI_BIN,
            "protocol": "ndjson (resident)" if SERVE else "exec-per-document",
            "runtime": runtime_line,
            "trialsScale": str(SCALE),
        },
        "scenarios": scenarios,
    }
    out_path = os.path.join(REPORTS, "results.json")
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(report, fh, indent=2)
    print(f"{ENGINE} results -> {out_path}")


if __name__ == "__main__":
    main()
