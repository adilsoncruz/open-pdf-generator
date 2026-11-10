package com.pdfgenerator.suite

import com.pdfgenerator.api.PDFGenerator
import org.junit.jupiter.api.Test
import kotlin.test.assertTrue

class WatermarkAndRectangleCoverageTest {

    @Test
    fun `test rectangle dashed dotted border and cornerRadius`() {
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
              "type": "rectangle",
              "id": "rect_dashed",
              "x": 20,
              "y": 20,
              "width": 100,
              "height": 50,
              "style": {
                "fillColor": "#F8FAFC",
                "borderColor": "#0284C7",
                "borderWidth": 2.0,
                "penStyle": "dashed",
                "cornerRadius": 8
              }
            },
            {
              "type": "rectangle",
              "id": "rect_dotted",
              "x": 140,
              "y": 20,
              "width": 100,
              "height": 50,
              "style": {
                "fillColor": "#FFFFFF",
                "borderColor": "#DC2626",
                "borderWidth": 1.5,
                "penStyle": "dotted",
                "cornerRadius": 0
              }
            },
            {
              "type": "rectangle",
              "id": "rect_transparent",
              "x": 260,
              "y": 20,
              "width": 100,
              "height": 50,
              "style": {
                "fillColor": "transparent",
                "borderColor": "#16A34A",
                "borderWidth": 1.0,
                "penStyle": "solid"
              }
            }
          ]
        }
        """.trimIndent()

        val bytes = PDFGenerator().generate(templateJson, "{}")
        assertTrue(bytes.isNotEmpty())
    }

    @Test
    fun `test watermark repeated image and text expressions`() {
        // Base64 1x1 transparent png
        val base64Png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": {"top": 10, "right": 10, "bottom": 10, "left": 10},
            "watermark": {
              "type": "image",
              "imageSource": "$base64Png",
              "width": 60,
              "repeat": true,
              "spacingX": 150,
              "spacingY": 150,
              "rotation": 30,
              "opacity": 0.3
            }
          },
          "pageElements": [
            { "type": "static_text", "id": "t1", "x": 10, "y": 10, "value": "Watermark test" }
          ]
        }
        """.trimIndent()

        val bytes = PDFGenerator().generate(templateJson, "{}")
        assertTrue(bytes.isNotEmpty())
    }

    @Test
    fun `test watermark text dataBinding transformations and bold italic times font`() {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": {"top": 10, "right": 10, "bottom": 10, "left": 10},
            "watermark": {
              "type": "text",
              "dataBinding": "status | uppercase",
              "fontName": "Times-Roman",
              "fontStyle": "bolditalic",
              "fontSize": 40,
              "repeat": true,
              "spacingX": 200,
              "spacingY": 200,
              "opacity": 0.2
            }
          },
          "pageElements": [
            { "type": "static_text", "id": "t1", "x": 10, "y": 10, "value": "Status watermark" }
          ]
        }
        """.trimIndent()

        val bytes = PDFGenerator().generate(templateJson, """{"status": "confidential"}""")
        assertTrue(bytes.isNotEmpty())
    }
}
