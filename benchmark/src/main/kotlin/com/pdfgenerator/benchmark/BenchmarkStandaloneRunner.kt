package com.pdfgenerator.benchmark

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.pdfgenerator.benchmark.jasper.JasperRunner
import com.pdfgenerator.benchmark.metrics.ExecutionResult
import com.pdfgenerator.benchmark.metrics.MemoryProfiler
import com.pdfgenerator.benchmark.model.BenchmarkDataFactory
import com.pdfgenerator.benchmark.openpdf.OpenPdfRunner
import java.io.File

data class ScenarioSummary(
    val scenario: String,
    val openPdfLatencyP50Ms: Double,
    val openPdfLatencyP95Ms: Double,
    val openPdfLatencyP99Ms: Double,
    val openPdfThroughputDocsPerSec: Double,
    val openPdfAllocatedMemoryKb: Double,
    val openPdfOutputSizeBytes: Int,
    val jasperLatencyP50Ms: Double,
    val jasperLatencyP95Ms: Double,
    val jasperLatencyP99Ms: Double,
    val jasperThroughputDocsPerSec: Double,
    val jasperAllocatedMemoryKb: Double,
    val jasperOutputSizeBytes: Int,
    val speedupFactor: Double,
    val memorySavingFactor: Double,
)

data class BenchmarkFullReport(
    val environment: Map<String, String>,
    val coldStart: Map<String, Double>,
    val dependencySize: Map<String, Any>,
    val scenarios: List<ScenarioSummary>,
)

