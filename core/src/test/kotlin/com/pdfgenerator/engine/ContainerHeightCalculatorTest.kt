package com.pdfgenerator.engine

import com.lowagie.text.Document
import com.lowagie.text.pdf.PdfWriter
import com.pdfgenerator.api.PDFGeneratorConfig
import com.pdfgenerator.model.BarcodeElement
import com.pdfgenerator.model.ContainerElement
import com.pdfgenerator.model.ImageElement
import com.pdfgenerator.model.LineElement
import com.pdfgenerator.model.LoopElement
import com.pdfgenerator.model.Margins
import com.pdfgenerator.model.PageSettings
import com.pdfgenerator.model.PositionMode
import com.pdfgenerator.model.RectangleElement
import com.pdfgenerator.model.Template
import com.pdfgenerator.model.TextElement
import org.junit.jupiter.api.Test
import java.io.ByteArrayOutputStream
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class ContainerHeightCalculatorTest {
    private fun createDummyContext(): RenderContext {
        val doc = Document()
        val writer = PdfWriter.getInstance(doc, ByteArrayOutputStream())
        doc.open()
        val template =
            Template(
                version = "1.0",
                pageSettings =
                    PageSettings(
                        size = "A4",
                        orientation = "portrait",
                        margins = Margins(0f, 0f, 0f, 0f),
                    ),
            )
        return RenderContext(
            document = doc,
            writer = writer,
            template = template,
            data = emptyMap(),
            config = PDFGeneratorConfig(),
            containerWidth = 500f,
            containerHeight = 800f,
        )
    }

    @Test
    fun `test calculateContainerHeight auto-height and fixed height`() {
        val context = createDummyContext()
        val data = emptyMap<String, Any?>()

        // Fixed height container
        val fixedContainer =
            ContainerElement(
                id = "c1",
                x = 0f,
                y = 0f,
                width = 200f,
                height = 150f,
                elements =
                    listOf(
                        TextElement(id = "t1", x = 0f, y = 0f, value = "Fixed", height = 20f),
                    ),
            )
        assertEquals(150f, ContainerHeightCalculator.calculateContainerHeight(fixedContainer, data, context))

        // Auto height container
        val autoContainer =
            ContainerElement(
                id = "c2",
                x = 0f,
                y = 0f,
                width = 200f,
                height = 0f,
                elements =
                    listOf(
                        TextElement(id = "t1", x = 0f, y = 10f, value = "First", height = 30f),
                        TextElement(id = "t2", x = 0f, y = 50f, value = "Second", height = 40f),
                    ),
            )
        // bottom is 50 + 40 = 90
        assertEquals(90f, ContainerHeightCalculator.calculateContainerHeight(autoContainer, data, context))
    }

    @Test
    fun `test calculateContainerHeight with relative children`() {
        val context = createDummyContext()
        val data = emptyMap<String, Any?>()

        val relativeContainer =
            ContainerElement(
                id = "c3",
                x = 0f,
                y = 0f,
                width = 200f,
                height = 0f,
                elements =
                    listOf(
                        TextElement(id = "t1", x = 0f, y = 0f, value = "First", height = 25f, positionMode = PositionMode.RELATIVE),
                        TextElement(
                            id = "t2",
                            x = 0f,
                            y = 0f,
                            relativeOffsetY = 5f,
                            value = "Second",
                            height = 35f,
                            positionMode = PositionMode.RELATIVE,
                        ),
                    ),
            )
        // first: 0 to 25. second: 25 + 5 = 30 to 65.
        assertEquals(65f, ContainerHeightCalculator.calculateContainerHeight(relativeContainer, data, context))
    }

    @Test
    fun `test calculateLoopHeight`() {
        val data = mapOf("rows" to listOf(1, 2, 3))
        val loop =
            LoopElement(
                id = "lp1",
                x = 0f,
                y = 0f,
                width = 200f,
                height = 30f,
                itemSpacing = 10f,
                dataBinding = "rows",
                elements = listOf(TextElement(id = "t", x = 0f, y = 0f, value = "Row", height = 20f)),
            )

        // 3 items * 30 + 2 * 10 = 90 + 20 = 110
        assertEquals(110f, ContainerHeightCalculator.calculateLoopHeight(loop, data))
    }

    @Test
    fun `test calculateLoopItemHeight elements coverage`() {
        val elements =
            listOf(
                ImageElement(id = "img", x = 0f, y = 0f, width = 50f, height = 40f, source = "x", positionMode = PositionMode.RELATIVE),
                RectangleElement(id = "rect", x = 0f, y = 0f, width = 50f, height = 20, positionMode = PositionMode.RELATIVE),
                LineElement(id = "line", x = 0f, y = 0f, width = 50f, height = 5f, positionMode = PositionMode.RELATIVE),
                BarcodeElement(
                    id = "bc",
                    x = 0f,
                    y = 0f,
                    width = 50f,
                    height = 30f,
                    barcodeType = "code128",
                    value = "1",
                    positionMode = PositionMode.RELATIVE,
                ),
            )
        val h = ContainerHeightCalculator.calculateLoopItemHeight(elements, 100f, 40f)
        assertTrue(h > 0f)
    }
}
