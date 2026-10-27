package com.pdfgenerator.renderer

import com.lowagie.text.Element
import com.pdfgenerator.adapter.openpdf.TextLayoutHelper
import com.pdfgenerator.engine.TextLayoutCacheKey
import com.pdfgenerator.engine.TextLayoutMeasurement
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class TextLayoutHelperTest {

    @Test
    fun `test resolveAlignment`() {
        assertEquals(Element.ALIGN_CENTER, TextLayoutHelper.resolveAlignment("center"))
        assertEquals(Element.ALIGN_RIGHT, TextLayoutHelper.resolveAlignment("right"))
        assertEquals(Element.ALIGN_JUSTIFIED, TextLayoutHelper.resolveAlignment("justify"))
        assertEquals(Element.ALIGN_LEFT, TextLayoutHelper.resolveAlignment("left"))
        assertEquals(Element.ALIGN_LEFT, TextLayoutHelper.resolveAlignment(null))
    }

    @Test
    fun `test calculateSingleLineX`() {
        val leftX = TextLayoutHelper.calculateSingleLineX(Element.ALIGN_LEFT, 10f, 100f, 40f)
        assertEquals(10f, leftX)

        val centerX = TextLayoutHelper.calculateSingleLineX(Element.ALIGN_CENTER, 10f, 100f, 40f)
        assertEquals(40f, centerX)

        val rightX = TextLayoutHelper.calculateSingleLineX(Element.ALIGN_RIGHT, 10f, 100f, 40f)
        assertEquals(70f, rightX)
    }

    @Test
    fun `test calculateSingleLineY`() {
        val topY = TextLayoutHelper.calculateSingleLineY(500f, 100f, "top", 10f, 10f, 20f)
        assertEquals(500f - 10f - 16f, topY)

        val bottomY = TextLayoutHelper.calculateSingleLineY(500f, 100f, "bottom", 10f, 10f, 20f)
        assertEquals(500f - 100f + 10f + 4f, bottomY)

        val centerY = TextLayoutHelper.calculateSingleLineY(500f, 100f, "center", 10f, 10f, 20f)
        assertTrue(centerY < 500f)
    }

    @Test
    fun `test calculateMultilineLineX and Y`() {
        val leftX = TextLayoutHelper.calculateMultilineLineX("left", 10f, 100f, 5f, 5f, 10f, 0, 40f)
        assertEquals(25f, leftX)

        val nextLeftX = TextLayoutHelper.calculateMultilineLineX("left", 10f, 100f, 5f, 5f, 10f, 1, 40f)
        assertEquals(15f, nextLeftX)

        val centerX = TextLayoutHelper.calculateMultilineLineX("center", 10f, 100f, 5f, 5f, 0f, 0, 40f)
        assertEquals(10f + 5f + (90f - 40f) / 2f, centerX)

        val rightX = TextLayoutHelper.calculateMultilineLineX("right", 10f, 100f, 5f, 5f, 0f, 0, 40f)
        assertEquals(10f + 100f - 5f - 40f, rightX)

        val lineY = TextLayoutHelper.calculateMultilineLineY(500f, 5f, 12f, 14f, 1)
        assertTrue(lineY < 500f)
    }

    @Test
    fun `test filterLinesForOverflow`() {
        val lines = listOf("L1", "L2", "L3", "L4", "L5")
        val filtered = TextLayoutHelper.filterLinesForOverflow(lines, "hidden", 35f, 0f, 0f, 10f)
        assertEquals(3, filtered.size)

        val notFiltered = TextLayoutHelper.filterLinesForOverflow(lines, "visible", 35f, 0f, 0f, 10f)
        assertEquals(5, notFiltered.size)
    }

    @Test
    fun `test getOrMeasureMultilineLayout and cache`() {
        val cache = mutableMapOf<TextLayoutCacheKey, TextLayoutMeasurement>()
        val key = TextLayoutCacheKey("id1", "cached text", 123)
        val measurement = TextLayoutMeasurement(listOf("cached text"), 14f, 14f)
        cache[key] = measurement

        val fromCache = TextLayoutHelper.getOrMeasureMultilineLayout(
            elementId = "id1",
            resolvedText = "cached text",
            styleHash = 123,
            boxWidth = 100f,
            fontSize = 12f,
            lineHeight = 1f,
            paddingTop = 0f,
            paddingBottom = 0f,
            paddingLeft = 0f,
            paddingRight = 0f,
            firstLineIndent = 0f,
            fontFamily = "Helvetica",
            cache = cache,
        )
        assertSame(measurement, fromCache)

        val computed = TextLayoutHelper.getOrMeasureMultilineLayout(
            elementId = "id2",
            resolvedText = "new line 1\nnew line 2",
            styleHash = 456,
            boxWidth = 100f,
            fontSize = 12f,
            lineHeight = 1f,
            paddingTop = 0f,
            paddingBottom = 0f,
            paddingLeft = 0f,
            paddingRight = 0f,
            firstLineIndent = 0f,
            fontFamily = "Helvetica",
            cache = cache,
        )
        assertEquals(2, computed.lines.size)
        assertTrue(cache.containsKey(TextLayoutCacheKey("id2", "new line 1\nnew line 2", 456)))
    }
}
