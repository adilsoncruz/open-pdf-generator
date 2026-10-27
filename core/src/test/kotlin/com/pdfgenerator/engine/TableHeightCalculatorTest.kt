package com.pdfgenerator.engine

import com.pdfgenerator.model.TableColumn
import com.pdfgenerator.model.TableElement
import com.pdfgenerator.model.TableStyle
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class TableHeightCalculatorTest {

    @Test
    fun `test calculateHeaderHeight and calculateRowHeight defaults`() {
        val table = TableElement(
            id = "t1",
            x = 0f,
            y = 0f,
            width = 300f,
            dataBinding = "items",
            columns = listOf(TableColumn(field = "col1", header = "Col 1")),
        )

        // Default header: headerFontSize 12 + headerPadding (5 + 5) = 22
        assertEquals(22f, TableHeightCalculator.calculateHeaderHeight(table))

        // Default row: fontSize 10 + cellPadding (5 + 5) = 20
        assertEquals(20f, TableHeightCalculator.calculateRowHeight(table))

        // Rows height
        assertEquals(60f, TableHeightCalculator.calculateRowsHeight(table, 3))
    }

    @Test
    fun `test custom styling for header and rows`() {
        val table = TableElement(
            id = "t2",
            x = 0f,
            y = 0f,
            width = 300f,
            dataBinding = "items",
            columns = listOf(TableColumn(field = "col1", header = "Col 1")),
            style = TableStyle(
                headerFontSize = 14f,
                headerPaddingTop = 8f,
                headerPaddingBottom = 8f,
                fontSize = 11f,
                cellPaddingTop = 4f,
                cellPaddingBottom = 6f,
            ),
        )

        // Header: 14 + 8 + 8 = 30
        assertEquals(30f, TableHeightCalculator.calculateHeaderHeight(table))

        // Row: 11 + 4 + 6 = 21
        assertEquals(21f, TableHeightCalculator.calculateRowHeight(table))

        val data = mapOf("items" to listOf(mapOf("col1" to "A"), mapOf("col1" to "B")))
        // 30 + 2 * 21 = 72
        assertEquals(72f, TableHeightCalculator.calculateTableHeight(table, data))
    }

    @Test
    fun `test estimateRowsPerPage`() {
        val table = TableElement(
            id = "t3",
            x = 0f,
            y = 0f,
            width = 300f,
            dataBinding = "items",
            columns = listOf(TableColumn(field = "col1", header = "Col 1")),
        )

        // Header = 22, Row = 20
        // Available: 222 -> remaining = 200 -> 10 rows
        assertEquals(10, TableHeightCalculator.estimateRowsPerPage(table, availableHeight = 222f, includeHeader = true))
        // Without header: available 200 -> 10 rows
        assertEquals(10, TableHeightCalculator.estimateRowsPerPage(table, availableHeight = 200f, includeHeader = false))
        // Not enough space for header:
        assertEquals(0, TableHeightCalculator.estimateRowsPerPage(table, availableHeight = 20f, includeHeader = true))
    }
}
