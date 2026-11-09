package com.pdfgenerator.benchmark

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

data class ConcurrencySummary(
    val threads: Int,
    val totalRequests: Int,
    val openPdfDurationMs: Double,
    val openPdfThroughputDocsPerSec: Double,
    val jasperDurationMs: Double,
    val jasperThroughputDocsPerSec: Double,
    val speedupFactor: Double,
)

data class StreamingSummary(
    val mode: String,
    val openPdfLatencyP50Ms: Double,
    val jasperLatencyP50Ms: Double,
    val speedupFactor: Double,
)

data class SchemaValidationCostSummary(
    val withoutValidationP50Ms: Double,
    val withValidationP50Ms: Double,
    val overheadMs: Double,
    val overheadPercent: Double,
)

data class BenchmarkFullReport(
    val environment: Map<String, String>,
    val coldStart: Map<String, Double>,
    val dependencySize: Map<String, Any>,
    val scenarios: List<ScenarioSummary>,
    val concurrency: List<ConcurrencySummary>,
    val streaming: List<StreamingSummary>,
    val schemaValidation: SchemaValidationCostSummary,
)

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
