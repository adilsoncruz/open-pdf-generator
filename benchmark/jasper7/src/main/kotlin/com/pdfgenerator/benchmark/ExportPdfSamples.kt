package com.pdfgenerator.benchmark

import com.pdfgenerator.benchmark.jasper.JasperRunner
import com.pdfgenerator.benchmark.model.BenchmarkDataFactory
import com.pdfgenerator.benchmark.openpdf.OpenPdfRunner
import java.io.File

fun main() {
    val outputDir = File("comparison-samples")
    outputDir.mkdirs()

    val openPdf = OpenPdfRunner()
    val jasper = JasperRunner()

    println("Generating sample PDFs for visual and size comparison...")

    // 1. Commercial Invoice
    val invoiceData = BenchmarkDataFactory.createInvoiceData()
    val openPdfInvoice = openPdf.renderInvoice(invoiceData)
    val jasperInvoice = jasper.renderInvoice(invoiceData)
    File(outputDir, "openpdf_invoice.pdf").writeBytes(openPdfInvoice)
    File(outputDir, "jasper_invoice.pdf").writeBytes(jasperInvoice)

    // 2. Catalog Listing (100 items)
    val listing100Data = BenchmarkDataFactory.createListingData(100)
    val openPdfListing100 = openPdf.renderListing(listing100Data)
    val jasperListing100 = jasper.renderListing(listing100Data)
    File(outputDir, "openpdf_listing_100.pdf").writeBytes(openPdfListing100)
    File(outputDir, "jasper_listing_100.pdf").writeBytes(jasperListing100)

    // 3. Massive Catalog (1000 items)
    val listing1000Data = BenchmarkDataFactory.createListingData(1000)
    val openPdfListing1000 = openPdf.renderListing(listing1000Data)
    val jasperListing1000 = jasper.renderListing(listing1000Data)
    File(outputDir, "openpdf_massive_1000.pdf").writeBytes(openPdfListing1000)
    File(outputDir, "jasper_massive_1000.pdf").writeBytes(jasperListing1000)

    // 4. Complex Document
    val complexData = BenchmarkDataFactory.createComplexData()
    val openPdfComplex = openPdf.renderComplex(complexData)
    val jasperComplex = jasper.renderComplex(complexData)
    File(outputDir, "openpdf_complex.pdf").writeBytes(openPdfComplex)
    File(outputDir, "jasper_complex.pdf").writeBytes(jasperComplex)

    println("Finished exporting all PDFs to: ${outputDir.absolutePath}")
}
