package com.pdfgenerator.benchmark.metrics

import com.sun.management.ThreadMXBean
import java.lang.management.ManagementFactory

data class ExecutionResult(
    val library: String,
    val scenario: String,
    val durationMs: Double,
    val allocatedBytes: Long,
    val outputSizeBytes: Int,
    val gcCountDelta: Long,
    val gcTimeMsDelta: Long,
)

object MemoryProfiler {
    private val threadMxBean: ThreadMXBean? = try {
        ManagementFactory.getThreadMXBean() as? ThreadMXBean
    } catch (_: Exception) {
        null
    }

    private val gcBeans = ManagementFactory.getGarbageCollectorMXBeans()

    fun measure(
        library: String,
        scenario: String,
        block: () -> ByteArray,
    ): ExecutionResult {
        val currentThreadId = Thread.currentThread().threadId()
        val startAllocated = threadMxBean?.getThreadAllocatedBytes(currentThreadId) ?: 0L

        val startGcCount = gcBeans.sumOf { it.collectionCount }
        val startGcTime = gcBeans.sumOf { it.collectionTime }

        val startTime = System.nanoTime()
        val pdfBytes = block()
        val endTime = System.nanoTime()

        val endAllocated = threadMxBean?.getThreadAllocatedBytes(currentThreadId) ?: 0L
        val endGcCount = gcBeans.sumOf { it.collectionCount }
        val endGcTime = gcBeans.sumOf { it.collectionTime }

        val durationMs = (endTime - startTime) / 1_000_000.0
        val allocatedBytes = if (endAllocated >= startAllocated) endAllocated - startAllocated else 0L

        return ExecutionResult(
            library = library,
            scenario = scenario,
            durationMs = durationMs,
            allocatedBytes = allocatedBytes,
            outputSizeBytes = pdfBytes.size,
            gcCountDelta = endGcCount - startGcCount,
            gcTimeMsDelta = endGcTime - startGcTime,
        )
    }

    fun getDependencyMetrics(): Map<String, Any> {
        val openPdfJars = listOf(
            "open-pdf-generator",
            "openpdf",
            "gson",
            "json-schema-validator",
            "core-3.5.3",
            "javase-3.5.3",
        )
        val jasperJars = listOf(
            "jasperreports",
            "commons-beanutils",
            "commons-collections",
            "commons-digester",
            "commons-logging",
            "ecj",
            "openpdf",
        )
        return mapOf(
            "openPdfJars" to openPdfJars,
            "jasperJars" to jasperJars,
        )
    }
}
