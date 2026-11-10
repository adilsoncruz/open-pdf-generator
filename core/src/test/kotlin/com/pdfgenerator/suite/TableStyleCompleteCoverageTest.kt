package com.pdfgenerator.suite

import com.pdfgenerator.model.Margins
import com.pdfgenerator.model.PageSettings
import com.pdfgenerator.model.TableColumn
import com.pdfgenerator.model.TableElement
import com.pdfgenerator.model.TableStyle
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotEquals
import kotlin.test.assertTrue

class TableStyleCompleteCoverageTest {
    private val testPageSettings = PageSettings(size = "A4", orientation = "portrait", margins = Margins(10f, 10f, 10f, 10f))

    @Test
    fun `test TableStyle default values and effective methods`() {
        val style = TableStyle()

        assertEquals(10f, style.getEffectiveCellFontSize())
        assertEquals("#000000", style.getEffectiveCellColor())
        assertEquals("#000000", style.getEffectiveHeaderColor())
        assertEquals(1f, style.getEffectiveHeaderTopBorderWidth())
        assertEquals(1f, style.getEffectiveHeaderRightBorderWidth())
        assertEquals(1f, style.getEffectiveHeaderBottomBorderWidth())
        assertEquals(1f, style.getEffectiveHeaderLeftBorderWidth())
        assertEquals("#cccccc", style.getEffectiveHeaderBorderColor())
        assertEquals(5f, style.getEffectiveHeaderPadding())
        assertEquals(5f, style.getEffectiveHeaderPaddingTop())
        assertEquals(5f, style.getEffectiveHeaderPaddingRight())
        assertEquals(5f, style.getEffectiveHeaderPaddingBottom())
        assertEquals(5f, style.getEffectiveHeaderPaddingLeft())

        assertEquals(1f, style.getEffectiveCellTopBorderWidth())
        assertEquals(1f, style.getEffectiveCellRightBorderWidth())
        assertEquals(1f, style.getEffectiveCellBottomBorderWidth())
        assertEquals(1f, style.getEffectiveCellLeftBorderWidth())
        assertEquals(5f, style.getEffectiveCellPaddingTop())
        assertEquals(5f, style.getEffectiveCellPaddingRight())
        assertEquals(5f, style.getEffectiveCellPaddingBottom())
        assertEquals(5f, style.getEffectiveCellPaddingLeft())
    }

