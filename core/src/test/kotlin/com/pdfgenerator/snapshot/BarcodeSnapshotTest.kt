package com.pdfgenerator.snapshot

import com.github.adilsoncruz.pdfsnapshottesting.EnablePdfSnapshots
import com.github.adilsoncruz.pdfsnapshottesting.assertPdfByFile
import com.pdfgenerator.api.PDFGenerator
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test

@EnablePdfSnapshots
class BarcodeSnapshotTest {

    private val generator = PDFGenerator()

    @Test
    @DisplayName("Barcode 1D: Linear formats (Code 128, Code 39, EAN-13, EAN-8, UPC-A)")
    fun test1DLinearBarcodes() {
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
              "value": "1D Linear Barcode Symbologies",
              "style": { "fontSize": 18, "fontWeight": "bold", "color": "#0f172a" }
            },
            {
              "type": "text",
              "id": "sub",
              "x": 36,
              "y": 62,
              "value": "Verification of linear barcode generation via vector canvas rendering.",
              "style": { "fontSize": 10, "color": "#64748b" }
            },

            {
              "type": "text",
              "id": "lbl-c128",
              "x": 36,
              "y": 90,
              "value": "Code 128 (Alphanumeric: BATCH-2026-X9)",
              "style": { "fontSize": 10, "fontWeight": "bold", "color": "#334155" }
            },
            {
              "type": "barcode",
              "id": "bc-c128",
              "x": 36,
              "y": 108,
              "width": 240,
              "height": 50,
              "barcodeType": "code128",
              "value": "BATCH-2026-X9"
            },

            {
              "type": "text",
              "id": "lbl-c39",
              "x": 300,
              "y": 90,
              "value": "Code 39 (Alphanumeric: WMS99)",
              "style": { "fontSize": 10, "fontWeight": "bold", "color": "#334155" }
            },
            {
              "type": "barcode",
              "id": "bc-c39",
              "x": 300,
              "y": 108,
              "width": 220,
              "height": 50,
              "barcodeType": "code39",
              "value": "WMS99"
            },

            {
              "type": "text",
              "id": "lbl-ean13",
              "x": 36,
              "y": 180,
              "value": "EAN-13 (Standard Retail: 7891234567895)",
              "style": { "fontSize": 10, "fontWeight": "bold", "color": "#334155" }
            },
            {
              "type": "barcode",
              "id": "bc-ean13",
              "x": 36,
              "y": 198,
              "width": 220,
              "height": 55,
              "barcodeType": "ean13",
              "value": "7891234567895"
            },

            {
              "type": "text",
              "id": "lbl-ean8",
              "x": 300,
              "y": 180,
              "value": "EAN-8 (Compact Retail: 78912343)",
              "style": { "fontSize": 10, "fontWeight": "bold", "color": "#334155" }
            },
            {
              "type": "barcode",
              "id": "bc-ean8",
              "x": 300,
              "y": 198,
              "width": 160,
              "height": 55,
              "barcodeType": "ean8",
              "value": "78912343"
            },

