package com.pdfgenerator.suite

import com.pdfgenerator.model.ConditionalElement
import com.pdfgenerator.model.ContainerElement
import com.pdfgenerator.model.Margins
import com.pdfgenerator.model.PageSettings
import com.pdfgenerator.model.PositionMode
import com.pdfgenerator.model.RectangleStyle
import com.pdfgenerator.model.SpacerElement
import com.pdfgenerator.model.StaticTextElement
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotEquals
import kotlin.test.assertTrue

class ModelElementsCoverageTest {
    private val testPageSettings = PageSettings(size = "A4", orientation = "portrait", margins = Margins(10f, 10f, 10f, 10f))

    @Test
    fun `test SpacerElement resolveWidth and contracts`() {
        val spacer = SpacerElement(id = "sp1", height = 20f)
        assertEquals(emptyList(), spacer.validate(testPageSettings))
        assertEquals("spacer", spacer.type)
        assertEquals(0f, spacer.x)
        assertEquals(0f, spacer.y)
        assertEquals(null, spacer.positionMode)

        // default "100%"
        assertEquals(500f, spacer.resolveWidth(500f))

        // number width
        val numSpacer = spacer.copy(width = 150)
        assertEquals(150f, numSpacer.resolveWidth(500f))

        // percentage string
        val pctSpacer = spacer.copy(width = "50%")
        assertEquals(250f, pctSpacer.resolveWidth(500f))

        // invalid percentage
        val invalidPctSpacer = spacer.copy(width = "%")
        assertEquals(500f, invalidPctSpacer.resolveWidth(500f))

        // numeric string
        val strSpacer = spacer.copy(width = "300")
        assertEquals(300f, strSpacer.resolveWidth(500f))

        // invalid numeric string
        val invalidStrSpacer = spacer.copy(width = "xyz")
        assertEquals(500f, invalidStrSpacer.resolveWidth(500f))

        // non-string, non-number
        val otherSpacer = spacer.copy(width = false)
        assertEquals(500f, otherSpacer.resolveWidth(500f))

        // contracts
        val copy = spacer.copy()
        assertEquals(copy, spacer)
        assertEquals(copy.hashCode(), spacer.hashCode())
        assertTrue(spacer.toString().contains("SpacerElement"))
    }

    @Test
    fun `test ConditionalElement resolveWidth and validation`() {
        val child = StaticTextElement(id = "st1", x = 0f, y = 0f, value = "child")
        val cond = ConditionalElement(
            id = "cond1",
            condition = "active == true",
            elements = listOf(child)
        )

        assertEquals("conditional", cond.type)
        assertEquals(0, cond.validate(testPageSettings).size)

        // default width 400f
        assertEquals(400f, cond.resolveWidth(600f))

        // number
        assertEquals(200f, cond.copy(width = 200).resolveWidth(600f))

        // percentage
        assertEquals(300f, cond.copy(width = "50%").resolveWidth(600f))
        assertEquals(600f, cond.copy(width = "%").resolveWidth(600f))

        // numeric string
        assertEquals(180f, cond.copy(width = "180").resolveWidth(600f))
        assertEquals(600f, cond.copy(width = "invalid").resolveWidth(600f))

        // other
        assertEquals(600f, cond.copy(width = listOf(1)).resolveWidth(600f))

        // contracts
        val copy = cond.copy()
        assertEquals(copy, cond)
        assertEquals(copy.hashCode(), cond.hashCode())
        assertTrue(cond.toString().contains("ConditionalElement"))
    }

    @Test
    fun `test ContainerElement resolveWidth resolveHeight and contracts`() {
        val child = StaticTextElement(id = "st1", x = 0f, y = 0f, value = "inner")
        val container = ContainerElement(
            id = "c1",
            elements = listOf(child),
            style = RectangleStyle(fillColor = "#FFFFFF"),
            pageBreakBefore = true,
            pageBreakCondition = "page > 1"
        )

        assertEquals("container", container.type)
        assertEquals(PositionMode.RELATIVE, container.positionMode)
        assertTrue(container.isAutoHeight())
        assertEquals(0, container.validate(testPageSettings).size)

        // isAutoHeight tests
        val fixedHeightMode = container.copy(heightMode = "fixed")
        assertFalse(fixedHeightMode.isAutoHeight())

        val falseAutoHeight = container.copy(autoHeight = false)
        assertFalse(falseAutoHeight.isAutoHeight())

        val nullHeightMode = container.copy(heightMode = null)
        assertTrue(nullHeightMode.isAutoHeight())

        // resolveWidth
        assertEquals(400f, container.resolveWidth(600f))
        assertEquals(300f, container.copy(width = 300).resolveWidth(600f))
        assertEquals(150f, container.copy(width = "25%").resolveWidth(600f))
        assertEquals(600f, container.copy(width = "%").resolveWidth(600f))
        assertEquals(220f, container.copy(width = "220").resolveWidth(600f))
        assertEquals(600f, container.copy(width = "invalid").resolveWidth(600f))
        assertEquals(600f, container.copy(width = null).resolveWidth(600f))

        // resolveHeight
        assertEquals(50f, container.resolveHeight(400f))
        assertEquals(120f, container.copy(height = 120).resolveHeight(400f))
        assertEquals(200f, container.copy(height = "50%").resolveHeight(400f))
        assertEquals(400f, container.copy(height = "%").resolveHeight(400f))
        assertEquals(80f, container.copy(height = "80").resolveHeight(400f))
        assertEquals(400f, container.copy(height = "invalid").resolveHeight(400f))
        assertEquals(400f, container.copy(height = null).resolveHeight(400f))

        // contracts
        val copy = container.copy()
        assertEquals(copy, container)
        assertEquals(copy.hashCode(), container.hashCode())
        assertTrue(container.toString().contains("ContainerElement"))
    }

