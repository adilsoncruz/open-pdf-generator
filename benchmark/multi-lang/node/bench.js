#!/usr/bin/env node
/**
 * pdfmake runner — uniform results contract consumed by aggregate-results.py.
 *
 * Scenarios mirror BenchmarkDataFactory (JVM) and the Go runner:
 * invoice, listing_100, complex, massive_1000.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { performance } = require("perf_hooks");
const { execFile, spawn } = require("child_process");
const readline = require("readline");
const PdfPrinter = require("pdfmake");

const reportsDir = process.argv[2] || "/app/reports";
const samplesDir = path.join(reportsDir, "samples");
fs.mkdirSync(samplesDir, { recursive: true });

const scale = positiveFloat(process.env.BENCH_TRIALS_SCALE, 1);

const robotoRoot = path.join(
  path.dirname(require.resolve("roboto-font/package.json")),
  "fonts",
  "Roboto",
);

const printer = new PdfPrinter({
  Roboto: {
    normal: path.join(robotoRoot, "roboto-regular-webfont.ttf"),
    bold: path.join(robotoRoot, "roboto-bold-webfont.ttf"),
    italics: path.join(robotoRoot, "roboto-italic-webfont.ttf"),
    bolditalics: path.join(robotoRoot, "roboto-bolditalic-webfont.ttf"),
  },
});

// ---------------------------------------------------------------------------
// Data factory (identical formulas to BenchmarkDataFactory)
// ---------------------------------------------------------------------------

function createInvoiceData(seq = 1) {
  const items = [];
  let subtotal = 0;
  for (let i = 1; i <= 10; i++) {
    const qty = ((seq + i) % 5) + 1;
    const price = 15.0 * i + (seq % 10);
    const total = qty * price;
    subtotal += total;
    items.push({
      description: `Item #${i} - Enterprise Module Pack (Batch #${seq})`,
      quantity: qty,
      unitPrice: price,
      total,
    });
  }
  const tax = subtotal * 0.1;
  return {
    invoiceNumber: `INV-2026-${String(seq).padStart(6, "0")}`,
    date: "2026-10-21",
    customer: {
      name: `Customer #${seq} Global Industries`,
      email: `client-${seq}@globalcorp.internal`,
      address: `${seq} Enterprise Way, Suite 400, Austin, TX`,
    },
    items,
    subtotal,
    tax,
    total: subtotal + tax,
    isDraft: false,
  };
}

function createListingData(count) {
  const items = [];
  for (let i = 1; i <= count; i++) {
    items.push({
      id: i,
      code: `SKU-${String(i).padStart(5, "0")}`,
      name: `Product Inventory Unit #${i}`,
      category: i % 2 === 0 ? "Hardware" : "Software",
      stock: (i * 7) % 500,
      price: 10.0 + (i % 100) * 1.5,
      status: i % 3 === 0 ? "IN_STOCK" : "BACKORDER",
    });
  }
  return {
    reportTitle: `Consolidated Inventory Catalog (${count} items)`,
    generatedAt: "2026-10-21 15:00:00",
    totalCount: count,
    items,
  };
}

function createComplexData() {
  return {
    ...createInvoiceData(1),
    companyName: "Apex Cloud Solutions",
    qrCodePayload: "https://apexcloud.internal/verify/INV-2026-9042",
    barcodeValue: "7891234567890",
    showLegalNotice: true,
    notes:
      "Payment due within 30 days. Contact support@apexcloud.internal for questions.",
  };
}

// ---------------------------------------------------------------------------
// Document definitions
// ---------------------------------------------------------------------------

const money = (v) => v.toFixed(2);

function tableHeader() {
  return [
    { text: "Description", style: "th" },
    { text: "Qty", style: "th", alignment: "center" },
    { text: "Unit Price", style: "th", alignment: "right" },
    { text: "Total", style: "th", alignment: "right" },
  ];
}

function invoiceDoc(data) {
  return {
    pageSize: "A4",
    pageMargins: [36, 36, 36, 36],
    defaultStyle: { font: "Roboto", fontSize: 8 },
    styles: {
      th: { bold: true, fillColor: "#f1f5f9" },
      h: { fontSize: 14, bold: true },
    },
    content: [
      {
        columns: [
          { text: "ACME ENTERPRISE SOLUTIONS", style: "h" },
          { text: "INVOICE", style: "h", alignment: "right" },
        ],
      },
      {
        margin: [0, 8, 0, 0],
        columns: [
          { text: "Billed To:", bold: true },
          { text: `Number: ${data.invoiceNumber}`, alignment: "right" },
        ],
      },
      { text: data.customer.name, bold: true, fontSize: 10, margin: [0, 6, 0, 0] },
      { text: data.customer.email },
      { text: data.customer.address },
      {
        margin: [0, 12, 0, 0],
        table: {
          headerRows: 1,
          widths: ["50%", "12%", "19%", "19%"],
          body: [
            tableHeader(),
            ...data.items.map((item) => [
              { text: item.description },
              { text: String(item.quantity), alignment: "center" },
              { text: money(item.unitPrice), alignment: "right" },
              { text: money(item.total), alignment: "right" },
            ]),
          ],
        },
      },
      {
        margin: [0, 8, 0, 0],
        columns: [
          { text: "" },
          {
            text: `Total: ${money(data.total)}`,
            alignment: "right",
            bold: true,
            fontSize: 10,
          },
        ],
      },
    ],
  };
}

function complexDoc(data) {
  const base = invoiceDoc(data);
  base.content = [
    {
      columns: [
        { text: data.companyName, style: "h" },
        { text: "INVOICE", style: "h", alignment: "right" },
      ],
    },
    {
      margin: [0, 6, 0, 0],
      columns: [
        { text: `Number: ${data.invoiceNumber}` },
        { text: `Date: ${data.date}`, alignment: "right" },
      ],
    },
    base.content[5],
    {
      margin: [0, 12, 0, 0],
      columns: [
        { qr: data.qrCodePayload, fit: 70 },
        // pdfmake has no native barcode node — the EAN value is rendered as text.
        { text: data.barcodeValue, fontSize: 10 },
        { text: data.notes, fontSize: 7 },
      ],
    },
  ];
  return base;
}

function listingDoc(data) {
  return {
    pageSize: "A4",
    pageMargins: [30, 40, 30, 40],
    defaultStyle: { font: "Roboto", fontSize: 7 },
    content: [
      {
        columns: [
          { text: data.reportTitle, fontSize: 11, bold: true },
          { text: data.generatedAt, alignment: "right", fontSize: 8 },
        ],
        margin: [0, 0, 0, 8],
      },
      {
        table: {
          headerRows: 1,
          widths: ["5%", "14%", "44%", "17%", "9%", "11%"],
          body: [
            [
              { text: "#", bold: true, alignment: "center", fillColor: "#f1f5f9" },
              { text: "SKU", bold: true, fillColor: "#f1f5f9" },
              { text: "Product", bold: true, fillColor: "#f1f5f9" },
              { text: "Category", bold: true, fillColor: "#f1f5f9" },
              { text: "Stock", bold: true, alignment: "center", fillColor: "#f1f5f9" },
              { text: "Price", bold: true, alignment: "right", fillColor: "#f1f5f9" },
            ],
            ...data.items.map((row) => [
              { text: String(row.id), alignment: "center" },
              { text: row.code },
              { text: row.name },
              { text: row.category },
              { text: String(row.stock), alignment: "center" },
              { text: money(row.price), alignment: "right" },
            ]),
          ],
        },
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Rendering + metrics
// ---------------------------------------------------------------------------

function renderToFile(docDefinition, filePath) {
  return new Promise((resolve, reject) => {
    const pdf = printer.createPdfKitDocument(docDefinition);
    const stream = fs.createWriteStream(filePath);
    stream.on("finish", () => resolve(fs.statSync(filePath).size));
    stream.on("error", reject);
    pdf.on("error", reject);
    pdf.pipe(stream);
    pdf.end();
  });
}

function buildDocument(spec, seq) {
  switch (spec.kind) {
    case "invoice":
      return invoiceDoc(createInvoiceData(seq));
    case "complex":
      return complexDoc(createComplexData());
    default:
      return listingDoc(createListingData(spec.rows));
  }
}

function getTemplateAndData(spec, seq) {
  if (spec.kind === "invoice") {
    return { templateFile: "invoice.json", data: createInvoiceData(seq) };
  } else if (spec.kind === "complex") {
    return { templateFile: "complex.json", data: createComplexData() };
  } else {
    return { templateFile: "listing.json", data: createListingData(spec.rows) };
  }
}

class PdfmakeGenerator {
  name = "pdfmake";
  model = "in-process";

  async init() {}
  async generate(spec, trial, outputPath) {
    return renderToFile(buildDocument(spec, trial), outputPath);
  }
  async close() {}
}

class NodePdfgenExecGenerator {
  name = "node-pdfgen-exec";
  model = "exec-per-document (from Node)";

  constructor(cliBin, templatesDir) {
    this.cliBin = cliBin;
    this.templatesDir = templatesDir;
  }
  async init() {}
  async generate(spec, trial, outputPath) {
    const { templateFile, data } = getTemplateAndData(spec, trial);
    const templatePath = path.join(this.templatesDir, templateFile);
    return new Promise((resolve, reject) => {
      const child = execFile(
        this.cliBin,
        ["generate", templatePath, "-d", "-", "-o", outputPath],
        (err, _stdout, stderr) => {
          if (err) return reject(new Error(stderr.toString() || err.message));
          resolve(fs.statSync(outputPath).size);
        }
      );
      child.stdin.end(JSON.stringify(data));
    });
  }
  async close() {}
}

class NodePdfgenServeGenerator {
  name = "node-pdfgen-serve";
  model = "resident serve via NDJSON (from Node)";

  constructor(cliBin, templatesDir) {
    this.cliBin = cliBin;
    this.templatesDir = templatesDir;
    this.reqId = 0;
  }

  async init() {
    this.child = spawn(this.cliBin, ["serve"]);
    this.child.stderr.on("data", () => {});
    this.rl = readline.createInterface({ input: this.child.stdout });
  }

  async generate(spec, trial, outputPath) {
    const { templateFile, data } = getTemplateAndData(spec, trial);
    const templatePath = path.join(this.templatesDir, templateFile);
    this.reqId++;
    const id = this.reqId;

    return new Promise((resolve, reject) => {
      const onLine = (line) => {
        try {
          const resp = JSON.parse(line);
          if (resp.id === id) {
            this.rl.off("line", onLine);
            if (!resp.ok) return reject(new Error(resp.error));
            resolve(resp.bytes || fs.statSync(outputPath).size);
          }
        } catch (e) {
          reject(e);
        }
      };
      this.rl.on("line", onLine);

      this.child.stdin.write(
        JSON.stringify({
          id,
          template: templatePath,
          data,
          outputPath,
        }) + "\n"
      );
    });
  }

  async close() {
    if (this.child) {
      this.child.stdin.end();
      this.child.kill();
    }
  }
}

async function runScenario(generator, spec) {
  const warmup = spec.trials < 10 ? 3 : 10;
  const tmp = path.join("/tmp", `bench-${spec.name}.pdf`);

  for (let i = 1; i <= warmup; i++) {
    await generator.generate(spec, i, tmp);
  }

  const durations = [];
  const sizes = [];
  let peakMemoryMb = 0;
  const startedAll = performance.now();

  for (let trial = 1; trial <= spec.trials; trial++) {
    const samplePath = trial === 1 ? path.join(samplesDir, `${spec.name}.pdf`) : tmp;
    const start = performance.now();
    const bytes = await generator.generate(spec, trial, samplePath);
    durations.push(performance.now() - start);
    sizes.push(bytes / 1024);
    peakMemoryMb = Math.max(peakMemoryMb, process.memoryUsage().rss / (1024 * 1024));
  }

  const wallSec = (performance.now() - startedAll) / 1000;
  const sorted = [...durations].sort((a, b) => a - b);

  return {
    name: spec.name,
    kind: spec.kind,
    trials: spec.trials,
    warmup,
    p50Ms: round2(percentile(sorted, 50)),
    p95Ms: round2(percentile(sorted, 95)),
    meanMs: round2(mean(durations)),
    minMs: round2(sorted[0]),
    maxMs: round2(sorted[sorted.length - 1]),
    throughputDocsPerSec: round2(spec.trials / wallSec),
    avgPdfSizeKb: round2(mean(sizes)),
    peakMemoryMb: round2(peakMemoryMb),
  };
}

async function main() {
  const cliBin = process.env.CLI_BIN || "/usr/local/bin/pdf-generator";
  const templatesDir = process.env.TEMPLATES_DIR || "/app/templates";
  const engineName = process.env.ENGINE || "pdfmake";

  let generator;
  if (engineName === "node-pdfgen-exec") {
    generator = new NodePdfgenExecGenerator(cliBin, templatesDir);
  } else if (engineName === "node-pdfgen-serve") {
    generator = new NodePdfgenServeGenerator(cliBin, templatesDir);
  } else {
    generator = new PdfmakeGenerator();
  }
  await generator.init();

  const specs = [
    { name: "invoice", kind: "invoice", trials: scaleTrials(300), rows: 1 },
    { name: "listing_100", kind: "listing", trials: scaleTrials(150), rows: 100 },
    { name: "complex", kind: "complex", trials: scaleTrials(150), rows: 1 },
    { name: "massive_1000", kind: "listing", trials: scaleTrials(12), rows: 1000 },
  ];

  const scenarios = [];
  try {
    for (const spec of specs) {
      scenarios.push(await runScenario(generator, spec));
    }
  } finally {
    await generator.close();
  }

  const report = {
    engine: generator.name,
    language: `node ${process.version}`,
    model: generator.model,
    environment: {
      platform: process.platform,
      arch: process.arch,
      engine: generator.name,
      trialsScale: String(scale),
    },
    scenarios,
  };

  const outPath = path.join(reportsDir, "results.json");
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`${generator.name} results -> ${outPath}`);
}

// ---------------------------------------------------------------------------

function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
}

function mean(values) {
  return values.reduce((acc, v) => acc + v, 0) / values.length;
}

function round2(v) {
  return Math.round(v * 100) / 100;
}

function scaleTrials(base) {
  return Math.max(3, Math.round(base * scale));
}

function positiveFloat(raw, fallback) {
  const value = Number.parseFloat(raw || "");
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
