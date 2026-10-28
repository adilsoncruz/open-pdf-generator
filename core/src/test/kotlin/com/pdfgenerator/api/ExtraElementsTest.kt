package com.pdfgenerator.api

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class ExtraElementsTest {
    private val pdfGenerator = PDFGenerator(PDFGeneratorConfig(strictMode = true))

    @Test
    fun `test container and image edge cases`() {
        val template = """
        {
          "version": "1.0",
          "pageSettings": { "size": "A4", "orientation": "portrait", "margins": { "top": 10, "right": 10, "bottom": 10, "left": 10 } },
          "pageElements": [
            {
              "type": "container",
              "id": "container1",
              "x": 10, "y": 10, "width": 500, "height": 300,
              "elements": [
                 { "type": "text", "id": "t1", "x": 0, "y": 0, "dataBinding": "textData", "width": 100 },
                 { "type": "static_text", "id": "t2", "x": 0, "y": 20, "value": "hello", "width": 100 },
                 { "type": "line", "id": "l1", "x1": 0, "y1": 50, "x2": 100, "y2": 50 },
                 { "type": "rectangle", "id": "r1", "x": 0, "y": 60, "width": 100, "height": 50 },
                 { "type": "barcode", "id": "b1", "x": 0, "y": 120, "barcodeType": "CODE128", "dataBinding": "bc", "width": 100, "height": 30 },
                 { "type": "image", "id": "i1", "x": 0, "y": 160, "width": 100, "height": 100, "source": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" },
                 { "type": "table", "id": "tb1", "x": 0, "y": 270, "width": 100, "columns": [ { "header": "A", "field": "a", "width": 10 } ], "dataBinding": "list" }
              ]
            }
          ]
        }
        """

        val listItems = (1..200).joinToString(", ") { """{"a": "$it"}""" }
        val data = """
        {
          "textData": "some text",
          "bc": "12345678",
          "list": [ $listItems ]
        }
        """

        val pdfBytes = pdfGenerator.generate(template, data)
        assertTrue(pdfBytes.isNotEmpty())
    }

    @Test
    fun `test condition evaluator and expression processor`() {
        val template = """
         {
          "version": "1.0",
          "pageSettings": { "size": "A4", "orientation": "portrait", "margins": { "top": 10, "right": 10, "bottom": 10, "left": 10 } },
          "pageElements": [
            {
               "type": "static_text", "id": "cond1", "x": 0, "y": 0, "value": "visible", "width": 100,
               "printCondition": { "field": "val1", "operator": "==", "value": "test" }
            },
            {
               "type": "static_text", "id": "cond2", "x": 0, "y": 20, "value": "hidden", "width": 100,
               "printCondition": { "field": "val1", "operator": "!=", "value": "test" }
            },
            {
               "type": "text", "id": "exp1", "x": 0, "y": 40, "dataBinding": "val1 | upper", "width": 100
            }
          ]
         }
         """
        val data = """ { "val1": "test" } """
        val pdfBytes = pdfGenerator.generate(template, data)
        assertTrue(pdfBytes.isNotEmpty())
    }

    @Test
    fun `test image invalid src`() {
        val template = """
        {
          "version": "1.0",
          "pageSettings": { "size": "A4", "orientation": "portrait", "margins": { "top": 10, "right": 10, "bottom": 10, "left": 10 } },
          "pageElements": [
            {
              "type": "image",
              "id": "bad-image",
              "x": 0, "y": 0, "width": 10, "height": 10,
              "src": "invalid-base64-image-source!!!"
            }
          ]
        }
        """
        assertThrows(Exception::class.java) {
            pdfGenerator.generate(template, "{}")
        }
    }

    @Test
    fun `test image renderer cache`() {
        com.pdfgenerator.adapter.openpdf.ImageRenderer.clearCache()
        com.pdfgenerator.adapter.openpdf.ImageRenderer.setMaxCacheSize(10)
        com.pdfgenerator.adapter.openpdf.ImageRenderer.invalidateCache("non-existent")
        com.pdfgenerator.adapter.openpdf.ImageRenderer.cacheSize()
    }
}