    @Test
    fun `test LineElement resolveWidth resolveHeight getEndX getEndY and contracts`() {
        val line = com.pdfgenerator.model.LineElement(
            id = "l1",
            x = 10f,
            y = 20f,
            width = "50%",
            height = 30f,
            style = com.pdfgenerator.model.LineStyle(color = "#000000", width = 1f)
        )

        assertEquals("line", line.type)
        assertEquals(200f, line.resolveWidth(400f))
        assertEquals(400f, line.copy(width = "%").resolveWidth(400f))
        assertEquals(150f, line.copy(width = 150).resolveWidth(400f))
        assertEquals(80f, line.copy(width = "80").resolveWidth(400f))
        assertEquals(100f, line.copy(width = "invalid").resolveWidth(400f))
        assertEquals(100f, line.copy(width = false).resolveWidth(400f))

        assertEquals(30f, line.resolveHeight(200f))
        assertEquals(100f, line.copy(height = "50%").resolveHeight(200f))
        assertEquals(200f, line.copy(height = "%").resolveHeight(200f))
        assertEquals(45f, line.copy(height = 45).resolveHeight(200f))
        assertEquals(25f, line.copy(height = "25").resolveHeight(200f))
        assertEquals(0f, line.copy(height = "invalid").resolveHeight(200f))
        assertEquals(0f, line.copy(height = true).resolveHeight(200f))

        assertEquals(10f, line.getEndX())
        assertEquals(210f, line.getEndX(400f))
        assertEquals(50f, line.getEndY())
        assertEquals(50f, line.getEndY(200f))
        assertEquals(0, line.validate(testPageSettings).size)

        val copy = line.copy()
        assertEquals(copy, line)
        assertEquals(copy.hashCode(), line.hashCode())
        assertTrue(line.toString().contains("LineElement"))
    }

    @Test
    fun `test LoopElement resolveWidth and contracts`() {
        val loop = com.pdfgenerator.model.LoopElement(
            id = "loop1",
            dataBinding = "items",
            elements = emptyList()
        )

        assertEquals("loop", loop.type)
        assertEquals(400f, loop.resolveWidth(600f))
        assertEquals(300f, loop.copy(width = 300).resolveWidth(600f))
        assertEquals(150f, loop.copy(width = "25%").resolveWidth(600f))
        assertEquals(600f, loop.copy(width = "%").resolveWidth(600f))
        assertEquals(180f, loop.copy(width = "180").resolveWidth(600f))
        assertEquals(600f, loop.copy(width = "invalid").resolveWidth(600f))
        assertEquals(600f, loop.copy(width = null).resolveWidth(600f))
        assertEquals(600f, loop.copy(width = true).resolveWidth(600f))
        assertEquals(0, loop.validate(testPageSettings).size)

        val copy = loop.copy()
        assertEquals(copy, loop)
        assertEquals(copy.hashCode(), loop.hashCode())
        assertTrue(loop.toString().contains("LoopElement"))
    }

    @Test
    fun `test ImageRenderer cache and preload helpers`() {
        val prevSize = com.pdfgenerator.adapter.openpdf.ImageRenderer.cacheSize()
        com.pdfgenerator.adapter.openpdf.ImageRenderer.setMaxCacheSize(50)
        com.pdfgenerator.adapter.openpdf.ImageRenderer.preloadFromClasspath("non_existent_image.png")
        com.pdfgenerator.adapter.openpdf.ImageRenderer.preloadFromFiles("/non/existent/image.png")
        com.pdfgenerator.adapter.openpdf.ImageRenderer.clearCache()
        assertEquals(0, com.pdfgenerator.adapter.openpdf.ImageRenderer.cacheSize())
    }
}
