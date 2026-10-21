package com.pdfgenerator.benchmark.model

data class InvoiceItem(
    val description: String,
    val quantity: Int,
    val unitPrice: Double,
    val total: Double,
)

data class InvoiceData(
    val invoiceNumber: String,
    val date: String,
    val customerName: String,
    val customerEmail: String,
    val address: String,
    val items: List<InvoiceItem>,
    val subtotal: Double,
    val tax: Double,
    val total: Double,
    val isDraft: Boolean = false,
)

data class ReportRow(
    val id: Int,
    val code: String,
    val name: String,
    val category: String,
    val stock: Int,
    val price: Double,
    val status: String,
)

object BenchmarkDataFactory {
    fun createInvoiceData(seq: Int = 1): Map<String, Any?> {
        val items = (1..10).map { i ->
            val qty = ((seq + i) % 5) + 1
            val price = 15.0 * i + (seq % 10)
            mapOf(
                "description" to "Item #$i - Enterprise Module Pack (Batch #$seq)",
                "quantity" to qty,
                "unitPrice" to price,
                "total" to (qty * price),
            )
        }
        val subtotal = items.sumOf { (it["total"] as Number).toDouble() }
        val tax = subtotal * 0.1
        val total = subtotal + tax

        return mapOf(
            "invoiceNumber" to "INV-2026-%06d".format(seq),
            "date" to "2026-10-21",
            "customer" to mapOf(
                "name" to "Customer #$seq Global Industries",
                "email" to "client-$seq@globalcorp.internal",
                "address" to "$seq Enterprise Way, Suite 400, Austin, TX",
            ),
            "items" to items,
            "subtotal" to subtotal,
            "tax" to tax,
            "total" to total,
            "isDraft" to false,
        )
    }

    fun createListingData(count: Int): Map<String, Any?> {
        val rows = (1..count).map { i ->
            mapOf(
                "id" to i,
                "code" to "SKU-%05d".format(i),
                "name" to "Product Inventory Unit #$i",
                "category" to if (i % 2 == 0) "Hardware" else "Software",
                "stock" to (i * 7) % 500,
                "price" to (10.0 + (i % 100) * 1.5),
                "status" to if (i % 3 == 0) "IN_STOCK" else "BACKORDER",
            )
        }
        return mapOf(
            "reportTitle" to "Consolidated Inventory Catalog ($count items)",
            "generatedAt" to "2026-10-21 15:00:00",
            "totalCount" to count,
            "items" to rows,
        )
    }

    fun createComplexData(): Map<String, Any?> {
        val baseInvoice = createInvoiceData().toMutableMap()
        baseInvoice["companyName"] = "Apex Cloud Solutions"
        baseInvoice["qrCodePayload"] = "https://apexcloud.internal/verify/INV-2026-9042"
        baseInvoice["barcodeValue"] = "7891234567890"
        baseInvoice["showLegalNotice"] = true
        baseInvoice["notes"] = "Payment due within 30 days. Contact support@apexcloud.internal for questions."
        return baseInvoice
    }
}
