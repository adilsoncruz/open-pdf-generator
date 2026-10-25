package com.pdfgenerator.renderer

import com.pdfgenerator.api.PDFGenerator
import com.pdfgenerator.model.Template
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File
import kotlin.test.assertTrue

class ContainerRendererCoverageTest {

    @Test
    fun `should render container with all child element types and styles`(@TempDir tempDir: File) {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": {"top": 20, "right": 20, "bottom": 20, "left": 20}
          },
          "pageElements": [
            {
              "type": "container",
              "id": "c1",
              "x": 0,
              "y": 10,
              "width": 500,
              "height": 200,
              "style": {
                "fillColor": "#E2E8F0",
                "cornerRadius": 8,
                "penStyle": "solid",
                "penColor": "#334155",
                "penWidth": 1.5
              },
              "elements": [
                {
                  "type": "text",
                  "id": "t1",
                  "x": 10,
                  "y": 10,
                  "value": "Hello inside container",
                  "style": {"fontSize": 12}
                },
                {
                  "type": "static_text",
                  "id": "st1",
                  "x": 10,
                  "y": 30,
                  "value": "Static label"
                },
                {
                  "type": "rectangle",
                  "id": "r1",
                  "x": 10,
                  "y": 50,
                  "width": 40,
                  "height": 20,
                  "style": {"fillColor": "#3B82F6"}
                },
                {
                  "type": "line",
                  "id": "l1",
                  "x": 10,
                  "y": 80,
                  "width": 100,
                  "height": 2
                },
                {
                  "type": "barcode",
                  "id": "bc1",
                  "x": 10,
                  "y": 90,
                  "width": 150,
                  "height": 30,
                  "barcodeType": "code128",
                  "dataBinding": "code"
                },
                {
                  "type": "table",
                  "id": "tbl1",
                  "x": 10,
                  "y": 130,
                  "width": 300,
                  "dataBinding": "items",
                  "columns": [
                    {"name": "Col 1", "width": 150},
                    {"name": "Col 2", "width": 150}
                  ]
                }
              ]
            },
            {
              "type": "container",
              "id": "c2_skipped",
              "x": 0,
              "y": 250,
              "width": 500,
              "height": 50,
              "printCondition": "1 == 2",
              "elements": []
            },
            {
              "type": "container",
              "id": "c3_dashed",
              "x": 0,
              "y": 310,
              "width": 500,
              "height": 50,
              "style": {
                "fillColor": "transparent",
                "penStyle": "dashed",
                "penColor": "#000000",
                "penWidth": 2.0
              },
              "elements": [
                {
                  "type": "loop",
                  "id": "lp1",
                  "x": 5,
                  "y": 5,
                  "width": 500,
                  "dataBinding": "items",
                  "itemAlias": "it",
                  "elements": [
                    {
                      "type": "text",
                      "id": "lp_t1",
                      "x": 0,
                      "y": 0,
                      "value": "{{it}}"
                    }
                  ]
                }
              ]
            }
          ]
        }
        """.trimIndent()

        val template = Template.fromString(templateJson)
        val generator = PDFGenerator()
        val outputFile = File(tempDir, "container_test.pdf")
        generator.generate(template, mapOf("items" to listOf("Item A", "Item B")), outputFile)

        assertTrue(outputFile.exists())
        assertTrue(outputFile.length() > 0)
    }

    @Test
    fun `should calculate auto height and relative flow for container child elements`(@TempDir tempDir: File) {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": {"top": 20, "right": 20, "bottom": 20, "left": 20}
          },
          "pageElements": [
            {
              "type": "container",
              "id": "rel_c1",
              "x": 0,
              "y": 10,
              "width": 500,
              "height": "auto",
              "elements": [
                {
                  "type": "text",
                  "id": "rel_t1",
                  "x": 10,
                  "y": 10,
                  "positionMode": "RELATIVE",
                  "width": 200,
                  "value": "Line 1\nLine 2\nLine 3\nLine 4",
                  "style": {"fontSize": 12, "multiline": true, "lineHeight": 1.5}
                },
                {
                  "type": "text",
                  "id": "rel_t2",
                  "x": 10,
                  "y": 0,
                  "positionMode": "RELATIVE",
                  "relativeOffsetY": 5,
                  "value": "Second Relative Line",
                  "style": {"fontSize": 12}
                }
              ]
            }
          ]
        }
        """.trimIndent()

        val template = Template.fromString(templateJson)
        val generator = PDFGenerator()
        val outputFile = File(tempDir, "relative_container_test.pdf")
        generator.generate(template, emptyMap(), outputFile)

        assertTrue(outputFile.exists())
        assertTrue(outputFile.length() > 0)
    }
}
