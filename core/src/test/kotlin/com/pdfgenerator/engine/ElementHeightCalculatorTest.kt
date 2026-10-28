package com.pdfgenerator.engine

import com.pdfgenerator.api.PDFGeneratorConfig
import com.pdfgenerator.model.BarcodeElement
import com.pdfgenerator.model.ConditionalElement
import com.pdfgenerator.model.ImageElement
import com.pdfgenerator.model.LineElement
import com.pdfgenerator.model.LinkElement
import com.pdfgenerator.model.LoopElement
import com.pdfgenerator.model.Margins
import com.pdfgenerator.model.PageBreakElement
import com.pdfgenerator.model.PageSettings
import com.pdfgenerator.model.PositionMode
import com.pdfgenerator.model.RectangleElement
import com.pdfgenerator.model.RichTextElement
import com.pdfgenerator.model.SpacerElement
import com.pdfgenerator.model.StaticTextElement
import com.pdfgenerator.model.TableElement
import com.pdfgenerator.model.Template
import com.pdfgenerator.model.TextElement
import com.pdfgenerator.model.TextStyle
import org.junit.jupiter.api.Test
import org.openpdf.text.Document
import org.openpdf.text.pdf.PdfWriter
import java.io.ByteArrayOutputStream
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class ElementHeightCalculatorTest {
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
    fun `test resolveTextForHeight`() {
        val data = mapOf("name" to "Alice", "city" to "Lisbon")
        assertEquals("Alice", ElementHeightCalculator.resolveTextForHeight("name", "fallback", data))
        assertEquals("fallback", ElementHeightCalculator.resolveTextForHeight(null, "fallback", data))
        assertEquals("fallback", ElementHeightCalculator.resolveTextForHeight("", "fallback", data))
        assertEquals(null, ElementHeightCalculator.resolveTextForHeight(null, null, data))
    }

    @Test
    fun `test getElementHeight for static and text elements`() {
        val context = createDummyContext()
        val data = mapOf("greeting" to "Hello World!")

        val text1 = TextElement(id = "t1", x = 0f, y = 0f, value = "Simple", height = 25f)
        assertEquals(25f, ElementHeightCalculator.getElementHeight(text1, data, context))

        val textNoH = TextElement(id = "t2", x = 0f, y = 0f, value = "Simple", style = TextStyle(fontSize = 14f))
        assertEquals(14f, ElementHeightCalculator.getElementHeight(textNoH, data, context))

        val multilineText =
            TextElement(
                id = "t3",
                x = 0f,
                y = 0f,
                dataBinding = "greeting",
                width = 100f,
                style = TextStyle(fontSize = 12f, multiline = true),
            )
        val h1 = ElementHeightCalculator.getElementHeight(multilineText, data, context)
        assertTrue(h1 >= 12f)

        val staticText =
            StaticTextElement(
                id = "st1",
                x = 0f,
                y = 0f,
                value = "Static multiline content here",
                width = 100f,
                style = TextStyle(fontSize = 12f, multiline = true),
            )
        val h2 = ElementHeightCalculator.getElementHeight(staticText, data, context)
        assertTrue(h2 >= 12f)
    }

    @Test
    fun `test getElementHeight for shapes and containers`() {
        val context = createDummyContext()
        val data = emptyMap<String, Any?>()

        val img = ImageElement(id = "img1", x = 0f, y = 0f, width = 50f, height = 40f, source = "data:...")
        assertEquals(40f, ElementHeightCalculator.getElementHeight(img, data, context))

        val rectNum = RectangleElement(id = "r1", x = 0f, y = 0f, width = 50f, height = 30)
        assertEquals(30f, ElementHeightCalculator.getElementHeight(rectNum, data, context))

        val rectPct = RectangleElement(id = "r2", x = 0f, y = 0f, width = 50f, height = "100%")
        assertEquals(800f, ElementHeightCalculator.getElementHeight(rectPct, data, context))

        val rectOther = RectangleElement(id = "r3", x = 0f, y = 0f, width = 50f, height = "invalid")
        assertEquals(100f, ElementHeightCalculator.getElementHeight(rectOther, data, context))

        val line = LineElement(id = "l1", x = 0f, y = 0f, width = 100f, height = 10f)
        assertEquals(10f, ElementHeightCalculator.getElementHeight(line, data, context))

        val barcode = BarcodeElement(id = "b1", x = 0f, y = 0f, width = 100f, height = 50f, barcodeType = "code128", value = "123")
        assertEquals(50f, ElementHeightCalculator.getElementHeight(barcode, data, context))

        val spacer = SpacerElement(id = "s1", x = 0f, y = 0f, height = 15f)
        assertEquals(15f, ElementHeightCalculator.getElementHeight(spacer, data, context))

        val pageBreak = PageBreakElement(id = "pb1")
        assertEquals(0f, ElementHeightCalculator.getElementHeight(pageBreak, data, context))
    }

    @Test
    fun `test getElementHeight for loop and table`() {
        val context = createDummyContext()
        val data =
            mapOf(
                "items" to listOf(mapOf("id" to 1), mapOf("id" to 2), mapOf("id" to 3)),
            )

        val table =
            TableElement(
                id = "tbl",
                x = 0f,
                y = 0f,
                width = 300f,
                dataBinding = "items",
                columns = emptyList(),
            )
        val tableHeight = ElementHeightCalculator.getElementHeight(table, data, context)
        assertTrue(tableHeight > 0f)

        val loop =
            LoopElement(
                id = "lp",
                x = 0f,
                y = 0f,
                width = 300f,
                height = 40f,
                dataBinding = "items",
                itemSpacing = 5f,
                elements = listOf(TextElement(id = "t", x = 0f, y = 0f, value = "x", height = 20f)),
            )
        val loopHeight = ElementHeightCalculator.getElementHeight(loop, data, context)
        assertEquals(130f, loopHeight)
    }

    @Test
    fun `test calculateLoopItemHeight`() {
        assertEquals(0f, ElementHeightCalculator.calculateLoopItemHeight(emptyList(), 100f, 50f))

        val elements =
            listOf(
                TextElement(id = "t1", x = 0f, y = 0f, value = "Hi", height = 20f, positionMode = PositionMode.RELATIVE),
                LineElement(id = "l1", x = 0f, y = 0f, width = 100f, height = 5f, positionMode = PositionMode.RELATIVE),
                RectangleElement(id = "r1", x = 0f, y = 0f, width = 50f, height = "100%", positionMode = PositionMode.RELATIVE),
            )
        val itemHeight = ElementHeightCalculator.calculateLoopItemHeight(elements, 100f, 50f)
        assertTrue(itemHeight > 0f)
    }

    @Test
    fun `test conditional and rich text and link height`() {
        val context = createDummyContext()
        val data = emptyMap<String, Any?>()

        val cond =
            ConditionalElement(
                id = "cond1",
                condition = "true",
                elements =
                    listOf(
                        TextElement(id = "t1", x = 0f, y = 0f, value = "A", height = 15f),
                        TextElement(id = "t2", x = 0f, y = 0f, value = "B", height = 35f),
                    ),
            )
        assertEquals(35f, ElementHeightCalculator.getElementHeight(cond, data, context))

        val richText = RichTextElement(id = "rt1", x = 0f, y = 0f, value = "**Bold**", height = 18f)
        assertEquals(18f, ElementHeightCalculator.getElementHeight(richText, data, context))

        val link = LinkElement(id = "lk1", x = 0f, y = 0f, url = "https://example.com", value = "Click", height = 16f)
        assertEquals(16f, ElementHeightCalculator.getElementHeight(link, data, context))
    }
}
