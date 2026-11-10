package com.pdfgenerator.suite

import com.pdfgenerator.api.PDFGenerator
import org.junit.jupiter.api.Test
import kotlin.test.assertTrue

class BarcodeRendererFullCoverageTest {

    @Test
    fun `test all barcode formats and edge cases`() {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": {"top": 10, "right": 10, "bottom": 10, "left": 10}
          },
          "pageElements": [
            {
              "type": "barcode",
              "id": "bc_upce",
              "x": 20,
              "y": 20,
              "width": 120,
              "height": 40,
              "barcodeType": "upc_e",
              "value": "0123456"
            },
            {
              "type": "barcode",
              "id": "bc_upce2",
              "x": 160,
              "y": 20,
              "width": 120,
              "height": 40,
              "barcodeType": "upce",
              "value": "0123456"
            },
            {
              "type": "barcode",
              "id": "bc_pdf417",
              "x": 20,
              "y": 80,
              "width": 150,
              "height": 50,
              "barcodeType": "pdf417",
              "value": "PDF417 TEST PAYLOAD"
            },
            {
              "type": "barcode",
              "id": "bc_zxing_fallback",
              "x": 20,
              "y": 140,
              "width": 140,
              "height": 40,
              "barcodeType": "code_128",
              "value": "ABC-12345-FALLBACK"
            },
            {
              "type": "barcode",
              "id": "bc_empty_skip",
              "x": 20,
              "y": 200,
              "width": 100,
              "height": 30,
              "barcodeType": "qrcode",
              "value": ""
            }
          ]
        }
        """.trimIndent()

        val bytes = PDFGenerator().generate(templateJson, "{}")
        assertTrue(bytes.isNotEmpty())
    }
}
