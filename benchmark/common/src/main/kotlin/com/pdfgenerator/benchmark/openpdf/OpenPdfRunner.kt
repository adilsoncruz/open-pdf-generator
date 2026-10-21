package com.pdfgenerator.benchmark.openpdf

import com.pdfgenerator.api.PDFGenerator
import com.pdfgenerator.model.Template
import java.io.OutputStream

class OpenPdfRunner {
    private val generator = PDFGenerator()

    val invoiceTemplate: Template
    val invoiceWithSchemaTemplate: Template
    val listingTemplate: Template
    val complexTemplate: Template

    init {
        val invoiceJson = javaClass.getResourceAsStream("/templates/openpdf/invoice.json")!!.bufferedReader().readText()
        val listingJson = javaClass.getResourceAsStream("/templates/openpdf/listing.json")!!.bufferedReader().readText()
        val complexJson = javaClass.getResourceAsStream("/templates/openpdf/complex.json")!!.bufferedReader().readText()

        invoiceTemplate = Template.fromString(invoiceJson)
        invoiceWithSchemaTemplate = invoiceTemplate.copy(
            schema = mapOf(
                "type" to "object",
                "required" to listOf("invoiceNumber", "customer", "items", "total"),
                "properties" to mapOf(
                    "invoiceNumber" to mapOf("type" to "string"),
                    "customer" to mapOf("type" to "object"),
                    "items" to mapOf("type" to "array"),
                    "total" to mapOf("type" to "number"),
                ),
            ),
        )
        listingTemplate = Template.fromString(listingJson)
        complexTemplate = Template.fromString(complexJson)
    }

    fun renderInvoice(data: Map<String, Any?>): ByteArray {
        return generator.generate(invoiceTemplate, data)
    }

    fun renderInvoiceWithSchema(data: Map<String, Any?>): ByteArray {
        return generator.generate(invoiceWithSchemaTemplate, data)
    }

    fun renderInvoiceStream(data: Map<String, Any?>, outputStream: OutputStream) {
        generator.generateToStream(invoiceTemplate, data, outputStream)
    }

    fun renderListing(data: Map<String, Any?>): ByteArray {
        return generator.generate(listingTemplate, data)
    }

    fun renderComplex(data: Map<String, Any?>): ByteArray {
        return generator.generate(complexTemplate, data)
    }
}