    @Test
    fun `test TableStyle overrides and fallbacks`() {
        val custom = TableStyle(
            headerBackground = "#123456",
            headerColor = "#111111",
            headerTextColor = "#222222",
            headerFontSize = 14f,
            headerFontFamily = "Helvetica",
            headerFontWeight = "normal",
            headerBorderWidth = 2.5f,
            headerBorderColor = "#ff0000",
            headerTopBorderWidth = 3f,
            headerRightBorderWidth = 4f,
            headerBottomBorderWidth = 5f,
            headerLeftBorderWidth = 6f,
            headerBorderType = "double",
            headerPadding = 8f,
            headerPaddingTop = 9f,
            headerPaddingRight = 10f,
            headerPaddingBottom = 11f,
            headerPaddingLeft = 12f,
            rowFontSize = 11f,
            fontSize = 12f,
            fontFamily = "Courier",
            rowColor = "#333333",
            cellColor = "#444444",
            cellBackground = "#ffffff",
            alternateRowBackground = "#f9f9f9",
            borderColor = "#999999",
            borderWidth = 1.5f,
            borderStyle = "dashed",
            borderTopWidth = 2f,
            borderRightWidth = 2.1f,
            borderBottomWidth = 2.2f,
            borderLeftWidth = 2.3f,
            cellBorderType = "solid",
            cellPadding = 6f,
            cellPaddingTop = 7f,
            cellPaddingRight = 7.1f,
            cellPaddingBottom = 7.2f,
            cellPaddingLeft = 7.3f
        )

        assertEquals(12f, custom.getEffectiveCellFontSize())
        assertEquals("#444444", custom.getEffectiveCellColor())
        assertEquals("#222222", custom.getEffectiveHeaderColor())
        assertEquals(3f, custom.getEffectiveHeaderTopBorderWidth())
        assertEquals(4f, custom.getEffectiveHeaderRightBorderWidth())
        assertEquals(5f, custom.getEffectiveHeaderBottomBorderWidth())
        assertEquals(6f, custom.getEffectiveHeaderLeftBorderWidth())
        assertEquals("#ff0000", custom.getEffectiveHeaderBorderColor())
        assertEquals(8f, custom.getEffectiveHeaderPadding())
        assertEquals(9f, custom.getEffectiveHeaderPaddingTop())
        assertEquals(10f, custom.getEffectiveHeaderPaddingRight())
        assertEquals(11f, custom.getEffectiveHeaderPaddingBottom())
        assertEquals(12f, custom.getEffectiveHeaderPaddingLeft())

        assertEquals(2f, custom.getEffectiveCellTopBorderWidth())
        assertEquals(2.1f, custom.getEffectiveCellRightBorderWidth())
        assertEquals(2.2f, custom.getEffectiveCellBottomBorderWidth())
        assertEquals(2.3f, custom.getEffectiveCellLeftBorderWidth())
        assertEquals(7f, custom.getEffectiveCellPaddingTop())
        assertEquals(7.1f, custom.getEffectiveCellPaddingRight())
        assertEquals(7.2f, custom.getEffectiveCellPaddingBottom())
        assertEquals(7.3f, custom.getEffectiveCellPaddingLeft())

        // Test rowFontSize fallback when fontSize is null
        val fallbackRow = custom.copy(fontSize = null, cellColor = null)
        assertEquals(11f, fallbackRow.getEffectiveCellFontSize())
        assertEquals("#333333", fallbackRow.getEffectiveCellColor())

        // Test headerBorderWidth fallback when specific border widths are null
        val borderFallback = custom.copy(
            headerTopBorderWidth = null,
            headerRightBorderWidth = null,
            headerBottomBorderWidth = null,
            headerLeftBorderWidth = null,
            headerTextColor = null,
            headerBorderColor = null,
            headerPaddingTop = null,
            headerPaddingRight = null,
            headerPaddingBottom = null,
            headerPaddingLeft = null,
            cellPaddingTop = null,
            cellPaddingRight = null,
            cellPaddingBottom = null,
            cellPaddingLeft = null,
            borderTopWidth = null,
            borderRightWidth = null,
            borderBottomWidth = null,
            borderLeftWidth = null
        )
        assertEquals(2.5f, borderFallback.getEffectiveHeaderTopBorderWidth())
        assertEquals(2.5f, borderFallback.getEffectiveHeaderRightBorderWidth())
        assertEquals(2.5f, borderFallback.getEffectiveHeaderBottomBorderWidth())
        assertEquals(2.5f, borderFallback.getEffectiveHeaderLeftBorderWidth())
        assertEquals("#111111", borderFallback.getEffectiveHeaderColor())
        assertEquals("#999999", borderFallback.getEffectiveHeaderBorderColor())
        assertEquals(8f, borderFallback.getEffectiveHeaderPaddingTop())
        assertEquals(8f, borderFallback.getEffectiveHeaderPaddingRight())
        assertEquals(8f, borderFallback.getEffectiveHeaderPaddingBottom())
        assertEquals(8f, borderFallback.getEffectiveHeaderPaddingLeft())
        assertEquals(6f, borderFallback.getEffectiveCellPaddingTop())
        assertEquals(6f, borderFallback.getEffectiveCellPaddingRight())
        assertEquals(6f, borderFallback.getEffectiveCellPaddingBottom())
        assertEquals(6f, borderFallback.getEffectiveCellPaddingLeft())
        assertEquals(1.5f, borderFallback.getEffectiveCellTopBorderWidth())

        // Data class contracts (equals, hashCode, toString)
        val copy = custom.copy()
        assertEquals(copy, custom)
        assertEquals(copy.hashCode(), custom.hashCode())
        assertTrue(custom.toString().contains("TableStyle"))
        assertNotEquals(custom, fallbackRow)
    }

    @Test
    fun `test TableColumn data class contracts`() {
        val col1 = TableColumn(
            header = "Name",
            field = "name",
            width = 100f,
            alignment = "center",
            verticalAlignment = "middle",
            headerAlignment = "center",
            headerVerticalAlignment = "middle",
            format = "text"
        )
        val col2 = col1.copy()
        assertEquals(col1, col2)
        assertEquals(col1.hashCode(), col2.hashCode())
        assertTrue(col1.toString().contains("TableColumn"))
    }

    @Test
    fun `test TableElement validation and width resolution`() {
        val emptyCols = TableElement(
            id = "tbl_empty",
            x = 0f,
            y = 0f,
            dataBinding = "items",
            columns = emptyList()
        )
        val errors = emptyCols.validate(testPageSettings)
        assertEquals(1, errors.size)
        assertTrue(errors[0].message.contains("pelo menos uma coluna"))

        val validTbl = TableElement(
            id = "tbl_valid",
            x = 10f,
            y = 20f,
            width = "80%",
            dataBinding = "items",
            columns = listOf(TableColumn(header = "Col 1", field = "c1"))
        )
        assertEquals(0, validTbl.validate(testPageSettings).size)
        assertEquals(400f, validTbl.resolveWidth(500f))

        // Number width
        val numWidthTbl = validTbl.copy(width = 250)
        assertEquals(250f, numWidthTbl.resolveWidth(500f))

        // Fixed string width without %
        val fixedStrTbl = validTbl.copy(width = "300")
        assertEquals(300f, fixedStrTbl.resolveWidth(500f))

        // Invalid string width fallback
        val invalidStrTbl = validTbl.copy(width = "abc")
        assertEquals(500f, invalidStrTbl.resolveWidth(500f))

        // Null width fallback
        val nullWidthTbl = validTbl.copy(width = null)
        assertEquals(500f, nullWidthTbl.resolveWidth(500f))

        // Other type width fallback
        val otherWidthTbl = validTbl.copy(width = true)
        assertEquals(500f, otherWidthTbl.resolveWidth(500f))
    }
}
