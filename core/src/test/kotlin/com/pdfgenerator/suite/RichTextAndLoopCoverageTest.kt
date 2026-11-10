package com.pdfgenerator.suite

import com.pdfgenerator.adapter.openpdf.LoopIterationScope
import com.pdfgenerator.api.PDFGenerator
import com.pdfgenerator.model.BarcodeElement
import com.pdfgenerator.model.ContainerElement
import com.pdfgenerator.model.Element
import com.pdfgenerator.model.ImageElement
import com.pdfgenerator.model.LineElement
import com.pdfgenerator.model.LinkElement
import com.pdfgenerator.model.LoopElement
import com.pdfgenerator.model.RectangleElement
import com.pdfgenerator.model.RichTextElement
import com.pdfgenerator.model.SpacerElement
import com.pdfgenerator.model.StaticTextElement
import com.pdfgenerator.model.TableElement
import com.pdfgenerator.model.TextElement
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class RichTextAndLoopCoverageTest {

    @Test
    fun `test RichText markdown parsing edge cases`() {
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
              "type": "rich_text",
              "id": "rt_unclosed_bold",
              "x": 20,
              "y": 20,
              "width": 300,
              "value": "Prefix **unclosed bold text"
            },
            {
              "type": "rich_text",
              "id": "rt_unclosed_italic",
              "x": 20,
              "y": 60,
              "width": 300,
              "value": "Prefix *unclosed italic text"
            },
            {
              "type": "rich_text",
              "id": "rt_mixed",
              "x": 20,
              "y": 100,
              "width": 300,
              "value": "Normal *italic* and **bold** and *another italic*"
            },
            {
              "type": "rich_text",
              "id": "rt_empty",
              "x": 20,
              "y": 140,
              "width": 300,
              "value": " "
            },
            {
              "type": "rich_text",
              "id": "rt_binding_expr",
              "x": 20,
              "y": 160,
              "width": 300,
              "dataBinding": "Hello ${'$'}{user.name}"
            },
            {
              "type": "rich_text",
              "id": "rt_binding_trans",
              "x": 20,
              "y": 180,
              "width": 300,
              "dataBinding": "user.name | uppercase"
            },
            {
              "type": "rich_text",
              "id": "rt_value_expr",
              "x": 20,
              "y": 200,
              "width": 300,
              "value": "Static ${'$'}{user.name}"
            },
            {
              "type": "rich_text",
              "id": "rt_print_cond_false",
              "x": 20,
              "y": 220,
              "width": 300,
              "printCondition": "1 == 2",
              "value": "Never printed"
            }
          ]
        }
        """.trimIndent()

        val bytes = PDFGenerator().generate(
            com.pdfgenerator.model.Template.fromString(templateJson),
            mapOf("user" to mapOf("name" to "Antigravity"))
        )
        assertTrue(bytes.isNotEmpty())
    }

    @Test
    fun `test Loop with auto-calculated heights and different children`() {
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
              "type": "loop",
              "id": "loop1",
              "x": 20,
              "y": 20,
              "width": 500,
              "height": 0,
              "itemSpacing": 5,
              "dataBinding": "items",
              "elements": [
                {
                  "type": "rectangle",
                  "id": "rect_bg",
                  "x": 0,
                  "y": 0,
                  "width": 480,
                  "height": 45,
                  "style": { "fillColor": "#F8FAFC" }
                },
                {
                  "type": "line",
                  "id": "div_line",
                  "x": 0,
                  "y": 44,
                  "width": 480,
                  "height": 1
                },
                {
                  "type": "text",
                  "id": "item_title",
                  "x": 10,
                  "y": 5,
                  "width": 200,
                  "height": 18,
                  "dataBinding": "item.name"
                },
                {
                  "type": "rich_text",
                  "id": "rt_loop",
                  "x": 10,
                  "y": 25,
                  "width": 200,
                  "dataBinding": "item.desc"
                },
                {
                  "type": "rich_text",
                  "id": "rt_loop_val_trans",
                  "x": 10,
                  "y": 35,
                  "width": 200,
                  "value": "name | uppercase"
                }
              ]
            },
            {
              "type": "loop",
              "id": "loop_empty_elements",
              "x": 20,
              "y": 200,
              "dataBinding": "emptyItems",
              "elements": []
            }
          ]
        }
        """.trimIndent()

        val data = """
        {
          "items": [
            { "name": "Item 1", "desc": "Desc **1**" },
            { "name": "Item 2", "desc": "Desc *2*" }
          ],
          "emptyItems": []
        }
        """.trimIndent()

        val bytes = PDFGenerator().generate(templateJson, data)
        assertTrue(bytes.isNotEmpty())
    }

    @Test
    fun `test LoopIterationScope complete element adjustment and helpers`() {
        val scope = LoopIterationScope(item = mapOf("id" to 1, "name" to "ScopeItem"), index = 0)
        val enriched = scope.buildEnrichedData(null)
        assertEquals(0, enriched["\$index"])
        assertNotNull(enriched["id"])

        // Test every element type and dimension branch in adjustElementPosition
        val elements: List<Element> = listOf(
            TextElement(id = "txt1", x = 10f, y = 5f, width = -1f, dataBinding = "name"),
            TextElement(id = "txt2", x = 10f, y = 5f, width = null, dataBinding = "name"),
            StaticTextElement(id = "st1", x = 10f, y = 5f, width = 150f, value = "Static"),
            StaticTextElement(id = "st2", x = 10f, y = 5f, width = null, value = "Static Null"),
            ImageElement(id = "img1", x = 0f, y = 0f, width = -1f, height = -1f, source = "test.png"),
            ImageElement(id = "img2", x = 0f, y = 0f, width = 100f, height = 50f, source = "test.png"),
            TableElement(id = "tbl", x = 0f, y = 0f, dataBinding = "items", columns = emptyList()),
            RectangleElement(id = "rect_full", x = 0f, y = 0f, width = "100%", height = "100%"),
            RectangleElement(id = "rect_pct", x = 5f, y = 5f, width = "50%", height = "50%"),
            RectangleElement(id = "rect_invalid_str", x = 5f, y = 5f, width = "abc", height = "def"),
            RectangleElement(id = "rect_number", x = 5f, y = 5f, width = 120, height = 60),
            RectangleElement(id = "rect_bool", x = 5f, y = 5f, width = true, height = false),
            LineElement(id = "ln", x = 0f, y = 0f, width = 100f, height = 2f),
            BarcodeElement(id = "bc", x = 0f, y = 0f, width = 100f, height = 30f),
            LoopElement(id = "lp", dataBinding = "subitems", elements = emptyList()),
            ContainerElement(id = "cnt", elements = emptyList()),
            RichTextElement(id = "rt", x = 0f, y = 0f, width = 200f, value = "Rich"),
            LinkElement(id = "lnk1", x = 0f, y = 0f, width = null, url = "https://example.com", value = "Link"),
            LinkElement(id = "lnk2", x = 0f, y = 0f, width = 180f, url = "https://example.com", value = "Link2"),
            SpacerElement(id = "sp1", width = null, height = 10f),
            SpacerElement(id = "sp2", width = "80%", height = 10f)
        )

        elements.forEach { el ->
            val adjusted = scope.adjustElementPosition(
                element = el,
                containerWidth = 500f,
                containerHeight = 100f,
                childEffectiveY = 15f
            )
            if (el is RectangleElement && el.height == "100%") {
                assertEquals(0f, adjusted.y)
            } else {
                assertEquals(15f, adjusted.y)
            }
        }
    }
}
