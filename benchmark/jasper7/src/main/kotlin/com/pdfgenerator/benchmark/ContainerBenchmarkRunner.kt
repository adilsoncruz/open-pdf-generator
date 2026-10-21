package com.pdfgenerator.benchmark

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.pdfgenerator.benchmark.jasper.JasperRunner
import com.pdfgenerator.benchmark.model.BenchmarkDataFactory
import com.pdfgenerator.benchmark.openpdf.OpenPdfRunner
import com.sun.management.OperatingSystemMXBean
import java.io.File
import java.lang.management.ManagementFactory
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.concurrent.thread

data class ContainerRunMetrics(
    val engine: String,
    val totalRequests: Int,
    val concurrency: Int,
    val totalDurationSec: Double,
    val throughputDocsPerSec: Double,
    val peakMemoryRssMb: Double,
    val averageMemoryRssMb: Double,
    val peakCpuPercent: Double,
    val averageCpuPercent: Double,
    val cgroupPeakMemoryMb: Double?,
    val jvmHeapPeakMb: Double,
)

fun main(args: Array<String>) {
    val engine = args.getOrNull(0)?.lowercase() ?: "all"
    val count = args.getOrNull(1)?.toIntOrNull() ?: 300
    val concurrency = args.getOrNull(2)?.toIntOrNull() ?: 4

    println("=================================================================")
    println("🐳 Container Benchmark Runner (cgroups & OS metrics)")
    println("   Target: $engine | Requests: $count | Concurrency: $concurrency")
    println("=================================================================")

    if (engine == "all") {
        println("Running comparative benchmark between Open PDF and Jasper...")
        val openPdfMetrics = runEngineBenchmark("openpdf", count, concurrency)
        println("\nCooling down for 3 seconds...")
        Thread.sleep(3000)
        System.gc()
        val jasperMetrics = runEngineBenchmark("jasper", count, concurrency)

        val report = mapOf(
            "openpdf" to openPdfMetrics,
            "jasper" to jasperMetrics,
            "comparison" to mapOf(
                "throughputSpeedup" to (openPdfMetrics.throughputDocsPerSec / jasperMetrics.throughputDocsPerSec),
                "memoryReductionPercent" to ((1.0 - (openPdfMetrics.peakMemoryRssMb / jasperMetrics.peakMemoryRssMb)) * 100.0),
                "avgCpuRatio" to (openPdfMetrics.averageCpuPercent / jasperMetrics.averageCpuPercent),
            ),
        )

        val outputDir = File("build/reports/benchmark")
        outputDir.mkdirs()
        val jsonFile = File(outputDir, "container-benchmark-summary.json")
        ObjectMapper().enable(SerializationFeature.INDENT_OUTPUT).writeValue(jsonFile, report)
        println("\n📄 Container benchmark summary written to: ${jsonFile.absolutePath}")
    } else {
        val metrics = runEngineBenchmark(engine, count, concurrency)
        println("\nResult: ${ObjectMapper().writeValueAsString(metrics)}")
    }
}

