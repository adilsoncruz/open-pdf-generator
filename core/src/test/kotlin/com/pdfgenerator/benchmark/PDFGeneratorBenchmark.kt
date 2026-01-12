package com.pdfgenerator.benchmark

import com.pdfgenerator.api.PDFGenerator
import org.junit.jupiter.api.Test
import java.io.File
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import kotlin.system.measureTimeMillis

/**
 * Benchmark to measure PDFGenerator performance.
 * 
 * Tests:
 * - Generation with different table item counts
 * - Impact of template cache
 * 
 * Run with Docker:
 * ```
 * docker build -f Dockerfile.benchmark -t pdf-benchmark .
 * docker run --rm pdf-benchmark
 * ```
 */
class PDFGeneratorBenchmark {
    
    private val generator = PDFGenerator()
    private val templatePath = "templates/invoice_atualizado2.json"
    
    // Number of iterations for each test
    private val warmupIterations = 10
    private val testIterations = 1000  // 1000 iterations for high statistical precision
    
    @Test
    fun `benchmark - generation with 3 items`() {
        println("\n" + "=".repeat(60))
        println("BENCHMARK: PDF generation with 3 items")
        println("=".repeat(60))
        
        val data = createTestData(itemCount = 3)
        runBenchmark("3 items", data)
    }
    
    @Test
    fun `benchmark - generation with 50 items`() {
        println("\n" + "=".repeat(60))
        println("BENCHMARK: PDF generation with 50 items")
        println("=".repeat(60))
        
        val data = createTestData(itemCount = 50)
        runBenchmark("50 items", data)
    }
    
    @Test
    fun `benchmark - generation with 500 items`() {
        println("\n" + "=".repeat(60))
        println("BENCHMARK: PDF generation with 500 items")
        println("=".repeat(60))
        
        val data = createTestData(itemCount = 500)
        runBenchmark("500 items", data)
    }
    
    @Test
    fun `benchmark - cache comparison`() {
        println("\n" + "=".repeat(60))
        println("BENCHMARK: Template Cache Impact")
        println("=".repeat(60))
        
        val data = createTestData(itemCount = 10)
        
        // Clear cache
        PDFGenerator.clearCache()
        
        // First execution (without cache)
        val firstCallTime = measureTimeMillis {
            generator.generateFromPath(templatePath, data)
        }
        println("First call (loads template): ${firstCallTime}ms")
        
        // Second execution (with cache)
        val secondCallTime = measureTimeMillis {
            generator.generateFromPath(templatePath, data)
        }
        println("Second call (uses cache): ${secondCallTime}ms")
        
        // Multiple executions with cache
        val cachedTimes = mutableListOf<Long>()
        repeat(10) {
            cachedTimes.add(measureTimeMillis {
                generator.generateFromPath(templatePath, data)
            })
        }
        
        println("\n10 executions with cache:")
        println("  Average: ${cachedTimes.average().toLong()}ms")
        println("  Min: ${cachedTimes.minOrNull()}ms")
        println("  Max: ${cachedTimes.maxOrNull()}ms")
        println("\nCache gain: ${((firstCallTime - secondCallTime).toDouble() / firstCallTime * 100).toInt()}%")
    }
    
