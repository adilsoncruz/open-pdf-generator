package com.pdfgenerator.benchmark.jasper

import net.sf.jasperreports.engine.JasperCompileManager
import net.sf.jasperreports.engine.JasperExportManager
import net.sf.jasperreports.engine.JasperFillManager
import net.sf.jasperreports.engine.JasperReport
import net.sf.jasperreports.engine.data.JRMapCollectionDataSource

class JasperRunner {
    val invoiceReport: JasperReport
    val listingReport: JasperReport
    val complexReport: JasperReport

    init {
        invoiceReport = javaClass.getResourceAsStream("/templates/jasper/invoice.jrxml")!!.use {
            JasperCompileManager.compileReport(it)
        }
        listingReport = javaClass.getResourceAsStream("/templates/jasper/listing.jrxml")!!.use {
            JasperCompileManager.compileReport(it)
        }
        complexReport = javaClass.getResourceAsStream("/templates/jasper/complex.jrxml")!!.use {
            JasperCompileManager.compileReport(it)
        }
    }

    @Suppress("UNCHECKED_CAST")
    fun renderInvoice(data: Map<String, Any?>): ByteArray {
        val params = HashMap<String, Any>()
        params["invoiceNumber"] = data["invoiceNumber"] ?: ""
        params["date"] = data["date"] ?: ""

        val customer = data["customer"] as? Map<String, Any?>
        params["customerName"] = customer?.get("name") ?: ""
        params["customerEmail"] = customer?.get("email") ?: ""
        params["customerAddress"] = customer?.get("address") ?: ""
        params["subtotal"] = (data["subtotal"] as Number).toDouble()
        params["tax"] = (data["tax"] as Number).toDouble()
        params["total"] = (data["total"] as Number).toDouble()

        val items = (data["items"] as? List<Map<String, Any?>>) ?: emptyList()
        val dataSource = JRMapCollectionDataSource(items)

        val print = JasperFillManager.fillReport(invoiceReport, params, dataSource)
        return JasperExportManager.exportReportToPdf(print)
    }

    @Suppress("UNCHECKED_CAST")
    fun renderInvoiceStream(data: Map<String, Any?>, outputStream: java.io.OutputStream) {
        val params = HashMap<String, Any>()
        params["invoiceNumber"] = data["invoiceNumber"] ?: ""
        params["date"] = data["date"] ?: ""

        val customer = data["customer"] as? Map<String, Any?>
        params["customerName"] = customer?.get("name") ?: ""
        params["customerEmail"] = customer?.get("email") ?: ""
        params["customerAddress"] = customer?.get("address") ?: ""
        params["subtotal"] = (data["subtotal"] as Number).toDouble()
        params["tax"] = (data["tax"] as Number).toDouble()
        params["total"] = (data["total"] as Number).toDouble()

        val items = (data["items"] as? List<Map<String, Any?>>) ?: emptyList()
        val dataSource = JRMapCollectionDataSource(items)

        val print = JasperFillManager.fillReport(invoiceReport, params, dataSource)
        JasperExportManager.exportReportToPdfStream(print, outputStream)
    }

    @Suppress("UNCHECKED_CAST")
    fun renderListing(data: Map<String, Any?>): ByteArray {
        val params = HashMap<String, Any>()
        params["reportTitle"] = data["reportTitle"] ?: ""
        params["generatedAt"] = data["generatedAt"] ?: ""

        val items = (data["items"] as? List<Map<String, Any?>>) ?: emptyList()
        val dataSource = JRMapCollectionDataSource(items)

        val print = JasperFillManager.fillReport(listingReport, params, dataSource)
        return JasperExportManager.exportReportToPdf(print)
    }

    @Suppress("UNCHECKED_CAST")
    fun renderComplex(data: Map<String, Any?>): ByteArray {
        val params = HashMap<String, Any>()
        params["companyName"] = data["companyName"] ?: ""
        params["invoiceNumber"] = data["invoiceNumber"] ?: ""
        params["qrCodePayload"] = data["qrCodePayload"] ?: ""
        params["barcodeValue"] = data["barcodeValue"] ?: ""
        params["total"] = (data["total"] as Number).toDouble()
        params["showLegalNotice"] = data["showLegalNotice"] == true
        params["notes"] = data["notes"] ?: ""

        val items = (data["items"] as? List<Map<String, Any?>>) ?: emptyList()
        val dataSource = JRMapCollectionDataSource(items)

        val print = JasperFillManager.fillReport(complexReport, params, dataSource)
        return JasperExportManager.exportReportToPdf(print)
    }
}