fun main() {
    println("=================================================================")
    println("🚀 Starting Open PDF Generator vs JasperReports Benchmark")
    println("=================================================================")

    // 1. Measure Cold Start
    println("⏱️  Measuring Cold Start (initialization + first PDF render)...")
    val invoiceData = BenchmarkDataFactory.createInvoiceData()

    val openPdfColdStartStart = System.nanoTime()
    val openPdfFirstRunner = OpenPdfRunner()
    openPdfFirstRunner.renderInvoice(invoiceData)
    val openPdfColdStartMs = (System.nanoTime() - openPdfColdStartStart) / 1_000_000.0

    val jasperColdStartStart = System.nanoTime()
    val jasperFirstRunner = JasperRunner()
    jasperFirstRunner.renderInvoice(invoiceData)
    val jasperColdStartMs = (System.nanoTime() - jasperColdStartStart) / 1_000_000.0

    println("   - Open PDF Generator Cold Start: %.1f ms".format(openPdfColdStartMs))
    println("   - JasperReports Cold Start:     %.1f ms".format(jasperColdStartMs))

    // 2. Prepare Runners and Data for Warm Execution
    println("\n🔥 Warming up JIT compilers...")
    val openPdf = OpenPdfRunner()
    val jasper = JasperRunner()

    val listing100Data = BenchmarkDataFactory.createListingData(100)
    val listing1000Data = BenchmarkDataFactory.createListingData(1000)
    val complexData = BenchmarkDataFactory.createComplexData()

    // Warmup iterations
    repeat(15) {
        openPdf.renderInvoice(invoiceData)
        jasper.renderInvoice(invoiceData)
        openPdf.renderListing(listing100Data)
        jasper.renderListing(listing100Data)
        openPdf.renderComplex(complexData)
        jasper.renderComplex(complexData)
    }

    val iterations = 50
    println("\n📊 Running $iterations iterations per scenario...")

    val scenarioConfigs = listOf(
        Triple("Invoice (1 page, 10 items)", invoiceData) { r: Any ->
            if (r is OpenPdfRunner) r.renderInvoice(invoiceData) else (r as JasperRunner).renderInvoice(invoiceData)
        },
        Triple("Catalog Listing (100 items, ~3 pages)", listing100Data) { r: Any ->
            if (r is OpenPdfRunner) r.renderListing(listing100Data) else (r as JasperRunner).renderListing(listing100Data)
        },
        Triple("Massive Catalog (1,000 items, ~25 pages)", listing1000Data) { r: Any ->
            if (r is OpenPdfRunner) r.renderListing(listing1000Data) else (r as JasperRunner).renderListing(listing1000Data)
        },
        Triple("Complex Document (Watermark, Barcode, Condition)", complexData) { r: Any ->
            if (r is OpenPdfRunner) r.renderComplex(complexData) else (r as JasperRunner).renderComplex(complexData)
        },
    )

    val summaries = mutableListOf<ScenarioSummary>()

    for ((name, _, exec) in scenarioConfigs) {
        print("   Testing '$name'...")
        val openPdfResults = mutableListOf<ExecutionResult>()
        val jasperResults = mutableListOf<ExecutionResult>()

        for (i in 1..iterations) {
            openPdfResults.add(MemoryProfiler.measure("OpenPDF", name) { exec(openPdf) })
            jasperResults.add(MemoryProfiler.measure("Jasper", name) { exec(jasper) })
        }

        val openPdfP50 = percentile(openPdfResults.map { it.durationMs }, 50.0)
        val openPdfP95 = percentile(openPdfResults.map { it.durationMs }, 95.0)
        val openPdfP99 = percentile(openPdfResults.map { it.durationMs }, 99.0)
        val openPdfThroughput = 1000.0 / (openPdfResults.map { it.durationMs }.average())
        val openPdfAllocKb = openPdfResults.map { it.allocatedBytes }.average() / 1024.0
        val openPdfOutputSize = openPdfResults.first().outputSizeBytes

        val jasperP50 = percentile(jasperResults.map { it.durationMs }, 50.0)
        val jasperP95 = percentile(jasperResults.map { it.durationMs }, 95.0)
        val jasperP99 = percentile(jasperResults.map { it.durationMs }, 99.0)
        val jasperThroughput = 1000.0 / (jasperResults.map { it.durationMs }.average())
        val jasperAllocKb = jasperResults.map { it.allocatedBytes }.average() / 1024.0
        val jasperOutputSize = jasperResults.first().outputSizeBytes

        val speedup = jasperP50 / openPdfP50.coerceAtLeast(0.001)
        val memSaving = jasperAllocKb / openPdfAllocKb.coerceAtLeast(0.001)

        val summary = ScenarioSummary(
            scenario = name,
            openPdfLatencyP50Ms = openPdfP50,
            openPdfLatencyP95Ms = openPdfP95,
            openPdfLatencyP99Ms = openPdfP99,
            openPdfThroughputDocsPerSec = openPdfThroughput,
            openPdfAllocatedMemoryKb = openPdfAllocKb,
            openPdfOutputSizeBytes = openPdfOutputSize,
            jasperLatencyP50Ms = jasperP50,
            jasperLatencyP95Ms = jasperP95,
            jasperLatencyP99Ms = jasperP99,
            jasperThroughputDocsPerSec = jasperThroughput,
            jasperAllocatedMemoryKb = jasperAllocKb,
            jasperOutputSizeBytes = jasperOutputSize,
            speedupFactor = speedup,
            memorySavingFactor = memSaving,
        )
        summaries.add(summary)
        println(" Done! (Speedup: %.2fx, Memory Saving: %.2fx)".format(speedup, memSaving))
    }

    // 3. Dependency Footprint
    val classpath = System.getProperty("java.class.path").split(File.pathSeparator)
    var openPdfTotalSize = 0L
    var jasperTotalSize = 0L

    for (entry in classpath) {
        val file = File(entry)
        if (!file.exists()) continue
        val name = file.name.lowercase()
        val length = file.length()
        if (name.contains("open-pdf-generator") || name.contains("openpdf") || name.contains("gson") || name.contains("zxing")) {
            openPdfTotalSize += length
        }
        if (name.contains("jasper") || name.contains("commons-") || name.contains("ecj") || name.contains("openpdf")) {
            jasperTotalSize += length
        }
    }

    val dependencySizeMap = mapOf(
        "openPdfSizeMb" to (openPdfTotalSize / (1024.0 * 1024.0)),
        "jasperSizeMb" to (jasperTotalSize / (1024.0 * 1024.0)),
        "ratio" to (jasperTotalSize.toDouble() / openPdfTotalSize.coerceAtLeast(1).toDouble()),
    )

    val environment = mapOf(
        "os" to System.getProperty("os.name") + " " + System.getProperty("os.arch"),
        "javaVersion" to System.getProperty("java.version"),
        "javaVendor" to System.getProperty("java.vendor"),
        "availableProcessors" to Runtime.getRuntime().availableProcessors().toString(),
        "maxHeapMb" to (Runtime.getRuntime().maxMemory() / (1024 * 1024)).toString(),
    )

    val report = BenchmarkFullReport(
        environment = environment,
        coldStart = mapOf(
            "openPdfColdStartMs" to openPdfColdStartMs,
            "jasperColdStartMs" to jasperColdStartMs,
            "ratio" to (jasperColdStartMs / openPdfColdStartMs.coerceAtLeast(0.01)),
        ),
        dependencySize = dependencySizeMap,
        scenarios = summaries,
    )

    val outputDir = File("build/reports/benchmark")
    outputDir.mkdirs()
    val jsonFile = File(outputDir, "benchmark-summary.json")

    val mapper = ObjectMapper().enable(SerializationFeature.INDENT_OUTPUT)
    mapper.writeValue(jsonFile, report)

    println("\n=================================================================")
    println("✅ Benchmark completed successfully!")
    println("📄 Summary written to: ${jsonFile.absolutePath}")
    println("=================================================================")
}

fun percentile(values: List<Double>, p: Double): Double {
    if (values.isEmpty()) return 0.0
    val sorted = values.sorted()
    val index = Math.ceil(p / 100.0 * sorted.size).toInt() - 1
    return sorted[index.coerceIn(0, sorted.size - 1)]
}
