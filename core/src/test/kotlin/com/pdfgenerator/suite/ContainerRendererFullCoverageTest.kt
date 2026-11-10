package com.pdfgenerator.suite

import com.pdfgenerator.api.PDFGenerator
import org.junit.jupiter.api.Test
import kotlin.test.assertTrue

class ContainerRendererFullCoverageTest {

    @Test
    fun `test container with all child element variants and styling`() {
        // Base64 1x1 png
        val base64Png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

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
              "type": "static_text",
              "id": "st_prior",
              "x": 0,
              "y": 10,
              "positionMode": "relative",
              "value": "Prior text to advance currentY"
            },
            {
              "type": "container",
              "id": "c_dashed",
              "x": 0,
              "y": 10,
              "width": 500,
              "height": "auto",
              "pageBreakBefore": true,
              "pageBreakCondition": "1 == 1",
              "style": {
                "fillColor": "#F1F5F9",
                "borderColor": "#64748B",
                "borderWidth": 2.0,
                "penStyle": "dashed",
                "cornerRadius": 10
              },
              "elements": [
                {
                  "type": "link",
                  "id": "lnk1",
                  "x": 5,
                  "y": 5,
                  "width": 200,
                  "value": "Antigravity PDF",
                  "url": "https://example.com"
                },
                {
                  "type": "image",
                  "id": "img_fill",
                  "x": 0,
                  "y": 10,
                  "width": -1,
                  "height": -1,
                  "source": "$base64Png"
                },
                {
                  "type": "rich_text",
                  "id": "rt1",
                  "x": 5,
                  "y": 25,
                  "width": 300,
                  "value": "**Bold** and *Italic* text in container"
                },
                {
                  "type": "spacer",
                  "id": "sp1",
                  "x": 0,
                  "y": 50,
                  "width": "100%",
                  "height": 15
                },
                {
                  "type": "rectangle",
                  "id": "rect_full",
                  "x": 0,
                  "y": 70,
                  "width": 480,
                  "height": 30,
                  "style": {
                    "fillColor": "#E2E8F0"
                  }
                }
              ]
            },
            {
              "type": "container",
              "id": "c_dotted_no_radius",
              "x": 0,
              "y": 150,
              "width": 500,
              "height": 60,
              "style": {
                "borderColor": "#000000",
                "borderWidth": 1.0,
                "penStyle": "dotted",
                "cornerRadius": 0
              },
              "elements": [
                {
                  "type": "static_text",
                  "id": "st2",
                  "x": 10,
                  "y": 10,
                  "value": "Inside dotted container"
                }
              ]
            },
            {
              "type": "loop",
              "id": "loop_relative_children",
              "x": 0,
              "y": 220,
              "dataBinding": "items",
              "elements": [
                {
                  "type": "rectangle",
                  "id": "r_rel_full",
                  "x": 0,
                  "y": 0,
                  "positionMode": "relative",
                  "width": "100%",
                  "height": "100%",
                  "style": { "fillColor": "#FAFAFA" }
                },
                {
                  "type": "static_text",
                  "id": "st_rel_1",
                  "x": 10,
                  "y": 5,
                  "positionMode": "relative",
                  "relativeOffsetY": 4,
                  "value": "Rel 1"
                },
                {
                  "type": "static_text",
                  "id": "st_rel_2",
                  "x": 10,
                  "y": 0,
                  "positionMode": "relative",
                  "relativeOffsetY": 8,
                  "value": "Rel 2"
                }
              ]
            }
          ]
        }
        """.trimIndent()

        val pdfBytes = PDFGenerator().generate(
            com.pdfgenerator.model.Template.fromString(templateJson),
            mapOf("items" to listOf(mapOf("k" to "v1"), mapOf("k" to "v2")))
        )
        assertTrue(pdfBytes.isNotEmpty())
    }
}
