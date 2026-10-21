package com.pdfgenerator.benchmark.openpdf

import com.pdfgenerator.api.PDFGenerator
import com.pdfgenerator.model.Template

class OpenPdfRunner {
    private val generator = PDFGenerator()

    val invoiceTemplate: Template
    val listingTemplate: Template
    val complexTemplate: Template

    init {
        val invoiceJson = javaClass.getResourceAsStream("/templates/openpdf/invoice.json")!!.bufferedReader().readText()
        val listingJson = javaClass.getResourceAsStream("/templates/openpdf/listing.json")!!.bufferedReader().readText()
        val complexJson = javaClass.getResourceAsStream("/templates/openpdf/complex.json")!!.bufferedReader().readText()

        invoiceTemplate = Template.fromString(invoiceJson)
        listingTemplate = Template.fromString(listingJson)
        complexTemplate = Template.fromString(complexJson)
    }

    fun renderInvoice(data: Map<String, Any?>): ByteArray {
        return generator.generate(invoiceTemplate, data)
    }

    fun renderListing(data: Map<String, Any?>): ByteArray {
        return generator.generate(listingTemplate, data)
    }

    fun renderComplex(data: Map<String, Any?>): ByteArray {
        return generator.generate(complexTemplate, data)
    }
}