            {
              "type": "text",
              "id": "lbl-upca",
              "x": 36,
              "y": 275,
              "value": "UPC-A (North American Retail: 012345678905)",
              "style": { "fontSize": 10, "fontWeight": "bold", "color": "#334155" }
            },
            {
              "type": "barcode",
              "id": "bc-upca",
              "x": 36,
              "y": 293,
              "width": 220,
              "height": 55,
              "barcodeType": "upc_a",
              "value": "012345678905"
            }
          ]
        }
        """.trimIndent()

        val pdfBytes = generator.generate(templateJson, "{}")
        assertPdfByFile("barcode-1d-formats.pdf", pdfBytes)
    }

    @Test
    @DisplayName("Barcode 2D: Matrix formats (QR Code with EC levels, PDF417, DataMatrix)")
    fun test2DMatrixBarcodes() {
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
              "value": "2D Matrix Barcode Elements",
              "style": { "fontSize": 18, "fontWeight": "bold", "color": "#0f172a" }
            },
            {
              "type": "text",
              "id": "sub",
              "x": 36,
              "y": 62,
              "value": "Comparison of QR Code error correction levels (L, M, Q, H), PDF417, and DataMatrix.",
              "style": { "fontSize": 10, "color": "#64748b" }
            },

            {
              "type": "text",
              "id": "lbl-qr-l",
              "x": 36,
              "y": 90,
              "value": "QR (EC: Low)",
              "style": { "fontSize": 9, "fontWeight": "bold" }
            },
            {
              "type": "barcode",
              "id": "qr-l",
              "x": 36,
              "y": 106,
              "width": 105,
              "height": 105,
              "barcodeType": "qrcode",
              "value": "https://github.com/adilsoncruz/open-pdf-generator",
              "style": { "errorCorrection": "L" }
            },

            {
              "type": "text",
              "id": "lbl-qr-m",
              "x": 160,
              "y": 90,
              "value": "QR (EC: Medium)",
              "style": { "fontSize": 9, "fontWeight": "bold" }
            },
            {
              "type": "barcode",
              "id": "qr-m",
              "x": 160,
              "y": 106,
              "width": 105,
              "height": 105,
              "barcodeType": "qrcode",
              "value": "https://github.com/adilsoncruz/open-pdf-generator",
              "style": { "errorCorrection": "M" }
            },

            {
              "type": "text",
              "id": "lbl-qr-q",
              "x": 284,
              "y": 90,
              "value": "QR (EC: Quartile)",
              "style": { "fontSize": 9, "fontWeight": "bold" }
            },
            {
              "type": "barcode",
              "id": "qr-q",
              "x": 284,
              "y": 106,
              "width": 105,
              "height": 105,
              "barcodeType": "qrcode",
              "value": "https://github.com/adilsoncruz/open-pdf-generator",
              "style": { "errorCorrection": "Q" }
            },

            {
              "type": "text",
              "id": "lbl-qr-h",
              "x": 408,
              "y": 90,
              "value": "QR (EC: High)",
              "style": { "fontSize": 9, "fontWeight": "bold" }
            },
            {
              "type": "barcode",
              "id": "qr-h",
              "x": 408,
              "y": 106,
              "width": 105,
              "height": 105,
              "barcodeType": "qrcode",
              "value": "https://github.com/adilsoncruz/open-pdf-generator",
              "style": { "errorCorrection": "H" }
            },

            {
              "type": "text",
              "id": "lbl-dm",
              "x": 36,
              "y": 230,
              "value": "DataMatrix (ISO/IEC 16022 2D Matrix)",
              "style": { "fontSize": 10, "fontWeight": "bold", "color": "#334155" }
            },
            {
              "type": "barcode",
              "id": "dm-1",
              "x": 36,
              "y": 248,
              "width": 105,
              "height": 105,
              "barcodeType": "datamatrix",
              "value": "DM-SERIAL-2026-XYZ987"
            },

            {
              "type": "text",
              "id": "lbl-pdf417",
              "x": 170,
              "y": 230,
              "value": "PDF417 (Stacked Symbology: Logistics, Transport, ID)",
              "style": { "fontSize": 10, "fontWeight": "bold", "color": "#334155" }
            },
            {
              "type": "barcode",
              "id": "bc-pdf417",
              "x": 170,
              "y": 248,
              "width": 340,
              "height": 85,
              "barcodeType": "pdf417",
              "value": "OPENPDF-PASSENGER:CRUZ/ADILSON:FLIGHT-OP402:GATE-B12:SEAT-01A"
            }
          ]
        }
        """.trimIndent()

        val pdfBytes = generator.generate(templateJson, "{}")
        assertPdfByFile("barcode-2d-formats.pdf", pdfBytes)
    }

    @Test
    @DisplayName("Barcode: Dynamic data-binding and PIX / payment payload")
    fun testBarcodeDataBinding() {
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
              "value": "Dynamic Data-Bound Barcodes & Payments",
              "style": { "fontSize": 18, "fontWeight": "bold", "color": "#0f172a" }
            },
            {
              "type": "text",
              "id": "card-pix-text",
              "x": 36,
              "y": 70,
              "width": 240,
              "multiline": true,
              "value": "Instant Payment (PIX)\nBeneficiary: {{pix.receiver}}\nValue: {{pix.amount}}",
              "style": { "fontSize": 11, "color": "#334155", "lineHeight": 1.4 }
            },
            {
              "type": "barcode",
              "id": "qr-pix",
              "x": 36,
              "y": 125,
              "width": 140,
              "height": 140,
              "barcodeType": "qrcode",
              "dataBinding": "{{pix.payload}}"
            },
            {
              "type": "text",
              "id": "card-track-text",
              "x": 300,
              "y": 70,
              "width": 240,
              "multiline": true,
              "value": "Express Shipping AWB\nCarrier: {{tracking.carrier}}\nShipment Code: {{tracking.code}}",
              "style": { "fontSize": 11, "color": "#334155", "lineHeight": 1.4 }
            },
            {
              "type": "barcode",
              "id": "bc-tracking",
              "x": 300,
              "y": 125,
              "width": 220,
              "height": 60,
              "barcodeType": "code128",
              "dataBinding": "{{tracking.code}}"
            }
          ]
        }
        """.trimIndent()

        val dataJson = """
        {
          "pix": {
            "receiver": "Open PDF Foundation",
            "amount": "R$ 150,00",
            "payload": "00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-4266141740005204000053039865406150.005802BR5920Open PDF Foundation6009Sao Paulo62070503***6304ABCD"
          },
          "tracking": {
            "carrier": "GlobalExpress",
            "code": "GE88492019BR"
          }
        }
        """.trimIndent()

        val pdfBytes = generator.generate(templateJson, dataJson)
        assertPdfByFile("barcode-data-binding.pdf", pdfBytes)
    }
}
