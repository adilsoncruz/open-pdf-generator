package com.pdfgenerator.suite

import com.pdfgenerator.engine.ContainerHeightCalculator
import com.pdfgenerator.model.BarcodeElement
import com.pdfgenerator.model.ContainerElement
import com.pdfgenerator.model.ImageElement
import com.pdfgenerator.model.LineElement
import com.pdfgenerator.model.LinkElement
import com.pdfgenerator.model.LoopElement
import com.pdfgenerator.model.PositionMode
import com.pdfgenerator.model.RectangleElement
import com.pdfgenerator.model.RichTextElement
import com.pdfgenerator.model.StaticTextElement
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class ContainerHeightCalculatorCoverageTest {

    @Test
    fun `test calculateLoopItemHeight with all element types`() {
        // Empty elements returns 0f
        assertEquals(0f, ContainerHeightCalculator.calculateLoopItemHeight(emptyList(), 400f, 100f))

        val elements = listOf(
            LinkElement(id = "lnk", x = 0f, y = 0f, url = "https://example.com", height = 15f, positionMode = PositionMode.RELATIVE),
            RichTextElement(id = "rt", x = 0f, y = 0f, value = "Rich", height = 25f, positionMode = PositionMode.RELATIVE),
            BarcodeElement(id = "bc", x = 0f, y = 0f, width = 100f, height = 35f, positionMode = PositionMode.RELATIVE),
            ContainerElement(id = "cnt", elements = emptyList(), height = 50f),
            LineElement(id = "ln", x = 0f, y = 0f, width = 100f, height = 2f, positionMode = PositionMode.RELATIVE),
            RectangleElement(id = "rect", x = 0f, y = 0f, width = 100f, height = "100%", positionMode = PositionMode.RELATIVE),
            ImageElement(id = "img", x = 0f, y = 0f, width = 50f, height = 50f, source = "test.png", positionMode = PositionMode.RELATIVE)
        )

        val itemH = ContainerHeightCalculator.calculateLoopItemHeight(elements, 400f, 100f)
        assertTrue(itemH > 0f)

        // calculateLoopHeight with non-list data
        val loop = LoopElement(
            id = "loop",
            dataBinding = "nonList",
            elements = elements,
            itemSpacing = 10f
        )
        val hNonList = ContainerHeightCalculator.calculateLoopHeight(loop, mapOf("nonList" to "not-a-list"))
        assertEquals(0f, hNonList)

        // calculateLoopHeight with multi-item list
        val hList = ContainerHeightCalculator.calculateLoopHeight(loop, mapOf("nonList" to listOf(1, 2, 3)))
        assertTrue(hList > 0f)
    }
}
