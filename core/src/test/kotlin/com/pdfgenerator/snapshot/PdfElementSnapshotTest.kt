package com.pdfgenerator.snapshot

import com.github.adilsoncruz.pdfsnapshottesting.EnablePdfSnapshots
import com.github.adilsoncruz.pdfsnapshottesting.assertPdfByFile
import com.pdfgenerator.api.PDFGenerator
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test

/**
 * Visual regression tests powered by [io.github.adilsoncruz:pdf-snapshot-junit:0.1.0].
 *
 * Validates pixel-level layout fidelity and visual rendering for all core elements:
 * Typography, Tables, Barcodes/QR, Containers, Watermarks, and Full Invoice documents.
 */
@EnablePdfSnapshots
class PdfElementSnapshotTest {

    private val generator = PDFGenerator()

    @Test
    @DisplayName("Visual snapshot: Typography, alignments, and colored text elements")
    fun testTextElementsSnapshot() {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 }
          },
          "pageElements": [
            {
              "type": "text",
              "id": "h1",
              "x": 36,
              "y": 36,
              "value": "Open PDF Generator - Typography Showcase",
              "style": { "fontSize": 20, "fontWeight": "bold", "color": "#1e293b" }
            },
            {
              "type": "text",
              "id": "subtitle",
              "x": 36,
              "y": 66,
              "value": "Subheading with custom electric indigo color and normal weight",
              "style": { "fontSize": 12, "color": "#6366f1" }
            },
            {
              "type": "text",
              "id": "align-left",
              "x": 36,
              "y": 96,
              "value": "Left Aligned Text: High performance document streaming with low memory overhead.",
              "style": { "fontSize": 10, "color": "#334155" }
            },
            {
              "type": "text",
              "id": "align-center",
              "x": 200,
              "y": 126,
              "value": "Centered Notice Banner",
              "style": { "fontSize": 11, "fontWeight": "bold", "color": "#047857" }
            },
            {
              "type": "text",
              "id": "align-right",
              "x": 350,
              "y": 156,
              "value": "Right Side Date: 2026-10-22",
              "style": { "fontSize": 9, "color": "#64748b" }
            }
          ]
        }
        """.trimIndent()

        val pdfBytes = generator.generate(templateJson, "{}")
        assertPdfByFile("text-elements.pdf", pdfBytes)
    }

    @Test
    @DisplayName("Visual snapshot: Tables with header styling, borders, and data rows")
    fun testTableElementsSnapshot() {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 }
          },
          "pageElements": [
            {
              "type": "text",
              "id": "title",
              "x": 36,
              "y": 36,
              "value": "Financial Line Items Table",
              "style": { "fontSize": 16, "fontWeight": "bold", "color": "#0f172a" }
            },
            {
              "type": "table",
              "id": "items-table",
              "x": 36,
              "y": 70,
              "dataBinding": "items",
              "columns": [
                { "header": "SKU", "field": "sku", "width": 80 },
                { "header": "Description", "field": "desc", "width": 220 },
                { "header": "Qty", "field": "qty", "width": 60, "alignment": "center" },
                { "header": "Unit Price", "field": "price", "width": 80, "alignment": "right" },
                { "header": "Total", "field": "total", "width": 80, "alignment": "right" }
              ],
              "style": {
                "headerBackground": "#4f46e5",
                "headerTextColor": "#ffffff",
                "borderColor": "#cbd5e1",
                "borderWidth": 0.5,
                "fontSize": 9,
                "padding": 5
              }
            }
          ]
        }
        """.trimIndent()

        val dataJson = """
        {
          "items": [
            { "sku": "SRV-001", "desc": "Cloud Container Orchestration (Monthly)", "qty": 1, "price": "$120.00", "total": "$120.00" },
            { "sku": "SRV-002", "desc": "High-Throughput Dedicated PDF Cluster", "qty": 2, "price": "$45.00", "total": "$90.00" },
            { "sku": "SRV-003", "desc": "Native Vector Barcode Acceleration Module", "qty": 1, "price": "$80.00", "total": "$80.00" },
            { "sku": "SRV-004", "desc": "24/7 Enterprise Tier Support & SLA", "qty": 1, "price": "$150.00", "total": "$150.00" }
          ]
        }
        """.trimIndent()

        val pdfBytes = generator.generate(templateJson, dataJson)
        assertPdfByFile("table-elements.pdf", pdfBytes)
    }

    @Test
    @DisplayName("Visual snapshot: Native vector Code128 barcodes and 1-bit QR codes")
    fun testBarcodeAndQrSnapshot() {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 }
          },
          "pageElements": [
            {
              "type": "text",
              "id": "title",
              "x": 36,
              "y": 36,
              "value": "Native Barcode & QR Code Engine",
              "style": { "fontSize": 16, "fontWeight": "bold", "color": "#0f172a" }
            },
            {
              "type": "text",
              "id": "code128-lbl",
              "x": 36,
              "y": 70,
              "value": "Code 128 (Direct PDF Vector Operator):",
              "style": { "fontSize": 11, "fontWeight": "bold", "color": "#475569" }
            },
            {
              "type": "barcode",
              "id": "barcode-128",
              "x": 36,
              "y": 90,
              "format": "CODE_128",
              "value": "${'$'}{trackingNumber}",
              "width": 240,
              "height": 45
            },
            {
              "type": "text",
              "id": "qr-lbl",
              "x": 36,
              "y": 155,
              "value": "QR Code (1-Bit Raw Raster Matrix):",
              "style": { "fontSize": 11, "fontWeight": "bold", "color": "#475569" }
            },
            {
              "type": "barcode",
              "id": "qrcode-1",
              "x": 36,
              "y": 175,
              "format": "QR_CODE",
              "value": "${'$'}{validationUrl}",
              "width": 100,
              "height": 100
            }
          ]
        }
        """.trimIndent()

        val dataJson = """
        {
          "trackingNumber": "TRK-98234-OPENPDF",
          "validationUrl": "https://github.com/adilsoncruz/open-pdf-generator"
        }
        """.trimIndent()

        val pdfBytes = generator.generate(templateJson, dataJson)
        assertPdfByFile("barcode-and-qr.pdf", pdfBytes)
    }

    @Test
    @DisplayName("Visual snapshot: Nested containers with colored background, border, and padding")
    fun testContainerAndLayoutSnapshot() {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 }
          },
          "pageElements": [
            {
              "type": "container",
              "id": "hero-card",
              "x": 36,
              "y": 36,
              "width": 523,
              "height": 120,
              "style": {
                "backgroundColor": "#f8fafc",
                "borderColor": "#6366f1",
                "borderWidth": 1.5,
                "borderRadius": 8,
                "padding": 16
              },
              "elements": [
                {
                  "type": "text",
                  "id": "card-title",
                  "x": 16,
                  "y": 16,
                  "value": "Container Element Box with Indigo Accent Border",
                  "style": { "fontSize": 14, "fontWeight": "bold", "color": "#1e293b" }
                },
                {
                  "type": "text",
                  "id": "card-body",
                  "x": 16,
                  "y": 42,
                  "width": 490,
                  "value": "Child elements inside containers are positioned relative to container bounds, enabling reusable cards, banners, and summary boxes. Long descriptions wrap automatically inside the container boundaries without overflowing the page margins.",
                  "style": { "fontSize": 10, "color": "#64748b", "multiline": true, "lineHeight": 1.3 }
                }
              ]
            }
          ]
        }
        """.trimIndent()

        val pdfBytes = generator.generate(templateJson, "{}")
        assertPdfByFile("container-layout.pdf", pdfBytes)
    }

    @Test
    @DisplayName("Visual snapshot: Watermark, header, and footer page numbering")
    fun testWatermarkAndHeadersSnapshot() {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "showMargins": true,
            "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 },
            "watermark": {
              "type": "text",
              "text": "CONFIDENTIAL",
              "fontSize": 52,
              "opacity": 0.2,
              "rotation": 45,
              "color": "#DC2626"
            },
            "header": {
              "height": 30,
              "elements": [
                {
                  "type": "text",
                  "id": "hdr-doc",
                  "x": 0,
                  "y": 10,
                  "value": "ACME Corp. - Internal Audit Report",
                  "style": { "fontSize": 8, "color": "#94a3b8" }
                }
              ]
            },
            "footer": {
              "height": 30,
              "elements": [
                {
                  "type": "text",
                  "id": "ftr-page",
                  "x": 250,
                  "y": 10,
                  "value": "Page 1 of 1",
                  "style": { "fontSize": 8, "color": "#94a3b8" }
                }
              ]
            }
          },
          "pageElements": [
            {
              "type": "text",
              "id": "body-title",
              "x": 0,
              "y": 10,
              "value": "Audited Document Content",
              "style": { "fontSize": 16, "fontWeight": "bold", "color": "#0f172a" }
            },
            {
              "type": "text",
              "id": "body-text",
              "x": 0,
              "y": 40,
              "value": "This document contains a diagonal watermark and custom headers/footers.",
              "style": { "fontSize": 10, "color": "#334155" }
            }
          ]
        }
        """.trimIndent()

        val pdfBytes = generator.generate(templateJson, "{}")
        assertPdfByFile("watermark-and-headers.pdf", pdfBytes)
    }

    @Test
    @DisplayName("Visual snapshot: Comprehensive full invoice with table, totals, barcodes, and QR code")
    fun testFullInvoiceSnapshot() {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 }
          },
          "pageElements": [
            {
              "type": "text",
              "id": "company-name",
              "x": 36,
              "y": 36,
              "value": "ACME ENTERPRISE SOLUTIONS",
              "style": { "fontSize": 18, "fontWeight": "bold", "color": "#1e293b" }
            },
            {
              "type": "text",
              "id": "invoice-title",
              "x": 380,
              "y": 36,
              "value": "INVOICE #INV-2026-001",
              "style": { "fontSize": 12, "fontWeight": "bold", "color": "#4f46e5" }
            },
            {
              "type": "text",
              "id": "customer-box",
              "x": 36,
              "y": 66,
              "value": "Billed to: Global Tech Logistics Inc. - Tax ID: US-987654321",
              "style": { "fontSize": 10, "color": "#475569" }
            },
            {
              "type": "table",
              "id": "invoice-table",
              "x": 36,
              "y": 96,
              "dataBinding": "items",
              "columns": [
                { "header": "Item", "field": "name", "width": 200 },
                { "header": "Category", "field": "category", "width": 100 },
                { "header": "Qty", "field": "qty", "width": 50, "alignment": "center" },
                { "header": "Price", "field": "price", "width": 80, "alignment": "right" },
                { "header": "Amount", "field": "amount", "width": 93, "alignment": "right" }
              ],
              "style": {
                "headerBackground": "#0f172a",
                "headerTextColor": "#ffffff",
                "borderColor": "#e2e8f0",
                "borderWidth": 0.5,
                "fontSize": 9,
                "padding": 5
              }
            },
            {
              "type": "text",
              "id": "total-amount",
              "x": 400,
              "y": 210,
              "value": "Total Due: $390.00",
              "style": { "fontSize": 13, "fontWeight": "bold", "color": "#047857" }
            },
            {
              "type": "barcode",
              "id": "inv-barcode",
              "x": 36,
              "y": 240,
              "format": "CODE_128",
              "value": "INV-2026-001-PAY",
              "width": 200,
              "height": 40
            },
            {
              "type": "barcode",
              "id": "inv-qr",
              "x": 423,
              "y": 235,
              "format": "QR_CODE",
              "value": "https://pay.acme.com/inv/2026001",
              "width": 55,
              "height": 55
            }
          ]
        }
        """.trimIndent()

        val dataJson = """
        {
          "items": [
            { "name": "Enterprise Engine License", "category": "Software", "qty": 1, "price": "$250.00", "amount": "$250.00" },
            { "name": "Continuous PDF Validation SLA", "category": "Support", "qty": 1, "price": "$100.00", "amount": "$100.00" },
            { "name": "Fast-Track Cloud Container Addon", "category": "Hosting", "qty": 1, "price": "$40.00", "amount": "$40.00" }
          ]
        }
        """.trimIndent()

        val pdfBytes = generator.generate(templateJson, dataJson)
        assertPdfByFile("invoice-full-document.pdf", pdfBytes)
    }
}