fun runEngineBenchmark(engine: String, count: Int, concurrency: Int): ContainerRunMetrics {
    println("▶️ Starting test for: ${engine.uppercase()} ($count requests, $concurrency threads)...")
    val invoiceData = BenchmarkDataFactory.createInvoiceData()

    val openPdfRunner = if (engine == "openpdf") OpenPdfRunner() else null
    val jasperRunner = if (engine == "jasper") JasperRunner() else null

    // Warmup
    repeat(10) {
        if (engine == "openpdf") openPdfRunner!!.renderInvoice(invoiceData) else jasperRunner!!.renderInvoice(invoiceData)
    }

    val osBean = ManagementFactory.getOperatingSystemMXBean() as OperatingSystemMXBean
    val memoryBean = ManagementFactory.getMemoryMXBean()

    val cpuSamples = mutableListOf<Double>()
    val rssSamples = mutableListOf<Double>()
    val isRunning = AtomicBoolean(true)

    // Background sampler thread (every 25 ms)
    val sampler = thread(start = true, isDaemon = true) {
        while (isRunning.get()) {
            val cpu = osBean.processCpuLoad * 100.0
            if (cpu >= 0) cpuSamples.add(cpu)

            val currentRss = readCurrentRssMb()
            if (currentRss > 0) rssSamples.add(currentRss)

            Thread.sleep(25)
        }
    }

    val executor = Executors.newFixedThreadPool(concurrency)
    val startTime = System.nanoTime()

    val futures = (1..count).map { seq ->
        executor.submit {
            val uniqueData = BenchmarkDataFactory.createInvoiceData(seq)
            if (engine == "openpdf") {
                openPdfRunner!!.renderInvoice(uniqueData)
            } else {
                jasperRunner!!.renderInvoice(uniqueData)
            }
        }
    }
    futures.forEach { it.get() }

    val endTime = System.nanoTime()
    isRunning.set(false)
    sampler.join(500)
    executor.shutdown()

    val durationSec = (endTime - startTime) / 1_000_000_000.0
    val throughput = count / durationSec

    val peakCpu = if (cpuSamples.isNotEmpty()) cpuSamples.maxOrNull() ?: 0.0 else 0.0
    val avgCpu = if (cpuSamples.isNotEmpty()) cpuSamples.average() else 0.0

    val peakRss = if (rssSamples.isNotEmpty()) rssSamples.maxOrNull() ?: 0.0 else readCurrentRssMb()
    val avgRss = if (rssSamples.isNotEmpty()) rssSamples.average() else peakRss

    val cgroupPeak = readCgroupPeakMemoryMb()
    val heapPeakMb = memoryBean.heapMemoryUsage.used / (1024.0 * 1024.0)

    println("   ✅ ${engine.uppercase()} completed in %.2f s".format(durationSec))
    println("      - Throughput: %.1f docs/s".format(throughput))
    println("      - Peak RSS Memory: %.1f MB (Cgroup Peak: %s MB)".format(peakRss, cgroupPeak?.let { "%.1f".format(it) } ?: "N/A"))
    println("      - Avg CPU Usage: %.1f%% (Peak: %.1f%%)".format(avgCpu, peakCpu))

    return ContainerRunMetrics(
        engine = engine,
        totalRequests = count,
        concurrency = concurrency,
        totalDurationSec = durationSec,
        throughputDocsPerSec = throughput,
        peakMemoryRssMb = peakRss,
        averageMemoryRssMb = avgRss,
        peakCpuPercent = peakCpu,
        averageCpuPercent = avgCpu,
        cgroupPeakMemoryMb = cgroupPeak,
        jvmHeapPeakMb = heapPeakMb,
    )
}

fun readCurrentRssMb(): Double {
    // 1. Try Linux cgroup v2
    val cgroupMem = File("/sys/fs/cgroup/memory.current")
    if (cgroupMem.exists()) {
        try {
            val bytes = cgroupMem.readText().trim().toLong()
            return bytes / (1024.0 * 1024.0)
        } catch (_: Exception) {}
    }

    // 2. Fallback to /proc/self/statm (Linux RSS pages * 4KB)
    val statm = File("/proc/self/statm")
    if (statm.exists()) {
        try {
            val parts = statm.readText().trim().split("\\s+".toRegex())
            if (parts.size >= 2) {
                val rssPages = parts[1].toLong()
                return (rssPages * 4096) / (1024.0 * 1024.0)
            }
        } catch (_: Exception) {}
    }

    // 3. Fallback to JVM total memory
    val totalMem = Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory()
    return totalMem / (1024.0 * 1024.0)
}

fun readCgroupPeakMemoryMb(): Double? {
    val peakFile = File("/sys/fs/cgroup/memory.peak")
    if (peakFile.exists()) {
        try {
            val bytes = peakFile.readText().trim().toLong()
            return bytes / (1024.0 * 1024.0)
        } catch (_: Exception) {}
    }
    return null
}