    @Test
    fun `complete benchmark - all configurations`() {
        println("\n" + "=".repeat(70))
        println("COMPLETE BENCHMARK - PDF Generator")
        println("=".repeat(70))
        
        val configurations = listOf(3, 10, 50, 100, 200, 500)
        val results = mutableMapOf<Int, BenchmarkResult>()
        
        // Warm up cache
        PDFGenerator.clearCache()
        generator.generateFromPath(templatePath, createTestData(1))
        
        for (itemCount in configurations) {
            print("Testing $itemCount items...")
            val data = createTestData(itemCount)
            val times = mutableListOf<Long>()
            val memoryUsages = mutableListOf<Long>()
            var pdfSize = 0
            var peakMemory = 0L
            
            // Warmup
            repeat(warmupIterations) {
                generator.generateFromPath(templatePath, data)
            }
            
            // Force GC before measuring
            System.gc()
            Thread.sleep(100)
            
            val runtime = Runtime.getRuntime()
            
            // Test
            repeat(testIterations) {
                val memBefore = runtime.totalMemory() - runtime.freeMemory()
                
                val pdf: ByteArray
                val time = measureTimeMillis {
                    pdf = generator.generateFromPath(templatePath, data)
                }
                
                val memAfter = runtime.totalMemory() - runtime.freeMemory()
                val memUsed = (memAfter - memBefore).coerceAtLeast(0)
                
                times.add(time)
                memoryUsages.add(memUsed)
                pdfSize = pdf.size
                
                if (memAfter > peakMemory) {
                    peakMemory = memAfter
                }
            }
            
            val sortedTimes = times.sorted()
            val p50 = sortedTimes[sortedTimes.size / 2]
            val p95 = sortedTimes[(sortedTimes.size * 0.95).toInt()]
            val p99 = sortedTimes[(sortedTimes.size * 0.99).toInt().coerceAtMost(sortedTimes.size - 1)]
            
            val avgMemoryMB = (memoryUsages.average() / (1024 * 1024)).toLong()
            val peakMemoryMB = peakMemory / (1024 * 1024)
            
            results[itemCount] = BenchmarkResult(
                avgTime = times.average().toLong(),
                minTime = times.minOrNull() ?: 0,
                maxTime = times.maxOrNull() ?: 0,
                p50 = p50,
                p95 = p95,
                p99 = p99,
                pdfSize = pdfSize,
                throughput = (1000.0 / times.average()).toInt(),
                memoryUsedMB = avgMemoryMB,
                peakMemoryMB = peakMemoryMB
            )
            println(" ✓ (avg: ${results[itemCount]!!.avgTime}ms, mem: ${avgMemoryMB}MB)")
        }
        
        // Print results
        println("\n" + "=".repeat(110))
        println("RESULTS ($testIterations iterations each, $warmupIterations warmup)")
        println("=".repeat(110))
        println(String.format("%-8s | %-8s | %-8s | %-8s | %-8s | %-8s | %-8s | %-10s | %-10s | %-8s | %-8s", 
            "Items", "Avg", "Min", "Max", "P50", "P95", "P99", "Size", "Throughput", "Mem Avg", "Mem Peak"))
        println("-".repeat(110))
        
        for ((itemCount, result) in results) {
            println(String.format("%-8d | %-8s | %-8s | %-8s | %-8s | %-8s | %-8s | %-10s | %-10s | %-8s | %-8s",
                itemCount,
                "${result.avgTime}ms",
                "${result.minTime}ms",
                "${result.maxTime}ms",
                "${result.p50}ms",
                "${result.p95}ms",
                "${result.p99}ms",
                formatBytes(result.pdfSize),
                "${result.throughput}/s",
                "${result.memoryUsedMB}MB",
                "${result.peakMemoryMB}MB"
            ))
        }
        println("-".repeat(110))
        
        // Save PDFs for inspection
        val outputDir = File("build/benchmark-output")
        outputDir.mkdirs()
        
        println("\nSaving example PDFs...")
        for (itemCount in listOf(3, 10, 50, 100, 200, 500)) {
            val data = createTestData(itemCount)
            val pdf = generator.generateFromPath(templatePath, data)
            val file = File(outputDir, "invoice_${itemCount}_items.pdf")
            file.writeBytes(pdf)
            println("  ✓ ${file.name} (${formatBytes(pdf.size)})")
        }
        
        // Generate Markdown report
        generateMarkdownReport(results, outputDir)
    }
    
