package com.pdfgenerator.benchmark

import com.pdfgenerator.benchmark.jasper.JasperRunner
import com.pdfgenerator.benchmark.model.BenchmarkDataFactory
import com.pdfgenerator.benchmark.openpdf.OpenPdfRunner
import org.openjdk.jmh.annotations.Benchmark
import org.openjdk.jmh.annotations.BenchmarkMode
import org.openjdk.jmh.annotations.Mode
import org.openjdk.jmh.annotations.OutputTimeUnit
import org.openjdk.jmh.annotations.Scope
import org.openjdk.jmh.annotations.Setup
import org.openjdk.jmh.annotations.State
import java.util.concurrent.TimeUnit

@State(Scope.Benchmark)
@BenchmarkMode(Mode.Throughput, Mode.AverageTime)
@OutputTimeUnit(TimeUnit.MILLISECONDS)
open class PdfBenchmarkJmh {

    private lateinit var openPdf: OpenPdfRunner
    private lateinit var jasper: JasperRunner

    private lateinit var invoiceData: Map<String, Any?>
    private lateinit var listing100Data: Map<String, Any?>
    private lateinit var listing1000Data: Map<String, Any?>
    private lateinit var complexData: Map<String, Any?>

    @Setup
    fun setup() {
        openPdf = OpenPdfRunner()
        jasper = JasperRunner()

        invoiceData = BenchmarkDataFactory.createInvoiceData()
        listing100Data = BenchmarkDataFactory.createListingData(100)
        listing1000Data = BenchmarkDataFactory.createListingData(1000)
        complexData = BenchmarkDataFactory.createComplexData()
    }

    @Benchmark
    fun openPdf_invoice(): ByteArray = openPdf.renderInvoice(invoiceData)

    @Benchmark
    fun jasper_invoice(): ByteArray = jasper.renderInvoice(invoiceData)

    @Benchmark
    fun openPdf_listing_100(): ByteArray = openPdf.renderListing(listing100Data)

    @Benchmark
    fun jasper_listing_100(): ByteArray = jasper.renderListing(listing100Data)

    @Benchmark
    fun openPdf_listing_1000(): ByteArray = openPdf.renderListing(listing1000Data)

    @Benchmark
    fun jasper_listing_1000(): ByteArray = jasper.renderListing(listing1000Data)

    @Benchmark
    fun openPdf_complex(): ByteArray = openPdf.renderComplex(complexData)

    @Benchmark
    fun jasper_complex(): ByteArray = jasper.renderComplex(complexData)
}
