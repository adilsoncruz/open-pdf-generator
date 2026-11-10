package com.pdfgenerator.suite

import com.pdfgenerator.api.PDFGenerator
import com.pdfgenerator.engine.TableHeightCalculator
import com.pdfgenerator.model.TableColumn
import com.pdfgenerator.model.TableElement
import com.pdfgenerator.model.TableStyle
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class MoreTableAndLoopCoverageTest {

    @Test
    fun `test TableHeightCalculator methods and edge cases`() {
        val tbl = TableElement(
            id = "t_h",
            x = 0f,
            y = 0f,
            dataBinding = "items",
            columns = listOf(TableColumn(header = "H1", field = "f1")),
            style = TableStyle(headerFontSize = 14f, fontSize = 11f, headerPaddingTop = 6f, headerPaddingBottom = 6f, cellPaddingTop = 4f, cellPaddingBottom = 4f)
        )

        assertEquals(26f, TableHeightCalculator.calculateHeaderHeight(tbl))
        assertEquals(19f, TableHeightCalculator.calculateRowHeight(tbl))
        assertEquals(57f, TableHeightCalculator.calculateRowsHeight(tbl, 3))

        // calculateTableHeight with non-list data
        assertEquals(26f, TableHeightCalculator.calculateTableHeight(tbl, mapOf("items" to "not-a-list")))

        // estimateRowsPerPage
        assertTrue(TableHeightCalculator.estimateRowsPerPage(tbl, 300f, true) > 0)
        assertTrue(TableHeightCalculator.estimateRowsPerPage(tbl, 300f, false) > 0)
        assertEquals(0, TableHeightCalculator.estimateRowsPerPage(tbl, 10f, true))
        assertEquals(0, TableHeightCalculator.estimateRowsPerPage(tbl, 0f, false))

        // zero height fallback
        val zeroRowTbl = tbl.copy(style = TableStyle(fontSize = -10f, cellPaddingTop = 5f, cellPaddingBottom = 5f))
        assertEquals(0, TableHeightCalculator.estimateRowsPerPage(zeroRowTbl, 200f))
    }

    @Test
    fun `test multi-page paginated table with conditional header and footer`() {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": {"top": 40, "right": 20, "bottom": 40, "left": 20},
            "header": {
              "height": 30,
              "printCondition": "_pageNumber == 1",
              "elements": [
                { "type": "static_text", "id": "h_txt", "x": 10, "y": 10, "value": "Header Page 1 Only" }
              ]
            },
            "footer": {
              "height": 30,
              "printCondition": "_pageNumber > 1",
              "elements": [
                { "type": "static_text", "id": "f_txt", "x": 10, "y": 10, "value": "Footer Page 2+ Only" }
              ]
            }
          },
          "pageElements": [
            {
              "type": "table",
              "id": "paginated_table",
              "x": 0,
              "y": 10,
              "width": "100%",
              "paginated": true,
              "dataBinding": "rows",
              "columns": [
                { "header": "ID", "field": "id", "width": 50, "alignment": "center" },
                { "header": "Description", "field": "desc", "width": 250, "alignment": "left" },
                { "header": "Amount", "field": "amount", "width": 100, "alignment": "right", "format": "currency" },
                { "header": "Date", "field": "date", "width": 100, "alignment": "center", "format": "date" }
              ],
              "style": {
                "headerBackground": "#0F172A",
                "headerTextColor": "#FFFFFF",
                "alternateRowBackground": "#F8FAFC",
                "borderWidth": 0.5,
                "cellPaddingTop": 8,
                "cellPaddingBottom": 8
              }
            }
          ]
        }
        """.trimIndent()

        val rows = (1..50).map { i ->
            mapOf(
                "id" to i,
                "desc" to "Long invoice item description $i to force page breaks across pages",
                "amount" to (i * 12.5),
                "date" to "2026-11-10"
            )
        }

        val pdfBytes = PDFGenerator().generate(com.pdfgenerator.model.Template.fromString(templateJson), mapOf("rows" to rows))
        assertTrue(pdfBytes.isNotEmpty())
    }

    @Test
    fun `test loop with non-list data binding and relative image line children`() {
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
              "id": "loop_non_list",
              "x": 10,
              "y": 10,
              "dataBinding": "notAList",
              "elements": []
            },
            {
              "type": "loop",
              "id": "loop_calc_items",
              "x": 10,
              "y": 30,
              "dataBinding": "items",
              "height": 0,
              "elements": [
                {
                  "type": "rectangle",
                  "id": "r_100",
                  "x": 0,
                  "y": 0,
                  "width": "100%",
                  "height": "100%",
                  "style": { "fillColor": "#EEEEEE" }
                },
                {
                  "type": "line",
                  "id": "ln_rel",
                  "x": 0,
                  "y": 0,
                  "width": "100%",
                  "height": 2
                },
                {
                  "type": "static_text",
                  "id": "st_abs",
                  "x": 10,
                  "y": 5,
                  "value": "Item Text"
                }
              ]
            }
          ]
        }
        """.trimIndent()

        val data = mapOf(
            "notAList" to "just a string",
            "items" to listOf(mapOf("name" to "one"), mapOf("name" to "two"))
        )

        val bytes = PDFGenerator().generate(com.pdfgenerator.model.Template.fromString(templateJson), data)
        assertTrue(bytes.isNotEmpty())
    }
}