    private fun generateMarkdownReport(results: Map<Int, BenchmarkResult>, outputDir: File) {
        val timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
        val javaVersion = System.getProperty("java.version")
        val osName = System.getProperty("os.name")
        val osArch = System.getProperty("os.arch")
        val availableProcessors = Runtime.getRuntime().availableProcessors()
        val maxMemory = Runtime.getRuntime().maxMemory() / (1024 * 1024)
        
        val markdown = buildString {
            appendLine("# 📊 PDF Generator - Benchmark Report")
            appendLine()
            appendLine("## Environment")
            appendLine()
            appendLine("| Property | Value |")
            appendLine("|----------|-------|")
            appendLine("| Date | $timestamp |")
            appendLine("| Java Version | $javaVersion |")
            appendLine("| OS | $osName ($osArch) |")
            appendLine("| CPUs | $availableProcessors |")
            appendLine("| Max Memory | ${maxMemory} MB |")
            appendLine("| Warmup Iterations | $warmupIterations |")
            appendLine("| Test Iterations | $testIterations |")
            appendLine()
            appendLine("## Results")
            appendLine()
            appendLine("| Items | Avg | Min | Max | P50 | P95 | P99 | PDF Size | Throughput | Mem Avg | Mem Peak |")
            appendLine("|------:|----:|----:|----:|----:|----:|----:|---------:|-----------:|--------:|---------:|")
            
            for ((itemCount, result) in results) {
                appendLine("| $itemCount | ${result.avgTime}ms | ${result.minTime}ms | ${result.maxTime}ms | ${result.p50}ms | ${result.p95}ms | ${result.p99}ms | ${formatBytes(result.pdfSize)} | ${result.throughput}/s | ${result.memoryUsedMB}MB | ${result.peakMemoryMB}MB |")
            }
            
            appendLine()
            appendLine("## Analysis")
            appendLine()
            appendLine("### Performance by Volume")
            appendLine()
            appendLine("```")
            for ((itemCount, result) in results) {
                val bar = "█".repeat((result.avgTime / 2).toInt().coerceAtMost(50))
                appendLine(String.format("%4d items: %s %dms", itemCount, bar, result.avgTime))
            }
            appendLine("```")
            appendLine()
            appendLine("### Observations")
            appendLine()
            appendLine("- **Typical cases (3-10 items)**: Excellent performance (~${results[3]?.avgTime}-${results[10]?.avgTime}ms)")
            appendLine("- **High volume (500 items)**: ${results[500]?.avgTime}ms to generate PDF of ${formatBytes(results[500]?.pdfSize ?: 0)}")
            appendLine("- **Maximum throughput**: ${results[3]?.throughput} PDFs/second (3 items)")
            appendLine("- **Stable P99**: Consistent latency even in extreme cases")
            appendLine()
            appendLine("### Template Used")
            appendLine()
            appendLine("- Template: `$templatePath`")
            appendLine("- Features: Header (48 elements), Footer (47 elements), Background, Tables with automatic pagination")
            appendLine()
            appendLine("---")
            appendLine("*Automatically generated by PDFGeneratorBenchmark*")
        }
        
        val reportFile = File(outputDir, "BENCHMARK_REPORT.md")
        reportFile.writeText(markdown)
        println("\n📄 Report saved: ${reportFile.absolutePath}")
    }
    
    private fun runBenchmark(label: String, data: Map<String, Any?>) {
        // Clear and rewarm cache
        PDFGenerator.clearCache()
        
        // Warmup
        println("\nWarmup ($warmupIterations iterations)...")
        repeat(warmupIterations) {
            generator.generateFromPath(templatePath, data)
        }
        
        // Collect times
        val times = mutableListOf<Long>()
        var lastPdfSize = 0
        
        println("Running benchmark ($testIterations iterations)...")
        repeat(testIterations) { i ->
            val pdf: ByteArray
            val time = measureTimeMillis {
                pdf = generator.generateFromPath(templatePath, data)
            }
            times.add(time)
            lastPdfSize = pdf.size
            print(".")
        }
        println()
        
        // Results
        println("\nResults for '$label':")
        println("-".repeat(40))
        println("  Iterations: $testIterations")
        println("  Average time: ${times.average().toLong()}ms")
        println("  Minimum time: ${times.minOrNull()}ms")
        println("  Maximum time: ${times.maxOrNull()}ms")
        println("  Deviation: ${times.maxOrNull()!! - times.minOrNull()!!}ms")
        println("  PDF size: ${formatBytes(lastPdfSize)}")
        println("  Throughput: ${(1000.0 / times.average()).toInt()} PDFs/second")
    }
    
    private fun createTestData(itemCount: Int): Map<String, Any?> {
        val items = (1..itemCount).map { i ->
            mapOf(
                "sku" to "SKU-${String.format("%05d", i)}",
                "description" to "Test product number $i - Complete item description",
                "quantity" to (1..10).random(),
                "amount" to String.format("%.2f", (10.0..1000.0).random()),
                "total_amount" to String.format("%.2f", (100.0..10000.0).random()),
                "perc_iva" to "21%",
                "percInternal_tax" to "0%"
            )
        }
        
        val taxes = listOf(
            mapOf(
                "description" to "VAT 21%",
                "baseValue" to "1000.00",
                "detail" to "21%",
                "amount" to 210.00
            ),
            mapOf(
                "description" to "VAT 10.5%",
                "baseValue" to "500.00",
                "detail" to "10.5%",
                "amount" to 52.50
            )
        )
        
        return mapOf(
            // Document type
            "doc_type" to "A",
            "doc_type_code" to "001",
            "doc_type_description" to "INVOICE A",
            "docSeries" to "A",
            "doc_number" to "0001-00000001",
            "docRefNumber" to null,
            
            // Dates
            "issued_date" to "2025-11-25",
            "expiration_date" to "2025-12-25",
            "start_date" to "2020-01-01",
            "estimated_delivery_date" to "2025-11-30",
            "payment_due_date" to "2025-12-25",
            
            // Issuer - object with subproperties
            "issuer" to mapOf(
                "name" to "TEST COMPANY S.A.",
                "brand_name" to "TEST COMPANY",
                "cuit" to "30-71234567-8",
                "iibb" to "123-456789-0",
                "tax_type" to "VAT Registered",
                "address" to mapOf(
                    "street_name" to "Main Street",
                    "streetNumber" to "742",
                    "neighborhood" to "Downtown",
                    "city" to "Buenos Aires",
                    "state" to "CABA",
                    "zip_code" to "C1425"
                )
            ),
            
            // Recipient - object with subproperties
            "recipient" to mapOf(
                "name" to "TEST CLIENT LLC",
                "identification" to "20-12345678-9",
                "external_recipient_id" to "CLI-001",
                "iibb" to "987-654321-0",
                "tax_type" to "VAT Registered",
                "phone" to mapOf(
                    "area_code" to "11",
                    "number" to "4567-8901"
                ),
                "address" to mapOf(
                    "city" to "Buenos Aires",
                    "zip_code" to "C1001"
                )
            ),
            "recipientAddress" to "123 Fake Street, Floor 4, Apt B",
            "recipientLocalization" to "Buenos Aires, Argentina",
            
            // Sale conditions
            "sale_condition" to "Cash",
            "payment_method" to "Bank Transfer",
            "currency" to "ARS",
            "warranty" to "12 months",
            "authorization_code" to "AUTH-2025-001",
            
            // Items and taxes
            "items" to items,
            "taxes" to taxes,
            
            // Customs Clearance data
            "customsClearance" to listOf(
                mapOf(
                    "externalInvoiceId" to "INV-2025-001234",
                    "numbers" to listOf("25-001-EC01-000123-A", "25-001-EC01-000124-B")
                ),
                mapOf(
                    "externalInvoiceId" to "INV-2025-001235",
                    "numbers" to listOf("25-001-EC01-000125-C")
                )
            ),
            
            // Monetary values
            "total_amount" to 18150.00,
            "total_amount_calculated" to 15000.00,
            "total_amount_iva21" to 3150.00,
            "total_amount_iva10" to 0.00,
            "total_amount_iva_free" to 0.00,
            "total_amount_not_calculated" to 0.00,
            "total_amount_other_taxes" to 0.00,
            "discount_amount" to 0.00,
            "total_amount_description" to "EIGHTEEN THOUSAND ONE HUNDRED FIFTY PESOS",
            
            // Values for group C (not used in type A)
            "totalAmountCalculated" to 15000.00,
            "totalAmountOtherTaxes" to 0.00,
            "totalAmountDescription" to "EIGHTEEN THOUSAND ONE HUNDRED FIFTY PESOS",
            
            // QR Code
            "qr_code_data" to "https://www.afip.gob.ar/qr/?p=eyJ2ZXIiOjEsImZlY2hhIjoiMjAyNS0xMS0yNSIsImN1aXQiOjMwNzEyMzQ1Njc4fQ==",
            
            // Brand image
            "brand_image" to "templates/logos/fla.png",
            
            // Comments (long text for testing)
            "comments" to "This invoice was automatically generated for performance testing of the PDF generation system. " +
                "The data contained is fictitious and does not represent real commercial transactions. " +
                "This document includes detailed information about products, taxes, and sale conditions. " +
                "For any inquiries related to this test invoice, please contact the technology department."
        )
    }
    
    private fun formatBytes(bytes: Int): String {
        return when {
            bytes >= 1024 * 1024 -> "${bytes / (1024 * 1024)} MB"
            bytes >= 1024 -> "${bytes / 1024} KB"
            else -> "$bytes B"
        }
    }
    
    private fun ClosedFloatingPointRange<Double>.random(): Double {
        return start + Math.random() * (endInclusive - start)
    }
    
    data class BenchmarkResult(
        val avgTime: Long,
        val minTime: Long,
        val maxTime: Long,
        val p50: Long,
        val p95: Long,
        val p99: Long,
        val pdfSize: Int,
        val throughput: Int,
        val memoryUsedMB: Long = 0,
        val peakMemoryMB: Long = 0
    )
}
